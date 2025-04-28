import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Chat } from '../../../core/models/chat';
import { Message } from '../../../core/models/message';
import { User } from '../../../core/models/user';
import { FormsModule } from '@angular/forms';
import { CreateMessageDto } from '../../dto/message/create-message.dto';
import { ChatComponent } from '../chat/chat.component';
import { AddChatFormComponent } from '../forms/add-chat-form/add-chat-form.component';
import { InviteListComponent } from '../lists/invite-list/invite-list.component';
import { CallComponent } from '../call/call.component';
import { Invite } from '../../../core/models/invite';

@Component({
  selector: 'app-main',
  imports: [
    FormsModule,
    ChatComponent,
    CallComponent,
    AddChatFormComponent,
    InviteListComponent,
  ],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss',
})
export class MainComponent implements OnChanges {
  @Input() public currentCallId!: string;
  @Input() public currentUser!: User | null;
  @Input() public currentChat!: Chat;
  @Input() public currentMessages: Message[] = [];
  @Input() public invites: Invite[] = [];

  @Input() public declineInvite!: (id: string) => void;
  @Input() public loadAllChats!: (user: string) => void;

  @Input() public addingChat: boolean = false;
  @Input() public findingInvites: boolean = false;

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['currentUser'] && this.currentUser)
      this.createMessageDto.user = this.currentUser._id;

    if (changes['currentChat'] && this.currentChat)
      this.createMessageDto.chat = this.currentChat._id;

    if (changes['currentMessages'] && this.currentMessages.length > 0)
      this.scrollToLastMessage();

    if (changes['currentCallId']) console.log(this.currentCallId);
  }

  public createMessageDto: CreateMessageDto = {
    user: this.currentUser?._id || '',
    chat: this.currentChat?._id || '',
    content: '',
  };

  private scrollToLastMessage(): void {
    const msgs = this.currentMessages;
    if (msgs.length < 2) return;
    setTimeout(() => {
      const last = msgs[msgs.length - 1];
      const lastEl = document.getElementById(`message-${last._id}`);
      if (!lastEl) return;
      lastEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      lastEl.focus({ preventScroll: true });
    }, 0);
  }
}
