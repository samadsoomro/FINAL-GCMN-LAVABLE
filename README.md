# CMS Library Management System

## Project Overview
A full-stack Library Management System built with React + Express + Supabase. Features include book management, library card applications, study notes, rare books, blog, and a complete admin dashboard.

## Quick Start
1. **Install Dependencies**: `npm install`
2. **Configure Environment**: Copy `.env.example` → `.env` and fill in your values
3. **Start Development Server**: `npm start`
4. **Build for Production**: `npm run build`

## Project Structure
- `src/` — React frontend (Vite + TypeScript)
- `server/` — Express backend
- `api/` — Vercel serverless entry point
- `supabase/migrations/` — Database migration SQL files

## Deployment
Configured for **Vercel** deployment. See `.env.example` for required environment variables.
Set all env vars in Vercel Dashboard → Project Settings → Environment Variables before deploying.

## Tech Stack
- **Frontend**: React 18, Vite, Tailwind CSS, shadcn/ui
- **Backend**: Express.js (Node 20)
- **Database**: Supabase (PostgreSQL)
- **Auth**: Session-based (express-session + connect-pg-simple)
- **Deployment**: Vercel (serverless)
