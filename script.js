// ---------- Storage layer ----------
// Persists the library array to localStorage so books survive page reloads.
// Odin says "no need for persistent storage", but it's a nice quality-of-life
// improvement and a good chance to keep data + storage concerns separate.

const STORAGE_KEY = "myLibrary.v1";

function saveLibrary() {
  try {
    const serializable = myLibrary.map((b) => ({
      title: b.title,
      author: b.author,
      pages: b.pages,
      read: b.read,
    }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(serializable));
  } catch (err) {
    console.warn("Failed to save library to storage:", err);
  }
}

// ---------- Data layer ----------

class Book {
  constructor(title, author, pages, read) {
    this.id = crypto.randomUUID();
    this.title = title;
    this.author = author;
    this.pages = pages;
    this.read = Boolean(read);
  }

  toggleRead() {
    this.read = !this.read;
  }
}

function loadLibrary() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // Re-hydrate plain objects into Book instances so prototype methods work.
    return parsed.map((b) => new Book(b.title, b.author, b.pages, b.read));
  } catch (err) {
    console.warn("Failed to load library from storage:", err);
    return [];
  }
}

const myLibrary = loadLibrary();

function addBookToLibrary(title, author, pages, read) {
  const book = new Book(title, author, pages, read);
  myLibrary.push(book);
  saveLibrary();
  return book;
}

function removeBook(id) {
  const index = myLibrary.findIndex((book) => book.id === id);
  if (index === -1) return false;
  myLibrary.splice(index, 1);
  saveLibrary();
  displayBooks();
  return true;
}

function toggleBookRead(id) {
  const book = myLibrary.find((b) => b.id === id);
  if (!book) return false;
  book.toggleRead();
  saveLibrary();
  displayBooks();
  return true;
}

// ---------- Display layer ----------

const libraryContainer = document.getElementById("library");
const emptyMessage = document.getElementById("empty-message");
const statsBar = document.getElementById("stats");

function createBookCard(book) {
  const card = document.createElement("article");
  card.className = "book-card";
  card.dataset.id = book.id;

  const title = document.createElement("h3");
  title.textContent = book.title;

  const author = document.createElement("p");
  author.className = "author";
  author.textContent = `by ${book.author}`;

  const pages = document.createElement("p");
  pages.className = "pages";
  pages.textContent = `${book.pages} pages`;

  const readBadge = document.createElement("span");
  readBadge.className = `read-badge ${book.read ? "read" : "unread"}`;
  readBadge.textContent = book.read ? "Read" : "Not read";

  const actions = document.createElement("div");
  actions.className = "card-actions";

  const toggleBtn = document.createElement("button");
  toggleBtn.type = "button";
  toggleBtn.className = "toggle-read-btn";
  toggleBtn.textContent = book.read ? "Mark unread" : "Mark read";
  toggleBtn.addEventListener("click", () => toggleBookRead(book.id));

  const removeBtn = document.createElement("button");
  removeBtn.type = "button";
  removeBtn.className = "remove-btn";
  removeBtn.textContent = "Remove";
  removeBtn.addEventListener("click", () => removeBook(book.id));

  actions.append(toggleBtn, removeBtn);
  card.append(title, author, pages, readBadge, actions);
  return card;
}

function updateStats() {
  if (!statsBar) return;
  const total = myLibrary.length;
  const read = myLibrary.filter((b) => b.read).length;
  statsBar.textContent =
    total === 0
      ? ""
      : `${total} book${total === 1 ? "" : "s"} • ${read} read • ${total - read} unread`;
}

function displayBooks() {
  libraryContainer.replaceChildren();

  for (const book of myLibrary) {
    libraryContainer.appendChild(createBookCard(book));
  }

  emptyMessage.classList.toggle("hidden", myLibrary.length > 0);
  updateStats();
}

// ---------- Modal / form ----------

const dialog = document.getElementById("book-dialog");
const newBookBtn = document.getElementById("new-book-btn");
const cancelBtn = document.getElementById("cancel-btn");
const bookForm = document.getElementById("book-form");
const formError = document.getElementById("form-error");

function openDialog() {
  bookForm.reset();
  if (formError) formError.textContent = "";
  dialog.showModal();
  document.getElementById("title")?.focus();
}

newBookBtn.addEventListener("click", openDialog);

cancelBtn.addEventListener("click", () => {
  dialog.close();
});

// Clicking the backdrop closes the dialog (dialogs don't do this by default).
// Only fire when the click lands on the dialog element itself, not on its
// inner content (which would otherwise cancel every interaction inside it).
dialog.addEventListener("click", (event) => {
  if (event.target === dialog) {
    dialog.close();
  }
});

bookForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const formData = new FormData(bookForm);
  const title = formData.get("title").toString().trim();
  const author = formData.get("author").toString().trim();
  const pages = Number(formData.get("pages"));
  const read = formData.get("read") === "on";

  if (!title || !author) {
    if (formError) formError.textContent = "Title and author are required.";
    return;
  }
  if (!Number.isFinite(pages) || pages <= 0) {
    if (formError) formError.textContent = "Pages must be a positive number.";
    return;
  }

  // Guard against exact duplicates — same title + author + pages.
  const duplicate = myLibrary.some(
    (b) =>
      b.title.toLowerCase() === title.toLowerCase() &&
      b.author.toLowerCase() === author.toLowerCase() &&
      b.pages === pages,
  );
  if (duplicate) {
    if (formError)
      formError.textContent = "That book is already in your library.";
    return;
  }

  addBookToLibrary(title, author, pages, read);
  displayBooks();
  dialog.close();
});

// ---------- Seed data only when storage is truly empty ----------

if (myLibrary.length === 0) {
  addBookToLibrary("The Hobbit", "J.R.R. Tolkien", 310, true);
  addBookToLibrary("Atomic Habits", "James Clear", 320, false);
  addBookToLibrary("Clean Code", "Robert C. Martin", 464, true);
}

displayBooks();