export interface User {
  _id: string;
  email: string;
  name: string;
  color: string;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}
