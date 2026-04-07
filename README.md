# PakVoyage

An all-in-one travel planner for Pakistan.

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: NestJS, TypeScript
- **Database**: PostgreSQL with Prisma ORM

## Setup

### Backend

1. Navigate to backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Update DATABASE_URL with your PostgreSQL connection string

4. Set up database:
   ```bash
   npx prisma migrate dev
   npx prisma db seed
   ```

5. Start the backend:
   ```bash
   npm run start:dev
   ```

### Frontend

1. Navigate to frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the frontend:
   ```bash
   npm run dev
   ```

## API Endpoints

- `GET /destinations` - List all destinations
- `GET /destinations/:id` - Get destination by ID
- `POST /itinerary/generate` - Generate itinerary
- `POST /itinerary/save` - Save itinerary
- `GET /itinerary/:id` - Get saved itinerary

## Features

- Explore destinations in Pakistan
- Generate personalized itineraries based on days, budget, and interests
- Estimate trip costs
- Save itineraries for later reference
