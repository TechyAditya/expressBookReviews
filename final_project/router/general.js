const express = require('express');
let books = require("./booksdb.js");
let { isValid, users, register } = require("./auth_users.js");
const public_users = express.Router();

const doesExist = (username) => {
    let userswithsamename = users.filter((user) => {
      return user.username === username
    });
    if (userswithsamename.length > 0) {
      return true;
    } else {
      return false;
    }
}

public_users.post("/register", (req, res) => {
    console.log(req.body);
    const { username, password } = req.body;
    if(username && password) {
        if(isValid(username)) {
            register(username, password);
            return res.status(200).send(`Thank you ${username} for registering`)
        } else {
            return res.status(400).json({message: "Username invalid"});
        }
    } else return res.status(400).json({message: "Please enter username and password"})
});

// Get the book list available in the shop
public_users.get('/', async function (req, res) {
    return Promise.resolve(res.status(200).json(books));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', async function (req, res) {
    const book = books[req.params.isbn];
    return Promise.resolve(res.status(200).json(book));
});

// Get book details based on author
public_users.get('/author/:author', async function (req, res) {
    const author = req.params.author;
    const booksArray = Object.values(books);

    const booksOnAuthor = booksArray.filter(book => book.author === author);
    if (booksOnAuthor.length > 0) {
        Promise.resolve(res.status(200).json(booksOnAuthor));
    } else {
        Promise.resolve(res.status(404).json({ message: "Author not found" }));
    }
});

// Get all books based on title
public_users.get('/title/:title', async function (req, res) {
    const title = req.params.title;
    const titleArray = Object.values(books);

    const booksOnTitle = titleArray.filter(book => book.title === title);
    if (booksOnTitle.length > 0) {
        Promise.resolve(res.status(200).json(booksOnTitle));
    } else {
        Promise.resolve(res.status(404).json({ message: "Title not found" }));
    }
});

//  Get book review
public_users.get('/review/:isbn', async function (req, res) {
    const isbn = req.params.isbn;
    const book = books[isbn.toString()];
    if(book) {
        Promise.resolve(res.status(200).json(book['reviews']));
    }
    else {
        Promise.resolve(res.status(404).json({ message: "ISBN number invalid" }));
    }
});

module.exports.general = public_users;
