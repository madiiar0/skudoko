[![Skudoko banner](frontend/public/banner.png)](https://skudoko.vercel.app/)

# Skudoko

**Skudoko is a modern Sudoku platform for people who want more than a blank grid.**

It combines clean puzzle play, progress tracking, daily competition, learning content, and AI Coach into one full-stack product. The goal is simple: help players think more clearly, solve with less guessing, and come back because every session feels premium.

Skudoko is built for the moment when Sudoku stops being just a time-killer and becomes a small daily thinking ritual.

**Live app:** [skudoko.vercel.app](https://skudoko.vercel.app/)  
**Backend API:** [skudoko-2mkd.vercel.app](https://skudoko-2mkd.vercel.app/)

---

## What Was Built and Product Highlights

Skudoko is a full-stack Sudoku web app with a polished product layer around the game itself.

At its core, it supports classic Sudoku gameplay:
- difficulty-based puzzle generation
- accurate solution checking
- keyboard and on-screen number input
- undo history
- candidate notes
- tips
- mistake tracking
- persistent game sessions.

Around that core, it adds the pieces that make the app feel like a real product:

- Account-based authentication and protected routes.
- Local-first game saving with backend sync.
- AI Coach that understands the current board, notes, tips, mistakes, and progress.
- Pro simulation with Pro badge, no ad placeholder, and unlimited tips.
- Game History with resume, rename, delete, completed-game view-only mode.
- Daily Challenge with timer, pause, penalties, one official attempt, and leaderboard.
- Blogs/learning section with free and Pro-gated Sudoku articles.
- Dark and light themes persisted locally.
- Vercel-ready frontend and backend deployment configuration.

---

## Who It Is For

Skudoko is designed for several kinds of Sudoku players:

| Player type | What Skudoko gives them |
|---|---|
| Beginners | A clean board, notes, tips, mistakes, and learning articles that make Sudoku less intimidating. |
| Casual players | Fast puzzle starts, saved progress, and a Daily Challenge reason to return. |
| Competitive solvers | Timer-based Daily Challenge results and leaderboard rankings. |
| Learners | Candidate mode, solution-backed feedback, and an AI Coach for board-aware guidance. |
| Product-minded users | A modern Sudoku experience with accounts, Pro status, history, persistence, and polish. |

---

## Why It Is Valuable

Most Sudoku apps stop at the board. Skudoko treats Sudoku like a product experience:

- It helps users avoid random guessing by giving them notes, mistake feedback, tips, and educational content.
- It keeps progress safe across refreshes and devices through local-first saving and backend sync.
- It adds motivation through Daily Challenge and leaderboard.
- It creates room for future monetization through a Pro plan, AI Coach, premium articles, and ad removal.

The result is not just a puzzle clone. It is a small learning-and-competition platform wrapped around Sudoku.

---

## Visual Tour

|  |  |
|---|---|
| ![Landing page](frontend/src/assets/landing-page.png) | ![Play page](frontend/src/assets/play-page.png) |
| ![Leaderboard](frontend/src/assets/leader-board.png) | ![AI Coach](frontend/src/assets/ai-coach.png) |
| ![Blogs page](frontend/src/assets/blogs.png) | ![Blog detail](frontend/src/assets/blogs-page.png) |

---

## Feature Snapshot

### Gameplay

- Difficulty levels: Easy, Medium, Hard, Extreme.
- Puzzle generation powered by `sudoku-gen`.
- Stored puzzle, current board, locked cells, and solution per session.
- Keyboard input and on-screen number pad share the same input logic.
- Candidate/Notes mode with a 3x3 mini-grid inside cells.
- Tip system with revealed cells, locked tip cells, tip badge, and Pro unlimited tips.
- Mistake count and tips-used count.
- Check Answer flow with toast feedback, completion state, and confetti.
- Completed games open in view-only mode.

### Persistence

- Local-first autosave for active games.
- Backend session storage per authenticated user.
- Resume unfinished sessions from History.
- Rename and delete saved sessions.
- Preserve undo history, candidates, tips, mistakes, difficulty, and completion state.
- Offline-safe pending sync behavior.

### Daily Challenge

- Static backend-owned medium puzzle for the current challenge.
- One official attempt per user per challenge.
- Timer with pause/resume.
- Pure solving time plus penalties:
  - `30 seconds` per mistake.
  - `60 seconds` per tip used.
- Completed attempts become view-only.
- Leaderboard ranks by lowest final time.

### Pro Layer

- Simulated Pro upgrade/cancel flow.
- `isPro` field on the user account.
- Pro badge on the profile button.
- Pro users do not see the ad placeholder.
- Pro users get unlimited tips.
- AI Coach access is Pro-gated on both frontend and backend.

### Learning

- Static Blogs section.
- Free articles for beginners and routine building.
- Pro-only advanced strategy article.
- Locked state and Upgrade CTA for non-Pro users.

---

## Main Technologies Used

![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-5FA04E?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)
![OpenAI](https://img.shields.io/badge/OpenAI-412991?style=for-the-badge&logo=openai&logoColor=white)

---

## Project Structure

```txt
sudoko/
  backend/
    controllers/       API controllers
    data/              Embedded Daily Challenge puzzle
    db/                MongoDB connection
    middleware/        Auth middleware
    models/            User, GameSession, DailyChallengeAttempt
    routes/            Auth, sessions, daily challenge, AI Coach
    src/server.js      Express app / Vercel export
  frontend/
    public/            Static public assets
    src/
      api/             API client helpers
      components/      Shared UI/game components
      context/         Auth and theme providers
      data/            Static blog content
      pages/           App routes
      services/        Sync services
      utils/           Sudoku, storage, tips, candidates
```

---

## Installation

This section is intentionally short because Skudoko is primarily a product demo, not a setup exercise.

### 1. Clone

```bash
git clone https://github.com/madiiar0/skudoko.git
cd skudoko
```

### 2. Install dependencies

```bash
cd backend
npm install

cd ../frontend
npm install
```

### 3. Configure environment

Create environment files from the examples:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

### 4. Run locally

Backend:

```bash
cd backend
npm run dev
```

Frontend:

```bash
cd frontend
npm run dev
```

---

## Environment Variables

### Backend

```env
PORT=5173
CLIENT_URL=http://localhost:1234,https://skudoko.vercel.app
MONGO_URI=mongodb+srv://user:password@cluster.mongodb.net/skudoko
JWT_SECRET=replace-with-a-long-random-secret
NODE_ENV=development
OPENAI_API_KEY=replace-with-your-openai-api-key
OPENAI_MODEL=gpt-4.1-mini
```

### Frontend

```env
VITE_API_BASE_URL=/api
```

For production on Vercel, the frontend uses `frontend/vercel.json` to proxy `/api/*` to the deployed backend.

---

## Deployment Notes

The project is prepared for two Vercel deployments:

| App | Root directory | URL |
|---|---|---|
| Frontend | `frontend` | `https://skudoko.vercel.app/` |
| Backend | `backend` | `https://skudoko-2mkd.vercel.app/` |

Backend production requirements:

- Use MongoDB Atlas or another hosted MongoDB URL. Localhost MongoDB will not work on Vercel.
- Set `NODE_ENV=production` so cookies are secure.
- Set `CLIENT_URL=https://skudoko.vercel.app`.
- Set `JWT_SECRET`.
- Set `OPENAI_API_KEY` if AI Coach should respond.

---

## Creative Direction

Skudoko was built around one product idea:

> Sudoku should feel less like filling boxes and more like training a sharper way to think.

The current version already supports play, learning, persistence, competition, Pro identity, and AI guidance. Future growth could turn this into a deeper Sudoku learning platform with real subscriptions, richer courses, streaks, analytics, personalized coaching, and rotating daily puzzles.

The board is the center, but the product is the habit around it.
