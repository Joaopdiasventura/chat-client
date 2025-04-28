import { Chat } from './chat';
import { User } from './user';

export interface Invite {
  _id: string;
  user: string | User;
  chat: string | Chat;
  createdAt: Date;
  updatedAt: Date;
}
