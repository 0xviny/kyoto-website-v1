import { NextResponse } from "next/server";

interface RequestCount {
  count: number;
  timestamp: number;
}

const requestCounts: { [key: string]: RequestCount } = {};
const RATE_LIMIT = 15;
const RATE_LIMIT_WINDOW = 60 * 1000;

export function applyRateLimit(userKey: string) {
  const currentTime = Date.now();

  if (!requestCounts[userKey]) {
    requestCounts[userKey] = { count: 0, timestamp: currentTime };
  }

  const timePassed = currentTime - requestCounts[userKey].timestamp;

  if (timePassed > RATE_LIMIT_WINDOW) {
    requestCounts[userKey] = { count: 1, timestamp: currentTime };
  } else {
    if (requestCounts[userKey].count >= RATE_LIMIT) {
      return NextResponse.json(
        { response: "Limite de perguntas excedido. Tente mais tarde." },
        { status: 429 }
      );
    }
    requestCounts[userKey].count++;
  }

  return null; // Sem erro, pode continuar
}
