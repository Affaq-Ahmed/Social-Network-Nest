import { forwardRef, Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthModule } from 'src/auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from './users.model';
import { UsersController } from './users.controller';
import { StripeModule } from 'nestjs-stripe';
import { PostsModule } from 'src/posts/posts.module';

@Module({
  imports: [
    forwardRef(() => AuthModule),
    MongooseModule.forFeature([{ name: 'Users', schema: UserSchema }]),
    StripeModule.forRoot({
      apiKey:
        'sk_test_51LdAPlL8VPhpvdNPlK02H7pYxQT1NYeST0o2NzSszUMGdKthlx4IRbg0o4F4nMZdSJ2ZXoq2FiZeToyo9dF2DEp600OcjMmXrg',
      apiVersion: '2022-08-01',
    }),
    PostsModule,
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
