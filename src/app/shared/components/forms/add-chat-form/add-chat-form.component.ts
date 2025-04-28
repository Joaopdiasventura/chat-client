import { Component, inject, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { User } from '../../../../core/models/user';
import { ChatService } from '../../../../core/services/chat/chat.service';
import { HttpErrorResponse } from '@angular/common/http';
import { AccessInputComponent } from '../../inputs/access-input/access-input.component';
import { CreateChatDto } from '../../../dto/chat/create-chat.dto';
import { ButtonComponent } from '../../button/button.component';
import { ModalComponent } from '../../modals/modal/modal.component';
import { LoadingComponent } from '../../loading/loading/loading.component';
import { Router } from '@angular/router';

@Component({
  selector: 'add-chat-form',
  imports: [
    FormsModule,
    AccessInputComponent,
    ButtonComponent,
    ModalComponent,
    LoadingComponent,
  ],
  templateUrl: './add-chat-form.component.html',
  styleUrl: './add-chat-form.component.scss',
})
export class AddChatFormComponent {
  @Input() public currentUser!: User | null;
  @Input() public loadAllChats!: (user: string) => void;
  @Input() public declineInvite!: (id: string) => void;

  public isLoading: boolean = false;

  public createChatDto: CreateChatDto = {
    name: '',
    users: [''],
  };

  public modalConfig = {
    isVisible: false,
    title: '',
    children: '',
    onClose: () => {},
  };

  private chatService = inject(ChatService);

  public addUser(): void {
    if (this.createChatDto.users.length >= 3) {
      this.modalConfig = {
        isVisible: true,
        title: 'LIMITE DE USUÁRIOS ATINGIDO',
        children: 'Você pode adicionar no máximo 3 participantes',
        onClose: () => (this.modalConfig.isVisible = false),
      };
      return;
    }
    this.createChatDto.users.push('');
  }

  public removeUser(i: number): void {
    this.createChatDto.users.splice(i, 1);
  }

  public onSubmit(): void {
    this.createChatDto.users = this.createChatDto.users.filter(
      (u) => u.length > 0
    );
    if (this.createChatDto.users.length == 0) {
      this.createChatDto.users.push('');
      return;
    }
    this.isLoading = true;
    this.createChatDto.users.unshift(this.currentUser?.email!);
    this.chatService.create(this.createChatDto).subscribe({
      next: () => {
        this.modalConfig = {
          isVisible: true,
          title: 'CONVERSA INICIADA COM SUCESSO',
          children:
            (this.createChatDto.users.length > 1
              ? 'todos os participantes receberam um email de convite'
              : 'seu novo contato recebeu um email de convite') +
            ', enquanto o convite não for aceito a conversa terá seu nome e somente você poderá enviar mensagens',
          onClose: () => (this.modalConfig.isVisible = false),
        };
        this.createChatDto.name = '';
        this.createChatDto.users = [''];
        this.loadAllChats(this.currentUser?._id!);
        this.isLoading = false;
      },
      error: (error: HttpErrorResponse) => {
        this.modalConfig = {
          isVisible: true,
          title: 'ERRO AO INICIAR CONVERSA',
          children:
            typeof error.error.message == 'string'
              ? error.error.message
              : error.error.message[0],
          onClose: () => (this.modalConfig.isVisible = false),
        };
        this.createChatDto.users.shift();
        this.isLoading = false;
      },
    });
  }
}
