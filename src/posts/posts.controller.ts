import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { io } from 'socket.io-client';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CreatePostDto } from 'src/dto/create-post.dto';
import { UpdatePostDto } from 'src/dto/updat-post.dto';
import { PostsService } from './posts.service';

@Controller('post')
export class PostsController {
  constructor(private readonly postService: PostsService) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post()
  async create(@Body() createPostDto: CreatePostDto, @Request() req) {
    createPostDto.createdBy = req.user._id;
    if (req.user.userRole === 'MODERATOR') {
      return {
        Message: 'You are not allowed to create a post',
      };
    }
    const response = await this.postService.create(createPostDto);
    if (response) {
      // send notification to all users
      const socket = io('http://localhost:3000');
      socket.emit('msgToServer', {
        message: 'New post created',
        Post: response,
        User: req.user,
      });

      return {
        Post: response,
        Message: 'Post created successfully',
      };
    }
    return {
      Message: 'Post creation failed',
    };
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Patch(':id')
  async update(
    @Body() updatePostDto: UpdatePostDto,
    @Param('id') id: string,
    @Request() req,
  ) {
    const response = await this.postService.update(
      id,
      updatePostDto,
      req.user._id,
    );
    return {
      Post: response,
      Message: 'Post Updated successfully',
    };
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Patch('like/:id')
  async like(@Param('id') id: string, @Request() req) {
    const response = await this.postService.like(id, req.user._id);
    return {
      Post: response,
      Message: 'Post liked successfully',
    };
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async unlike(@Param('id') id: string, @Request() req) {
    const response = await this.postService.unlike(id, req.user._id);
    return {
      Post: response,
      Message: 'Post unliked successfully',
    };
  }

  @Get()
  async findAll(@Query('page') page: string, @Query('limit') limit: string) {
    const posts = await this.postService.findAll(page, limit);
    const count = posts.length;
    return {
      Count: count,
      Posts: posts,
    };
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('feed')
  async feed(@Request() req) {
    if (req.user.paid) {
      return {
        Message: 'You are not allowed to view this content. Buy a subscription',
      };
    }
    const posts = await this.postService.feed(req.user.followedUsers);
    return {
      Posts: posts,
    };
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    const post = await this.postService.findById(id);
    return {
      Post: post,
    };
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Delete(':id')
  async delete(@Param('id') id: string, @Request() req) {
    let post: any = null;
    if (req.user.userRole === 'MODERATOR') {
      post = await this.postService.deleteByModerator(id);
    } else {
      post = await this.postService.deleteByUser(id, req.user._id);
    }
    return {
      Post: post,
      Message: 'Post deleted successfully',
    };
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('comments/:postId')
  async findAllComments(@Param('postId') postId: string, @Request() req) {
    const response = await this.postService.findAllComments(postId, req.user);
    return {
      Comments: response,
    };
  }
}
