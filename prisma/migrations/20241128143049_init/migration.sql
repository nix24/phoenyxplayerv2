/*
  Warnings:

  - Added the required column `data` to the `Track` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Track" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "url" TEXT,
    "title" TEXT NOT NULL,
    "artists" TEXT NOT NULL,
    "tags" TEXT NOT NULL,
    "fileSize" INTEGER,
    "data" BLOB NOT NULL
);
INSERT INTO "new_Track" ("artists", "fileSize", "id", "tags", "title", "url") SELECT "artists", "fileSize", "id", "tags", "title", "url" FROM "Track";
DROP TABLE "Track";
ALTER TABLE "new_Track" RENAME TO "Track";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
