(() => {
  const Elements = {
    deleteEditBtn : document.querySelectorAll(".deleteEditBtn"),
    exportBtn : document.getElementById("exportBtn"),
    importBtn : document.getElementById("importBtn"),
    addBtn : document.getElementById("addBtn"),
    modalOut : document.getElementById("modalOut"),
    modalInner : document.getElementById("modalInner"),
    modalBody : document.getElementById("modalBody"),
    closeModal : document.getElementById("closeModal"),
    notesContainer : document.getElementById("notesContainer"),
  }

  // Utilities
  function getFormattedDateTime() {
      const now = new Date();
  
      const date = now.toLocaleDateString('en-GB'); // DD/MM/YYYY
  
      const time = now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true
      });
  
      return {"Date": date,"Time": time};
  }

  function getUniqueTitle(title) {
    const items = readLocalStorage();
  
    let newTitle = title;
    let counter = 1;
  
    const existingTitles = items.map(item => item.Title);
  
    while (existingTitles.includes(newTitle)) {
      newTitle = `${title}-${counter}`;
      counter++;
    }
  
    return newTitle;
  }

  // reading 
  function readLocalStorage() {
    return JSON.parse(localStorage.getItem("NotesForMore")) || [];
  }

  // Writing
  function writeLocalStorage(newData) {
    let items = readLocalStorage()
    if (items.length === 0) {
      localStorage.setItem("NotesForMore", JSON.stringify([newData]))
    } else {
      items.push(newData)
      localStorage.setItem("NotesForMore", JSON.stringify(items))
    }
  }

  // To render Notes on the screen
  function renderNotes() {
    let items = readLocalStorage()
    if (items.length === 0) {
      Elements.notesContainer.innerHTML = `<div style="color: var(--text-color);">No Notes Yet</div>`
      return
    } else {
      let elems = ``
      for (let i = 0; i < items.length; i++) {
        elems += "<div class = 'notes'>"
        elems += `<div>`
        elems += `<div data-title="${items[i]["Title"]}"> ${items[i]["Title"]} </div>`
        elems += `<p style="font-size: small;">${items[i]["Date"]}</p>`
        elems += `</div>`
        elems += `<button class='deleteEditBtn' data-title="${items[i]["Title"]}"> Edit / Delete</button>`
        elems += "</div> "
      }
      Elements.notesContainer.innerHTML = elems
    }
  }

  // To check rendered notes button press
  function checkNotes(e) {
    if (e.target.classList.contains("deleteEditBtn")) {
      Elements.modalOut.classList.add("show")
      Elements.modalBody.dataset.type = "DeleteNote"
      Elements.modalBody.innerHTML = `
        <h1 style="text-align: center;">${e.target.dataset.title}</h1>
        <textarea name="noteTitle" id="noteTitle"></textarea>
      <div style="flex-grow:1"></div>
      <button id="addNote" class="modalBtn">Edit</button>
      <button id="addNote" class="modalBtn">Delete</button>
      `;
      return
    }
  }

  // To open Modal when Add button is pressed
  function openAddModal() {
    Elements.modalOut.classList.add("show")
    Elements.modalBody.dataset.type = "AddNote"
    Elements.modalBody.innerHTML = `
    <h1 style="text-align: center;">Title</h1>
    <textarea name="noteTitle" id="noteTitle"></textarea>
    <button id="addNote" class="modalBtn">Add</button>
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
      addNote(e)
    }

    if (type === "DeleteNote") {
      console.log("Delete wala model function kro")
      return
    }

    if (type === "ImportNote") {
      console.log("Import wala model function kro")
      return
    }

    if (type === "ExportNote") {
      console.log("Export wala model function kro")
      return
    }
    
  }

  // CRUD
  function addNote(e) {
    if (e.target.id !== "addNote") {
      return
    }
    
    let noteTitle = document.getElementById("noteTitle")
    if (noteTitle.value === "") {
      return
    }

    let date_time = getFormattedDateTime();
    const data = { "Title": getUniqueTitle(noteTitle.value), "Date": date_time["Date"], "Time": date_time["Time"], "Body": {} }
    writeLocalStorage(data)
    Elements.modalOut.classList.remove("show")  // closing the modal
    renderNotes() // Render Notes
  }
  

  // this is just default for now
  function openModal() {
    Elements.modalOut.classList.add("show")
    Elements.modalBody.innerHTML = `
    <h1 id="modalType" data-type = "default" style="text-align: center;">Default</h1>
    `;
    return
  }

  // check notes to open edit/delete button modal on rendered notes
  Elements.notesContainer.addEventListener(("click"), checkNotes);
  // openAddModal to open Modal when add button is pressed
  Elements.addBtn.addEventListener(("click"), openAddModal);
  Elements.modalOut.addEventListener(("click"), checkModal);
  Elements.importBtn.addEventListener(("click"), openModal);
  Elements.exportBtn.addEventListener(("click"), openModal);


  function init() {
    renderNotes()
  }

  init();
  
})();