const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
    const validity = users.filter(user => user['username'] === username);
    if (validity.length > 0)
        return false;
    else
        return true;
}

const register = (username, password) => {
    let user = { 'username': username, 'password': password };
    users.push(user);
    console.log(users);
}

const authenticatedUser = (username, password) => {
    let validusers = users.filter((user) => {
      return (user.username === username && user.password === password)
    });
    if (validusers.length > 0) {
      return true;
    } else {
      return false;
    }
  }

//only registered users can login
regd_users.post("/login", (req, res) => {
    console.log(req.body);
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: "Invalid username/password" });
    }
    if (authenticatedUser(username, password)) {
        let accessToken = jwt.sign({
            data: password
        }, 'tT895VbhwK2p', { expiresIn: 60 * 60 });
        req.session.authorization = {
            accessToken, username
        }
        return res.status(200).json({ message: `User ${username} is logged in` });
    } else {
        return res.status(403).json({message: "User not found"});
    }
});

// for debugging
regd_users.get("/checkLogin", (req, res) => {
    console.log(req.session);
    return res.status(200).json(req.session);
})

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const username = req.session.authorization.username;
    const review = req.body.review;

    if (!username) {
        return res.status(403).json({ message: "User not logged in" });
    }

    if (!isbn) {
        return res.status(400).json({ message: "Invalid isbn" });
    }

    const book = books[isbn];
    if (!book) {
        return res.status(404).json({ message: "Book not found" });
    }

    books[isbn]['reviews'][username] = review;
    console.log(books[isbn]);

    return res.status(200).send(`Review for book isbn ${isbn} has been updated by ${username}
    Here is your review: 
    ${JSON.stringify(review)}`);
});

//delete
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const username = req.session.authorization.username;
    const isbn = req.params.isbn;
    if (!username) {
        return res.status(403).json({ message: "User not logged in" });
    }
    if (!isbn || !books[isbn]['reviews'][username]) {
        return res.status(404).json({ message: "Book/review not found"});
    }
    delete books[isbn]['reviews'][username];
    console.log(books[isbn])
    return res.status(200).send(`Review by ${username} for book ISBN ${isbn} has been deleted for ${username}.`);
})

module.exports = { authenticated: regd_users, isValid, users, register };
