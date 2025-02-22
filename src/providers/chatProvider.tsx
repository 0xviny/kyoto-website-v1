'use client';

import { ChatContext, ChatMessages } from "@/@types";
import { createContext, ReactNode, useContext, useState } from "react";

const chatContext = createContext<ChatContext | undefined>(undefined);

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const [messages, setMessages] = useState<ChatMessages[]>([]);

  const addMessage = (message: ChatMessages) => {
    setMessages((prev) => [...prev, message]);
  };

  return (
    <chatContext.Provider value={{ messages, addMessages: addMessage, setMessages }}>
      {children}
    </chatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(chatContext);
  if (!context)
    throw new Error("[ChatProvider] - Error in useChat must be used within a ChatProvider.");

  return context;
};
