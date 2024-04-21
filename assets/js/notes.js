"use strict";

// initialize and read previously created notes and groups
window.addEventListener("load", function() {  
    document.getElementById("move-to-all").addEventListener("click", function() {
        moveToFolder("0000folder");
    });

    if(localStorage.getItem("0000folder") === null)
        localStorage.setItem("0000folder", "_folderName:AllItems_folders:0_notes:0");

    const allStorageValue = readStorage("0000folder");
    document.getElementById("all-notes-count").innerHTML = 
    `${Number(allStorageValue.notes)} Notes |`;
    document.getElementById("all-folders-count").innerHTML = 
    `${Number(allStorageValue.folders)} Groups`;

    let storageKeys = Object.keys(localStorage);
    for(let key of storageKeys) {
        if(!/^[0-9]/.test(key)) continue;
        const storageValue = readStorage(key);
        if(key.includes("folder")) {
            if(localStorage.getItem(key).includes("AllItems")) continue;
            folderHandler.folderCreator(storageValue.folderName, key, true);
        } else {
            noteHandler.noteCreator(storageValue.noteName, null, key, storageValue.index);
        }
    }
});

// update displayed number of notes
function noteCounter(num) {
    const allStorageValue = readStorage("0000folder");
    document.getElementById("all-notes-count").innerHTML = 
    `${Number(allStorageValue.notes) + num} Notes |`;
    localStorage.setItem(
        "0000folder", 
        "_folderName:AllItems" + 
        `_folders:${allStorageValue.folders}` + 
        `_notes:${Number(allStorageValue.notes) + num}`
    );
} 

// update displayed number of groups
function folderCounter(num) {
    const allStorageValue = readStorage("0000folder");
    document.getElementById("all-folders-count").innerHTML = 
    `${Number(allStorageValue.folders) + num} Groups`;
    localStorage.setItem(
        "0000folder", 
        "_folderName:AllItems" + 
        `_folders:${Number(allStorageValue.folders) + num}` + 
        `_notes:${allStorageValue.notes}`
    );
} 

// note-related functionalities
const noteHandler = {
    noteEditor : document.getElementById("edit-area-container"),
    newNoteTitle : document.getElementById("new-note-name"),
    newNoteText : document.getElementById("new-note-text"),
    notes : {},
    toMoveItemKey : null,
    toEditItemKey : null,
    editMode : 0, // initialize mode(0), create mode(1), edit mode(2) 

    openNoteEditor() {
        folderHandler.closeFolderCreate();
        folderHandler.closeMove();
        this.noteEditor.style.transform = "scale(1) translate(-50%, 0)";
    },

    closeNoteEditor() {
        this.noteEditor.style.transform = "scale(0) translate(-50%, 0)";
        this.newNoteTitle.placeholder = "Title";
        this.newNoteTitle.value = "";
        this.newNoteText.value = "";
    },
    
    delNote(noteDiv, noteIndex,noteMemKey) {
        event.stopPropagation();
        noteCounter(-1);
        noteDiv.remove();
        delete this.notes[noteIndex];
        localStorage.removeItem(noteMemKey);
    },

    // initialize moving note to group
    toMove(noteMemKey) {
        event.stopPropagation();
        this.closeNoteEditor();
        folderHandler.closeFolderCreate();
        this.toMoveItemKey = noteMemKey;
        folderHandler.folderMoveParent.style.transform = "scale(1) translate(-50%, 0)";
    },

    // note edit and create function
    noteCreator(noteName, noteText, prevKey, prevIndex) {
        if(noteName === "") {
            this.newNoteTitle.placeholder = "Title can't be empty!";
            return undefined;
        }

        // when editing an existing note
        if(this.editMode == 2) {
            const storageValue = readStorage(this.toEditItemKey);
            writeStorage.note(
                this.toEditItemKey,
                storageValue.index,
                noteName,
                noteText,
                storageValue.Fldr
                );
            this.notes[storageValue.index].childNodes[1].innerHTML = noteName;
            this.closeNoteEditor();
            return undefined;
        }
    
        let index;
        let k;
        if(this.editMode == 1) {
            let d = new Date();
            k = d.getTime();
            index = "note" + Object.keys(this.notes).length;
            writeStorage.note(k, index, noteName, noteText, "AllItems");

            noteCounter(1);
        } else {
            k = prevKey;
            index = prevIndex;
        }

        // create note DOM element
        let noteContainer = document.createElement("div");
        noteContainer.setAttribute("class", "note");
        noteContainer.innerHTML = 
        `<span class="material-symbols-outlined item-type-icon">description</span>` +
        `<span class="note-title">${noteName}</span>` + 
        `<span class="material-symbols-outlined del-icon">delete</span>`;
        
        // note item click event
        noteContainer.addEventListener("click", function() {
            noteHandler.openNoteEditor();
            noteHandler.editMode = 2;
            noteHandler.toEditItemKey = k;
            noteHandler.newNoteTitle.value = noteName;
            noteHandler.newNoteText.value = noteText;
        });

        // delete icon click event
        noteContainer.childNodes[2].addEventListener("click", function() {
            noteHandler.delNote(noteContainer, index, k);
        });

        document.getElementById("notes-group").appendChild(noteContainer);
        this.notes[index] = noteContainer;
    }
};

// folder-related functionalities
const folderHandler = {
    newFolderInput : document.getElementById("new-folder-name"),
    folderEditor : document.getElementById("folder-edit-container"),
    folders : {},
    folderMoveParent : document.getElementById("move-container"),

    folderCreator(folderName, prevKey, isLoad) {
        if(folderName === "") {
            this.newFolderInput.placeholder = "Title can't be empty!";
            return undefined;
        }
        
        let k;
        let index;
        if(!isLoad) {
            let d = new Date();
            k = d.getTime();
            index = "folder" + Object.keys(this.folders).length;
            writeStorage.folder(k, index, folderName);
        } else {
            k = prevKey;
            index = prevKey;
        }

        // create folder DOM element
        let folderContainer = document.createElement("div");
        folderContainer.setAttribute("class", "group");
        folderContainer.innerHTML = 
        `<span class="material-symbols-outlined item-type-icon">folder</span>` +
        `<span class="folder-title">${folderName}</span>` +
        `<span class="material-symbols-outlined del-icon">delete</span>`;
        
        // folder item click event
        folderContainer.addEventListener("click", function() {
            folderHandler.openFolderCreate();
        });

        // delete icon click event
        folderContainer.childNodes[2].addEventListener("click", function() {
            folderHandler.delFolder(folderContainer, index, k);
        });

        document.getElementById("notes-group").appendChild(folderContainer);
        this.folders[index] = folderContainer;
    },

    // close folder editor
    closeFolderCreate() {
        this.folderEditor.style.transform = "scale(0) translate(-50%, 0)";
        this.newFolderInput.value = "";
    },

    // open folder editor
    openFolderCreate() {
        noteHandler.closeNoteEditor();
        folderHandler.closeMove();
        this.folderEditor.style.transform = "scale(1) translate(-50%, 0)";
    },

    // close move note to folder editor
    closeMove() {
        this.folderMoveParent.style.transform = "scale(0) translate(-50%, 0)";
    },

    // folder delete function
    delFolder(folderDiv, folderIndex, folderMemKey) {
        event.stopPropagation();
        folderCounter(-1);
        folderDiv.remove();
        delete this.folders[folderIndex];
        localStorage.removeItem(folderMemKey);
    }
};

// read storage data
function readStorage(key) {
    let obj = localStorage.getItem(key);
    obj = obj.substring(11);
    const folders = Number(obj.substring(0, obj.indexOf("_notes:")));
    const notes = Number(obj.substring(obj.lastIndexOf(":") + 1));
    const folderName = obj.substring(obj.indexOf("_folderName:") + 12, obj.indexOf("_folders:"));
    return { folders, notes, folderName };
}

// write storage data
const writeStorage = {
    folder(key, index, folderName) {
        localStorage.setItem(key, `_folderName:${folderName}_folders:0_notes:0`);
        localStorage.setItem("0000folder", `_folderName:AllItems_folders:${Object.keys(folderHandler.folders).length}_notes:${Object.keys(noteHandler.notes).length}`);
        folderHandler.folderCreator(folderName, key, false);
    },

    note(key, index, noteName, noteText, folder) {
        localStorage.setItem(key, `_noteName:${noteName}_noteText:${noteText}_folder:${folder}`);
        localStorage.setItem("0000folder", `_folderName:AllItems_folders:${Object.keys(folderHandler.folders).length}_notes:${Object.keys(noteHandler.notes).length}`);
        noteHandler.noteCreator(noteName, noteText, key, index);
    }
};
