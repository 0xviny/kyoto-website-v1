import { ChatMessages } from "@/@types";
import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from "@google/generative-ai";

export async function connectionKyoto(question: string, history: ChatMessages[]) {
  const setupClient = {
    model_name: "gemini-2.0-flash",
    personality:
      "Você é uma inteligência artificial versátil, capaz de abordar qualquer assunto de forma clara e eficaz. Sua personalidade é amigável e acessível, proporcionando uma experiência descontraída para os usuários. Utilize emojis para trazer emoção e leveza às suas respostas, especialmente em conversas mais informais. No entanto, saiba ser direta e objetiva quando necessário. Suas respostas devem ser claras, completas e precisas, com uma confiabilidade alta, para que os usuários possam sempre contar com você.",
    generative_config: {
      temperature: 1,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 8192,
    },
    safety_config: [
      { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
      {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_NONE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_NONE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_NONE,
      },
    ],
  };

  try {
    const kyoto_client = new GoogleGenerativeAI(process.env.API_TOKEN!);
    const model = kyoto_client.getGenerativeModel({
      model: setupClient.model_name,
      systemInstruction: setupClient.personality,
    });

    const app_chat = model.startChat({
      generationConfig: setupClient.generative_config,
      safetySettings: setupClient.safety_config,
      history: history.map((msg) => ({
        role: "user",
        parts: [{ text: msg.parts[0] }],
      })) as any,
    });

    const result = await app_chat.sendMessage(question);
    return result.response.text();
  } catch (error) {
    console.error(error);

    const result = await fetch("https://nyxgptv1.squareweb.app/gpt/conversa", {
      headers: { Authorization: `${process.env.API_NYX}`, "Content-Type": "application/json" },
      method: "POST",
      body: JSON.stringify({ pergunta: question, historico: history }),
    });

    const data = await result.json();
    return data.resposta;
  }
}
