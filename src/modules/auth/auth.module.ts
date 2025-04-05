import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module'; 
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LocalStrategy } from './local.strategy';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';

@Module({
    imports: [
      UsersModule,
      ConfigModule,
      JwtModule.registerAsync({
        imports: [ConfigModule],
        useFactory: async (configService: ConfigService) => ({
          secret: configService.get<string>('JWT_SECRET'),
          signOptions: {
            expiresIn: parseInt(
              configService.getOrThrow<string>(
                'ACCESS_TOKEN_VALIDITY_DURATION_IN_SEC',
              ),
            ),
          },
        }),
        inject: [ConfigService],
      }),
    ],
    controllers: [AuthController],
    providers: [AuthService, LocalStrategy, JwtStrategy,ConfigService],
    exports: [AuthService, JwtModule],
  })
  export class AuthModule {}