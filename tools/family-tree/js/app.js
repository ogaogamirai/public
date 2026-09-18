/**
 * Initialize Application
 */
function initApp() {
  const saved = localStorage.getItem("familytree_studio_data");
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (parsed.persons && parsed.persons.some(p => p.id === "p_koichi") && parsed.persons.some(p => p.id === "p_matsuda_sib_1")) {
        appData = parsed;
      } else {
        appData = JSON.parse(JSON.stringify(OGASAWARA_ACTUAL_DATA));
      }
    } catch(e) {
      console.warn("Failed to parse saved data, loading default", e);
      appData = JSON.parse(JSON.stringify(OGASAWARA_ACTUAL_DATA));
    }
  } else {
    appData = JSON.parse(JSON.stringify(OGASAWARA_ACTUAL_DATA));
  }

  if (!appData.layoutMode) {
    appData.layoutMode = "ancestry";
  }

  setupHeaderControls();
  setupPanZoom();
  setupModals();
  setupSidebar();

  applyTheme(appData.theme || "japanese");
  document.getElementById("doc-title-input").value = appData.title || "小笠原家 系譜図";
  document.getElementById("doc-subtitle-input").value = appData.subtitle || "";
  document.getElementById("layout-mode-select").value = appData.layoutMode || "ancestry";

  renderTree();
  updateJsonTextarea();
  centerTreeInViewport();
}

function applyTheme(themeName) {
  document.body.className = `theme-${themeName}`;
  const select = document.getElementById("theme-select");
  if (select) select.value = themeName;
  if (appData) appData.theme = themeName;
}

function setupHeaderControls() {
  const docTitleInput = document.getElementById("doc-title-input");
  const docSubtitleInput = document.getElementById("doc-subtitle-input");
  const layoutModeSelect = document.getElementById("layout-mode-select");
  const themeSelect = document.getElementById("theme-select");
  const btnAddPerson = document.getElementById("btn-add-person");
  const fileMenuSelect = document.getElementById("file-menu-select");
  const fileInputHidden = document.getElementById("file-input-hidden");
  const btnOpenPrint = document.getElementById("btn-open-print");

  docTitleInput.addEventListener("input", (e) => {
    appData.title = e.target.value;
    document.getElementById("print-doc-title").textContent = e.target.value;
    saveDataDebounced();
  });

  docSubtitleInput.addEventListener("input", (e) => {
    appData.subtitle = e.target.value;
    document.getElementById("print-doc-subtitle").textContent = e.target.value;
    saveDataDebounced();
  });

  layoutModeSelect.addEventListener("change", (e) => {
    appData.layoutMode = e.target.value;
    saveDataDebounced();
    renderTree();
    centerTreeInViewport();
    showToast(e.target.value === "ancestry" ? "4代祖先系譜モードに切り替えました" : "子孫展開モードに切り替えました");
  });

  themeSelect.addEventListener("change", (e) => {
    applyTheme(e.target.value);
    saveDataDebounced();
  });

  btnAddPerson.addEventListener("click", () => {
    openPersonModal(null);
  });

  const btnResetLayout = document.getElementById("btn-reset-layout");
  if (btnResetLayout) {
    btnResetLayout.addEventListener("click", () => {
      if (confirm("手動でドラッグ移動した位置をリセットし、家系図の自動整列に戻しますか？")) {
        (appData.persons || appData.people || []).forEach(p => {
          delete p.customX;
          delete p.customY;
        });
        saveData();
        renderTree();
        showToast("自動整列レイアウトにリセットしました");
      }
    });
  }

  fileMenuSelect.addEventListener("change", (e) => {
    const val = e.target.value;
    e.target.value = "";
    if (val === "load-ogasawara-actual") {
      if (confirm("小笠原更一 家系図（本家・両家4代系譜）を読み込みますか？")) {
        appData = JSON.parse(JSON.stringify(OGASAWARA_ACTUAL_DATA));
        applyTheme(appData.theme || "japanese");
        document.getElementById("doc-title-input").value = appData.title;
        document.getElementById("doc-subtitle-input").value = appData.subtitle;
        document.getElementById("layout-mode-select").value = appData.layoutMode || "ancestry";
        saveData();
        renderTree();
        updateJsonTextarea();
        centerTreeInViewport();
        showToast("小笠原家 系譜図を読み込みました");
      }
    } else if (val === "load-sample") {
      if (confirm("山田家 三代系図を読み込みますか？")) {
        appData = JSON.parse(JSON.stringify(YAMADA_3GEN_DATA));
        appData.layoutMode = "descendant";
        applyTheme(appData.theme || "japanese");
        document.getElementById("doc-title-input").value = appData.title;
        document.getElementById("doc-subtitle-input").value = appData.subtitle;
        document.getElementById("layout-mode-select").value = "descendant";
        saveData();
        renderTree();
        updateJsonTextarea();
        centerTreeInViewport();
        showToast("山田家 三代系図を読み込みました");
      }
    } else if (val === "export-json") {
      exportJsonFile();
    } else if (val === "import-json") {
      fileInputHidden.click();
    } else if (val === "clear-data") {
      if (confirm("家系図の全データをクリアして新規作成しますか？")) {
        appData = {
          title: "新規家系図",
          subtitle: "作成日: " + new Date().toLocaleDateString("ja-JP"),
          theme: "japanese",
          layoutMode: "ancestry",
          persons: [
            {
              id: "p1",
              name: "ご本人（当主）",
              kana: "ごほんにん",
              gender: "male",
              birth: "",
              death: "",
              isAlive: true,
              relation: "四代（現当主）",
              note: "",
              spouses: [],
              parents: [],
              children: []
            }
          ]
        };
        document.getElementById("doc-title-input").value = appData.title;
        document.getElementById("doc-subtitle-input").value = appData.subtitle;
        saveData();
        renderTree();
        updateJsonTextarea();
        centerTreeInViewport();
        showToast("家系図をリセットしました");
      }
    }
  });

  fileInputHidden.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (!parsed.persons || !Array.isArray(parsed.persons)) {
          alert("有効な家系図JSON形式ではありません。");
          return;
        }
        appData = parsed;
        applyTheme(appData.theme || "japanese");
        document.getElementById("doc-title-input").value = appData.title || "家系図";
        document.getElementById("doc-subtitle-input").value = appData.subtitle || "";
        document.getElementById("layout-mode-select").value = appData.layoutMode || "ancestry";
        saveData();
        renderTree();
        updateJsonTextarea();
        centerTreeInViewport();
        showToast("JSONファイルを正常に読み込みました");
      } catch(err) {
        alert("JSONの読み込みに失敗しました: " + err.message);
      }
      fileInputHidden.value = "";
    };
    reader.readAsText(file);
  });

  btnOpenPrint.addEventListener("click", () => {
    openPrintModal();
  });
}

function setupPanZoom() {
  const viewport = document.getElementById("viewport");
  const canvasContainer = document.getElementById("canvas-container");
  const zoomLevelText = document.getElementById("zoom-level-text");

  function updateTransform() {
    canvasContainer.style.transform = `translate(${panX}px, ${panY}px) scale(${currentZoom})`;
    zoomLevelText.textContent = `${Math.round(currentZoom * 100)}%`;
  }

  viewport.addEventListener("mousedown", (e) => {
    if (window._isDraggingCard || e.target.closest(".person-card") || e.target.closest("button") || e.target.closest("input")) {
      return;
    }
    isPanning = true;
    viewport.classList.add("dragging");
    startPanX = e.clientX - panX;
    startPanY = e.clientY - panY;
  });

  window.addEventListener("mousemove", (e) => {
    if (!isPanning || window._isDraggingCard) return;
    panX = e.clientX - startPanX;
    panY = e.clientY - startPanY;
    updateTransform();
  });

  window.addEventListener("mouseup", () => {
    if (isPanning) {
      isPanning = false;
      viewport.classList.remove("dragging");
    }
  });

  viewport.addEventListener("wheel", (e) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
    const newZoom = Math.min(Math.max(currentZoom * zoomFactor, 0.2), 2.5);

    const rect = viewport.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    panX = mouseX - (mouseX - panX) * (newZoom / currentZoom);
    panY = mouseY - (mouseY - panY) * (newZoom / currentZoom);
    currentZoom = newZoom;

    updateTransform();
  }, { passive: false });

  document.getElementById("btn-zoom-in").addEventListener("click", () => {
    currentZoom = Math.min(currentZoom * 1.2, 2.5);
    updateTransform();
  });

  document.getElementById("btn-zoom-out").addEventListener("click", () => {
    currentZoom = Math.max(currentZoom * 0.8, 0.2);
    updateTransform();
  });

  document.getElementById("btn-zoom-reset").addEventListener("click", () => {
    currentZoom = 1.0;
    updateTransform();
  });

  document.getElementById("btn-zoom-fit").addEventListener("click", () => {
    centerTreeInViewport();
  });
}


// ==========================================================================
// CARD RENDERING & DRAG CONTROLLER
// ==========================================================================

function formatVerticalNameHtml(person) {
  let name = person.name || '名称未設定';
  let sub = '';
  if (name.includes('（')) {
    const parts = name.split('（');
    name = parts[0];
    sub = parts[1].replace('）', '');
  }
  
  let mainEscaped = escapeHtml(name);
  if (person.kana && !sub) {
    mainEscaped = `<ruby>${mainEscaped}<rt>${escapeHtml(person.kana)}</rt></ruby>`;
  }
  
  let subHtml = sub ? `<div class="name-sub">（${escapeHtml(sub)}）</div>` : '';
  return `<div class="card-name-vertical">${mainEscaped}${subHtml}</div>`;
}

function formatVerticalNameHtml(person) {
  let name = person.name || '名称未設定';
  let sub = '';
  if (name.includes('（')) {
    const parts = name.split('（');
    name = parts[0];
    sub = parts[1].replace('）', '');
  }
  
  let mainEscaped = escapeHtml(name);
  if (person.kana && !sub) {
    mainEscaped = `<ruby>${mainEscaped}<rt>${escapeHtml(person.kana)}</rt></ruby>`;
  }
  
  let subHtml = sub ? `<div class="name-sub">（${escapeHtml(sub)}）</div>` : '';
  return `<div class="card-name-vertical">${mainEscaped}${subHtml}</div>`;
}

function createPersonCardElement(person, pos) {
  const card = document.createElement("div");
  card.className = `person-card gender-${person.gender || 'other'}`;
  card.id = `card-${person.id}`;
  card.style.left = `${pos.x}px`;
  card.style.top = `${pos.y}px`;

  const genderIcon = person.gender === 'male' ? '♂' : (person.gender === 'female' ? '♀' : '✦');

  let lifespanText = "";
  if (person.birth) {
    lifespanText = person.birth;
    if (person.death) {
      lifespanText += ` - ${person.death}`;
    } else if (person.isAlive !== false) {
      lifespanText += ` - 現存`;
    }
  } else if (person.isAlive === false) {
    lifespanText = "故人";
  }

  const relationText = person.relation || (person.gender === 'male' ? '男性' : '女性');

  card.innerHTML = `
    <div class="card-top">
      <span class="card-relation-tag" title="${escapeHtml(relationText)}">${escapeHtml(relationText)}</span>
    </div>

    <div class="card-body-vertical">
      ${formatVerticalNameHtml(person)}
    </div>

    <div class="card-bottom">
      ${lifespanText ? `<span class="lifespan-pill" title="${escapeHtml(lifespanText)}">${escapeHtml(lifespanText)}</span>` : '<span style="flex:1"></span>'}
      <span class="card-gender-badge">${genderIcon}</span>
    </div>

    <div class="card-actions-hover">
      <button class="card-action-btn btn-action-add-parent" title="親を追加（上の世代へ）">⬆️</button>
      <button class="card-action-btn btn-action-edit" title="編集">✏️</button>
      <button class="card-action-btn btn-action-add-sibling" title="兄弟・姉妹を追加">👥</button>
      <button class="card-action-btn btn-action-add-spouse" title="配偶者を追加">💍</button>
      <button class="card-action-btn btn-action-add-child" title="子を追加">👶</button>
      <button class="card-action-btn btn-action-delete" title="削除">🗑️</button>
    </div>
  `;

  let isDraggingCard = false;
  let hasMoved = false;
  let startMouseX = 0, startMouseY = 0;
  let startCardX = pos.x, startCardY = pos.y;

  card.addEventListener("mousedown", (e) => {
    if (e.target.closest(".card-actions-hover") || e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();

    isDraggingCard = true;
    window._isDraggingCard = true;
    hasMoved = false;
    startMouseX = e.clientX;
    startMouseY = e.clientY;

    const curPos = (window._activeNodePositions && window._activeNodePositions.get(person.id)) || pos;
    startCardX = curPos.x;
    startCardY = curPos.y;

    card.classList.add("card-dragging");

    const onMouseMove = (moveEvt) => {
      if (!isDraggingCard) return;
      const zoom = (typeof currentZoom !== 'undefined' && currentZoom) ? currentZoom : 1.0;
      const dx = (moveEvt.clientX - startMouseX) / zoom;
      const dy = (moveEvt.clientY - startMouseY) / zoom;

      if (Math.hypot(dx, dy) > 3) {
        hasMoved = true;
      }

      const newX = Math.round(startCardX + dx);
      const newY = Math.round(startCardY + dy);

      card.style.left = `${newX}px`;
      card.style.top = `${newY}px`;

      if (window._activeNodePositions) {
        const pPos = window._activeNodePositions.get(person.id);
        if (pPos) {
          pPos.x = newX;
          pPos.y = newY;
        }
      }

      updateConnectorsLive();
    };

    const onMouseUp = () => {
      if (!isDraggingCard) return;
      isDraggingCard = false;
      window._isDraggingCard = false;
      card.classList.remove("card-dragging");

      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);

      if (hasMoved) {
        person.customX = parseInt(card.style.left, 10);
        person.customY = parseInt(card.style.top, 10);
        if (typeof saveDataDebounced === 'function') {
          saveDataDebounced();
        } else if (typeof saveData === 'function') {
          saveData();
        }
      }
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  });

  card.addEventListener("click", (e) => {
    if (e.target.closest(".card-actions-hover")) return;
    if (hasMoved) {
      hasMoved = false;
      return;
    }
    openPersonModal(person.id);
  });

  card.querySelector(".btn-action-add-sibling")?.addEventListener("click", (e) => {
    e.stopPropagation();
    quickAddRelative(person.id, "sibling");
  });

  card.querySelector(".btn-action-add-parent")?.addEventListener("click", (e) => {
    e.stopPropagation();
    quickAddRelative(person.id, "parent");
  });

  card.querySelector(".btn-action-edit")?.addEventListener("click", (e) => {
    e.stopPropagation();
    openPersonModal(person.id);
  });

  card.querySelector(".btn-action-add-spouse")?.addEventListener("click", (e) => {
    e.stopPropagation();
    quickAddRelative(person.id, "spouse");
  });

  card.querySelector(".btn-action-add-child")?.addEventListener("click", (e) => {
    e.stopPropagation();
    quickAddRelative(person.id, "child");
  });

  card.querySelector(".btn-action-delete")?.addEventListener("click", (e) => {
    e.stopPropagation();
    deletePerson(person.id);
  });

  return card;
}



// ==========================================================================
// MODALS & PERSISTENCE CONTROLLER
// ==========================================================================

function setupModals() {
  const modal = document.getElementById("person-modal");
  const btnClose = document.getElementById("btn-modal-close");
  const btnCancel = document.getElementById("btn-cancel-person");
  const btnSave = document.getElementById("btn-save-person");
  const btnDelete = document.getElementById("btn-delete-person");

  btnClose.addEventListener("click", () => closeModal());
  
  const btnModalAddParent = document.getElementById("btn-modal-add-parent");
  if (btnModalAddParent) {
    btnModalAddParent.addEventListener("click", () => {
      const currentId = document.getElementById("form-person-id").value;
      if (!currentId) {
        alert("親を作成する前に、まずこの人物の情報を保存してください。");
        return;
      }
      closeModal();
      quickAddRelative(currentId, "parent");
    });
  }
  btnCancel.addEventListener("click", () => closeModal());

  btnSave.addEventListener("click", () => {
    savePersonFromModal();
  });

  btnDelete.addEventListener("click", () => {
    const id = document.getElementById("form-person-id").value;
    if (id && confirm("この人物を家系図から削除しますか？")) {
      deletePerson(id);
      closeModal();
    }
  });

  const printModal = document.getElementById("print-modal");
  document.getElementById("btn-print-modal-close").addEventListener("click", () => printModal.classList.remove("open"));
  document.getElementById("btn-print-cancel").addEventListener("click", () => printModal.classList.remove("open"));
  document.getElementById("btn-execute-print").addEventListener("click", () => {
    printModal.classList.remove("open");
    setTimeout(() => {
      window.print();
    }, 150);
  });
}

function openPersonModal(personId) {
  const modal = document.getElementById("person-modal");
  const title = document.getElementById("person-modal-title");
  const idInput = document.getElementById("form-person-id");
  const nameInput = document.getElementById("form-name");
  const kanaInput = document.getElementById("form-kana");
  const genderInput = document.getElementById("form-gender");
  const relationInput = document.getElementById("form-relation");
  const birthInput = document.getElementById("form-birth");
  const deathInput = document.getElementById("form-death");
  const isAliveInput = document.getElementById("form-is-alive");
  const noteInput = document.getElementById("form-note");
  const spousesSelect = document.getElementById("form-spouses");
  const parentsSelect = document.getElementById("form-parents");
  const btnDelete = document.getElementById("btn-delete-person");

  spousesSelect.innerHTML = "";
  parentsSelect.innerHTML = "";

  appData.persons.forEach(p => {
    if (p.id !== personId) {
      const opt1 = new Option(`${p.name} (${p.relation || p.gender})`, p.id);
      const opt2 = new Option(`${p.name} (${p.relation || p.gender})`, p.id);
      spousesSelect.add(opt1);
      parentsSelect.add(opt2);
    }
  });

  if (personId) {
    const person = appData.persons.find(p => p.id === personId);
    if (!person) return;
    title.innerHTML = `<span>👤</span> ${escapeHtml(person.name)} の情報を編集`;
    idInput.value = person.id;
    nameInput.value = person.name || "";
    kanaInput.value = person.kana || "";
    genderInput.value = person.gender || "male";
    relationInput.value = person.relation || "";
    birthInput.value = person.birth || "";
    deathInput.value = person.death || "";
    isAliveInput.checked = person.isAlive !== false;
    noteInput.value = person.note || "";
    btnDelete.style.display = "inline-flex";

    Array.from(spousesSelect.options).forEach(opt => {
      opt.selected = (person.spouses || []).includes(opt.value);
    });
    Array.from(parentsSelect.options).forEach(opt => {
      opt.selected = (person.parents || []).includes(opt.value);
    });
  } else {
    title.innerHTML = `<span>➕</span> 新しい人物を追加`;
    idInput.value = "";
    nameInput.value = "";
    kanaInput.value = "";
    genderInput.value = "male";
    relationInput.value = "";
    birthInput.value = "";
    deathInput.value = "";
    isAliveInput.checked = true;
    noteInput.value = "";
    btnDelete.style.display = "none";
  }

  modal.classList.add("open");
  nameInput.focus();
}

function closeModal() {
  document.getElementById("person-modal").classList.remove("open");
}

function openPrintModal() {
  document.getElementById("print-modal").classList.add("open");
}

function savePersonFromModal() {
  const idInput = document.getElementById("form-person-id").value;
  const name = document.getElementById("form-name").value.trim();
  if (!name) {
    alert("氏名を入力してください。");
    return;
  }

  const kana = document.getElementById("form-kana").value.trim();
  const gender = document.getElementById("form-gender").value;
  const relation = document.getElementById("form-relation").value.trim();
  const birth = document.getElementById("form-birth").value.trim();
  const death = document.getElementById("form-death").value.trim();
  const isAlive = document.getElementById("form-is-alive").checked;
  const note = document.getElementById("form-note").value.trim();

  const selectedSpouses = Array.from(document.getElementById("form-spouses").selectedOptions).map(o => o.value);
  const selectedParents = Array.from(document.getElementById("form-parents").selectedOptions).map(o => o.value);

  if (idInput) {
    const person = appData.persons.find(p => p.id === idInput);
    if (person) {
      (person.spouses || []).forEach(oldSid => {
        if (!selectedSpouses.includes(oldSid)) {
          const sp = appData.persons.find(p => p.id === oldSid);
          if (sp) sp.spouses = (sp.spouses || []).filter(sid => sid !== person.id);
        }
      });

      (person.parents || []).forEach(oldPid => {
        if (!selectedParents.includes(oldPid)) {
          const pr = appData.persons.find(p => p.id === oldPid);
          if (pr) pr.children = (pr.children || []).filter(cid => cid !== person.id);
        }
      });

      person.name = name;
      person.kana = kana;
      person.gender = gender;
      person.relation = relation;
      person.birth = birth;
      person.death = death;
      person.isAlive = isAlive;
      person.note = note;
      person.spouses = selectedSpouses;
      person.parents = selectedParents;

      selectedSpouses.forEach(sid => {
        const sp = appData.persons.find(p => p.id === sid);
        if (sp && !sp.spouses.includes(person.id)) {
          sp.spouses.push(person.id);
        }
      });

      selectedParents.forEach(pid => {
        const pr = appData.persons.find(p => p.id === pid);
        if (pr && !pr.children.includes(person.id)) {
          pr.children.push(person.id);
        }
      });
    }
  } else {
    const newId = "p" + (Date.now() % 1000000);
    const newPerson = {
      id: newId,
      name,
      kana,
      gender,
      relation,
      birth,
      death,
      isAlive,
      note,
      spouses: selectedSpouses,
      parents: selectedParents,
      children: []
    };

    selectedSpouses.forEach(sid => {
      const sp = appData.persons.find(p => p.id === sid);
      if (sp && !sp.spouses.includes(newId)) sp.spouses.push(newId);
    });

    selectedParents.forEach(pid => {
      const pr = appData.persons.find(p => p.id === pid);
      if (pr && !pr.children.includes(newId)) pr.children.push(newId);
    });

    appData.persons.push(newPerson);
  }

  closeModal();
  saveData();
  renderTree();
  updateJsonTextarea();
  showToast("人物情報を保存しました");
}

function deletePerson(personId) {
  appData.persons.forEach(p => {
    p.spouses = (p.spouses || []).filter(sid => sid !== personId);
    p.parents = (p.parents || []).filter(pid => pid !== personId);
    p.children = (p.children || []).filter(cid => cid !== personId);
  });

  appData.persons = appData.persons.filter(p => p.id !== personId);
  saveData();
  renderTree();
  updateJsonTextarea();
  showToast("人物を削除しました");
}

function quickAddRelative(targetId, type) {
  const target = appData.persons.find(p => p.id === targetId);
  if (!target) return;

  const newId = "p" + (Date.now() % 1000000);

  if (type === "parent") {
    const hasParents = target.parents && target.parents.length > 0;
    let gender = "male";
    let rel = "父";
    let spouseId = null;

    if (hasParents) {
      const existingParent = appData.persons.find(p => p.id === target.parents[0]);
      if (existingParent) {
        gender = existingParent.gender === 'male' ? 'female' : 'male';
        rel = gender === 'female' ? '母' : '父';
        spouseId = existingParent.id;
      }
    }

    const newParent = {
      id: newId,
      name: `${target.name} の${rel}`,
      kana: "",
      gender: gender,
      relation: rel,
      birth: "",
      death: "",
      isAlive: false,
      note: `${target.name} の実${rel}。`,
      spouses: spouseId ? [spouseId] : [],
      parents: [],
      children: [target.id]
    };

    if (!target.parents) target.parents = [];
    target.parents.push(newId);

    if (spouseId) {
      const sp = appData.persons.find(p => p.id === spouseId);
      if (sp && !sp.spouses.includes(newId)) sp.spouses.push(newId);
    }

    appData.persons.push(newParent);
    saveData();
    renderTree();
    updateJsonTextarea();
    openPersonModal(newId);
    showToast(`上の世代（${rel}）を追加しました`);
  } else if (type === "sibling") {
    let parentIds = [...(target.parents || [])];
    if (parentIds.length === 0) {
      const familyName = target.name.split(' ')[0] || target.name.slice(0, 2);
      const fId = "p" + (Date.now() % 1000000);
      const mId = "p" + ((Date.now() + 1) % 1000000);
      const f = {
        id: fId,
        name: `${familyName}家 父`,
        kana: "",
        gender: "male",
        relation: "父",
        birth: "",
        death: "",
        isAlive: false,
        note: "",
        spouses: [mId],
        parents: [],
        children: [target.id]
      };
      const m = {
        id: mId,
        name: `${familyName}家 母`,
        kana: "",
        gender: "female",
        relation: "母",
        birth: "",
        death: "",
        isAlive: false,
        note: "",
        spouses: [fId],
        parents: [],
        children: [target.id]
      };
      appData.persons.push(f, m);
      target.parents = [fId, mId];
      parentIds = [fId, mId];
    }

    const newSibling = {
      id: newId,
      name: "新兄弟姉妹",
      kana: "",
      gender: "male",
      relation: "兄弟",
      birth: "",
      death: "",
      isAlive: true,
      note: "",
      spouses: [],
      parents: [...parentIds],
      children: []
    };

    parentIds.forEach(pid => {
      const parent = appData.persons.find(p => p.id === pid);
      if (parent && !parent.children.includes(newId)) {
        parent.children.push(newId);
      }
    });

    appData.persons.push(newSibling);
    saveData();
    renderTree();
    updateJsonTextarea();
    openPersonModal(newId);
    showToast("兄弟・姉妹枠を追加しました");
  } else if (type === "spouse") {
    const oppGender = target.gender === 'male' ? 'female' : 'male';
    const newSpouse = {
      id: newId,
      name: "新配偶者",
      kana: "",
      gender: oppGender,
      relation: target.gender === 'male' ? '妻' : '夫',
      birth: "",
      death: "",
      isAlive: true,
      note: "",
      spouses: [target.id],
      parents: [],
      children: [...(target.children || [])]
    };
    target.spouses.push(newId);
    appData.persons.push(newSpouse);
    saveData();
    renderTree();
    updateJsonTextarea();
    openPersonModal(newId);
    showToast("配偶者枠を追加しました");
  } else if (type === "child") {
    const parentIds = [target.id];
    if (target.spouses && target.spouses.length > 0) {
      parentIds.push(target.spouses[0]);
    }

    const newChild = {
      id: newId,
      name: "新子孫",
      kana: "",
      gender: "male",
      relation: "子",
      birth: "",
      death: "",
      isAlive: true,
      note: "",
      spouses: [],
      parents: parentIds,
      children: []
    };

    parentIds.forEach(pid => {
      const parent = appData.persons.find(p => p.id === pid);
      if (parent && !parent.children.includes(newId)) {
        parent.children.push(newId);
      }
    });

    appData.persons.push(newChild);
    saveData();
    renderTree();
    updateJsonTextarea();
    openPersonModal(newId);
    showToast("子孫枠を追加しました");
  }
}

function setupSidebar() {
  const btnToggle = document.getElementById("btn-toggle-json");
  const btnClose = document.getElementById("btn-close-sidebar");
  const sidebar = document.getElementById("sidebar-json");
  const btnApply = document.getElementById("btn-apply-json");
  const btnFormat = document.getElementById("btn-format-json");
  const textarea = document.getElementById("json-textarea");
  const errBadge = document.getElementById("json-error-badge");

  btnToggle.addEventListener("click", () => {
    sidebar.classList.toggle("open");
  });

  btnClose.addEventListener("click", () => {
    sidebar.classList.remove("open");
  });

  btnFormat.addEventListener("click", () => {
    try {
      const parsed = JSON.parse(textarea.value);
      textarea.value = JSON.stringify(parsed, null, 2);
      errBadge.style.display = "none";
    } catch(e) {
      errBadge.textContent = "JSONフォーマット構文エラー: " + e.message;
      errBadge.style.display = "block";
    }
  });

  btnApply.addEventListener("click", () => {
    try {
      const parsed = JSON.parse(textarea.value);
      if (!parsed.persons || !Array.isArray(parsed.persons)) {
        throw new Error("persons 配列が存在しません。");
      }
      appData = parsed;
      errBadge.style.display = "none";
      applyTheme(appData.theme || "japanese");
      document.getElementById("doc-title-input").value = appData.title || "家系図";
      document.getElementById("doc-subtitle-input").value = appData.subtitle || "";
      document.getElementById("layout-mode-select").value = appData.layoutMode || "ancestry";
      saveData();
      renderTree();
      centerTreeInViewport();
      showToast("構成データを図に反映しました");
    } catch(e) {
      errBadge.textContent = "反映エラー: " + e.message;
      errBadge.style.display = "block";
    }
  });
}

function updateJsonTextarea() {
  const textarea = document.getElementById("json-textarea");
  if (textarea) {
    textarea.value = JSON.stringify(appData, null, 2);
  }
}

let saveTimeout = null;
function saveDataDebounced() {
  if (saveTimeout) clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    saveData();
  }, 400);
}

function saveData() {
  if (!appData) return;
  localStorage.setItem("familytree_studio_data", JSON.stringify(appData));
  updateJsonTextarea();
}

function exportJsonFile() {
  const jsonStr = JSON.stringify(appData, null, 2);
  const blob = new Blob([jsonStr], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const fileName = (appData.title || "family_tree").replace(/[\/\\:*?"<>|]/g, "_") + ".json";
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast("JSONファイルをダウンロードしました");
}

let toastTimeout = null;
function showToast(msg) {
  const toast = document.getElementById("status-toast");
  toast.textContent = msg;
  toast.classList.add("show");
  if (toastTimeout) clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.remove("show");
  }, 2400);
}

function escapeHtml(str) {
  if (typeof str !== 'string') return str == null ? '' : String(str);
  return str.replace(/[&<>'"]/g, 
    tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag)
  );
}

window.addEventListener("DOMContentLoaded", initApp);
