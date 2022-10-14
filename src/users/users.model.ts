import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';

enum roles {
  USER = 'USER',
  MODERATOR = 'MODERATOR',
}

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  name: string;

  @Prop({ type: mongoose.Types.ObjectId, ref: 'User' })
  followedUsers: User[];

  @Prop({ type: String, enum: roles, default: roles.USER })
  userRole: string;

  @Prop({ type: [String], default: [] })
  tokens: string[];

  @Prop({ type: Boolean, default: false })
  paid: boolean;

  @Prop({ type: Boolean, default: false })
  deleted: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);
