import { Controller, Get, Put, Delete, Body, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { User } from './entities/user.entity';
import { UpdateProfileDto, ChangePasswordDto } from './dto/update-user.dto';

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
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    return this.usersService.updateProfile(userId, updateProfileDto);
  }

  @Put('password')
  async changePassword(
    @GetUser() user: User,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this.usersService.changePassword(user, changePasswordDto);
  }

  @Get('usage')
  async getUserUsage(@GetUser('id') userId: string) {
    return this.usersService.getUserUsage(userId);
  }

  @Get('stats')
  async getUserStats(@GetUser('id') userId: string) {
    return this.usersService.getUserStats(userId);
  }

  @Get('export')
  async exportUserData(@GetUser('id') userId: string) {
    return this.usersService.exportUserData(userId);
  }

  @Delete('account')
  async deleteAccount(@GetUser() user: User) {
    return this.usersService.deleteAccount(user.id);
  }
}