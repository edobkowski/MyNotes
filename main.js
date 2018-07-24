"use strict";

// MAIN
let notes = new Set();

function addNote(title, noteText, transformValue) {
    let targetElement = document.querySelector(".container");

    let noteModel = new NoteModel(title, noteText, transformValue);
    let noteView = new NoteView(targetElement);
    let noteController = new NoteController(noteView, noteModel);

    notes.add(noteModel);
    noteController.showNote();
}

function save() {
    localStorage.setItem("notes", JSON.stringify([...notes]));
}

function load() {
    let localNotes = JSON.parse(localStorage.getItem("notes"));
    if(localNotes !== null) {
        for(let note of localNotes) {
            let title = note._title;
            let noteText = note._noteText;
            let transformValue = note._transformValue;

            addNote(title, noteText, transformValue);
        }
    }
}

function remove(note) {
    notes.delete(note);
}

function createEmptyNote() {
    let title = "edit me";
    let noteText = "edit me";
    let transformValue = "translateX(300px)";

    addNote(title, noteText, transformValue);
}

function addListeners() {
    document.getElementById("add-note-button").addEventListener("click", createEmptyNote);
}

function init() {
    addListeners();
    load();
}

//NoteModel
class NoteModel {
    constructor(title, noteText, transformValue) {
        this._title = title;
        this._noteText = noteText;
        this._transformValue = transformValue;
    }

    get title() {
        return this._title;
    }

    set title(title) {
        this._title = title;
    }

    get noteText() {
        return this._noteText;
    }

    set noteText(noteText) {
        this._noteText = noteText;
    }

    get transformValue() {
        return this._transformValue;
    }

    set transformValue(transformValue) {
        this._transformValue = transformValue;
    }
}

//NoteView
class NoteView {
    constructor(element) {
        this._element = element;

        this.handleGrab = null;
        this.handleClose = null;
        this.handleTitleChange = null;
        this.handleNoteChange = null;
    }

    render(noteModel) {
        let note = document.createElement("div");
        let noteBar = document.createElement("div");
        let titleTextarea = document.createElement("textarea");
        let closeButton = document.createElement("button");
        let noteTextarea = document.createElement("textarea");

        note.style.transform = noteModel.transformValue;

        note.addEventListener("mousedown", this.handleGrab);
        closeButton.addEventListener("click", this.handleClose);
        titleTextarea.addEventListener("input", this.handleTitleChange);
        noteTextarea.addEventListener("input", this.handleNoteChange);
        closeButton.innerHTML = "X";
        titleTextarea.value = noteModel.title;
        noteTextarea.value = noteModel.noteText;

        titleTextarea.wrap = "off";

        note.classList.add("note");
        noteBar.classList.add("note-bar");
        titleTextarea.classList.add("title-textarea");
        closeButton.classList.add("close-button");
        noteTextarea.classList.add("note-textarea");

        noteBar.appendChild(titleTextarea);
        noteBar.appendChild(closeButton);
        note.appendChild(noteBar);
        note.appendChild(noteTextarea);

        this._element.appendChild(note);
    }
}

// NoteController    
let draggedElement;
let grabPointX;
let grabPointY;

class NoteController {
    constructor (noteView, noteModel) {
        this._noteView = noteView;
        this._noteModel = noteModel;
        console.log("CONST: ",this._noteModel)
        this.addListeners();
        this.initialize();
    }

    initialize() {
        this._noteView.handleGrab = this.handleGrab.bind(this);
        this._noteView.handleClose = this.handleClose.bind(this);
        this._noteView.handleTitleChange = this.handleTitleChange.bind(this);
        this._noteView.handleNoteChange = this.handleNoteChange.bind(this);
    }

    showNote() {
        this._noteView.render(this._noteModel);
    }

    isGrabbingBar() {
        return draggedElement.className === "note-bar";
    }

    moveActiveNoteOnTop() {
        let othernoteText = document.getElementsByClassName("note");

        for(let i = 0; i < othernoteText.length; i++) {
            othernoteText[i].style.zIndex = 0;
        }

        draggedElement.parentElement.style.zIndex = 1;
    }

    handleGrab(e) {
        draggedElement = e.target;

        if(!this.isGrabbingBar()) {
            return;
        }

        this.moveActiveNoteOnTop();
        
        grabPointX = draggedElement.getBoundingClientRect().left - e.clientX;
        grabPointY = draggedElement.getBoundingClientRect().top - e.clientY;
    }

    handleDrag(e) {
        if(!draggedElement) {
            return;
        }

        if(draggedElement.className !== "note-bar") {
            return;
        }

        let posX = e.clientX + grabPointX;
        let posY = e.clientY + grabPointY;
        let transformValuee = `translateX(${posX}px) translateY(${posY}px)`;
        
        draggedElement.parentElement.style.transform = transformValuee;
        //TODO: save transformValue to the model (find out how to get proper this element (not #document))
    }

    handleDrop(e) {
        draggedElement = null;
        grabPointX = null;
        grabPointY = null;
    }

    handleClose(e){
        let closeButton = e.target;
        closeButton.parentElement.parentElement.remove();
        remove(this._noteModel);
    }

    handleTitleChange(e) {
        let titleText = e.target.value;
        this._noteModel.title = titleText;
    }

    handleNoteChange(e) {
        let noteText = e.target.value;
        this._noteModel.noteText = noteText;
    }

    addListeners() {
        document.addEventListener("mousemove", this.handleDrag);
        document.addEventListener("mouseup", this.handleDrop);
    }
}