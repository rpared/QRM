const express = require("express");
const router = express.Router();
const MenuItem = require("../models/menuItem");
const multer = require("multer");
const path = require("path");

// Multer configuration for file upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// Add Items Route
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

router.post("/add_menu_item", upload.single('item_photo'), async (req, res) => {
    const { item_name, item_category, item_description, item_labels, item_price } = req.body;
    const item_photo = req.file ? req.file.filename : null;
    const resta_profile_id = req.session.user.resta_profile_id; // Get restaurant profile ID from session

    try {
        const newItem = new MenuItem({
            resta_profile_id,
            item_id: Date.now(), // Simple way to generate item ID, consider using a better approach
            item_category,
            item_name,
            item_photo,
            item_description,
            item_labels: Array.isArray(item_labels) ? item_labels : [item_labels],
            item_price
        });

        await newItem.save();
        res.redirect("/add_menu_items");
    } catch (error) {
        console.error("Error adding menu item:", error);
        res.status(500).send("Internal Server Error");
    }
});

module.exports = router;
