import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from 'src/modules/users/entities/user.entity';
import { AccessToken } from '../auth/types/AccessToken';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginResponseDTO } from './dto/login-response-dto';
import { RegisterResponseDTO } from './dto/register-response.dto';


@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
      ) {}
    async validateUser(email: string, password: string): Promise<User> {
      try {
        const user: User = await this.usersService.findUserByEmail(email); 
        if (!user) throw new UnauthorizedException('Invalid credentials');

        const isMatch: boolean = bcrypt.compareSync(password, user.password);
        if (!isMatch) throw new UnauthorizedException('Invalid credentials');

        return user;
      } catch (error) {
        if (error instanceof UnauthorizedException) throw error;
        throw new InternalServerErrorException('Failed to validate user');
      }
        
    }
    async login(user: User): Promise<LoginResponseDTO> {
        const payload = { email: user.email, id: user.id, guid: user.guid, role: user.role };
        const accessToken = this.jwtService.sign(payload);
        const refreshToken = this.jwtService.sign(payload, { secret: process.env.JWT_REFRESH_SECRET, expiresIn: process.env.REFRESH_TOKEN_VALIDITY_DURATION_IN_SEC });
        const expiresIn = process.env.JWT_EXPIRES_IN;


        return { 
            accessToken,
            expiresIn,
            refreshToken,
            email: user.email,
            name: user.name
         };
    }

    async register(createUserDto: CreateUserDto): Promise<RegisterResponseDTO> {
      try {
          const newUser = await this.usersService.create(createUserDto)
          if (!newUser) throw new BadRequestException('Something went wrong!');
          return {
              message: 'User registered successfully',
              user: {
                  email: newUser.email,
                  name: newUser.name,
              },
          };
      } catch (error) {
          if (error instanceof BadRequestException) throw error;
          throw new InternalServerErrorException('Failed to register user');
      }
    }


    async refreshToken(refreshToken: string): Promise<LoginResponseDTO> {
      try {
        const decoded = this.jwtService.verify(refreshToken, { secret: process.env.JWT_REFRESH_SECRET });
        const user = await this.usersService.findUserByEmail(decoded.email);
        if (!user) throw new UnauthorizedException('Invalid refresh token');
        return this.login(user);
      } catch (error) {
        throw new UnauthorizedException('Invalid refresh token');
      }
    }
 }

