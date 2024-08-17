import {
  WebSocketGateway,
  MessageBody,
  SubscribeMessage,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
// @WebSocketGateway(8001)
export class AppGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;
  private logger: Logger = new Logger('AppGateway');

  afterInit(server: Server) {
    this.logger.log('Init');
  }

  handleConnection(client: Socket, ...args: any[]) {
    this.logger.log(`CLIENT IS CONNECTED: ${client.id}`);
    client.emit('connection', 'Successfully connected');
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`*****CLIENT IS DISCONNECTED: ${client.id}`);
  }

  @SubscribeMessage('test')
  sendMessage(@MessageBody() data, @ConnectedSocket() socket: Socket) {
    console.log('DATA SOCKET.IO', data);
    socket.emit('chat', "Salut j'ai bien reçu ton message!");
  }
}
