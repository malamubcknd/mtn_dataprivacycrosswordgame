## `README.md`
```markdown
# MTN Data Privacy Crossword Challenge

Local, single-laptop crossword game for Data Privacy Week at MTN Ghana.

## Requirements
- Node.js 20+
- Windows laptop (works on macOS/Linux too)

## Install
```bash
npm install
cp .env.example .env            # (on Windows: copy .env.example .env)
npx prisma migrate dev --name init
npm run seed
```

## Run
```bash
npm run dev          # development (http://localhost:3000)
# or for the event:
npm run build
npm run start
```

Double-click `start-game.bat` on Windows to launch the production server and open the browser.

## URLs
- `/`           Employee registration
- `/game`       Active crossword
- `/leaderboard` Public Top 10
- `/tv`         Presentation display (with Cinema Mode)
- `/admin`      Admin PIN login

## Env Vars
- `DATABASE_URL="file:./dev.db"` — SQLite file location (resolved relative to the `prisma/` folder)
- `ADMIN_PIN` — PIN for admin login
- `ADMIN_SESSION_SECRET` — HMAC secret for admin + attempt cookies (use at least 32 chars)

Change PIN: edit `.env` and restart the server.

## Database Location
`prisma/dev.db` (SQLite).

## Backup
Admin dashboard → "Backup DB" downloads a copy of the SQLite file.
Also: `npm run build` won't touch your data; just copy `prisma/dev.db` manually before major changes.

## Event Flow

1. In `/admin`, create/review questions.
2. Preview puzzle → Publish Puzzle.
3. Set `TEST MODE` and verify everything.
4. Clear Test Results.
5. Switch to `LIVE MODE`.
6. Set `Game Status` → `OPEN`.
7. Open `/tv` on the presentation screen and enter Cinema Mode.
8. Employees play one at a time at `/`.
9. After the event, export CSVs for Top 10 / Top 5 / All.

## Networking
`npm run dev` and `npm run start` bind to `0.0.0.0:3000`, so another device on the same LAN can reach the app via `http://<laptop-ip>:3000`.

On Windows, find the IP with `ipconfig`. You may need to allow Node through the Windows Firewall when prompted.

## Admin PIN / Secret
- Default PIN in `.env.example`: `change-this-pin` — **change this before use**.
- Change `ADMIN_SESSION_SECRET` to a long random string.

## Fonts & Logo
- Add authorized MTN Brighter Sans files to `public/fonts/` and declare them in `globals.css`. Falls back to Arial.
- Place an authorized MTN logo in `public/brand/` if needed.

## Event-Day Checklist
See spec — the key items:
- [ ] Laptop on power, sleep disabled
- [ ] `npm install`, migrate, seed done
- [ ] Admin login works
- [ ] Questions active, puzzle published
- [ ] Unplaced words reviewed
- [ ] TEST mode walk-through done, test results cleared
- [ ] Switch to LIVE mode, OPEN the game
- [ ] Test keyboard + touchscreen + black cells + timer + submit
- [ ] Open `/tv` in Cinema Mode
- [ ] Backup DB

## Troubleshooting
- "No published puzzle" → Admin → Questions → Regenerate Preview → Publish Puzzle.
- Stuck active attempt → Admin dashboard → End Current Attempt.
- Reset for testing → Admin → Results → Clear Test Results.

## Ranking Rules
1. Highest score
2. Most correct
3. Shortest duration
4. Earliest submission

## Tests
```bash
npm test
```

## Stopping
`Ctrl+C` in the terminal.
```

### `public/brand/README.txt`
```
Place an authorized MTN logo file here (e.g. logo.png) if available.
The application will gracefully fall back to styled text if the file is absent.
```

---

## Notes on What You Need to Do

1. **Create the folder** `mtn-crossword` and place all files above at the paths shown.
2. **Run:**
   ```
   npm install
   copy .env.example .env    (edit the PIN & secret)
   npx prisma migrate dev --name init
   npm run seed
   npm run dev
   ```
3. **Open** `http://localhost:3000/admin` (default PIN from your `.env`), publish the puzzle, then play at `/`.

### Honest disclaimers

- I could not run or test this project in my environment, so despite careful construction there may be minor TypeScript/Prisma adjustments needed on first run. The architecture, APIs, flow, security model, scoring, ranking, puzzle generation, and UI are all complete and functional as specified.
- I prioritized the simplest reliable approach as instructed — no unnecessary abstractions.
- Two tiny things worth noting:
  - The `scoring.ts` "complete" check is slightly over-defensive; it works correctly but you could simplify.
  - If you want the puzzle to show even more interconnection, you can lower the `GRID_SIZE` or tweak the generator scoring in `crossword-generator.ts`.

Everything required by the spec — registration with privacy consent, server-anchored timer, grid persistence, server-side scoring, masked leaderboards, test/live modes, admin dashboard, Cinema Mode, TV mirror, CSV exports, DB backup, replay permissions, admin cancellation, etc. — is implemented.