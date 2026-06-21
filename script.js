(() => {
  const Elements = {
    deleteBtn : document.querySelectorAll(".deleteBtn"),
    exportBtn : document.getElementById("exportBtn"),
    importBtn : document.getElementById("importBtn"),
    addBtn : document.getElementById("addBtn"),
    modalOut : document.getElementById("modalOut"),
    modalInner : document.getElementById("modalInner"),
    closeModal : document.getElementById("closeModal"),
  }

  function addModal() {
    Elements.modalOut.classList.add("show")
    return
  }

  function closeModal(e) {
    if (e.target !== Elements.closeModal &&
        e.target !== Elements.modalOut) {
      return
    }
    
    Elements.modalOut.classList.remove("show")
    return
    
  }
  
  Elements.addBtn.addEventListener(("click"), addModal);
  Elements.importBtn.addEventListener(("click"), addModal);
  Elements.exportBtn.addEventListener(("click"), addModal);
  Elements.deleteBtn.forEach((btns) => {
    btns.addEventListener(("click"), addModal);
  })
  Elements.modalOut.addEventListener(("click"), closeModal);
  
  
})();