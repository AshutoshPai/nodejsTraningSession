import "dotenv/config"
import express from "express";
import HomepageRouter from "./babelRouter/homepage";
import UsersRouter from "./babelRouter/users";
import ProductsRouter from "./babelRouter/products";

import HomepageDBRouter from "./babelRouter/DB/homepageDB";
import UsersDBRouter from "./babelRouter/DB/usersDB";
import ProductsDBRouter from "./babelRouter/DB/productsDB";

import UserAPIRouter from "./babelRouter/DB/api-user.js"
import { createServer } from "http"

import { Server } from "socket.io"

import "./utils/mongoose-db.mjs"

import * as graphql from "express-graphql"
import { Schema } from "./graphql/schema/query.mjs";

const app = express();
const server = createServer(app)
const io = new Server(server)

app.use(express.json());
app.use(express.urlencoded({ extended: true }))
app.use(express.static("public"));
app.set("view engine", "ejs");

const PORT = process.env.PORT || 3000;

// POST         Create
// GET          Read
// PUT PATCH    Update
// DELETE       Delete

app.use("/", HomepageRouter);
app.use("/Users", UsersRouter);
app.use("/Products", ProductsRouter);

app.use("/db", HomepageDBRouter);
app.use("/db/users", UsersDBRouter);
app.use("/db/products", ProductsDBRouter);

app.use("/api/users", UserAPIRouter);

app.get("/chat", (req, res) => {
    res.render("chat")
})

app.use("/graphql", graphql.graphqlHTTP({
    graphiql: true,
    schema: Schema
}))

io.on("connection", (socket) => {
    socket.on("chat-message", (message) => {
        // Group messages with all users on server
        // io.emit("message", message)

        // Group chat - except the sender.
        if (socket.data.username && message) {
            socket.broadcast.emit("message", { message: message, user: socket.data.username });
        }
    });

    socket.on("login", (message) => {
        socket.data = { username: message };
        socket.broadcast.emit("newuser", message);
    });

    socket.on("typing", (typing) => {
        socket.broadcast.emit("typingnow", { typing, username : socket.data.username });
    })
})

server.listen(PORT, () => {
    console.log("Application started at 3000")
})