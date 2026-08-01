# PDFBrute

**Live Demo → [pdfbrute.web.app](https://pdfbrute.web.app/)**

> A 100% private, client-side PDF password recovery tool. Your files never leave your device.

PDFBrute helps you recover forgotten passwords from your own PDF documents. It runs **entirely in your browser** using Web Workers — no file uploads, no servers, no tracking.

> [!IMPORTANT]
> This tool is strictly for recovering passwords to **your own** documents. Brute-forcing a completely unknown password is impractical. PDFBrute works best when you remember **fragments** of your password (a base word, a year, some special characters) and can build a precise pattern to target the search.

---

## How It Works

1. **Upload your locked PDF** — the file never leaves your browser.
2. **Build a pattern mask** — describe what your password looks like using symbols (e.g. `LLLLdddd` for 4 letters + 4 digits).
3. **Pin known characters** — optionally lock positions you remember exactly.
4. **Hit Recover** — PDFBrute tries every candidate in the background using Web Workers, displaying live speed and progress stats.

---

## Features

### Pattern Builder
Define a mask that mirrors your expected password structure using shorthand symbols. This drastically reduces the search space compared to unconstrained brute-forcing.

| Symbol | Meaning | Example |
|--------|---------|---------|
| `L` | Uppercase letter (A–Z) | `A`, `B`, … `Z` |
| `l` | Lowercase letter (a–z) | `a`, `b`, … `z` |
| `d` | Digit (0–9) | `0`, `1`, … `9` |
| `DD` | Day (01–31) | `01`, `15`, `31` |
| `MM` | Month (01–12) | `01`, `06`, `12` |
| `YYYY` | Year (1900–2100) | `1990`, `2005`, `2024` |
| `?` | Any printable ASCII | `!`, `@`, `A`, `3`, … |

**Quick-start presets** are built in: *4-digit PIN*, *Date of Birth*, *Name + Year* — click to apply instantly.

A **live preview** updates as you type, showing an example of what passwords your pattern will generate.

### Known Character Pinning
In the Advanced Settings panel, enter any characters you already know into their exact position slots. PDFBrute filters the search space at startup — only candidates matching your known characters are tested.

### High-Performance Web Workers
The brute-force engine runs in a dedicated Web Worker, keeping the UI fully responsive. The recovery loop uses an **event-driven, non-cloning** architecture — the PDF buffer is loaded once, and `onPassword` is called for each candidate, avoiding memory-intensive re-allocation on every attempt.

Live stats update every 250ms:
- Passwords tested
- Current candidate being tried
- Speed (passwords/sec)
- Elapsed time

### Dark Mode
Fully responsive UI with automatic light/dark mode based on your system preference. Designed with a custom design system (`theme.ts`) using CSS-in-JS via Aphrodite.

### Privacy
- No file uploads — the PDF is processed locally using [PDF.js](https://mozilla.github.io/pdf.js/)
- No passwords are sent to any server
- No backend — pure static hosting via Firebase

---

## Tech Stack

| Technology | Role |
|------------|------|
| [React 19](https://react.dev/) | UI framework |
| [TypeScript](https://www.typescriptlang.org/) | Type-safe logic |
| [Vite](https://vitejs.dev/) | Build tool & dev server |
| [PDF.js](https://mozilla.github.io/pdf.js/) | Client-side PDF decryption |
| [Ant Design](https://ant.design/) | UI component library |
| [Aphrodite](https://github.com/Khan/aphrodite) | CSS-in-JS styling |
| [Firebase](https://firebase.google.com/) | Hosting & Analytics |
| Web Workers API | Background thread execution |

---

## Getting Started

### Prerequisites
Ensure [Node.js](https://nodejs.org/) is installed.

### Installation

```bash
# Clone the repo
git clone https://github.com/Galaxus21/pdfBrute.git
cd pdfBrute

# Install dependencies
npm install

# Start the dev server
npm run dev
```

### Build for Production

```bash
npm run build
```

---

## Project Structure

```
src/
├── components/
│   ├── PatternBuilder.tsx      # Pattern mask input, symbol legend, live preview
│   ├── GeneratorSettings.tsx   # Known character pinning (advanced panel)
│   ├── UploadPDF.tsx           # PDF drag-and-drop / file input
│   ├── ProgressBar.tsx         # Live recovery stats and progress display
│   └── ResultCard.tsx          # Found/exhausted/error result display
├── workers/
│   └── recovery.worker.ts      # Web Worker: brute-force engine
├── utils/
│   ├── generators.ts           # Generator strategies (Cartesian product engine)
│   └── patterns.ts             # Pattern parsing and preview utilities
├── styles/
│   ├── theme.ts                # Design system tokens (colors, typography, spacing)
│   └── themeContext.tsx        # Light/dark theme context provider
└── types/                      # Shared TypeScript types
```

---

## Deployment

This project is configured for Firebase Hosting.

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Deploy
firebase deploy --only hosting
```

---

## License

MIT
