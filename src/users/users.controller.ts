import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from 'src/auth/auth.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { LocalAuthGuard } from 'src/auth/guards/local-auth.guard';
import { CreateUserDto } from 'src/dto/create-user.dto';
import { LoginUserDto } from 'src/dto/login-user.dto';
import { PaymentDto } from 'src/dto/payment.dto';
import { UsersService } from './users.service';

@Controller('user')
export class UsersController {
  constructor(
    private readonly userService: UsersService,
    private readonly authService: AuthService,
  ) {}

  @Post('signup')
  async create(@Body() createUserDto: CreateUserDto) {
    const user = await this.userService.create(createUserDto);
    return {
      User: user,
      Message: 'User created successfully',
    };
  }

  @Get()
  async findAll() {
    const users = await this.userService.findAll();
    const count = users.length;
    return {
      Count: count,
      Users: users,
    };
  }

  @Get('getOne/:email')
  async getOne(@Body('email') email: string) {
    const user = await this.userService.findByEmail(email);
    return {
      User: user,
      Message: 'User Updated successfully',
    };
  }

  @Put('update/:id')
  async update(@Body() updateUserDto: CreateUserDto, @Param('id') id: string) {
    const user = await this.userService.update(id, updateUserDto);
    return {
      User: user,
    };
  }

  @Delete(':id')
  async delete(@Body('id') id: string) {
    const result = await this.userService.delete(id);
    return {
      Message: 'User deleted successfully',
    };
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('payment')
  async payment(@Body() paymentDto: PaymentDto, @Request() req) {
    const response = this.userService.payment(paymentDto, req.user);
    return {
      Message: 'Payment successful',
      response,
    };
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('follow/:id')
  async follow(@Param('id') id: string, @Request() req) {
    if (req.user._id === id) {
      return {
        Message: 'You cannot follow yourself',
      };
    }
    return this.userService.follow(id, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('unfollow/:id')
  async unfollow(@Param('id') id: string, @Request() req) {
    if (req.user._id === id) {
      return {
        Message: 'You cannot unfollow yourself',
      };
    }
    return this.userService.unfollow(id, req.user);
  }
}
