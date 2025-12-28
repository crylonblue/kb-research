# Kickbase Player Analysis Frontend

A Next.js frontend application to view and analyze Kickbase player data with fair market values.

## Features

- 📊 **CSV Data Loading**: Automatically loads player data from `players_with_fmv.csv`
- 🔍 **Search**: Filter players by name, team, or position
- 📈 **Sorting**: Click column headers to sort (ascending/descending/toggle off)
- 💰 **Smart Formatting**: Large numbers displayed as "M" (millions) or "K" (thousands)
- 🎨 **Color Coding**: Positive/negative differences highlighted in green/red
- 📱 **Responsive**: Works on mobile and desktop devices
- 📉 **Calculator**: Interactive FMV calculator with graph visualization

## Getting Started

### Prerequisites

- Node.js 18+ installed
- CSV files in the `public/` folder:
  - `players_with_fmv.csv` - Player data
  - `regression_metrics.csv` - Regression model parameters

### Installation

```bash
npm install
```

### Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm start
```

## Deployment to Vercel

This app is ready to deploy on Vercel:

1. **Push to GitHub**: Make sure your code is in a GitHub repository
2. **Import to Vercel**: 
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Set the **Root Directory** to `frontend` (if deploying from monorepo)
3. **Configure Build Settings**:
   - Framework Preset: Next.js (auto-detected)
   - Build Command: `npm run build` (default)
   - Output Directory: `.next` (default)
   - Install Command: `npm install` (default)
4. **Deploy**: Click "Deploy"

Vercel will automatically:
- Detect Next.js framework
- Run `npm install` and `npm run build`
- Deploy your app with automatic HTTPS

### Important Notes for Vercel Deployment

- ✅ All CSV files must be in the `public/` folder (they are already there)
- ✅ The app uses static site generation (SSG) - all pages are pre-rendered
- ✅ No environment variables needed
- ✅ Build passes TypeScript type checking

## Project Structure

```
frontend/
├── app/
│   ├── layout.tsx           # Root layout with navigation
│   ├── page.tsx            # Search Player page
│   ├── calculator/
│   │   └── page.tsx        # FMV Calculator page
│   ├── components/
│   │   └── Navigation.tsx  # Navigation component
│   └── globals.css         # Global styles
├── public/
│   ├── players_with_fmv.csv      # Player data CSV
│   └── regression_metrics.csv   # Regression parameters
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── next.config.js
```

## Customization

### Visible Columns

Edit the `visibleColumns` array in `app/page.tsx` to show/hide columns:

```typescript
const [visibleColumns, setVisibleColumns] = useState<string[]>([
  'fn', 'ln', 'tn', 'pos', 'tp', 'ap', 'smc', 'mv', 'fair_market_value', 'mv_diff_pct'
])
```

### Column Labels

Modify the `getColumnLabel` function to change column display names.

### Styling

Update Tailwind classes in components or modify `app/globals.css` for custom styling.

## Technologies Used

- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS**: Utility-first CSS framework
- **PapaParse**: CSV parsing library
- **Recharts**: Chart visualization library
