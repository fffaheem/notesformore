(() => {
  const Elements = {
    exportBtn: document.getElementById("exportBtn"),
    importBtn: document.getElementById("importBtn"),
    addBtn: document.getElementById("addBtn"),
    modalOut: document.getElementById("modalOut"),
    modalInner: document.getElementById("modalInner"),
    modalBody: document.getElementById("modalBody"),
    closeModal: document.getElementById("closeModal"),
    notesContainer: document.getElementById("notesContainer"),
  }

  // Utilities
  function generateId() {
    return crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).substring(2);
  }

  function getFormattedDateTime() {
    const now = new Date();
    const date = now.toLocaleDateString('en-GB'); // DD/MM/YYYY
    const time = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
    return { "Date": date, "Time": time };
  }

  // reading 
  function readLocalStorage() {
    let items = JSON.parse(localStorage.getItem("NotesForMore")) || [];
    let needsUpdate = false;
    // Migration: add IDs to old notes that don't have them
    items = items.map(item => {
      if (!item.id) {
        needsUpdate = true;
        return { ...item, id: generateId() };
      }
      return item;
    });
    if (needsUpdate) {
      localStorage.setItem("NotesForMore", JSON.stringify(items));
    }
    return items;
  }

  // Writing
  function writeLocalStorage(newData) {
    let items = readLocalStorage()
    items.push(newData)
    localStorage.setItem("NotesForMore", JSON.stringify(items))
  }

  // To render Notes on the screen
  function renderNotes() {
    let items = readLocalStorage()
    if (items.length === 0) {
      Elements.notesContainer.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: var(--text-secondary); padding: 2rem;">No Notes Yet. Click "Add Note" to create one.</div>`
      return
    } else {
      let elems = ``
      for (let i = 0; i < items.length; i++) {
        elems += `<div class='notes'>`
        elems += `<a href="./notes.html#${items[i].id}" class="notediv">`
        elems += `<div class="note-title">${items[i].Title}</div>`
        elems += `<div class="note-date">${items[i].Date} • ${items[i].Time}</div>`
        elems += `</a>`
        elems += `<div style="display:flex; gap:0.5rem;">`
        elems += `<button class='secondary-btn deleteEditBtn editBtn' data-id="${items[i].id}">Edit</button>`
        elems += `<button class='secondary-btn deleteEditBtn delBtn' data-id="${items[i].id}">Delete</button>`
        elems += `</div>`
        elems += "</div> "
      }
      Elements.notesContainer.innerHTML = elems
    }
  }

  // To check rendered notes button press
  function checkNotes(e) {
    if (e.target.classList.contains("editBtn") || e.target.classList.contains("delBtn")) {
      const id = e.target.dataset.id;
      const items = readLocalStorage();
      const note = items.find(n => n.id === id);
      if (!note) return;

      Elements.modalOut.classList.add("show")
      Elements.modalBody.dataset.type = "EditDeleteNote"
      
      if (e.target.classList.contains("editBtn")) {
        Elements.modalBody.innerHTML = `
        <h2>Edit Note Title</h2>
        <input type="text" name="noteTitle" id="noteTitle" value="${note.Title}">
        <div class="action-btns">
          <button id="editNote" data-id="${id}" class="primary-btn">Save Changes</button>
        </div>
        `;
      } else {
        Elements.modalBody.innerHTML = `
        <h2>Delete Note?</h2>
        <p>Are you sure you want to delete "${note.Title}"?</p>
        <div class="action-btns">
          <button id="deleteNote" data-id="${id}" class="danger-btn">Yes, Delete</button>
        </div>
        `;
      }
      return
    }
  }

  // To open Modal when Add button is pressed
  function openAddModal() {
    Elements.modalOut.classList.add("show")
    Elements.modalBody.dataset.type = "AddNote"
    Elements.modalBody.innerHTML = `
    <h2>New Note</h2>
    <input type="text" name="noteTitle" id="noteTitle" placeholder="Enter note title..." autofocus>
    <div class="action-btns">
        <button id="addNote" class="primary-btn">Create</button>
    </div>
    `;
    return
  }

  // this is for closing modal
  function closeModalCheck(e) {
    if (e.target === Elements.closeModal ||
        e.target === Elements.modalOut) {
      Elements.modalOut.classList.remove("show")
    }
  }

  // Deciding what type of modal and what should it does
  function checkModal(e) {
    closeModalCheck(e)
    
    let type = Elements.modalBody.dataset.type

    if (type === "AddNote") {
      if (e.target.id === "addNote") addNote(e);
    }
    else if (type === "EditDeleteNote") {
      if (e.target.id == "editNote") editNote(e)
      if (e.target.id == "deleteNote") deleteNote(e)
    }
    else if (type === "ExportNote") {
      if (e.target.id === "exportAllBtn") exportNotes(true);
      if (e.target.id === "exportSelectedBtn") exportNotes(false);
    }
    else if (type === "ImportNote") {
      if (e.target.id === "importMergeBtn" || e.target.id === "importReplaceBtn") {
        handleImportFile(e.target.id === "importReplaceBtn");
      }
    }
  }

  // CRUD
  function addNote(e) {
    let noteTitle = document.getElementById("noteTitle")
    if (noteTitle.value.trim() === "") return;

    let date_time = getFormattedDateTime();
    const data = { 
        "id": generateId(), 
        "Title": noteTitle.value.trim(), 
        "Date": date_time["Date"], 
        "Time": date_time["Time"], 
        "Body": {} 
    }
    writeLocalStorage(data)
    Elements.modalOut.classList.remove("show")
    renderNotes()
  }

  function editNote(e) {
    const noteTitle = document.getElementById("noteTitle");
    if (noteTitle.value.trim() === "") return;

    const items = readLocalStorage();
    const updatedItems = items.map(item => {
      if (item.id === e.target.dataset.id) {
        return { ...item, Title: noteTitle.value.trim() };
      }
      return item;
    });
  
    localStorage.setItem("NotesForMore", JSON.stringify(updatedItems));
    Elements.modalOut.classList.remove("show");
    renderNotes();
  }

  function deleteNote(e) {
    let items = readLocalStorage();
    const remaining = items.filter((data) => data.id !== e.target.dataset.id)
    localStorage.setItem("NotesForMore", JSON.stringify(remaining))
    Elements.modalOut.classList.remove("show")
    renderNotes()
  }

  // Export
  function openExportModal() {
    const items = readLocalStorage();
    Elements.modalOut.classList.add("show");
    Elements.modalBody.dataset.type = "ExportNote";
    
    if (items.length === 0) {
        Elements.modalBody.innerHTML = `<h2>Export Notes</h2><p>No notes to export.</p>`;
        return;
    }

    let checkboxes = items.map(item => `
        <label class="note-checkbox-item">
            <input type="checkbox" value="${item.id}" class="export-checkbox" checked>
            <span>${item.Title}</span>
        </label>
    `).join('');

    Elements.modalBody.innerHTML = `
    <h2>Export Notes</h2>
    <p>Select notes to export:</p>
    <div class="note-checkbox-list">
        ${checkboxes}
    </div>
    <div class="action-btns">
        <button id="exportSelectedBtn" class="secondary-btn">Export Selected</button>
        <button id="exportAllBtn" class="primary-btn">Export All</button>
    </div>
    `;
  }

  function exportNotes(exportAll) {
    const items = readLocalStorage();
    let toExport = items;

    if (!exportAll) {
        const selectedIds = Array.from(document.querySelectorAll('.export-checkbox:checked')).map(cb => cb.value);
        toExport = items.filter(item => selectedIds.includes(item.id));
    }

    if (toExport.length === 0) {
        alert("No notes selected for export.");
        return;
    }

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(toExport, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "notes_export.json");
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    
    Elements.modalOut.classList.remove("show");
  }

  // Import
  let pendingImportData = null;

  function openImportModal() {
    pendingImportData = null;
    Elements.modalOut.classList.add("show");
    Elements.modalBody.dataset.type = "ImportNote";
    
    Elements.modalBody.innerHTML = `
    <h2>Import Notes</h2>
    <div id="dropZone" class="drag-drop-zone">
        Drag & Drop a .json file here <br> or <br>
        <span style="color: var(--primary-color); text-decoration: underline;">Click to browse</span>
        <input type="file" id="fileInput" accept=".json" style="display:none">
    </div>
    <div id="importActions" class="action-btns" style="display:none;">
        <button id="importMergeBtn" class="secondary-btn">Merge with Existing</button>
        <button id="importReplaceBtn" class="danger-btn">Wipe & Replace All</button>
    </div>
    <div id="importStatus" style="margin-top: 1rem; font-size: 0.9rem; text-align: center; color: var(--primary-color);"></div>
    `;

    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');

    dropZone.addEventListener('click', () => fileInput.click());
    
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
    });
    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        if (e.dataTransfer.files.length) {
            processImportFile(e.dataTransfer.files[0]);
        }
    });

    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length) {
            processImportFile(e.target.files[0]);
        }
    });
  }

  function processImportFile(file) {
      if (file.type !== "application/json" && !file.name.endsWith('.json')) {
          document.getElementById('importStatus').innerText = "Please select a valid JSON file.";
          return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
          try {
              const data = JSON.parse(e.target.result);
              if (!Array.isArray(data)) throw new Error("JSON must be an array of notes.");
              pendingImportData = data;
              document.getElementById('importStatus').innerText = `Successfully loaded ${data.length} notes. Choose an action below.`;
              document.getElementById('importActions').style.display = 'flex';
          } catch (err) {
              document.getElementById('importStatus').innerText = "Error parsing JSON file.";
              document.getElementById('importActions').style.display = 'none';
          }
      };
      reader.readAsText(file);
  }

  function handleImportFile(replaceAll) {
      if (!pendingImportData) return;
      
      // Ensure imported notes have IDs
      const formattedData = pendingImportData.map(item => {
          if (!item.id) return { ...item, id: generateId() };
          return item;
      });

      if (replaceAll) {
          localStorage.setItem("NotesForMore", JSON.stringify(formattedData));
      } else {
          const currentData = readLocalStorage();
          // Filter out duplicates by ID if any
          const existingIds = new Set(currentData.map(n => n.id));
          const newUniqueNotes = formattedData.filter(n => !existingIds.has(n.id));
          localStorage.setItem("NotesForMore", JSON.stringify([...currentData, ...newUniqueNotes]));
      }

      Elements.modalOut.classList.remove("show");
      renderNotes();
  }

  // Event Listeners
  Elements.notesContainer.addEventListener("click", checkNotes);
  Elements.addBtn.addEventListener("click", openAddModal);
  Elements.importBtn.addEventListener("click", openImportModal);
  Elements.exportBtn.addEventListener("click", openExportModal);
  Elements.modalOut.addEventListener("click", checkModal);

  function init() {
    renderNotes()
  }

  init();
  
})();