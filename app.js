(function () {
  const data = window.QMI_DATA;
  const $ = (selector) => document.querySelector(selector);
  const provinceById = (id) => data.provinces.find((item) => item.id === id);
  const published = () => data.indicators.filter((item) => item.status === "published");

  function init() {
    $('#published-count').textContent = published().length;
    data.provinces.forEach((province) => $('#province-select').insertAdjacentHTML('beforeend', `<option value="${province.id}">${province.name}</option>`));
    [...new Set(data.indicators.map((item) => item.category))].sort().forEach((category) => $('#category-select').insertAdjacentHTML('beforeend', `<option value="${category}">${category}</option>`));
    [...new Map(published().map((item) => [item.code, item])).values()].forEach((item) => $('#compare-indicator').insertAdjacentHTML('beforeend', `<option value="${item.code}">${item.code}｜${item.name}</option>`));
    renderAdmin();
    bindEvents();
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

  function search() {
    const provinceId = $('#province-select').value;
    const keyword = $('#keyword-input').value.trim().toLowerCase();
    const category = $('#category-select').value;
    $('#search-error').textContent = '';
    if (!provinceId) { $('#search-error').textContent = '請先選擇省分，再執行查詢。'; return; }
    const province = provinceById(provinceId);
    const results = published().filter((item) => item.provinceId === provinceId && (!category || item.category === category) && (!keyword || [item.name, item.code, item.definition, item.category].join(' ').toLowerCase().includes(keyword)));
    $('#current-filter').textContent = `目前查詢省分：${province.name}`;
    $('#result-count').textContent = `共 ${results.length} 筆`;
    renderResults(results);
  }

  function renderResults(results) {
    const container = $('#results');
    if (!results.length) { container.innerHTML = '<div class="empty-state"><div class="empty-icon">⌕</div><h3>找不到符合條件的指標</h3><p>請嘗試調整關鍵字或分類，或確認該省分是否已有已發布定義。</p></div>'; return; }
    container.innerHTML = results.map((item) => { const province = provinceById(item.provinceId); return `<article class="result-card" data-indicator-id="${item.id}" tabindex="0"><div class="card-top"><span class="card-code">${item.code}</span><span class="status-badge published">已發布</span></div><h3>${item.name}</h3><p class="definition-summary">${item.definition}</p><div class="card-meta"><span>${province.name}</span><span>版本 ${item.version}</span><span>${item.effectiveFrom} 生效</span></div></article>`; }).join('');
  }

  function clearSearch() { $('#province-select').value = ''; $('#keyword-input').value = ''; $('#category-select').value = ''; $('#current-filter').textContent = '尚未查詢'; $('#result-count').textContent = ''; $('#search-error').textContent = ''; $('#results').innerHTML = '<div class="empty-state"><div class="empty-icon">⌕</div><h3>請先選擇省分</h3><p>選擇省分後，系統只會顯示該省分已發布且仍有效的指標定義。</p></div>'; }

  function openDetail(id) {
    const item = data.indicators.find((entry) => entry.id === id); if (!item) return;
    const province = provinceById(item.provinceId);
    $('#detail-content').innerHTML = `<div class="detail-header"><span class="detail-province">${province.name} · ${item.code}</span><h2 id="detail-title">${item.name}</h2><span class="status-badge published">已發布</span></div><div class="detail-grid"><div class="detail-item"><small>版本</small><strong>${item.version}</strong></div><div class="detail-item"><small>生效日期</small><strong>${item.effectiveFrom}</strong></div><div class="detail-item"><small>分類</small><strong>${item.category}</strong></div><div class="detail-item"><small>單位</small><strong>${item.unit || '未提供'}</strong></div></div><div class="detail-section"><h3>操作定義</h3><p>${item.definition}</p></div><div class="detail-section"><h3>計算公式</h3><p>${item.formula || '未提供'}</p></div><div class="detail-grid"><div class="detail-section"><h3>分子</h3><p>${item.numerator || '未提供'}</p></div><div class="detail-section"><h3>分母</h3><p>${item.denominator || '未提供'}</p></div></div><div class="detail-section"><h3>適用條件</h3><p>${item.inclusion || '未提供'}</p></div><div class="detail-section"><h3>排除條件</h3><p>${item.exclusion || '未提供'}</p></div><div class="detail-section"><h3>資料來源</h3><p>${item.source || '未提供'}</p></div><div class="detail-section"><h3>參考資訊</h3><ul class="ref-list">${(item.references || []).map((ref) => `<li><a href="${ref.url}" target="_blank" rel="noreferrer">${ref.title}</a>｜${ref.publisher || '未提供'}｜${ref.date || '未提供'}</li>`).join('')}</ul></div>`;
    $('#detail-modal').classList.remove('hidden');
  }

  function closeModal() { $('#detail-modal').classList.add('hidden'); }

  function renderComparison() {
    const code = $('#compare-indicator').value;
    if (!code) { $('#compare-result').innerHTML = '<div class="empty-state compact"><div class="empty-icon">⇄</div><h3>請先選擇指標</h3><p>選擇指標後，系統會列出有已發布定義的省分。</p></div>'; return; }
    const items = published().filter((item) => item.code === code); const base = items[0];
    const provinceCells = data.provinces.map((province) => items.find((item) => item.provinceId === province.id) || null);
    const fields = [['操作定義', 'definition'], ['計算公式', 'formula'], ['分子', 'numerator'], ['分母', 'denominator'], ['資料來源', 'source'], ['版本', 'version']];
    $('#compare-result').innerHTML = `<table class="compare-table"><thead><tr><th>比較欄位</th>${provinceCells.map((item, index) => `<th>${data.provinces[index].name}${item ? '' : '<br><small>尚無已發布定義</small>'}</th>`).join('')}</tr></thead><tbody>${fields.map(([label, key]) => `<tr><td>${label}</td>${provinceCells.map((item) => `<td>${item ? (item[key] || '未提供') : '此省分尚無已發布定義'}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
  }

  function renderAdmin() { $('#admin-table').innerHTML = `<table><thead><tr><th>指標</th><th>省分</th><th>版本</th><th>狀態</th><th>生效日期</th></tr></thead><tbody>${data.indicators.map((item) => `<tr><td>${item.code}｜${item.name}</td><td>${provinceById(item.provinceId).name}</td><td>${item.version}</td><td><span class="status-badge ${item.status === 'published' ? 'published' : 'draft'}">${item.status === 'published' ? '已發布' : '草稿'}</span></td><td>${item.effectiveFrom}</td></tr>`).join('')}</tbody></table>`; }
  function switchView(viewId) { document.querySelectorAll('.app-view').forEach((view) => view.classList.toggle('active', view.id === viewId)); document.querySelectorAll('.nav-link').forEach((button) => button.classList.toggle('active', button.dataset.view === viewId)); }
  init();
})();
