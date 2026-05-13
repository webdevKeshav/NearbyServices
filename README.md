# NearbyServices 🔧

> **Book trusted local services in minutes.**  
> Full-stack MERN application with User & Provider roles, real-time booking, image uploads, JWT auth, and geolocation-based search.

---

## 📁 Project Structure

```
NearbyServices/
├── client/                        # React + Vite frontend
│   ├── public/
│   │   └── favicon.svg
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   │   └── ProtectedRoute.jsx   # Role-based route guard
│   │   │   └── layout/
│   │   │       └── Layout.jsx           # Navbar + Footer wrapper
│   │   ├── context/
│   │   │   └── authStore.js             # Zustand auth state
│   │   ├── pages/
│   │   │   ├── Auth/
│   │   │   │   ├── LoginPage.jsx
│   │   │   │   └── RegisterPage.jsx
│   │   │   ├── Dashboard/
│   │   │   │   └── UserDashboard.jsx    # Customer bookings & profile
│   │   │   ├── Home/
│   │   │   │   ├── HomePage.jsx         # Service listing + search
│   │   │   │   ├── ServiceCard.jsx      # Reusable card component
│   │   │   │   ├── ServiceDetailPage.jsx# Full service + reviews
│   │   │   │   └── BookingModal.jsx     # 2-step booking flow
│   │   │   └── Provider/
│   │   │       ├── ProviderDashboard.jsx# Bookings / services / reviews
│   │   │       └── AddServicePage.jsx   # Create a new service
│   │   ├── services/
│   │   │   └── api.js                   # Axios instance + all API calls
│   │   ├── App.jsx                      # Routes
│   │   ├── main.jsx                     # React entry point
│   │   └── index.css                    # Tailwind + global styles
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── postcss.config.js
│
└── server/                        # Node + Express backend
    ├── config/
    │   ├── db.js                        # MongoDB connection
    │   └── cloudinary.js               # Image upload config
    ├── controllers/
    │   ├── authController.js
    │   ├── serviceController.js
    │   ├── bookingController.js
    │   ├── providerController.js
    │   └── reviewController.js
    ├── middleware/
    │   ├── auth.js                      # JWT protect + role check
    │   └── errorHandler.js             # Central error handler
    ├── models/
    │   ├── User.js
    │   ├── ServiceProvider.js
    │   ├── Service.js
    │   ├── Booking.js
    │   └── Review.js
    ├── routes/
    │   ├── authRoutes.js
    │   ├── serviceRoutes.js
    │   ├── bookingRoutes.js
    │   ├── providerRoutes.js
    │   └── reviewRoutes.js
    ├── utils/
    │   ├── sendEmail.js                 # Nodemailer email helper
    │   ├── seedData.js                  # DB seed script
    │   └── apiResponse.js              # Response helpers
    ├── server.js                        # Express app entry point
    ├── .env                             # Environment variables (edit this!)
    └── package.json
```

---

## ⚡ Quick Start

### 1. Prerequisites

| Tool | Version |
|------|---------|
| Node.js | v18+ |
| npm | v9+ |
| MongoDB | Local or Atlas |

---

### 2. Clone & Install

```bash
# Clone
git clone https://github.com/yourname/servenear.git
cd servenear

# Install all dependencies (root + server + client)
npm run install-all
```

---

### 3. Configure Environment

Edit `server/.env`:

```env
PORT=5000
NODE_ENV=development

# MongoDB — use local or Atlas URI
MONGO_URI=mongodb://localhost:27017/servenear

# JWT — change these in production!
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=30d
JWT_REFRESH_SECRET=your_refresh_secret_here
JWT_REFRESH_EXPIRE=90d

# Cloudinary — sign up free at cloudinary.com
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email — Gmail with App Password recommended
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Frontend URL
CLIENT_URL=http://localhost:5173
```

> 💡 **Tip:** For Gmail, enable 2FA and generate an **App Password** at  
> `Google Account → Security → App Passwords`

---

### 4. Seed the Database (optional but recommended)

Populates 6 providers and 10 services instantly:

```bash
cd server
node utils/seedData.js
```

**Test accounts created:**

| Role     | Email              | Password  |
|----------|--------------------|-----------|
| Customer | priya@test.com     | test1234  |
| Customer | amit@test.com      | test1234  |
| Provider | ramesh@test.com    | test1234  |
| Provider | suresh@test.com    | test1234  |
| Provider | clean@test.com     | test1234  |
| Provider | cooltech@test.com  | test1234  |

---

### 5. Run the App

```bash
# From root — runs both server and client together
npm run dev
```

| Service  | URL |
|----------|-----|
| Frontend | http://localhost:5173 |
| Backend  | http://localhost:5000 |
| API docs | http://localhost:5000/api/health |

---

## 🌐 API Reference

### Auth
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/auth/register` | Public | Register new user/provider |
| POST | `/api/auth/login` | Public | Login, returns JWT |
| GET  | `/api/auth/me` | Private | Get current user |
| PUT  | `/api/auth/update-profile` | Private | Update name, phone, avatar |
| PUT  | `/api/auth/change-password` | Private | Change password |
| POST | `/api/auth/refresh` | Public | Refresh access token |

### Services
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET    | `/api/services` | Public | List all (with filters) |
| GET    | `/api/services/:id` | Public | Single service detail |
| GET    | `/api/services/my-services` | Provider | My services |
| POST   | `/api/services` | Provider | Create service |
| PUT    | `/api/services/:id` | Provider | Update service |
| DELETE | `/api/services/:id` | Provider | Delete service |

**Query params for GET /api/services:**  
`category`, `search`, `minPrice`, `maxPrice`, `rating`, `popular`, `verified`, `sortBy`, `page`, `limit`, `lat`, `lng`, `radius`

### Bookings
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/bookings` | User | Create booking |
| GET  | `/api/bookings/my-bookings` | User | My bookings |
| GET  | `/api/bookings/provider-bookings` | Provider | Incoming bookings |
| GET  | `/api/bookings/provider-stats` | Provider | Earnings & stats |
| GET  | `/api/bookings/slots?providerId=&date=` | Public | Booked time slots |
| GET  | `/api/bookings/:id` | Private | Single booking |
| PUT  | `/api/bookings/:id/status` | Provider | Accept/complete/cancel |
| PUT  | `/api/bookings/:id/cancel` | User | Cancel own booking |

### Providers
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/providers` | Public | List all providers |
| GET | `/api/providers/nearby?lat=&lng=&radius=` | Public | Nearby providers |
| GET | `/api/providers/:id` | Public | Provider profile |
| GET | `/api/providers/my-profile` | Provider | My profile |
| PUT | `/api/providers/my-profile` | Provider | Update profile |
| PUT | `/api/providers/availability` | Provider | Toggle availability |

### Reviews
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST   | `/api/reviews` | User | Create review (completed booking only) |
| GET    | `/api/reviews/service/:id` | Public | Reviews for a service |
| GET    | `/api/reviews/provider/:id` | Public | Reviews for a provider |
| PUT    | `/api/reviews/:id/reply` | Provider | Reply to review |
| DELETE | `/api/reviews/:id` | User/Admin | Delete review |

---

## 🚀 Deployment

### Backend → Render / Railway / EC2

1. Push to GitHub
2. Set all `.env` variables in the platform dashboard
3. Build command: `npm install`
4. Start command: `node server.js`

### Frontend → Vercel / Netlify

1. Set root to `client/`
2. Build command: `npm run build`
3. Output directory: `dist`
4. Add env var: `VITE_API_URL=https://your-backend.com/api`

---

## 🛠 Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18, Vite, Tailwind CSS |
| State | Zustand, TanStack Query |
| Routing | React Router v6 |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Auth | JWT (access + refresh tokens) |
| Images | Cloudinary |
| Email | Nodemailer |
| Security | Helmet, Rate-limit, Mongo-sanitize |

---

## 📄 License

MIT © 2025 ServeNear
