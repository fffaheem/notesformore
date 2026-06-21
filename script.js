(() => {
  const Elements = {
    deleteBtn : document.querySelectorAll(".deleteBtn"),
    exportBtn : document.getElementById("exportBtn"),
    importBtn : document.getElementById("importBtn"),
    addBtn : document.getElementById("addBtn"),
    modal : document.getElementById("modal"),
  }

  function addNote(e) {
    console.log("hello",e.target);
  }

  
  Elements.addBtn.addEventListener(("click"), addNote);
  
})();