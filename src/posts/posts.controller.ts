import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
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
    console.log('createPostDto:   ', createPostDto);
    console.log('req.user:    ', req.user);
    console.log(req.user.userId);
    createPostDto.createdBy = req.user._id;
    if (req.user.userRole === 'MODERATOR') {
      return {
        Message: 'You are not allowed to create a post',
      };
    }
    const response = await this.postService.create(createPostDto);
    return {
      Post: response,
      Message: 'Post created successfully',
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

  @Get()
  async findAll(@Query('page') page: string, @Query('limit') limit: string) {
    const posts = await this.postService.findAll(page, limit);
    const count = posts.length;
    return {
      Count: count,
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
