# QR Menu

QR Menu is a digital menu generating app designed for restaurants to create responsive HTML menus and generate QR codes linked to them.
This solution allows restaurants to manage their menus online, eliminating the need for physical printing and enabling customers to view menus via QR codes.

## Features
- **Dynamic Menu Management**: Easily update menu items and styles.
- **QR Code Generation**: Create QR codes that link directly to a menu.
- **Customizable Styles**: Tailor the look and feel of a menu to match the restaurant's branding.
- **Secure Authentication**: Ensure safe and secure access for restaurant management.

## Middleware and Libraries
- `express-validator`: Validates and sanitizes user input.
- `session-validator`: Manages user sessions.
- `mongoose`: MongoDB object modeling.
- `mongostore`: Stores session data in MongoDB.
- `bcrypt`: Hashes passwords for secure authentication.
- `multer`: Handles file uploads.
- `sharp`: Processes images for resizing and optimization.
- `qrcode`: Generates QR codes.
- `bootstrap`, `popperjs`, `jquery`: Frontend libraries for responsive design and interactivity.

## Template Engine
- **Handlebars**: Utilizes Handlebars with custom helpers for dynamic HTML rendering.

## Project Structure

### Models
- **users.js**: Defines user schema and methods.
- **restaProfiles.js**: Defines restaurant profiles schema.
- **menuItem.js**: Defines menu items schema.

### Controller
- **index.js**: Manages application logic and route handling.

### Routes
- **index.js**: Handles Home, About, Pricing, User Login, and Logout.
- **user_routes.js**: Manages User Home, Edit User, Register, Edit Account, and Delete Account.
- **restaurant_routes.js**: Manages restaurant creation, editing, deletion, menu management, and QR code handling.
- **menu_routes.js**: Handles adding, editing, deleting menu items, and menu customization.

### Views
- **layouts**: Main templates
    - `main.hbs` 
    - `client_menu.hbs`
- **partials**: Reusable components
    - `navbar.hbs` 
    - `nav_client_menu.hbs`

- **client_menu**: Template for the final customer menu

- Various views for user interaction:
    - `about.hbs`
    - `add_menu_items.hbs`
    - `create_resta_profile.hbs`
    - `customize_menu_style.hbs`
    - `edit_account.hbs`
    - `edit_menu_item.hbs`
    - `edit_resta_profile.hbs`
    - `home.hbs`
    - `login.hbs`
    - `pricing.hbs`
    - `register.hbs`
    - `restaurant_menu.hbs`
    - `user_dashboard.hbs`

### Public
- **images**: Contains logos, menu item images.
- **styles**: CSS files for styling.
- **scripts**: JavaScript files for client-side functionality.

### Helpers
- **handlebars-helpers.js**: Contains custom Handlebars helpers for enhanced template logic.

