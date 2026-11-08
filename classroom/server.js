const express = require("express");
const app = express();
const users = require("./routes/user.js");
const posts = require("./routes/post.js");

app.get("/", (req,res) => {
    res.send("Hi, I am root")
});

app.use("/users", users);  //common base path
app.use("/posts", posts);


app.listen(3000, () => {
    console.log("server is listening to port 3000");
});