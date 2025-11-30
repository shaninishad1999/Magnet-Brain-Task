🚀 Task Management System (MERN)

A Task Management System built with MERN (MongoDB, Express, React, Node) with JWT auth, role-based access, email on user creation, file uploads, and task analytics.

🔧 Features

Admin & User authentication (JWT)

Admin can create users (auto password generation + email)

Task CRUD with assignee, priority, status, due date, description

Pagination, filters, search for tasks

Task counters per user (auto increment/decrement)

File upload for profile images (multer)

Dashboard APIs (metrics, recent tasks)

🧰 Tech stack

Frontend: React, Redux Toolkit, Axios, Tailwind (or CSS)
Backend: Node.js, Express, MongoDB, Mongoose, JWT, bcryptjs, multer, nodemailer

cd backend
npm install
npm run dev   # or `node server.js` / `npm start` depending on package.json

cd frontend
npm install
npm run dev

/backend
  ├── controllers/
  ├── models/
  ├── routes/
  ├── middleware/
  ├── utils/
  ├── config/
  └── index.js
/frontend
  ├── src/
  ├── components/
  ├── pages/


  PORT=5000
MONGO_URL=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
EMAIL_HOST=your_email_address_or_from_field
EMAIL_USER=your_email_user  # e.g. for nodemailer auth.user
EMAIL_PASS=your_email_password_or_app_password


direct create admin
/** 
* Paste one or more documents here
*/
{
  "_id": {
    "$oid": "692c8b9e7758f5548b50c8a3"
  },
  "name": "Shanideval",
  "email": "admin@gmail.com",
  "password": "<PASTE_HASH_HERE>",
  "adminProfile": "https://thumbs.dreamstime.com/b/man-avatar-icon-vector-flat-illustration-any-web-design-102144234.jpg"


}



