import {
    BadGatewayException,
    BadRequestException,
    Body,
    Controller,
    Post,
    Request,
    UseGuards,
  } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginResponseDTO } from './dto/login-response-dto';
import { RegisterResponseDTO }  from './dto/register-response.dto'; 
import { Public } from 'src/common/decorators/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('login')
  async login(@Body() loginDto: { email: string; password: string }): Promise<LoginResponseDTO | BadRequestException> {  
    const user = await this.authService.validateUser(loginDto.email, loginDto.password);
    if (!user) throw new BadRequestException('Invalid credentials');
  
    return this.authService.login(user);
  }
  
  @Public()
  @Post('register')
  async register(@Body() createUserDto: CreateUserDto): Promise<RegisterResponseDTO | BadRequestException> {
    return  await this.authService.register(createUserDto);
  }

  async refreshToken(@Body() body: { refreshToken: string }): Promise<LoginResponseDTO | BadGatewayException> {
    return this.authService.refreshToken(body.refreshToken);
  }
}