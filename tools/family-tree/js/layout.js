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

  const SIBLING_GAP_L1 = 18;
  const COUPLE_INTER_GAP = 46;
  const BRANCH_GAP = 60;

  // -------------------------------------------------------------------------
  // STEP 1: 全人物の世代レベル (Generation Level) を双方向BFSで完全に決定
  // -------------------------------------------------------------------------
  const levels = new Map();
  const rootId1 = koichi ? koichi.id : (appData.persons[0] ? appData.persons[0].id : null);
  const rootId2 = yoko ? yoko.id : null;
  if (rootId1) levels.set(rootId1, 2);
  if (rootId2) levels.set(rootId2, 2);

  let lvlChanged = true;
  while (lvlChanged) {
    lvlChanged = false;
    appData.persons.forEach(p => {
      const curLvl = levels.get(p.id);
      if (curLvl !== undefined) {
        (p.spouses || []).forEach(sid => {
          if (!levels.has(sid)) { levels.set(sid, curLvl); lvlChanged = true; }
        });
        (p.parents || []).forEach(parentId => {
          if (!levels.has(parentId)) { levels.set(parentId, curLvl - 1); lvlChanged = true; }
        });
        (p.children || []).forEach(cid => {
          if (!levels.has(cid)) { levels.set(cid, curLvl + 1); lvlChanged = true; }
        });
      } else {
        for (const sid of (p.spouses || [])) {
          if (levels.has(sid)) { levels.set(p.id, levels.get(sid)); lvlChanged = true; break; }
        }
        if (!levels.has(p.id)) {
          for (const parentId of (p.parents || [])) {
            if (levels.has(parentId)) { levels.set(p.id, levels.get(parentId) + 1); lvlChanged = true; break; }
          }
        }
        if (!levels.has(p.id)) {
          for (const cid of (p.children || [])) {
            if (levels.has(cid)) { levels.set(p.id, levels.get(cid) - 1); lvlChanged = true; break; }
          }
        }
      }
    });
  }

  // 孤立ノード fallback
  appData.persons.forEach(p => {
    if (!levels.has(p.id)) levels.set(p.id, 0);
  });

  const minLvl = Math.min(...Array.from(levels.values()));
  const levelY = new Map();
  levels.forEach((lvl, pid) => {
    if (!levelY.has(lvl)) {
      levelY.set(lvl, startY + (lvl - minLvl) * lvlHeight);
    }
  });

  const yL_minus_1 = levelY.get(-1) || startY;
  const yL0 = levelY.get(0) || (startY + lvlHeight);
  const yL1 = levelY.get(1) || (startY + lvlHeight * 2);
  const yL2 = levelY.get(2) || (startY + lvlHeight * 3);
  const yL3 = levelY.get(3) || (startY + lvlHeight * 4);

  // -------------------------------------------------------------------------
  // STEP 2: Level 1 の子供たち ＆ 小笠原家（夫系）基本骨格の配置
  // -------------------------------------------------------------------------
  let curX = 60;

  // 1. 小笠原兄弟 7名
  const ogaKidMidXs = [];
  ogaChildren.forEach(child => {
    nodePositions.set(child.id, { x: curX, y: yL1, width: CARD_WIDTH, height: CARD_HEIGHT });
    placedIds.add(child.id);
    ogaKidMidXs.push(curX + CARD_WIDTH / 2);
    curX += CARD_WIDTH + SIBLING_GAP_L1;
  });
  if (ogaChildren.length > 0) curX -= SIBLING_GAP_L1;
  const ogaKidsMid = ogaKidMidXs.length > 0 ? (ogaKidMidXs[0] + ogaKidMidXs[ogaKidMidXs.length - 1]) / 2 : curX;

  // 小笠原祖父母 (Level 0)
  if (oga_gp_f || oga_gp_m) {
    const ogaF_X = ogaKidsMid - CARD_WIDTH - SPOUSE_GAP / 2;
    const ogaM_X = ogaKidsMid + SPOUSE_GAP / 2;
    if (oga_gp_f) {
      nodePositions.set(oga_gp_f.id, { x: ogaF_X, y: yL0, width: CARD_WIDTH, height: CARD_HEIGHT });
      placedIds.add(oga_gp_f.id);
    }
    if (oga_gp_m) {
      nodePositions.set(oga_gp_m.id, { x: ogaM_X, y: yL0, width: CARD_WIDTH, height: CARD_HEIGHT });
      placedIds.add(oga_gp_m.id);
    }
  }

  const ogaRightEdge = Math.max(curX, (oga_gp_m && nodePositions.has(oga_gp_m.id)) ? nodePositions.get(oga_gp_m.id).x + CARD_WIDTH : curX);

  // -------------------------------------------------------------------------
  // STEP 3: 今井家と小笠原家の間に挟まる外戚・兄弟ブロックのトポロジカル配置
  // (神谷美恵子 ─ 前田陽一 ⚭ 今井妹 ─ 今井兄)
  // -------------------------------------------------------------------------
  const intermediateNodes = [
    { id: 'p465905', gapAfter: SIBLING_GAP },
    { id: 'p860543', gapAfter: SPOUSE_GAP },
    { id: 'p138813', gapAfter: SIBLING_GAP },
    { id: 'p325114', gapAfter: SIBLING_GAP }
  ];

  let interStartX = ogaRightEdge + BRANCH_GAP;
  intermediateNodes.forEach(item => {
    if (personMap.has(item.id)) {
      nodePositions.set(item.id, { x: interStartX, y: yL0, width: CARD_WIDTH, height: CARD_HEIGHT });
      placedIds.add(item.id);
      interStartX += CARD_WIDTH + item.gapAfter;
    }
  });

  // -------------------------------------------------------------------------
  // STEP 4: 今井家ブロック (今井退蔵 ⚭ 今井たね ＆ Level 1 子供たち)
  // -------------------------------------------------------------------------
  const taizoX = interStartX;
  const taneX = taizoX + CARD_WIDTH + SPOUSE_GAP;
  if (taizo) {
    nodePositions.set(taizo.id, { x: taizoX, y: yL0, width: CARD_WIDTH, height: CARD_HEIGHT });
    placedIds.add(taizo.id);
  }
  if (tane) {
    nodePositions.set(tane.id, { x: taneX, y: yL0, width: CARD_WIDTH, height: CARD_HEIGHT });
    placedIds.add(tane.id);
  }

  const imaiCoupleMid = (taizoX + CARD_WIDTH + taneX) / 2;

  // Level 1: 今井子供たち (ゑみ子、地平、洋子)
  const imaiKidsW = imaiChildren.length * CARD_WIDTH + (imaiChildren.length - 1) * SIBLING_GAP_L1;
  let imaiKidsStartX = Math.max(curX + COUPLE_INTER_GAP, imaiCoupleMid - imaiKidsW / 2);
  const imaiKidMidXs = [];
  imaiChildren.forEach(child => {
    nodePositions.set(child.id, { x: imaiKidsStartX, y: yL1, width: CARD_WIDTH, height: CARD_HEIGHT });
    placedIds.add(child.id);
    imaiKidMidXs.push(imaiKidsStartX + CARD_WIDTH / 2);
    imaiKidsStartX += CARD_WIDTH + SIBLING_GAP_L1;
  });
  if (imaiChildren.length > 0) imaiKidsStartX -= SIBLING_GAP_L1;

  // -------------------------------------------------------------------------
  // STEP 5: 松田家ブロック (松田11人兄弟 ＆ 松田祖父母)
  // -------------------------------------------------------------------------
  let matsudaStartX = Math.max(taneX + CARD_WIDTH + BRANCH_GAP, imaiKidsStartX + BRANCH_GAP);
  const matsudaKidMidXs = [];
  matsudaChildren.forEach(child => {
    nodePositions.set(child.id, { x: matsudaStartX, y: yL1, width: CARD_WIDTH, height: CARD_HEIGHT });
    placedIds.add(child.id);
    matsudaKidMidXs.push(matsudaStartX + CARD_WIDTH / 2);
    matsudaStartX += CARD_WIDTH + SIBLING_GAP_L1;
  });
  if (matsudaChildren.length > 0) matsudaStartX -= SIBLING_GAP_L1;
  const matsudaKidsMid = matsudaKidMidXs.length > 0 ? (matsudaKidMidXs[0] + matsudaKidMidXs[matsudaKidMidXs.length - 1]) / 2 : matsudaStartX;

  // 松田祖父母 (Level 0)
  if (matsuda_gp_f || matsuda_gp_m) {
    const matsudaF_X = matsudaKidsMid - CARD_WIDTH - SPOUSE_GAP / 2;
    const matsudaM_X = matsudaKidsMid + SPOUSE_GAP / 2;
    if (matsuda_gp_f) {
      nodePositions.set(matsuda_gp_f.id, { x: matsudaF_X, y: yL0, width: CARD_WIDTH, height: CARD_HEIGHT });
      placedIds.add(matsuda_gp_f.id);
    }
    if (matsuda_gp_m) {
      nodePositions.set(matsuda_gp_m.id, { x: matsudaM_X, y: yL0, width: CARD_WIDTH, height: CARD_HEIGHT });
      placedIds.add(matsuda_gp_m.id);
    }
  }

  // -------------------------------------------------------------------------
  // STEP 6: 佐田家ブロック (仁子 ＆ 佐田衛夫妻)
  // -------------------------------------------------------------------------
  let sadaeStartX = Math.max(
    (matsuda_gp_m && nodePositions.has(matsuda_gp_m.id)) ? nodePositions.get(matsuda_gp_m.id).x + CARD_WIDTH + BRANCH_GAP : matsudaStartX + COUPLE_INTER_GAP,
    matsudaStartX + COUPLE_INTER_GAP
  );
  sadaeChildren.forEach(child => {
    nodePositions.set(child.id, { x: sadaeStartX, y: yL1, width: CARD_WIDTH, height: CARD_HEIGHT });
    placedIds.add(child.id);
    sadaeStartX += CARD_WIDTH + SIBLING_GAP_L1;
  });
  const satokoPos = satoko ? nodePositions.get(satoko.id) : null;
  const satokoMid = satokoPos ? satokoPos.x + CARD_WIDTH / 2 : sadaeStartX;

  // 佐田衛夫妻 (Level 0)
  if (sadae_f || sadae) {
    const sadaeF_X = satokoMid - CARD_WIDTH - SPOUSE_GAP / 2;
    const sadaeM_X = satokoMid + SPOUSE_GAP / 2;
    if (sadae_f) {
      nodePositions.set(sadae_f.id, { x: sadaeF_X, y: yL0, width: CARD_WIDTH, height: CARD_HEIGHT });
      placedIds.add(sadae_f.id);
    }
    if (sadae) {
      nodePositions.set(sadae.id, { x: sadaeM_X, y: yL0, width: CARD_WIDTH, height: CARD_HEIGHT });
      placedIds.add(sadae.id);
    }
  }

  // -------------------------------------------------------------------------
  // STEP 7: Level -1 親ノードの重心配置 (Barycentric Alignment)
  // -------------------------------------------------------------------------
  // 前田多門 -> 前田陽一 ＆ 神谷美恵子の中心真上
  if (personMap.has('p620845')) {
    const p1 = nodePositions.get('p465905');
    const p2 = nodePositions.get('p860543');
    if (p1 && p2) {
      const maedaMid = (p1.x + p2.x + CARD_WIDTH) / 2;
      nodePositions.set('p620845', { x: maedaMid - CARD_WIDTH / 2, y: yL_minus_1, width: CARD_WIDTH, height: CARD_HEIGHT });
      placedIds.add('p620845');
    }
  }

  // 今井家(父) ⚭ 今井家母 -> 今井妹, 兄, 退蔵の中心真上
  if (personMap.has('p553798') && personMap.has('p27110')) {
    const pSister = nodePositions.get('p138813');
    const pTaizo = nodePositions.get('p_taizo_imai');
    if (pSister && pTaizo) {
      const imaiSiblingsMid = (pSister.x + pTaizo.x + CARD_WIDTH) / 2;
      nodePositions.set('p553798', { x: imaiSiblingsMid - CARD_WIDTH - SPOUSE_GAP / 2, y: yL_minus_1, width: CARD_WIDTH, height: CARD_HEIGHT });
      nodePositions.set('p27110', { x: imaiSiblingsMid + SPOUSE_GAP / 2, y: yL_minus_1, width: CARD_WIDTH, height: CARD_HEIGHT });
      placedIds.add('p553798');
      placedIds.add('p27110');
    }
  }

  // -------------------------------------------------------------------------
  // STEP 8: Level 2 & Level 3 の重心配置
  // -------------------------------------------------------------------------
  const posMinato = minato ? nodePositions.get(minato.id) : null;
  const posEmiko = emiko ? nodePositions.get(emiko.id) : null;
  let minatoEmikoMid = (ogaKidsMid + imaiCoupleMid) / 2;
  if (posMinato && posEmiko) {
    minatoEmikoMid = (posMinato.x + CARD_WIDTH + posEmiko.x) / 2;
  }

  const posIchiro = ichiro ? nodePositions.get(ichiro.id) : null;
  const posSatoko = satoko ? nodePositions.get(satoko.id) : null;
  let ichiroSatokoMid = (matsudaKidsMid + satokoMid) / 2;
  if (posIchiro && posSatoko) {
    ichiroSatokoMid = (posIchiro.x + CARD_WIDTH + posSatoko.x) / 2;
  }

  // Level 2: 更一 ＆ 妹洋子
  const minatoKidsW = minatoChildren.length * CARD_WIDTH + (minatoChildren.length - 1) * SIBLING_GAP;
  let curMinatoKidX = minatoEmikoMid - minatoKidsW / 2;
  minatoChildren.forEach(child => {
    nodePositions.set(child.id, { x: curMinatoKidX, y: yL2, width: CARD_WIDTH, height: CARD_HEIGHT });
    placedIds.add(child.id);
    curMinatoKidX += CARD_WIDTH + SIBLING_GAP;
  });

  // Level 2: 陽子 ＆ 健太郎
  const ichiroKidsW = ichiroChildren.length * CARD_WIDTH + (ichiroChildren.length - 1) * SIBLING_GAP;
  let curIchiroKidX = ichiroSatokoMid - ichiroKidsW / 2;
  ichiroChildren.forEach(child => {
    nodePositions.set(child.id, { x: curIchiroKidX, y: yL2, width: CARD_WIDTH, height: CARD_HEIGHT });
    placedIds.add(child.id);
    curIchiroKidX += CARD_WIDTH + SIBLING_GAP;
  });

  // Level 3: 陸 ＆ こころ
  const posKoichi = koichi ? nodePositions.get(koichi.id) : null;
  const posYoko = yoko ? nodePositions.get(yoko.id) : null;
  let koichiYokoMid = (minatoEmikoMid + ichiroSatokoMid) / 2;
  if (posKoichi && posYoko) {
    koichiYokoMid = (posKoichi.x + CARD_WIDTH + posYoko.x) / 2;
  }

  const koichiKidsW = koichiChildren.length * CARD_WIDTH + (koichiChildren.length - 1) * SIBLING_GAP;
  let curKoichiKidX = koichiYokoMid - koichiKidsW / 2;
  koichiChildren.forEach(child => {
    nodePositions.set(child.id, { x: curKoichiKidX, y: yL3, width: CARD_WIDTH, height: CARD_HEIGHT });
    placedIds.add(child.id);
    curKoichiKidX += CARD_WIDTH + SIBLING_GAP;
  });

  // -------------------------------------------------------------------------
  // STEP 9: UNIFIED MULTI-PASS PROPAGATION FOR UNPLACED / EXTENDED RELATIVES
  // (追加親族や遠縁の汎用伝播配置)
  // -------------------------------------------------------------------------
  let placedNew = true;
  let propIter = 0;
  while (placedNew && propIter < 20) {
    placedNew = false;
    propIter++;

    // 親の配置
    appData.persons.forEach(p => {
      if (placedIds.has(p.id) && p.parents && p.parents.length > 0) {
        const unplaced = p.parents.filter(pid => !placedIds.has(pid));
        if (unplaced.length > 0) {
          const pPos = nodePositions.get(p.id);
          const targetY = pPos.y - lvlHeight;
          unplaced.forEach((parentId, idx) => {
            const desiredX = pPos.x + idx * (CARD_WIDTH + SPOUSE_GAP);
            nodePositions.set(parentId, { x: desiredX, y: targetY, width: CARD_WIDTH, height: CARD_HEIGHT });
            placedIds.add(parentId);
            placedNew = true;
          });
        }
      }
    });

    // 配偶者の配置
    appData.persons.forEach(p => {
      if (placedIds.has(p.id)) {
        const pPos = nodePositions.get(p.id);
        (p.spouses || []).forEach(sid => {
          if (!placedIds.has(sid)) {
            const desiredX = pPos.x + CARD_WIDTH + SPOUSE_GAP;
            nodePositions.set(sid, { x: desiredX, y: pPos.y, width: CARD_WIDTH, height: CARD_HEIGHT });
            placedIds.add(sid);
            placedNew = true;
          }
        });
      }
    });

    // 子供の配置
    appData.persons.forEach(p => {
      if (placedIds.has(p.id)) {
        const pPos = nodePositions.get(p.id);
        (p.children || []).forEach(cid => {
          if (!placedIds.has(cid)) {
            const targetY = pPos.y + lvlHeight;
            let maxXOnRow = pPos.x;
            nodePositions.forEach(pos => {
              if (Math.abs(pos.y - targetY) < 20) {
                maxXOnRow = Math.max(maxXOnRow, pos.x + pos.width);
              }
            });
            nodePositions.set(cid, { x: maxXOnRow + SIBLING_GAP, y: targetY, width: CARD_WIDTH, height: CARD_HEIGHT });
            placedIds.add(cid);
            placedNew = true;
          }
        });
      }
    });
  }

  // -------------------------------------------------------------------------
  // STEP 10: 孤立ノードの最終フォールバック
  // -------------------------------------------------------------------------
  appData.persons.forEach(p => {
    if (!placedIds.has(p.id)) {
      const lvl = levels.get(p.id) || 0;
      const targetY = levelY.get(lvl) || (startY + lvlHeight);
      let maxXOnRow = 60;
      nodePositions.forEach(pos => {
        if (Math.abs(pos.y - targetY) < 20) {
          maxXOnRow = Math.max(maxXOnRow, pos.x + pos.width);
        }
      });
      nodePositions.set(p.id, { x: maxXOnRow + SIBLING_GAP, y: targetY, width: CARD_WIDTH, height: CARD_HEIGHT });
      placedIds.add(p.id);
    }
  });

  // -------------------------------------------------------------------------
  // STEP 11: 水平重なり自動解消 (Overlap Resolution)
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
