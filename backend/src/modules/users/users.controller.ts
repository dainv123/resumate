import { Controller, Get, Put, Delete, Body, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { User } from './entities/user.entity';
import { UpdateProfileDto, ChangePasswordDto } from './dto/update-user.dto';
import { TrackActivity } from '../../common/decorators/track-activity.decorator';
import { ActivityType } from '../../common/enums/activity-type.enum';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('profile')
  async getProfile(@GetUser() user: User) {
    return user;
  }

  @Put('profile')
  @TrackActivity(ActivityType.USER_PROFILE_UPDATED, {
    getResourceId: (result, context) => context.params?.userId || result?.id,
    getMetadata: (result, context) => ({ 
      fieldsUpdated: Object.keys(context.body || {}),
      email: result?.email 
    })
  })
  async updateProfile(
    @GetUser('id') userId: string,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    return this.usersService.updateProfile(userId, updateProfileDto);
  }

  @Put('password')
  @TrackActivity(ActivityType.USER_PASSWORD_CHANGED, {
    getResourceId: (result, context) => context.params?.userId || result?.id,
    getMetadata: (result) => ({ 
      email: result?.email 
    })
  })
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
  @TrackActivity(ActivityType.USER_DATA_EXPORTED, {
    getResourceId: (result, context) => context.params?.userId || result?.id,
    getMetadata: (result) => ({ 
      email: result?.email,
      exportType: 'user_data'
    })
  })
  async exportUserData(@GetUser('id') userId: string) {
    return this.usersService.exportUserData(userId);
  }

  @Delete('account')
  @TrackActivity(ActivityType.USER_ACCOUNT_DELETED, {
    getResourceId: (result, context) => context.params?.userId || result?.id,
    getMetadata: (result) => ({ 
      email: result?.email 
    })
  })
  async deleteAccount(@GetUser() user: User) {
    return this.usersService.deleteAccount(user.id);
  }
}