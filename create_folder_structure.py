
from pathlib import Path

# Project root directory
PROJECT_ROOT = Path(
    "/Users/malamubcknd/Desktop/dataprivacycrosswordgame"
)

# Complete folder and file structure
structure = [
    ".env.example",
    ".gitignore",
    "README.md",
    "next.config.js",
    "package.json",
    "postcss.config.js",
    "start-game.bat",
    "tailwind.config.ts",
    "tsconfig.json",
    "vitest.config.ts",

    # Prisma
    "prisma/schema.prisma",
    "prisma/seed.ts",

    # Public
    "public/brand/README.txt",

    # Tests
    "tests/crossword.test.ts",
    "tests/normalize.test.ts",
    "tests/ranking.test.ts",
    "tests/scoring.test.ts",

    # App
    "src/app/layout.tsx",
    "src/app/globals.css",
    "src/app/page.tsx",
    "src/app/game/page.tsx",
    "src/app/leaderboard/page.tsx",
    "src/app/tv/page.tsx",

    # Admin pages
    "src/app/admin/page.tsx",
    "src/app/admin/questions/page.tsx",
    "src/app/admin/results/page.tsx",
    "src/app/admin/settings/page.tsx",

    # Admin API
    "src/app/api/admin/backup/route.ts",
    "src/app/api/admin/cancel-attempt/route.ts",
    "src/app/api/admin/clear-results/route.ts",
    "src/app/api/admin/config/route.ts",
    "src/app/api/admin/delete-result/route.ts",
    "src/app/api/admin/export/route.ts",
    "src/app/api/admin/login/route.ts",
    "src/app/api/admin/logout/route.ts",
    "src/app/api/admin/me/route.ts",
    "src/app/api/admin/puzzle/preview/route.ts",
    "src/app/api/admin/puzzle/publish/route.ts",
    "src/app/api/admin/questions/route.ts",
    "src/app/api/admin/questions/[id]/route.ts",
    "src/app/api/admin/replay/route.ts",
    "src/app/api/admin/results/route.ts",
    "src/app/api/admin/status/route.ts",

    # Attempt API
    "src/app/api/attempt/grid/route.ts",
    "src/app/api/attempt/start/route.ts",
    "src/app/api/attempt/state/route.ts",
    "src/app/api/attempt/submit/route.ts",

    # Other API
    "src/app/api/config/route.ts",
    "src/app/api/leaderboard/route.ts",
    "src/app/api/tv/route.ts",

    # Components
    "src/components/CinemaButton.tsx",
    "src/components/CrosswordGrid.tsx",
    "src/components/Logo.tsx",
    "src/components/ResultModal.tsx",
    "src/components/Timer.tsx",

    # Library
    "src/lib/admin-session.ts",
    "src/lib/crossword-generator.ts",
    "src/lib/normalize.ts",
    "src/lib/prisma.ts",
    "src/lib/puzzle-types.ts",
    "src/lib/ranking.ts",
    "src/lib/scoring.ts",
]


def create_project():
    PROJECT_ROOT.mkdir(parents=True, exist_ok=True)

    created = 0
    existing = 0

    for relative_path in structure:
        file_path = PROJECT_ROOT / relative_path

        # Create parent directories
        file_path.parent.mkdir(parents=True, exist_ok=True)

        # Create file only if it doesn't already exist
        if not file_path.exists():
            file_path.touch()
            created += 1
            print(f"[CREATED] {relative_path}")
        else:
            existing += 1
            print(f"[EXISTS]  {relative_path}")

    print("\n" + "=" * 55)
    print("PROJECT STRUCTURE CREATED SUCCESSFULLY")
    print("=" * 55)
    print(f"Project location: {PROJECT_ROOT}")
    print(f"New files created: {created}")
    print(f"Existing files preserved: {existing}")
    print(f"Total files: {len(structure)}")


if __name__ == "__main__":
    create_project()
