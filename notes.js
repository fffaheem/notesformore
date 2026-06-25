(() => {
    const titleDisplay = document.getElementById('noteTitleDisplay');
    const bodyInput = document.getElementById('noteBodyInput');
    const saveBtn = document.getElementById('saveBtn');
    const saveStatus = document.getElementById('saveStatus');

    let currentNoteId = null;
    let currentNote = null;

    function getNoteIdFromUrl() {
        const hash = window.location.hash;
        return hash ? hash.substring(1) : null;
    }

    function readLocalStorage() {
        return JSON.parse(localStorage.getItem("NotesForMore")) || [];
    }

    function saveToLocalStorage(items) {
        localStorage.setItem("NotesForMore", JSON.stringify(items));
    }

    function loadNote() {
        currentNoteId = getNoteIdFromUrl();
        if (!currentNoteId) {
            titleDisplay.innerText = "Error: Note not found";
            bodyInput.disabled = true;
            saveBtn.disabled = true;
            return;
        }

        const items = readLocalStorage();
        currentNote = items.find(n => n.id === currentNoteId);

        if (!currentNote) {
            titleDisplay.innerText = "Error: Note not found";
            bodyInput.disabled = true;
            saveBtn.disabled = true;
            return;
        }

        titleDisplay.innerText = currentNote.Title;
        // Body was an object in the original logic, let's treat it as a string if it's not object, or store string inside it.
        // Original logic: "Body": {}
        let bodyContent = "";
        if (typeof currentNote.Body === 'string') {
            bodyContent = currentNote.Body;
        } else if (currentNote.Body && currentNote.Body.content) {
            bodyContent = currentNote.Body.content;
        }

        bodyInput.value = bodyContent;
        saveStatus.innerText = "Loaded";
        setTimeout(() => saveStatus.innerText = "", 2000);
    }

    function saveNote() {
        if (!currentNoteId) return;

        const items = readLocalStorage();
        const noteIndex = items.findIndex(n => n.id === currentNoteId);

        if (noteIndex === -1) return;

        saveStatus.innerText = "Saving...";

        items[noteIndex].Body = bodyInput.value;

        saveToLocalStorage(items);

        setTimeout(() => {
            saveStatus.innerText = "All changes saved";
            setTimeout(() => saveStatus.innerText = "", 2000);
        }, 500);
    }

    // Auto-save logic
    let timeoutId;
    bodyInput.addEventListener('input', () => {
        saveStatus.innerText = "Unsaved changes...";
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            saveNote();
        }, 1000); // auto save after 1 second of inactivity
    });

    saveBtn.addEventListener('click', saveNote);

    function init() {
        loadNote();
    }

    init();
})();
