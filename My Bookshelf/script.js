const books = [];
const RENDER_EVENT = 'render-book';
const SAVED_EVENT = 'saved-book';
const STORAGE_KEY = 'BOOK_APPS';

function generateId() {
    return +new Date();
};

function generateBookObject(id, title, author, year, isComplete) {
    return {
    id,
    title,
    author,
    year: parseInt(year),
    isComplete,
    };
};

function findBook(bookId) {
    for (const bookValue of books) {
        if (bookValue.id === bookId) {
            return bookValue;
        };
    };
    return null;
};

function findBookIndex(bookId) {
    for (index in books) {
        if (books[index].id === bookId) {
            return index;
        };
    };
    return -1;
};

document.getElementById('searchBook').addEventListener('submit', function (event) {
    event.preventDefault();
    const searchBook = document.getElementById('searchBookTitle').value.toLowerCase();
    const bookList = document.querySelectorAll('.book-item > h3');
    for (const book of bookList) {
        if (book.innerText.toLowerCase().includes(searchBook)) {
            book.parentElement.parentElement.style.display = 'block';
        } else {
            book.parentElement.parentElement.style.display = 'none';
        };
    };
});

function displayBook(bookObject) {
    const {id, title, author, year, isComplete} = bookObject;
    const bookTitle = document.createElement('h3');
    bookTitle.innerText = title;
    const titleColor = bookObject.isComplete ? '#008000' : '#d80032';
    bookTitle.style.color = titleColor;
    const bookAuthor = document.createElement('p');
    bookAuthor.innerText = `Penulis : ${author}`;
    const bookYear = document.createElement('p');
    bookYear.innerText = `Tahun Terbit : ${year}`;
    const textContainer = document.createElement('div');
    textContainer.classList.add('book-item');
    textContainer.append(bookTitle, bookAuthor, bookYear);
    const bookItem = document.createElement('article');
    bookItem.classList.add('book-item');
    bookItem.append(textContainer);
    bookItem.setAttribute('id', `book-${id}`);
    const buttonContainer = document.createElement('div');
        buttonContainer.classList.add('action');
        if (isComplete) {
            const undoButton = document.createElement('button');
            undoButton.classList.add('undo-button');
            undoButton.addEventListener('click', function () {
                moveToIncomplete(id);
            });
            const removeButton = document.createElement('button');
            removeButton.classList.add('trash-button');
            removeButton.addEventListener('click', function () {
                removeBooks(id);
            });
            buttonContainer.append(undoButton, removeButton);
        } else {
            const completeButton = document.createElement('button');
            completeButton.classList.add('check-button');
            completeButton.addEventListener('click', function () {
                addBooksToComplete(id);
            });
            const removeButton = document.createElement('button');
            removeButton.classList.add('trash-button');
            removeButton.addEventListener('click', function () {
                removeBooks(id);
            });
            buttonContainer.append(completeButton, removeButton);
        };
    bookItem.append(buttonContainer);
    return bookItem;
};

function addBook() {
    const bookTitle = document.getElementById('inputBookTitle').value;
    const bookAuthor = document.getElementById('inputBookAuthor').value;
    const bookYear = document.getElementById('inputBookYear').value;
    const isComplete = document.getElementById('inputBookIsComplete').checked;
    if (bookTitle && bookAuthor && bookYear) {
        const generatedID = generateId();
        const bookObject = generateBookObject(generatedID, bookTitle, bookAuthor, bookYear, isComplete);
        books.push(bookObject);
        document.dispatchEvent(new Event(RENDER_EVENT));
        saveDataBooks();
    } else {
        alert('Harap Melengkapi Semua Kolom');
    };
};

function addBooksToComplete(bookId) {
    const bookTarget = findBook(bookId);
    if (bookTarget == null) return;
    bookTarget.isComplete = true;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveDataBooks();
};

function removeBooks(bookId) {
    const bookTarget = findBookIndex(bookId);
    if (bookTarget === -1) return;
    const customDialog = document.createElement('div');
    customDialog.className = 'dialog';
    customDialog.innerHTML = `
        <p>Yakin ingin menghapus buku ini?</p>
        <button class="confirmRemoveBook">Ya</button>
        <button class="cancelRemoveBook">Batal</button>
    `;
    document.body.appendChild(customDialog);
    const confirmRemoveButton = customDialog.querySelector('.confirmRemoveBook');
    confirmRemoveButton.addEventListener('click', function () {
        customDialog.style.display = 'none';
        books.splice(bookTarget, 1);
        document.dispatchEvent(new Event(RENDER_EVENT));
        saveDataBooks();
    });
    const cancelRemoveButton = customDialog.querySelector('.cancelRemoveBook');
    cancelRemoveButton.addEventListener('click', function () {
        customDialog.style.display = 'none';
    });
    customDialog.style.display = 'block';
}

function moveToIncomplete(bookId) {
    const bookTarget = findBook(bookId);
    if (bookTarget == null) return;
    bookTarget.isComplete = false;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveDataBooks();
};

document.addEventListener('DOMContentLoaded', function () {
    const submitForm = document.getElementById('inputBook');
    submitForm.addEventListener('submit', function (event) {
        event.preventDefault();
        addBook();
    });
    if (isStorageExist()) {
        loadDataBooksFromStorage();
    };
});

document.addEventListener(RENDER_EVENT, function () {
    const incompleteList = document.getElementById('incompleteBookshelfList');
    const completeList = document.getElementById('completeBookshelfList');
    incompleteList.innerHTML = '';
    completeList.innerHTML = '';
    for (const bookItem of books) {
        const bookElement = displayBook(bookItem);
        if (bookItem.isComplete) {
            completeList.append(bookElement);
        } else {
            incompleteList.append(bookElement);
        };
    };
});

function saveDataBooks() {
    if (isStorageExist()) {
        const parsed = JSON.stringify(books);
        localStorage.setItem(STORAGE_KEY, parsed);
        document.dispatchEvent(new Event(SAVED_EVENT));
    };
};

function isStorageExist() {
    if (typeof (Storage) === undefined) {
        alert('Browser tidak mendukung local storage');
        return false;
    };
    return true;
};

document.addEventListener(SAVED_EVENT, function () {
    console.log(localStorage.getItem(STORAGE_KEY));
});

function loadDataBooksFromStorage() {
    const serializedDataBooks = localStorage.getItem(STORAGE_KEY);
    const data = JSON.parse(serializedDataBooks);
    if (data !== null) {
        books.length = 0;
        for (const book of data) {
            books.push(book);
        };
    };
    document.dispatchEvent(new Event(RENDER_EVENT));
};