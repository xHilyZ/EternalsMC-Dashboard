# EternalsMC Dashboard

A clean, luxury‑themed dashboard built for **Eternals MC | Zephyr**.  
It provides simple, fast tools for managing members, funds, inventory, and daily/weekly club activity.  
Frontend is pure HTML/CSS/JS, with Supabase + Vercel serverless functions powering the backend.

## Features
- Role‑based access (Admin / Member)
- Clean & Dirty funds tracking + full transaction logs
- Member list with add/edit/remove (Admin)
- Armory system for weapons, ammo, armor, blueprints
- Daily checklist (auto‑resets)
- Weekly quota tracking
- Price list for in‑game items
- Dashboard overview with key stats

## Tech Stack
- Frontend: HTML, CSS, JavaScript  
- Backend: Node.js (Vercel Functions)  
- Database: Supabase  
- Hosting: Vercel  

## Setup
1. Create a Supabase project and add your tables (funds, members, transactions).  
2. Deploy to Vercel.  
3. Add environment variables:  
   - `SUPABASE_URL`  
   - `SUPABASE_SERVICE_ROLE_KEY`  

## Local Dev
```bash
npm install -g vercel
vercel dev


![Static Badge](https://img.shields.io/badge/Status-Active-3b82f6)
![Static Badge](https://img.shields.io/badge/Tech-HTML%20%7C%20CSS%20%7C%20JS-0ea5e9)
![Static Badge](https://img.shields.io/badge/CFX.re-API-22c55e)
![Static Badge](https://img.shields.io/badge/License-MIT-6366f1)
