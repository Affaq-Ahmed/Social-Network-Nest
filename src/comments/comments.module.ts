import { Module } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { CommentSchema } from './comments.model';
import { PostSchema } from 'src/posts/posts.model';
import { UserSchema } from 'src/users/users.model';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Comments', schema: CommentSchema }]),
    MongooseModule.forFeature([{ name: 'Posts', schema: PostSchema }]),
    MongooseModule.forFeature([{ name: 'Users', schema: UserSchema }]),
  ],
  providers: [CommentsService],
  controllers: [CommentsController],
  exports: [CommentsService],
})
export class CommentsModule {}
