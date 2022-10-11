import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateCommentDto } from 'src/dto/create-comment.dto';

import { Comment } from './comments.model';

@Injectable()
export class CommentsService {
  constructor(
    @InjectModel('Comments') private readonly commentModel: Model<Comment>,
  ) {}

  async create(comment: CreateCommentDto): Promise<any> {
    try {
      console.log(comment);
      const newComment = new this.commentModel(comment);
      const createdComment = await newComment.save();
      return createdComment;
    } catch (error) {
      throw new HttpException(
        'Comment not created',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async delete(id: string, userId: string): Promise<any> {
    try {
      const comment = await this.commentModel.findById(id);
      if (comment.createdBy.toString() !== userId) {
        throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
      }
      await this.commentModel.findByIdAndDelete(id).exec();
      return 'Comment deleted successfully';
    } catch (error) {
      throw new HttpException(
        'Comment not deleted',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAll(postId: string): Promise<Comment[]> {
    try {
      const comments = await this.commentModel.find({ postId: postId }).exec();
      console.log(comments);
      return comments;
    } catch (error) {
      throw new HttpException(
        'Comments not found',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async reply(commentId: string, reply: CreateCommentDto): Promise<any> {
    try {
      const newReply = new this.commentModel(reply);
      newReply.parentCommentId = commentId;
      const createdReply = await newReply.save();

      return createdReply;
    } catch (error) {
      throw new HttpException(
        'Reply not created',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findReplies(commentId: string): Promise<Comment[]> {
    try {
      const replies = await this.commentModel
        .find({ parentCommentId: commentId })
        .exec();
      console.log(replies);
      return replies;
    } catch (error) {
      throw new HttpException(
        'Replies not found',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
