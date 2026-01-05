import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Für db push und Migrationen: Direktverbindung (Port 5432)
    url: process.env["DIRECT_URL"],
  },
});
