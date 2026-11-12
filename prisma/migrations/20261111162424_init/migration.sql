-- CreateTable
CREATE TABLE "Question" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clue" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "normalized" TEXT NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 10,
    "direction" TEXT NOT NULL DEFAULT 'AUTO',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "PuzzleVersion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "versionNumber" INTEGER NOT NULL,
    "gridWidth" INTEGER NOT NULL,
    "gridHeight" INTEGER NOT NULL,
    "serializedLayout" TEXT NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "GameConfiguration" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'singleton',
    "gameTitle" TEXT NOT NULL DEFAULT 'MTN Data Privacy Crossword Challenge',
    "welcomeMessage" TEXT NOT NULL DEFAULT 'Test your data privacy knowledge!',
    "durationMinutes" INTEGER NOT NULL DEFAULT 5,
    "gameStatus" TEXT NOT NULL DEFAULT 'OPEN',
    "eventMode" TEXT NOT NULL DEFAULT 'TEST',
    "repeatAttemptsAllowed" BOOLEAN NOT NULL DEFAULT false,
    "resultPopupDurationSeconds" INTEGER NOT NULL DEFAULT 15,
    "publishedPuzzleVersionId" TEXT,
    "updatedAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Player" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fullOfficialName" TEXT NOT NULL,
    "normalizedEmployeeId" TEXT NOT NULL,
    "rawEmployeeId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "GameAttempt" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "playerId" TEXT NOT NULL,
    "puzzleVersionId" TEXT NOT NULL,
    "eventMode" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "startTime" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "allowedDurationSeconds" INTEGER NOT NULL,
    "submissionTime" DATETIME,
    "durationSeconds" INTEGER,
    "score" INTEGER NOT NULL DEFAULT 0,
    "totalAvailableScore" INTEGER NOT NULL DEFAULT 0,
    "correctAnswerCount" INTEGER NOT NULL DEFAULT 0,
    "totalQuestionCount" INTEGER NOT NULL DEFAULT 0,
    "submissionReason" TEXT,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "finalLeaderboardPosition" INTEGER,
    "currentGridState" TEXT NOT NULL DEFAULT '{}',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "GameAttempt_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "GameAttempt_puzzleVersionId_fkey" FOREIGN KEY ("puzzleVersionId") REFERENCES "PuzzleVersion" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AttemptAnswer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "attemptId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "playerSubmittedAnswer" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL,
    "pointsEarned" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "AttemptAnswer_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "GameAttempt" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ReplayPermission" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "normalizedEmployeeId" TEXT NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "Player_normalizedEmployeeId_key" ON "Player"("normalizedEmployeeId");

-- CreateIndex
CREATE INDEX "GameAttempt_status_idx" ON "GameAttempt"("status");

-- CreateIndex
CREATE INDEX "GameAttempt_eventMode_completed_idx" ON "GameAttempt"("eventMode", "completed");

-- CreateIndex
CREATE UNIQUE INDEX "ReplayPermission_normalizedEmployeeId_key" ON "ReplayPermission"("normalizedEmployeeId");
