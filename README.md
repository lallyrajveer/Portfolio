# FP&A Portfolio

A clean, corporate portfolio site to showcase your FP&A work — built with React, deployable to Netlify or Vercel in minutes.

---

## 🚀 Quick Start

```bash
npx create-react-app fpa-portfolio
cd fpa-portfolio
# Replace src/App.jsx and src/projects/index.js with the files from this project
npm start
```

---

## ➕ How to Add a New Project

### Step 1 — Drop in your JSX file
Copy your Claude-generated `.jsx` file into `src/projects/`:
```
src/projects/MyBudgetDashboard.jsx
```

Make sure the JSX file uses a **default export**:
```jsx
export default function MyBudgetDashboard() {
  return <div>...</div>;
}
```

### Step 2 — Register it in `src/projects/index.js`
Add a new entry to the `projects` array:

```js
import { lazy } from "react";

{
  id: 4,
  title: "FY2026 Budget Dashboard",
  category: "Budgeting",            // See categories list below
  date: "March 2026",
  tags: ["Excel", "React", "FY2026"],
  description: "A short description of what this project does and why it matters.",
  component: lazy(() => import("./MyBudgetDashboard")),  // 👈 link your file here
  featured: false,                   // set true to show in Featured section
},
```

That's it. The project will appear in your portfolio with a live preview modal.

---

## 📁 Categories
- Budgeting
- Forecasting
- Variance Analysis
- Board Reporting
- Modeling
- KPI Dashboards
- Other

---

## 🌐 Deploy to Netlify (free, ~3 min)

```bash
npm run build
```
Then drag the `build/` folder to [netlify.com/drop](https://netlify.com/drop).
You'll get a live URL instantly — paste it on your resume.

---

## ✏️ Personalizing the Site

| What to change | Where |
|---|---|
| Your name | `src/App.jsx` — Hero section, Footer |
| Email / LinkedIn | `src/App.jsx` — Contact section |
| Bio text | `src/App.jsx` — Hero + About section |
| Years experience / stats | `src/App.jsx` — Hero stats |
