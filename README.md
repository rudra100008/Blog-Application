# 📝 Blog Application

A full-stack blog platform built with **Next.js 14** (frontend) and **Spring Boot 3** (backend), backed by **MongoDB**. Users can sign up, create and manage blog posts, comment, like/dislike content, and upload images via Cloudinary.

> 🌐 **Live Demo:** [blog-application-u7ov.onrender.com](https://blog-application-u7ov.onrender.com)

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔐 **Authentication** | JWT-based login & signup with Spring Security |
| 📝 **CRUD Posts** | Create, read, update, and delete blog posts |
| 💬 **Comments** | Add comments on any blog post |
| 👍👎 **Like / Dislike** | React to posts with likes and dislikes |
| 🏷️ **Categories** | Organize posts by categories |
| 🖼️ **Image Upload** | Upload post & profile images via Cloudinary |
| 👤 **User Profiles** | View and update user profiles |
| 📱 **Responsive UI** | Mobile-friendly design with Bootstrap & TailwindCSS |
| 📖 **Swagger API Docs** | Interactive API documentation via SpringDoc OpenAPI |
| 🐳 **Docker Support** | Dockerfile for containerized backend deployment |

---

## 🏗️ Tech Stack

### Frontend (`/blog`)

| Technology | Purpose |
|---|---|
| [Next.js 14](https://nextjs.org/) | React framework with App Router |
| [React 18](https://react.dev/) | UI library |
| [Bootstrap 5](https://getbootstrap.com/) + [Reactstrap](https://reactstrap.github.io/) | UI components & grid |
| [TailwindCSS 3](https://tailwindcss.com/) | Utility-first CSS |
| [Axios](https://axios-http.com/) | HTTP client |
| [React Toastify](https://fkhadra.github.io/react-toastify/) | Toast notifications |
| [Font Awesome](https://fontawesome.com/) | Icons |

### Backend (`/blogrestapi`)

| Technology | Purpose |
|---|---|
| [Spring Boot 3.3](https://spring.io/projects/spring-boot) | REST API framework |
| [Spring Security](https://spring.io/projects/spring-security) | Authentication & authorization |
| [Spring Data MongoDB](https://spring.io/projects/spring-data-mongodb) | Database integration |
| [JWT (jjwt 0.11.5)](https://github.com/jwtk/jjwt) | Token-based auth |
| [Cloudinary SDK 2.0](https://cloudinary.com/) | Image storage & delivery |
| [Lombok](https://projectlombok.org/) | Boilerplate reduction |
| [ModelMapper](http://modelmapper.org/) | DTO ↔ Entity mapping |
| [SpringDoc OpenAPI](https://springdoc.org/) | Swagger API docs |
| [Caffeine Cache](https://github.com/ben-manes/caffeine) | In-memory caching |
| **Java 21** | Language runtime |

---

## 📁 Project Structure

```
Blog-Application/
├── blog/                        # Frontend (Next.js)
│   ├── src/app/
│   │   ├── about/               # About page
│   │   ├── addPost/             # Create new post page
│   │   ├── api/                 # Axios instance & base URL config
│   │   ├── components/          # Reusable UI components
│   │   │   ├── AllPost.jsx      # Feed of all posts
│   │   │   ├── Navbar.jsx       # Navigation bar
│   │   │   ├── Post.jsx         # Single post view
│   │   │   ├── UpdatePost.jsx   # Edit post form
│   │   │   ├── UserPost.jsx     # User-specific posts
│   │   │   └── ...
│   │   ├── contexts/            # Auth context (useAuth)
│   │   ├── hooks/               # Custom React hooks
│   │   ├── home/                # Home page
│   │   ├── login/               # Login page
│   │   ├── signup/              # Registration page
│   │   ├── profile/             # User profile page
│   │   ├── updateprofile/       # Edit profile page
│   │   ├── services/            # Auth & Category services
│   │   ├── layout.js            # Root layout
│   │   └── page.jsx             # Entry point
│   ├── package.json
│   └── tailwind.config.js
│
└── blogrestapi/                 # Backend (Spring Boot)
    ├── src/main/java/com/blogrestapi/
    │   ├── Controller/          # REST Controllers
    │   │   ├── AuthController       # Login, signup, logout
    │   │   ├── BlogController       # Blog feed endpoints
    │   │   ├── CategoryController   # Category CRUD
    │   │   ├── CommentController    # Comment operations
    │   │   ├── LikeDisLikeController# Like/dislike actions
    │   │   └── PostController       # Post CRUD
    │   ├── Entity/              # MongoDB documents
    │   │   ├── User, Post, Comment, Category
    │   │   ├── Like, DisLike, Role
    │   │   └── DatabaseSequence
    │   ├── DTO/                 # Data Transfer Objects
    │   ├── Dao/                 # Repository interfaces
    │   ├── Service/             # Service interfaces
    │   ├── ServiceImpl/         # Service implementations
    │   ├── Security/            # JWT & Spring Security config
    │   ├── Config/              # App configuration
    │   ├── Cloudinary/          # Cloudinary integration
    │   ├── Exception/           # Custom exception handlers
    │   ├── ValidationGroup/     # Validation groups
    │   └── DataInitializer.java # Seed data on startup
    ├── src/main/resources/
    │   ├── application.properties       # Common config
    │   ├── application-dev.properties   # Dev profile (localhost)
    │   └── application-prod.properties  # Prod profile
    ├── Dockerfile
    └── pom.xml
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **Java** 21
- **MongoDB** (local instance or Atlas connection string)
- **Maven** 3.9+ (or use the included `mvnw` wrapper)

### 1. Clone the Repository

```bash
git clone https://github.com/rudra100008/Blog-Application.git
cd Blog-Application
```

### 2. Backend Setup

```bash
cd blogrestapi
```

**Create a `.env` file** in the `blogrestapi/` directory:

```env
CLOUDINARY_URL=cloudinary://your_api_key:your_api_secret@your_cloud_name
```

**Run with Maven Wrapper:**

```bash
# Windows
mvnw.cmd spring-boot:run

# Linux / macOS
./mvnw spring-boot:run
```

The API server starts at **http://localhost:9000**.

> **Swagger UI** is available at: [http://localhost:9000/swagger-ui.html](http://localhost:9000/swagger-ui.html)

### 3. Frontend Setup

```bash
cd blog
npm install
npm run dev
```

The frontend starts at **http://localhost:3000**.

> **Note:** Update `src/app/api/base_url.js` to point to your local backend:
> ```js
> const baseUrl = "http://localhost:9000/api";
> ```

---

## ⚙️ Environment Configuration

### Backend Profiles

| Profile | File | Database |
|---|---|---|
| `dev` (default) | `application-dev.properties` | `mongodb://localhost:27017/blog` |
| `prod` | `application-prod.properties` | Uses `MONGODB_URI` env variable |

**Production environment variables:**

| Variable | Description |
|---|---|
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET_KEY` | Secret key for signing JWT tokens |
| `CLOUDINARY_URL` | Cloudinary connection URL |
| `PORT` | Server port (default: `9000`) |
| `ENV` | Active profile: `dev` or `prod` |

---

## 🐳 Docker

Build and run the backend API in a container:

```bash
cd blogrestapi

# Build the image
docker build -t blog-api .

# Run the container
docker run -p 9000:9000 \
  -e MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/blog \
  -e JWT_SECRET_KEY=your-secret-key \
  -e CLOUDINARY_URL=cloudinary://key:secret@cloud \
  -e ENV=prod \
  blog-api
```

---

## 📡 API Endpoints

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Register a new user |
| `POST` | `/api/auth/login` | Login & receive JWT token |
| `POST` | `/api/auth/logout` | Logout |

### Posts

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/posts` | Get all posts |
| `GET` | `/api/posts/{postId}` | Get a single post |
| `POST` | `/api/posts` | Create a new post |
| `PUT` | `/api/posts/{postId}` | Update a post |
| `DELETE` | `/api/posts/{postId}` | Delete a post |

### Categories

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/categories` | Get all categories |
| `POST` | `/api/categories` | Create a category |

### Comments

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/comments` | Add a comment |
| `DELETE` | `/api/comments/{commentId}` | Delete a comment |

### Likes & Dislikes

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/likes` | Like a post |
| `POST` | `/api/dislikes` | Dislike a post |

> 📘 For the full interactive API documentation, visit `/swagger-ui.html` when the backend is running.

---

## 🤝 Contributing

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/my-feature`
3. **Commit** your changes: `git commit -m "Add my feature"`
4. **Push** to the branch: `git push origin feature/my-feature`
5. **Open** a Pull Request

---

## 📄 License

This project is open source and available for personal and educational use.

---

<p align="center">
  Made with ❤️ by <a href="https://github.com/rudra100008">rudra100008</a>
</p>
