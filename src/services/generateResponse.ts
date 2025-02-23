import { ChatMessages } from "@/@types";

export const generateResponse = async (question: string, messages?: ChatMessages[]): Promise<string> => {
  try {
    const response = await fetch("/api/v1/kyoto", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        question: question,
        history: messages || [],
      }),
    });

    const data = await response.json();
    return data.text.trim();
  } catch (error) {
    console.error("Erro ao gerar título:", error);
    return "Chat sem título"; // Fallback caso a API falhe
  }
};
