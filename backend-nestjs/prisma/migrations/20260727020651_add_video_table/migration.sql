-- CreateTable
CREATE TABLE "videos" (
    "id" TEXT NOT NULL,
    "youtubeId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "channelTitle" TEXT,
    "publishedAt" TIMESTAMP(3),
    "thumbnail" TEXT,
    "duration" TEXT,
    "viewCount" TEXT,
    "transcript" JSONB,
    "chapters" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "videos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "videos_youtubeId_key" ON "videos"("youtubeId");
