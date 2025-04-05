import { Controller, Get, Post, Body, Patch, Param, Delete, Put, NotFoundException, BadRequestException } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('forgot-password')
  async forgetPassword(@Body() Body: { email: string }) {
    const user = await this.usersService.findUserByEmail(Body.email);
    if (!user) throw new NotFoundException('User not found');

    const otp = process.env.NODE_ENV === 'development'
      ? process.env.DEV_OTP
      : Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
    const otpExpiresAt = new Date();
    otpExpiresAt.setMinutes(otpExpiresAt.getMinutes() + 10); // OTP valid for 10 minutes

    // Update user with OTP and expiration time
    const updatedUser: Partial<User> = {
      otp,
      otpExpiresAt,
    };

    await this.usersService.update(user.id, updatedUser);

    // Send OTP via email (Implement your email service): TODO

    return {
      status: "success",
      message: 'OTP sent successfully. Check your email'
    };
  }
  
  @Post('verify-otp')
  async verifyOtp(@Body() body: { email: string; otp: string }) {
    const user = await this.usersService.findUserByEmail(body.email);
    if (!user || user.otp !== body.otp || new Date() > user.otpExpiresAt) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    return { status: "verified", message: 'OTP verified successfully' };
  }

  @Post('reset-password')
  async resetPassword(@Body() body: { email: string; otp: string; newPassword: string }) {
    const user = await this.usersService.findUserByEmail(body.email);
    if (!user || user.otp !== body.otp || new Date() > user.otpExpiresAt) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    const hashedPassword = await bcrypt.hash(body.newPassword, 10);

    // Update password and clear OTP
    const updatedUser: Partial<User> = {
      otp: null,
      otpExpiresAt: null,
      password: hashedPassword
    };
    await this.usersService.update(user.id, updatedUser);

    return { message: 'Password updated successfully' };
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}
