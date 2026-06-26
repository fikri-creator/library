# 📚 My Library

A small vanilla-JS app for tracking books you've read (or want to read).
Built as part of [The Odin Project](https://www.theodinproject.com/) —
JavaScript > Library lesson.

## Features

- Add a book via a modal form (`<dialog>` element)
- Each book gets a stable UUID via `crypto.randomUUID()`
- Display as a responsive card grid
- Toggle a book's `read` status
- Remove a book
- Live stats: total / read / unread count
- Form validation (required fields, positive pages, duplicate guard)
- **Persistent storage** via `localStorage` (books survive page reloads)

## Architecture

Three layers kept deliberately separate:

1. **Storage layer** — `loadLibrary` / `saveLibrary` talk to `localStorage`
2. **Data layer** — `Book` class, `myLibrary` array, `addBookToLibrary`,
   `removeBook`, `toggleBookRead`
3. **Display layer** — `createBookCard` builds a single card,
   `displayBooks` re-renders the grid

## Run it

No build step. Just open `index.html` in a modern browser, or:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Files

| File         | Purpose                               |
| ------------ | ------------------------------------- |
| `index.html` | Markup, `<dialog>` modal form         |
| `styles.css` | Card grid, badges, modal styling      |
| `script.js`  | All JS (data, display, form, storage) |
