<div align="center">
  <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/javascript/javascript-original.svg" alt="JavaScript" width="40" height="40"/>
  <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/nodejs/nodejs-original.svg" alt="Node.js" width="40" height="40"/>
  <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/express/express-original.svg" alt="Express" width="40" height="40"/>
  <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/tailwindcss/tailwindcss-plain.svg" alt="Tailwind CSS" width="40" height="40"/>

  <h1>📚 UniLab — Resource BCA</h1>
  
  <p>
    <strong>A high-performance, responsive portal for BCA students to access Previous Year Question Papers (PYQ), Subject Notes, and External Links.</strong>
  </p>

</div>

---

## ✨ Features

- **🎓 Public Student Portal** — Landing page, PYQ browser, Notes browser, and External Notes with live search and advanced filters (Subject / Semester / Year). 
- **🚀 No Login Required** — Students can browse, view, and download study materials instantly without creating an account.
- **🔐 Secure Admin Panel** — A fully protected dashboard for administrators to upload papers, manage notes, and track platform statistics.
- **📱 Fully Responsive** — Mobile-first design that looks beautiful and functions perfectly on phones, tablets, and desktops.
- **📧 Background Email Support** — Built-in contact form powered by Nodemailer that silently sends user queries directly to the admin's inbox.
- **🛡️ Enterprise Security** — Implements httpOnly JWT session cookies, rate-limiting, Helmet security headers, and strict server-side upload validation (PDF only, 25MB max).

---

## 🛠️ Tech Stack

- **Frontend:** HTML5, Vanilla JavaScript, Tailwind CSS v4
- **Backend:** Node.js, Express.js
- **Database & Storage:** Supabase (PostgreSQL for data, Storage Buckets for PDFs)
- **Authentication:** JSON Web Tokens (JWT)
- **Email:** Nodemailer

---

## 🧱 Project Structure

```text
Resource-BCA/
├── Client/                        # FRONTEND
│   ├── Public/                    # Public site (served at /)
│   │   ├── html/                  # Home, PYQ, Notes, ExternalNotes, About, etc.
│   │   ├── script/                # api.js, components.js, browser.js, support.js
│   │   └── style/app.css          # Compiled Tailwind CSS
│   ├── Admin/                     # Admin panel (served at /admin)
│   │   ├── html/                  # Login, Dashboard, ManageNotes, etc.
│   │   └── script/                # admin.js, manage.js
│   └── styles/input.css           # Tailwind v4 Source CSS
│
├── Server/                        # BACKEND
│   ├── server.js                  # Express Application Entry Point
│   └── src/
│       ├── config/env.js          # Environment Loader
│       ├── config/supabase.js     # Supabase Client Configuration
│       ├── middleware/auth.js     # JWT Session & Security Middleware
│       └── routes/                # Express API Routes (Auth, Papers, Notes, External, Support, Stats)
│
├── Database/                      # DATABASE SCHEMAS
│   └── schema.sql                 # SQL tables for Supabase
│
├── vercel.json                    # Vercel Serverless Configuration
└── package.json                   # Dependencies & Build Scripts
```

---

## 🚀 Local Setup & Installation

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Supabase
1. Create a free project at [Supabase](https://supabase.com).
2. Open **SQL Editor** → **New Query**, paste the contents of `Database/schema.sql`, and execute it to create the necessary tables.
3. Open **Storage** → **New Bucket**:
   - Name: `resources`
   - **Public bucket: ON** ✅ *(Required for downloads to work)*
4. Go to **Project Settings** → **API** to retrieve your `URL`, `anon` key, and `service_role` key.

### 3. Environment Variables
Create a `.env` file inside the `Server/` directory and configure it:

```env
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_BUCKET=resources

# Admin Credentials
ADMIN_USERNAME=admin
ADMIN_PASSWORD_HASH=your_bcrypt_hashed_password

# Security
JWT_SECRET=a_very_long_random_string_for_security

# Nodemailer (Gmail Support Form)
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_16_character_google_app_password
```

### 4. Build & Run
```bash
# Build the Tailwind CSS framework
npm run build

# Start the application locally
npm start
```

Access the public portal at `http://localhost:3000` and the Admin dashboard at `http://localhost:3000/admin/login`.

---

## 🌐 Deployment (Vercel)

This application is **100% configured for Vercel** as a Serverless deployment.

1. Push this repository to GitHub.
2. Sign in to [Vercel](https://vercel.com) and click **Add New Project**.
3. Import your GitHub repository.
4. Open the **Environment Variables** tab and paste all the variables from your local `.env` file.
5. Click **Deploy**.

Vercel will automatically read the `vercel.json` file, bundle the Express server into a serverless function, build the CSS, and serve the static files across its global CDN.

---

<div align="center">
  <p>Built with 💜 for BCA Students.</p>
</div>
