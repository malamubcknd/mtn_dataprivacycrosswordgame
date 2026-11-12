import { PrismaClient } from "@prisma/client";
import { normalizeAnswer } from "../src/lib/normalize";

const prisma = new PrismaClient();

const SEED = [
  { clue: "Fraudulent attempt to obtain sensitive information by disguising as a trustworthy entity", answer: "PHISHING", points: 10 },
  { clue: "Secret word or string used to authenticate a user", answer: "PASSWORD", points: 10 },
  { clue: "Process of converting information into a secret code", answer: "ENCRYPTION", points: 10 },
  { clue: "Unauthorized access or disclosure of personal data (two words)", answer: "DATABREACH", points: 15 },
  { clue: "Agreement given freely by a data subject", answer: "CONSENT", points: 10 },
  { clue: "Individual whose personal data is processed (two words)", answer: "DATASUBJECT", points: 15 },
  { clue: "State of keeping information secret", answer: "PRIVACY", points: 10 },
  { clue: "Verifying the identity of a user", answer: "AUTHENTICATION", points: 15 },
  { clue: "Harmful software designed to damage systems", answer: "MALWARE", points: 10 },
  { clue: "A security event that may compromise data", answer: "INCIDENT", points: 10 },
  { clue: "Keeping only the minimum data required", answer: "MINIMIZATION", points: 15 },
  { clue: "Period data is kept before deletion", answer: "RETENTION", points: 10 },
  { clue: "Manipulating people to disclose confidential information (two words)", answer: "SOCIALENGINEERING", points: 15 },
  { clue: "A digital identifier connecting you to online services", answer: "ACCOUNT", points: 10 }
];

async function main() {
  // Config singleton
  await prisma.gameConfiguration.upsert({
    where: { id: "singleton" },
    update: {},
    create: { id: "singleton" }
  });

  const existing = await prisma.question.count();
  if (existing > 0) {
    console.log("Questions already present, skipping seed.");
    return;
  }

  for (const q of SEED) {
    await prisma.question.create({
      data: {
        clue: q.clue,
        answer: q.answer,
        normalized: normalizeAnswer(q.answer),
        points: q.points,
        direction: "AUTO",
        active: true
      }
    });
  }
  console.log(`Seeded ${SEED.length} questions.`);
}

main().finally(() => prisma.$disconnect());