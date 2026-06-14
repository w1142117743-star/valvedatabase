window.dashboardData = {
  kpis: [
    { label: "瓣膜总数量", value: 12846, unit: "", icon: "◇" },
    { label: "瓣膜材料", value: 126, unit: "", icon: "⌁" },
    { label: "瓣架材料", value: 8532, unit: "", icon: "⌬" },
    { label: "研究文献", value: 3245, unit: "", icon: "▤" },
    { label: "数据来源", value: 56, unit: "", icon: "◎" },
    { label: "今日新增", value: 28, unit: "", icon: "▥" }
  ],
  filterTotals: {
    all: { title: "全库视图", multiplier: 1 },
    synthetic: { title: "合成瓣材料视图", multiplier: 0.42 },
    bio: { title: "生物瓣材料视图", multiplier: 0.51 },
    device: { title: "器械结构视图", multiplier: 0.36 }
  },
  heatmap: {
    rows: ["COL1A1", "VCAN", "MMP9", "THBS2", "ITGA2", "FN1", "ELN", "POSTN", "TGFBI", "LOX"],
    columns: ["S1", "S2", "S3", "S4", "S5", "S6", "S7", "S8"],
    values: [
      [-1.2, -0.9, -0.5, 0.1, 0.8, 1.4, 1.9, 2.1],
      [-0.8, -1.1, -0.7, -0.2, 0.6, 1.0, 1.5, 1.8],
      [-1.6, -1.3, -0.8, -0.5, 0.2, 0.9, 1.3, 1.5],
      [-0.5, -0.6, -0.4, 0.4, 1.0, 1.5, 1.8, 1.7],
      [-1.4, -1.1, -0.2, 0.2, 0.8, 1.7, 2.0, 1.9],
      [-0.6, -0.8, -1.0, -0.4, 0.2, 0.8, 1.1, 1.4],
      [-0.2, -0.4, -0.6, -0.8, -0.1, 0.3, 0.6, 0.9],
      [-1.5, -1.3, -1.0, -0.6, -0.2, 0.3, 0.7, 1.1],
      [-0.7, -0.8, -0.5, -0.2, 0.4, 0.9, 1.2, 1.4],
      [-1.1, -0.9, -0.6, -0.3, 0.1, 0.5, 0.8, 1.0]
    ]
  },
  geneRanking: [
    { name: "COL1A1", value: 2.36 },
    { name: "MMP9", value: 2.01 },
    { name: "THBS2", value: 1.78 },
    { name: "VCAN", value: 1.52 },
    { name: "FN1", value: 1.34 },
    { name: "ITGA2", value: 1.18 },
    { name: "TGFBI", value: 0.98 },
    { name: "LOX", value: 0.85 },
    { name: "ELN", value: 0.73 },
    { name: "POSTN", value: 0.62 }
  ],
  geneStats: [
    ["检测基因数", "1,245"],
    ["差异基因数", "326"],
    ["上调基因数", "178"],
    ["下调基因数", "148"],
    ["显著通路数", "23"]
  ],
  network: {
    nodes: [
      { id: "TGF-β", x: 0.5, y: 0.34, r: 0.13, group: "core" },
      { id: "ECM", x: 0.33, y: 0.55, r: 0.11, group: "core" },
      { id: "炎症", x: 0.72, y: 0.58, r: 0.1, group: "core" },
      { id: "COL1A1", x: 0.17, y: 0.27, r: 0.035, group: "gene" },
      { id: "FN1", x: 0.4, y: 0.18, r: 0.035, group: "gene" },
      { id: "MMP9", x: 0.62, y: 0.14, r: 0.035, group: "gene" },
      { id: "TIMP1", x: 0.84, y: 0.3, r: 0.035, group: "gene" },
      { id: "ITGA2", x: 0.9, y: 0.51, r: 0.035, group: "gene" },
      { id: "LOX", x: 0.76, y: 0.82, r: 0.035, group: "gene" },
      { id: "ELN", x: 0.53, y: 0.85, r: 0.035, group: "gene" },
      { id: "THBS2", x: 0.22, y: 0.8, r: 0.035, group: "gene" }
    ],
    edges: [
      ["TGF-β", "ECM"], ["TGF-β", "炎症"], ["ECM", "COL1A1"], ["ECM", "FN1"],
      ["TGF-β", "MMP9"], ["炎症", "TIMP1"], ["炎症", "ITGA2"], ["TGF-β", "LOX"],
      ["ECM", "ELN"], ["ECM", "THBS2"], ["MMP9", "TIMP1"], ["COL1A1", "THBS2"]
    ]
  },
  volcano: {
    points: [
      [-2.8, 3.7, "down"], [-2.3, 5.4, "down"], [-1.9, 2.5, "down"], [-1.5, 4.2, "down"],
      [1.4, 3.8, "up"], [1.8, 5.6, "up"], [2.2, 4.4, "up"], [2.6, 6.8, "up"], [3.2, 3.7, "up"],
      [-0.4, 1.2, "normal"], [0.2, 1.7, "normal"], [0.7, 1.5, "normal"], [-0.8, 1.9, "normal"],
      [1.1, 2.7, "normal"], [-1.1, 2.3, "normal"], [0.4, 2.4, "normal"], [-0.2, 0.9, "normal"]
    ]
  },
  pathways: [
    { name: "钙离子信号通路", value: 2.45 },
    { name: "骨形态通路", value: 2.12 },
    { name: "Wnt信号通路", value: 1.89 },
    { name: "BMP信号通路", value: 1.67 },
    { name: "氧化应激通路", value: 1.35 },
    { name: "TGF-β信号通路", value: 1.26 }
  ],
  calcTrend: {
    labels: ["0", "4", "8", "12", "16", "20", "24"],
    series: [
      { name: "RUNX2", color: "#37d9ff", values: [1.9, 2.4, 3.1, 2.8, 3.2, 3.3, 3.6] },
      { name: "ALPL", color: "#42e79d", values: [2.1, 2.8, 3.5, 3.1, 3.7, 3.8, 4.1] },
      { name: "BMP2", color: "#ffc743", values: [1.2, 1.5, 2.0, 1.7, 2.1, 2.3, 2.0] },
      { name: "COL10A1", color: "#ff475d", values: [0.9, 1.1, 1.0, 0.8, 1.1, 1.3, 0.9] }
    ]
  },
  riskShare: [
    { name: "高风险", value: 28, color: "#ff475d" },
    { name: "中风险", value: 47, color: "#ffc743" },
    { name: "低风险", value: 25, color: "#42e79d" }
  ],
  performanceMaterials: [
    { name: "pericardium", values: [9.4, 3.1, 18.2, 90] },
    { name: "GA-pericardium", values: [11.2, 4.2, 22.6, 84] },
    { name: "TPU", values: [13.1, 3.8, 34.5, 88] },
    { name: "Fiber-TPU", values: [16.4, 4.5, 52.8, 91] },
    { name: "x-SIBS", values: [14.7, 4.0, 29.6, 89] },
    { name: "Fiber-SIBS", values: [17.2, 4.7, 48.3, 92] }
  ],
  syntheticMaterials: [
    { name: "聚氨酯TPU", share: 28, img: "material-ptfe.png", values: [12.3, 3.2, 28.5, 85] },
    { name: "硅基聚氨酯Si-TPU", share: 26, img: "material-polyurethane.png", values: [10.1, 3.6, 34.2, 88] },
    { name: "聚烯烃x-SIBS", share: 18, img: "material-peek.png", values: [15.6, 4.1, 95.3, 90] },
    { name: "线性聚乙烯LLDPA", share: 14, img: "material-ppsu.png", values: [11.8, 3.4, 61.7, 86] }
  ],
  radar: {
    axes: ["耐久性", "生物相容性", "抗钙化", "柔韧性", "抗疲劳"],
    series: [
      { name: "pericardium", color: "#37d9ff", values: [0.62, 0.9, 0.54, 0.72, 0.66] },
      { name: "GA-pericardium", color: "#ff8f3d", values: [0.72, 0.84, 0.76, 0.66, 0.7] },
      { name: "TPU", color: "#42e79d", values: [0.78, 0.82, 0.64, 0.88, 0.74] },
      { name: "Fiber-TPU", color: "#8f78ff", values: [0.9, 0.78, 0.72, 0.82, 0.88] },
      { name: "x-SIBS", color: "#ffc743", values: [0.84, 0.86, 0.7, 0.76, 0.82] },
      { name: "Fiber-SIBS", color: "#ff475d", values: [0.92, 0.84, 0.78, 0.8, 0.9] }
    ]
  },
  bioMaterials: [
    { name: "双键交联复合", subtitle: "Double-bond", share: 38, img: "uploads/bio-valve-front.png", values: [3.6, 12.8, 88] },
    { name: "纤维增强聚氨酯", subtitle: "Fiber-TPU", share: 24, img: "uploads/bio-valve-stent.png", values: [3.4, 11.3, 87] },
    { name: "纤维增强聚烯烃", subtitle: "Fiber-SIBS", share: 22, img: "bio-decell.png", values: [3.8, 10.6, 90] },
    { name: "涂层复合聚烯烃", subtitle: "Coated SIBS", share: 16, img: "bio-allograft.png", values: [3.2, 8.7, 84] }
  ],
  sourceShare: [
    { name: "牛心包", value: 38, color: "#ff475d" },
    { name: "猪组织", value: 24, color: "#ffc743" },
    { name: "脱细胞基质", value: 22, color: "#42e79d" },
    { name: "同种异体", value: 16, color: "#2788ff" }
  ],
  devices: [
    { name: "机械瓣", type: "双叶式", range: "18-33 mm", share: 22, shape: "ring" },
    { name: "生物瓣（异种）", type: "三叶式", range: "15-25 mm", share: 36, shape: "leaf" },
    { name: "生物瓣（同种）", type: "三叶式", range: "19-31 mm", share: 14, shape: "leaf" },
    { name: "经导管瓣（TAVR）", type: "自膨胀式", range: "20-34 mm", share: 18, shape: "stent" },
    { name: "无缝瓣/支架瓣", type: "无缝式", range: "21-29 mm", share: 10, shape: "mesh" }
  ],
  miningMetrics: [
    { label: "实验数据", value: "6,321,456" },
    { label: "临床病例", value: "4,285,617" },
    { label: "文献数量", value: "3,245" },
    { label: "样本数量", value: "28,745" }
  ],
  pca: [
    { x: -6.2, y: 3.3, c: "#37d9ff" }, { x: -5.4, y: 4.8, c: "#37d9ff" }, { x: -4.8, y: 2.1, c: "#37d9ff" },
    { x: -2.4, y: -4.2, c: "#ff475d" }, { x: -1.3, y: -3.1, c: "#ff475d" }, { x: -0.8, y: -5.3, c: "#ff475d" },
    { x: 3.1, y: 4.2, c: "#8f78ff" }, { x: 4.4, y: 5.6, c: "#8f78ff" }, { x: 5.2, y: 3.8, c: "#8f78ff" },
    { x: 4.7, y: -2.8, c: "#ffc743" }, { x: 5.6, y: -4.1, c: "#ffc743" }, { x: 6.7, y: -2.5, c: "#ffc743" }
  ],
  relationGraph: {
    nodes: [
      { id: "钙化风险", x: 0.5, y: 0.5, r: 0.13, color: "#37d9ff" },
      { id: "RUNX2", x: 0.25, y: 0.16, r: 0.045, color: "#ff475d" },
      { id: "VCAN", x: 0.14, y: 0.48, r: 0.04, color: "#42e79d" },
      { id: "COL10A1", x: 0.25, y: 0.82, r: 0.04, color: "#ff8f3d" },
      { id: "GTHBS9", x: 0.72, y: 0.82, r: 0.04, color: "#8f78ff" },
      { id: "材料粗糙度", x: 0.82, y: 0.48, r: 0.04, color: "#ffc743" },
      { id: "炎症反应", x: 0.72, y: 0.18, r: 0.04, color: "#37d9ff" }
    ],
    edges: [["钙化风险", "RUNX2"], ["钙化风险", "VCAN"], ["钙化风险", "COL10A1"], ["钙化风险", "GTHBS9"], ["钙化风险", "材料粗糙度"], ["钙化风险", "炎症反应"], ["RUNX2", "炎症反应"], ["COL10A1", "GTHBS9"]]
  },
  models: [
    ["XGBoost", "0.92", "0.96", "0.91", "48"],
    ["Random Forest", "0.89", "0.94", "0.88", "60"],
    ["SVM", "0.86", "0.92", "0.85", "42"],
    ["Deep Neural Net", "0.93", "0.97", "0.92", "56"]
  ],
  forecast: {
    labels: ["2025", "2026", "2027", "2028", "2029", "2030"],
    series: [
      { name: "瓣膜植入量", color: "#37d9ff", values: [7800, 11000, 12600, 15300, 16800, 19000] },
      { name: "生物瓣占比", color: "#42e79d", values: [5200, 6900, 7600, 9100, 10100, 12500] },
      { name: "抗钙化等级", color: "#ffc743", values: [1500, 2300, 3200, 4100, 4600, 6900] }
    ]
  }
};
