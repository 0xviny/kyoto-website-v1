import { NextRequest, NextResponse } from "next/server";

import { applyRateLimit } from "@/utils/rateLimit";
import { connectionKyoto } from "@/services/kyotoService";

import { ChatMessages } from "@/@types";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const question = searchParams.get("question");

  if (!question) {
    return NextResponse.json({ response: "Você precisa enviar uma pergunta!" }, { status: 400 });
  }

  return await processQuestion(question, []);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { question, history } = body;

  if (!question) {
    return NextResponse.json(
      { response: "Você precisa enviar uma pergunta e o histórico!" },
      { status: 400 }
    );
  }

  return await processQuestion(question, history);
}

async function processQuestion(question: string, history: ChatMessages[]) {
  const rateLimitResponse = applyRateLimit("user");
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const response = await connectionKyoto(question, history);
    return NextResponse.json({ text: response });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ response: "Erro ao processar a pergunta." }, { status: 500 });
  }
}
