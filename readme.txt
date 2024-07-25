QR Menu
A digital menu generating app that reates html responsive menus for restaurants and generates qr codes linked to them.

Mongo DBDatabase handled through mongoose.

Structure

models: (schemas)
    - users
    - profiles
    - menu_items

controller:
    - index.js

middleware:
    - multer
    - express-validator
    - session-validator

routes:
- Main Router
    - Home 
    - Create User
    - User Login
- User Router
    - User Home
    - Edit User
    - Create Profile
    - Display Profile
    - Edit Profile
- Menu Router
    - Add Menu Items
    - Edit Menu Items

views:
    - layouts:
        - main.hbs
        - navbar.hbs
    - create_user.hbs
    - login.hbs
    - Users:
        - user_main.hbs
        - create_resta_profile.hbs
        - edit_rest_profile.hbs
        - add_menu_items.hbs

public:
    - images
    - styles
uploads:
    - restaurant_logos
    - menu_photos

