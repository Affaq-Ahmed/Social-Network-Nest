import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/users/users.model';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel('Users') private readonly userModel: Model<User>,
    private readonly jwtService: JwtService,
    private userService: UsersService,
  ) {}

  async validateUser(username: string, password: string): Promise<any> {
    console.log(
      `AuthService.validateUser() email: ${username} password: ${password}`,
    );
    const user = await this.userService.findByEmail(username);
    if (user && user.password === password) {
      // const isPasswordValid = await bcrypt.compare(password, user.password);
      // if (isPasswordValid) {
      //   return user;
      // }
      return user;
    }
    return null;
  }

  async validateUserEmail(email: string): Promise<any> {
    console.log(`AuthService.validateUserEmail() email: ${email}`);
    const user = await this.userService.findByEmail(email);
    if (user) {
      return user;
    }
    return null;
  }

  async login(user: any) {
    console.log(`AuthService.login() user: ${JSON.stringify(user)}`);
    const payload = { email: user.email, sub: user._id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
