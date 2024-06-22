const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req,res) => {
    const { username, password } = req.body;

    // Check if username or password is missing
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }
  
    // Check if username already exists
    const existingUser = users.find(user => user.username === username);
    if (existingUser) {
      return res.status(400).json({ message: "Username already exists" });
    }
  
    // If username is unique, create a new user
    const newUser = { username, password };
    users.push(newUser);
  
    return res.status(200).json({ message: "User registered successfully" });
});


// Function to get the book list asynchronously
function getBookList() {
    return new Promise((resolve, reject) => {
        const books = books
        resolve(books); // Resolve with the array of books
    });
};

// Get the book list available in the shop
public_users.get('/',function (req, res) {
    getBookList()
    .then(bookList => {
      const bookListJSON = JSON.stringify(bookList, null, 2); // Convert books array to JSON string
      res.status(200).json(bookListJSON); // Return JSON stringified book list
    })
    .catch(error => {
      console.error("Error fetching book list:", error);
      res.status(500).json({ message: "Internal server error" });
    })
});

function getBookByISBN(isbn) {
    return new Promise((resolve, reject) => {
        const book = books[isbn];
        resolve(book);
    });
  }

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
    const { isbn } = req.params;

    getBookByISBN(isbn)
        .then(book => {
        if (book) {
            res.status(200).json(book);
        } else {
            res.status(404).json({ message: "Book not found" });
        }
        })
        .catch(error => {
        console.error("Error fetching book details:", error);
        res.status(500).json({ message: "Internal server error" });
        });
});

// Function to get books by author asynchronously
function getBooksByAuthor(author) {
    return new Promise((resolve, reject) => {
        const matchingBooks = Object.values(books).filter(book => book.author === author);
        resolve(matchingBooks); // Resolve with an array of books matching the author or an empty array
    });
  }

// Get book details based on author
public_users.get('/author/:author',function (req, res) {
    const { author } = req.params;

    getBooksByAuthor(author)
        .then(matchingBooks => {
        if (matchingBooks.length > 0) {
            res.status(200).json(matchingBooks);
        } else {
            res.status(404).json({ message: "Books by the author not found" });
        }
        })
        .catch(error => {
        console.error("Error fetching books by author:", error);
        res.status(500).json({ message: "Internal server error" });
        });
});

// Function to get books by title asynchronously
function getBooksByTitle(title) {
    return new Promise((resolve, reject) => {
        const matchingBooks = Object.values(books).filter(book => book.title.toLowerCase().includes(title.toLowerCase()));
        resolve(matchingBooks); // Resolve with an array of books matching the title or an empty array
    });
  }

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
    const { title } = req.params;

    getBooksByTitle(title)
        .then(matchingBooks => {
        if (matchingBooks.length > 0) {
            res.status(200).json(matchingBooks);
        } else {
            res.status(404).json({ message: "Books with the title not found" });
        }
        })
        .catch(error => {
        console.error("Error fetching books by title:", error);
        res.status(500).json({ message: "Internal server error" });
        });
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
    const { isbn } = req.params;

    // Check if the book with the given ISBN exists
    if (books[isbn]) {
      const reviews = books[isbn].reviews;
      return res.status(200).json(reviews);
    } else {
      return res.status(404).json({ message: "Book not found" });
    }
});

module.exports.general = public_users;
