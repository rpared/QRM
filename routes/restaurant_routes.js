// restaurant_routes.js
const express = require("express");
const router = express.Router();
const User = require("../models/users");
const Restaurant = require("../models/restaProfiles");
const MenuItem = require("../models/menuItem");
const bcrypt = require("bcrypt");
const path = require("path");
const upload = require("../middleware/multerS3"); // Use the new S3 storage configuration
const QRCode = require('qrcode');
const PORT = process.env.PORT || 3000;

// Generate QRcode for download
router.get('/restaurant/:restaurantId/qrcode/download', async (req, res) => {
    const { restaurantId } = req.params;
    try {
      const opts = {
        errorCorrectionLevel: 'H',
        type: 'image/jpeg',
        quality: 0.3,
        margin: 1,
      };
      const url = `http://localhost:${PORT}/restaurant/${restaurantId}/client_menu`;
      const qrCodeBuffer = await QRCode.toBuffer(url, opts);
  
      res.setHeader('Content-Disposition', 'attachment; filename="qrcode.jpg"');
      res.setHeader('Content-Type', 'image/jpeg');
      res.send(qrCodeBuffer);
    } catch (error) {
      console.error('Error generating QR code:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });


// Route to display Client Menu, the QR code menu
router.get("/restaurant/:id/client_menu", async (req, res) => {
    const restaurantId = req.params.id;
    try {
        const restaurant = await Restaurant.findById(restaurantId);
        if (!restaurant) {
            console.error(`Restaurant with ID ${restaurantId} not found`);
            return res.status(404).send("Restaurant not found");
        }
        const menuItems = await MenuItem.find({ resta_profile_id: restaurantId });
        console.log("Menu Items:", JSON.stringify(menuItems, null, 2)); // Log the menu items

        res.render("client_menu/client_menu", {
            title: restaurant.resta_name,
            restaurant,
            menuItems,
            user: req.session.user,
            userSession: true,
            layout: 'client_menu_main' // Specify the layout for this route
        });

        // Set resta_profile_id in session
        req.session.user.resta_profile_id = restaurant._id;

    } catch (error) {
        console.error("Error fetching restaurant menu:", error);
        res.status(500).send("Internal Server Error");
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
router.post("/create_restaurant_profile", upload.single('resta_logo'), async (req, res) => {
  if (req.session.user) {
      const {
          resta_name,
          resta_description,
          resta_location,
          resta_hours,
          resta_email,
          resta_phone
      } = req.body; // Extract all fields

      // Extract file information
      const resta_logo = req.file ? req.file.location : null;

      console.log("Received data:", req.body);
      console.log("File information:", req.file);

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
          console.log("Restaurant created with ID:", restaurant._id);

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
// Route to Manage restaurant menu
router.get("/restaurant/:id", async (req, res) => {
    const restaurantId = req.params.id;
    try {
        const restaurant = await Restaurant.findById(restaurantId);
        if (!restaurant) {
            console.error(`Restaurant with ID ${restaurantId} not found`);
            return res.status(404).send("Restaurant not found");
        }
        const menuItems = await MenuItem.find({ resta_profile_id: restaurantId });
        console.log("Menu Items:", JSON.stringify(menuItems, null, 2)); // Log the menu items

        res.render("restaurant_menu", {
            title: restaurant.resta_name,
            restaurant,
            menuItems,
            user: req.session.user,
            userSession: true,
        });

        // Set resta_profile_id in session
        req.session.user.resta_profile_id = restaurant._id;

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

// Edit restaurant details like name, logo, hours
// Route to display the form for editing 
router.get("/restaurant/:id/edit", async (req, res) => {
    const restaurantId = req.params.id;
    try {
        const restaurant = await Restaurant.findById(restaurantId);

        if (!restaurant) {
            console.error(`Restaurant with ID ${restaurantId} not found`);
            return res.status(404).send("Restaurant not found");
        }

        res.render("edit_resta_profile", {
            title: `Edit ${restaurant.resta_name}`,
            restaurant,
            user: req.session.user,
            userSession: true,
        });
    } catch (error) {
        console.error("Error fetching restaurant details:", error);
        res.status(500).send("Internal Server Error");
    }
});

// Route to handle the update of restaurant details
router.post("/restaurant/:id/edit", upload.single('resta_logo'), async (req, res) => {
    const restaurantId = req.params.id;
    const {
        resta_name,
        resta_description,
        resta_location,
        resta_hours,
        resta_email,
        resta_phone,
    } = req.body;
    const resta_logo = req.file ? req.file.location : null;

    try {
        // Find the restaurant by its ID and update its details
        const restaurant = await Restaurant.findById(restaurantId);

        if (!restaurant) {
            console.error(`Restaurant with ID ${restaurantId} not found`);
            return res.status(404).send("Restaurant not found");
        }

        restaurant.resta_name = resta_name;
        restaurant.resta_description = resta_description;
        restaurant.resta_location = resta_location;
        restaurant.resta_hours = resta_hours;
        restaurant.resta_email = resta_email;
        restaurant.resta_phone = resta_phone;

        // Only update the logo if a new one is uploaded
        if (resta_logo) {
            restaurant.resta_logo = resta_logo;
        }

        await restaurant.save();
        res.redirect(`/user_dashboard`);
    } catch (error) {
        console.error("Error updating restaurant details:", error);
        res.status(500).send("Internal Server Error");
    }
});

// Delete the Restaurant
router.get("/api/restaurant/delete/:id", async (req, res) => {
    const restaurantId = req.params.id;
    try {
        const result = await Restaurant.findByIdAndDelete(restaurantId);
    } catch (error) {
        console.error("Error deleting restaurant:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
    res.redirect(`/user_dashboard`);
});

module.exports = router;
