require("dotenv").config();
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const PORT = process.env.PORT || 3000;
const path = require("path");
const exphbs = require("express-handlebars");
const handlebarsHelpers = require("./helpers/handlebars-helpers");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const userRoutes = require("./routes/user_routes");
const restaurantRoutes = require("./routes/restaurant_routes");
const menuRoutes = require("./routes/menu_routes");

// Handlebars Config
app.set("view engine", ".hbs");
app.set("views", path.join(__dirname, "views"));
app.engine(
  ".hbs",
  exphbs.engine({
    extname: ".hbs",
    defaultLayout: "main",
    layoutsDir: path.join(__dirname, "views", "layouts"),
    partialsDir: path.join(__dirname, "views", "partials"),
    runtimeOptions: {
      allowProtoPropertiesByDefault: true,
      allowProtoMethodsByDefault: true,
    },
    helpers: handlebarsHelpers,
  })
);

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, "public")));

// Sessions, a guest session is started automatically
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
      mongoUrl: process.env.DB_HOST,
      collectionName: "sessions",
    }),
    cookie: { maxAge: 1000 * 60 * 60 * 24 }, // 1 day
    name: "qrmenu.sid",
  })
);

// Mongoose config
const uri = process.env.DB_HOST;

mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})

let db = mongoose.connection;

db.once("open", () => {
  console.log("Connected to MongoDB");
});
db.on("error", (err) => {
  console.log("DB Error:" + err);
});

// Application level middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Serve static files from the 'public' directory
app.use("/public", express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));

// ROUTES

// Use the 3 routers
app.use(userRoutes);
app.use(restaurantRoutes);
app.use(menuRoutes);

// Home
app.get("/", (req, res) => {
  res.render("home", {
    title: "Home Page",
    message: "Welcome, select an option from the navigation menu.",
    user: req.session.user,
    userSession: req.session.user ? true : false,
  });
});

// About
app.get("/about", (req, res) => {
  res.render("about", {
    title: "About",
    message: "Developers",
    userSession: req.session.user ? true : false,
  });
});

// Pricing
app.get("/pricing", (req, res) => {
  res.render("pricing", {
    title: "Pricing",
    message: "Our plans",
    userSession: req.session.user ? true : false,
  });
});

app.use((req, res) => {
  res.status(404).send("Route not found 😕");
});

app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`);
});
