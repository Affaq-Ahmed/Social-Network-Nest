import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { PostSchema } from './posts.model';
import { UserSchema } from 'src/users/users.model';
import { CommentSchema } from 'src/comments/comments.model';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Posts', schema: PostSchema }]),
    MongooseModule.forFeature([{ name: 'Users', schema: UserSchema }]),
    MongooseModule.forFeature([{ name: 'Comments', schema: CommentSchema }]),
  ],
  providers: [PostsService],
  controllers: [PostsController],
  exports: [PostsService],
})
export class PostsModule {}
