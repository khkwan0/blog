import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));

function resolvePrismaDir() {
  const inApp = path.join(root, "prisma");
  if (fs.existsSync(path.join(inApp, "schema.prisma"))) {
    return inApp;
  }

  const inRepo = path.join(root, "..", "prisma");
  if (fs.existsSync(path.join(inRepo, "schema.prisma"))) {
    return inRepo;
  }

  throw new Error("Could not find prisma/schema.prisma");
}

const prismaDir = resolvePrismaDir();

export default {
  schema: path.join(prismaDir, "schema.prisma"),
  migrations: {
    path: path.join(prismaDir, "migrations"),
  },
  datasource: {
    url: process.env.DATABASE_URL,
  },
};
