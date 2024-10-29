import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';

@WebSocketGateway()
export class SignalingGateway {
  @SubscribeMessage('join')
  handleJoin(@MessageBody() room: string, @ConnectedSocket() client: Socket) {
    client.join(room);
    client.broadcast.to(room).emit('user-joined', { id: client.id });
  }

  @SubscribeMessage('offer')
  handleOffer(@MessageBody() data: any, @ConnectedSocket() client: Socket) {
    client.broadcast
      .to(data.room)
      .emit('offer', { offer: data.offer, id: client.id });
  }

  @SubscribeMessage('answer')
  handleAnswer(@MessageBody() data: any, @ConnectedSocket() client: Socket) {
    client.broadcast
      .to(data.room)
      .emit('answer', { answer: data.answer, id: client.id });
  }

  @SubscribeMessage('ice-candidate')
  handleIceCandidate(
    @MessageBody() data: any,
    @ConnectedSocket() client: Socket,
  ) {
    client.broadcast
      .to(data.room)
      .emit('ice-candidate', { candidate: data.candidate, id: client.id });
  }
}
