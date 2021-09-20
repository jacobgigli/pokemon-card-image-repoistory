const { Router } = require("express");

const express = require("express");
const app = express();
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const authRoute = require("./routes/auth");
const pokemoncardsRoute = require("./routes/pokemoncards");
dotenv.config();
app.use("/uploads", express.static("uploads"));
//Import Routes

//Connect to db

mongoose.connect(
  "mongodb+srv://user:userpassword@cluster0.gnde5.mongodb.net/myFirstDatabase?retryWrites=true&w=majority",
  () => console.log("connected to db")
);

mongoose.Promise = global.Promise;

//Routes middleware
app.use(express.json());

app.use("/api/user", authRoute);
app.use("/api/pokemoncards", pokemoncardsRoute);
app.listen(3000, () => console.log("Server Up and running"));
