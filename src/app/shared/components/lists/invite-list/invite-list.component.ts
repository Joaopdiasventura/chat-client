import { Component, inject, Input, OnInit } from '@angular/core';
import { Message } from '../../../../core/models/message';
import { User } from '../../../../core/models/user';
import { InviteService } from '../../../../core/services/invite/invite.service';
import { Invite } from '../../../../core/models/invite';
import { Chat } from '../../../../core/models/chat';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../../button/button.component';
import { LoadingComponent } from '../../loading/loading/loading.component';
import { SocketService } from '../../../../core/services/socket/socket.service';
import { Socket } from 'socket.io-client';
import { Router } from '@angular/router';

@Component({
  selector: 'invite-list',
  imports: [CommonModule, ButtonComponent, LoadingComponent],
  templateUrl: './invite-list.component.html',
  styleUrl: './invite-list.component.scss',
})
export class InviteListComponent {
  @Input() public currentUser!: User | null;
  @Input() public loadAllChats!: (user: string) => void;
  @Input() public invites: Invite[] = [];
  @Input() public declineInvite!: (id: string) => void;

  public isLoading: boolean = false;

  private inviteService = inject(InviteService);
  private router = inject(Router);

  public getUserInfo(invite: Invite): User {
    return invite.user as User;
  }

  public getChatInfo(invite: Invite): Chat {
    return invite.chat as Chat;
  }

  public accept(id: string): void {
    this.isLoading = true;
    this.inviteService.accept(id).subscribe({
      next: (chat) => {
        this.loadAllChats(this.currentUser?._id!);
        this.invites = this.invites.filter((i) => i._id != id);
        this.router.navigate([], { queryParams: { chat: chat._id } });
      },
      complete: () => (this.isLoading = false),
    });
  }
}
