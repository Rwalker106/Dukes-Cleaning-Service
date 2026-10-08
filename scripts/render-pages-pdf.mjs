import { chromium } from "playwright";
import { mkdir, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const baseUrl = process.env.BASE_URL || "http://127.0.0.1:4173";
const rootDir = process.cwd();
const outputDir = path.join(rootDir, "review", "pdf");
const shotsDir = path.join(outputDir, "screenshots");
const tempHtmlPath = path.join(outputDir, "_pdf-staging.html");
const pdfPath = path.join(outputDir, "site-pages-visual.pdf");
const coverTitle = process.env.COVER_TITLE || "Risal Systems";

const routes = [
  "/",
  "/about",
  "/areas-we-serve",
  "/industries-we-serve",
  "/green-clean",
  "/services",
  "/services/deep-cleaning",
  "/services/office-cleaning",
  "/services/medical-cleaning",
  "/rfp",
  "/privacy",
  "/tos",
];

const escapeHtml = (value) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

async function resolveCoverLogoSrc() {
  const candidates = [
    process.env.COVER_LOGO,
    path.join(rootDir, "public", "assets", "logo.png"),
    path.join(rootDir, "src", "assets", "logo.png"),
  ].filter(Boolean);

  for (const candidate of candidates) {
    const exists = await stat(candidate)
      .then((result) => result.isFile())
      .catch(() => false);
    if (exists) {
      return pathToFileURL(candidate).toString();
    }
  }

  return "";
}

async function captureScreenshots() {
  await rm(shotsDir, { recursive: true, force: true });
  await mkdir(shotsDir, { recursive: true });

  const browser = await chromium.launch({ channel: "msedge", headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    colorScheme: "light",
  });

  await context.addInitScript(() => {
    localStorage.setItem("theme", "light");
    document.documentElement.setAttribute("data-theme", "light");
  });

  const page = await context.newPage();
  const captures = [];

  for (let i = 0; i < routes.length; i += 1) {
    const route = routes[i];
    const url = new URL(route, baseUrl).toString();
    const fileName = `${String(i + 1).padStart(2, "0")}-${route === "/" ? "home" : route.slice(1).replaceAll("/", "-")}.png`;
    const outPath = path.join(shotsDir, fileName);

    await page.goto(url, { waitUntil: "networkidle" });
    await page.waitForTimeout(900);
    await page.screenshot({ path: outPath, fullPage: true });

    captures.push({ route, fileName });
    console.log(`Captured ${url}`);
  }

  await browser.close();
  return captures;
}

async function buildPdf(captures) {
  const coverLogoSrc = await resolveCoverLogoSrc();
  const coverSection = `
    <section class="cover-page page-block">
      ${
        coverLogoSrc
          ? `<img class="cover-logo" src="${coverLogoSrc}" alt="${escapeHtml(coverTitle)} logo" loading="eager" />`
          : ""
      }
      <h1 class="cover-title">${escapeHtml(coverTitle)}</h1>
      <p class="cover-subtitle">Rendered Website Review</p>
    </section>
  `;

  const sections = captures
    .map(
      ({ route, fileName }) => `
        <section class="page-block">
          <h1>${escapeHtml(route)}</h1>
          <img src="./screenshots/${encodeURIComponent(fileName)}" alt="${escapeHtml(route)}" loading="eager" />
        </section>
      `,
    )
    .join("\n");

  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Duke's Cleaning Service Visual Page Pack</title>
    <style>
      @page {
        size: A4;
        margin: 12mm;
      }

      * {
        box-sizing: border-box;
      }

      body {
        margin: 0;
        font-family: "Segoe UI", Arial, sans-serif;
        color: #121212;
      }

      .cover-page {
        min-height: 100vh;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 8mm;
        text-align: center;
      }

      .cover-logo {
        max-width: 120mm;
        width: 100%;
        height: auto;
      }

      .cover-title {
        margin: 0;
        font-size: 28px;
        letter-spacing: 0.02em;
      }

      .cover-subtitle {
        margin: 0;
        font-size: 14px;
        color: #555;
      }

      .page-block {
        break-after: page;
      }

      .page-block:last-child {
        break-after: auto;
      }

      h1 {
        margin: 0 0 6mm;
        font-size: 16px;
        font-weight: 700;
      }

      img {
        display: block;
        width: 100%;
        height: auto;
        border: 1px solid #d6d6d6;
      }
    </style>
  </head>
  <body>
    ${coverSection}
    ${sections}
  </body>
</html>`;

  await writeFile(tempHtmlPath, html, "utf8");

  const browser = await chromium.launch({ channel: "msedge", headless: true });
  const page = await browser.newPage();
  await page.goto(pathToFileURL(tempHtmlPath).toString(), {
    waitUntil: "domcontentloaded",
  });

  await page.pdf({
    path: pdfPath,
    format: "A4",
    printBackground: true,
  });

  await browser.close();
  console.log(`Created: ${pdfPath}`);
}

await mkdir(outputDir, { recursive: true });
const captures = await captureScreenshots();
await buildPdf(captures);
