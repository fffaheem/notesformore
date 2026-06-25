/**
 * themes.js — Color Theme System
 * 
 * Self-contained: creates its own UI (modal + trigger button).
 * Stores selection in localStorage key "NFM_THEME".
 * Custom themes stored in localStorage key "NFM_CUSTOM_THEMES".
 * Include this script on any page AFTER root.css is loaded.
 */
(() => {

  const THEME_KEY = "NFM_THEME";
  const CUSTOM_KEY = "NFM_CUSTOM_THEMES";

  // ============================================================
  // PRESET THEMES
  // ============================================================
  const PRESETS = {

    obsidian: {
      name: "Obsidian",
      desc: "True black, white accent",
      vars: {
        "--bg":        "#0a0a0a",
        "--surface":   "#111111",
        "--surface-2": "#181818",
        "--overlay":   "rgba(10, 10, 10, 0.88)",
        "--border":    "#222222",
        "--border-2":  "#333333",
        "--text":      "#c8c8c8",
        "--text-2":    "#888888",
        "--text-3":    "#555555",
        "--accent":    "#d0d0d0",
        "--accent-bg": "#0a0a0a",
        "--danger":    "#ff3333",
        "--danger-bg": "rgba(255, 51, 51, 0.08)",
        "--cat-note":     "#888888",
        "--cat-idea":     "#f0c040",
        "--cat-question": "#60a5fa",
        "--cat-mistake":  "#f87171",
        "--cat-decision": "#4ade80",
      }
    },

    void: {
      name: "Void",
      desc: "OLED pure black, cyan glow",
      vars: {
        "--bg":        "#000000",
        "--surface":   "#080808",
        "--surface-2": "#101010",
        "--overlay":   "rgba(0, 0, 0, 0.92)",
        "--border":    "#1a1a1a",
        "--border-2":  "#252525",
        "--text":      "#e0e0e0",
        "--text-2":    "#707070",
        "--text-3":    "#404040",
        "--accent":    "#00e5ff",
        "--accent-bg": "#000000",
        "--danger":    "#ff1744",
        "--danger-bg": "rgba(255, 23, 68, 0.1)",
        "--cat-note":     "#607080",
        "--cat-idea":     "#ffab00",
        "--cat-question": "#40c4ff",
        "--cat-mistake":  "#ff5252",
        "--cat-decision": "#69f0ae",
      }
    },

    midnight: {
      name: "Midnight",
      desc: "Deep navy, cool blue tones",
      vars: {
        "--bg":        "#0b0e17",
        "--surface":   "#111628",
        "--surface-2": "#171d35",
        "--overlay":   "rgba(11, 14, 23, 0.90)",
        "--border":    "#1e2740",
        "--border-2":  "#2a3555",
        "--text":      "#dce4f0",
        "--text-2":    "#7888a8",
        "--text-3":    "#4a5878",
        "--accent":    "#7aa2f7",
        "--accent-bg": "#0b0e17",
        "--danger":    "#f7768e",
        "--danger-bg": "rgba(247, 118, 142, 0.1)",
        "--cat-note":     "#7888a8",
        "--cat-idea":     "#e0af68",
        "--cat-question": "#7aa2f7",
        "--cat-mistake":  "#f7768e",
        "--cat-decision": "#73daca",
      }
    },

    ember: {
      name: "Ember",
      desc: "Warm dark, amber accent",
      vars: {
        "--bg":        "#110e0a",
        "--surface":   "#1a1510",
        "--surface-2": "#221c14",
        "--overlay":   "rgba(17, 14, 10, 0.90)",
        "--border":    "#2e2519",
        "--border-2":  "#3d3224",
        "--text":      "#ede0d0",
        "--text-2":    "#9a8a72",
        "--text-3":    "#635640",
        "--accent":    "#f0a030",
        "--accent-bg": "#110e0a",
        "--danger":    "#e84040",
        "--danger-bg": "rgba(232, 64, 64, 0.1)",
        "--cat-note":     "#9a8a72",
        "--cat-idea":     "#f0c040",
        "--cat-question": "#70b8e0",
        "--cat-mistake":  "#e87070",
        "--cat-decision": "#80c880",
      }
    },

    nord: {
      name: "Nord",
      desc: "Arctic blue-grey palette",
      vars: {
        "--bg":        "#2e3440",
        "--surface":   "#3b4252",
        "--surface-2": "#434c5e",
        "--overlay":   "rgba(46, 52, 64, 0.90)",
        "--border":    "#4c566a",
        "--border-2":  "#5a657a",
        "--text":      "#eceff4",
        "--text-2":    "#b0b8c8",
        "--text-3":    "#6a7590",
        "--accent":    "#88c0d0",
        "--accent-bg": "#2e3440",
        "--danger":    "#bf616a",
        "--danger-bg": "rgba(191, 97, 106, 0.12)",
        "--cat-note":     "#8892a8",
        "--cat-idea":     "#ebcb8b",
        "--cat-question": "#81a1c1",
        "--cat-mistake":  "#bf616a",
        "--cat-decision": "#a3be8c",
      }
    },

    forest: {
      name: "Forest",
      desc: "Deep green, earthy tones",
      vars: {
        "--bg":        "#0a100e",
        "--surface":   "#111a16",
        "--surface-2": "#18221d",
        "--overlay":   "rgba(10, 16, 14, 0.90)",
        "--border":    "#1e3028",
        "--border-2":  "#2a4035",
        "--text":      "#d0e8d8",
        "--text-2":    "#70907a",
        "--text-3":    "#456050",
        "--accent":    "#50d880",
        "--accent-bg": "#0a100e",
        "--danger":    "#e05050",
        "--danger-bg": "rgba(224, 80, 80, 0.1)",
        "--cat-note":     "#70907a",
        "--cat-idea":     "#d8c050",
        "--cat-question": "#5098c0",
        "--cat-mistake":  "#d06060",
        "--cat-decision": "#50d880",
      }
    },

    rosepine: {
      name: "Rosé Pine",
      desc: "Muted pastels on dark base",
      vars: {
        "--bg":        "#191724",
        "--surface":   "#1f1d2e",
        "--surface-2": "#26233a",
        "--overlay":   "rgba(25, 23, 36, 0.90)",
        "--border":    "#2a2740",
        "--border-2":  "#393552",
        "--text":      "#e0def4",
        "--text-2":    "#908caa",
        "--text-3":    "#6e6a86",
        "--accent":    "#ebbcba",
        "--accent-bg": "#191724",
        "--danger":    "#eb6f92",
        "--danger-bg": "rgba(235, 111, 146, 0.1)",
        "--cat-note":     "#908caa",
        "--cat-idea":     "#f6c177",
        "--cat-question": "#9ccfd8",
        "--cat-mistake":  "#eb6f92",
        "--cat-decision": "#31748f",
      }
    },

    ivory: {
      name: "Ivory",
      desc: "Muted light theme",
      vars: {
        "--bg":        "#ebebe5",
        "--surface":   "#e0e0d8",
        "--surface-2": "#d6d6cd",
        "--overlay":   "rgba(235, 235, 229, 0.90)",
        "--border":    "#c5c5bb",
        "--border-2":  "#b8b8ac",
        "--text":      "#2a2a28",
        "--text-2":    "#6a6a65",
        "--text-3":    "#9a9a95",
        "--accent":    "#2a2a28",
        "--accent-bg": "#ebebe5",
        "--danger":    "#b53535",
        "--danger-bg": "rgba(181, 53, 53, 0.08)",
        "--cat-note":     "#7a7a75",
        "--cat-idea":     "#b08800",
        "--cat-question": "#3070b0",
        "--cat-mistake":  "#b53535",
        "--cat-decision": "#308050",
      }
    },

    sepia: {
      name: "Sepia",
      desc: "Warm vintage paper",
      vars: {
        "--bg":        "#eadab8",
        "--surface":   "#decca5",
        "--surface-2": "#d3be92",
        "--overlay":   "rgba(234, 218, 184, 0.90)",
        "--border":    "#c8b490",
        "--border-2":  "#b8a078",
        "--text":      "#433422",
        "--text-2":    "#7a644b",
        "--text-3":    "#9c8872",
        "--accent":    "#8c5a35",
        "--accent-bg": "#eadab8",
        "--danger":    "#a63535",
        "--danger-bg": "rgba(166, 53, 53, 0.08)",
        "--cat-note":     "#7a644b",
        "--cat-idea":     "#a67b27",
        "--cat-question": "#4a708b",
        "--cat-mistake":  "#a63535",
        "--cat-decision": "#5a8b5a",
      }
    },

    latte: {
      name: "Latte",
      desc: "Soft coffee tones",
      vars: {
        "--bg":        "#e4e7f0",
        "--surface":   "#dadde6",
        "--surface-2": "#cdd2de",
        "--overlay":   "rgba(228, 231, 240, 0.90)",
        "--border":    "#bcc0cc",
        "--border-2":  "#acb0bc",
        "--text":      "#4c4f69",
        "--text-2":    "#7c7f93",
        "--text-3":    "#9ca0b0",
        "--accent":    "#1e66f5",
        "--accent-bg": "#e4e7f0",
        "--danger":    "#c40e35",
        "--danger-bg": "rgba(196, 14, 53, 0.08)",
        "--cat-note":     "#7c7f93",
        "--cat-idea":     "#df8e1d",
        "--cat-question": "#1e66f5",
        "--cat-mistake":  "#c40e35",
        "--cat-decision": "#40a02b",
      }
    },

    paper: {
      name: "Paper",
      desc: "Crisp white & gray",
      vars: {
        "--bg":        "#e9ecef",
        "--surface":   "#dee2e6",
        "--surface-2": "#ced4da",
        "--overlay":   "rgba(233, 236, 239, 0.90)",
        "--border":    "#adb5bd",
        "--border-2":  "#868e96",
        "--text":      "#212529",
        "--text-2":    "#495057",
        "--text-3":    "#868e96",
        "--accent":    "#343a40",
        "--accent-bg": "#e9ecef",
        "--danger":    "#c92a2a",
        "--danger-bg": "rgba(201, 42, 42, 0.08)",
        "--cat-note":     "#868e96",
        "--cat-idea":     "#e67700",
        "--cat-question": "#1864ab",
        "--cat-mistake":  "#c92a2a",
        "--cat-decision": "#2b8a3e",
      }
    },

    mint: {
      name: "Mint",
      desc: "Refreshing pale green",
      vars: {
        "--bg":        "#e0f0e6",
        "--surface":   "#d2e8db",
        "--surface-2": "#c3dfcf",
        "--overlay":   "rgba(224, 240, 230, 0.90)",
        "--border":    "#b0cebd",
        "--border-2":  "#9cbdae",
        "--text":      "#2d4a3e",
        "--text-2":    "#4c705f",
        "--text-3":    "#6e917f",
        "--accent":    "#2b8a5e",
        "--accent-bg": "#e0f0e6",
        "--danger":    "#c53d3d",
        "--danger-bg": "rgba(197, 61, 61, 0.08)",
        "--cat-note":     "#6e917f",
        "--cat-idea":     "#d08c15",
        "--cat-question": "#2a6fa8",
        "--cat-mistake":  "#c53d3d",
        "--cat-decision": "#2b8a5e",
      }
    },

    peach: {
      name: "Peach",
      desc: "Soft warm sunset",
      vars: {
        "--bg":        "#f6e5da",
        "--surface":   "#ecd6c8",
        "--surface-2": "#dfc5b5",
        "--overlay":   "rgba(246, 229, 218, 0.90)",
        "--border":    "#d1b19e",
        "--border-2":  "#c09b85",
        "--text":      "#5a3a2e",
        "--text-2":    "#8c6454",
        "--text-3":    "#b38c7b",
        "--accent":    "#d96a45",
        "--accent-bg": "#f6e5da",
        "--danger":    "#c43030",
        "--danger-bg": "rgba(196, 48, 48, 0.08)",
        "--cat-note":     "#8c6454",
        "--cat-idea":     "#d96a45",
        "--cat-question": "#4f7da3",
        "--cat-mistake":  "#c43030",
        "--cat-decision": "#53965d",
      }
    },

    lavender: {
      name: "Lavender",
      desc: "Calming pale purple",
      vars: {
        "--bg":        "#e9e2f0",
        "--surface":   "#dfd4e8",
        "--surface-2": "#d5c7df",
        "--overlay":   "rgba(233, 226, 240, 0.90)",
        "--border":    "#c4b2d1",
        "--border-2":  "#b39ebd",
        "--text":      "#3f3054",
        "--text-2":    "#66537a",
        "--text-3":    "#8b799e",
        "--accent":    "#7a52a3",
        "--accent-bg": "#e9e2f0",
        "--danger":    "#b83855",
        "--danger-bg": "rgba(184, 56, 85, 0.08)",
        "--cat-note":     "#8b799e",
        "--cat-idea":     "#b8801c",
        "--cat-question": "#3f74a8",
        "--cat-mistake":  "#b83855",
        "--cat-decision": "#3e8c6c",
      }
    },

    solarizedLight: {
      name: "Solarized Light",
      desc: "Classic high-readability",
      vars: {
        "--bg":        "#f2e5bc",
        "--surface":   "#e4d5a9",
        "--surface-2": "#d7c696",
        "--overlay":   "rgba(242, 229, 188, 0.90)",
        "--border":    "#c5b695",
        "--border-2":  "#b3a380",
        "--text":      "#657b83",
        "--text-2":    "#93a1a1",
        "--text-3":    "#839496",
        "--accent":    "#268bd2",
        "--accent-bg": "#f2e5bc",
        "--danger":    "#cb4b16",
        "--danger-bg": "rgba(203, 75, 22, 0.08)",
        "--cat-note":     "#93a1a1",
        "--cat-idea":     "#b58900",
        "--cat-question": "#2aa198",
        "--cat-mistake":  "#cb4b16",
        "--cat-decision": "#859900",
      }
    },

  };

  // The CSS variable keys that define a theme (order matters for the editor)
  const THEME_VARS = [
    { key: "--bg",           label: "Background",   type: "color" },
    { key: "--surface",      label: "Surface",      type: "color" },
    { key: "--surface-2",    label: "Surface Alt",   type: "color" },
    { key: "--border",       label: "Border",       type: "color" },
    { key: "--border-2",     label: "Border Alt",    type: "color" },
    { key: "--text",         label: "Text",         type: "color" },
    { key: "--text-2",       label: "Text Muted",    type: "color" },
    { key: "--text-3",       label: "Text Faint",    type: "color" },
    { key: "--accent",       label: "Accent",       type: "color" },
    { key: "--accent-bg",    label: "Accent BG",     type: "color" },
    { key: "--danger",       label: "Danger",       type: "color" },
    { key: "--cat-note",     label: "Cat: Note",    type: "color" },
    { key: "--cat-idea",     label: "Cat: Idea",    type: "color" },
    { key: "--cat-question", label: "Cat: Question", type: "color" },
    { key: "--cat-mistake",  label: "Cat: Mistake",  type: "color" },
    { key: "--cat-decision", label: "Cat: Decision", type: "color" },
  ];

  // ============================================================
  // PERSISTENCE
  // ============================================================
  function getSelectedThemeId() {
    return localStorage.getItem(THEME_KEY) || "obsidian";
  }

  function setSelectedThemeId(id) {
    localStorage.setItem(THEME_KEY, id);
  }

  function getCustomThemes() {
    const raw = localStorage.getItem(CUSTOM_KEY);
    return raw ? JSON.parse(raw) : {};
  }

  function saveCustomThemes(themes) {
    localStorage.setItem(CUSTOM_KEY, JSON.stringify(themes));
  }

  // ============================================================
  // THEME APPLICATION
  // ============================================================
  function applyTheme(themeId) {
    const theme = PRESETS[themeId] || getCustomThemes()[themeId];
    if (!theme) return;

    const root = document.documentElement;
    Object.entries(theme.vars).forEach(([key, val]) => {
      root.style.setProperty(key, val);
    });

    setSelectedThemeId(themeId);
  }

  function getCurrentThemeVars() {
    const style = getComputedStyle(document.documentElement);
    const vars = {};
    THEME_VARS.forEach(({ key }) => {
      vars[key] = style.getPropertyValue(key).trim();
    });
    return vars;
  }

  // ============================================================
  // UI — Inject theme button into the page
  // ============================================================
  function injectThemeButton() {
    // Find a suitable place to insert the button
    // On index.html: inside .toolbar-left
    // On notes.html: inside .header-actions
    const toolbarLeft = document.querySelector(".toolbar-left");
    const headerActions = document.querySelector(".header-actions");

    const btn = document.createElement("button");
    btn.id = "themeBtn";
    btn.className = "btn btn-ghost";
    btn.textContent = "Theme";
    btn.addEventListener("click", openThemeModal);

    if (toolbarLeft) {
      toolbarLeft.appendChild(btn);
    } else if (headerActions) {
      headerActions.insertBefore(btn, headerActions.firstChild);
    }
  }

  // ============================================================
  // UI — Theme Modal (dynamically created)
  // ============================================================
  let modalEl = null;

  function createModal() {
    if (modalEl) return modalEl;

    modalEl = document.createElement("div");
    modalEl.id = "themeModal";
    modalEl.className = "theme-modal-backdrop";
    modalEl.innerHTML = `
      <div class="theme-modal-box">
        <div class="theme-modal-body">
          <h2>COLOR THEMES</h2>
          <div id="themePresetGrid" class="theme-preset-grid"></div>
          <div class="theme-section-divider"></div>
          <h3>CUSTOM THEMES</h3>
          <div id="customThemeList" class="theme-custom-list"></div>
          <button id="createCustomThemeBtn" class="btn btn-ghost theme-create-btn">+ Create Custom Theme</button>
          <div id="themeEditor" class="theme-editor" style="display:none;"></div>
        </div>
        <div class="theme-modal-footer">
          <button id="closeThemeModal" class="btn btn-ghost">Close</button>
        </div>
      </div>
    `;
    document.body.appendChild(modalEl);

    // Close handlers
    modalEl.querySelector("#closeThemeModal").addEventListener("click", closeThemeModal);
    modalEl.addEventListener("click", (e) => {
      if (e.target === modalEl) closeThemeModal();
    });

    // Create custom theme button
    modalEl.querySelector("#createCustomThemeBtn").addEventListener("click", () => {
      openThemeEditor(null);
    });

    return modalEl;
  }

  function openThemeModal() {
    const modal = createModal();
    renderPresets();
    renderCustomThemes();
    hideThemeEditor();
    modal.classList.add("show");
  }

  function closeThemeModal() {
    if (modalEl) modalEl.classList.remove("show");
  }

  function renderPresets() {
    const grid = modalEl.querySelector("#themePresetGrid");
    const currentId = getSelectedThemeId();

    grid.innerHTML = Object.entries(PRESETS).map(([id, theme]) => {
      const active = id === currentId ? " active" : "";
      const bg = theme.vars["--bg"];
      const surface = theme.vars["--surface"];
      const accent = theme.vars["--accent"];
      const text = theme.vars["--text"];
      const border = theme.vars["--border-2"];

      return `
        <button class="theme-card${active}" data-theme-id="${id}"
                style="background:${bg}; border-color:${border}; color:${text};">
          <div class="theme-card-preview">
            <span class="theme-card-dot" style="background:${accent};"></span>
            <span class="theme-card-dot" style="background:${theme.vars["--cat-idea"]};"></span>
            <span class="theme-card-dot" style="background:${theme.vars["--cat-question"]};"></span>
            <span class="theme-card-dot" style="background:${theme.vars["--cat-decision"]};"></span>
          </div>
          <span class="theme-card-name">${theme.name}</span>
          <span class="theme-card-desc" style="color:${theme.vars["--text-3"]};">${theme.desc}</span>
        </button>
      `;
    }).join("");

    grid.querySelectorAll(".theme-card").forEach((card) => {
      card.addEventListener("click", () => {
        applyTheme(card.dataset.themeId);
        renderPresets();
        renderCustomThemes();
      });
    });
  }

  function renderCustomThemes() {
    const list = modalEl.querySelector("#customThemeList");
    const customs = getCustomThemes();
    const currentId = getSelectedThemeId();
    const keys = Object.keys(customs);

    if (keys.length === 0) {
      list.innerHTML = `<p class="theme-empty-msg">No custom themes yet.</p>`;
      return;
    }

    list.innerHTML = keys.map((id) => {
      const theme = customs[id];
      const active = id === currentId ? " active" : "";
      const bg = theme.vars["--bg"];
      const accent = theme.vars["--accent"];
      const text = theme.vars["--text"];
      const border = theme.vars["--border-2"];

      return `
        <div class="theme-custom-item${active}" style="background:${bg}; border-color:${border}; color:${text};">
          <button class="theme-custom-apply" data-id="${id}">
            <span class="theme-card-dot" style="background:${accent};"></span>
            <span>${theme.name}</span>
          </button>
          <div class="theme-custom-actions">
            <button class="theme-custom-edit" data-id="${id}" title="Edit">✏</button>
            <button class="theme-custom-delete" data-id="${id}" title="Delete">✕</button>
          </div>
        </div>
      `;
    }).join("");

    list.querySelectorAll(".theme-custom-apply").forEach((btn) => {
      btn.addEventListener("click", () => {
        applyTheme(btn.dataset.id);
        renderPresets();
        renderCustomThemes();
      });
    });

    list.querySelectorAll(".theme-custom-edit").forEach((btn) => {
      btn.addEventListener("click", () => {
        openThemeEditor(btn.dataset.id);
      });
    });

    list.querySelectorAll(".theme-custom-delete").forEach((btn) => {
      btn.addEventListener("click", () => {
        const customs = getCustomThemes();
        delete customs[btn.dataset.id];
        saveCustomThemes(customs);
        if (getSelectedThemeId() === btn.dataset.id) {
          applyTheme("obsidian");
        }
        renderCustomThemes();
      });
    });
  }

  // ============================================================
  // THEME EDITOR
  // ============================================================
  function openThemeEditor(editId) {
    const editor = modalEl.querySelector("#themeEditor");
    editor.style.display = "block";

    let theme;
    if (editId) {
      theme = getCustomThemes()[editId];
    } else {
      // Start from current applied vars
      theme = { name: "", desc: "", vars: getCurrentThemeVars() };
    }

    const varsHtml = THEME_VARS.map(({ key, label }) => {
      const val = theme.vars[key] || "#000000";
      // Convert rgba or other formats to hex for the input
      const hexVal = toHex(val);
      return `
        <div class="theme-editor-row">
          <label>${label}</label>
          <div class="theme-editor-input-group">
            <input type="color" class="theme-color-pick" data-var="${key}" value="${hexVal}">
            <input type="text" class="theme-color-text" data-var="${key}" value="${val}" spellcheck="false">
          </div>
        </div>
      `;
    }).join("");

    editor.innerHTML = `
      <div class="theme-editor-header">
        <h3>${editId ? "EDIT THEME" : "NEW THEME"}</h3>
      </div>
      <div class="theme-editor-field">
        <label>Theme Name</label>
        <input type="text" id="themeEditorName" value="${escAttr(theme.name)}" placeholder="My Theme" spellcheck="false">
      </div>
      <div class="theme-editor-field">
        <label>Description</label>
        <input type="text" id="themeEditorDesc" value="${escAttr(theme.desc || "")}" placeholder="Short description" spellcheck="false">
      </div>
      <div class="theme-editor-vars">${varsHtml}</div>
      <div class="theme-editor-actions">
        <button id="themeEditorPreview" class="btn btn-ghost">Preview</button>
        <button id="themeEditorSave" class="btn btn-primary">Save</button>
        <button id="themeEditorCancel" class="btn btn-ghost">Cancel</button>
      </div>
    `;

    // Sync color pickers with text inputs
    editor.querySelectorAll(".theme-color-pick").forEach((pick) => {
      pick.addEventListener("input", () => {
        const textInput = editor.querySelector(`.theme-color-text[data-var="${pick.dataset.var}"]`);
        if (textInput) textInput.value = pick.value;
      });
    });

    editor.querySelectorAll(".theme-color-text").forEach((text) => {
      text.addEventListener("input", () => {
        const pick = editor.querySelector(`.theme-color-pick[data-var="${text.dataset.var}"]`);
        if (pick && /^#[0-9a-fA-F]{6}$/.test(text.value)) {
          pick.value = text.value;
        }
      });
    });

    // Preview
    editor.querySelector("#themeEditorPreview").addEventListener("click", () => {
      const vars = collectEditorVars();
      const root = document.documentElement;
      Object.entries(vars).forEach(([key, val]) => {
        root.style.setProperty(key, val);
      });
    });

    // Save
    editor.querySelector("#themeEditorSave").addEventListener("click", () => {
      const name = editor.querySelector("#themeEditorName").value.trim();
      if (!name) {
        editor.querySelector("#themeEditorName").style.borderColor = "var(--danger)";
        return;
      }
      const desc = editor.querySelector("#themeEditorDesc").value.trim();
      const vars = collectEditorVars();

      const customs = getCustomThemes();
      const id = editId || "custom_" + Date.now().toString(36);
      customs[id] = { name, desc, vars };
      saveCustomThemes(customs);

      applyTheme(id);
      hideThemeEditor();
      renderPresets();
      renderCustomThemes();
    });

    // Cancel
    editor.querySelector("#themeEditorCancel").addEventListener("click", () => {
      // Reapply the selected theme to undo preview
      applyTheme(getSelectedThemeId());
      hideThemeEditor();
    });
  }

  function hideThemeEditor() {
    if (!modalEl) return;
    const editor = modalEl.querySelector("#themeEditor");
    if (editor) {
      editor.style.display = "none";
      editor.innerHTML = "";
    }
  }

  function collectEditorVars() {
    const vars = {};
    const editor = modalEl.querySelector("#themeEditor");
    editor.querySelectorAll(".theme-color-text").forEach((input) => {
      vars[input.dataset.var] = input.value.trim();
    });
    return vars;
  }

  function toHex(val) {
    if (!val) return "#000000";
    val = val.trim();
    if (/^#[0-9a-fA-F]{6}$/.test(val)) return val;
    if (/^#[0-9a-fA-F]{3}$/.test(val)) {
      return "#" + val[1]+val[1] + val[2]+val[2] + val[3]+val[3];
    }
    // Try to parse rgb/rgba
    const m = val.match(/rgba?\(\s*(\d+),\s*(\d+),\s*(\d+)/);
    if (m) {
      const hex = (n) => parseInt(n).toString(16).padStart(2, "0");
      return `#${hex(m[1])}${hex(m[2])}${hex(m[3])}`;
    }
    return "#000000";
  }

  function escAttr(str) {
    return String(str).replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  // ============================================================
  // CSS — Inject theme modal styles
  // ============================================================
  function injectStyles() {
    const style = document.createElement("style");
    style.textContent = `
      /* Theme Modal Backdrop */
      .theme-modal-backdrop {
        display: none;
        position: fixed;
        inset: 0;
        background: var(--overlay);
        backdrop-filter: blur(4px);
        z-index: 300;
        justify-content: center;
        align-items: flex-start;
        padding: 2rem 1rem;
        overflow-y: auto;
      }
      .theme-modal-backdrop.show { display: flex; }

      .theme-modal-box {
        background: var(--surface);
        border: 1px solid var(--border-2);
        border-radius: var(--radius);
        padding: 2rem;
        width: 100%;
        max-width: 580px;
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .theme-modal-body {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .theme-modal-body h2 {
        font-family: var(--font-display);
        font-size: 1.1rem;
        font-weight: 400;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        color: var(--text);
        border-bottom: 1px solid var(--border);
        padding-bottom: 0.75rem;
      }

      .theme-modal-body h3 {
        font-family: var(--font-mono);
        font-size: 0.72rem;
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: var(--text-2);
        margin-top: 0.25rem;
      }

      .theme-modal-footer {
        display: flex;
        justify-content: flex-end;
        gap: 0.75rem;
        padding-top: 0.5rem;
        border-top: 1px solid var(--border);
      }

      /* Preset Grid */
      .theme-preset-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(135px, 1fr));
        gap: 0.5rem;
      }

      .theme-card {
        display: flex;
        flex-direction: column;
        gap: 0.4rem;
        padding: 0.75rem;
        border: 1px solid;
        border-radius: var(--radius);
        cursor: pointer;
        transition: transform 0.12s, box-shadow 0.12s;
        font-family: var(--font-mono);
        text-align: left;
      }
      .theme-card:hover { transform: translateY(-1px); }
      .theme-card.active { outline: 2px solid var(--accent); outline-offset: 1px; }

      .theme-card-preview {
        display: flex;
        gap: 0.35rem;
        margin-bottom: 0.2rem;
      }

      .theme-card-dot {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        flex-shrink: 0;
      }

      .theme-card-name {
        font-size: 0.75rem;
        font-weight: 500;
        letter-spacing: 0.04em;
      }

      .theme-card-desc {
        font-size: 0.62rem;
        letter-spacing: 0.04em;
      }

      .theme-section-divider {
        border-top: 1px solid var(--border);
        margin: 0.5rem 0;
      }

      /* Custom Theme List */
      .theme-custom-list {
        display: flex;
        flex-direction: column;
        gap: 0.35rem;
      }

      .theme-empty-msg {
        font-size: 0.75rem;
        color: var(--text-3);
        letter-spacing: 0.04em;
      }

      .theme-custom-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.6rem 0.75rem;
        border: 1px solid;
        border-radius: var(--radius);
        font-family: var(--font-mono);
      }
      .theme-custom-item.active { outline: 2px solid var(--accent); outline-offset: 1px; }

      .theme-custom-apply {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        background: transparent;
        border: none;
        color: inherit;
        cursor: pointer;
        font-family: var(--font-mono);
        font-size: 0.78rem;
        letter-spacing: 0.04em;
      }

      .theme-custom-actions {
        display: flex;
        gap: 0.35rem;
      }

      .theme-custom-edit,
      .theme-custom-delete {
        background: transparent;
        border: 1px solid var(--border-2);
        border-radius: var(--radius);
        color: var(--text-2);
        cursor: pointer;
        font-size: 0.72rem;
        width: 1.8rem;
        height: 1.8rem;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: border-color 0.12s, color 0.12s;
      }
      .theme-custom-edit:hover { border-color: var(--text); color: var(--text); }
      .theme-custom-delete:hover { border-color: var(--danger); color: var(--danger); }

      .theme-create-btn {
        align-self: flex-start;
        margin-top: 0.25rem;
      }

      /* Theme Editor */
      .theme-editor {
        border: 1px solid var(--border);
        border-radius: var(--radius);
        padding: 1.25rem;
        display: flex;
        flex-direction: column;
        gap: 1rem;
        margin-top: 0.5rem;
      }

      .theme-editor-header h3 {
        font-family: var(--font-display);
        font-size: 0.9rem;
        color: var(--text);
        letter-spacing: 0.06em;
      }

      .theme-editor-field {
        display: flex;
        flex-direction: column;
        gap: 0.3rem;
      }

      .theme-editor-field label {
        font-size: 0.68rem;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        color: var(--text-3);
        font-family: var(--font-mono);
      }

      .theme-editor-field input[type="text"] {
        width: 100%;
        padding: 0.5rem 0.75rem;
        background: var(--bg);
        border: 1px solid var(--border-2);
        border-radius: var(--radius-sm);
        color: var(--text);
        font-family: var(--font-mono);
        font-size: 0.8rem;
        outline: none;
        transition: border-color 0.12s;
      }
      .theme-editor-field input[type="text"]:focus { border-color: var(--text); }

      .theme-editor-vars {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 0.5rem;
        max-height: 300px;
        overflow-y: auto;
        padding-right: 0.25rem;
      }

      .theme-editor-row {
        display: flex;
        flex-direction: column;
        gap: 0.2rem;
      }

      .theme-editor-row label {
        font-size: 0.62rem;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        color: var(--text-3);
        font-family: var(--font-mono);
      }

      .theme-editor-input-group {
        display: flex;
        gap: 0.35rem;
        align-items: center;
      }

      .theme-color-pick {
        width: 28px;
        height: 28px;
        padding: 0;
        border: 1px solid var(--border-2);
        border-radius: var(--radius-sm);
        cursor: pointer;
        background: transparent;
        flex-shrink: 0;
      }
      .theme-color-pick::-webkit-color-swatch-wrapper { padding: 1px; }
      .theme-color-pick::-webkit-color-swatch { border: none; border-radius: 1px; }

      .theme-color-text {
        flex: 1;
        padding: 0.35rem 0.5rem;
        background: var(--bg);
        border: 1px solid var(--border-2);
        border-radius: var(--radius-sm);
        color: var(--text);
        font-family: var(--font-mono);
        font-size: 0.68rem;
        outline: none;
        min-width: 0;
      }
      .theme-color-text:focus { border-color: var(--text); }

      .theme-editor-actions {
        display: flex;
        gap: 0.5rem;
        justify-content: flex-end;
        padding-top: 0.5rem;
        border-top: 1px solid var(--border);
      }

      @media (max-width: 600px) {
        .theme-preset-grid { grid-template-columns: repeat(2, 1fr); }
        .theme-editor-vars { grid-template-columns: 1fr; }
        .theme-modal-box { padding: 1.25rem; }
      }
    `;
    document.head.appendChild(style);
  }

  // ============================================================
  // INIT
  // ============================================================
  function init() {
    injectStyles();
    injectThemeButton();

    // Apply saved theme on page load
    const saved = getSelectedThemeId();
    if (saved && saved !== "obsidian") {
      applyTheme(saved);
    } else if (saved === "obsidian") {
      // Ensure obsidian is explicitly applied (handles custom theme -> obsidian switch)
      applyTheme("obsidian");
    }
  }

  // Run after DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

})();
