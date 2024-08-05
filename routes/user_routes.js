const express = require("express");
const router = express.Router();
const User = require("../models/users");
const Restaurant = require("../models/restaProfiles");
const MenuItem = require("../models/menuItem");
const bcrypt = require("bcrypt");
const path = require("path");
const upload = require("../middleware/multer");

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

// GET route to display the edit user form
router.get("/edit_account", (req, res) => {
  
  if (!req.session.user) {
    return res.redirect("/login");
  }

  const { id, email, firstname, lastname } = req.session.user;

  res.render("edit_account", {
    title: "Edit Account",
    id,
    email,
    firstname,
    lastname,
    user: req.session.user,
    userSession: true,

  });
  
});

// POST route to handle the edit user form submission
router.post("/edit_account/:id", async (req, res) => {
  if (!req.session.user) {
    return res.redirect("/login");
  }

  const { email, password, firstname, lastname } = req.body;
  const userId = req.session.user.id;
  
  
  try {
    const updates = {
      email,
      firstname,
      lastname,
    };

    // Only update the password if it's provided
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 2);
      updates.password = hashedPassword;
    }

    // Find the user and update their information
    const user = await User.findByIdAndUpdate(userId, updates, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      return res.status(404).send("User not found");
    }

    // Update session with new user data, this is causing trouble!
    // req.session.user = user;

    req.session.user = {
      id: user.id,
      email: user.email,
      firstname: user.firstname,
      lastname: user.lastname,
    };

    res.redirect("/user_dashboard");
  } catch (error) {
    console.log("Error updating user:", error);
    res.status(400).render("edit_account", {
      title: "Edit Account",
      email,
      firstname,
      lastname,
      message: "Error updating account. Please try again.",
    });
  }
});

// Delete Account - API route to actually delete the account it is not a POST, it is done with an href!!
router.get("/api/delete_account/:id", async (req, res) => {
  if (!req.session.user) {
    return res.redirect("/login");
  }

  const userId = req.session.user.id; // Get the user ID from the session
  
  try {
    // Delete the user
    const result = await User.findByIdAndDelete(userId);
    
    if (!result) {
      return res.status(404).send("User not found");
    }

    // Destroy the session and redirect to the home page or login
    req.session.destroy((err) => {
      if (err) {
        console.error("Error destroying session:", err);
        return res.status(500).send("Error deleting account. Please try again.");
      }
      res.redirect("/"); //Redirect to home
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).send("Error deleting account. Please try again.");
  }
});



// Route to log all users to console > Useful to track!
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
          lastname: user.lastname, // Set the lastname if available
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

          // Fetch menu items for each restaurant
          const menuItems = await MenuItem.find({
            resta_profile_id: { $in: restaurants.map((r) => r._id) },
          });

          // Group menu items by restaurant ID
          const menuItemsByRestaurant = {};
          menuItems.forEach((item) => {
            if (!menuItemsByRestaurant[item.resta_profile_id]) {
              menuItemsByRestaurant[item.resta_profile_id] = [];
            }
            menuItemsByRestaurant[item.resta_profile_id].push(item);
          });

          res.render("user_dashboard", {
            title: "User Dashboard",
            message: "Welcome to your dashboard.",
            user: req.session.user,
            restaurants: restaurants,
            menuItemsByRestaurant: menuItemsByRestaurant,
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



module.exports = router;
