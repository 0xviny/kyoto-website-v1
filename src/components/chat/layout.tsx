"use client";

import { ChatProps } from "@/@types";

import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/cjs/styles/prism";

import { useEffect, useState } from "react";
import { Copy, CopyCheckIcon, Edit3 } from "lucide-react";
import { generateQuestions } from "@/services/generateQuestions";
import { generateResponse } from "@/services/generateResponse";
import { usePathname } from "next/navigation";

export default function ChatLayout({ messages, isLoading, onSendMessage }: ChatProps) {
  const [copyCode, setCopyCode] = useState<number | null>(null);
  const [randomQuestion, setRandomQuestion] = useState<string[]>([]);
  const [editMessageIndex, setEditMessageIndex] = useState<number | null>(null);
  const [editedMessage, setEditedMessage] = useState<string>("");

  const currentChatId = usePathname().split("/")[2];

  useEffect(() => {
    const loadQuestions = async () => {
      const generatedQuestions = await generateQuestions();
      console.log("Perguntas geradas:", generatedQuestions);
      setRandomQuestion(generatedQuestions);
    };

    loadQuestions();
  }, []);

  const handleCopyCode = (code: string, index: number) => {
    navigator.clipboard.writeText(code);
    setCopyCode(index);
    setTimeout(() => {
      setCopyCode(null);
    }, 2000);
  };

  const handleEditMessage = (index: number, message: string) => {
    setEditMessageIndex(index);
    setEditedMessage(message);
  };

  const handleSaveEditedMessage = async (index: number) => {
    if (editedMessage.trim() !== "") {
      const updatedMessages = [...messages]; // Criar uma cópia do array
      updatedMessages[index].parts[0] = editedMessage; // Atualizar a mensagem editada

      const botResponse = await generateResponse(editedMessage);

      if (updatedMessages[index + 1] && updatedMessages[index + 1].role === "model") {
        updatedMessages[index + 1].parts[0] = botResponse;
      } else {
        updatedMessages.push({
          role: "model",
          parts: [botResponse],
        });
      }

      // Salvar no localStorage
      localStorage.setItem(`chat_message/${currentChatId}`, JSON.stringify(updatedMessages));

      setEditMessageIndex(null);
    }
  };

  return (
    <div className="flex flex-col items-center justify-start mt-10 mb-24 p-3 md:p-5">
      <div className="space-y-10 w-full max-w-[800px]">
        {messages.length === 0 && !isLoading ? (
          <div className="flex flex-col items-center justify-center">
            <img src="/chatbot-icon.png" alt="chatbot" width={256} height={256} />
            <p className="text-white text-center mt-10 text-2xl">
              👋 Olá, como posso te ajudar hoje?
            </p>

            <div className="flex justify-center flex-wrap gap-3 mt-10">
              {randomQuestion.map((question, index) => (
                <button
                  key={index}
                  onClick={() => onSendMessage(question)}
                  className="bg-zinc-800 text-white p-4 w-[300px] rounded-sm text-left hover:shadow-lg hover:bg-zinc-700 transition"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg, index) => (
            <div
              key={index}
              className={`relative flex ${
                msg.role === "model" ? "justify-start" : "justify-end"
              } group`}
            >
              {msg.role === "model" && (
                <img src="/chatbot-icon.png" alt="chatbot" className="w-10 h-10" />
              )}
              <div
                className={`flex items-center gap-3 text-white py-3 px-4 rounded-lg ${
                  msg.role === "model" ? "bg-transparent" : "bg-neutral-600 max-w-[750px]"
                }`}
              >
                {editMessageIndex === index ? (
                  <input
                    type="text"
                    value={editedMessage}
                    onChange={(e) => setEditedMessage(e.target.value)}
                    onBlur={() => handleSaveEditedMessage(index)}
                    className="bg-neutral-700 text-white rounded px-2 py-2 outline-none"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleSaveEditedMessage(index);
                      }
                    }}
                  />
                ) : (
                  <ReactMarkdown
                    className="space-y-5 text-[16px] md:text-[18px]"
                    components={{
                      code({ className, children, ...props }) {
                        const match = /language-(\w+)/.exec(className || "");
                        const codeString = String(children).replace(/\n$/, "");

                        return match ? (
                          <div className="relative">
                            <SyntaxHighlighter
                              style={oneDark as typeof oneDark}
                              language={match ? match[1] : undefined}
                              PreTag="div"
                            >
                              {codeString}
                            </SyntaxHighlighter>
                            <button
                              onClick={() => handleCopyCode(codeString, index)}
                              className="absolute top-2 right-2 p-1 bg-neutral-700 text-white rounded"
                            >
                              {copyCode === index ? (
                                <CopyCheckIcon className="w-5 h-5" />
                              ) : (
                                <Copy className="w-5 h-5" />
                              )}
                            </button>
                          </div>
                        ) : (
                          <code className={className} {...props}>
                            {children}
                          </code>
                        );
                      },
                    }}
                  >
                    {Array.isArray(msg.parts) && msg.parts.length > 0 ? msg.parts[0] : ""}
                  </ReactMarkdown>
                )}
                {msg.role === "model" && (
                  <button
                    onClick={() =>
                      handleCopyCode(
                        Array.isArray(msg.parts) && msg.parts.length > 0 ? msg.parts[0] : "",
                        index
                      )
                    }
                    className="absolute mt-2 p-2 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ bottom: "-2.5rem" }}
                  >
                    {copyCode ? (
                      <CopyCheckIcon className="w-6 h-6" />
                    ) : (
                      <Copy className="w-6 h-6" />
                    )}
                  </button>
                )}
                {msg.role !== "model" && index === messages.length - 2 && (
                  <button
                    onClick={() =>
                      handleEditMessage(index, Array.isArray(msg.parts) ? msg.parts[0] : "")
                    }
                    className="absolute right-0 mt-2 p-2 rounded-full text-white"
                    style={{ bottom: "-2.5rem" }}
                  >
                    <Edit3 className="w-6 h-6" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div className={`relative flex justify-start group`}>
            <img src="/chatbot-icon.png" alt="chatbot" className="w-10 h-10" />
            <div
              className={`flex items-center gap-3 text-white py-3 px-4 rounded-full bg-transparent`}
            >
              <ReactMarkdown className="space-y-5 text-[18px]">
                Carregando sua resposta, por favor aguarde...
              </ReactMarkdown>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
