/**
 * Puppeteer print options for CV PDFs.
 * Do not set pageRanges. Limiting output to page 1 drops every later section.
 */
export function cvPdfPrintOptions(): {
  format: 'A4';
  printBackground: boolean;
  preferCSSPageSize: boolean;
  margin: { top: string; right: string; bottom: string; left: string };
  timeout: number;
  displayHeaderFooter: boolean;
} {
  return {
    format: 'A4',
    printBackground: true,
    preferCSSPageSize: false,
    margin: {
      top: '0.5in',
      right: '0.5in',
      bottom: '0.5in',
      left: '0.5in',
    },
    timeout: 30000,
    displayHeaderFooter: false,
  };
}
