window.QMI_DATA = {
  provinces: [
    { id: "gd", code: "440000", name: "廣東省", type: "province" },
    { id: "js", code: "320000", name: "江蘇省", type: "province" },
    { id: "zj", code: "330000", name: "浙江省", type: "province" },
    { id: "bj", code: "110000", name: "北京市", type: "municipality" }
  ],
  indicators: [
    { id: "q01", code: "QMI-001", name: "住院患者跌倒發生率", category: "病人安全", provinceId: "gd", version: "2026.01", effectiveFrom: "2026-01-01", status: "published", definition: "統計期間內住院患者發生跌倒事件的人次，除以同期住院患者總人日，再乘以 1,000。", formula: "跌倒事件人次 ÷ 住院患者總人日 × 1,000", numerator: "住院期間發生跌倒事件的人次", denominator: "同期住院患者總人日", unit: "‰", inclusion: "納入所有正式辦理住院且住院期間超過 24 小時的患者。", exclusion: "急診留觀、日間手術及未完成入院登記者。", source: "廣東省醫療質量管理相關指引（2026）", references: [{ title: "廣東省醫療質量管理指引", publisher: "廣東省衛生健康主管部門", date: "2026-01-01", url: "#" }] },
    { id: "q02", code: "QMI-002", name: "抗菌藥物使用率", category: "合理用藥", provinceId: "gd", version: "2025.02", effectiveFrom: "2025-07-01", status: "published", definition: "統計期間內使用抗菌藥物的住院患者數，占同期出院患者總數的比例。", formula: "使用抗菌藥物住院患者數 ÷ 出院患者總數 × 100%", numerator: "住院期間至少使用一次抗菌藥物的出院患者數", denominator: "同期出院患者總數", unit: "%", inclusion: "納入完成一次完整住院流程的出院患者。", exclusion: "僅急診治療未住院患者。", source: "廣東省合理用藥品質控制標準", references: [{ title: "合理用藥品質控制標準", publisher: "省級質控中心", date: "2025-06-15", url: "#" }] },
    { id: "q01-js", code: "QMI-001", name: "住院患者跌倒發生率", category: "病人安全", provinceId: "js", version: "2026.03", effectiveFrom: "2026-03-01", status: "published", definition: "統計期間內住院患者跌倒事件數，除以同期住院患者數，再乘以 1,000；同一患者同日多次事件分別計算。", formula: "跌倒事件數 ÷ 住院患者數 × 1,000", numerator: "住院期間發生的跌倒事件總數", denominator: "同期辦理出院的住院患者人數", unit: "‰", inclusion: "納入住院患者在院內發生的所有非計畫性跌倒事件。", exclusion: "院外發生、門診及急診患者事件。", source: "江蘇省醫療質量指標監測方案（2026）", references: [{ title: "江蘇省醫療質量指標監測方案", publisher: "江蘇省衛生健康主管部門", date: "2026-02-20", url: "#" }] },
    { id: "q03-zj", code: "QMI-003", name: "手術部位感染率", category: "感染控制", provinceId: "zj", version: "2025.01", effectiveFrom: "2025-01-01", status: "published", definition: "接受指定手術的患者中，於手術後 30 日內發生手術部位感染的患者比例。", formula: "手術部位感染患者數 ÷ 指定手術患者數 × 100%", numerator: "符合監測定義的手術部位感染患者數", denominator: "完成指定手術且符合監測條件的患者數", unit: "%", inclusion: "納入省級監測方案指定手術類型。", exclusion: "術前已存在感染且非手術相關者。", source: "浙江省醫院感染監測規範", references: [{ title: "浙江省醫院感染監測規範", publisher: "浙江省醫院感染質控中心", date: "2024-12-01", url: "#" }] },
    { id: "q04-bj", code: "QMI-004", name: "平均住院日", category: "醫療效率", provinceId: "bj", version: "2026.01", effectiveFrom: "2026-01-01", status: "published", definition: "統計期間出院患者實際住院日數的平均值。", formula: "出院患者總住院日數 ÷ 出院患者人數", numerator: "所有出院患者住院日數總和", denominator: "同期出院患者人數", unit: "日", inclusion: "納入正式住院並完成出院結算者。", exclusion: "轉院且無完整住院日資料者。", source: "北京市醫療服務品質評價指標", references: [{ title: "北京市醫療服務品質評價指標", publisher: "北京市衛生健康主管部門", date: "2026-01-01", url: "#" }] }
  ]
};
