import { User } from './user';

export interface Chat {
  _id: string;
  name?: string;
  users: string[] | User[];
  createdAt: Date;
  updatedAt: Date;
}
