require("dotenv").config();
const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;
const path = require("path");
const fs = require("fs");
const exphbs = require("express-handlebars");
// const upload = require("./middleware/multer");

app.set("view engine", ".hbs");
app.set("views", path.join(__dirname, "views"));
app.engine(
  ".hbs",
  exphbs.engine({
    extname: ".hbs",
    defaultLayout: "main",
    layoutsDir: __dirname + "/views/layouts/",
    partialsDir: __dirname + "/views/layouts/",
  })
);

// middleware (should be in the middleware folder, but since they are so short I'll keep em here):
app.use(express.urlencoded({ extended: true })); // handle normal forms -> url encoded
app.use(express.json()); // Handle raw json data

// Serve static files from the 'public' directory, without this no styles nor libraries will be loaded!!
app.use("/public", express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "public/uploads"))); //This is needed to allow the client to access the images using URLs!

//ROUTES

app.get("/", (req, res) => {
  res.render("home", {
    title: "Home Page",
    message: "Welcome, select an option from the navigation menu.",
  });
});

app.use((req, res) => {
  res.status(404).send("Route not found 😕");
});
app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`);
});
