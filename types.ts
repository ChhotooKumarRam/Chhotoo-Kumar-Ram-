
export enum Theme {
  Light = 'light',
  Dark = 'dark',
}

export type Sender = 'user' | 'bot';

export interface Message {
  id: string;
  text: string;
  sender: Sender;
  image?: string; // base64 image data
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
}
