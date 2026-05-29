import { spawn } from "child_process";
import { mkdir, readdir } from "fs/promises";
import path from "path";
import type { ParsedVideoUrl } from "@/lib/video-url";
import { getPostVideoDir } from "@/lib/video-storage";
import {
  getYtDlpCookiesPath,
  YOUTUBE_COOKIES_HELP,
} from "@/lib/ytdlp-cookies";

type CommandResult = {
  stdout: string;
  stderr: string;
};

function runCommand(command: string, args: string[]): Promise<CommandResult> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: ["ignore", "pipe", "pipe"] });
    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (chunk: Buffer) => {
      stdout += chunk.toString();
    });

    child.stderr.on("data", (chunk: Buffer) => {
      stderr += chunk.toString();
    });

    child.on("error", (error) => {
      reject(error);
    });

    child.on("close", (code) => {
      const output = { stdout, stderr };
      if (code === 0) {
        resolve(output);
        return;
      }

      const error = new Error(
        stderr.trim() || stdout.trim() || `${command} exited with code ${code}`,
      ) as Error & { output: CommandResult };
      error.output = output;
      reject(error);
    });
  });
}

function simplifyYtDlpError(message: string): string {
  if (
    message.includes("no longer valid") ||
    message.includes("have likely been rotated")
  ) {
    return "YouTube cookies expired or were invalidated. Re-export fresh cookies from your browser to storage/youtube-cookies.txt, then republish.";
  }

  if (message.includes("Sign in to confirm")) {
    return `YouTube blocked the download from this server. ${YOUTUBE_COOKIES_HELP}`;
  }

  if (
    message.includes("Read-only file system") ||
    message.includes("Permission denied")
  ) {
    return "yt-dlp could not update cookies file (internal error — try republishing again)";
  }

  const line = message
    .split("\n")
    .find((part) => part.startsWith("ERROR:") || part.includes("error"));

  return line?.replace(/^ERROR:\s*/, "") ?? message.slice(0, 280);
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

async function buildYtDlpArgs(
  video: ParsedVideoUrl,
  outputTemplate: string,
): Promise<string[]> {
  const args = [
    "--remote-components",
    "ejs:github",
    "--js-runtimes",
    "deno",
    "--js-runtimes",
    "node",
    "-f",
    "best[ext=mp4]/best",
    "--merge-output-format",
    "mp4",
    "--no-playlist",
    "--no-overwrites",
    "-o",
    outputTemplate,
  ];

  if (video.provider === "youtube") {
    args.splice(
      4,
      0,
      "--extractor-args",
      "youtube:player_client=default,-android_sdkless",
    );
  }

  const cookiesPath = await getYtDlpCookiesPath();
  if (cookiesPath) {
    args.unshift("--cookies", cookiesPath);
  }

  args.push(video.url);
  return args;
}

export async function downloadVideo(
  video: ParsedVideoUrl,
  postId: string,
): Promise<string> {
  const dir = getPostVideoDir(postId);
  await mkdir(dir, { recursive: true });

  const stem = safeFileStem(`${video.provider}-${video.videoId}`);
  const outputTemplate = path.join(dir, `${stem}.%(ext)s`);

  const args = await buildYtDlpArgs(video, outputTemplate);
  console.log(
    `[video-download] starting ${video.provider} ${video.videoId} for post ${postId}`,
  );

  try {
    const result = await runCommand("yt-dlp", args);
    const logLines = (result.stderr || result.stdout).trim().split("\n");
    for (const line of logLines.slice(-6)) {
      console.log(`[video-download] ${line}`);
    }
  } catch (error) {
    const output =
      error instanceof Error && "output" in error
        ? (error as Error & { output: CommandResult }).output
        : null;
    const detail = output?.stderr || output?.stdout || "";
    if (detail) {
      console.error(`[video-download] failed for ${video.url}:\n${detail}`);
    }

    throw new Error(
      simplifyYtDlpError(
        error instanceof Error ? error.message : "Video download failed",
      ),
    );
  }

  const files = await readdir(dir);
  const existing = files.filter((file) => file.startsWith(`${stem}.`)).sort();

  const videoFile = existing.at(-1);
  if (!videoFile) {
    throw new Error("Download finished but no video file was found");
  }

  const localPath = path.posix.join("posts", postId, videoFile);
  console.log(`[video-download] saved ${localPath}`);
  return localPath;
}
