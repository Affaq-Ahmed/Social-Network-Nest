import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreatePostDto } from 'src/dto/create-post.dto';
import { UpdatePostDto } from 'src/dto/updat-post.dto';
import { User } from 'src/users/users.model';
import { Post } from './posts.model';

@Injectable()
export class PostsService {
  constructor(
    @InjectModel('Posts') private readonly postModel: Model<Post>,
    @InjectModel('Users') private readonly userModel: Model<User>,
  ) {}

  async create(post: CreatePostDto): Promise<any> {
    try {
      const newPost = new this.postModel(post);
      const createdPost = await newPost.save();
      return createdPost;
    } catch (error) {
      throw new HttpException('Post not created', HttpStatus.BAD_REQUEST);
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
      throw new HttpException('Posts not found', HttpStatus.NOT_FOUND);
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
      throw new HttpException('Post not found', HttpStatus.NOT_FOUND);
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
      throw new HttpException('Post not found', HttpStatus.NOT_FOUND);
    }
  }

  async delete(id: string): Promise<Post> {
    try {
      const deletedPost = await this.postModel.findByIdAndDelete(id).exec();
      if (!deletedPost) {
        throw new HttpException('Post not found', HttpStatus.NOT_FOUND);
      }
      return deletedPost;
    } catch (error) {
      throw new HttpException('Post not found', HttpStatus.NOT_FOUND);
    }
  }
}
