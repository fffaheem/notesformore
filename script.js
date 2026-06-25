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
        elems += `<a href="./notes.html#${items[i]["Title"]}" class = 'notes'>`
        elems += `<div>`
        elems += `<div data-title="${items[i]["Title"]}"> ${items[i]["Title"]} </div>`
        elems += `<p style="font-size: small;">${items[i]["Date"]}</p>`
        elems += `</div>`
        elems += `<button class='deleteEditBtn' data-title="${items[i]["Title"]}"> Edit / Delete</button>`
        elems += "</a> "
      }
      Elements.notesContainer.innerHTML = elems
    }
  }

  // To check rendered notes button press
  function checkNotes(e) {
    if (e.target.classList.contains("deleteEditBtn")) {
      Elements.modalOut.classList.add("show")
      Elements.modalBody.dataset.type = "EditDeleteNote"
      Elements.modalBody.innerHTML = `
      <textarea name="noteTitle" id="noteTitle">${e.target.dataset.title}</textarea>
      <div style="flex-grow:1"></div>
      <button id="editNote" data-edit="${e.target.dataset.title}" class="modalBtn">Edit</button>
      <button id="deleteNote" data-delete="${e.target.dataset.title}" class="modalBtn">Delete</button>
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

    if (type === "EditDeleteNote") {
      if (e.target.id == "editNote") {
        editNote(e)
      }
      if (e.target.id == "deleteNote"){
        deleteNote(e)
      }
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

  function editNote(e) {
    const noteTitle = document.getElementById("noteTitle");
    const items = readLocalStorage();
  
    const updatedItems = items.map(item => {
      if (item.Title === e.target.dataset.edit) {
        return {
          ...item,
          Title: getUniqueTitle(noteTitle.value)
        };
      }
  
      return item;
    });
  
    localStorage.setItem("NotesForMore", JSON.stringify(updatedItems));
  
    Elements.modalOut.classList.remove("show");
    renderNotes();
  }

  function deleteNote(e) {
    let items = readLocalStorage();
    const remaining = items.filter((data) => {
      return data.Title !== e.target.dataset.delete
    })
    localStorage.setItem("NotesForMore", JSON.stringify(remaining))
    Elements.modalOut.classList.remove("show")  // closing the modal
    renderNotes() // Render Notes
  }

  // this is just temporary for now
  function tmpModal() {
    Elements.modalOut.classList.add("show")
    Elements.modalBody.dataset.type = "Default"
    Elements.modalBody.innerHTML = `
    <h1 style="text-align: center;">Default</h1>
    `;
    return
  }

  // check notes to open edit/delete button modal on rendered notes
  Elements.notesContainer.addEventListener(("click"), checkNotes);
  // openAddModal to open Modal when add button is pressed
  Elements.addBtn.addEventListener(("click"), openAddModal);
  // import modal open
  Elements.importBtn.addEventListener(("click"), tmpModal);
  // export modal open
  Elements.exportBtn.addEventListener(("click"), tmpModal);
  // Deciding what modal should be expecting like add or delete note
  Elements.modalOut.addEventListener(("click"), checkModal);


  function init() {
    renderNotes()
  }

  init();
  
})();