export interface ChatContext {
  messages: ChatMessages[];
  addMessages: (message: ChatMessages) => void;
  setMessages: (messages: ChatMessages[]) => void;
}

export interface Message {
  sender: "user" | "model";
  text: string;
}

export interface ChatMessages {
  role: "user" | "model";
  parts: [string];
}

export interface ChatSession {
  id: string;
  history: Message[];
}

export interface ChatProps {
  messages: ChatMessages[];
  isLoading: boolean;
  randomQuestion?: string[];
  onSendMessage: (message: string) => void;
}
