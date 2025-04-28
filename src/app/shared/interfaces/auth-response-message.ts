import { User } from '../../core/models/user';
import { ResponseMessage } from './reponse-message';

export interface AuthResponseMessage extends ResponseMessage {
  token: string;
  user: User;
}
