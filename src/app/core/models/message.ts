import { Chat } from './chat';
import { User } from './user';

export interface Message {
  _id: string;
  user: string | User;
  chat: string | Chat;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}
