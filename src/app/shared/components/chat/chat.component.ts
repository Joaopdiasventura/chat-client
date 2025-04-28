import {
  Component,
  inject,
  Input,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { Chat } from '../../../core/models/chat';
import { Message } from '../../../core/models/message';
import { User } from '../../../core/models/user';
import { MessageService } from '../../../core/services/message/message.service';
import { CreateMessageDto } from '../../dto/message/create-message.dto';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'chat',
  imports: [FormsModule, CommonModule],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss',
})
export class ChatComponent implements OnChanges {
  @Input() public currentUser!: User | null;
  @Input() public currentChat!: Chat;
  @Input() public messages: Message[] = [];

  public createMessageDto: CreateMessageDto = {
    user: this.currentUser?._id || '',
    chat: this.currentChat?._id || '',
    content: '',
  };

  private autoScroll = true;
  
  private readonly messageService = inject(MessageService);
  private readonly router = inject(Router);

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['currentUser'] && this.currentUser) {
      this.createMessageDto.user = this.currentUser._id;
    }
    if (changes['currentChat'] && this.currentChat) {
      this.createMessageDto.chat = this.currentChat._id;
    }
    if (
      changes['messages'] &&
      !changes['messages'].firstChange &&
      this.messages.length > 1
    ) {
      this.scrollToLastMessage();
    }
  }

  public getUserInfo(user: User | string): User {
    return user as User;
  }

  public getMessageColor(message: Message): string {
    return (message.user as User)._id !== this.currentUser?._id
      ? (message.user as User).color
      : 'user';
  }

  public get chatName(): string {
    const users = this.currentChat.users as User[];
    if (this.currentChat.name) {
      return this.currentChat.name;
    }
    const other = users.find((u) => u._id !== this.currentUser?._id);
    return other?.name ?? users[0].name;
  }

  public sendMessage(): void {
    if (!this.createMessageDto.content) return;
    this.messageService.create(this.createMessageDto).subscribe((m) => {
      this.createMessageDto.content = '';
      m.user = this.currentUser!;
      m.chat = this.currentChat!;
    });
  }

  public goToCall(): void {
    this.router.navigate([], { queryParams: { call: this.currentChat._id } });
  }

  public onScroll(event: Event): void {
    const container = event.target as HTMLElement;

    const atBottom =
      container.scrollTop + container.clientHeight >=
      container.scrollHeight - 10;
    this.autoScroll = atBottom;
  }

  private scrollToLastMessage(): void {
    if (!this.autoScroll) return;
    const last = this.messages[this.messages.length - 1];
    if (!last) return;
    setTimeout(() => {
      const lastEl = document.getElementById('message-' + last._id);
      if (lastEl) lastEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }
}
