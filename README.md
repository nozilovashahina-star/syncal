# SyncCal — Shared Group Calendar App

A modern, high-end collaborative group calendar web app and Android PWA built according to luxury editorial Bento design aesthetics.

---

## ✨ Features

- **Shared Group Calendars (Max 5)**: Organize separate group spaces for trips, roommates, work squads, and study circles.
- **Photo 3 Aesthetic Match**: Up to 5 group calendars displayed as curated cards (clean white with status bar, warm vanilla sand, minimalist slate stone, pastel iridescent gradient with star badge, and sleek frosted glass).
- **Friends × Days Availability Matrix (Image 1 Match)**:
  - Header: Days of the week (Mon, Tue, Wed, Thu, Fri, Sat, Sun) with today highlighted.
  - Rows: Up to 8 friends in the shared calendar.
  - Cells: Displays who is busy, tentative, or free, with activity titles, times, and note indicators.
- **Shared Notes & Plans**:
  - Add plans and notes via the Floating Action Button (`+` coral circle, matching Image 1).
  - Pinned shared group notes for passwords, addresses, packing lists, and checklists.
- **Auto-Open Calendar on Startup**:
  - Inside any group calendar, toggle **⚡ Open on app launch**.
  - When enabled, the app automatically skips the home screen and opens directly into this calendar whenever the app is launched on mobile or desktop!
- **Light & Dark Mode**:
  - Light mode: Warm luxury sand (`#ECE8E0` / `#FAF2DF`) inspired by editorial aesthetics.
  - Dark mode: Matte obsidian slate with frosted glass accents.
- **Multi-Member Testing**:
  - Switch active identity directly from the top bar to test adding plans and notes as different friends.
- **100% PWA & Android APK Ready**:
  - Fully responsive on mobile phones and desktop.
  - Installable via browser "Add to Home screen".
  - Turn into an `.apk` file using Capacitor or PWABuilder.

---

## 📱 How to Convert to an APK File for Your Phone

### Option 1: PWABuilder (Easiest — 2 Minutes, No Setup Needed)

1. Deploy this folder to any free hosting provider (e.g. [Netlify Drop](https://app.netlify.com/drop), [Vercel](https://vercel.com), or [GitHub Pages](https://pages.github.com/)).
2. Go to [PWABuilder.com](https://www.pwabuilder.com/).
3. Paste your website URL and click **Start**.
4. Click **Package for Android** > **Download APK**.
5. Transfer the `.apk` to your phone and install!

---

### Option 2: Capacitor CLI (Build directly on your computer)

This project is already pre-configured with `capacitor.config.json` and `package.json`.

1. Install dependencies:
   ```bash
   npm install
   ```

2. Add Android platform:
   ```bash
   npx cap add android
   ```

3. Open in Android Studio:
   ```bash
   npx cap open android
   ```

4. In Android Studio, go to:
   **Build > Build Bundle(s) / APK(s) > Build APK(s)**.

5. Your APK will be compiled at:
   `android/app/build/outputs/apk/debug/app-debug.apk`.

---

### Option 3: Instant Phone Install (Without Compiling APK)

1. Open this website in **Google Chrome** on your Android phone.
2. Tap the three dots **⋮** in the upper right.
3. Tap **Add to Home screen** (or **Install App**).
4. SyncCal will install as a standalone mobile application with its own icon, splash screen, and offline support.

---

## 🚀 Running Locally

To run the local development server:

```bash
npm start
```

Or with python:
```bash
python -m http.server 3000
```

Open your browser to: `http://localhost:3000`.
