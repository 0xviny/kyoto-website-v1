import { ChatMessages } from "@/@types";

export const generateChatTitle = async (messages: ChatMessages[]): Promise<string> => {
  try {
    const response = await fetch("/api/v1/kyoto", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        question: "Crie um título curto e descritivo baseado nas mensagens do usuário deste chat, quero que mande apenas o nome do titulo em sua resposta.",
        history: messages,
      }),
    });

    const data = await response.json();
    return data.text.trim(); // Retorna o título gerado
  } catch (error) {
    console.error("Erro ao gerar título:", error);
    return "Chat sem título"; // Fallback caso a API falhe
  }
};
