const fs = require('fs');
const path = require('path');

const cssContent = fs.readFileSync('css/style.css', 'utf8');
const connectorsJs = fs.readFileSync('js/connectors.js', 'utf8');
const layoutJs = fs.readFileSync('js/layout.js', 'utf8');
const appJs = fs.readFileSync('js/app.js', 'utf8');

// index.html から body 内の app コンテナとモーダル群を抽出
const indexHtml = fs.readFileSync('index.html', 'utf8');
const bodyMatch = indexHtml.match(/<body[^>]*>([\s\S]*?)<script/i);
const bodyHtml = bodyMatch ? bodyMatch[1].trim() : '';

// 発表用JS (最小限の表示・拡大縮小・カード詳細ポップアップのみ)
const presJs = `
  const CARD_WIDTH = 70;
  const CARD_HEIGHT = 220;
  const SPOUSE_GAP = 24;
  const SIBLING_GAP = 20;
  const GENERATION_GAP = 96;

  let currentZoom = 1.0;
  let panX = 0;
  let panY = 0;
  let isPanning = false;
  let startPanX = 0;
  let startPanY = 0;

  ${connectorsJs}

  ${layoutJs}

  // 発表用 Viewport & Zoom 管理
  window.addEventListener("DOMContentLoaded", () => {
    applyTheme(appData.theme || "japanese");
    renderTree();
    centerTreeInViewport();

    const viewport = document.getElementById("viewport");
    const container = document.getElementById("canvas-container");

    viewport.addEventListener("mousedown", (e) => {
      if (e.target.closest(".person-card") || e.target.closest("button")) return;
      isPanning = true;
      startPanX = e.clientX - panX;
      startPanY = e.clientY - panY;
      viewport.classList.add("dragging");
    });

    window.addEventListener("mousemove", (e) => {
      if (!isPanning) return;
      panX = e.clientX - startPanX;
      panY = e.clientY - startPanY;
      container.style.transform = \`translate(\${panX}px, \${panY}px) scale(\${currentZoom})\`;
    });

    window.addEventListener("mouseup", () => {
      isPanning = false;
      viewport.classList.remove("dragging");
    });

    viewport.addEventListener("wheel", (e) => {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
      currentZoom = Math.min(Math.max(currentZoom * zoomFactor, 0.25), 2.5);
      container.style.transform = \`translate(\${panX}px, \${panY}px) scale(\${currentZoom})\`;
      const zText = document.getElementById("zoom-level-text");
      if (zText) zText.textContent = \`\${Math.round(currentZoom * 100)}%\`;
    }, { passive: false });

    // ズームボタン
    document.getElementById("btn-zoom-in")?.addEventListener("click", () => {
      currentZoom = Math.min(currentZoom * 1.15, 2.5);
      container.style.transform = \`translate(\${panX}px, \${panY}px) scale(\${currentZoom})\`;
      document.getElementById("zoom-level-text").textContent = \`\${Math.round(currentZoom * 100)}%\`;
    });
    document.getElementById("btn-zoom-out")?.addEventListener("click", () => {
      currentZoom = Math.max(currentZoom * 0.85, 0.25);
      container.style.transform = \`translate(\${panX}px, \${panY}px) scale(\${currentZoom})\`;
      document.getElementById("zoom-level-text").textContent = \`\${Math.round(currentZoom * 100)}%\`;
    });
    document.getElementById("btn-zoom-reset")?.addEventListener("click", () => {
      currentZoom = 1.0;
      centerTreeInViewport();
    });
    document.getElementById("btn-zoom-fit")?.addEventListener("click", () => {
      centerTreeInViewport();
    });

    // 詳細情報モーダル
    document.getElementById("btn-info-modal-close")?.addEventListener("click", () => {
      document.getElementById("person-info-modal")?.classList.remove("open");
    });
  });

  function applyTheme(theme) {
    document.body.className = \`theme-\${theme}\`;
  }

  function openPersonInfoModal(person) {
    const modal = document.getElementById("person-info-modal");
    if (!modal) return;
    document.getElementById("info-name").textContent = person.name || "";
    document.getElementById("info-kana").textContent = person.kana ? \`（\${person.kana}）\` : "";
    document.getElementById("info-relation").textContent = person.relation ? \`続柄: \${person.relation}\` : "";
    
    let lifespan = "";
    if (person.birthYear) lifespan += \`生年: \${person.birthYear}年 \`;
    if (person.isAlive === false && person.deathYear) lifespan += \`没年: \${person.deathYear}年\`;
    else if (person.isAlive !== false) lifespan += "(現存)";
    document.getElementById("info-lifespan").textContent = lifespan;
    document.getElementById("info-note").textContent = person.note || "特記事項なし";
    modal.classList.add("open");
  }
`;

// フル機能版JS
const fullJs = `
  ${connectorsJs}

  ${layoutJs}

  ${appJs}
`;

const exporterContent = `/**
 * ==========================================================================
 * FamilyTree Studio — Standalone HTML Exporter
 * 完全クライアントサイド生成（No-Build, No-Fetch, CORS制限なし）
 * ==========================================================================
 */

const EXPORT_EMBEDDED_CSS = ${JSON.stringify(cssContent)};
const EXPORT_EMBEDDED_BODY_HTML = ${JSON.stringify(bodyHtml)};
const EXPORT_EMBEDDED_FULL_JS = ${JSON.stringify(fullJs)};
const EXPORT_EMBEDDED_PRES_JS = ${JSON.stringify(presJs)};

/**
 * HTMLスタンドアロンファイルのエクスポート
 * @param {'presentation' | 'full'} mode
 */
function exportStandaloneHtml(mode = 'full') {
  if (!appData) return;

  const title = appData.title || "家系図";
  const subtitle = appData.subtitle || "";
  const theme = appData.theme || "japanese";
  const currentDataJson = JSON.stringify(appData);
  const safeFilename = title.replace(/[/\\\\?%*:|"<>]/g, '_');

  if (mode === 'presentation') {
    // -----------------------------------------------------------------------
    // 1. PRESENTATION MODE (発表・閲覧用HTML: 約80KB)
    // -----------------------------------------------------------------------
    const htmlContent = \`<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>\${title}</title>
  <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🌳</text></svg>">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,600;1,600&family=Noto+Sans+JP:wght@400;500;700&family=Noto+Serif+JP:wght@400;600;700;900&family=Shippori+Mincho:wght@500;700;800&display=swap" rel="stylesheet">
  <style>
\${EXPORT_EMBEDDED_CSS}
    /* 発表用特有のクリーンアップスタイル */
    header.app-header .toolbar-actions #btn-add-person,
    header.app-header .toolbar-actions #btn-reset-layout,
    header.app-header .toolbar-actions #btn-toggle-json,
    header.app-header .toolbar-actions #file-menu-select {
      display: none !important;
    }
    .person-card .card-actions-hover {
      display: none !important;
    }
    .sidebar-panel {
      display: none !important;
    }
  </style>
</head>
<body class="theme-\${theme}">
  <div id="app">
    <header class="app-header">
      <div class="brand-section">
        <div class="brand-icon">🌳</div>
        <div class="brand-title-box">
          <div class="brand-title">\${title}</div>
          <div style="font-size: 11px; color: var(--text-sub);">\${subtitle}</div>
        </div>
      </div>
      <div class="toolbar-actions">
        <select id="layout-mode-select" class="select-input">
          <option value="ancestry">🏯 4代祖先系譜</option>
          <option value="descendant">🌿 子孫展開ツリー</option>
        </select>
        <select id="theme-select" class="select-input">
          <option value="japanese">🌸 和モダン</option>
          <option value="heritage">🏛️ 西洋クラシック</option>
          <option value="modern">💎 洗練モダン</option>
        </select>
        <button id="btn-open-print" class="btn btn-vermilion" onclick="window.print()">
          <span>🖨️ 印刷 / PDF</span>
        </button>
      </div>
    </header>

    <div class=\"workspace-container\">
      <div id=\"viewport\">
        <div id=\"canvas-container\">
          <div class=\"print-document-header\">
            <div class=\"print-doc-title\">\${title}</div>
            <div class=\"print-doc-subtitle\">\${subtitle}</div>
          </div>
          <svg id=\"connector-svg\"></svg>
          <div id=\"cards-container\"></div>
        </div>
      </div>

      <div class=\"floating-controls\">
        <button id=\"btn-zoom-out\" class=\"zoom-btn\" title=\"縮小\">−</button>
        <span id=\"zoom-level-text\" class=\"zoom-level-text\">100%</span>
        <button id=\"btn-zoom-in\" class=\"zoom-btn\" title=\"拡大\">＋</button>
        <button id=\"btn-zoom-fit\" class=\"zoom-btn\" title=\"全体にフィット\">⛶</button>
        <button id=\"btn-zoom-reset\" class=\"zoom-btn\" title=\"1:1\">1:1</button>
      </div>
    </div>
  </div>

  <!-- MODAL: PERSON INFO (READ ONLY) -->
  <div id=\"person-info-modal\" class=\"modal-backdrop\">
    <div class=\"modal-card\" style=\"width: 380px;\">
      <div class=\"modal-header\">
        <div class=\"modal-title\">
          <span>👤</span> <span id=\"info-name\">人物情報</span>
        </div>
        <button id=\"btn-info-modal-close\" class=\"modal-close-btn\">&times;</button>
      </div>
      <div class=\"modal-body\" style=\"font-size: 13px;\">
        <div id=\"info-kana\" style=\"color: var(--text-sub); margin-bottom: 4px;\"></div>
        <div id=\"info-relation\" style=\"font-weight: bold; margin-bottom: 8px;\"></div>
        <div id=\"info-lifespan\" style=\"color: var(--text-sub); margin-bottom: 12px;\"></div>
        <div id=\"info-note\" style=\"background: #fbf9f4; border: 1px solid #ebdccb; border-radius: 6px; padding: 12px; color: var(--text-main); white-space: pre-wrap;\"></div>
      </div>
    </div>
  </div>

  <script>
    const appData = \${currentDataJson};
\${EXPORT_EMBEDDED_PRES_JS}
  </script>
</body>
</html>\`;

    downloadHtmlBlob(htmlContent, \`\${safeFilename}_発表用.html\`);
    showToast("🖥️ 発表・閲覧用HTMLをダウンロードしました");
  } else {
    // -----------------------------------------------------------------------
    // 2. FULL FEATURED STANDALONE MODE (完全版スタンドアロンHTML: 約135KB)
    // -----------------------------------------------------------------------
    const htmlContent = \`<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>\${title}</title>
  <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🌳</text></svg>">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,600;1,600&family=Noto+Sans+JP:wght@400;500;700&family=Noto+Serif+JP:wght@400;600;700;900&family=Shippori+Mincho:wght@500;700;800&display=swap" rel="stylesheet">
  <style>
\${EXPORT_EMBEDDED_CSS}
  </style>
</head>
<body class="theme-\${theme}">
\${EXPORT_EMBEDDED_BODY_HTML}

  <script>
    // Embedded Constants
    const CARD_WIDTH = 70;
    const CARD_HEIGHT = 220;
    const SPOUSE_GAP = 24;
    const SIBLING_GAP = 20;
    const GENERATION_GAP = 96;

    let currentZoom = 1.0;
    let panX = 0;
    let panY = 0;
    let isPanning = false;
    let startPanX = 0;
    let startPanY = 0;

    let appData = \${currentDataJson};
\${EXPORT_EMBEDDED_FULL_JS}
  </script>
</body>
</html>\`;

    downloadHtmlBlob(htmlContent, \`\${safeFilename}_フル機能版.html\`);
    showToast("🌐 フル機能スタンドアロンHTMLをダウンロードしました");
  }
}

function downloadHtmlBlob(content, fileName) {
  const blob = new Blob([content], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
`;

fs.writeFileSync('js/exporter.js', exporterContent, 'utf8');
console.log('Successfully bundled js/exporter.js!');
