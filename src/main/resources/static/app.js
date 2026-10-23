const API = "/api/notes";

const form = document.getElementById("noteForm");
const noteId = document.getElementById("noteId");
const titleInput = document.getElementById("title");
const contentInput = document.getElementById("content");
const notesList = document.getElementById("notesList");
const message = document.getElementById("message");
const noteCount = document.getElementById("noteCount");
const saveButton = document.getElementById("saveButton");
const cancelButton = document.getElementById("cancelButton");

async function request(url, options = {}) {
    const response = await fetch(url, options);
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `Request failed (${response.status})`);
    }
    if (response.status === 204) return null;
    return response.json();
}

async function loadNotes() {
    try {
        const notes = await request(API);
        notesList.replaceChildren();
        noteCount.textContent = `${notes.length} ${notes.length === 1 ? "note" : "notes"}`;

        if (notes.length === 0) {
            const empty = document.createElement("div");
            empty.className = "empty";
            empty.textContent = "No notes yet. Add your first note above.";
            notesList.appendChild(empty);
            return;
        }

        notes.forEach(note => {
            const card = document.createElement("article");
            card.className = "note";

            const heading = document.createElement("h3");
            heading.textContent = note.title;

            const paragraph = document.createElement("p");
            paragraph.textContent = note.content;

            const actions = document.createElement("div");
            actions.className = "note-actions";

            const editButton = document.createElement("button");
            editButton.type = "button";
            editButton.className = "edit";
            editButton.textContent = "Edit";
            editButton.addEventListener("click", () => editNote(note));

            const deleteButton = document.createElement("button");
            deleteButton.type = "button";
            deleteButton.className = "delete";
            deleteButton.textContent = "Delete";
            deleteButton.addEventListener("click", () => deleteNote(note.id));

            actions.append(editButton, deleteButton);
            card.append(heading, paragraph, actions);
            notesList.appendChild(card);
        });
    } catch (error) {
        message.textContent = "Unable to load notes. Is the server running?";
    }
}

form.addEventListener("submit", async event => {
    event.preventDefault();
    const editing = noteId.value !== "";
    const note = {
        title: titleInput.value.trim(),
        content: contentInput.value.trim()
    };

    if (!note.title || !note.content) {
        message.textContent = "Please enter both a title and note.";
        return;
    }

    try {
        await request(editing ? `${API}/${noteId.value}` : API, {
            method: editing ? "PUT" : "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(note)
        });
        form.reset();
        resetEditor();
        message.textContent = editing ? "Note updated successfully." : "Note added successfully.";
        await loadNotes();
    } catch (error) {
        message.textContent = "Unable to save note. Please try again.";
    }
});

function editNote(note) {
    noteId.value = note.id;
    titleInput.value = note.title;
    contentInput.value = note.content;
    saveButton.textContent = "Update note";
    cancelButton.hidden = false;
    titleInput.focus();
    window.scrollTo({ top: 0, behavior: "smooth" });
}

function resetEditor() {
    noteId.value = "";
    saveButton.textContent = "＋ Add note";
    cancelButton.hidden = true;
}

cancelButton.addEventListener("click", () => {
    form.reset();
    resetEditor();
    message.textContent = "";
});

async function deleteNote(id) {
    if (!window.confirm("Delete this note? This cannot be undone.")) return;
    try {
        await request(`${API}/${id}`, { method: "DELETE" });
        message.textContent = "Note deleted.";
        await loadNotes();
    } catch (error) {
        message.textContent = "Unable to delete note. Please try again.";
    }
}

loadNotes();
