// Nothing here yet
/* Routes for menu:

add/edit/delete menu items

*/

const express = require("express");
const router = express.Router();
const User = require("../models/menuItem");

// Add Items
router.get("/add_menu_items", (req, res) => {
  if (req.session.user) {
    res.render("add_menu_items", {
      title: "Add Items to your Menu",
      message:
        "To create different Menus create different Restaurant Profiles.",
      user: req.session.user,
      userSession: true,
    });
  } else {
    res.redirect("/login");
  }
});

module.exports = router;
