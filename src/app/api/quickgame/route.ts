import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const excludeParam = searchParams.get("exclude") || "";
    const excludeIds = excludeParam
      ? excludeParam.split(",").filter(Boolean)
      : [];

    // Get all active questions
    const allQuestions = await prisma.question.findMany({
      where: { active: true },
      select: { id: true, clue: true, answer: true },
    });

    if (allQuestions.length === 0) {
      return NextResponse.json(
        { error: "No questions available." },
        { status: 404 }
      );
    }

    // Filter out already-solved
    let available = allQuestions.filter((q) => !excludeIds.includes(q.id));
    let cycleComplete = false;

    // If all solved → reset cycle
    if (available.length === 0) {
      available = allQuestions;
      cycleComplete = true;
    }

    const q = available[Math.floor(Math.random() * available.length)];
    const answer = q.answer.toUpperCase();

    const indices = Array.from({ length: answer.length }, (_, i) => i);
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    const revealedPositions = new Set(indices.slice(0, 2));

    const hints: (string | null)[] = answer
      .split("")
      .map((letter, i) => (revealedPositions.has(i) ? letter : null));

    return NextResponse.json({
      questionId: q.id,
      clue: q.clue,
      length: answer.length,
      hints,
      cycleComplete,
      totalWords: allQuestions.length,
      remainingWords: available.length,
    });
  } catch (e) {
    console.error("Quick game error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { questionId, answer } = await req.json();

    if (!questionId || !answer) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const question = await prisma.question.findUnique({
      where: { id: questionId },
      select: { answer: true },
    });

    if (!question) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 });
    }

    const correct =
      question.answer.toUpperCase() ===
      String(answer).toUpperCase().replace(/[^A-Z]/g, "");

    return NextResponse.json({ correct });
  } catch (e) {
    console.error("Quick game check error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}