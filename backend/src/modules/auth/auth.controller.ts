import { Controller, Post, Body, UseGuards, Get, Request, Response, UseInterceptors, ClassSerializerInterceptor } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, GoogleAuthDto } from './dto/auth.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('google')
  async googleAuthPost(@Body() googleAuthDto: GoogleAuthDto) {
    return this.authService.googleAuth(googleAuthDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Request() req) {
    return {
      user: req.user,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMe(@Request() req) {
    return this.authService.validateUser(req.user.id);
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    // This will redirect to Google OAuth
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthCallback(@Request() req, @Response() res) {
    const result = await this.authService.googleAuthCallback(req.user);
    
    // Redirect to frontend with user data
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5000';
    const redirectUrl = new URL('/auth/callback', frontendUrl);
    
    redirectUrl.searchParams.set('token', result.token);
    redirectUrl.searchParams.set('id', result.user.id || '');
    redirectUrl.searchParams.set('name', result.user.name || '');
    redirectUrl.searchParams.set('email', result.user.email || '');
    redirectUrl.searchParams.set('avatar', result.user.avatar || '');
    redirectUrl.searchParams.set('plan', result.user.plan || 'FREE');
    
    return res.redirect(redirectUrl.toString());
  }
}