/* Routes for restaurant:

create/update/delete restaurants

*/

const express = require("express");
const router = express.Router();
const User = require("../models/users");
const Restaurant = require("../models/restaProfiles");
const MenuItem = require("../models/menuItem");
const bcrypt = require("bcrypt");
const path = require("path");
const upload = require("../middleware/multer");

// Client Menu Get

  


// Route to display restaurant menu - Draft
router.get("/restaurant/:id/client_menu", async (req, res) => {
    const restaurantId = req.params.id;
    try {
        const restaurant = await Restaurant.findById(restaurantId);
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


// Route to display restaurant menu - Attempt to sort by Category
// router.get("/restaurant/:id/client_menu", async (req, res) => {
//     const restaurantId = req.params.id;
//     try {
//       const restaurant = await Restaurant.findById(restaurantId);
//       const menuItems = await MenuItem.find({ resta_profile_id: restaurantId });
  
//       // Define category order
//       const categoryOrder = [
//         null, // For items with no category
//         "specials",
//         "entrees",
//         "breakfast",
//         "brunch",
//         "main",
//         "desserts",
//         "beverages",
//         "hot-beverages"
//       ];
  
//       // Group menu items by category
//       const groupedItems = categoryOrder.reduce((acc, category) => {
//         acc[category] = menuItems.filter(item => item.item_category === category);
//         return acc;
//       }, {});
  
//       // Sort items with no category first
//       groupedItems[null] = menuItems.filter(item => !item.item_category);
  
//       res.render("client_menu/client_menu", {
//         title: restaurant.resta_name,
//         restaurant,
//         groupedItems,
//         user: req.session.user,
//         userSession: true,
//         layout: 'client_menu_main' // Specifing a different layout for this route
//       });
  
//       // Set resta_profile_id in session
//       req.session.user.resta_profile_id = restaurant._id;
  
//     } catch (error) {
//       console.error("Error fetching restaurant menu:", error);
//       res.status(500).send("Internal Server Error");
//     }
//   });


module.exports = router;