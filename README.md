# Kickbase Player Analysis Frontend

A Next.js frontend application to view and analyze Kickbase player data with fair market values.

## Features

- 📊 **CSV Data Loading**: Automatically loads player data from `players_with_fmv.csv`
- 🔍 **Search**: Filter players by name, team, or position
- 📈 **Sorting**: Click column headers to sort (ascending/descending/toggle off)
- 💰 **Smart Formatting**: Large numbers displayed as "M" (millions) or "K" (thousands)
- 🎨 **Color Coding**: Positive/negative differences highlighted in green/red
- 📱 **Responsive**: Works on mobile and desktop devices

## Getting Started

### Prerequisites

- Node.js 18+ installed
- CSV file `players_with_fmv.csv` in the `public/` folder

### Installation

Dependencies are already installed. If you need to reinstall:

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

## Project Structure

```
frontend/
├── app/
│   ├── layout.tsx      # Root layout
│   ├── page.tsx        # Main page component
│   └── globals.css     # Global styles
├── public/
│   └── players_with_fmv.csv  # Player data CSV
├── package.json
├── tsconfig.json
└── tailwind.config.js
```

## Customization

### Visible Columns

Edit the `visibleColumns` array in `app/page.tsx` to show/hide columns:

```typescript
const [visibleColumns, setVisibleColumns] = useState<string[]>([
  'fn', 'ln', 'tn', 'pos', 'ap', 'g', 'mv', 'fair_market_value', 'mv_diff_pct'
])
```

### Column Labels

Modify the `getColumnLabel` function to change column display names.

### Styling

Update Tailwind classes in `app/page.tsx` or modify `app/globals.css` for custom styling.

## Technologies Used

- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS**: Utility-first CSS framework
- **PapaParse**: CSV parsing library

