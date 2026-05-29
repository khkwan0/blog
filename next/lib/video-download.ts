import { spawn } from "child_process";
import { readdir } from "fs/promises";
import { mkdir } from "fs/promises";
import path from "path";
import type { ParsedVideoUrl } from "@/lib/video-url";
import { getPostVideoDir } from "@/lib/video-storage";

function runCommand(command: string, args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: ["ignore", "pipe", "pipe"] });
    let stderr = "";

    child.stderr.on("data", (chunk: Buffer) => {
      stderr += chunk.toString();
    });

    child.on("error", (error) => {
      reject(error);
    });

    child.on("close", (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(stderr.trim() || `${command} exited with code ${code}`));
    });
  });
}

export async function isYtDlpAvailable(): Promise<boolean> {
  try {
    await runCommand("yt-dlp", ["--version"]);
    return true;
  } catch {
    return false;
  }
}

function safeFileStem(value: string): string {
  return value.replace(/[^\w.-]+/g, "_").slice(0, 80) || "video";
}

export async function downloadVideo(
  video: ParsedVideoUrl,
  postId: string,
): Promise<string> {
  const dir = getPostVideoDir(postId);
  await mkdir(dir, { recursive: true });

  const stem = safeFileStem(`${video.provider}-${video.videoId}`);
  const outputTemplate = path.join(dir, `${stem}.%(ext)s`);

  const args = [
    "--js-runtimes",
    "node",
    "--extractor-args",
    "youtube:player_client=android,web",
    "-f",
    "best[ext=mp4]/best",
    "--merge-output-format",
    "mp4",
    "--no-playlist",
    "--no-overwrites",
    "-o",
    outputTemplate,
    video.url,
  ];

  const cookiesPath = process.env.YTDLP_COOKIES_PATH?.trim();
  if (cookiesPath) {
    args.unshift(cookiesPath);
    args.unshift("--cookies");
  }

  await runCommand("yt-dlp", args);

  const files = await readdir(dir);
  const existing = files
    .filter((file) => file.startsWith(`${stem}.`))
    .sort();

  const videoFile = existing.at(-1);
  if (!videoFile) {
    throw new Error("Download finished but no video file was found");
  }

  return path.posix.join("posts", postId, videoFile);
}
