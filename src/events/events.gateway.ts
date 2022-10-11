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
  private roomid;

  constructor() {
    this.logger = new Logger('AppGateway');
    this.activeUsers = new Map();
  }

  //61426923a2323b6308b5f5a7
  afterInit(server: Server) {
    this.logger.log('Init');
  }

  handleConnection(client: Socket, ...args: any[]) {
    this.logger.log(`Client connected`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected`);
  }

  @SubscribeMessage('newPost')
  handleMessage(@MessageBody() payload) {
    console.log(`UserId: ${payload._id}`);
    const followers = payload.User.followedUsers;
    console.log('followed: ', followers);

    followers.forEach((follower) => {
      if (this.activeUsers.get(follower)) {
        console.log('A logged in user found');
        console.log(`socketId: ${this.activeUsers.get(follower)}`);
        this.server
          .to(this.activeUsers.get(follower))
          .emit('newPost', payload.Post);
      }
    });
  }

  @SubscribeMessage('loggedIn')
  handleLogIn(@MessageBody() id: ObjectId, @ConnectedSocket() client: Socket) {
    this.activeUsers.set(id, client.id);
    console.log('USER LOGGED IN: SOCKETID: ');
    console.log(this.activeUsers.get(id));
  }
}
