const fs = new Filer.FileSystem();

const noteBackgroundColors = [
    "#F1948A" /*light red*/,
    "#C39BD3" /*light purple*/,
    "#5DADE2" /*light blue*/,
    "yellow",
    "#52AD1A" /*leaf green*/ 
];
let  lastColorIndex = -1;
const getNewNote = noteId => {
    let newNote = document.createElement("div");            
    newNote.id = "" + noteId;
    newNote.className = "notepad";
    do {
        var colorIndex = Math.floor(Math.random() * noteBackgroundColors.length);
    } while (colorIndex == lastColorIndex);
    lastColorIndex = colorIndex;
    newNote.style.backgroundColor = noteBackgroundColors[colorIndex];
    let saveBtn = document.createElement("button");
    saveBtn.className = "save btn btn-success";
    saveBtn.appendChild(document.createTextNode("Save"));
    newNote.appendChild(saveBtn);

    let delBtn = document.createElement("button");
    delBtn.className = "delete btn btn-danger";
    delBtn.appendChild(document.createTextNode("Delete"));
    newNote.appendChild(delBtn);

    delBtn.addEventListener("click", e => {
        newNote.parentNode.removeChild(newNote);
        fs.unlink("/note/" + newNote.id + "/color", err => {
            fs.unlink("/note/" + newNote.id + "/top", err => {
                fs.unlink("/note/" + newNote.id + "/left", err => {
                    fs.unlink("/note/" + newNote.id + "/content", err => {
                        fs.rmdir("/note/" + newNote.id);
                    });
                });
            });
        });
    });

    let contentElem = document.createElement("textarea");
    contentElem.className = "noteContent";
    contentElem.appendChild(document.createTextNode("Welcome!"));
    newNote.appendChild(contentElem);

    saveBtn.addEventListener("click", e => {
        fs.writeFile("/note/" + newNote.id + "/content", contentElem.value);
        saveBtn.className = "save btn btn-success";
    });

    contentElem.addEventListener("keyup", e => {
        if (contentElem.value != "Welcome!")
            saveBtn.className = "save btn btn-warning";
        else
            saveBtn.className = "save btn btn-success";
    });

    return newNote;
}

const getOldNote = (id, color, top, left, content) => {
    let note = document.createElement("div");
    note.id = id;
    note.className = "notepad";
    note.style.backgroundColor =  color;
    note.style.top = top;
    note.style.left = left;
    let saveBtn = document.createElement("button");
    saveBtn.className = "save btn btn-success"
    saveBtn.appendChild(document.createTextNode("Save"));
    note.appendChild(saveBtn);

    let delBtn = document.createElement("button");
    delBtn.className = "delete btn btn-danger";
    delBtn.appendChild(document.createTextNode("Delete"));
    note.appendChild(delBtn);

    delBtn.addEventListener("click", e => {
        note.parentNode.removeChild(note);
        fs.unlink("/note/" + note.id + "/color", err => {
            fs.unlink("/note/" + note.id + "/top", err => {
                fs.unlink("/note/" + note.id + "/left", err => {
                    fs.unlink("/note/" + note.id + "/content", err => {
                        fs.rmdir("/note/" + note.id);
                        console.log("a");
                    });
                });
            });
        });
    });

    let contentElem = document.createElement("textarea");
    contentElem.className = "noteContent";
    contentElem.appendChild(document.createTextNode(content));
    note.appendChild(contentElem);

    saveBtn.addEventListener("click", e => {
        fs.writeFile("/note/" + note.id + "/content", contentElem.value);
        saveBtn.className = "save btn btn-success";
    });

    let oldContent = contentElem.value;
    contentElem.addEventListener("keyup", e => {
        if (oldContent != contentElem.value)
            saveBtn.className = "save btn btn-warning";
        else
            saveBtn.className = "save btn btn-success";
    });

    return note;
}

window.addEventListener('DOMContentLoaded', e => {
    let currentId = 1;
    fs.readFile('/note/id', 'utf8', (err, data) => {
        if (data) {
            currentId = parseInt(data);
        }

        for (let i = 1; i < currentId; i++) {
            let color, top, left, content;
            fs.readFile("/note/" + i + "/color", (err, data) => {
                color = data;
                fs.readFile("/note/" + i + "/top", (err, data) => {
                    top = data;
                    fs.readFile("/note/" + i + "/left", (err, data) => {
                        left = data;
                        fs.readFile("/note/" + i + "/content", (err, data) => {
                            content = data;
                            if (!content) return;
                            let note = getOldNote(i, color, top, left, content);
                            let main = document.getElementById("main");
                            main.appendChild(note);
                            $("#" + note.id).draggable({
                                stop: function(e, ui) {
                                    fs.writeFile("/note/" + note.id + "/top", note.style.top);
                                    fs.writeFile("/note/" + note.id + "/left", note.style.left);
                                },
                                containment: "parent"
                            });
                        });
                    });
                });
            });
        }

        let addButton = document.getElementById("add");
        addButton.addEventListener("click", e => {
            let main = document.getElementById("main");
            let newNote = getNewNote(currentId);
            main.appendChild(newNote);
            fs.mkdir("/note", err => {
                fs.mkdir("/note/" + newNote.id, err => {
                    fs.writeFile("/note/" + newNote.id + "/color", newNote.style.backgroundColor);
                    fs.writeFile("/note/" + newNote.id + "/top", "125px");
                    fs.writeFile("/note/" + newNote.id + "/left", "50px");
                    fs.writeFile("/note/" + newNote.id + "/content", "Welcome!");
                });
            });
            fs.writeFile("/note/id", ++currentId);
            $("#" + newNote.id).draggable({
                stop: function(e, ui) {
                    fs.writeFile("/note/" + newNote.id + "/top", newNote.style.top);
                    fs.writeFile("/note/" + newNote.id + "/left", newNote.style.left);
                },
                containment: "parent"
            });
        });      
    });      
});