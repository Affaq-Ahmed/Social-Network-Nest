import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Comment } from 'src/comments/comments.model';
import { CreatePostDto } from 'src/dto/create-post.dto';
import { UpdatePostDto } from 'src/dto/updat-post.dto';
import { Post } from './posts.model';

@Injectable()
export class PostsService {
  constructor(
    @InjectModel('Posts') private readonly postModel: Model<Post>,
    @InjectModel('Comments') private readonly commentModel: Model<Comment>,
  ) {}

  async create(post: CreatePostDto): Promise<any> {
    try {
      const newPost = new this.postModel(post);
      const createdPost = await newPost.save();
      return createdPost;
    } catch (error) {
      throw new HttpException(
        'Post not created',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAll(page: string, limit: string): Promise<Post[]> {
    try {
      const posts = await this.postModel
        .find()
        .skip(+page)
        .limit(+limit)
        .exec();

      if (posts.length === 0) {
        throw new HttpException('Out of range', HttpStatus.NOT_FOUND);
      }

      return posts;
    } catch (error) {
      throw new HttpException(
        'Posts not found',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findById(id: string): Promise<Post> {
    try {
      const post = await this.postModel.findById(id).exec();
      if (!post) {
        throw new HttpException('Post not found', HttpStatus.NOT_FOUND);
      }
      return post;
    } catch (error) {
      throw new HttpException(
        'Post not found',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async update(
    id: string,
    updatePostDto: UpdatePostDto,
    userId: string,
  ): Promise<Post> {
    try {
      const post = await this.postModel.findById(id);
      if (!post) {
        throw new HttpException('Post not found', HttpStatus.NOT_FOUND);
      }
      if (post.createdBy.toString() !== userId.toString()) {
        throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
      }
      const updatedPost = await this.postModel
        .findByIdAndUpdate(id, updatePostDto)
        .exec();

      if (!updatedPost) {
        throw new HttpException(
          'Post not updated for some reason',
          HttpStatus.BAD_REQUEST,
        );
      }
      return updatedPost;
    } catch (error) {
      throw new HttpException(
        'Post not found',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async deleteByModerator(id: string): Promise<Post> {
    try {
      const deletedPost = await this.postModel.findByIdAndDelete(id).exec();
      if (!deletedPost) {
        throw new HttpException('Post not found', HttpStatus.NOT_FOUND);
      }
      return deletedPost;
    } catch (error) {
      throw new HttpException(
        'Post not found',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async deleteByUser(id: string, userId: string): Promise<Post> {
    try {
      const post = await this.postModel.findById(id);
      if (!post) {
        throw new HttpException('Post not found', HttpStatus.NOT_FOUND);
      }
      if (post.createdBy.toString() !== userId.toString()) {
        throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
      }
      const deletedPost = await this.postModel.findByIdAndDelete(id).exec();
      if (!deletedPost) {
        throw new HttpException('Post not found', HttpStatus.NOT_FOUND);
      }
      return deletedPost;
    } catch (error) {
      throw new HttpException(
        'Post not found',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async like(id: string, userId: string): Promise<Post> {
    try {
      const post = await this.postModel.findByIdAndUpdate(
        id,
        {
          $addToSet: { likes: userId },
        },
        { new: true },
      );
      if (!post) {
        throw new HttpException('Post not found', HttpStatus.NOT_FOUND);
      }
      return post;
    } catch (error) {
      throw new HttpException(
        'Post not found',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async unlike(id: string, userId: string): Promise<Post> {
    try {
      const post = await this.postModel.findByIdAndUpdate(
        id,
        {
          $pull: { likes: userId },
        },
        { new: true },
      );
      if (!post) {
        throw new HttpException('Post not found', HttpStatus.NOT_FOUND);
      }
      return post;
    } catch (error) {
      throw new HttpException(
        'Post not found',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async feed(followedUsers: [string]): Promise<Post[]> {
    try {
      const posts = await this.postModel
        .find({ createdBy: { $in: followedUsers } })
        .exec();
      return posts;
    } catch (error) {
      throw new HttpException(
        'Posts not found',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAllComments(postId: string, user: any): Promise<any> {
    try {
      const post = await this.postModel.findById(postId).exec();
      if (!post) {
        throw new HttpException('Post not found', HttpStatus.NOT_FOUND);
      }
      if (
        post.createdBy.toString() !== user._id?.toString() &&
        !user.followedUsers?.includes(post.createdBy)
      ) {
        throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
      }
      const comments = await this.commentModel
        .find({ postId, deleted: false })
        .exec();

      if (comments.length === 0) {
        throw new HttpException(
          'No Comments to show on Graph',
          HttpStatus.NOT_FOUND,
        );
      }

      const graphOfComments = comments.reduce((acc: any, comment: any) => {
        acc[comment._id] = {
          ...comment._doc,
          replies: [],
        };
        return acc;
      }, {});

      // console.log(graphOfComments);

      const commentsWithReplies = comments.reduce(
        (acc: any, comment: any) => {
          console.log('111', comment.parentCommentId);
          if (comment.parentCommentId) {
            graphOfComments[comment.parentCommentId].replies.push(
              graphOfComments[comment._id],
            );
          } else {
            console.log('222', comment._id);
            acc.push(graphOfComments[comment._id]);
          }
          console.log('333', acc);
          return acc;
        },
        [graphOfComments],
      );
      console.log('graphOfComments', graphOfComments);
      console.log('commentsWIthReplies', commentsWithReplies);
      console.log('adasdf');

      return {
        post: post,
        comments: commentsWithReplies,
        message: 'Comments found',
        status: 200,
      };
    } catch (error) {
      throw new HttpException(
        'Something Went Wrong.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
