# 🏋️‍♂️ IRONLOG — Personal Gym & Nutrition Tracker

> **Train with intent. Track what matters.**  
> A fast, privacy-first personal fitness and nutrition tracking PWA built with Next.js, React, TypeScript, and Tailwind CSS. All data is persisted 100% locally with zero required logins, external servers, or tracking.

---

## 🌟 Key Features

### 📅 Everyday Workout Tracker & Weekly Splits
- **Monday–Sunday Day-to-Day Routine**: Organized by day of the week with today's workout automatically highlighted.
- **Multi-Muscle Daily Splits**: Pre-configured routines covering push, pull, legs, upper body, arms, and conditioning.
- **Customizable Variations**: Customize each day's routine title, target muscle groups, and planned exercises to follow consistently for months.
- **One-Tap Routine Launch**: Load all planned exercises for any day directly into your workout session.

### 🏋️ Multi-Exercise Workout Logging
- **Hierarchical Workout Structure**: Log multiple exercises in a single session with complete set-by-set tracking (Weight in kg, Reps, Completion status).
- **Previous Performance Lookup ("LAST TIME")**: Instantly see your actual weights and reps from the last time you performed any exercise.
- **Volume & PR Tracking**: Automatic volume calculation per exercise and session, plus automated Personal Record (PR) detection for max weight and best set volume.
- **Custom Exercises**: Create and save custom exercises for any muscle group permanently.

### 🥗 Nutrition & Macro Tracker
- **Meal Breakdown**: Track meals across **Breakfast**, **Lunch**, **Snacks**, and **Dinner**.
- **Dynamic Macro Calculations**: Calculates calories and protein dynamically based on serving quantities.
- **Custom Foods**: Add and permanently save custom foods with custom calories, protein, and serving sizes.
- **Daily Targets & Averages**: Live progress bars for daily calorie and protein targets with historical averages.

### ⚖️ Body Weight Tracker
- Log daily body weight with date history.
- Historical progress and net weight change tracking.

### 📊 Workout History & Session Editor
- View complete historical workouts with exercise and set breakdowns.
- **Edit Existing Workouts**: Modify previous workouts without creating duplicate entries.
- Confirmed deletion of past workouts.

### 🔒 100% Offline & Local Data Persistence
- **Dual-Layer Local Storage**: IndexedDB storage with automatic `localStorage` fallback.
- **Data Backup & Restore**: One-click JSON export and validated JSON import to easily backup, transfer, or restore your data.
- **PWA & Mobile Ready**: Offline Service Worker, web manifest, responsive design (320px–430px+), and optimized for packaging with Capacitor into an Android APK.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **UI & Components**: React 19, Tailwind CSS, Lucide Icons, Radix UI primitives
- **Storage Layer**: IndexedDB + LocalStorage fallback
- **PWA**: Service Worker caching, Web App Manifest

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18.x or higher
- npm

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/tharun7070/personal-fitness-tracker.git
   cd personal-fitness-tracker
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

---

## 📦 Building for Production

To create an optimized production build:

```bash
npm run build
```

To run the production server:

```bash
npm start
```

---

## 📱 Mobile & PWA Installation

- **On Mobile Browsers (Chrome / Safari)**: Open the URL and tap **"Add to Home Screen"** or **"Install App"** to install IRONLOG as a standalone progressive web app.
- **Capacitor / Android APK**: The project is structured with client-side rendering and local persistence, ready for native packaging via Capacitor.

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
