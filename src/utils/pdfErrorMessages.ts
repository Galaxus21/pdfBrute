/**
 * pdfErrorMessages.ts
 * SRP: Translates a caught pd.js load/parse error into copy a non-technical
 * user can act on. Names below are pdf.js's own exception classes
 * (`err.name`) — verified against node_modules/pdfjs-dist/build/pdf.mjs.
 */

const KNOWN_ERROR_MESSAGES: Readonly<Record<string, string>> = {
  InvalidPDFException: "This file doesn't look like a valid PDF. Please check the upload.",
  FormatError: 'This PDF appears to be corrupted or uses an unsupported structure.',
  ResponseException: 'The PDF could not be read (the browser reported an unexpected error accessing the file).',
};

/** Maps a caught load/parse error to user-facing copy; falls back to the raw message. */
export function describePdfLoadError(err: unknown): string {
  if (err instanceof Error) {
    return KNOWN_ERROR_MESSAGES[err.name] ?? err.message ?? 'An unexpected error occurred while reading the PDF.';
  }
  return 'An unexpected error occurred while reading the PDF.';
}
