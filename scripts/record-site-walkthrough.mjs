import { chromium } from "playwright";
import ffmpegPath from "ffmpeg-static";
import { mkdir, rm } from "node:fs/promises";
import { spawn } from "node:child_process";
import path from "node:path";

const baseUrl = process.env.BASE_URL || "http://127.0.0.1:4173";
const rootDir = process.cwd();
const outputDir = path.join(rootDir, "review");
const framesDir = path.join(outputDir, "frames");

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

function runFfmpeg(args) {
  return new Promise((resolve, reject) => {
    const child = spawn(ffmpegPath, args, { stdio: "inherit" });
    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`ffmpeg exited with code ${code}`));
      }
    });
  });
}

async function captureFrames() {
  await rm(framesDir, { recursive: true, force: true });
  await mkdir(framesDir, { recursive: true });

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

  for (let i = 0; i < routes.length; i += 1) {
    const route = routes[i];
    const url = new URL(route, baseUrl).toString();
    const frameName = `frame-${String(i + 1).padStart(3, "0")}.png`;
    const framePath = path.join(framesDir, frameName);

    await page.goto(url, { waitUntil: "networkidle" });
    await page.waitForTimeout(1200);
    await page.screenshot({ path: framePath, fullPage: true });
    console.log(`Captured ${url}`);
  }

  await browser.close();
}

async function encodeVideos() {
  const mp4Path = path.join(outputDir, "site-walkthrough.mp4");
  const webmPath = path.join(outputDir, "site-walkthrough.webm");
  const presentationMp4Path = path.join(
    outputDir,
    "site-walkthrough-presentation.mp4",
  );
  const presentationWebmPath = path.join(
    outputDir,
    "site-walkthrough-presentation.webm",
  );
  const presentationFramerate = 0.35;
  const presentationDuration = routes.length / presentationFramerate;
  const fadeOutStart = Math.max(presentationDuration - 1.2, 0.1);

  await runFfmpeg([
    "-y",
    "-framerate",
    "0.6",
    "-i",
    path.join(framesDir, "frame-%03d.png"),
    "-vf",
    "scale=1280:-2,format=yuv420p",
    "-c:v",
    "libx264",
    "-pix_fmt",
    "yuv420p",
    "-movflags",
    "+faststart",
    mp4Path,
  ]);

  await runFfmpeg([
    "-y",
    "-framerate",
    "0.6",
    "-i",
    path.join(framesDir, "frame-%03d.png"),
    "-vf",
    "scale=1280:-2",
    "-c:v",
    "libvpx-vp9",
    "-b:v",
    "0",
    "-crf",
    "32",
    webmPath,
  ]);

  await runFfmpeg([
    "-y",
    "-framerate",
    String(presentationFramerate),
    "-i",
    path.join(framesDir, "frame-%03d.png"),
    "-vf",
    `scale=1280:-2,format=yuv420p,fade=t=in:st=0:d=0.8,fade=t=out:st=${fadeOutStart.toFixed(2)}:d=1.2`,
    "-c:v",
    "libx264",
    "-pix_fmt",
    "yuv420p",
    "-movflags",
    "+faststart",
    presentationMp4Path,
  ]);

  await runFfmpeg([
    "-y",
    "-framerate",
    String(presentationFramerate),
    "-i",
    path.join(framesDir, "frame-%03d.png"),
    "-vf",
    `scale=1280:-2,fade=t=in:st=0:d=0.8,fade=t=out:st=${fadeOutStart.toFixed(2)}:d=1.2`,
    "-c:v",
    "libvpx-vp9",
    "-b:v",
    "0",
    "-crf",
    "32",
    presentationWebmPath,
  ]);

  console.log(`Created: ${mp4Path}`);
  console.log(`Created: ${webmPath}`);
  console.log(`Created: ${presentationMp4Path}`);
  console.log(`Created: ${presentationWebmPath}`);
}

await mkdir(outputDir, { recursive: true });
await captureFrames();
await encodeVideos();
