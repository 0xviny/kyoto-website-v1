export const generateQuestions = async (): Promise<string[]> => {
    try {
      const response = await fetch("/api/v1/kyoto", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question:
            "Responda apenas com um JSON válido contendo um array de 4 perguntas curtas para o usuário, sem texto extra. Exemplo para estrutura da resposta: [\"📚 Qual livro você está lendo atualmente?\", \"🎯 Quais são seus objetivos para esta semana?\", \"🍕 Qual sua comida favorita?\", \"🌍 Qual lugar do mundo você gostaria de visitar?\"]",
          history: [],
        }),
      });
  
      const data = await response.json();
      
      console.log("Dados retornados:", data);
  
      const cleanedText = data.text.replace(/```json|```/g, "").trim();
  
      const questions = JSON.parse(cleanedText);
  
      if (!Array.isArray(questions) || questions.some((q) => typeof q !== "string")) {
        throw new Error("Formato de resposta inválido");
      }
  
      return questions;
    } catch (error) {
      console.error("Erro ao gerar perguntas:", error);
      return [
        "❓ Qual é a sua opinião sobre esse assunto?",
        "🤔 O que você acha que pode ser melhorado?",
        "🧠 Como podemos abordar isso de uma maneira diferente?",
        "📌 Qual é o principal desafio aqui?",
      ];
    }
  };
  