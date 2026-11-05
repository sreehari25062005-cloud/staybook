# 🏨 StayBook — Role-Based Hotel Booking Platform

A full-stack MERN app with two completely separate experiences: **Hotel Managers** run their property from a dashboard, **Guests** browse, book, review and get in touch.

**Live URL:** https://staybook-etpmsydc1-sreehari25062005-cloud.vercel.app/

## Test credentials
| Role    | Email                  | Password     |
|---------|------------------------|--------------|
| Manager | manager@staybook.com   | Manager@123  |
| Guest   | guest@staybook.com     | Guest@123    |

(Created by `npm run seed` in `/server`.)

## Roles
**Hotel Manager** – create/edit hotel profile (amenity tags, image gallery, video), manage room types and pricing, confirm/cancel incoming bookings, read reviews and guest inquiries.

**Guest** – browse and search hotels, filter by price and amenities, view gallery and rooms, check availability by date, book, view booking history, cancel upcoming bookings, leave reviews, send inquiries.

Access control is enforced on both sides: API routes use `protect` + `requireRole(...)`, and the React app uses `ProtectedRoute`. A manager cannot open guest booking pages and vice versa.

## Tech stack
React (Vite) · React Router · Node.js + Express · MongoDB Atlas (Mongoose) · JWT auth · Cloudinary (images + video) · Vercel + Render

## Project structure
```
server/   Express API (models, routes, middleware, utils, seed.js)
client/   React app (pages/guest, pages/manager, components, context)
```

## Local setup
1. **MongoDB Atlas** – create a free cluster, a database user, allow your IP, copy the connection string.
2. **Cloudinary** – create a free account. From the dashboard copy *Cloud name*, *API key*, *API secret*.
3. Backend:
   ```bash
   cd server
   cp .env.example .env     # fill in your values
   npm install
   npm run seed             # demo accounts + sample hotel
   npm run dev              # http://localhost:5000
   ```
4. Frontend:
   ```bash
   cd client
   cp .env.example .env     # VITE_API_URL=http://localhost:5000/api
   npm install
   npm run dev              # http://localhost:5173
   ```

## Media storage setup (Cloudinary)
Uploads go through `multer` + `multer-storage-cloudinary` into a `staybook/` folder. Images and videos are detected automatically (`resource_type`), and the returned secure URLs are stored in MongoDB. Free tier video uploads are limited to 100 MB per file.

## Deployment
- **Backend (Render):** root dir `server`, build `npm install`, start `npm start`. Add all variables from `.env.example` in the dashboard. Set `CLIENT_URL` to your Vercel URL.
- **Frontend (Vercel):** root dir `client`, framework Vite, env `VITE_API_URL=https://<your-render-app>.onrender.com/api`. `vercel.json` handles SPA routing.
- In MongoDB Atlas → Network Access, allow `0.0.0.0/0` (Render IPs change).

## API overview
| Area | Endpoints |
|------|-----------|
| Auth | `POST /auth/register`, `POST /auth/login`, `GET /auth/me` |
| Hotels | `GET /hotels` (search, minPrice, maxPrice, amenities), `GET /hotels/:id`, `GET/PUT /hotels/mine` |
| Rooms | `GET /rooms/:id/availability`, `GET /rooms/mine`, `POST/PUT/DELETE /rooms` |
| Bookings | `POST /bookings`, `GET /bookings/mine`, `GET /bookings/hotel`, `PATCH /bookings/:id/status`, `PATCH /bookings/:id/cancel` |
| Reviews | `POST /reviews`, `GET /reviews/mine` |
| Inquiries | `POST /inquiries`, `GET /inquiries/mine` |

## Security notes
Never commit `.env`. Use long random values for `JWT_SECRET` and rotate any credential that has been shared publicly.
