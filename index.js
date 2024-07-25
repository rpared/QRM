require("dotenv").config();
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const PORT = process.env.PORT || 3000;
const path = require("path");
const exphbs = require("express-handlebars");
const User = require("./models/users");
const Restaurant = require("./models/restaProfiles");
const bcrypt = require("bcrypt");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const router = express.Router(); // must implement
const authMiddleware = require("./middleware/auth"); // must implement

// Handlebars Config
app.set("view engine", ".hbs");
app.set("views", path.join(__dirname, "views"));
app.engine(
  ".hbs",
  exphbs.engine({
    extname: ".hbs",
    defaultLayout: "main",
    layoutsDir: path.join(__dirname, "views", "layouts"),
    partialsDir: path.join(__dirname, "views", "layouts"),
    runtimeOptions: {
      allowProtoPropertiesByDefault: true,
      allowProtoMethodsByDefault: true,
    },
  })
);

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
    cookie: { maxAge: 1000 * 60 * 60 * 24 },// 1 day
    name: 'qrmenu.sid', 
  })
);

// Session Demo to count views
app.get("/test-session", (req, res) => {
  if (req.session.views) {
    req.session.views++;
    res.setHeader("Content-Type", "text/html");
    res.write("<p>Views: " + req.session.views + "</p>");
    res.end();
  } else {
    req.session.views = 1;
    res.end("Welcome to the session demo. Refresh!");
  }
});

// Mongoose config
mongoose.connect(process.env.DB_HOST);
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
// Home
app.get("/", (req, res) => {
  res.render("home", {
    title: "Home Page",
    message: "Welcome, select an option from the navigation menu.",
  });
});
// About
app.get("/about", (req, res) => {
  res.render("about", {
    title: "About",
    message: "Developers",
  });
});

// Pricing
app.get("/pricing", (req, res) => {
  res.render("pricing", {
    title: "Pricing",
    message: "Our plans",
  });
});

// Login, Register and user_dashboard routes must go to /routes/user_routes!!!
// Register Get
app.get("/register", (req, res) => {
  res.render("register", {
    title: "Register",
    message: "Enter your info.",
  });
});

// Register Post
app.post("/register", async (req, res) => {
  const { email, password, firstname, lastname } = req.body;
  console.log("Received registration data:", req.body);

  try {
    const hashedPassword = await bcrypt.hash(password, 2);
    console.log("Hashed password:", hashedPassword);

    const user = new User({
      user_id: Date.now(),
      email,
      password: hashedPassword,
      firstname,
      lastname,
    });

    await user.save();
    console.log("User saved successfully:", user);
    res.redirect("/login");
  } catch (error) {
    console.log("Error saving user:", error);
    res.status(400).render("register", {
      title: "Register",
      message: "Error registering user. Please try again.",
    });
  }
});

// Route to log all users to console
app.get("/users", async (req, res) => {
  try {
    const users = await User.find({});
    if (users.length > 0) {
      console.log("Users:", users);
      res.send("Check console for users data.");
    } else {
      console.log("No users found");
      res.send("No users found in the database.");
    }
  } catch (error) {
    console.log("Error retrieving users:", error);
    res.status(500).send("Error retrieving users");
  }
});

// Login Get
app.get("/login", (req, res) => {
  res.render("login", {
    title: "Login",
    message: "Enter your credentials.",
  });
});

// Login Post
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  console.log("Received login data:", req.body);

  try {
    const user = await User.findOne({ email: email });
    if (!user) {
      console.log("User not found");
      return res.status(400).render("login", {
        title: "Login",
        message: "User not found. Please try again.",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log("Invalid password");
      return res.status(400).render("login", {
        title: "Login",
        message: "Invalid password. Please try again.",
      });
    }

    // Successful login
    console.log("Login successful");

    // Save user info in session
    req.session.user = {
      id: user._id,
      email: user.email,
      firstname: user.firstname,
    };

    // Save the session explicitly
    req.session.save((err) => {
      if (err) {
        console.error("Error saving to session storage: ", err);
        return res.status(500).render("login", {
          title: "Login",
          message: "Error saving session. Please try again.",
        });
      }
      console.log(`Hello ${email}, logged in successfully`);
      res.redirect("/user_dashboard");
    });
  } catch (error) {
    console.log("Error logging in:", error);
    res.status(500).render("login", {
      title: "Login",
      message: "Error logging in. Please try again.",
    });
  }
});

// Check login status
app.get("/check-login", (req, res) => {
  if (req.session.user) {
    // If user session exists, return user data
    res.json({
      isLoggedIn: true,
      user: req.session.user
    });
  } else {
    // If user session does not exist, return isLoggedIn false
    res.json({
      isLoggedIn: false,
    });
  }
});

// User logout
app.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Error during logout:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    res.json({ message: "Logged out successfully" });
  });
});

// User Dashboard
app.get("/user_dashboard", async (req, res) => {
  if (req.session.user) {
    try {
      const restaurants = await Restaurant.find({ user_id: req.session.user.id });
      res.render("user_dashboard", {
        title: "User Dashboard",
        message: "Welcome to your dashboard.",
        user: req.session.user,
        restaurants: restaurants,
        userSession: true
      });
    } catch (error) {
      console.error("Error fetching restaurants:", error);
      res.status(500).render("user_dashboard", {
        title: "User Dashboard",
        message: "Error loading your dashboard. Please try again.",
      });
    }
  } else {
    res.redirect("/login");
  }
});
      

// Route to Get restaurant profile
app.get("/create_restaurant_profile", (req, res) => {
  if (req.session.user) {
    res.render("create_resta_profile", {
      title: "Create Restaurant Profile",
      user: req.session.user,
      userSession: true
    });
  } else {
    res.redirect("/login");
  }
});
// Route to handle the creation of a restaurant profile
app.post("/create_restaurant_profile", async (req, res) => {
  if (req.session.user) {
    const { resta_name, resta_logo, resta_description, resta_location, resta_hours, resta_email, resta_phone } = req.body; // Extract all fields
    try {
      const restaurant = new Restaurant({
        user_id: req.session.user.id,
        resta_name,
        resta_logo,
        resta_description,
        resta_location,
        resta_hours,
        resta_email,
        resta_phone,
      });
      
      await restaurant.save();
      res.redirect("/user_dashboard");
    } catch (error) {
      console.error("Error creating restaurant profile:", error);
      res.status(500).render("create_resta_profile", {
        title: "Create Restaurant Profile",
        message: "Error creating restaurant profile. Please try again.",
        user: req.session.user,
        userSession: true
      });
    }
  } else {
    res.redirect("/login");
  }
});


// Add Items
app.get("/add_menu_items", (req, res) => {
  if (req.session.user) {
    res.render("add_menu_items", {
      title: "Add Items to your Menu",
      message: "To create different Menus create different Restaurant Profiles.",
      user: req.session.user,
      userSession: true
    });
  } else {
    res.redirect("/login");
  }
});



app.use((req, res) => {
  res.status(404).send("Route not found 😕");
});

app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`);
});
