import * as mongoose from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { User } from 'src/users/users.model';
export type PostDocument = Post & Document;

@Schema({ timestamps: true })
export class Post {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  content: string;

  @Prop({ type: mongoose.Types.ObjectId, ref: 'User', required: true })
  createdBy: User;

  @Prop({ type: [mongoose.Types.ObjectId], ref: 'User', default: [] })
  likes: User[];

  @Prop({ default: false })
  deleted: boolean;
}

export const PostSchema = SchemaFactory.createForClass(Post);
