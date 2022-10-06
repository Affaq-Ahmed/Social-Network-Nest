import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Post } from 'src/posts/posts.model';
import { User } from 'src/users/users.model';

export type CommentDocument = Comment & Document;

@Schema({ timestamps: true })
export class Comment {
  @Prop({ required: true })
  content: string;

  @Prop({ type: mongoose.Types.ObjectId, ref: 'User', required: true })
  createdBy: User;

  @Prop({ type: mongoose.Types.ObjectId, ref: 'Post', required: true })
  post: Post;

  @Prop({ type: mongoose.Types.ObjectId, default: null })
  parentCommentId: string;

  @Prop({ default: false })
  deleted: boolean;
}

export const CommentSchema = SchemaFactory.createForClass(Comment);
