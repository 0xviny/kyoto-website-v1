import { NextResponse } from "next/server";

interface RequestCount {
  count: number;
  timestamp: number;
  blockedUntil?: number;
}

const requestCounts: { [key: string]: RequestCount } = {};
const RATE_LIMIT = 15;
const RATE_LIMIT_WINDOW = 60 * 1000;
const BLOCK_DURATION = 24 * 60 * 60 * 1000;

const allowedOrigins = [
  "https://www.kyotobot.site",
  "https://kyotobot.site",
  "https://kyotobot.vercel.app",
  "http://localhost:3000",
];

export function applyRateLimit(userKey: string, req: Request) {
  const currentTime = Date.now();
  const origin = req.headers.get("origin") || req.headers.get("referer");

  // Verifica se a origem é permitida
  if (!origin || !allowedOrigins.some(allowedOrigin => origin.startsWith(allowedOrigin))) {
    return NextResponse.json(
      { response: "Acesso negado." },
      { status: 403 }
    );
  }

  if (!requestCounts[userKey]) {
    requestCounts[userKey] = { count: 0, timestamp: currentTime };
  }

  if (requestCounts[userKey].blockedUntil && currentTime < requestCounts[userKey].blockedUntil) {
    return NextResponse.json(
      { response: `Você está bloqueado até ${new Date(requestCounts[userKey].blockedUntil).toLocaleString()}. Tente novamente mais tarde.` },
      { status: 429 }
    );
  }

  const timePassed = currentTime - requestCounts[userKey].timestamp;

  if (timePassed > RATE_LIMIT_WINDOW) {
    requestCounts[userKey] = { count: 1, timestamp: currentTime };
  } else {
    if (requestCounts[userKey].count >= RATE_LIMIT) {
      // Bloqueia o usuário por 1 dia
      requestCounts[userKey].blockedUntil = currentTime + BLOCK_DURATION;
      return NextResponse.json(
        { response: "Limite de perguntas excedido. Você foi bloqueado por 1 dia." },
        { status: 429 }
      );
    }
    requestCounts[userKey].count++;
  }

  return null;
}
