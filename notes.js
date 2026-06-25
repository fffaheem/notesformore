/**
 * notes.js — Graph Engine & Timeline Editor
 *
 * Architecture:
 *   Persistence : localStorage "NFM_V2" → { notes, cells, relationships }
 *   Runtime     : in-memory indexes { relationshipsByFrom, relationshipsByTo, cellsByNoteId }
 *
 * Relationship direction convention:
 *   EDIT      : Old Cell → New Cell
 *   REPLY     : Original Cell → Reply Cell
 *   ANSWER    : Question Cell → Answer Cell
 *   REFERENCE : Referencing Cell → Referenced Cell
 *   ADDITION  : Parent Cell → Added Cell (generic linked expansion)
 */
(() => {

  const STORE_KEY = "NFM_V2";

  // ============================================================
  // UTILITIES
  // ============================================================
  function generateId() {
    return typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : Date.now().toString(36) + Math.random().toString(36).slice(2);
  }

  function escHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function fmtTimestamp(ts) {
    const d = new Date(ts);
    const time = d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
    const date = d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
    return `${date}\n${time}`;
  }

  function truncate(str, n = 48) {
    if (!str) return "";
    return str.length > n ? str.slice(0, n) + "…" : str;
  }

  // ============================================================
  // STORE — Read / Write
  // ============================================================
  function loadStore() {
    const raw = localStorage.getItem(STORE_KEY);
    return raw ? JSON.parse(raw) : { notes: {}, cells: {}, relationships: [] };
  }

  function saveStore(store) {
    localStorage.setItem(STORE_KEY, JSON.stringify(store));
  }

  // ============================================================
  // IN-MEMORY INDEXES
  // Rebuilt every time the store is loaded to avoid stale reads.
  // ============================================================
  function buildIndexes(store) {
    const relationshipsByFrom = {}; // cellId → [rel]
    const relationshipsByTo   = {}; // cellId → [rel]
    const cellsByNoteId       = {}; // noteId → [cellId]

    store.relationships.forEach((r) => {
      if (!relationshipsByFrom[r.from]) relationshipsByFrom[r.from] = [];
      relationshipsByFrom[r.from].push(r);

      if (!relationshipsByTo[r.to]) relationshipsByTo[r.to] = [];
      relationshipsByTo[r.to].push(r);
    });

    Object.values(store.cells).forEach((c) => {
      if (!cellsByNoteId[c.noteId]) cellsByNoteId[c.noteId] = [];
      cellsByNoteId[c.noteId].push(c.id);
    });

    return { relationshipsByFrom, relationshipsByTo, cellsByNoteId };
  }

  // ============================================================
  // CELL OPERATIONS
  // ============================================================

  /**
   * Add a brand-new Cell to the store.
   * Optionally also adds a relationship from parentId → newCellId.
   */
  function addCell({ noteId, content, category = "NOTE", parentId = null, relType = null }) {
    const store = loadStore();
    const now = Date.now();
    const id = generateId();

    store.cells[id] = {
      id,
      noteId,
      content,
      createdAt: now,
      updatedAt: now,
      category,
      status: "ACTIVE",
      metadata: {},
    };

    if (parentId && relType) {
      store.relationships.push({
        id: generateId(),
        from: parentId,
        to: id,
        relationshipType: relType,
        createdAt: now,
      });
    }

    saveStore(store);
    return id;
  }

  /**
   * Mutate mutable metadata fields: category, status, metadata.
   * NEVER modifies content — content edits must go through editCellContent().
   */
  function mutateCellMeta(cellId, patch) {
    const store = loadStore();
    const cell = store.cells[cellId];
    if (!cell) return;
    const allowedKeys = ["category", "status", "metadata"];
    allowedKeys.forEach((k) => {
      if (patch[k] !== undefined) cell[k] = patch[k];
    });
    cell.updatedAt = Date.now();
    saveStore(store);
  }

  /**
   * Content edit: creates a NEW cell linked via EDIT relationship.
   * Old cell is left intact (history preserved).
   */
  function editCellContent(oldCellId, newContent) {
    const store = loadStore();
    const oldCell = store.cells[oldCellId];
    if (!oldCell) return null;

    return addCell({
      noteId: oldCell.noteId,
      content: newContent,
      category: oldCell.category,
      parentId: oldCellId,
      relType: "EDIT",
    });
  }

  /**
   * Soft delete — mutates status to DELETED.
   */
  function softDeleteCell(cellId) {
    mutateCellMeta(cellId, { status: "DELETED" });
  }

  // ============================================================
  // NOTE METADATA
  // ============================================================
  function getNoteId() {
    return window.location.hash ? window.location.hash.slice(1) : null;
  }

  // ============================================================
  // DOM ELEMENTS
  // ============================================================
  const Els = {
    noteTitleDisplay: document.getElementById("noteTitleDisplay"),
    timeline:         document.getElementById("timeline"),
    cellInput:        document.getElementById("cellInput"),
    submitCell:       document.getElementById("submitCell"),
    replyContext:     document.getElementById("replyContext"),
    replyContextText: document.getElementById("replyContextText"),
    cancelContext:    document.getElementById("cancelContext"),
    contextMenu:      document.getElementById("contextMenu"),
    generatePromptBtn:document.getElementById("generatePromptBtn"),
    promptModal:      document.getElementById("promptModal"),
    promptOutput:     document.getElementById("promptOutput"),
    copyPrompt:       document.getElementById("copyPrompt"),
    closePromptModal: document.getElementById("closePromptModal"),
  };

  // ============================================================
  // STATE
  // ============================================================
  let noteId = null;
  let pendingLink = null;   // { parentId, relType } or null

  // ============================================================
  // RENDER TIMELINE
  // ============================================================
  function renderTimeline() {
    const store  = loadStore();
    const idx    = buildIndexes(store);
    const note   = store.notes[noteId];

    if (!note) {
      Els.noteTitleDisplay.textContent = "Note not found.";
      Els.timeline.innerHTML = `<div style="color:var(--text-3); padding: 2rem 0;">This note does not exist.</div>`;
      return;
    }

    Els.noteTitleDisplay.textContent = note.title;
    document.title = note.title + " — Notes For More";

    // Collect cells for this note, sorted chronologically
    const cellIds = idx.cellsByNoteId[noteId] || [];
    const cells   = cellIds
      .map((cid) => store.cells[cid])
      .filter(Boolean)
      .sort((a, b) => a.createdAt - b.createdAt);

    if (cells.length === 0) {
      Els.timeline.innerHTML = `<div style="color:var(--text-3); padding: 2rem 0; font-size:0.85rem; letter-spacing:0.04em;">No cells yet. Type below and press Enter.</div>`;
      return;
    }

    // Build a set of cell IDs that have an outgoing EDIT relationship
    // (so we can visually mark them as superseded)
    const supersededIds = new Set(
      store.relationships
        .filter((r) => r.relationshipType === "EDIT")
        .map((r) => r.from)
    );

    Els.timeline.innerHTML = cells.map((cell) => {
      const incomingRels = idx.relationshipsByTo[cell.id] || [];
      const relationshipBadge = incomingRels.map((rel) => {
        const parentCell = store.cells[rel.from];
        const preview = parentCell ? truncate(parentCell.content, 40) : "[deleted]";
        const labelMap = {
          REPLY: "reply to", ANSWER: "answer to", EDIT: "edited from",
          REFERENCE: "reference", ADDITION: "added to",
        };
        const label = labelMap[rel.relationshipType] || rel.relationshipType.toLowerCase();
        return `<span class="cell-relationship-badge" data-scroll-to="${rel.from}">↳ ${label}: "${escHtml(preview)}"</span>`;
      }).join("");

      const superseded = supersededIds.has(cell.id);

      return `
        <div
          class="cell"
          data-id="${cell.id}"
          data-category="${cell.category}"
          data-status="${cell.status}"
          data-superseded="${superseded}"
        >
          <div class="cell-gutter">
            <span class="cell-time">${fmtTimestamp(cell.createdAt)}</span>
            <span class="cell-dot"></span>
          </div>
          <div class="cell-body">
            ${relationshipBadge}
            <span class="cell-badge">${cell.category}</span>
            <div class="cell-content">${escHtml(cell.content)}</div>
          </div>
        </div>
      `;
    }).join("");

    // Bind scroll-to on relationship badges
    Els.timeline.querySelectorAll("[data-scroll-to]").forEach((badge) => {
      badge.addEventListener("click", () => {
        const target = Els.timeline.querySelector(`[data-id="${badge.dataset.scrollTo}"]`);
        if (target) {
          target.scrollIntoView({ behavior: "smooth", block: "center" });
          target.style.outline = "1px solid var(--text-2)";
          setTimeout(() => { target.style.outline = ""; }, 1500);
        }
      });
    });
  }

  // ============================================================
  // INPUT BAR
  // ============================================================
  function autoResizeInput() {
    Els.cellInput.style.height = "auto";
    Els.cellInput.style.height = Math.min(Els.cellInput.scrollHeight, 160) + "px";
  }

  Els.cellInput.addEventListener("input", autoResizeInput);

  Els.cellInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submitCell();
    }
  });

  Els.submitCell.addEventListener("click", submitCell);

  function submitCell() {
    const content = Els.cellInput.value.trim();
    if (!content) return;

    const opts = { noteId, content };
    if (pendingLink) {
      opts.parentId = pendingLink.parentId;
      opts.relType  = pendingLink.relType;
      opts.category = pendingLink.relType === "ANSWER" ? "NOTE"
                    : pendingLink.relType === "EDIT"   ? getCell(pendingLink.parentId)?.category || "NOTE"
                    : "NOTE";
    }

    addCell(opts);
    Els.cellInput.value = "";
    autoResizeInput();
    clearPendingLink();
    renderTimeline();
    scrollToBottom();
  }

  function getCell(cellId) {
    return loadStore().cells[cellId] || null;
  }

  function scrollToBottom() {
    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
  }

  // ============================================================
  // PENDING LINK (context menu state)
  // ============================================================
  function setPendingLink(parentId, relType) {
    pendingLink = { parentId, relType };
    const cell = getCell(parentId);
    const preview = cell ? truncate(cell.content, 50) : parentId;
    Els.replyContextText.textContent = `${relType}: "${preview}"`;
    Els.replyContext.style.display = "flex";
    Els.cellInput.focus();
  }

  function clearPendingLink() {
    pendingLink = null;
    Els.replyContext.style.display = "none";
    Els.replyContextText.textContent = "";
  }

  Els.cancelContext.addEventListener("click", clearPendingLink);

  // ============================================================
  // CONTEXT MENU
  // ============================================================
  let contextTargetId = null;

  function showContextMenu(x, y, cellId) {
    contextTargetId = cellId;
    const menu = Els.contextMenu;
    menu.style.display = "block";

    // Position safely within viewport
    const menuW = 200;
    const menuH = menu.scrollHeight || 300;
    const vw = window.innerWidth, vh = window.innerHeight;
    menu.style.left = (x + menuW > vw ? vw - menuW - 12 : x) + "px";
    menu.style.top  = (y + menuH > vh ? vh - menuH - 12 : y) + "px";
  }

  function hideContextMenu() {
    Els.contextMenu.style.display = "none";
    contextTargetId = null;
  }

  // Right-click on a cell
  Els.timeline.addEventListener("contextmenu", (e) => {
    const cell = e.target.closest(".cell");
    if (!cell) return;
    e.preventDefault();
    showContextMenu(e.clientX, e.clientY, cell.dataset.id);
  });

  // Long-press on mobile
  let longPressTimer = null;
  Els.timeline.addEventListener("touchstart", (e) => {
    const cell = e.target.closest(".cell");
    if (!cell) return;
    longPressTimer = setTimeout(() => {
      const touch = e.touches[0];
      showContextMenu(touch.clientX, touch.clientY, cell.dataset.id);
    }, 600);
  }, { passive: true });

  Els.timeline.addEventListener("touchend", () => {
    clearTimeout(longPressTimer);
  }, { passive: true });

  Els.timeline.addEventListener("touchmove", () => {
    clearTimeout(longPressTimer);
  }, { passive: true });

  // Dismiss on outside click
  document.addEventListener("click", (e) => {
    if (!Els.contextMenu.contains(e.target)) hideContextMenu();
  });

  // Context Menu Actions
  Els.contextMenu.addEventListener("click", (e) => {
    const btn = e.target.closest(".ctx-item");
    if (!btn || !contextTargetId) return;

    const action = btn.dataset.action;
    const cellId = contextTargetId;
    hideContextMenu();

    // --- CATEGORY CHANGE ---
    if (action.startsWith("cat-")) {
      mutateCellMeta(cellId, { category: action.slice(4) });
      renderTimeline();
      return;
    }

    // --- CREATE LINKED CELL ---
    if (action.startsWith("link-")) {
      const relType = action.slice(5); // ADD | REPLY | ANSWER | EDIT | REFERENCE
      // Map ADD to the stored relationship type ADDITION
      const storedType = relType === "ADD" ? "ADDITION" : relType;
      setPendingLink(cellId, storedType);
      return;
    }

    // --- STATUS ---
    if (action === "status-DELETED") {
      softDeleteCell(cellId);
      renderTimeline();
      return;
    }
  });

  // ============================================================
  // PROMPT GENERATOR
  // ============================================================
  Els.generatePromptBtn.addEventListener("click", () => {
    const prompt = generatePrompt();
    Els.promptOutput.textContent = prompt;
    Els.promptModal.classList.add("show");
  });

  Els.closePromptModal.addEventListener("click", () => {
    Els.promptModal.classList.remove("show");
  });

  Els.promptModal.addEventListener("click", (e) => {
    if (e.target === Els.promptModal) Els.promptModal.classList.remove("show");
  });

  Els.copyPrompt.addEventListener("click", () => {
    navigator.clipboard.writeText(Els.promptOutput.textContent).then(() => {
      Els.copyPrompt.textContent = "Copied!";
      setTimeout(() => { Els.copyPrompt.textContent = "Copy"; }, 2000);
    });
  });

  function generatePrompt() {
    const store = loadStore();
    const idx   = buildIndexes(store);
    const note  = store.notes[noteId];
    if (!note) return "Note not found.";

    const cellIds = idx.cellsByNoteId[noteId] || [];
    const allCells = cellIds
      .map((id) => store.cells[id])
      .filter(Boolean)
      .sort((a, b) => a.createdAt - b.createdAt);

    // Active cells only
    const active = allCells.filter((c) => c.status === "ACTIVE");

    // Cells superseded by an EDIT relationship (old versions)
    const supersededIds = new Set(
      store.relationships
        .filter((r) => r.relationshipType === "EDIT")
        .map((r) => r.from)
    );

    function fmtDate(ts) {
      return new Date(ts).toLocaleString("en-GB", {
        day: "2-digit", month: "short", year: "numeric",
        hour: "2-digit", minute: "2-digit"
      });
    }

    // --- Follow EDIT chain to find the latest version of a cell ---
    function getLatestVersion(cellId) {
      let current = cellId;
      const seen = new Set();
      while (true) {
        seen.add(current);
        const outEdits = (idx.relationshipsByFrom[current] || [])
          .filter((r) => r.relationshipType === "EDIT");
        if (outEdits.length === 0) break;
        const nextId = outEdits[0].to;
        if (seen.has(nextId)) break;
        current = nextId;
      }
      return current;
    }

    // --- Build the tree ---
    // Step 1: Collect only non-EDIT relationships within this note
    // Step 2: Remap parents — if a parent was superseded (edited),
    //         redirect the child to hang off the LATEST version of that parent.
    //         This way replies/additions to old cells show under the new version.

    const childIds = new Set();       // cells that are nested children (non-EDIT targets)
    const childrenOf = {};            // canonicalParentId → [ { rel, cell } ]

    store.relationships.forEach((rel) => {
      const fromCell = store.cells[rel.from];
      const toCell   = store.cells[rel.to];
      if (!fromCell || !toCell) return;
      if (fromCell.noteId !== noteId || toCell.noteId !== noteId) return;

      // Skip EDIT relationships — they are handled as replacements, not nesting
      if (rel.relationshipType === "EDIT") return;

      // The child is the `to` cell (or its latest version if it was edited)
      const childId = getLatestVersion(rel.to);
      const childCell = store.cells[childId];
      if (!childCell) return;

      // The parent is the latest version of the `from` cell
      const parentId = getLatestVersion(rel.from);

      childIds.add(childId);

      if (!childrenOf[parentId]) childrenOf[parentId] = [];
      childrenOf[parentId].push({ rel, cell: childCell });
    });

    // Root cells: active, latest version (not superseded), and not a child
    const roots = active.filter(
      (c) => !supersededIds.has(c.id) && !childIds.has(c.id)
    );

    // --- Recursive tree renderer ---
    const visited = new Set();

    function renderTree(cell, depth) {
      if (visited.has(cell.id)) return [];
      visited.add(cell.id);

      const indent = "    ".repeat(depth);
      const lines = [];

      if (depth === 0) {
        lines.push(`[${fmtDate(cell.createdAt)}] [${cell.category}] ${cell.content}`);
      } else {
        lines.push(`${indent}[${fmtDate(cell.createdAt)}] ${cell.content}`);
      }

      // Gather children, sorted chronologically
      const children = (childrenOf[cell.id] || [])
        .filter((ch) => ch.cell.status === "ACTIVE")
        .sort((a, b) => a.cell.createdAt - b.cell.createdAt);

      children.forEach((ch) => {
        const relLabel = ch.rel.relationshipType.toLowerCase();
        const childIndent = "    ".repeat(depth + 1);
        lines.push(`${childIndent}↳ ${relLabel}`);
        const sub = renderTree(ch.cell, depth + 2);
        lines.push(...sub);
      });

      return lines;
    }

    // Unresolved questions
    const currentCells = active.filter((c) => !supersededIds.has(c.id));
    const unresolvedQuestions = currentCells.filter((c) => {
      if (c.category !== "QUESTION") return false;
      const outgoing = idx.relationshipsByFrom[c.id] || [];
      return !outgoing.some((r) => r.relationshipType === "ANSWER");
    });

    // --- Assemble the prompt ---
    const lines = [];

    lines.push(`==============================`);
    lines.push(`PROJECT: ${note.title}`);
    lines.push(`Generated: ${fmtDate(Date.now())}`);
    lines.push(`==============================\n`);

    // --- TREE TIMELINE ---
    lines.push(`── TIMELINE ──────────────────`);
    roots.forEach((root) => {
      const tree = renderTree(root, 0);
      lines.push(...tree);
      lines.push("");
    });

    // --- OPEN QUESTIONS ---
    if (unresolvedQuestions.length > 0) {
      lines.push(`── OPEN QUESTIONS ────────────`);
      unresolvedQuestions.forEach((c) => {
        lines.push(`  ? ${c.content}`);
      });
      lines.push("");
    }

    lines.push(`==============================`);
    lines.push(`Total active cells: ${currentCells.length}`);
    lines.push(`==============================`);

    return lines.join("\n");
  }

  // ============================================================
  // INIT
  // ============================================================
  function init() {
    noteId = getNoteId();
    if (!noteId) {
      Els.noteTitleDisplay.textContent = "No note selected.";
      return;
    }
    renderTimeline();
  }

  init();

})();
