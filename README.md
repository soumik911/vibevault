# VibeVault ✦

A beginner-friendly, responsive personal mood and journal app made with plain HTML, CSS, and JavaScript.

## Features

- Six mood choices and a saved check-in history
- Check-in count, journal count, and consecutive-day streak
- Rotating inspirational reminders and copy-to-clipboard
- Journal notes with character counter and delete confirmation
- Dark neon responsive design with a softer-glow toggle
- Local persistence with `localStorage` — no account or backend required
- Keyboard-friendly labels, focus styles, and reduced-motion support

## Run on your PC

1. Download and extract the project ZIP.
2. Open the `vibevault` folder.
3. Double-click `index.html` to open it in a modern browser.

For a local development server (optional):
1. Install Visual Studio Code.
2. Open the `vibevault` folder in VS Code.
3. Install the **Live Server** extension.
4. Right-click `index.html` and choose **Open with Live Server**.

The app is plain static web code; no `npm install` or build step is needed. Google Fonts are loaded online; system fallback fonts are used if you are offline.

## Your data and privacy

Moods and notes are stored in your current browser on your current device using `localStorage`. They do not sync to other devices or get uploaded to a server. Clearing browser site data can delete them. Do not save highly sensitive information in a shared computer browser.

## Publish with GitHub Pages

1. Sign in at https://github.com and create a new **public** repository named `vibevault`.
2. Upload `index.html`, `styles.css`, `app.js`, and `README.md` to the repository root (not inside another nested folder).
3. Open **Settings → Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**.
5. Choose branch `main` and folder `/(root)`, then click **Save**.
6. Wait for the Pages deployment to finish. The site URL will look like `https://YOUR-USERNAME.github.io/vibevault/`.

## Project files

- `index.html` — page structure
- `styles.css` — neon design, layout, responsive styles
- `app.js` — app logic, storage, and interactions

## Notes

This project does not require an API key. All core features work locally in your browser.
