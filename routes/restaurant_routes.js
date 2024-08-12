/* Routes for restaurant:
create / update / delete / download QR Code / display client menu
*/

const express = require("express");
const router = express.Router();
const Restaurant = require("../models/restaProfiles");
const MenuItem = require("../models/menuItem");
const QRCode = require('qrcode');
const PORT = process.env.PORT || 3000;
const multer = require("multer");
const storage = multer.memoryStorage(); //RAM
const upload = multer({ storage: storage });
const sharp = require('sharp'); //To get thumbnails


// Route to View Client Menu - the QR code menu for Final Customers Improved Sorted by Category version
router.get("/restaurant/:id/client_menu", async (req, res) => {
    const restaurantId = req.params.id;
    try {
        const restaurant = await Restaurant.findById(restaurantId);
        let menuItems = await MenuItem.find({ resta_profile_id: restaurantId });

        // Sort menu items by category
        const categoryOrder = ['specials', 'breakfast', 'brunch', 'entrees', 'main', 'desserts', 'beverages', 'hot-beverages'];
        menuItems.sort((a, b) => {
            return categoryOrder.indexOf(a.item_category) - categoryOrder.indexOf(b.item_category);
        });

        // Group items by category
        const groupedMenuItems = categoryOrder.reduce((acc, category) => {
            acc[category] = menuItems.filter(item => item.item_category === category);
            return acc;
        }, {});

        const labelIcons = {
            vegan: "/images/vegan_label.png",
            spicy: "/images/spicy_label.png",
            "gluten-free": "/images/gluten_free_label.png",
            vegetarian: "/images/vegetarian_label.png"
        };

        res.render("client_menu/client_menu", {
            title: restaurant.resta_name,
            restaurant,
            groupedMenuItems, // Pass grouped items to the template
            menuItems, // This is just the item with no category groupipng
            labelIcons,
            user: req.session.user,
            userSession: true,
            layout: 'client_menu_main'
        });

        req.session.user.resta_profile_id = restaurant._id;

    } catch (error) {
        console.error("Error fetching restaurant menu:", error);
        res.status(500).send("Internal Server Error");
    }
});

// Generate QRcode for download New
router.get('/restaurant/:restaurantId/qrcode/download/:format', async (req, res) => {
  const { restaurantId, format } = req.params; // Get format from URL parameters

  try {
      const url = `http://localhost:${PORT}/restaurant/${restaurantId}/client_menu`;

      // Default to PNG if no format is specified or an invalid format is given
      let opts = {
          errorCorrectionLevel: 'H',
          margin: 1,
      };
      let contentType = 'image/png';
      let fileName = 'qrcode.png';
      let qrCodeData;

      if (format === 'svg') {
          // SVG format options
          opts.type = 'svg';
          contentType = 'image/svg+xml';
          fileName = 'qrcode.svg';
          qrCodeData = await QRCode.toString(url, opts); // Use toString for SVG format
      } else {
          // PNG format options
          opts.type = 'png';
          qrCodeData = await QRCode.toBuffer(url, opts); // Use toBuffer for PNG format
      }

      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      res.setHeader('Content-Type', contentType);
      res.send(qrCodeData);

  } catch (error) {
      console.error('Error generating QR code:', error);
      res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Generate QRcode API (just png)
router.get('/api/restaurant/:restaurantId/qrcode/download/', async (req, res) => {
  const { restaurantId } = req.params; // Get restaurant ID from URL parameters
  try {
      const url = `http://localhost:${PORT}/restaurant/${restaurantId}/client_menu`;

      let opts = {
          errorCorrectionLevel: 'H',
          margin: 2,
          type: 'png', // Ensure format is PNG
      };
      
      // Generate QR code as a buffer
      const qrCodeBuffer = await QRCode.toBuffer(url, opts);
      
      // Set appropriate headers
      res.setHeader('Content-Disposition', 'inline; filename="qrcode.png"');
      res.setHeader('Content-Type', 'image/png');
      
      // Send the QR code buffer as the response
      res.send(qrCodeBuffer);

  } catch (error) {
      console.error('Error generating QR code:', error);
      res.status(500).json({ error: 'Internal Server Error' });
  }
});

  
// Route to Get restaurant profile creation
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
  
 // Route to handle the creation of a restaurant profile (Cloud + Thumbnails)
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
    const { file } = req;

    try {
      let resta_logo = { data: null, contentType: null };
      let resta_logo_thumbnail = { data: null, contentType: null };

      if (file) {
          const thumbnailBuffer = await sharp(file.buffer)
              .resize({ width: 300 })
              .toBuffer();

          resta_logo = {
              data: file.buffer,
              contentType: file.mimetype,
          };

          resta_logo_thumbnail = {
              data: thumbnailBuffer,
              contentType: file.mimetype,
          };
      }

    console.log("Received data:", req.body);
    console.log("File information:", req.file);
    
      const restaurant = new Restaurant({
        user_id: req.session.user.id,
        resta_name,
        resta_logo,
        resta_logo_thumbnail,
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

// Route to Display the Restaurant Logo thumbnails
router.get('/resta_logo/:id', async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant || !restaurant.resta_logo_thumbnail.data) {
      return res.status(404).send('Image not found');
    }
    res.set('Content-Type', restaurant.resta_logo_thumbnail.contentType);
    res.send(restaurant.resta_logo_thumbnail.data);
  } catch (error) {
    console.error('Error fetching image:', error);
    res.status(500).send('Internal Server Error');
  }
});

  // Route to Manage restaurant menu
router.get("/restaurant/:id", async (req, res) => {
    const restaurantId = req.params.id;
    try {
        const restaurant = await Restaurant.findById(restaurantId);
        const menuItems = await MenuItem.find({ resta_profile_id: restaurantId });
        // console.log("Menu Items:", JSON.stringify(menuItems, null, 2)); // Log the menu items > This takes forever now with image buffer & thumbnails 
  
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

  // API to fetch menu items for a specific restaurant profile --- The Previous Get route already fetches this stuff, but this is a fancy API one!
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
  

  //Edit restaurant details like name, logo, hours
    // Route to display the form for editing 
    router.get("/restaurant/:id/edit", async (req, res) => {
      const restaurantId = req.params.id;
      try {
        const restaurant = await Restaurant.findById(restaurantId);
  
        if (!restaurant) {
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
    const { file } = req;

    try {
      // Find the restaurant by its ID and update its details
      const restaurant = await Restaurant.findById(restaurantId);

      if (!restaurant) {
        return res.status(404).send("Restaurant not found");
      }

      // Process new image and thumbnail if logo is provided
      let resta_logo = restaurant.resta_logo; // Keep existing photo if no new photo provided
      let resta_logo_thumbnail = restaurant.resta_logo_thumbnail; // Keep existing thumbnail if no new thumbnail provided
      
      if (file) {
        const thumbnailBuffer = await sharp(file.buffer)
            .resize({ width: 300 })
            .toBuffer();

        resta_logo = {
            data: file.buffer,
            contentType: file.mimetype,
        };

        resta_logo_thumbnail = {
            data: thumbnailBuffer,
            contentType: file.mimetype,
        };
    }

    // Update the restaurant with new info
      restaurant.resta_name = resta_name;
      restaurant.resta_description = resta_description;
      restaurant.resta_location = resta_location;
      restaurant.resta_hours = resta_hours;
      restaurant.resta_email = resta_email;
      restaurant.resta_phone = resta_phone;
      restaurant.resta_logo = resta_logo;
      restaurant.resta_logo_thumbnail = resta_logo_thumbnail;


      await restaurant.save();
      res.redirect(`/user_dashboard`);
    } catch (error) {
      console.error("Error updating restaurant details:", error);
      res.status(500).send("Internal Server Error");
    }
  });

  // Delete the Restaurant (cascading deletion)
    router.get("/api/restaurant/delete/:id", async (req, res) => {
        const restaurantId = req.params.id;
        try {
        
        // Delete all menu items associated with the restaurant
        await MenuItem.deleteMany({ resta_profile_id: { $in: restaurantId } });

        await Restaurant.findByIdAndDelete(restaurantId);
    
        } catch (error) {
            console.error("Error deleting restaurant:", error);
            res.status(500).json({ error: "Internal Server Error" });
        }
        // res.status(200).send("Restaurant deleted");
        res.redirect(`/user_dashboard`);
    })


module.exports = router;