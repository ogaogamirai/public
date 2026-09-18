function centerTreeInViewport() {
  const viewport = document.getElementById("viewport");
  const vWidth = viewport.clientWidth || window.innerWidth;
  const vHeight = viewport.clientHeight || (window.innerHeight - 60);

  const bounds = calculateTreeBounds();
  if (!bounds || bounds.width === 0) {
    panX = 60;
    panY = 60;
    currentZoom = 1.0;
  } else {
    const padding = 60;
    const availableW = vWidth - padding * 2;
    const availableH = vHeight - padding * 2;
    const scaleW = availableW / bounds.width;
    const scaleH = availableH / bounds.height;
    currentZoom = Math.min(Math.max(Math.min(scaleW, scaleH, 1.0), 0.25), 1.2);

    panX = (vWidth - bounds.width * currentZoom) / 2 - bounds.minX * currentZoom;
    panY = (vHeight - bounds.height * currentZoom) / 2 - bounds.minY * currentZoom;
  }

  const canvasContainer = document.getElementById("canvas-container");
  canvasContainer.style.transform = `translate(${panX}px, ${panY}px) scale(${currentZoom})`;
  document.getElementById("zoom-level-text").textContent = `${Math.round(currentZoom * 100)}%`;
}

function calculateTreeBounds() {
  const cards = document.querySelectorAll(".person-card");
  if (cards.length === 0) return null;

  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  cards.forEach(c => {
    const x = parseFloat(c.style.left);
    const y = parseFloat(c.style.top);
    const w = CARD_WIDTH;
    const h = c.offsetHeight || CARD_HEIGHT;
    if (x < minX) minX = x;
    if (y < minY) minY = y;
    if (x + w > maxX) maxX = x + w;
    if (y + h > maxY) maxY = y + h;
  });

  return { minX, minY, maxX, maxY, width: maxX - minX, height: maxY - minY };
}

/**
 * Main Render Dispatcher
 */
function renderTree() {
  const cardsContainer = document.getElementById("cards-container");
  const svg = document.getElementById("connector-svg");
  cardsContainer.innerHTML = "";
  svg.innerHTML = "";

  if (!appData || !appData.persons || appData.persons.length === 0) return;

  document.getElementById("print-doc-title").textContent = appData.title || "家系図";
  document.getElementById("print-doc-subtitle").textContent = appData.subtitle || "";

  const personMap = new Map();
  appData.persons.forEach(p => personMap.set(p.id, p));

  appData.persons.forEach(p => {
    if (!p.children) p.children = [];
    if (!p.spouses) p.spouses = [];
    if (!p.parents) p.parents = [];
  });

  const mode = appData.layoutMode || "ancestry";
  if (mode === "ancestry") {
    renderAncestryLayout(personMap, cardsContainer, svg);
  } else {
    renderDescendantLayout(personMap, cardsContainer, svg);
  }
}

/**
 * ==========================================================================
 * ANCESTRY LAYOUT (4-GENERATION SYMMETRICAL PEDIGREE)
 * Level 0: 4 Ancestor Couples (初代 8人 / 4組)
 * Level 1: Parents (湊 & ゑみ子) + (一郎 & 仁子)
 * Level 2: Children of parents (更一 & 妹 洋子) + (陽子 & 兄 健太郎)
 * Level 3: Children of 更一 ⚭ 陽子 (陸 & こころ)
 * ==========================================================================
 */
function renderGenerationMarkers(cardsContainer, ys, labels) {
  if (!ys || !labels) return;
  ys.forEach((y, idx) => {
    const marker = document.createElement("div");
    marker.className = "generation-marker";
    marker.style.left = "16px";
    marker.style.top = `${y - 28}px`;
    marker.textContent = labels[idx] || `第${idx + 1}世代`;
    cardsContainer.appendChild(marker);
  });
}

function renderAncestryLayout(personMap, cardsContainer, svg) {
  // Key persons
  let koichi = personMap.get("p_koichi");
  let yoko = personMap.get("p_yoko_matsuda");

  if (!koichi) {
    const focusPerson = personMap.get(appData.focusPersonId || appData.persons[0].id);
    if (focusPerson && focusPerson.parents && focusPerson.parents.length >= 2) {
      koichi = personMap.get(focusPerson.parents[0]);
      yoko = personMap.get(focusPerson.parents[1]);
    } else {
      koichi = focusPerson;
    }
  }

  // Parents
  const minato = (koichi && koichi.parents && koichi.parents[0]) ? personMap.get(koichi.parents[0]) : personMap.get("p_minato");
  const emiko = (koichi && koichi.parents && koichi.parents[1]) ? personMap.get(koichi.parents[1]) : personMap.get("p_emiko");

  const ichiro = (yoko && yoko.parents && yoko.parents[0]) ? personMap.get(yoko.parents[0]) : personMap.get("p_ichiro_matsuda");
  const satoko = (yoko && yoko.parents && yoko.parents[1]) ? personMap.get(yoko.parents[1]) : personMap.get("p_satoko_matsuda");

  // Grandparents (Level 0)
  const oga_gp_f = (minato && minato.parents && minato.parents[0]) ? personMap.get(minato.parents[0]) : personMap.get("p_oga_gp_f");
  const oga_gp_m = (minato && minato.parents && minato.parents[1]) ? personMap.get(minato.parents[1]) : personMap.get("p_oga_gp_m");

  const taizo = (emiko && emiko.parents && emiko.parents[0]) ? personMap.get(emiko.parents[0]) : personMap.get("p_taizo_imai");
  const tane = (emiko && emiko.parents && emiko.parents[1]) ? personMap.get(emiko.parents[1]) : personMap.get("p_tane_imai");

  const matsuda_gp_f = (ichiro && ichiro.parents && ichiro.parents[0]) ? personMap.get(ichiro.parents[0]) : personMap.get("p_matsuda_gp_f");
  const matsuda_gp_m = (ichiro && ichiro.parents && ichiro.parents[1]) ? personMap.get(ichiro.parents[1]) : personMap.get("p_matsuda_gp_m");

  const sadae_f = (satoko && satoko.parents && satoko.parents[0]) ? personMap.get(satoko.parents[0]) : personMap.get("p_sadae_husband");
  const sadae = (satoko && satoko.parents && satoko.parents[1]) ? personMap.get(satoko.parents[1]) : personMap.get("p_sadae");

  // Level 1 Children Groups
  const ogaGpId1 = oga_gp_f ? oga_gp_f.id : 'p_oga_gp_f';
  const ogaGpId2 = oga_gp_m ? oga_gp_m.id : 'p_oga_gp_m';
  let ogaChildren = appData.persons.filter(p => 
    p.parents && (p.parents.includes(ogaGpId1) || p.parents.includes(ogaGpId2))
  );
  ogaChildren.sort((a, b) => (a.id === (minato ? minato.id : '') ? 1 : (b.id === (minato ? minato.id : '') ? -1 : a.id.localeCompare(b.id))));

  const imaiGpId1 = taizo ? taizo.id : 'p_taizo_imai';
  const imaiGpId2 = tane ? tane.id : 'p_tane_imai';
  let imaiChildren = appData.persons.filter(p => 
    p.parents && (p.parents.includes(imaiGpId1) || p.parents.includes(imaiGpId2))
  );
  imaiChildren.sort((a, b) => (a.id === (emiko ? emiko.id : '') ? -1 : (b.id === (emiko ? emiko.id : '') ? 1 : a.id.localeCompare(b.id))));

  const matsudaGpId1 = matsuda_gp_f ? matsuda_gp_f.id : 'p_matsuda_gp_f';
  const matsudaGpId2 = matsuda_gp_m ? matsuda_gp_m.id : 'p_matsuda_gp_m';
  let matsudaChildren = appData.persons.filter(p => 
    p.parents && (p.parents.includes(matsudaGpId1) || p.parents.includes(matsudaGpId2))
  );
  matsudaChildren.sort((a, b) => (a.id === (ichiro ? ichiro.id : '') ? 1 : (b.id === (ichiro ? ichiro.id : '') ? -1 : a.id.localeCompare(b.id))));

  const sadaeGpId1 = sadae_f ? sadae_f.id : 'p_sadae_husband';
  const sadaeGpId2 = sadae ? sadae.id : 'p_sadae';
  let sadaeChildren = appData.persons.filter(p => 
    p.parents && (p.parents.includes(sadaeGpId1) || p.parents.includes(sadaeGpId2))
  );
  if (sadaeChildren.length === 0 && satoko) sadaeChildren = [satoko];

  // Level 2 Children Groups
  let minatoChildren = appData.persons.filter(p => 
    p.parents && (p.parents.includes(minato ? minato.id : '') || p.parents.includes(emiko ? emiko.id : ''))
  );
  minatoChildren.sort((a, b) => (a.id === (koichi ? koichi.id : '') ? 1 : (b.id === (koichi ? koichi.id : '') ? -1 : 0)));

  let ichiroChildren = appData.persons.filter(p => 
    p.parents && (p.parents.includes(ichiro ? ichiro.id : '') || p.parents.includes(satoko ? satoko.id : ''))
  );
  ichiroChildren.sort((a, b) => (a.id === (yoko ? yoko.id : '') ? -1 : (b.id === (yoko ? yoko.id : '') ? 1 : 0)));

  // Level 3 Children Groups
  let koichiChildren = appData.persons.filter(p => 
    p.parents && (p.parents.includes(koichi ? koichi.id : '') || p.parents.includes(yoko ? yoko.id : ''))
  );
  koichiChildren.sort((a, b) => (a.gender === 'male' ? -1 : (b.gender === 'male' ? 1 : 0)));

  const nodePositions = new Map();
  const connectorJobs = [];
  const placedIds = new Set();
  const handledCoupleKeys = new Set();
  const handledChildIds = new Set();

  const startY = 70;
  const lvlHeight = CARD_HEIGHT + GENERATION_GAP;
  const yL0 = startY;
  const yL1 = startY + lvlHeight;
  const yL2 = startY + lvlHeight * 2;
  const yL3 = startY + lvlHeight * 3;

  const SIBLING_GAP_L1 = 18;
  const COUPLE_INTER_GAP = 46;
  const BRANCH_GAP = 90;

  // Calculate Level 1 layout
  let curX = 60;

  // 1. Ogasawara 7 kids
  const ogaKidMidXs = [];
  ogaChildren.forEach(child => {
    nodePositions.set(child.id, { x: curX, y: yL1, width: CARD_WIDTH, height: CARD_HEIGHT });
    placedIds.add(child.id);
    ogaKidMidXs.push(curX + CARD_WIDTH / 2);
    curX += CARD_WIDTH + SIBLING_GAP_L1;
  });
  if (ogaChildren.length > 0) curX -= SIBLING_GAP_L1;
  const ogaKidsMid = ogaKidMidXs.length > 0 ? (ogaKidMidXs[0] + ogaKidMidXs[ogaKidMidXs.length - 1]) / 2 : curX;

  curX += COUPLE_INTER_GAP;

  // 2. Imai 3 kids
  const imaiKidMidXs = [];
  imaiChildren.forEach(child => {
    nodePositions.set(child.id, { x: curX, y: yL1, width: CARD_WIDTH, height: CARD_HEIGHT });
    placedIds.add(child.id);
    imaiKidMidXs.push(curX + CARD_WIDTH / 2);
    curX += CARD_WIDTH + SIBLING_GAP_L1;
  });
  if (imaiChildren.length > 0) curX -= SIBLING_GAP_L1;
  const imaiKidsMid = imaiKidMidXs.length > 0 ? (imaiKidMidXs[0] + imaiKidMidXs[imaiKidMidXs.length - 1]) / 2 : curX;

  curX += BRANCH_GAP;

  // 3. Matsuda 11 kids
  const matsudaKidMidXs = [];
  matsudaChildren.forEach(child => {
    nodePositions.set(child.id, { x: curX, y: yL1, width: CARD_WIDTH, height: CARD_HEIGHT });
    placedIds.add(child.id);
    matsudaKidMidXs.push(curX + CARD_WIDTH / 2);
    curX += CARD_WIDTH + SIBLING_GAP_L1;
  });
  if (matsudaChildren.length > 0) curX -= SIBLING_GAP_L1;
  const matsudaKidsMid = matsudaKidMidXs.length > 0 ? (matsudaKidMidXs[0] + matsudaKidMidXs[matsudaKidMidXs.length - 1]) / 2 : curX;

  curX += COUPLE_INTER_GAP;

  // 4. Sadae 1 kid
  const sadaeKidMidXs = [];
  sadaeChildren.forEach(child => {
    nodePositions.set(child.id, { x: curX, y: yL1, width: CARD_WIDTH, height: CARD_HEIGHT });
    placedIds.add(child.id);
    sadaeKidMidXs.push(curX + CARD_WIDTH / 2);
    curX += CARD_WIDTH + SIBLING_GAP_L1;
  });
  if (sadaeChildren.length > 0) curX -= SIBLING_GAP_L1;
  const sadaeKidsMid = sadaeKidMidXs[0];

  // Place Level 0 couples
  function placeCoupleAbove(f, m, centerX, y) {
    if (!f && !m) return;
    const fX = centerX - CARD_WIDTH - SPOUSE_GAP / 2;
    const mX = centerX + SPOUSE_GAP / 2;
    if (f) {
      nodePositions.set(f.id, { x: fX, y, width: CARD_WIDTH, height: CARD_HEIGHT });
      placedIds.add(f.id);
    }
    if (m) {
      nodePositions.set(m.id, { x: mX, y, width: CARD_WIDTH, height: CARD_HEIGHT });
      placedIds.add(m.id);
    }
  }

  placeCoupleAbove(oga_gp_f, oga_gp_m, ogaKidsMid, yL0);
  placeCoupleAbove(taizo, tane, imaiKidsMid, yL0);
  placeCoupleAbove(matsuda_gp_f, matsuda_gp_m, matsudaKidsMid, yL0);
  placeCoupleAbove(sadae_f, sadae, sadaeKidsMid, yL0);

  // Level 1 Marriages
  const posMinato = minato ? nodePositions.get(minato.id) : null;
  const posEmiko = emiko ? nodePositions.get(emiko.id) : null;
  let minatoEmikoMid = (ogaKidsMid + imaiKidsMid) / 2;
  if (posMinato && posEmiko) {
    minatoEmikoMid = (posMinato.x + CARD_WIDTH + posEmiko.x) / 2;
  }

  const posIchiro = ichiro ? nodePositions.get(ichiro.id) : null;
  const posSatoko = satoko ? nodePositions.get(satoko.id) : null;
  let ichiroSatokoMid = (matsudaKidsMid + sadaeKidsMid) / 2;
  if (posIchiro && posSatoko) {
    ichiroSatokoMid = (posIchiro.x + CARD_WIDTH + posSatoko.x) / 2;
  }

  // Level 2: Minato & Emiko kids
  const minatoKidsW = minatoChildren.length * CARD_WIDTH + (minatoChildren.length - 1) * SIBLING_GAP;
  let curMinatoKidX = minatoEmikoMid - minatoKidsW / 2;
  const minatoKidXs = [];
  minatoChildren.forEach(child => {
    nodePositions.set(child.id, { x: curMinatoKidX, y: yL2, width: CARD_WIDTH, height: CARD_HEIGHT });
    placedIds.add(child.id);
    minatoKidXs.push(curMinatoKidX + CARD_WIDTH / 2);
    curMinatoKidX += CARD_WIDTH + SIBLING_GAP;
  });

  // Level 2: Ichiro & Satoko kids
  const ichiroKidsW = ichiroChildren.length * CARD_WIDTH + (ichiroChildren.length - 1) * SIBLING_GAP;
  let curIchiroKidX = ichiroSatokoMid - ichiroKidsW / 2;
  const ichiroKidXs = [];
  ichiroChildren.forEach(child => {
    nodePositions.set(child.id, { x: curIchiroKidX, y: yL2, width: CARD_WIDTH, height: CARD_HEIGHT });
    placedIds.add(child.id);
    ichiroKidXs.push(curIchiroKidX + CARD_WIDTH / 2);
    curIchiroKidX += CARD_WIDTH + SIBLING_GAP;
  });

  // Level 2 Marriage
  const posKoichi = koichi ? nodePositions.get(koichi.id) : null;
  const posYoko = yoko ? nodePositions.get(yoko.id) : null;
  let koichiYokoMid = (minatoEmikoMid + ichiroSatokoMid) / 2;
  if (posKoichi && posYoko) {
    koichiYokoMid = (posKoichi.x + CARD_WIDTH + posYoko.x) / 2;
  }

  // Level 3: Children of Koichi & Yoko
  const koichiKidsW = koichiChildren.length * CARD_WIDTH + (koichiChildren.length - 1) * SIBLING_GAP;
  let curKoichiKidX = koichiYokoMid - koichiKidsW / 2;
  const koichiKidXs = [];
  koichiChildren.forEach(child => {
    nodePositions.set(child.id, { x: curKoichiKidX, y: yL3, width: CARD_WIDTH, height: CARD_HEIGHT });
    placedIds.add(child.id);
    koichiKidXs.push(curKoichiKidX + CARD_WIDTH / 2);
    curKoichiKidX += CARD_WIDTH + SIBLING_GAP;
  });

  // =========================================================================
  // UNIFIED MULTI-PASS OMNIDIRECTIONAL PROPAGATION LOOP
  // (上・下・横の全方向親族伝播配置エンジン)
  // 配偶者・その親（上の世代）・その兄弟など、どんな外戚や多世代親族が
  // 追加されても、正しい世代段（Level）と美しい幾何に完全配置する。
  // =========================================================================
  let placedNew = true;
  let propIter = 0;
  while (placedNew && propIter < 25) {
    placedNew = false;
    propIter++;

    // -----------------------------------------------------------------------
    // PASS 1: UPPER ANCESTORS (上の世代：親の配置)
    // -----------------------------------------------------------------------
    const personsWithUnplacedParents = [];
    appData.persons.forEach(p => {
      if (placedIds.has(p.id) && p.parents && p.parents.length > 0) {
        const unplaced = p.parents.filter(pid => !placedIds.has(pid));
        if (unplaced.length > 0) {
          personsWithUnplacedParents.push(p);
        }
      }
    });

    if (personsWithUnplacedParents.length > 0) {
      const parentGroupMap = new Map();
      personsWithUnplacedParents.forEach(child => {
        const key = [...child.parents].sort().join(',');
        if (!parentGroupMap.has(key)) parentGroupMap.set(key, []);
        parentGroupMap.get(key).push(child);
      });

      parentGroupMap.forEach((children, pKey) => {
        const parentIds = pKey.split(',');
        const parents = parentIds.map(pid => personMap.get(pid)).filter(Boolean);
        if (parents.length === 0) return;

        const childXs = children.map(c => {
          const pos = nodePositions.get(c.id);
          return pos ? pos.x + CARD_WIDTH / 2 : 0;
        });
        const childCenter = (Math.min(...childXs) + Math.max(...childXs)) / 2;
        const childYs = children.map(c => nodePositions.get(c.id).y);
        const minChildY = Math.min(...childYs);
        const targetY = minChildY - lvlHeight;

        if (parents.length >= 2) {
          const f = parents.find(p => p.gender === 'male') || parents[0];
          const m = parents.find(p => p.id !== f.id) || parents[1];

          let fX = childCenter - CARD_WIDTH - SPOUSE_GAP / 2;
          let mX = childCenter + SPOUSE_GAP / 2;

          nodePositions.set(f.id, { x: fX, y: targetY, width: CARD_WIDTH, height: CARD_HEIGHT });
          nodePositions.set(m.id, { x: mX, y: targetY, width: CARD_WIDTH, height: CARD_HEIGHT });
          placedIds.add(f.id);
          placedIds.add(m.id);
        } else if (parents.length === 1) {
          const p = parents[0];
          let pX = childCenter - CARD_WIDTH / 2;
          nodePositions.set(p.id, { x: pX, y: targetY, width: CARD_WIDTH, height: CARD_HEIGHT });
          placedIds.add(p.id);
        }

        placedNew = true;
      });
    }

    // -----------------------------------------------------------------------
    // PASS 2: SPOUSES (同世代：配偶者の横配置)
    // -----------------------------------------------------------------------
    appData.persons.forEach(p => {
      if (placedIds.has(p.id)) {
        const pPos = nodePositions.get(p.id);
        (p.spouses || []).forEach(sid => {
          if (!placedIds.has(sid)) {
            const sp = personMap.get(sid);
            if (sp) {
              const desiredX = pPos.x + CARD_WIDTH + SPOUSE_GAP;
              nodePositions.set(sid, {
                x: desiredX,
                y: pPos.y,
                width: CARD_WIDTH,
                height: CARD_HEIGHT
              });
              placedIds.add(sid);
              placedNew = true;
            }
          }
        });
      }
    });

    // -----------------------------------------------------------------------
    // PASS 3: CHILDREN & SIBLINGS (下の世代・同世代兄弟の配置)
    // -----------------------------------------------------------------------
    appData.persons.forEach(p => {
      if (placedIds.has(p.id)) {
        const pPos = nodePositions.get(p.id);
        (p.children || []).forEach(cid => {
          if (!placedIds.has(cid)) {
            const child = personMap.get(cid);
            if (child) {
              const placedSiblings = (p.children || [])
                .filter(cId => cId !== cid && placedIds.has(cId))
                .map(cId => ({ id: cId, pos: nodePositions.get(cId) }));

              if (placedSiblings.length > 0) {
                placedSiblings.sort((a, b) => a.pos.x - b.pos.x);
                const rowY = placedSiblings[0].pos.y;
                const isOlder = (child.relation && (child.relation.includes('兄') || child.relation.includes('姉') || child.relation.includes('長'))) ||
                                (child.name && (child.name.includes('兄') || child.name.includes('姉') || child.name.includes('長男') || child.name.includes('長女')));

                let chosenX;
                if (isOlder) {
                  chosenX = placedSiblings[0].pos.x - CARD_WIDTH - SIBLING_GAP;
                } else {
                  chosenX = placedSiblings[placedSiblings.length - 1].pos.x + CARD_WIDTH + SIBLING_GAP;
                }

                nodePositions.set(cid, {
                  x: chosenX,
                  y: rowY,
                  width: CARD_WIDTH,
                  height: CARD_HEIGHT
                });
              } else {
                const targetY = pPos.y + lvlHeight;
                let desiredX = pPos.x;
                nodePositions.set(cid, {
                  x: desiredX,
                  y: targetY,
                  width: CARD_WIDTH,
                  height: CARD_HEIGHT
                });
              }

              placedIds.add(cid);
              placedNew = true;
            }
          }
        });
      }
    });
  }

  // -------------------------------------------------------------------------
  // PASS 4: FALLBACK FOR ANY ISOLATED NODES (孤立ノードの世代推定配置)
  // -------------------------------------------------------------------------
  appData.persons.forEach(p => {
    if (!placedIds.has(p.id)) {
      let estimatedY = null;
      if (p.parents && p.parents.some(pid => nodePositions.has(pid))) {
        const pid = p.parents.find(pid => nodePositions.has(pid));
        estimatedY = nodePositions.get(pid).y + lvlHeight;
      } else if (p.spouses && p.spouses.some(sid => nodePositions.has(sid))) {
        const sid = p.spouses.find(sid => nodePositions.has(sid));
        estimatedY = nodePositions.get(sid).y;
      } else if (p.children && p.children.some(cid => nodePositions.has(cid))) {
        const cid = p.children.find(cid => nodePositions.has(cid));
        estimatedY = nodePositions.get(cid).y - lvlHeight;
      }

      if (estimatedY == null) {
        let maxY = 0;
        nodePositions.forEach(pos => { maxY = Math.max(maxY, pos.y + pos.height); });
        estimatedY = maxY + GENERATION_GAP;
      }

      const sameRow = Array.from(nodePositions.values()).filter(pos => Math.abs(pos.y - estimatedY) < 20);
      let maxXOnRow = 60;
      sameRow.forEach(pos => { maxXOnRow = Math.max(maxXOnRow, pos.x + pos.width); });
      nodePositions.set(p.id, {
        x: maxXOnRow + SIBLING_GAP,
        y: estimatedY,
        width: CARD_WIDTH,
        height: CARD_HEIGHT
      });
      placedIds.add(p.id);
    }
  });

  // AUTO-SHIFT DOWNWARDS IF HIGHER ANCESTORS EXIST ABOVE Y=70
  let minY = Infinity;
  nodePositions.forEach(pos => {
    if (pos.y < minY) minY = pos.y;
  });

  if (minY < startY) {
    const shiftY = startY - minY;
    nodePositions.forEach(pos => {
      pos.y += shiftY;
    });
  }

  // -------------------------------------------------------------------------
  // PASS 5: RESOLVE HORIZONTAL OVERLAPS (各行の水平重なり自動解消)
  // -------------------------------------------------------------------------
  const rowGroups = new Map();
  nodePositions.forEach((pos, id) => {
    let foundRowKey = null;
    rowGroups.forEach((nodes, rowY) => {
      if (Math.abs(rowY - pos.y) < 15) foundRowKey = rowY;
    });
    if (foundRowKey == null) {
      foundRowKey = pos.y;
      rowGroups.set(foundRowKey, []);
    }
    rowGroups.get(foundRowKey).push({ id, pos });
  });

  rowGroups.forEach((nodes, rowY) => {
    nodes.sort((a, b) => a.pos.x - b.pos.x);
    for (let i = 0; i < nodes.length - 1; i++) {
      const cur = nodes[i].pos;
      const next = nodes[i + 1].pos;
      const curPerson = personMap.get(nodes[i].id);
      const isCouple = curPerson && curPerson.spouses && curPerson.spouses.includes(nodes[i + 1].id);
      const minGap = isCouple ? SPOUSE_GAP : SIBLING_GAP;
      const minReqX = cur.x + CARD_WIDTH + minGap;
      if (next.x < minReqX) {
        const diff = minReqX - next.x;
        for (let j = i + 1; j < nodes.length; j++) {
          nodes[j].pos.x += diff;
        }
      }
    }
  });

  // Re-center parent couples above their children group if multiple children are placed
  appData.persons.forEach(p => {
    if (p.spouses && p.spouses.length > 0 && p.children && p.children.length > 1) {
      const spId = p.spouses[0];
      if (p.id < spId && nodePositions.has(p.id) && nodePositions.has(spId)) {
        const placedKids = p.children.filter(cid => nodePositions.has(cid));
        if (placedKids.length > 1) {
          const kidXs = placedKids.map(cid => nodePositions.get(cid).x);
          const minK = Math.min(...kidXs);
          const maxK = Math.max(...kidXs) + CARD_WIDTH;
          const kCenter = (minK + maxK) / 2;
          const pPos = nodePositions.get(p.id);
          const sPos = nodePositions.get(spId);
          if (Math.abs(pPos.y - sPos.y) < 10) {
            const leftId = pPos.x < sPos.x ? p.id : spId;
            const rightId = pPos.x < sPos.x ? spId : p.id;
            const newLeftX = kCenter - CARD_WIDTH - SPOUSE_GAP / 2;
            const newRightX = kCenter + SPOUSE_GAP / 2;
            const otherOnRow = Array.from(nodePositions.entries()).filter(([id, pos]) => id !== leftId && id !== rightId && Math.abs(pos.y - pPos.y) < 20);
            const collides = otherOnRow.some(([id, pos]) => 
              (pos.x + CARD_WIDTH > newLeftX - 10 && pos.x < newRightX + CARD_WIDTH + 10)
            );
            if (!collides) {
              nodePositions.get(leftId).x = newLeftX;
              nodePositions.get(rightId).x = newRightX;
            }
          }
        }
      }
    }
  });

  // =========================================================================
  // APPLY USER CUSTOM DRAG POSITIONS (手動ドラッグ微調整位置の反映)
  // =========================================================================
  appData.persons.forEach(p => {
    if (p.customX != null && p.customY != null && nodePositions.has(p.id)) {
      const pos = nodePositions.get(p.id);
      pos.x = p.customX;
      pos.y = p.customY;
    }
  });

  // =========================================================================
  // UNIVERSAL MARRIAGE LINE & PARENT-CHILD CONNECTOR GENERATION
  // (全婚姻線と兄弟・親子の完全統一描画)
  // =========================================================================
  handledCoupleKeys.clear();

  // 1. Marriage Lines (Couples)
  appData.persons.forEach(p => {
    const pos1 = nodePositions.get(p.id);
    if (!pos1) return;
    (p.spouses || []).forEach(sid => {
      const pos2 = nodePositions.get(sid);
      if (!pos2) return;
      const key = [p.id, sid].sort().join('_');
      if (handledCoupleKeys.has(key)) return;
      handledCoupleKeys.add(key);

      const left = pos1.x < pos2.x ? pos1 : pos2;
      const right = pos1.x < pos2.x ? pos2 : pos1;
      if (Math.abs(left.y - right.y) < CARD_HEIGHT / 2) {
        connectorJobs.push({
          type: 'couple',
          p1Id: p.id,
          p2Id: sid,
          y: (left.y + right.y) / 2 + CARD_HEIGHT / 2,
          x1: left.x + CARD_WIDTH,
          x2: right.x
        });
      }
    });
  });

  // Helper to find canonical parent unit
  function getParentUnit(child) {
    if (!child.parents || child.parents.length === 0) return null;
    const placedParents = child.parents.filter(pid => nodePositions.has(pid));
    if (placedParents.length === 0) return null;

    if (placedParents.length >= 2) {
      const pIds = placedParents.slice(0, 2).sort();
      return { key: pIds.join('_'), parentIds: pIds, isCouple: true };
    }

    const p1 = personMap.get(placedParents[0]);
    if (p1 && p1.spouses) {
      const placedSpouse = p1.spouses.find(sid => nodePositions.has(sid));
      if (placedSpouse) {
        const pIds = [p1.id, placedSpouse].sort();
        return { key: pIds.join('_'), parentIds: pIds, isCouple: true };
      }
    }
    return { key: placedParents[0], parentIds: [placedParents[0]], isCouple: false };
  }

  // 2. Group all children by Parent Unit
  const unitMap = new Map();
  appData.persons.forEach(child => {
    const pos = nodePositions.get(child.id);
    if (!pos) return;
    const unit = getParentUnit(child);
    if (!unit) return;

    if (!unitMap.has(unit.key)) {
      unitMap.set(unit.key, { unit, children: [] });
    }
    unitMap.get(unit.key).children.push(child);
  });

  // 3. Build parent-child connector jobs
  unitMap.forEach(({ unit, children }) => {
    if (children.length === 0) return;

    let parentMidX, parentStartY;
    const pPositions = unit.parentIds.map(pid => nodePositions.get(pid)).filter(Boolean);
    if (pPositions.length === 0) return;

    if (unit.isCouple && pPositions.length >= 2) {
      const left = pPositions[0].x < pPositions[1].x ? pPositions[0] : pPositions[1];
      const right = pPositions[0].x < pPositions[1].x ? pPositions[1] : pPositions[0];
      parentMidX = (left.x + CARD_WIDTH + right.x) / 2;
      parentStartY = (left.y + right.y) / 2 + CARD_HEIGHT / 2; // EXACT MARRIAGE LINE!
    } else {
      parentMidX = pPositions[0].x + CARD_WIDTH / 2;
      parentStartY = pPositions[0].y + CARD_HEIGHT; // Bottom of card
    }

    // Sort children left-to-right by X
    children.sort((a, b) => (nodePositions.get(a.id).x - nodePositions.get(b.id).x));
    const childItems = children.map(c => {
      const cPos = nodePositions.get(c.id);
      return { id: c.id, x: cPos.x + CARD_WIDTH / 2, y: cPos.y };
    });

    const minChildY = Math.min(...childItems.map(c => c.y));
    const forkY = (parentStartY + minChildY) / 2;

    if (childItems.length === 1) {
      connectorJobs.push({
        type: 'drop_to_child',
        parentIds: unit.parentIds,
        childId: childItems[0].id,
        fromX: parentMidX,
        fromY: parentStartY,
        toX: childItems[0].x,
        toY: childItems[0].y
      });
    } else {
      const childXs = childItems.map(c => c.x);
      connectorJobs.push({
        type: 'children_fork',
        parentIds: unit.parentIds,
        childIds: childItems.map(c => c.id),
        parentMidX: parentMidX,
        parentStartY: parentStartY,
        forkY: forkY,
        minChildX: Math.min(parentMidX, ...childXs),
        maxChildX: Math.max(parentMidX, ...childXs),
        childMidXs: childXs,
        childTopY: minChildY,
        children: childItems
      });
    }
  });

  // Calculate canvas dimensions
  let maxX = 0, maxY = 0;
  nodePositions.forEach(pos => {
    maxX = Math.max(maxX, pos.x + pos.width);
    maxY = Math.max(maxY, pos.y + pos.height);
  });

  const canvasW = Math.max(maxX + 100, 2400);
  const canvasH = Math.max(maxY + 120, 1400);
  cardsContainer.style.width = `${canvasW}px`;
  cardsContainer.style.height = `${canvasH}px`;
  svg.setAttribute("width", canvasW);
  svg.setAttribute("height", canvasH);

  // Render cards
  cardsContainer.innerHTML = "";
  nodePositions.forEach((pos, pid) => {
    const person = personMap.get(pid);
    if (person) {
      const cardEl = createPersonCardElement(person, pos);
      if (person.id === appData.focusPersonId || (!appData.focusPersonId && person.id === 'p_koichi')) {
        cardEl.classList.add('focus-person');
      }
      cardsContainer.appendChild(cardEl);
    }
  });

  window._activeNodePositions = nodePositions;
  window._activeConnectorJobs = connectorJobs;
  // Render connectors
  drawSvgConnectors(connectorJobs, svg);

  // DYNAMIC GENERATION MARKERS
  const distinctYs = Array.from(new Set(Array.from(nodePositions.values()).map(p => p.y))).sort((a, b) => a - b);
  const koichiPos = koichi ? nodePositions.get(koichi.id) : null;
  const focusY = koichiPos ? koichiPos.y : (distinctYs[distinctYs.length - 2] || distinctYs[0]);

  const genMarkerYs = [];
  const genMarkerLabels = [];

  distinctYs.forEach((y, idx) => {
    const diff = Math.round((y - focusY) / lvlHeight);
    let label = "";
    const isTop = (idx === 0);

    if (diff === 0) label = "当代（ご本人 / 兄弟姉妹）";
    else if (diff === 1) label = "次代（お子様）";
    else if (diff === 2) label = "二代後（お孫様）";
    else if (diff === -1) label = "二代前（祖父母 / ご両親・伯叔父母）";
    else if (diff === -2) label = isTop ? "初代（曾祖父母）" : "三代前（曾祖父母）";
    else if (diff === -3) label = isTop ? "初代（高祖父母）" : "四代前（高祖父母）";
    else {
      const genNum = Math.abs(diff) + 1;
      label = isTop ? `初代（${genNum}代前祖先）` : `${genNum}代前祖先`;
    }

    genMarkerYs.push(y);
    genMarkerLabels.push(label);
  });

  renderGenerationMarkers(cardsContainer, genMarkerYs, genMarkerLabels);
}

function renderDescendantLayout(personMap, cardsContainer, svg) {
  const levels = new Map();
  function getLevel(id, visited = new Set()) {
    if (levels.has(id)) return levels.get(id);
    if (visited.has(id)) return 0;
    visited.add(id);

    const person = personMap.get(id);
    if (!person || !person.parents || person.parents.length === 0) {
      levels.set(id, 0);
      return 0;
    }

    let maxParentLevel = -1;
    person.parents.forEach(pid => {
      maxParentLevel = Math.max(maxParentLevel, getLevel(pid, visited));
    });
    const lvl = maxParentLevel + 1;
    levels.set(id, lvl);
    return lvl;
  }

  appData.persons.forEach(p => getLevel(p.id));

  appData.persons.forEach(p => {
    const myLvl = levels.get(p.id) || 0;
    p.spouses.forEach(sid => {
      const spLvl = levels.get(sid) || 0;
      const maxL = Math.max(myLvl, spLvl);
      levels.set(p.id, maxL);
      levels.set(sid, maxL);
    });
  });

  const placedPersons = new Set();
  const nodePositions = new Map();
  const connectorJobs = [];

  const rootPersons = appData.persons.filter(p => p.parents.length === 0);
  const rootUnits = [];
  const rootVisited = new Set();

  rootPersons.forEach(p => {
    if (rootVisited.has(p.id)) return;
    rootVisited.add(p.id);
    const unit = { primary: p, spouse: null, children: [] };
    if (p.spouses && p.spouses.length > 0) {
      const spId = p.spouses[0];
      const spouse = personMap.get(spId);
      if (spouse && rootPersons.includes(spouse)) {
        unit.spouse = spouse;
        rootVisited.add(spId);
      }
    }
    const childIds = new Set(p.children || []);
    if (unit.spouse && unit.spouse.children) {
      unit.spouse.children.forEach(cid => childIds.add(cid));
    }
    unit.children = Array.from(childIds).map(cid => personMap.get(cid)).filter(Boolean);
    rootUnits.push(unit);
  });

  rootPersons.forEach(p => {
    if (!rootVisited.has(p.id)) {
      rootVisited.add(p.id);
      rootUnits.push({
        primary: p,
        spouse: null,
        children: (p.children || []).map(cid => personMap.get(cid)).filter(Boolean)
      });
    }
  });

  function layoutUnitTree(personId, spouseId, currentLevel, startX) {
    const primary = personMap.get(personId);
    const spouse = spouseId ? personMap.get(spouseId) : null;
    if (!primary) return { width: 0, childrenMidX: startX };

    const childIds = new Set(primary.children || []);
    if (spouse && spouse.children) {
      spouse.children.forEach(cid => childIds.add(cid));
    }
    const children = Array.from(childIds).map(cid => personMap.get(cid)).filter(Boolean);

    const hasSpouse = !!spouse;
    const unitCardWidth = hasSpouse ? (CARD_WIDTH * 2 + SPOUSE_GAP) : CARD_WIDTH;
    const currentY = currentLevel * (CARD_HEIGHT + GENERATION_GAP) + 60;

    let childrenTotalWidth = 0;
    const childLayouts = [];
    let curChildX = startX;

    if (children.length > 0) {
      const visitedChild = new Set();
      children.forEach((c) => {
        if (visitedChild.has(c.id)) return;
        visitedChild.add(c.id);

        let cSpouseId = null;
        if (c.spouses && c.spouses.length > 0) {
          cSpouseId = c.spouses[0];
          visitedChild.add(cSpouseId);
        }

        const res = layoutUnitTree(c.id, cSpouseId, currentLevel + 1, curChildX);
        childLayouts.push({
          child: c,
          childSpouse: cSpouseId ? personMap.get(cSpouseId) : null,
          layout: res,
          x: curChildX
        });
        curChildX += res.width + SIBLING_GAP;
      });

      childrenTotalWidth = curChildX - startX - (childLayouts.length > 0 ? SIBLING_GAP : 0);
    }

    const totalWidth = Math.max(unitCardWidth, childrenTotalWidth);

    let parentStartX = startX;
    if (totalWidth > unitCardWidth) {
      parentStartX = startX + (totalWidth - unitCardWidth) / 2;
    }

    nodePositions.set(primary.id, {
      x: parentStartX,
      y: currentY,
      width: CARD_WIDTH,
      height: CARD_HEIGHT
    });
    placedPersons.add(primary.id);

    let spousePosX = null;
    if (hasSpouse) {
      spousePosX = parentStartX + CARD_WIDTH + SPOUSE_GAP;
      nodePositions.set(spouse.id, {
        x: spousePosX,
        y: currentY,
        width: CARD_WIDTH,
        height: CARD_HEIGHT
      });
      placedPersons.add(spouse.id);

      connectorJobs.push({
        type: "couple",
        p1Id: primary.id,
        p2Id: spouse.id,
        y: currentY + CARD_HEIGHT / 2,
        x1: parentStartX + CARD_WIDTH,
        x2: spousePosX
      });
    }

    if (children.length > 0 && childLayouts.length > 0) {
      const parentMidX = hasSpouse ? (parentStartX + CARD_WIDTH + SPOUSE_GAP / 2) : (parentStartX + CARD_WIDTH / 2);
      const parentBottomY = currentY + CARD_HEIGHT;
      const forkY = currentY + CARD_HEIGHT + (GENERATION_GAP / 2);

      const childMidXs = childLayouts.map(cl => {
        const cPos = nodePositions.get(cl.child.id);
        return cPos ? (cPos.x + CARD_WIDTH / 2) : (cl.x + CARD_WIDTH / 2);
      });

      connectorJobs.push({
        type: "children_fork",
        parentMidX,
        parentBottomY,
        forkY,
        minChildX: Math.min(...childMidXs),
        maxChildX: Math.max(...childMidXs),
        childMidXs,
        childTopY: (currentLevel + 1) * (CARD_HEIGHT + GENERATION_GAP) + 60
      });
    }

    return { width: totalWidth, midX: parentStartX + unitCardWidth / 2 };
  }

  let currentStartX = 60;
  rootUnits.forEach(ru => {
    const res = layoutUnitTree(ru.primary.id, ru.spouse ? ru.spouse.id : null, 0, currentStartX);
    currentStartX += res.width + SIBLING_GAP * 2;
  });

  appData.persons.forEach(p => {
    if (!placedPersons.has(p.id)) {
      const lvl = levels.get(p.id) || 0;
      const y = lvl * (CARD_HEIGHT + GENERATION_GAP) + 60;
      nodePositions.set(p.id, { x: currentStartX, y: y, width: CARD_WIDTH, height: CARD_HEIGHT });
      placedPersons.add(p.id);
      currentStartX += CARD_WIDTH + SIBLING_GAP;
    }
  });

  appData.persons.forEach(person => {
    const pos = nodePositions.get(person.id);
    if (!pos) return;
    const cardEl = createPersonCardElement(person, pos);
    cardsContainer.appendChild(cardEl);
  });

  drawSvgConnectors(connectorJobs, svg);

  const maxLvl = Math.max(...Array.from(levels.values()), 0);
  const genLabels = ["第一世代 (祖父母)", "第二世代 (親・伯叔父)", "第三世代 (子・甥姪)", "第四世代 (孫)", "第五世代 (曾孫)"];
  for (let lvl = 0; lvl <= maxLvl; lvl++) {
    const y = lvl * (CARD_HEIGHT + GENERATION_GAP) + 60;
    const marker = document.createElement("div");
    marker.className = "generation-marker";
    marker.style.left = "16px";
    marker.style.top = `${y - 28}px`;
    marker.textContent = genLabels[lvl] || `第${lvl + 1}世代`;
    cardsContainer.appendChild(marker);
  }
}
