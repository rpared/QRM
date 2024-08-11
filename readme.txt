QR Menu
A digital menu generating app that creates html responsive menus for restaurants and generates qr codes linked to them.
Allows restaurants to have online menus and edit them on the fly, and no need for printing them.
The QR code can be handed to their customers.

Middleware and libraries:
    - multer
    - express-validator
    - session-validator
    - mongoose
    - mongostore
    - bcrypt
    - sharp
    - qrcode
    - bootstrap
    - popperjs
    - jquery

Template Engine:
    - Handlebars (with helpers)


Structure:

models: (schemas)
    - users.js
    - restaProfiles.js
    - menuItem.js

controller:
    - index.js


routes:
- index.js:
    - Home 
    - About
    - Pricing
    - User Login
    - Logout

- user_routes.js:
    - User Home
    - Edit User
    - Register
    - Edit Account
    - Delete Account
    
- restaurant_routes.js:
    - Create restaurants
    - Edit restaurants
    - Delete restaurants
    - Manage Menu
    - View Client Menu (Final Customer Menu)
    - Download QR Code
    - Display Logo Thumbnails

- menu_routes.js:
    - Add Menu Items
    - Edit Menu Items
    - Delete Menu Items
    - Display Menu Thumbnails
    - Customize Menu Style


views:
    - layouts:
        - main.hbs
        - client_menu.hbs
    - partials:
        - navbar.hbs
    - client_menu:
        - client_menu.hbs
    - about.hbs
    - add_menu_items.hbs
    - create_resta_profile.hbs
    - customize_menu_style.hbs
    - edit_account.hbs
    - edit_menu_item.hbs
    - edit_resta_profile.hbs
    - home.hbs
    - login.hbs
    - pricing.hbs
    - register.hbs
    - restaurant_menu.hbs
    - user_dashboard.hbs

public:
    - images
    - styles

helpers
    - handlebars-helpers.js
