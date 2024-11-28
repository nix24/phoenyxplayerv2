/*
  Warnings:

  - You are about to drop the column `artist` on the `Track` table. All the data in the column will be lost.
  - Added the required column `artists` to the `Track` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Track" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "url" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "artists" TEXT NOT NULL,
    "tags" TEXT NOT NULL,
    "fileSize" INTEGER
);
INSERT INTO "new_Track" ("id", "tags", "title", "url") SELECT "id", "tags", "title", "url" FROM "Track";
DROP TABLE "Track";
ALTER TABLE "new_Track" RENAME TO "Track";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
