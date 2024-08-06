QR Menu
A digital menu generating app that reates html responsive menus for restaurants and generates qr codes linked to them.

Mongo DBDatabase handled through mongoose.

Structure

models: (schemas)
    - users
    - restProfiles
    - menuItem

controller:
    - index.js

middleware:
    - multer
    - express-validator
    - session-validator
    - sharp
    - qrcode

routes:
- index:
    - Home 
    - About
    - Pricing
    - User Login
    - Logout

- user_routes
    - User Home
    - Edit User
    - Register
    - Edit Account
    - Delete Account
    
- restaurant_routes
    - Create restaurants
    - Edit restaurants
    - Delete restaurants
    - Manage Menu
    - View Client Menu (Final Customer Menu)
    - Download QR Code

- Menu_routes
    - Add Menu Items
    - Edit Menu Items
    - Customize Menu Styles
    - Delete Menu Items

views:
    - layouts:
        - main.hbs
        - client_menu.hbs
    - partials:
        - navbar.hbs
    - create_user.hbs
    - login.hbs
    
    - user_dashboard.hbs
    - create_resta_profile.hbs
    - edit_rest_profile.hbs
    - add_menu_items.hbs
    client_menu:
        - client_menu.hbs

public:
    - images
    - styles

uploads:
    - restaurant_logos
    - menu_photos

