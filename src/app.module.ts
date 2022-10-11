import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CommentsModule } from './comments/comments.module';
import { MongooseModule } from '@nestjs/mongoose';
import { EventsModule } from './events/events.module';
import { EventsGateway } from './events/events.gateway';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    CommentsModule,
    MongooseModule.forRoot(
      `mongodb+srv://Affaq:Affaq165@mycluster.ryf6a.mongodb.net/Social_Network_Nest?retryWrites=true&w=majority`,
    ),
    EventsModule,
  ],
  controllers: [AppController],
  providers: [AppService, EventsGateway],
})
export class AppModule {}
