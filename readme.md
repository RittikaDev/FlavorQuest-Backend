# FlavorQuest - Backend

A RESTful API backend for the **FlavorQuest - Street Food Finder & Review Website**, where users can post, discover, and review street food spots. Premium users get access to exclusive food posts through subscription, and admins moderate all content.

- [Live Link](https://flavor-quest-backend.vercel.app/)

## Features

- User authentication with JWT
- Role-based access (Normal, Premium, Admin)
- Post street food discoveries (title, description, location, image, price range)
- Admin approval for posts with optional Premium marking
- Premium content accessible via SSLCommerz/ShurjoPay payment integration
- Voting, commenting, and rating system
- Search and filtering (by category, price, popularity)
- Admin dashboard APIs for managing posts, users, and categories

---

## Tech Stack

- **Backend Framework:** Node.js, Express.js
- **Database ORM:** Prisma
- **Database:** PostgreSQL
- **Authentication:** JWT + Bcrypt
- **Payment Gateway:** ShurjoPay

---

## 🛠 Installation Guide

### 1. Clone the Repository

```bash
git clone https://github.com/RittikaDev/FlavorQuest-Backend.git
cd FlavorQuest-Backend

- npm install

# Server
- PORT=3000

# Cloudinary
- CLOUDYNARY_CLOUDE_NAME=your_cloud_name
- CLOUDYNARY_API_KEY=your_cloud_api_key
- CLOUDYNARY_SECRET_KEY=your_cloud_api_secret

# Email Sender Configuration (for password reset or notifications)
- EMAIL=your_email_address@gmail.com
- APP_PASS=your_email_app_password

# JWT Configuration
- JWT_ACCESS_SECRET=your_jwt_secret
- JWT_ACCESS_EXPIRES_IN=1d
- JWT_REFRESH_SECRET=your_refresh_secret
- JWT_REFRESH_EXPIRES_IN=7d

# Password Reset Token
- RESET_PASS_TOKEN=your_reset_pass_secret
- RESET_PASS_TOKEN_EXPIRES_IN=10m
- RESET_PASS_LINK=http://localhost:3000/reset-password

# ShurjoPay (SP) Payment Gateway
- SP_ENDPOINT=https://sandbox.shurjopayment.com
- SP_USERNAME=your_sp_username
- SP_PASSWORD=your_sp_password
- SP_PREFIX=your_order_prefix
- SP_RETURN_URL=http://localhost:3000/payment-success

## prisma setup

- npx prisma generate
- npx prisma migrate dev --name init

## start server
- npm run dev



```
