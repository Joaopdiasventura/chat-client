import { Component, inject, Input, OnInit, OnDestroy } from '@angular/core';
import { User } from '../../../core/models/user';
import { SocketService } from '../../../core/services/socket/socket.service';
import { Socket } from 'socket.io-client';
import { ButtonComponent } from '../button/button.component';
import { Router } from '@angular/router';

interface VideoStatus {
  enabled: boolean;
  name?: string;
  color?: string;
}

@Component({
  selector: 'call',
  imports: [ButtonComponent],
  templateUrl: './call.component.html',
})
export class CallComponent implements OnInit, OnDestroy {
  @Input() public currentCallId!: string;
  @Input() public currentUser!: User | null;

  private socket!: Socket;
  private peers: { [id: string]: RTCPeerConnection } = {};
  private remoteStreams: { [id: string]: MediaStream } = {};
  private remoteVideoStatus: { [id: string]: VideoStatus } = {};
  private localStream!: MediaStream;
  private speakingIntervals: { [id: string]: number } = {};
  public showCamera = false;

  private socketService = inject(SocketService);
  private router = inject(Router);

  public ngOnInit(): void {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        this.localStream = stream;
        this.localStream
          .getVideoTracks()
          .forEach((t) => (t.enabled = this.showCamera));
        this.addPlaceholder(
          'local',
          this.currentUser?.name || '',
          this.currentUser?.color || ''
        );
        const localStatus: VideoStatus = {
          enabled: this.showCamera,
          name: this.currentUser?.name || '',
          color: this.currentUser?.color || '',
        };
        this.updateStream('local', localStatus, stream);

        this.socket = this.socketService.connect({
          name: this.currentUser?.name,
          email: this.currentUser?.email,
          call: this.currentCallId,
        });

        this.socket.emit('toggle-video', { ...localStatus });

        this.socket.on('existing-user', (userId) => {
          this.addPlaceholder(userId, '', '');
          this.connectTo(userId, true);
        });

        this.socket.on('user-connected', (userId) => {
          this.addPlaceholder(userId, '', '');
          this.connectTo(userId, false);
        });

        this.socket.on('offer', async (d) => {
          const peer = this.createPeer(d.from);
          await peer.setRemoteDescription(new RTCSessionDescription(d.offer));
          const ans = await peer.createAnswer();
          await peer.setLocalDescription(ans);
          this.socket.emit('answer', { answer: ans, to: d.from });
        });

        this.socket.on('answer', async (d) => {
          await this.peers[d.from].setRemoteDescription(
            new RTCSessionDescription(d.answer)
          );
        });

        this.socket.on('candidate', (d) =>
          this.peers[d.from].addIceCandidate(new RTCIceCandidate(d.candidate))
        );

        this.socket.on('user-disconnected', (userId) => {
          this.peers[userId]?.close();
          delete this.peers[userId];
          delete this.remoteStreams[userId];
          delete this.remoteVideoStatus[userId];
          this.clearSpeaking(userId);
          this.removePlaceholder(userId);
        });

        this.socket.on(
          'toggle-video',
          (d: VideoStatus & { userId: string }) => {
            this.remoteVideoStatus[d.userId] = {
              enabled: d.enabled,
              name: d.name,
              color: d.color,
            };
            const stream = this.remoteStreams[d.userId];
            if (stream) {
              this.updateStream(
                d.userId,
                this.remoteVideoStatus[d.userId],
                stream
              );
            }
          }
        );
      });
  }

  public ngOnDestroy(): void {
    if (this.socket) this.socket.disconnect();
    Object.values(this.peers).forEach((p) => p.close());
    Object.keys(this.speakingIntervals).forEach((id) =>
      clearInterval(this.speakingIntervals[id])
    );
    if (this.localStream) {
      this.localStream.getTracks().forEach((t) => t.stop());
      this.removePlaceholder('local');
    }
  }

  public toggleCamera(): void {
    this.showCamera = !this.showCamera;
    this.localStream
      .getVideoTracks()
      .forEach((t) => (t.enabled = this.showCamera));
    const localStatus: VideoStatus = {
      enabled: this.showCamera,
      name: this.currentUser?.name || '',
      color: this.currentUser?.color || '',
    };
    this.socket.emit('toggle-video', { ...localStatus });
    this.updateStream('local', localStatus, this.localStream);
  }

  public goToChat() {
    this.router.navigate([], { queryParams: { chat: this.currentCallId } });
  }

  private connectTo(userId: string, initiator: boolean): void {
    const peer = this.createPeer(userId);
    if (initiator) {
      peer
        .createOffer()
        .then((o) =>
          peer
            .setLocalDescription(o)
            .then(() => this.socket.emit('offer', { offer: o, to: userId }))
        );
    }
  }

  private createPeer(userId: string): RTCPeerConnection {
    const peer = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
    });
    this.peers[userId] = peer;
    this.localStream
      .getTracks()
      .forEach((track) => peer.addTrack(track, this.localStream));
    peer.onicecandidate = (e) => {
      if (e.candidate)
        this.socket.emit('candidate', { candidate: e.candidate, to: userId });
    };
    peer.ontrack = (e) => {
      this.remoteStreams[userId] = e.streams[0];
      const status = this.remoteVideoStatus[userId] || {
        enabled: false,
        name: '',
        color: '',
      };
      this.addPlaceholder(userId, status.name || '', status.color || '');
      this.updateStream(userId, status, e.streams[0]);
    };
    return peer;
  }

  private addPlaceholder(id: string, name: string, color: string): void {
    if (document.getElementById(`container-${id}`)) return;
    const grid = document.getElementById('videos-container')!;
    const container = document.createElement('div');
    container.id = `container-${id}`;
    container.className = 'video-container ' + color;

    const video = document.createElement('video');
    video.id = `video-${id}`;
    video.autoplay = true;
    video.playsInline = true;
    container.appendChild(video);

    const placeholder = document.createElement('div');
    placeholder.id = `placeholder-${id}`;
    placeholder.textContent = name;
    placeholder.className = 'placeholder';
    container.appendChild(placeholder);

    grid.appendChild(container);
  }

  private updateStream(
    id: string,
    status: VideoStatus,
    stream: MediaStream
  ): void {
    const container = document.getElementById(`container-${id}`)!;
    const videoEl = document.getElementById(`video-${id}`) as HTMLVideoElement;
    const placeholder = document.getElementById(
      `placeholder-${id}`
    ) as HTMLDivElement;
    videoEl.muted = id == 'local';
    videoEl.srcObject = stream;
    placeholder.textContent = status.name || '';
    placeholder.className = 'placeholder';
    if (status.enabled) {
      container.classList.remove(status.color!);
      placeholder.classList.add('disable');
      videoEl.classList.remove('disable');
      videoEl.classList.add('enable');
      placeholder.classList.remove('enable');
    } else {
      container.classList.add(status.color!);
      videoEl.classList.add('disable');
      placeholder.classList.remove('disable');
      placeholder.classList.add('enable');
      videoEl.classList.remove('enable');
    }

    this.monitorSpeaking(id, stream);
  }

  private removePlaceholder(id: string): void {
    const c = document.getElementById(`container-${id}`);
    if (c) c.remove();
  }

  private monitorSpeaking(id: string, stream: MediaStream): void {
    if (this.speakingIntervals[id]) return;
    const audioCtx = new AudioContext();
    const src = audioCtx.createMediaStreamSource(stream);
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 256;
    src.connect(analyser);
    const data = new Uint8Array(analyser.frequencyBinCount);
    const container = document.getElementById(`container-${id}`)!;
    this.speakingIntervals[id] = window.setInterval(() => {
      analyser.getByteTimeDomainData(data);
      let sum = 0;
      for (const v of data) sum += (v - 128) ** 2;
      const rms = Math.sqrt(sum / data.length);
      if (rms > 1) container.classList.add('speaking');
      else container.classList.remove('speaking');
    }, 100);
  }

  private clearSpeaking(id: string): void {
    if (this.speakingIntervals[id]) clearInterval(this.speakingIntervals[id]);
    delete this.speakingIntervals[id];
  }
}
