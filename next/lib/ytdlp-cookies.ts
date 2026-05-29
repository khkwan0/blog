import { access, mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { getMediaRoot } from "@/lib/video-storage";

export function configuredCookiesPath(): string | null {
  const cookiesPath = process.env.YTDLP_COOKIES_PATH?.trim();
  return cookiesPath || null;
}

async function cookiesFileHasEntries(cookiesPath: string): Promise<boolean> {
  const content = await readFile(cookiesPath, "utf8");
  return content
    .split("\n")
    .some(
      (line) =>
        line.trim() &&
        !line.startsWith("#") &&
        line.includes("\t") &&
        !line.startsWith("Placeholder"),
    );
}

function writableCookiesPath(): string {
  return path.join(getMediaRoot(), ".cache", "ytdlp-cookies.txt");
}

/**
 * Fresh writable copy on each call. yt-dlp writes cookies back on exit;
 * the host mount is read-only and /tmp can hit permission conflicts in Docker.
 */
export async function getYtDlpCookiesPath(): Promise<string | null> {
  const sourcePath = configuredCookiesPath();
  if (!sourcePath) {
    return null;
  }

  try {
    await access(sourcePath);
    if (!(await cookiesFileHasEntries(sourcePath))) {
      console.warn(
        "[ytdlp-cookies] no cookie entries in",
        sourcePath,
        "— export YouTube cookies to storage/youtube-cookies.txt",
      );
      return null;
    }

    const dest = writableCookiesPath();
    await mkdir(path.dirname(dest), { recursive: true });
    await writeFile(dest, await readFile(sourcePath), { mode: 0o666 });

    return dest;
  } catch (error) {
    console.error(
      "[ytdlp-cookies] failed to prepare cookies:",
      error instanceof Error ? error.message : error,
    );
    return null;
  }
}

export const YOUTUBE_COOKIES_HELP =
  "If YouTube blocks the server, export browser cookies to storage/youtube-cookies.txt (Netscape format). See storage/youtube-cookies.txt.example.";
