# Social Media Platform

A modern, full-stack social media platform built with Node.js, Express, MongoDB, and vanilla JavaScript.

## ✨ Features

- 🔐 **User Authentication**: Secure login and registration with password hashing
- 📝 **Posts**: Create, view, and delete posts with optional images
- ❤️ **Likes & Comments**: Like posts and add comments
- 👥 **Follow System**: Follow/unfollow users
- 🔍 **Search**: Find users by name or username
- 👤 **Profiles**: View and edit user profiles with profile images
- 📱 **Responsive Design**: Works on desktop and mobile devices
- 🎨 **Modern UI**: Beautiful gradient design with smooth animations and glassmorphism effects
- 🎲 **Sample Data**: Pre-seeded with random users and posts for testing

## 🛠️ Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **bcrypt** - Password hashing
- **express-session** - Session management
- **multer** - File upload handling
- **cors** - Cross-origin resource sharing
- **dotenv** - Environment variables

### Frontend
- **Vanilla JavaScript** - No framework dependency
- **CSS3** - Modern styling with gradients, animations, and responsive design

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or later)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. **Clone or download the project**
   ```bash
   cd "Social Media Platform Project"
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the project root:
   ```env
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/social-media-platform
   SESSION_SECRET=your-secret-key-here
   ```
   
   Or use MongoDB Atlas:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster0.prtxdx3.mongodb.net/social-media-platform?appName=Cluster0
   ```

4. **Seed the database (optional but recommended)**
   
   This will create 15 random users with posts, comments, and followers:
   ```bash
   npm run seed
   ```

5. **Start the server**
   ```bash
   npm start
   ```

6. **Open your browser**
   
   Go to **http://localhost:3000**

## 📖 Usage

### Logging In

If you seeded the database, you can log in with:
- **Email**: Any username from the seed + `@example.com` (e.g., `johnsmith@example.com`)
- **Password**: `password123`

### Creating an Account

1. Click on **Register** from the login page
2. Enter your details: Full Name, Username, Email, and Password
3. Click **Register**

### Features

1. **Home Feed**: View posts from users you follow (and your own)
2. **Create Post**: Write posts and add images
3. **Like & Comment**: Interact with other users' posts
4. **Search**: Find and follow new users
5. **Profile**: View your profile or others' profiles
6. **Edit Profile**: Update your profile information and picture

## 📁 Project Structure

```
Social Media Platform Project/
├── backend/
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── commentController.js
│   │   ├── followController.js
│   │   ├── postController.js
│   │   └── userController.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── upload.js
│   ├── models/
│   │   ├── Comment.js
│   │   ├── Follow.js
│   │   ├── Post.js
│   │   └── User.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── comments.js
│   │   ├── follows.js
│   │   ├── posts.js
│   │   └── users.js
│   ├── server.js
│   └── seed.js
├── frontend/
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   └── app.js
│   └── index.html
├── uploads/
├── .env
├── package.json
└── README.md
```

## 🔒 Security Features

- Password hashing with bcrypt
- Secure session management
- XSS protection (content sanitization)
- Input validation
- CORS configuration

## 📸 Screenshots

*(Add your screenshots here)*

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

## 📝 License

This project is [ISC](https://opensource.org/licenses/ISC) licensed.

## 👤 Author

Created with ❤️ using Trae

---

Made with ☕ and 💻
