import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User, UserPlan } from '../users/entities/user.entity';
import { UserUsage } from '../users/entities/user-usage.entity';
import { RegisterDto, LoginDto, GoogleAuthDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(UserUsage)
    private userUsageRepository: Repository<UserUsage>,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, name, password } = registerDto;

    // Check if user already exists
    const existingUser = await this.userRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = this.userRepository.create({
      email,
      name,
      password: hashedPassword,
      plan: UserPlan.FREE,
    });

    const savedUser = await this.userRepository.save(user);

    // Create usage tracking
    await this.createUserUsage(savedUser.id);

    // Generate JWT token
    const token = this.generateToken(savedUser);

    return {
      user: this.sanitizeUser(savedUser),
      token,
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // Find user
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate JWT token
    const token = this.generateToken(user);

    return {
      user: this.sanitizeUser(user),
      token,
    };
  }

  async googleAuth(googleAuthDto: GoogleAuthDto) {
    const { googleId, email, name, avatar } = googleAuthDto;

    // Check if user exists
    let user = await this.userRepository.findOne({ 
      where: [{ email }, { googleId }] 
    });

    if (user) {
      // Update user info if needed
      if (!user.googleId) {
        user.googleId = googleId;
        user.avatar = avatar || '';
        user = await this.userRepository.save(user);
      }
    } else {
      // Create new user
      user = this.userRepository.create({
        googleId,
        email,
        name,
        avatar,
        plan: UserPlan.FREE,
      });

      user = await this.userRepository.save(user);

      // Create usage tracking
      await this.createUserUsage(user.id);
    }

    // Generate JWT token
    const token = this.generateToken(user);

    return {
      user: this.sanitizeUser(user),
      token,
    };
  }

  async validateUser(userId: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return user;
  }

  private generateToken(user: User): string {
    const payload = { 
      sub: user.id, 
      email: user.email, 
      plan: user.plan 
    };
    return this.jwtService.sign(payload);
  }

  private sanitizeUser(user: User): Partial<User> {
    const { password, ...sanitizedUser } = user;
    return sanitizedUser;
  }

  async googleAuthCallback(googleUser: any) {
    const { googleId, email, name, avatar } = googleUser;

    // Check if user exists
    let user = await this.userRepository.findOne({ where: { email } });
    
    if (!user) {
      // Create new user
      user = this.userRepository.create({
        email,
        name,
        googleId,
        avatar,
        plan: UserPlan.FREE,
      });
      user = await this.userRepository.save(user);
      
      // Create usage tracking
      await this.createUserUsage(user.id);
    } else {
      // Update existing user with Google ID if not set
      if (!user.googleId) {
        user.googleId = googleId;
        user.avatar = avatar;
        await this.userRepository.save(user);
      }
    }

    // Generate JWT token
    const token = this.generateToken(user);

    return {
      user: this.sanitizeUser(user),
      token,
    };
  }

  private async createUserUsage(userId: string): Promise<void> {
    const userUsage = this.userUsageRepository.create({
      userId,
      resetDate: new Date(),
    });
    await this.userUsageRepository.save(userUsage);
  }
}