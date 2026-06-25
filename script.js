/**
 * script.js — Index Page Logic
 * Handles: Note list rendering, create/delete notes, export, import (with migration)
 */
(() => {

  // ============================================================
  // STORE — All data lives in a single localStorage key "NFM_V2"
  // {
  //   notes: { [noteId]: { id, title, createdAt, updatedAt } }
  //   cells: { [cellId]: Cell }
  //   relationships: [ Relationship ]
  // }
  // ============================================================

  const STORE_KEY = "NFM_V2";
  const LEGACY_KEY = "NotesForMore";

  function loadStore() {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) return JSON.parse(raw);

    // First run: migrate from legacy format if it exists
    const legacy = localStorage.getItem(LEGACY_KEY);
    if (legacy) return migrateLegacy(JSON.parse(legacy));

    return { notes: {}, cells: {}, relationships: [] };
  }

  function saveStore(store) {
    localStorage.setItem(STORE_KEY, JSON.stringify(store));
  }

  function generateId() {
    return typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : Date.now().toString(36) + Math.random().toString(36).slice(2);
  }

  // ============================================================
  // MIGRATION from old [ { id, Title, Date, Time, Body } ] format
  // ============================================================
  function migrateLegacy(legacyItems) {
    const store = { notes: {}, cells: {}, relationships: [] };
    const now = Date.now();

    legacyItems.forEach((old) => {
      const noteId = old.id || generateId();

      // Parse old date strings into a rough timestamp
      const createdAt = now;

      store.notes[noteId] = {
        id: noteId,
        title: old.Title || "Untitled",
        createdAt,
        updatedAt: createdAt,
      };

      // Convert the body to an initial cell (if exists)
      const bodyText = typeof old.Body === "string" ? old.Body.trim() : "";
      if (bodyText) {
        const cellId = generateId();
        store.cells[cellId] = {
          id: cellId,
          noteId,
          content: bodyText,
          createdAt,
          updatedAt: createdAt,
          category: "NOTE",
          status: "ACTIVE",
          metadata: {},
        };
      }
    });

    return store;
  }

  // ============================================================
  // NOTE CRUD
  // ============================================================
  function createNote(title) {
    const store = loadStore();
    const id = generateId();
    const now = Date.now();
    store.notes[id] = { id, title, createdAt: now, updatedAt: now };
    saveStore(store);
    return id;
  }

  function deleteNote(noteId) {
    const store = loadStore();
    delete store.notes[noteId];
    // Remove all cells belonging to this note
    Object.keys(store.cells).forEach((cid) => {
      if (store.cells[cid].noteId === noteId) delete store.cells[cid];
    });
    // Remove relationships for those cells
    store.relationships = store.relationships.filter(
      (r) => store.cells[r.from] || store.cells[r.to]
    );
    saveStore(store);
  }

  function getNoteStats(noteId, store) {
    const cells = Object.values(store.cells).filter(
      (c) => c.noteId === noteId && c.status === "ACTIVE"
    );
    return {
      total: cells.length,
      questions: cells.filter((c) => c.category === "QUESTION").length,
      ideas: cells.filter((c) => c.category === "IDEA").length,
    };
  }

  // ============================================================
  // RENDER
  // ============================================================
  const Els = {
    container: document.getElementById("notesContainer"),
    addBtn: document.getElementById("addBtn"),
    exportBtn: document.getElementById("exportBtn"),
    importBtn: document.getElementById("importBtn"),
    modalOut: document.getElementById("modalOut"),
    modalBody: document.getElementById("modalBody"),
    closeModal: document.getElementById("closeModal"),
    fileInput: document.getElementById("fileInput"),
  };

  function fmt(ts) {
    return new Date(ts).toLocaleDateString("en-GB", {
      day: "2-digit", month: "short", year: "numeric"
    });
  }

  function renderNotes() {
    const store = loadStore();
    const notes = Object.values(store.notes).sort((a, b) => b.createdAt - a.createdAt);

    if (notes.length === 0) {
      Els.container.innerHTML = `<div class="empty-state">No notes yet. Press "+ New Note" to begin.</div>`;
      return;
    }

    Els.container.innerHTML = notes.map((note) => {
      const stats = getNoteStats(note.id, store);
      return `
        <div class="note-card" id="card-${note.id}">
          <div class="note-card-header">
            <a href="notes.html#${note.id}" class="note-card-title">${escHtml(note.title)}</a>
            <div class="note-card-meta">${fmt(note.createdAt)}</div>
          </div>
          <div class="note-card-stats">
            <span>${stats.total} cell${stats.total !== 1 ? "s" : ""}</span>
            ${stats.questions ? `<span>${stats.questions} question${stats.questions !== 1 ? "s" : ""}</span>` : ""}
            ${stats.ideas ? `<span>${stats.ideas} idea${stats.ideas !== 1 ? "s" : ""}</span>` : ""}
          </div>
          <div class="note-card-actions">
            <a href="notes.html#${note.id}" class="btn btn-ghost">Open</a>
            <button class="btn btn-danger delete-note-btn" data-id="${note.id}">Delete</button>
          </div>
        </div>
      `;
    }).join("");
  }

  function escHtml(str) {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  // ============================================================
  // MODALS
  // ============================================================
  function openModal(html, extraButtons = []) {
    Els.modalBody.innerHTML = html;
    Els.modalOut.classList.add("show");
    extraButtons.forEach(({ id, fn }) => {
      const el = document.getElementById(id);
      if (el) el.addEventListener("click", fn);
    });
  }

  function closeModal() {
    Els.modalOut.classList.remove("show");
    Els.modalBody.innerHTML = "";
  }

  // ADD NOTE
  function openAddModal() {
    openModal(
      `<h2>New Note</h2>
       <input type="text" id="newNoteTitle" placeholder="Note title..." autofocus>
       <div class="modal-actions">
         <button id="confirmAdd" class="btn btn-primary">Create</button>
       </div>`,
      [{ id: "confirmAdd", fn: () => {
          const inp = document.getElementById("newNoteTitle");
          const title = inp ? inp.value.trim() : "";
          if (!title) return;
          const id = createNote(title);
          closeModal();
          renderNotes();
          // Navigate to the note immediately
          window.location.href = `notes.html#${id}`;
        }
      }]
    );
    // Allow Enter key to confirm
    setTimeout(() => {
      const inp = document.getElementById("newNoteTitle");
      if (inp) {
        inp.focus();
        inp.addEventListener("keydown", (e) => {
          if (e.key === "Enter") document.getElementById("confirmAdd")?.click();
        });
      }
    }, 50);
  }

  // DELETE NOTE
  function openDeleteModal(noteId) {
    const store = loadStore();
    const note = store.notes[noteId];
    if (!note) return;
    openModal(
      `<h2>Delete Note?</h2>
       <p>Permanently remove "<strong>${escHtml(note.title)}</strong>" and all its cells?<br>This cannot be undone.</p>
       <div class="modal-actions">
         <button id="confirmDelete" class="btn btn-danger">Delete</button>
       </div>`,
      [{ id: "confirmDelete", fn: () => {
          deleteNote(noteId);
          closeModal();
          renderNotes();
        }
      }]
    );
  }

  // EXPORT
  function openExportModal() {
    const store = loadStore();
    const notes = Object.values(store.notes).sort((a, b) => b.createdAt - a.createdAt);
    if (notes.length === 0) {
      openModal(`<h2>Export</h2><p>No notes to export.</p>`);
      return;
    }

    const list = notes.map((n) => `
      <label class="checkbox-item">
        <input type="checkbox" class="export-cb" value="${n.id}" checked>
        <span>${escHtml(n.title)}</span>
      </label>
    `).join("");

    openModal(
      `<h2>Export Notes</h2>
       <div class="checkbox-list">${list}</div>
       <div class="modal-actions">
         <button id="exportSelected" class="btn btn-ghost">Export Selected</button>
         <button id="exportAll" class="btn btn-primary">Export All</button>
       </div>`,
      [
        { id: "exportAll", fn: () => doExport(null) },
        { id: "exportSelected", fn: () => {
            const ids = Array.from(document.querySelectorAll(".export-cb:checked")).map(cb => cb.value);
            doExport(ids);
          }
        }
      ]
    );
  }

  function doExport(noteIds) {
    const store = loadStore();
    let exportNotes = Object.values(store.notes);
    if (noteIds) exportNotes = exportNotes.filter(n => noteIds.includes(n.id));

    const exportedNoteIds = new Set(exportNotes.map(n => n.id));
    const exportCells = Object.values(store.cells).filter(c => exportedNoteIds.has(c.noteId));
    const exportedCellIds = new Set(exportCells.map(c => c.id));
    const exportRels = store.relationships.filter(r => exportedCellIds.has(r.from) || exportedCellIds.has(r.to));

    const payload = {
      version: "NFM_V2",
      exportedAt: Date.now(),
      notes: Object.fromEntries(exportNotes.map(n => [n.id, n])),
      cells: Object.fromEntries(exportCells.map(c => [c.id, c])),
      relationships: exportRels,
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `notes-export-${Date.now()}.json`;
    a.click();
    closeModal();
  }

  // IMPORT
  let pendingImport = null;

  function openImportModal() {
    pendingImport = null;
    openModal(
      `<h2>Import Notes</h2>
       <div id="dropZone" class="drop-zone">
         Drag & drop a .json file here<br>or click to browse
       </div>
       <div id="importStatus" class="import-status"></div>
       <div id="importActions" class="import-actions" style="display:none;">
         <button id="importMerge" class="btn btn-ghost">Merge with Existing</button>
         <button id="importReplace" class="btn btn-danger">Wipe & Replace All</button>
       </div>`
    );

    const dropZone = document.getElementById("dropZone");
    dropZone.addEventListener("click", () => Els.fileInput.click());
    dropZone.addEventListener("dragover", (e) => { e.preventDefault(); dropZone.classList.add("dragover"); });
    dropZone.addEventListener("dragleave", () => dropZone.classList.remove("dragover"));
    dropZone.addEventListener("drop", (e) => {
      e.preventDefault();
      dropZone.classList.remove("dragover");
      if (e.dataTransfer.files[0]) processImportFile(e.dataTransfer.files[0]);
    });

    // Wire buttons after content is set
    setTimeout(() => {
      document.getElementById("importMerge")?.addEventListener("click", () => doImport(false));
      document.getElementById("importReplace")?.addEventListener("click", () => doImport(true));
    }, 50);
  }

  function processImportFile(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const status = document.getElementById("importStatus");
      const actions = document.getElementById("importActions");
      try {
        const data = JSON.parse(e.target.result);

        // Accept NFM_V2 format or legacy array format
        if (data.version === "NFM_V2") {
          pendingImport = data;
        } else if (Array.isArray(data)) {
          // Legacy array of notes — migrate first
          pendingImport = { ...migrateLegacy(data), version: "NFM_V2", exportedAt: Date.now() };
        } else {
          throw new Error("Unrecognized format");
        }

        const noteCount = Object.keys(pendingImport.notes).length;
        status.textContent = `✓ Loaded ${noteCount} note${noteCount !== 1 ? "s" : ""}. Choose an action.`;
        actions.style.display = "flex";
      } catch (err) {
        status.textContent = "⚠ Could not parse file. Ensure it is a valid .json export.";
        if (actions) actions.style.display = "none";
      }
    };
    reader.readAsText(file);
  }

  function doImport(replace) {
    if (!pendingImport) return;
    const store = replace ? { notes: {}, cells: {}, relationships: [] } : loadStore();

    // Merge notes
    Object.assign(store.notes, pendingImport.notes || {});
    // Merge cells
    Object.assign(store.cells, pendingImport.cells || {});
    // Merge relationships (avoid duplicates by id)
    const relIds = new Set(store.relationships.map(r => r.id));
    (pendingImport.relationships || []).forEach(r => {
      if (!relIds.has(r.id)) store.relationships.push(r);
    });

    saveStore(store);
    closeModal();
    renderNotes();
  }

  // ============================================================
  // EVENT LISTENERS — Index Page
  // ============================================================
  Els.addBtn.addEventListener("click", openAddModal);
  Els.exportBtn.addEventListener("click", openExportModal);
  Els.importBtn.addEventListener("click", () => { openImportModal(); });
  Els.fileInput.addEventListener("change", (e) => {
    if (e.target.files[0]) {
      openImportModal();
      // Give the modal time to render before processing
      setTimeout(() => processImportFile(e.target.files[0]), 100);
      e.target.value = "";
    }
  });

  Els.closeModal.addEventListener("click", closeModal);
  Els.modalOut.addEventListener("click", (e) => { if (e.target === Els.modalOut) closeModal(); });

  Els.container.addEventListener("click", (e) => {
    const deleteBtn = e.target.closest(".delete-note-btn");
    if (deleteBtn) {
      openDeleteModal(deleteBtn.dataset.id);
      return;
    }

    // Let standard link clicks navigate normally
    if (e.target.closest("a")) return;

    const card = e.target.closest(".note-card");
    if (card) {
      const noteId = card.id.replace("card-", "");
      window.location.href = `notes.html#${noteId}`;
    }
  });

  // ============================================================
  // INIT
  // ============================================================
  renderNotes();

})();