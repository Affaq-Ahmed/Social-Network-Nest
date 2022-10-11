import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CreateCommentDto } from 'src/dto/create-comment.dto';
import { CommentsService } from './comments.service';

@Controller('comment')
export class CommentsController {
  constructor(private readonly commentService: CommentsService) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post()
  async create(@Body() createCommentDto: CreateCommentDto, @Request() req) {
    createCommentDto.createdBy = req.user._id;
    const response = await this.commentService.create(createCommentDto);
    return {
      Comment: response,
      Message: 'Comment created successfully',
    };
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Delete(':commentId')
  async delete(@Param('commentId') commentId: string, @Request() req) {
    const response = await this.commentService.delete(commentId, req.user._id);
    return {
      Message: response,
      Status: 200,
    };
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get(':postId')
  async findAll(@Param('postId') postId: string) {
    const response = await this.commentService.findAll(postId);
    if (response.length === 0) {
      return {
        Message: 'No comments found',
        Status: 200,
      };
    }
    return {
      Comments: response,
      Status: 200,
    };
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('reply')
  async reply(
    @Body() createCommentDto: CreateCommentDto,
    @Body('commentId') commentId: string,
    @Request() req,
  ) {
    createCommentDto.createdBy = req.user._id;
    const response = await this.commentService.reply(
      commentId,
      createCommentDto,
    );
    return {
      Comment: response,
      Message: 'Comment created successfully',
    };
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('replies/:commentId')
  async findReplies(@Param('commentId') commentId: string) {
    const response = await this.commentService.findReplies(commentId);
    console.log(response);
    if (response.length === 0) {
      return {
        Message: 'No replies found',
      };
    }
    return {
      Replies: response,
    };
  }
}
