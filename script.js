// ---------- Data layer ----------

const myLibrary = [];

function Book(title, author, pages, read) {
  this.id = crypto.randomUUID();
  this.title = title;
  this.author = author;
  this.pages = pages;
  this.read = Boolean(read);
}

Book.prototype.toggleRead = function () {
  this.read = !this.read;
};

function addBookToLibrary(title, author, pages, read) {
  const book = new Book(title, author, pages, read);
  myLibrary.push(book);
  return book;
}

// ---------- Display layer ----------

const libraryContainer = document.getElementById("library");
const emptyMessage = document.getElementById("empty-message");

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
  readBadge.dataset.role = "read-badge";

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

function displayBooks() {
  libraryContainer.replaceChildren();

  for (const book of myLibrary) {
    libraryContainer.appendChild(createBookCard(book));
  }

  emptyMessage.classList.toggle("hidden", myLibrary.length > 0);
}

function removeBook(id) {
  const index = myLibrary.findIndex((book) => book.id === id);
  if (index === -1) return;
  myLibrary.splice(index, 1);
  displayBooks();
}

function toggleBookRead(id) {
  const book = myLibrary.find((b) => b.id === id);
  if (!book) return;
  book.toggleRead();
  displayBooks();
}

// ---------- Modal / form ----------

const dialog = document.getElementById("book-dialog");
const newBookBtn = document.getElementById("new-book-btn");
const cancelBtn = document.getElementById("cancel-btn");
const bookForm = document.getElementById("book-form");

newBookBtn.addEventListener("click", () => {
  bookForm.reset();
  dialog.showModal();
});

cancelBtn.addEventListener("click", () => {
  dialog.close();
});

bookForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const formData = new FormData(bookForm);
  const title = formData.get("title").toString().trim();
  const author = formData.get("author").toString().trim();
  const pages = Number(formData.get("pages"));
  const read = formData.get("read") === "on";

  if (!title || !author || !Number.isFinite(pages) || pages <= 0) return;

  addBookToLibrary(title, author, pages, read);
  displayBooks();
  dialog.close();
});

// ---------- Seed data so the page isn't empty on first load ----------

addBookToLibrary("The Hobbit", "J.R.R. Tolkien", 310, true);
addBookToLibrary("Atomic Habits", "James Clear", 320, false);
addBookToLibrary("Clean Code", "Robert C. Martin", 464, true);

displayBooks();