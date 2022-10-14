import { GatewayTimeoutException, Injectable, Put } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateUserDto } from 'src/dto/create-user.dto';
import { PaymentDto } from 'src/dto/payment.dto';
import { UpdateUserDto } from 'src/dto/update-user.dto';
import { User } from './users.model';
import { InjectStripe } from 'nestjs-stripe';
import { Stripe } from 'stripe';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel('Users') private readonly userModel: Model<User>,
    @InjectStripe() private readonly stripeClient: Stripe,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const newUser = new this.userModel(createUserDto);
    const createdUser = await newUser.save();
    return createdUser;
  }

  async findAll(): Promise<User[]> {
    const users = await this.userModel.find().exec();
    return users;
  }

  async findByEmail(email: string): Promise<User> {
    try {
      const user = await this.userModel.findOne({ email }).exec();
      if (!user) {
        return null;
      }
      return user;
    } catch (error) {
      return null;
    }
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    try {
      const user = await this.userModel
        .findByIdAndUpdate(id, updateUserDto)
        .exec();
      if (!user) {
        return null;
      }
      return user;
    } catch (error) {
      return null;
    }
  }

  async delete(id: string): Promise<User> {
    try {
      const user = await this.userModel.findByIdAndDelete(id).exec();
      if (!user) {
        return null;
      }
      return user;
    } catch (error) {
      return null;
    }
  }

  async follow(userToFollow: string, user: any): Promise<any> {
    try {
      if (user.followedUsers.includes(userToFollow)) {
        throw new GatewayTimeoutException('Already following');
      }

      const returnedUser = await this.userModel
        .updateOne(
          { _id: user._id },
          { $push: { followedUsers: userToFollow } },
        )
        .exec();
      return returnedUser;
    } catch (error) {
      return null;
    }
  }

  async unfollow(userToUnfollow: string, user: any): Promise<any> {
    try {
      if (!user.followedUsers.includes(userToUnfollow)) {
        throw new GatewayTimeoutException('Not following');
      }
      const returnedUser = await this.userModel
        .updateOne(
          { _id: user._id },
          { $pull: { followedUsers: userToUnfollow } },
        )
        .exec();

      return returnedUser;
    } catch (error) {
      return null;
    }
  }

  async getFollowedUsers(user: any): Promise<User[]> {
    try {
      const followedUsers = await this.userModel
        .find({ _id: { $in: user.followedUsers } })
        .exec();
      return followedUsers;
    } catch (error) {
      return null;
    }
  }

  async payment(paymentDto: PaymentDto, user: any): Promise<User> {
    try {
      const paymentMethod = await this.stripeClient.paymentMethods.create({
        type: 'card',
        card: {
          number: paymentDto.card_number as string,
          exp_month: paymentDto.exp_month as string,
          exp_year: paymentDto.exp_year as string,
          cvc: paymentDto.cvc as string,
        } as any,
      });
      const paymentIntent = await this.stripeClient.paymentIntents.create({
        payment_method: paymentMethod.id,
        amount: 1000,
        currency: 'usd',
        confirm: true,
        payment_method_types: ['card'],
      });

      if (paymentIntent.status === 'succeeded') {
        user.paid = true;
        const returnedUser = await user.save();

        return returnedUser;
      } else {
        throw new GatewayTimeoutException('Payment failed');
      }
    } catch (error) {
      return null;
    }
  }
}
