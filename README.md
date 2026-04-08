# PakVoyage

PakVoyage is a full-stack MVP travel planner for Pakistan. It helps users explore destinations, generate itineraries based on trip length, budget, and interests, estimate trip costs, save itineraries, and reserve seats for fixed travel packages.

## Stack

- Frontend: Next.js 14, TypeScript, Tailwind CSS
- Backend: NestJS, TypeScript
- Database: PostgreSQL
- ORM: Prisma

## Project Structure

```text
PakVoyage/
|- backend/   # NestJS API + Prisma
|- frontend/  # Next.js App Router UI
|- README.md
\- .gitignore
```

## Features

- Destination listing and destination detail pages
- Itinerary generation using:
  - trip days
  - budget
  - interests: `mountains`, `culture`, `food`
- Cost breakdown with hotel, transport, and food estimates
- Save itinerary to PostgreSQL
- Register for a generated custom itinerary directly from results
- Fixed travel packages with dates, seats, and per-seat pricing
- Seat reservation flow for packages
- Route-level loading states
- Backend validation and structured exception handling
- Backend file logging to a dedicated `backend/logs` directory

## Current Routes

Frontend:

- `/` - homepage
- `/planner` - itinerary planner form
- `/results` - generated itinerary view
- `/destination/[id]` - destination detail page
- `/packages` - package listing page
- `/packages/[id]` - package detail and seat registration page

Backend API base:

- `http://localhost:3001/api`

API endpoints:

- `GET /api/destinations`
- `GET /api/destinations/:id`
- `GET /api/packages`
- `GET /api/packages/:id`
- `POST /api/bookings`
- `GET /api/bookings/:id`
- `POST /api/itinerary/generate`
- `POST /api/itinerary/save`
- `POST /api/itinerary/register-custom`
- `GET /api/itinerary/:id`

## Database Models

Defined in [backend/prisma/schema.prisma](d:/Work/PakVoyage/backend/prisma/schema.prisma):

- `User`
- `Destination`
- `Itinerary`
- `ItineraryDay`
- `CustomTripRegistration`
- `TourPackage`
- `Booking`

Saved itineraries are stored in:

- `itineraries`
- `itinerary_days`
- `custom_trip_registrations` for custom itinerary registration leads

Package reservations are stored in:

- `packages`
- `bookings`

## Environment Variables

Backend uses [backend/.env.example](d:/Work/PakVoyage/backend/.env.example):

```env
DATABASE_URL="postgresql://user:password@localhost:5432/pakvoyage_db?schema=public"
PORT=3001
```

Notes:

- Update `DATABASE_URL` to match your PostgreSQL credentials.
- If your password contains characters like `@`, `#`, or `:`, URL-encode them inside `DATABASE_URL`.
- The backend runs on port `3001` by default.

## Getting Started

### 1. Install dependencies

Backend:

```powershell
cd backend
npm install
```

Frontend:

```powershell
cd frontend
npm install
```

### 2. Configure the backend environment

From [backend](d:/Work/PakVoyage/backend):

```powershell
Copy-Item .env.example .env
```

Then edit `.env` and set a valid PostgreSQL connection string.

### 3. Generate Prisma Client

From [backend](d:/Work/PakVoyage/backend):

```powershell
npm run prisma:generate
```

### 4. Create the database schema

From [backend](d:/Work/PakVoyage/backend):

```powershell
npx prisma db push
```

This project currently uses `db push` for the MVP schema flow.

### 5. Seed sample data

From [backend](d:/Work/PakVoyage/backend):

```powershell
npm run db:seed
```

The seed inserts:

- sample destinations such as Hunza, Skardu, Lahore, Islamabad, Swat Valley, and Karachi
- sample travel packages that can be booked from the website

## Running the Project

### Start the backend

From [backend](d:/Work/PakVoyage/backend):

```powershell
npm start
```

Useful backend scripts:

- `npm start` - run the backend
- `npm run start:dev` - watch mode
- `npm run build` - compile TypeScript
- `npm run start:prod` - run compiled build
- `npm run prisma:generate` - generate Prisma client
- `npm run db:seed` - seed destinations and packages
- `npm run lint` - type-check the backend

### Start the frontend

From [frontend](d:/Work/PakVoyage/frontend):

```powershell
npm run dev
```

Useful frontend scripts:

- `npm run dev` - start Next.js dev server
- `npm run build` - production build
- `npm start` - run built frontend
- `npm run lint` - lint frontend

## Default Local URLs

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:3001/api`

## How Itinerary Saving Works

When a user generates a plan on the frontend and clicks save:

1. The frontend sends a request to `POST /api/itinerary/save`
2. The backend creates an `itineraries` record
3. Related `itinerary_days` rows are created for each day in the trip
4. The saved itinerary can later be fetched with `GET /api/itinerary/:id`

## How Custom Itinerary Registration Works

Travelers can register for a generated itinerary from the results page:

1. Generate a custom itinerary in `/planner`
2. Open `/results`
3. Fill traveler details in the "Register this custom itinerary" form
4. Submit the registration

When registration is created:

1. The frontend sends a request to `POST /api/itinerary/register-custom`
2. The backend validates traveler and itinerary payload fields
3. The backend stores a record in `custom_trip_registrations`
4. A response returns registration ID and status (`PENDING` by default)

Itinerary implementation references:

- [backend/src/itinerary/itinerary.controller.ts](d:/Work/PakVoyage/backend/src/itinerary/itinerary.controller.ts)
- [backend/src/itinerary/itinerary.service.ts](d:/Work/PakVoyage/backend/src/itinerary/itinerary.service.ts)
- [backend/src/itinerary/dto/register-custom-trip.dto.ts](d:/Work/PakVoyage/backend/src/itinerary/dto/register-custom-trip.dto.ts)
- [frontend/components/results-view.tsx](d:/Work/PakVoyage/frontend/components/results-view.tsx)

## How Package Booking Works

Travelers can now reserve seats through the website:

1. Open `/packages`
2. Choose a package
3. Open the package detail page
4. Fill the seat registration form
5. Submit the reservation

When a booking is created:

1. The frontend sends a request to `POST /api/bookings`
2. The backend validates the request
3. The backend checks seat availability
4. A `bookings` record is created
5. `available_seats` on the selected package is reduced
6. A booking response with booking ID and total amount is returned

Booking implementation references:

- [backend/src/packages/packages.controller.ts](d:/Work/PakVoyage/backend/src/packages/packages.controller.ts)
- [backend/src/packages/packages.service.ts](d:/Work/PakVoyage/backend/src/packages/packages.service.ts)
- [backend/src/bookings/bookings.controller.ts](d:/Work/PakVoyage/backend/src/bookings/bookings.controller.ts)
- [backend/src/bookings/bookings.service.ts](d:/Work/PakVoyage/backend/src/bookings/bookings.service.ts)
- [frontend/app/packages/page.tsx](d:/Work/PakVoyage/frontend/app/packages/page.tsx)
- [frontend/app/packages/[id]/page.tsx](d:/Work/PakVoyage/frontend/app/packages/[id]/page.tsx)
- [frontend/components/booking-form.tsx](d:/Work/PakVoyage/frontend/components/booking-form.tsx)

## Logging

Backend logs are written to:

- [backend/logs](d:/Work/PakVoyage/backend/logs)

This includes daily application and error log files generated by the custom backend logger.

## Error Handling

The backend includes:

- DTO validation with Nest validation pipes
- structured exception responses
- Prisma-aware exception handling
- centralized logging for runtime errors

The frontend includes:

- route-level loading states
- user-facing API error parsing for itinerary and booking actions

## Verification

The frontend and backend have both been built successfully during implementation:

- frontend: `npm.cmd run build`
- backend: `npm.cmd run build`

## Known Notes

- This is an MVP, so authentication is not fully implemented yet.
- `user_id` on itineraries is optional.
- `user_id` on bookings is also optional.
- Saved itineraries exist in the database even without a linked user.
- Package bookings are created with `PENDING` status by default.
- Custom itinerary registrations are also created with `PENDING` status by default.
- If Next.js shows stale chunk or `_document` module errors, delete [frontend/.next](d:/Work/PakVoyage/frontend/.next) and restart the frontend dev server.
- If the frontend still behaves as if old code is running, stop all `node.exe` processes, then restart backend and frontend.

## License

See [LICENSE](d:/Work/PakVoyage/LICENSE).
