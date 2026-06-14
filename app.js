(function () {
  const data = window.dashboardData;
  const colors = {
    cyan: "#37d9ff",
    blue: "#2788ff",
    green: "#42e79d",
    yellow: "#ffc743",
    red: "#ff475d",
    violet: "#8f78ff",
    muted: "rgba(148, 213, 238, 0.72)",
    grid: "rgba(95, 205, 255, 0.16)",
    panel: "rgba(2, 15, 30, 0.72)"
  };

  let activeFilter = "all";
  let refreshOffset = 0;
  const DESIGN_WIDTH = 1920;
  const DESIGN_HEIGHT = 1080;
  const EDITABLE_STORAGE_PREFIX = "polymerValveDashboard.editableText.v2.";

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  function formatNumber(value) {
    if (typeof value !== "number") return value;
    return Math.round(value).toLocaleString("en-US");
  }

  function currentMultiplier() {
    return data.filterTotals[activeFilter]?.multiplier || 1;
  }

  function setupCanvas(id) {
    const canvas = document.getElementById(id);
    const dpr = window.devicePixelRatio || 1;
    const width = Math.max(1, Math.floor(canvas.clientWidth || canvas.getBoundingClientRect().width));
    const height = Math.max(1, Math.floor(canvas.clientHeight || canvas.getBoundingClientRect().height));
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    return { canvas, ctx, width, height };
  }

  function text(ctx, value, x, y, opts = {}) {
    ctx.save();
    ctx.fillStyle = opts.color || colors.muted;
    ctx.font = `${opts.weight || 500} ${opts.size || 11}px "Microsoft YaHei", "Segoe UI", sans-serif`;
    ctx.textAlign = opts.align || "left";
    ctx.textBaseline = opts.baseline || "middle";
    ctx.fillText(value, x, y);
    ctx.restore();
  }

  function roundedRect(ctx, x, y, w, h, r) {
    const radius = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + w, y, x + w, y + h, radius);
    ctx.arcTo(x + w, y + h, x, y + h, radius);
    ctx.arcTo(x, y + h, x, y, radius);
    ctx.arcTo(x, y, x + w, y, radius);
    ctx.closePath();
  }

  function colorScale(value) {
    const v = Math.max(-2, Math.min(2, value));
    if (v < 0) {
      const t = (v + 2) / 2;
      return mix("#1847b9", "#8fd6ff", t);
    }
    const t = v / 2;
    return mix("#f4d46a", "#d91f45", t);
  }

  function mix(a, b, t) {
    const pa = hexToRgb(a);
    const pb = hexToRgb(b);
    return `rgb(${Math.round(pa.r + (pb.r - pa.r) * t)}, ${Math.round(pa.g + (pb.g - pa.g) * t)}, ${Math.round(pa.b + (pb.b - pa.b) * t)})`;
  }

  function hexToRgb(hex) {
    const value = hex.replace("#", "");
    return {
      r: parseInt(value.slice(0, 2), 16),
      g: parseInt(value.slice(2, 4), 16),
      b: parseInt(value.slice(4, 6), 16)
    };
  }

  function renderKpis() {
    const wrap = $("#kpiRow");
    const multiplier = currentMultiplier();
    wrap.innerHTML = data.kpis.map((item, index) => {
      const adjusted = index < 5 ? item.value * multiplier + refreshOffset * (index + 1) : item.value + refreshOffset;
      return `
        <article class="kpi-card">
          <i aria-hidden="true">${item.icon}</i>
          <span>${item.label}</span>
          <strong>${formatNumber(adjusted)}${item.unit}</strong>
        </article>
      `;
    }).join("");
    enableInlineEditing(wrap);
  }

  function renderGeneBars() {
    const max = Math.max(...data.geneRanking.map((d) => d.value));
    $("#geneBars").innerHTML = data.geneRanking.map((row) => `
      <div class="rank-row">
        <span>${row.name}</span>
        <div class="bar-track"><div class="bar-fill" style="--w:${Math.max(8, row.value / max * 100)}%"></div></div>
        <strong>${row.value.toFixed(2)}</strong>
      </div>
    `).join("");
  }

  function tableMarkup(headers, rows) {
    return `
      <thead><tr>${headers.map((h) => `<th>${h}</th>`).join("")}</tr></thead>
      <tbody>${rows.map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join("")}</tr>`).join("")}</tbody>
    `;
  }

  function renderTables() {
    const performanceMaterials = data.performanceMaterials || data.syntheticMaterials;
    $("#syntheticTable").innerHTML = tableMarkup(
      ["材料", "耐久性", "抗钙化", "拉伸强度", "相容性"],
      performanceMaterials.map((d) => [d.name, d.values[0], d.values[1], d.values[2], d.values[3]])
    );

    $("#optimizationTable").innerHTML = tableMarkup(
      ["参数", "初始值", "优化值", "提升"],
      [
        ["瓣叶厚度", "0.42 mm", "0.36 mm", "+18%"],
        ["开口面积", "2.1 cm²", "2.8 cm²", "+33%"],
        ["峰值应力", "4.8 MPa", "3.2 MPa", "-31%"],
        ["疲劳寿命", "2.1e8", "6.4e8", "+205%"]
      ]
    );
    enableInlineEditing($("#syntheticTable"));
    enableInlineEditing($("#optimizationTable"));
  }

  function renderMaterials() {
    $("#syntheticCards").innerHTML = data.syntheticMaterials.slice(0, 4).map((item) => materialCard(item)).join("");
    $("#bioUploadCards").innerHTML = data.bioMaterials.map((item, index) => uploadMaterialCard(item, index)).join("");
    enableInlineEditing($("#syntheticCards"));
    enableInlineEditing($("#bioUploadCards"));
  }

  function materialCard(item) {
    return `
      <article class="material-card">
        <img src="./assets/${item.img}" alt="${item.name}材料纹理" loading="lazy" />
        <strong title="${item.name}">${item.name}</strong>
      </article>
    `;
  }

  function uploadMaterialCard(item, index) {
    const inputId = `bioMaterialInput${index}`;
    const previewId = `bioMaterialPreview${index}`;
    return `
      <label class="upload-material-card" for="${inputId}">
        <input id="${inputId}" type="file" accept="image/*,video/*" data-preview="${previewId}" />
        <img id="${previewId}" src="./assets/${item.img}" alt="${item.name}材料图片" />
        <strong>${item.name}</strong>
      </label>
    `;
  }

  function renderDevices() {
    $("#deviceCards").innerHTML = data.devices.map((device) => `
      <article class="device-card">
        <div class="device-icon">${deviceSvg(device.shape)}</div>
        <strong>${device.name}</strong>
        <span>${device.type} · ${device.range}</span>
      </article>
    `).join("");
  }

  function deviceSvg(type) {
    if (type === "ring") {
      return `<svg viewBox="0 0 120 72" width="100%" height="70" aria-hidden="true">
        <ellipse cx="60" cy="36" rx="44" ry="16" fill="none" stroke="#37d9ff" stroke-width="5"/>
        <ellipse cx="60" cy="36" rx="28" ry="9" fill="none" stroke="#a7efff" stroke-width="2"/>
        <line x1="60" y1="10" x2="60" y2="62" stroke="#dffbff" stroke-width="3"/>
      </svg>`;
    }
    if (type === "leaf") {
      return `<svg viewBox="0 0 120 72" width="100%" height="70" aria-hidden="true">
        <path d="M26 58 C32 20 48 12 60 46 C72 12 88 20 94 58 Z" fill="rgba(255,255,255,.72)" stroke="#37d9ff" stroke-width="2"/>
        <path d="M60 46 C57 28 54 18 48 12" fill="none" stroke="#ffc743" stroke-width="2"/>
        <path d="M60 46 C63 28 66 18 72 12" fill="none" stroke="#ffc743" stroke-width="2"/>
      </svg>`;
    }
    return `<svg viewBox="0 0 120 72" width="100%" height="70" aria-hidden="true">
      <path d="M28 60 L40 12 M44 60 L54 12 M60 60 L66 12 M76 60 L80 12 M92 60 L92 12" stroke="#a7efff" stroke-width="2"/>
      <path d="M28 14 C45 30 74 30 92 14 M28 28 C45 44 74 44 92 28 M28 42 C45 58 74 58 92 42" fill="none" stroke="#37d9ff" stroke-width="2"/>
      <path d="M28 60 C45 48 74 48 92 60" fill="none" stroke="#ffc743" stroke-width="2"/>
    </svg>`;
  }

  function renderSourceMetrics() {
    $("#sourceMetrics").innerHTML = data.miningMetrics.map((item) => `
      <div class="source-metric">
        <span>${item.label}</span>
        <strong>${item.value}</strong>
      </div>
    `).join("");
  }

  function drawNetwork(id, graph, centerText) {
    const { ctx, width, height } = setupCanvas(id);
    ctx.strokeStyle = "rgba(68, 209, 255, 0.45)";
    ctx.lineWidth = 1;
    graph.edges.forEach(([a, b]) => {
      const source = graph.nodes.find((n) => n.id === a);
      const target = graph.nodes.find((n) => n.id === b);
      const sx = source.x * width;
      const sy = source.y * height;
      const tx = target.x * width;
      const ty = target.y * height;
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(tx, ty);
      ctx.stroke();
    });

    graph.nodes.forEach((node) => {
      const x = node.x * width;
      const y = node.y * height;
      const r = node.r * Math.min(width, height);
      const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
      grad.addColorStop(0, node.color || "#dffbff");
      grad.addColorStop(1, node.group === "core" ? "rgba(55,217,255,.36)" : "rgba(39,136,255,.32)");
      ctx.fillStyle = grad;
      ctx.strokeStyle = node.color || colors.cyan;
      ctx.lineWidth = node.group === "core" ? 2 : 1.4;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      text(ctx, node.id, x, y, {
        size: node.group === "core" || node.id === centerText ? 12 : 9,
        align: "center",
        color: "#e6fbff",
        weight: 700
      });
    });
  }

  function drawVolcano() {
    const { ctx, width, height } = setupCanvas("volcanoChart");
    const pad = { l: 30, r: 12, t: 10, b: 26 };
    drawAxes(ctx, width, height, pad, "log2(FC)", "-log10(p)");
    const seeded = [];
    data.volcano.points.forEach((p, index) => {
      seeded.push(p);
      for (let i = 0; i < 7; i += 1) {
        const sx = p[0] + Math.sin(index * 12.989 + i) * 0.45;
        const sy = Math.max(0.2, p[1] + Math.cos(index * 7.37 + i) * 0.8);
        seeded.push([sx, sy, p[2]]);
      }
    });

    seeded.forEach(([x, y, type]) => {
      const px = scale(x, -4, 4, pad.l, width - pad.r);
      const py = scale(y, 0, 9, height - pad.b, pad.t);
      ctx.fillStyle = type === "up" ? colors.red : type === "down" ? colors.green : "rgba(190, 205, 198, 0.48)";
      ctx.beginPath();
      ctx.arc(px, py, type === "normal" ? 2 : 2.6, 0, Math.PI * 2);
      ctx.fill();
    });

    [["上调", colors.red], ["下调", colors.green], ["不显著", "rgba(190,205,198,.76)"]].forEach((item, i) => {
      ctx.fillStyle = item[1];
      ctx.beginPath();
      ctx.arc(width - 62, 18 + i * 15, 3, 0, Math.PI * 2);
      ctx.fill();
      text(ctx, item[0], width - 54, 18 + i * 15, { size: 9 });
    });
  }

  function drawPathways() {
    const { ctx, width, height } = setupCanvas("pathwayChart");
    const max = Math.max(...data.pathways.map((d) => d.value));
    const left = 84;
    const top = 8;
    const rowH = (height - 18) / data.pathways.length;
    data.pathways.forEach((d, i) => {
      const y = top + i * rowH + rowH / 2;
      text(ctx, d.name, 4, y, { size: 9, color: "#aee8f5" });
      roundedRect(ctx, left, y - 5, width - left - 28, 10, 5);
      ctx.fillStyle = "rgba(40,80,110,.45)";
      ctx.fill();
      const grad = ctx.createLinearGradient(left, 0, width - 28, 0);
      grad.addColorStop(0, colors.red);
      grad.addColorStop(1, "#ff9a6e");
      roundedRect(ctx, left, y - 5, (width - left - 28) * (d.value / max), 10, 5);
      ctx.fillStyle = grad;
      ctx.fill();
      text(ctx, d.value.toFixed(2), width - 4, y, { size: 9, align: "right", color: "#dffbff" });
    });
  }

  function drawLineChart(id, chart, opts = {}) {
    const { ctx, width, height } = setupCanvas(id);
    const pad = { l: opts.left || 30, r: opts.right || 12, t: opts.top || 12, b: opts.bottom || 24 };
    const all = chart.series.flatMap((s) => s.values);
    const min = opts.min ?? Math.min(...all) * 0.88;
    const max = opts.max ?? Math.max(...all) * 1.08;
    drawGrid(ctx, width, height, pad);
    chart.series.forEach((series) => {
      ctx.strokeStyle = series.color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      series.values.forEach((value, i) => {
        const x = scale(i, 0, series.values.length - 1, pad.l, width - pad.r);
        const y = scale(value, min, max, height - pad.b, pad.t);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
      series.values.forEach((value, i) => {
        const x = scale(i, 0, series.values.length - 1, pad.l, width - pad.r);
        const y = scale(value, min, max, height - pad.b, pad.t);
        ctx.fillStyle = series.color;
        ctx.beginPath();
        ctx.arc(x, y, 2.7, 0, Math.PI * 2);
        ctx.fill();
      });
    });
    const tickLabelY = opts.xLabel ? height - 22 : height - 9;
    chart.labels.forEach((label, i) => {
      const x = scale(i, 0, chart.labels.length - 1, pad.l, width - pad.r);
      text(ctx, label, x, tickLabelY, { size: 9, align: "center" });
    });
    if (opts.xLabel) {
      text(ctx, opts.xLabel, width / 2, height - 8, { size: 10, align: "center", color: "#dffbff", weight: 700 });
    }
    if (opts.yLabel) {
      ctx.save();
      ctx.translate(10, height / 2);
      ctx.rotate(-Math.PI / 2);
      text(ctx, opts.yLabel, 0, 0, { size: 10, align: "center", color: "#dffbff", weight: 700 });
      ctx.restore();
    }
    chart.series.forEach((series, i) => {
      const y = 14 + i * 14;
      ctx.strokeStyle = series.color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(width - 78, y);
      ctx.lineTo(width - 62, y);
      ctx.stroke();
      text(ctx, series.name, width - 58, y, { size: 9, color: "#c9eef8" });
    });
  }

  function drawDonut(id, segments, centerLabel, centerValue) {
    const { ctx, width, height } = setupCanvas(id);
    const cx = width * 0.39;
    const cy = height * 0.52;
    const radius = Math.min(width, height) * 0.33;
    const lineWidth = Math.max(18, radius * 0.48);
    const total = segments.reduce((sum, d) => sum + d.value, 0);
    let angle = -Math.PI / 2;
    segments.forEach((seg) => {
      const next = angle + (seg.value / total) * Math.PI * 2;
      ctx.strokeStyle = seg.color;
      ctx.lineWidth = lineWidth;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, angle, next);
      ctx.stroke();
      angle = next;
    });

    text(ctx, centerLabel, cx, cy - 8, { align: "center", size: 12, color: "#e7fbff", weight: 700 });
    text(ctx, centerValue, cx, cy + 10, { align: "center", size: 15, color: colors.cyan, weight: 800 });

    segments.forEach((seg, i) => {
      const y = 20 + i * 20;
      ctx.fillStyle = seg.color;
      ctx.fillRect(width * 0.66, y - 5, 8, 8);
      text(ctx, seg.name, width * 0.66 + 14, y, { size: 10, color: "#cbeef8" });
      text(ctx, `${seg.value}%`, width - 4, y, { size: 10, align: "right", color: "#e7fbff" });
    });
  }

  function drawRadar() {
    const { ctx, width, height } = setupCanvas("radarChart");
    const cx = width * 0.47;
    const cy = height * 0.55;
    const radius = Math.min(width, height) * 0.36;
    const axes = data.radar.axes;
    for (let ring = 1; ring <= 4; ring += 1) {
      ctx.beginPath();
      axes.forEach((_, i) => {
        const p = polar(cx, cy, radius * ring / 4, -Math.PI / 2 + i * Math.PI * 2 / axes.length);
        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      });
      ctx.closePath();
      ctx.strokeStyle = "rgba(91, 207, 255, 0.18)";
      ctx.stroke();
    }
    axes.forEach((axis, i) => {
      const a = -Math.PI / 2 + i * Math.PI * 2 / axes.length;
      const end = polar(cx, cy, radius, a);
      ctx.strokeStyle = "rgba(91, 207, 255, 0.25)";
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(end.x, end.y);
      ctx.stroke();
      const label = polar(cx, cy, radius + 12, a);
      text(ctx, axis, label.x, label.y, { size: 9, align: "center", color: "#aee8f5" });
    });
    data.radar.series.forEach((series) => {
      ctx.beginPath();
      series.values.forEach((value, i) => {
        const p = polar(cx, cy, radius * value, -Math.PI / 2 + i * Math.PI * 2 / axes.length);
        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      });
      ctx.closePath();
      ctx.fillStyle = alpha(series.color, 0.12);
      ctx.strokeStyle = series.color;
      ctx.lineWidth = 1.5;
      ctx.fill();
      ctx.stroke();
    });
    data.radar.series.forEach((series, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const x = width - 94 + col * 52;
      const y = 14 + row * 15;
      ctx.fillStyle = series.color;
      ctx.fillRect(x, y - 4, 7, 7);
      text(ctx, series.name, x + 10, y, { size: 7 });
    });
  }

  function drawDatabaseStack() {
    const { ctx, width, height } = setupCanvas("databaseStack");
    const cx = width / 2;
    const top = 15;
    const layerH = 18;
    const rx = Math.min(62, width * 0.28);
    const ry = 13;
    for (let i = 0; i < 5; i += 1) {
      const y = top + i * layerH;
      const grad = ctx.createLinearGradient(cx - rx, y, cx + rx, y);
      grad.addColorStop(0, "rgba(39, 136, 255, 0.1)");
      grad.addColorStop(0.5, "rgba(55, 217, 255, 0.38)");
      grad.addColorStop(1, "rgba(39, 136, 255, 0.1)");
      ctx.strokeStyle = "rgba(71, 212, 255, 0.64)";
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.ellipse(cx, y, rx, ry, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      if (i < 4) {
        ctx.beginPath();
        ctx.moveTo(cx - rx, y);
        ctx.lineTo(cx - rx, y + layerH);
        ctx.moveTo(cx + rx, y);
        ctx.lineTo(cx + rx, y + layerH);
        ctx.strokeStyle = "rgba(71, 212, 255, 0.22)";
        ctx.stroke();
      }
    }
    ctx.shadowColor = colors.cyan;
    ctx.shadowBlur = 14;
    ctx.strokeStyle = colors.cyan;
    ctx.beginPath();
    ctx.ellipse(cx, top + 4 * layerH, rx, ry, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.shadowBlur = 0;
  }

  function drawPca() {
    const { ctx, width, height } = setupCanvas("pcaChart");
    const pad = { l: 28, r: 10, t: 10, b: 24 };
    drawAxes(ctx, width, height, pad, "PC1 (35.2%)", "PC2 (18.7%)");
    data.pca.forEach((p) => {
      const x = scale(p.x, -8, 8, pad.l, width - pad.r);
      const y = scale(p.y, -7, 7, height - pad.b, pad.t);
      ctx.fillStyle = p.c;
      ctx.beginPath();
      ctx.arc(x, y, 3.6, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  function drawForecast() {
    drawLineChart("forecastChart", data.forecast, { left: 34, bottom: 24, min: 0, max: 20000 });
  }

  function drawPulseFlowChart() {
    drawLineChart("pulseFlowChart", {
      labels: ["0", "2e7", "5e7", "1e8", "2e8", "4e8"],
      series: [
        { name: "返流比", color: colors.cyan, values: [3.8, 4.2, 4.9, 5.8, 7.4, 9.6] },
        { name: "预警线", color: colors.yellow, values: [10, 10, 10, 10, 10, 10] }
      ]
    }, { left: 42, bottom: 36, min: 0, max: 12, xLabel: "疲劳次数", yLabel: "返流比(%)" });
  }

  function drawFatigueLifeChart() {
    drawLineChart("fatigueLifeChart", {
      labels: ["1e6", "1e7", "1e8", "5e8", "1e9"],
      series: [
        { name: "仿真寿命", color: colors.cyan, values: [98, 93, 86, 74, 62] },
        { name: "实测校准", color: colors.green, values: [96, 91, 83, 70, 58] },
        { name: "安全阈值", color: colors.red, values: [72, 72, 72, 72, 72] }
      ]
    }, { left: 34, bottom: 22, min: 45, max: 100 });
  }

  function drawShapeDonut() {
    const segments = data.devices.map((d, index) => ({
      name: d.name,
      value: d.share,
      color: [colors.blue, colors.red, colors.yellow, colors.green, colors.cyan][index]
    }));
    drawDonut("shapeDonut", segments, "总数", "12,846");
  }

  function drawAxes(ctx, width, height, pad, xLabel, yLabel) {
    drawGrid(ctx, width, height, pad);
    ctx.strokeStyle = "rgba(149, 224, 247, 0.45)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(pad.l, pad.t);
    ctx.lineTo(pad.l, height - pad.b);
    ctx.lineTo(width - pad.r, height - pad.b);
    ctx.stroke();
    text(ctx, xLabel, width / 2, height - 8, { size: 9, align: "center" });
    ctx.save();
    ctx.translate(10, height / 2);
    ctx.rotate(-Math.PI / 2);
    text(ctx, yLabel, 0, 0, { size: 9, align: "center" });
    ctx.restore();
  }

  function drawGrid(ctx, width, height, pad) {
    ctx.strokeStyle = colors.grid;
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i += 1) {
      const y = scale(i, 0, 4, height - pad.b, pad.t);
      ctx.beginPath();
      ctx.moveTo(pad.l, y);
      ctx.lineTo(width - pad.r, y);
      ctx.stroke();
    }
    for (let i = 0; i <= 4; i += 1) {
      const x = scale(i, 0, 4, pad.l, width - pad.r);
      ctx.beginPath();
      ctx.moveTo(x, pad.t);
      ctx.lineTo(x, height - pad.b);
      ctx.stroke();
    }
  }

  function scale(value, min, max, outMin, outMax) {
    if (max === min) return outMin;
    return outMin + ((value - min) / (max - min)) * (outMax - outMin);
  }

  function polar(cx, cy, radius, angle) {
    return { x: cx + Math.cos(angle) * radius, y: cy + Math.sin(angle) * radius };
  }

  function alpha(hex, opacity) {
    const rgb = hexToRgb(hex);
    return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`;
  }

  function drawAll() {
    if ($("#pulseFlowChart")) drawPulseFlowChart();
    if ($("#fatigueLifeChart")) drawFatigueLifeChart();
    if ($("#radarChart")) drawRadar();
  }

  function applyFilter(filter) {
    activeFilter = filter;
    $$(".control-btn").forEach((btn) => btn.classList.toggle("is-active", btn.dataset.filter === filter));
    $$("[data-panel]").forEach((panel) => panel.classList.remove("is-dimmed"));
    if (filter !== "all") {
      $$("[data-panel]").forEach((panel) => {
        const key = panel.dataset.panel;
        const keep = key === filter || key === "hero" || key === "mining";
        panel.classList.toggle("is-dimmed", !keep);
      });
    }
    renderKpis();
  }

  function setupControls() {
    $$(".control-btn").forEach((btn) => {
      btn.addEventListener("click", () => applyFilter(btn.dataset.filter));
    });
    $("#refreshBtn").addEventListener("click", () => {
      refreshOffset = (refreshOffset + 1) % 9;
      updateClock(new Date());
      renderKpis();
      drawAll();
    });
  }

  function setupImageUploads() {
    $$('input[type="file"][data-preview]').forEach((input) => {
      const preview = document.getElementById(input.dataset.preview);
      const drop = input.closest("label");
      if (!preview || !drop) return;
      input.addEventListener("change", () => {
        const selected = input.files && input.files[0];
        if (!selected) return;
        drop.classList.remove("has-image", "has-video");
        const oldVideo = drop.querySelector(".upload-video-preview");
        if (oldVideo) {
          if (oldVideo.dataset.objectUrl) URL.revokeObjectURL(oldVideo.dataset.objectUrl);
          oldVideo.remove();
        }
        if (selected.type.startsWith("video/")) {
          const video = document.createElement("video");
          const objectUrl = URL.createObjectURL(selected);
          video.className = "upload-video-preview";
          video.dataset.objectUrl = objectUrl;
          video.src = objectUrl;
          video.autoplay = true;
          video.loop = true;
          video.muted = true;
          video.playsInline = true;
          video.controls = true;
          preview.removeAttribute("src");
          preview.style.display = "none";
          drop.insertBefore(video, drop.querySelector(".upload-placeholder"));
          drop.classList.add("has-video");
          video.play().catch(() => {});
          return;
        }
        const reader = new FileReader();
        reader.addEventListener("load", () => {
          preview.style.display = "";
          preview.src = reader.result;
          drop.classList.add("has-image");
        });
        reader.readAsDataURL(selected);
      });
    });
  }

  function setupDefaultVideos() {
    $$("video[autoplay]").forEach((video) => {
      video.muted = true;
      video.loop = true;
      video.playsInline = true;
      video.play().catch(() => {});
    });
  }

  function setupAiModelInteraction() {
    const card = $(".ai-model-card");
    if (!card) return;
    const grid = card.closest(".mining-grid");
    const effectVideo = $(".ai-flow-video-effect", card);
    let effectTimer = null;
    let optimizationRunActive = false;
    const revealOptimizationTable = () => {
      if (grid) grid.classList.add("is-optimized");
    };
    const hideOptimizationTable = () => {
      if (grid) grid.classList.remove("is-optimized");
    };
    const finishEffect = () => {
      window.clearTimeout(effectTimer);
      card.classList.remove("is-effect-playing");
      if (!optimizationRunActive) return;
      optimizationRunActive = false;
      revealOptimizationTable();
    };
    card.dataset.aiInteractionReady = "true";
    if (effectVideo) {
      effectVideo.muted = true;
      effectVideo.playsInline = true;
      effectVideo.addEventListener("ended", finishEffect);
      effectVideo.addEventListener("error", finishEffect);
    }
    const playEffectVideo = () => {
      if (!effectVideo) {
        revealOptimizationTable();
        return;
      }
      window.clearTimeout(effectTimer);
      optimizationRunActive = true;
      card.classList.add("is-effect-playing");
      effectVideo.currentTime = 0;
      effectVideo.play().catch(() => {
        finishEffect();
      });
      effectTimer = window.setTimeout(() => {
        finishEffect();
      }, Number.isFinite(effectVideo.duration) && effectVideo.duration > 0 ? effectVideo.duration * 1000 + 350 : 12000);
    };
    const startRun = () => {
      hideOptimizationTable();
      card.classList.remove("is-running");
      void card.offsetWidth;
      card.classList.add("is-running");
      playEffectVideo();
      card.setAttribute("aria-pressed", "true");
      window.setTimeout(() => card.setAttribute("aria-pressed", "false"), 2600);
    };
    document.addEventListener("pointerdown", (event) => {
      const target = event.target;
      if (!target.closest || target.closest(".ai-model-card") !== card) return;
      if (target.closest(".ai-upload-trigger, input")) return;
      startRun();
    }, true);
    card.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      startRun();
    });
  }

  function enableInlineEditing(root = document) {
    if (!root) return;
    const editableSelector = [
      "h1",
      "h2",
      "h3",
      "p",
      ".control-btn",
      ".panel-index",
      ".status span:not(.pulse)",
      ".status strong",
      ".clock span",
      ".clock strong",
      ".kpi-card span",
      ".kpi-card strong",
      ".hotspot span",
      ".hotspot strong",
      ".material-card strong",
      ".upload-material-card strong",
      "th",
      "td",
      ".flow-step",
      ".source-metric span",
      ".source-metric strong",
      ".device-card strong",
      ".device-card span"
    ].join(",");

    $$(editableSelector, root).forEach((el) => {
      if (!el.textContent.trim()) return;
      const storageKey = editableStorageKey(el);
      const savedText = loadEditableText(storageKey);
      if (savedText !== null && el.textContent !== savedText) {
        el.textContent = savedText;
        if (el.id === "liveTime") el.dataset.manualEdit = "true";
      }
      el.setAttribute("contenteditable", "true");
      el.setAttribute("spellcheck", "false");
      el.classList.add("editable-text");
      if (!el.hasAttribute("data-editable-ready")) {
        el.dataset.editableReady = "true";
        el.dataset.editableKey = storageKey;
        const persistEdit = () => saveEditableText(el.dataset.editableKey, el.textContent);
        el.addEventListener("input", persistEdit);
        el.addEventListener("blur", persistEdit);
        el.addEventListener("keydown", (event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            el.blur();
          }
        });
        if (el.id === "liveTime") {
          el.addEventListener("input", () => {
            el.dataset.manualEdit = "true";
          });
        }
      }
    });
  }

  function editableStorageKey(el) {
    if (el.dataset.editableKey) return el.dataset.editableKey;
    const parts = [];
    let node = el;
    while (node && node.nodeType === 1 && node !== document.body) {
      let part = node.tagName.toLowerCase();
      if (node.id) {
        part += `#${node.id}`;
        parts.unshift(part);
        break;
      }
      const stableClasses = Array.from(node.classList || [])
        .filter((name) => ![
          "editable-text",
          "is-active",
          "is-running",
          "is-optimized",
          "has-image",
          "has-video"
        ].includes(name))
        .slice(0, 3);
      if (stableClasses.length) part += `.${stableClasses.join(".")}`;
      const parent = node.parentElement;
      if (parent) {
        const sameTag = Array.from(parent.children).filter((child) => child.tagName === node.tagName);
        if (sameTag.length > 1) part += `:nth-of-type(${sameTag.indexOf(node) + 1})`;
      }
      parts.unshift(part);
      node = parent;
    }
    return `${EDITABLE_STORAGE_PREFIX}${parts.join(">")}`;
  }

  function loadEditableText(key) {
    try {
      return window.localStorage.getItem(key);
    } catch (error) {
      return null;
    }
  }

  function saveEditableText(key, value) {
    try {
      window.localStorage.setItem(key, value);
    } catch (error) {
      // Ignore storage failures so editing still works in restricted browser modes.
    }
  }

  function setDashboardScale() {
    const scale = Math.min(window.innerWidth / DESIGN_WIDTH, window.innerHeight / DESIGN_HEIGHT);
    const left = (window.innerWidth - DESIGN_WIDTH * scale) / 2;
    const top = (window.innerHeight - DESIGN_HEIGHT * scale) / 2;
    document.documentElement.style.setProperty("--dashboard-scale", String(scale));
    document.documentElement.style.setProperty("--dashboard-left", `${left}px`);
    document.documentElement.style.setProperty("--dashboard-top", `${top}px`);
  }

  function updateClock(date = new Date()) {
    const pad = (value) => String(value).padStart(2, "0");
    const value = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
    const liveTime = $("#liveTime");
    if (liveTime.dataset.manualEdit !== "true" && document.activeElement !== liveTime) liveTime.textContent = value;
  }

  function setupResize() {
    const redraw = debounce(drawAll, 120);
    const rescale = debounce(() => {
      setDashboardScale();
      drawAll();
    }, 120);
    window.addEventListener("resize", rescale);
    if ("ResizeObserver" in window) {
      const observer = new ResizeObserver(redraw);
      $$("canvas").forEach((canvas) => observer.observe(canvas));
    } else {
      window.addEventListener("resize", redraw);
    }
  }

  function debounce(fn, wait) {
    let timer;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), wait);
    };
  }

  function init() {
    setDashboardScale();
    renderKpis();
    renderTables();
    renderMaterials();
    setupControls();
    setupImageUploads();
    setupAiModelInteraction();
    setupDefaultVideos();
    setupResize();
    enableInlineEditing();
    updateClock();
    drawAll();
    window.setInterval(updateClock, 1000);
  }

  document.addEventListener("DOMContentLoaded", init);
})();
