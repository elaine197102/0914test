(function () {
  const data = { provinces: [], indicators: [] };
  const $ = (selector) => document.querySelector(selector);
  const escapeHtml = (value) => String(value ?? '').replace(/[&<>\"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[character]));
  const statusLabel = (item) => item.verificationStatus === 'needs_review' ? '待校對' : (item.status === 'published' ? '已發布' : item.status);

  async function request(path, params = {}) {
    const query = new URLSearchParams(Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== ''));
    const response = await fetch(`${path}?${query}`);
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error || '資料庫查詢失敗');
    return payload;
  }

  async function init() {
    try {
      const payload = await request('/api/v1/indicators', { status: 'all', page_size: 50 });
      data.provinces = payload.provinces || [];
      data.indicators = payload.data || [];
      $('#published-count').textContent = data.indicators.length;
      data.provinces.forEach((province) => $('#province-select').insertAdjacentHTML('beforeend', `<option value="${escapeHtml(province.id)}">${escapeHtml(province.name)}</option>`));
      (payload.categories || []).filter(Boolean).forEach((category) => $('#category-select').insertAdjacentHTML('beforeend', `<option value="${escapeHtml(category)}">${escapeHtml(category)}</option>`));
      [...new Map(data.indicators.map((item) => [item.code, item])).values()].forEach((item) => $('#compare-indicator').insertAdjacentHTML('beforeend', `<option value="${escapeHtml(item.code)}">${escapeHtml(item.code)}｜${escapeHtml(item.name)}</option>`));
      renderAdmin();
      bindEvents();
    } catch (error) { $('#search-error').textContent = error.message; }
  }

  function bindEvents() {
    $('#search-form').addEventListener('submit', (event) => { event.preventDefault(); search(); });
    $('#clear-button').addEventListener('click', clearSearch);
    $('#compare-button').addEventListener('click', renderComparison);
    document.querySelectorAll('.nav-link').forEach((button) => button.addEventListener('click', () => switchView(button.dataset.view)));
    document.addEventListener('click', (event) => {
      const card = event.target.closest('[data-indicator-id]');
      if (card) openDetail(card.dataset.indicatorId);
      if (event.target.matches('[data-close-modal]')) closeModal();
    });
    document.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeModal(); });
  }

  async function search() {
    const provinceId = $('#province-select').value;
    const keyword = $('#keyword-input').value.trim();
    const category = $('#category-select').value;
    $('#search-error').textContent = '';
    if (!provinceId) { $('#search-error').textContent = '請先選擇省分，再執行查詢。'; return; }
    try {
      const payload = await request('/api/v1/indicators', { province_id: provinceId, keyword, category_id: category, status: 'all', page_size: 50 });
      data.indicators = payload.data || [];
      const province = data.provinces.find((item) => item.id === provinceId);
      $('#current-filter').textContent = `目前查詢省分：${province ? province.name : provinceId}`;
      $('#result-count').textContent = `共 ${data.indicators.length} 筆`;
      renderResults(data.indicators);
    } catch (error) { $('#search-error').textContent = error.message; }
  }

  function renderResults(results) {
    const container = $('#results');
    if (!results.length) { container.innerHTML = '<div class="empty-state"><div class="empty-icon">⌕</div><h3>找不到符合條件的指標</h3><p>請調整關鍵字或分類。</p></div>'; return; }
    container.innerHTML = results.map((item) => `<article class="result-card" data-indicator-id="${escapeHtml(item.id)}" tabindex="0"><div class="card-top"><span class="card-code">${escapeHtml(item.code)}</span><span class="status-badge ${item.status === 'published' ? 'published' : 'draft'}">${escapeHtml(statusLabel(item))}</span></div><h3>${escapeHtml(item.name)}</h3><p class="definition-summary">${escapeHtml(item.definition)}</p><div class="card-meta"><span>${escapeHtml(item.provinceName)}</span><span>版本 ${escapeHtml(item.version)}</span><span>${item.sourcePage ? `來源第 ${item.sourcePage} 頁` : '來源頁碼待補'}</span></div></article>`).join('');
  }

  function clearSearch() { $('#province-select').value = ''; $('#keyword-input').value = ''; $('#category-select').value = ''; $('#current-filter').textContent = '尚未查詢'; $('#result-count').textContent = ''; $('#search-error').textContent = ''; $('#results').innerHTML = '<div class="empty-state"><div class="empty-icon">⌕</div><h3>請先選擇省分</h3><p>選擇省分後，系統會顯示資料庫中的指標定義。</p></div>'; }

  function openDetail(id) {
    const item = data.indicators.find((entry) => String(entry.id) === String(id));
    if (!item) return;
    const sourceLink = item.sourceDocumentId ? `<p><a href="/api/v1/source?document_id=${encodeURIComponent(item.sourceDocumentId)}" target="_blank" rel="noreferrer">開啟來源文件</a></p>` : '';
    $('#detail-content').innerHTML = `<div class="detail-header"><span class="detail-province">${escapeHtml(item.provinceName)} · ${escapeHtml(item.code)}</span><h2 id="detail-title">${escapeHtml(item.name)}</h2><span class="status-badge ${item.status === 'published' ? 'published' : 'draft'}">${escapeHtml(statusLabel(item))}</span></div><div class="detail-grid"><div class="detail-item"><small>版本</small><strong>${escapeHtml(item.version)}</strong></div><div class="detail-item"><small>來源頁碼</small><strong>${escapeHtml(item.sourcePage || '待補')}</strong></div><div class="detail-item"><small>分類</small><strong>${escapeHtml(item.category || '未提供')}</strong></div><div class="detail-item"><small>單位</small><strong>${escapeHtml(item.unit || '未提供')}</strong></div></div><div class="detail-section"><h3>操作定義／來源內容</h3><p>${escapeHtml(item.definition)}</p></div><div class="detail-section"><h3>計算公式</h3><p>${escapeHtml(item.formula || '未提供')}</p></div><div class="detail-grid"><div class="detail-section"><h3>分子</h3><p>${escapeHtml(item.numerator || '未提供')}</p></div><div class="detail-section"><h3>分母</h3><p>${escapeHtml(item.denominator || '未提供')}</p></div></div><div class="detail-section"><h3>資料來源</h3><p>${escapeHtml(item.sourceDocument || item.source || '未提供')}</p>${sourceLink}</div><div class="detail-section"><h3>校對狀態</h3><p>${escapeHtml(item.verificationStatus || '未標記')}；正式發布前請對照原始文件。</p></div>`;
    $('#detail-modal').classList.remove('hidden');
  }

  function closeModal() { $('#detail-modal').classList.add('hidden'); }

  async function renderComparison() {
    const code = $('#compare-indicator').value;
    if (!code) { $('#compare-result').innerHTML = '<div class="empty-state compact"><div class="empty-icon">⇄</div><h3>請先選擇指標</h3><p>選擇指標後，系統會列出各省分定義。</p></div>'; return; }
    const payload = await request('/api/v1/indicators', { code, status: 'all', page_size: 50 });
    const items = payload.data || [];
    const provinceCells = data.provinces.map((province) => items.find((item) => item.provinceId === province.id) || null);
    const fields = [['操作定義', 'definition'], ['計算公式', 'formula'], ['分子', 'numerator'], ['分母', 'denominator'], ['資料來源', 'sourceDocument'], ['版本', 'version']];
    $('#compare-result').innerHTML = `<table class="compare-table"><thead><tr><th>比較欄位</th>${provinceCells.map((item, index) => `<th>${escapeHtml(data.provinces[index].name)}${item ? '' : '<br><small>尚無資料</small>'}</th>`).join('')}</tr></thead><tbody>${fields.map(([label, key]) => `<tr><td>${label}</td>${provinceCells.map((item) => `<td>${item ? escapeHtml(item[key] || '未提供') : '尚無資料'}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
  }

  function renderAdmin() { $('#admin-table').innerHTML = `<table><thead><tr><th>指標</th><th>省分</th><th>版本</th><th>狀態</th><th>來源</th></tr></thead><tbody>${data.indicators.map((item) => `<tr><td>${escapeHtml(item.code)}｜${escapeHtml(item.name)}</td><td>${escapeHtml(item.provinceName)}</td><td>${escapeHtml(item.version)}</td><td><span class="status-badge ${item.status === 'published' ? 'published' : 'draft'}">${escapeHtml(statusLabel(item))}</span></td><td>${escapeHtml(item.sourceDocument || '未提供')}${item.sourcePage ? `｜第 ${item.sourcePage} 頁` : ''}</td></tr>`).join('')}</tbody></table>`; }
  function switchView(viewId) { document.querySelectorAll('.app-view').forEach((view) => view.classList.toggle('active', view.id === viewId)); document.querySelectorAll('.nav-link').forEach((button) => button.classList.toggle('active', button.dataset.view === viewId)); }
  init();
})();
