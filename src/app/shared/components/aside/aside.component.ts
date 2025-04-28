import { Component, inject, Input } from '@angular/core';
import { Chat } from '../../../core/models/chat';
import { User } from '../../../core/models/user';
import { Message } from '../../../core/models/message';
import { Router } from '@angular/router';

@Component({
  selector: 'app-aside',
  imports: [],
  templateUrl: './aside.component.html',
  styleUrl: './aside.component.scss',
})
export class AsideComponent {
  @Input() public currentUser: User | null = null;
  @Input() public chatsAndMessages: { chat: Chat; message: Message }[] = [];
  @Input() public invitesLength: number = 0;
  @Input() public findMessages!: (chat: string) => void;

  private router = inject(Router);

  public getChatName(chat: Chat): string {
    return chat.name
      ? chat.name
      : (chat.users as User[])[0]._id == this.currentUser?._id
      ? (chat.users as User[])[1]
        ? (chat.users as User[])[1].name
        : (chat.users as User[])[0].name
      : (chat.users as User[])[0].name;
  }

  public getChatColor(chat: Chat, message?: Message): string {
    if (chat.name && message)
      return (message.user as User)._id == this.currentUser?._id
        ? this.currentUser?.color!
        : (message.user as User).color;

    return (
      (chat.users as User[]).find((u) => u._id != this.currentUser?._id)
        ?.color ?? (chat.users as User[])[0].color
    );
  }

  public getUserInfo(message: Message): User {
    if (message && message.user) return message.user as User;
    return {} as unknown as User;
  }

  public getMessageContent(message: Message): string {
    return message ? message.content : '';
  }

  public getChatInfo(chat: Chat, message: Message): string {
    return message
      ? `${(message.user as User).name} - ${(message.user as User).email}`
      : (chat.users as User[])[0]._id == this.currentUser?._id
      ? (chat.users as User[])[1]
        ? `${(chat.users as User[])[1].name} - ${
            (chat.users as User[])[1].email
          }`
        : `${(chat.users as User[])[0].name} - ${
            (chat.users as User[])[0].email
          }`
      : `${(chat.users as User[])[0].name} - ${
          (chat.users as User[])[0].email
        }`;
  }

  public addChat() {
    this.router.navigate([], { queryParams: { addChat: true } });
  }

  public goToInvite() {
    this.router.navigate([], { queryParams: { findInvites: true } });
  }

  public goToChat(chat: string) {
    this.findMessages(chat);
    this.router.navigate([], { queryParams: { chat } });
  }
}
