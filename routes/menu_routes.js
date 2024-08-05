const express = require("express");
const router = express.Router();
const Restaurant = require("../models/restaProfiles");
const MenuItem = require("../models/menuItem");
const path = require("path");
// const upload = require("../middleware/multer");

const multer = require("multer");
const storage = multer.memoryStorage(); //RAM
const upload = multer({ storage: storage });
const sharp = require('sharp'); //To get thumbnails

// Add Items Route Cloud with Thumbnails - Get
router.get("/add_menu_items", (req, res) => {
    if (req.session.user) {
        res.render("add_menu_items", {
            title: "Add Items to your Menu",
            message: "To create different Menus create different Restaurant Profiles.",
            user: req.session.user,
            userSession: true,
        });
    } else {
        res.redirect("/login");
    }
});
// Add Items Route Cloud with Thumbnails - Post
router.post("/add_menu_item", upload.single('item_photo'), async (req, res) => {
    const { item_name, item_category, item_description, item_labels, item_price } = req.body;
    const { file } = req;

    try {
        let item_photo = { data: null, contentType: null };
        let item_photo_thumbnail = { data: null, contentType: null };

        if (file) {
            const thumbnailBuffer = await sharp(file.buffer)
                .resize({ width: 300 })
                .toBuffer();

            item_photo = {
                data: file.buffer,
                contentType: file.mimetype,
            };

            item_photo_thumbnail = {
                data: thumbnailBuffer,
                contentType: file.mimetype,
            };
        }

        const resta_profile_id = req.session.user.resta_profile_id; // Get restaurant profile ID from session
        
        // Avoid unnecessary logging
        // console.log("Received data:", req.body);
        // console.log("Photo information:", file ? file.originalname : 'No photo uploaded');

        const newItem = new MenuItem({
            resta_profile_id,
            item_id: Date.now(), // Simple way to generate item ID
            item_name,
            item_category,
            item_description,
            item_labels: Array.isArray(item_labels) ? item_labels : [item_labels],
            item_price,
            item_photo,
            item_photo_thumbnail,
        });

        await newItem.save();

        res.redirect(`/restaurant/${resta_profile_id}`); // Redirect after successful save
    } catch (error) {
        console.error("Error adding menu item:", error);
        res.status(500).send("Internal Server Error");
    }
});

//Original Add menu item
// router.post("/add_menu_item", upload.single('item_photo'), async (req, res) => {
//     const { item_name, 
//         item_category, 
//         item_description, 
//         item_labels, 
//         item_price 
//     } = req.body;
//     const item_photo = req.file ? req.file.filename : null;
//     const resta_profile_id = req.session.user.resta_profile_id; // Get restaurant profile ID from session
//     console.log("Received data:", req.body);
//     console.log("File information:", req.file);

//     try {
//         const newItem = new MenuItem({
//             resta_profile_id,
//             item_id: Date.now(), // Simple way to generate item ID
//             item_category,
//             item_name,
//             item_photo,
//             item_description,
//             item_labels: Array.isArray(item_labels) ? item_labels : [item_labels],
//             item_price
//         });

//         await newItem.save();
//         res.redirect(`/restaurant/${resta_profile_id}`);
//     } catch (error) {
//         console.error("Error adding menu item:", error);
//         res.status(500).send("Internal Server Error");
//     }
// });

// Edit Menu Item - GET

// Update Menu Item Get
router.get("/restaurant/:restaurantId/menu/:menuItemId/edit", async (req, res) => {
    const { restaurantId, menuItemId } = req.params;
    try {
      const menuItem = await MenuItem.findById(menuItemId);
      if (!menuItem) {
        return res.status(404).send("Menu item not found");
      }
      res.render("edit_menu_item", {
        title: "Edit Menu Item",
        restaurantId: restaurantId,
        menuItem: menuItem,
        user: req.session.user,
            userSession: true,
      });
    } catch (error) {
      console.error("Error fetching menu item:", error);
      res.status(500).send("Error loading edit menu item page");
    }
  });

  // Update Menu Item Post - With Thumbnails
  router.post("/restaurant/:restaurantId/menu/:itemId/edit", upload.single('item_photo'), async (req, res) => {
    const { itemId } = req.params;
    const { item_name, item_category, item_description, item_labels, item_price } = req.body;
    const { file } = req;

    try {
        // Find the existing menu item by ID
        const menuItem = await MenuItem.findById(itemId);

        if (!menuItem) {
            return res.status(404).send("Menu item not found");
        }

        // Process new image and thumbnail if provided
        let item_photo = menuItem.item_photo; // Keep existing photo if no new photo provided
        let item_photo_thumbnail = menuItem.item_photo_thumbnail; // Keep existing thumbnail if no new thumbnail provided

        if (file) {
            const thumbnailBuffer = await sharp(file.buffer)
                .resize({ width: 300 })
                .toBuffer();

            item_photo = {
                data: file.buffer,
                contentType: file.mimetype,
            };

            item_photo_thumbnail = {
                data: thumbnailBuffer,
                contentType: file.mimetype,
            };
        }

        // Update the menu item with new values
        menuItem.item_name = item_name;
        menuItem.item_category = item_category;
        menuItem.item_description = item_description;
        menuItem.item_labels = Array.isArray(item_labels) ? item_labels : [item_labels];
        menuItem.item_price = item_price;
        menuItem.item_photo = item_photo;
        menuItem.item_photo_thumbnail = item_photo_thumbnail;

        await menuItem.save();

        res.redirect(`/restaurant/${req.params.restaurantId}`); // Redirect to the restaurant page
    } catch (error) {
        console.error("Error updating menu item:", error);
        res.status(500).send("Internal Server Error");
    }
});


  // Update Menu Item Post - Original
//   router.post("/update_menu_item", upload.single('item_photo'), async (req, res) => {
//     const { item_id, item_name, item_category, item_description, item_labels, item_price } = req.body;
//     const item_photo = req.file ? req.file.filename : null;
//     const resta_profile_id = req.session.user.resta_profile_id;

//     console.log("Received data:", req.body);
//     console.log("Updating item with ID:", item_id);
//     console.log("Restaurant profile ID:", resta_profile_id);

//     try {
//         // Find the item by its ID and restaurant profile ID
//         const item = await MenuItem.findOne({ item_id, resta_profile_id });

//         if (!item) {
//             console.log("Menu item not found with ID:", item_id, "and restaurant profile ID:", resta_profile_id);
//             return res.status(404).send("Menu item not found");
//         }

//         // Update the item's details
//         item.item_name = item_name;
//         item.item_category = item_category;
//         item.item_description = item_description;
//         if (item_photo) {
//             item.item_photo = item_photo;
//         }
//         item.item_labels = Array.isArray(item_labels) ? item_labels : [item_labels];
//         item.item_price = item_price;

//         await item.save();
//         res.redirect(`/restaurant/${resta_profile_id}`); // Redirect to a page where the updated item is shown
//     } catch (error) {
//         console.error("Error updating menu item:", error);
//         res.status(500).send("Internal Server Error");
//     }
// });

  
  // Delete Menu Item
  router.post("/restaurant/:restaurantId/menu/:menuItemId/delete", async (req, res) => {
    const { restaurantId, menuItemId } = req.params;
    // Logic to delete the menu item
    try {
        const result = await MenuItem.findByIdAndDelete(menuItemId);
    } catch (error) {
        console.error("Error deleting item:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
      res.redirect(`/restaurant/${restaurantId}`);
    });

  // Route to Display the menu items thumbnails
  router.get('/menu_item_image/:id', async (req, res) => {
    try {
      const menuItem = await MenuItem.findById(req.params.id);
      if (!menuItem || !menuItem.item_photo_thumbnail.data) {
        return res.status(404).send('Image not found');
      }
      res.set('Content-Type', menuItem.item_photo_thumbnail.contentType);
      res.send(menuItem.item_photo_thumbnail.data);
    } catch (error) {
      console.error('Error fetching image:', error);
      res.status(500).send('Internal Server Error');
    }
  });



// Customize the style of the menu: background and font color
// GET
        router.get("/restaurant/:restaurantId/styles", async (req, res) => {
            const { restaurantId } = req.params; // Correctly extract restaurantId from params
            try {
            const restaurant = await Restaurant.findById(restaurantId); // Nedds the Restaurant model
            if (!restaurant) {
                return res.status(404).send("Restaurant not found");
            }
            res.render("customize_menu_style", {
                title: "Customize Menu Style",
                restaurant,
                user: req.session.user,
                userSession: true,
            });
            } catch (error) {
            console.error("Error loading Customize Style page:", error);
            res.status(500).send("Error loading Customize Style page");
            }
        });
  
// POST
        router.post("/restaurant/:restaurantId/styles", async (req, res) => {
            const { restaurantId } = req.params;
            const { headerColor, bodyColor, fontColor, itemBackgroundColor } = req.body;
            try {
            const restaurant = await Restaurant.findById(restaurantId);
            if (!restaurant) {
                return res.status(404).send("Restaurant not found");
            }
            
            // Update the restaurant's style settings
            restaurant.headerColor = headerColor;
            restaurant.bodyColor = bodyColor;
            restaurant.fontColor = fontColor;
            restaurant.itemBackgroundColor = itemBackgroundColor;
            await restaurant.save();
        
            res.redirect(`/restaurant/${restaurantId}/styles`);
            // res.send('Colors saved!');
            } catch (error) {
            console.error("Error updating restaurant styles:", error);
            res.status(500).send("Error saving styles");
            }
        });
  
  

module.exports = router;
