import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
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

@Controller('posts')
export class PostsController {
  constructor(private readonly postService: PostsService) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post()
  async create(@Body() createPostDto: CreatePostDto, @Request() req) {
    createPostDto.author = req.user._id;
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
  @Put('update/:id')
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

  @Delete(':id')
  async delete(@Param('id') id: string) {
    const post = await this.postService.delete(id);
    return {
      Post: post,
      Message: 'Post deleted successfully',
    };
  }
}
