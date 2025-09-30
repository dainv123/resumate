import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { User } from './entities/user.entity';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('profile')
  async getProfile(@GetUser() user: User) {
    return user;
  }

  @Put('profile')
  async updateProfile(
    @GetUser('id') userId: string,
    @Body() updateData: Partial<User>,
  ) {
    return this.usersService.updateProfile(userId, updateData);
  }

  @Get('usage')
  async getUserUsage(@GetUser('id') userId: string) {
    return this.usersService.getUserUsage(userId);
  }
}