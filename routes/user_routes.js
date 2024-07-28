const express = require("express");
const router = express.Router();
const User = require("../models/users");
const Restaurant = require("../models/restaProfiles");
const MenuItem = require("../models/menuItem");
const bcrypt = require("bcrypt");

// Register Get
router.get("/register", (req, res) => {
  res.render("register", {
    title: "Register",
    message: "Enter your info.",
  });
});

// Register Post
router.post("/register", async (req, res) => {
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
router.get("/users", async (req, res) => {
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
router.get("/login", (req, res) => {
  res.render("login", {
    title: "Login",
    message: "Enter your credentials.",
  });
});

// Login Post
router.post("/login", async (req, res) => {
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

    // Fetch the restaurant profile associated with this user
    const restaurant = await Restaurant.findOne({ user_id: user._id });

    // Successful login
    console.log("Login successful");

    // Save user info in session
    req.session.user = {
      id: user._id,
      email: user.email,
      firstname: user.firstname,
      resta_profile_id: restaurant ? restaurant._id : null, // Set resta_profile_id if available
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
router.get("/check-login", (req, res) => {
  if (req.session.user) {
    // If user session exists, return user data
    res.json({
      isLoggedIn: true,
      user: req.session.user,
    });
  } else {
    // If user session does not exist, return isLoggedIn false
    res.json({
      isLoggedIn: false,
    });
  }
});

// User logout
router.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Error during logout:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    res.json({ message: "Logged out successfully" });
  });
});

// User Dashboard
router.get("/user_dashboard", async (req, res) => {
  if (req.session.user) {
    try {
      const restaurants = await Restaurant.find({
        user_id: req.session.user.id,
      });
      res.render("user_dashboard", {
        title: "User Dashboard",
        message: "Welcome to your dashboard.",
        user: req.session.user,
        restaurants: restaurants,
        userSession: true,
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
router.get("/create_restaurant_profile", (req, res) => {
  if (req.session.user) {
    res.render("create_resta_profile", {
      title: "Create Restaurant Profile",
      user: req.session.user,
      userSession: true,
    });
  } else {
    res.redirect("/login");
  }
});

// Route to handle the creation of a restaurant profile
router.post("/create_restaurant_profile", async (req, res) => {
  if (req.session.user) {
    const {
      resta_name,
      resta_logo,
      resta_description,
      resta_location,
      resta_hours,
      resta_email,
      resta_phone,
    } = req.body; // Extract all fields
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

      // Set resta_profile_id in session
      req.session.user.resta_profile_id = restaurant._id;

      res.redirect("/user_dashboard");
    } catch (error) {
      console.error("Error creating restaurant profile:", error);
      res.status(500).render("create_resta_profile", {
        title: "Create Restaurant Profile",
        message: "Error creating restaurant profile. Please try again.",
        user: req.session.user,
        userSession: true,
      });
    }
  } else {
    res.redirect("/login");
  }
});

// Route to display restaurant menu
router.get("/restaurant/:id", async (req, res) => {
  const restaurantId = req.params.id;
  try {
      const restaurant = await Restaurant.findById(restaurantId);
      const menuItems = await MenuItem.find({ resta_profile_id: restaurantId });
      console.log("Menu Items:", JSON.stringify(menuItems, null, 2)); // Log the menu items

      res.render("restaurant_menu", {
          title: restaurant.resta_name,
          restaurant,
          menuItems,
      });
  } catch (error) {
      console.error("Error fetching restaurant menu:", error);
      res.status(500).send("Internal Server Error");
  }
});

// API to fetch menu items for a specific restaurant profile
router.get("/api/restaurant/:id/menu_items", async (req, res) => {
  const restaurantId = req.params.id;
  try {
      const menuItems = await MenuItem.find({ resta_profile_id: restaurantId });
      res.json(menuItems);
  } catch (error) {
      console.error("Error fetching menu items:", error);
      res.status(500).json({ error: "Internal Server Error" });
  }
});
module.exports = router;
