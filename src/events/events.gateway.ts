import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Socket, Server } from 'socket.io';
import { ObjectId } from 'mongoose';

@WebSocketGateway()
export class EventsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private logger: Logger;
  private activeUsers;

  constructor() {
    this.logger = new Logger('AppGateway');
    this.activeUsers = new Map();
  }

  //61426923a2323b6308b5f5a7
  afterInit(server: Server) {
    this.logger.log('Init');
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);

    this.server.emit('msgToClient', 'Welcome to the server');
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('msgToServer')
  async handleMessage(@MessageBody() payload: any) {
    console.log('MESSAGE RECEIVED');
    console.log(`UserId: ${payload.User._id}`);
    const followers = payload.User.followers;
    console.log('followers: ', followers);

    followers.forEach((follower: any) => {
      if (this.activeUsers.get(follower)) {
        console.log('A logged in user found');
        console.log(`socketId: ${this.activeUsers.get(follower)}`);
        this.server
          .to(this.activeUsers.get(follower))
          .emit('msgToClient', payload.Post);
      }
    });
    this.server.emit('msgToClient', payload.Post);
  }

  @SubscribeMessage('loggedIn')
  handleLogIn(@MessageBody() id: ObjectId, @ConnectedSocket() client: Socket) {
    this.activeUsers.set(id, client.id);
    console.log('USER LOGGED IN: SOCKETID: ');
    console.log(this.activeUsers.get(id));
  }
}
