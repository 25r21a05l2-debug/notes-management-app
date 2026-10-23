package com.example.notes;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.Collection;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.concurrent.atomic.AtomicLong;

@RestController
@RequestMapping("/api/notes")
public class NoteController {
    private final Map<Long, Note> notes = new LinkedHashMap<>();
    private final AtomicLong counter = new AtomicLong();

    @GetMapping
    public Collection<Note> getNotes() {
        return notes.values();
    }

    @PostMapping
    public synchronized Note addNote(@RequestBody Note note) {
        long id = counter.incrementAndGet();
        note.setId(id);
        notes.put(id, note);
        return note;
    }

    @PutMapping("/{id}")
    public synchronized Note updateNote(@PathVariable Long id,
                                        @RequestBody Note updatedNote) {
        if (!notes.containsKey(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Note not found");
        }
        updatedNote.setId(id);
        notes.put(id, updatedNote);
        return updatedNote;
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public synchronized void deleteNote(@PathVariable Long id) {
        if (notes.remove(id) == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Note not found");
        }
    }
}
