/**
 * Real-time dynamic SVG connectors updater for dragging
 */
function updateConnectorsLive() {
  const nodePositions = window._activeNodePositions;
  const connectorJobs = window._activeConnectorJobs;
  if (!nodePositions || !connectorJobs) return;

  connectorJobs.forEach(job => {
    if (job.type === 'couple' && job.p1Id && job.p2Id) {
      const p1 = nodePositions.get(job.p1Id);
      const p2 = nodePositions.get(job.p2Id);
      if (p1 && p2) {
        const left = p1.x < p2.x ? p1 : p2;
        const right = p1.x < p2.x ? p2 : p1;
        job.x1 = left.x + CARD_WIDTH;
        job.x2 = right.x;
        job.y = (left.y + right.y) / 2 + CARD_HEIGHT / 2;
      }
    } else if (job.type === 'drop_to_child') {
      if (job.childId) {
        const cPos = nodePositions.get(job.childId);
        if (cPos) {
          job.toX = cPos.x + CARD_WIDTH / 2;
          job.toY = cPos.y;
        }
      }
      if (job.parentIds && job.parentIds.length > 0) {
        const pPositions = job.parentIds.map(pid => nodePositions.get(pid)).filter(Boolean);
        if (pPositions.length >= 2) {
          const left = pPositions[0].x < pPositions[1].x ? pPositions[0] : pPositions[1];
          const right = pPositions[0].x < pPositions[1].x ? pPositions[1] : pPositions[0];
          job.fromX = (left.x + CARD_WIDTH + right.x) / 2;
          job.fromY = (left.y + right.y) / 2 + CARD_HEIGHT / 2;
        } else if (pPositions.length === 1) {
          job.fromX = pPositions[0].x + CARD_WIDTH / 2;
          job.fromY = pPositions[0].y + CARD_HEIGHT;
        }
      }
    } else if (job.type === 'children_fork') {
      const childIds = job.childIds || (job.children ? job.children.map(c => c.id) : []);
      if (childIds.length > 0) {
        const childItems = [];
        childIds.forEach(cid => {
          const cPos = nodePositions.get(cid);
          if (cPos) {
            childItems.push({ id: cid, x: cPos.x + CARD_WIDTH / 2, y: cPos.y });
          }
        });
        if (childItems.length > 0) {
          job.children = childItems;
          job.childMidXs = childItems.map(c => c.x);
          job.minChildX = Math.min(...job.childMidXs);
          job.maxChildX = Math.max(...job.childMidXs);
          job.childTopY = Math.min(...childItems.map(c => c.y));
        }
      }
      if (job.parentIds && job.parentIds.length > 0) {
        const pPositions = job.parentIds.map(pid => nodePositions.get(pid)).filter(Boolean);
        if (pPositions.length >= 2) {
          const left = pPositions[0].x < pPositions[1].x ? pPositions[0] : pPositions[1];
          const right = pPositions[0].x < pPositions[1].x ? pPositions[1] : pPositions[0];
          job.parentMidX = (left.x + CARD_WIDTH + right.x) / 2;
          job.parentStartY = (left.y + right.y) / 2 + CARD_HEIGHT / 2;
        } else if (pPositions.length === 1) {
          job.parentMidX = pPositions[0].x + CARD_WIDTH / 2;
          job.parentStartY = pPositions[0].y + CARD_HEIGHT;
        }
        if (job.childTopY != null) {
          job.forkY = (job.parentStartY + job.childTopY) / 2;
        }
      }
    }
  });

  const svg = document.getElementById("connector-svg");
  if (svg) drawSvgConnectors(connectorJobs, svg);
}

function drawSvgConnectors(jobs, svg) {
  let svgContent = "";

  jobs.forEach(job => {
    if (job.type === "couple") {
      svgContent += `
        <line x1="${job.x1}" y1="${job.y - 3}" x2="${job.x2}" y2="${job.y - 3}" class="svg-couple-line" />
        <line x1="${job.x1}" y1="${job.y + 3}" x2="${job.x2}" y2="${job.y + 3}" class="svg-couple-line" />
        <text x="${(job.x1 + job.x2) / 2}" y="${job.y}" class="svg-marriage-icon">⚭</text>
      `;
    } else if (job.type === "drop_to_child") {
      const startY = job.fromY;
      const midY = (startY + job.toY) / 2;
      svgContent += `
        <line x1="${job.fromX}" y1="${startY}" x2="${job.fromX}" y2="${midY}" class="svg-child-line" />
        <line x1="${job.fromX}" y1="${midY}" x2="${job.toX}" y2="${midY}" class="svg-child-line" />
        <line x1="${job.toX}" y1="${midY}" x2="${job.toX}" y2="${job.toY}" class="svg-child-line" />
        <circle cx="${job.fromX}" cy="${startY}" r="3.5" class="svg-junction-dot" />
        <circle cx="${job.toX}" cy="${job.toY}" r="3.5" class="svg-junction-dot" />
      `;
    } else if (job.type === "children_fork") {
      const startY = job.parentStartY != null ? job.parentStartY : (job.parentBottomY || 0);
      svgContent += `
        <line x1="${job.parentMidX}" y1="${startY}" x2="${job.parentMidX}" y2="${job.forkY}" class="svg-child-line" />
        <circle cx="${job.parentMidX}" cy="${startY}" r="3.5" class="svg-junction-dot" />
      `;

      const minX = Math.min(job.parentMidX, job.minChildX);
      const maxX = Math.max(job.parentMidX, job.maxChildX);
      svgContent += `
        <line x1="${minX}" y1="${job.forkY}" x2="${maxX}" y2="${job.forkY}" class="svg-child-line" />
      `;

      const childList = job.children || (job.childMidXs || []).map(cx => ({ x: cx, y: job.childTopY }));
      childList.forEach(ch => {
        svgContent += `
          <line x1="${ch.x}" y1="${job.forkY}" x2="${ch.x}" y2="${ch.y}" class="svg-child-line" />
          <circle cx="${ch.x}" cy="${ch.y}" r="3.5" class="svg-junction-dot" />
        `;
      });
    }
  });

  svg.innerHTML = svgContent;
}
