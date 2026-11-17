-- Upgrade: add Property.listingSource, VideoLike and VideoComment.
-- Safe to run on databases created before these objects existed.
-- For brand-new databases use the init migration instead.

-- ListingSource enum (no-op when already present)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ListingSource') THEN
    CREATE TYPE "ListingSource" AS ENUM ('PROFESSIONAL', 'PRIVATE');
  END IF;
END $$;

-- Property.listingSource column
ALTER TABLE "Property"
  ADD COLUMN IF NOT EXISTS "listingSource" "ListingSource" NOT NULL DEFAULT 'PROFESSIONAL';

CREATE INDEX IF NOT EXISTS "Property_listingSource_idx" ON "Property" ("listingSource");

-- Video likes
CREATE TABLE IF NOT EXISTS "VideoLike" (
    "id" TEXT NOT NULL,
    "videoId" TEXT NOT NULL,
    "anonId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VideoLike_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "VideoLike_videoId_anonId_key" ON "VideoLike" ("videoId", "anonId");
CREATE INDEX IF NOT EXISTS "VideoLike_videoId_idx" ON "VideoLike" ("videoId");

-- Video comments
CREATE TABLE IF NOT EXISTS "VideoComment" (
    "id" TEXT NOT NULL,
    "videoId" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "anonId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VideoComment_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "VideoComment_videoId_createdAt_idx" ON "VideoComment" ("videoId", "createdAt");
