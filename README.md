# PDFBrute

**Live Website**: [pdfbrute.web.app](https://pdfbrute.web.app/)

PDFBrute is a 100% private, client-side PDF password recovery tool. It allows you to recover access to your own encrypted PDFs by defining custom password patterns. 

Because it runs entirely in your browser using Web Workers, **your files never leave your device**. There are no uploads, no servers processing your documents, and complete privacy.

> [!IMPORTANT]
> **Intended Use & Best Practices**
> This tool is strictly designed for **recovering passwords to your own documents** that you have forgotten. It is absolutely **not** intended for breaking into PDFs that do not belong to you.
> 
> Furthermore, brute-forcing a completely unknown password can take an impractical amount of time. This tool works best when you **already remember some parts of your password** (e.g., the base word, a specific year, or special characters you typically use) and can build a precise pattern to narrow down the search space.

## Features

- **Client-Side Processing**: All password brute-forcing is done locally in your browser.
- **Pattern Builder**: Define precise patterns (e.g., specific uppercase letters, ranges of years, or known static characters) to drastically reduce recovery time.
- **High Performance**: Utilizes Web Workers so the UI remains responsive while the heavy lifting happens in the background.
- **Dark Mode Support**: Beautiful, fully responsive UI that respects your system's color scheme preferences.

## Tech Stack

- **React 19**
- **TypeScript**
- **Vite**
- **Aphrodite** (for dynamic CSS-in-JS styling)
- **PDF.js** (for client-side PDF parsing and decryption attempts)
- **Firebase** (Hosting & Analytics)

## Getting Started

### Prerequisites

Ensure you have [Node.js](https://nodejs.org/) installed on your machine.

### Installation

1. Clone the repository:
   ```bash
   # Using HTTPS
   git clone https://github.com/Galaxus21/pdfBrute.git
   
   # OR using SSH
   # git clone git@github.com:Galaxus21/pdfBrute.git
   
   cd pdfBrute
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Build for production:
   ```bash
   npm run build
   ```

## Architecture

- **`src/components/`**: React components used across the application, broken down by domain (PatternBuilder, GeneratorSettings, etc.).
- **`src/workers/`**: Contains the Web Worker logic that executes the brute-force attacks off the main thread.
- **`src/utils/`**: Core logic for generating passwords based on the user-defined pattern tokens.
- **`src/styles/`**: Centralized design system tokens (`theme.ts`) and styling hooks.

## Deployment

This project is configured to deploy to Firebase Hosting.

1. Install the Firebase CLI: `npm install -g firebase-tools`
2. Login to your Firebase account: `firebase login`
3. Deploy: `firebase deploy --only hosting`

## License
MIT License
