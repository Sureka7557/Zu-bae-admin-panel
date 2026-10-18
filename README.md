# Zu-Bae Store – Admin Panel

A responsive e-commerce admin dashboard built with React, TypeScript, and Vite to manage products, orders, customers, and reviews. Features a premium burgundy-themed UI with sales analytics and efficient store management.

## ✨ Features

- 📊 **Dashboard** – View sales analytics, revenue, orders, and recent activity.
- 🛍️ **Product Management** – Manage products, categories, and stock availability.
- 📦 **Order Management** – Track orders and update order statuses.
- 👥 **Customer Management** – View and manage customer information.
- ⭐ **Customer Reviews** – View, search, and filter customer feedback.
- 🔐 **Authentication** – Secure admin access using Clerk.
- 🎨 **Responsive UI** – Modern dashboard with a premium burgundy color palette.

## 🛠️ Tech Stack

- React
- TypeScript
- Vite
- Clerk Authentication
- REST API
- CSS
- Git and GitHub

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
```

### 2. Navigate to the project directory

```bash
cd admin
```

### 3. Install dependencies

```bash
npm install
```

### 4. Configure environment variables

Create a `.env` file in the admin project root and configure the required values:

```env
VITE_API_URL=YOUR_BACKEND_API_URL
```

Add any other environment variables required by your project. Never expose secret keys in frontend environment variables.

### 5. Start the development server

```bash
npm run dev
```

Open the local URL displayed in your terminal.

## 🏗️ Build for Production

```bash
npm run build
```

To preview the production build locally:

```bash
npm run preview
```

## 🔗 Backend

The admin panel communicates with the Zu-Bae Store backend through REST API endpoints for product, order, customer, review, and dashboard data.

Configure `VITE_API_URL` with your deployed backend URL.

## 🔒 Security

- Keep secret keys and credentials out of the frontend.
- Store sensitive environment variables securely on the backend.
- Ensure admin API endpoints enforce authentication and authorization.
- Add `.env` files to `.gitignore`.

## 👩‍💻 Author

**Sureka K.**

## 📄 License

This project is developed for the Zu-Bae Store e-commerce platform.
