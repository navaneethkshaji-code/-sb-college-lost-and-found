# Lost & Found Web Portal

A secure, intuitive, and reassuring full-stack web application designed to help communities report lost and found items, communicate safely, match related claims using keyword/category correlations, and log handovers using official "Handover Receipts".

---

## ⚡ Quick-Start (Instant Demo)
Because Node.js and Python might not be installed or configured in your system's PATH, you can test the complete user flow **instantly without installing anything**:
1. Go to the root directory of this project.
2. Locate the [demo.html](file:///c:/Users/Navaneeth%20K%20shaji/Desktop/lost%20and%20found/demo.html) file.
3. **Double-click** the file to open it in any modern web browser.
4. Interact with the application! You can:
   - Register or login using mock profiles (e.g. `sarah@example.com`).
   - Create lost or found item reports.
   - Send chat messages to discoverers.
   - Resolve listings and generate verified Handover Receipts.
   - Reload the page; all state persists automatically in your browser's `localStorage`.

---

## 📂 Project Architecture & Codebase Structure
The production-ready codebase is divided into two primary directories:

* **/backend**: Node.js + Express API server with MongoDB integration.
* **/frontend**: Vite + React SPA styled with Tailwind CSS.

```
lost-and-found/
├── demo.html               # Instant client-side prototype
├── README.md               # Setup and documentation (This file)
├── docker-compose.yml      # Orchestration for local MongoDB databases
├── backend/
│   ├── package.json        # Dependencies & start scripts
│   ├── server.js           # Express main server entry point
│   ├── config/
│   │   └── db.js           # Mongoose MongoDB connection establishment
│   ├── models/
│   │   ├── User.js         # Mongoose User collection schema
│   │   ├── Post.js         # Mongoose Lost/Found items schema
│   │   └── HandoverReport.js # Claims verification and receipt records
│   ├── routes/
│   │   ├── auth.js         # User registration, login, and profile fetching
│   │   ├── posts.js        # Item CRUD, custom matching logic, and messaging
│   │   └── handovers.js    # Verified Handover Receipt generation and lookups
│   └── uploads/            # Mock/local storage folder for uploaded photos
└── frontend/
    ├── package.json        # Frontend dev tools & dependencies
    ├── vite.config.js      # Build & proxy configurations
    ├── index.html          # HTML Shell
    ├── src/
        ├── main.jsx        # Bootstraps React
        ├── index.css       # Tailwind directives & base styles
        ├── App.jsx         # App routing & Global Auth Provider
        ├── components/
        │   ├── Navbar.jsx  # Responsive Navigation & User panel
        │   ├── PostCard.jsx # Feed card displaying item info & status badges
        │   ├── CreatePostModal.jsx # Form popup for reporting lost/found items
        │   └── HandoverReceiptModal.jsx # The downloadable claim certificate
        └── views/
            ├── Dashboard.jsx  # Main feed with text search, categories, and filters
            ├── PostDetail.jsx # Visual details, match matching suggestion sidebar, chat
            ├── Profile.jsx    # Active listings & resolved handover receipts history
            ├── Login.jsx      # Form for secure login
            └── Signup.jsx     # Form for user registration
```

---

## 🛠️ Local Environment Installation & Setup

To deploy the production-ready code locally, follow these steps to download runtime engines and launch services.

### Prerequisite 1: Install Node.js
1. Download the LTS installer from the [Node.js Official Website](https://nodejs.org/).
2. Run the installer, accept terms, and keep default options (ensure "Add to PATH" is checked).
3. Restart your terminal, then type `node -v` and `npm -v` to verify installation.

### Prerequisite 2: Start MongoDB
You can run MongoDB in two ways:
* **Option A (Docker)**: If you have Docker installed, simply run `docker-compose up -d` at the root directory. This runs MongoDB on port `27017` with credentials defined in `docker-compose.yml`.
* **Option B (Atlas Cloud)**: Create a free sandbox database on [MongoDB Atlas](https://www.mongodb.com/products/platform/atlas-database), copy your connection string, and paste it inside the backend `.env` configuration.

---

### Step 1: Backend Setup
1. Open a terminal and navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `backend/` directory:
   ```env
   PORT=5000
   MONGO_URI=mongodb://admin:password123@localhost:27017/lostfound?authSource=admin
   JWT_SECRET=super_secret_reassurance_key_99182
   ```
   *(Adjust `MONGO_URI` if using MongoDB Atlas cloud cluster)*
4. Start the development API server:
   ```bash
   npm run dev
   ```
   *(Server starts running at `http://localhost:5000`)*

---

### Step 2: Frontend Setup
1. Open a separate terminal window and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development Vite server:
   ```bash
   npm run dev
   ```
4. Access the portal in your browser:
   - The Vite output will provide the local URL, typically `http://localhost:5173`.
   - The Vite config includes an API proxy redirecting all requests to `/api/*` directly to `http://localhost:5000/api/*` to avoid CORS issues.

---

## 🔗 Key API Endpoint Documentation

### Authentication (`/api/auth`)
* `POST /api/auth/signup` - Register a new account. Needs `username`, `email`, `password`, `phone`.
* `POST /api/auth/login` - Verify credentials. Returns JSON Web Token (JWT) + User model.
* `GET /api/auth/profile` - Fetch current user info. Requires Bearer Token.

### Lost & Found Items (`/api/posts`)
* `GET /api/posts` - Fetch active listings. Filters supported: `status` (lost/found), `category`, `location`, and `search` query.
* `POST /api/posts` - Create post. Expects form-data (handles file upload via Multer middleware).
* `GET /api/posts/:id` - Fetch individual item detail (includes automatic matches suggestion algorithm).
* `PUT /api/posts/:id` - Edit listing fields (allowed only by the author).
* `DELETE /api/posts/:id` - Retract a report.
* `POST /api/posts/:id/resolve` - Close listing. Resolves the report and logs a `HandoverReport` in the database.

### Handover Receipts (`/api/handovers`)
* `GET /api/handovers/:id` - Fetch receipt receipt details including unique serial receipt numbers, date verification, and verification keys.
