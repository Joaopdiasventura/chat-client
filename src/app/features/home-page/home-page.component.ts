import { Component, inject, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { AuthService } from '../../core/services/auth/auth.service';
import { ChatService } from '../../core/services/chat/chat.service';
import { MessageService } from '../../core/services/message/message.service';
import { SocketService } from '../../core/services/socket/socket.service';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { AsideComponent } from '../../shared/components/aside/aside.component';
import { MainComponent } from '../../shared/components/main/main.component';
import { LoadingComponent } from '../../shared/components/loading/loading/loading.component';
import { User } from '../../core/models/user';
import { Chat } from '../../core/models/chat';
import { Message } from '../../core/models/message';
import { InviteService } from '../../core/services/invite/invite.service';
import { Invite } from '../../core/models/invite';
import { Socket } from 'socket.io-client';

@Component({
  selector: 'app-home-page',
  imports: [HeaderComponent, AsideComponent, MainComponent, LoadingComponent],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.scss',
})
export class HomePageComponent implements OnInit {
  public asideIsLoading: boolean = false;
  public mainIsLoading: boolean = false;
  public addingChat: boolean = false;
  public findingInvites: boolean = false;
  public currentUser: User | null = null;
  public chats: Array<{ chat: Chat; message: Message }> = [];
  public currentChatId: string = '';
  public currentCallId: string = '';
  public currentChat!: Chat;
  public messagesMap: Map<string, Message[]> = new Map<string, Message[]>();
  public invites: Invite[] = [];

  private readonly authService: AuthService = inject(AuthService);
  private readonly chatService: ChatService = inject(ChatService);
  private readonly messageService: MessageService = inject(MessageService);
  private readonly inviteService: InviteService = inject(InviteService);
  private readonly route: ActivatedRoute = inject(ActivatedRoute);
  private readonly socketService: SocketService = inject(SocketService);

  private socket: Socket | null = null;

  public ngOnInit(): void {
    this.authService.connectUser().subscribe((user: User | null): void => {
      this.handleUserChange(user);
    });
  }

  public get currentMessages(): Message[] {
    return this.currentChat?._id
      ? this.messagesMap.get(this.currentChat._id) ?? []
      : [];
  }

  public findMessages(chatId: string): void {
    if (this.messagesMap.has(chatId)) return;
    this.mainIsLoading = true;
    this.messageService.findManyByChat(chatId).subscribe({
      next: (messages: Message[]) => this.messagesMap.set(chatId, messages),
      complete: () => (this.mainIsLoading = false),
    });
  }

  public loadAllChats(userId: string): void {
    this.asideIsLoading = true;
    forkJoin({
      chats: this.chatService.findByUser(userId),
      latest: this.messageService.findLastest(userId),
    }).subscribe({
      next: ({ chats, latest }) => {
        this.chats = chats.map((chat: Chat) => ({
          chat,
          message: latest.find((m) => m.chat == chat._id)!,
        }));
        this.sortChats();
        if (this.currentChatId) {
          this.findMessages(this.currentChatId);
          this.currentChat = this.chats.find(
            (c) => c.chat._id == this.currentChatId
          )?.chat!;
        }
      },
      complete: () => (this.asideIsLoading = false),
    });
  }

  public declineInvite(id: string): void {
    console.log(id);

    this.invites = this.invites.filter((i) => i._id != id);
    this.inviteService.delete(id).subscribe();
  }

  private handleUserChange(user: User | null): void {
    if (!user) return;
    if ('Notification' in window) Notification.requestPermission();
    this.currentUser = user;
    this.socket = this.socketService.connect({ email: user.email! });
    this.socket.on('account-validated', () => this.onAccountValidated());
    this.socket.on('message', (message: Message) =>
      this.onMessageCreated(message)
    );
    this.socket.on('invite-created', (invite: Invite) =>
      this.onInviteCreated(invite)
    );
    this.loadAllChats(user._id);
    this.loadInvites(user._id);
    this.route.queryParamMap.subscribe((params: ParamMap): void => {
      this.addingChat = params.has('addChat');
      this.findingInvites = params.has('findInvites');
      this.currentChatId = params.get('chat')!;
      this.currentCallId = params.get('call')!;
      this.currentChat = this.chats.find(
        (c) => c.chat._id == this.currentChatId
      )?.chat!;
    });
  }

  private loadInvites(user: string): void {
    this.asideIsLoading = true;
    this.inviteService.findByUser(user).subscribe({
      next: (i) => (this.invites = i),
      complete: () => (this.asideIsLoading = false),
    });
  }

  private onMessageCreated(message: Message): void {
    const chatId = (message.chat as Chat)._id;
    const existing = this.messagesMap.get(chatId) ?? [];
    if ((message.user as User)._id != this.currentUser?._id)
      this.notify(message);
    this.messagesMap.set(chatId, [...existing, message]);
    const idx = this.chats.findIndex((c) => c.chat._id == chatId);
    this.chats[idx].message = message;
    this.sortChats();
  }

  private onInviteCreated(invite: Invite): void {
    this.invites.unshift(invite);
  }

  private notify(message: Message): void {
    if (Notification.permission != 'granted') return;
    const title = `Nova mensagem de ${(message.user as User).name}`;
    const options: NotificationOptions = {
      body: message.content,
      icon: '',
    };
    new Notification(title, options);
  }

  private onAccountValidated(): void {
    console.log('opa');
    if (!this.currentUser) return;
    this.authService
      .connectUser({ ...this.currentUser, isVerified: true })
      .subscribe(() => {
        if (this.currentUser) this.currentUser.isVerified = true;
      });
  }

  private sortChats(): void {
    this.chats.sort(
      (a, b): number =>
        new Date(b.message?.createdAt ?? b.chat.createdAt).getTime() -
        new Date(a.message?.createdAt ?? a.chat.createdAt).getTime()
    );
  }
}
