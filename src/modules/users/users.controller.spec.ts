import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { Role } from '../../common/enums/role.enum';
import { JwtGuard } from '../../common/guards/jwt.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { ExecutionContext, INestApplication } from '@nestjs/common';
import * as request from 'supertest';

// Mock the UsersService
const mockUsersService = {
  findAll: jest.fn().mockResolvedValue([{ id: 1, name: 'Test User' }]),
  findOne: jest.fn().mockResolvedValue({ id: 1, name: 'Test User' }),
  update: jest.fn().mockResolvedValue({ id: 1, name: 'Updated User' }),
  remove: jest.fn().mockResolvedValue({ id: 1 }),
  findUserByEmail: jest.fn().mockResolvedValue({ id: 1, email: 'test@example.com', otp: '123456', otpExpiresAt: new Date(Date.now() + 600000) }),
};

// Mock the JwtGuard
const mockJwtGuard = {
  canActivate: (context: ExecutionContext) => {
    const req = context.switchToHttp().getRequest();
    req.user = { id: 1, role: Role.ADMIN };
    return true;
  },
};

// Mock the RolesGuard
const mockRolesGuard = {
  canActivate: () => true,
};

describe('UsersController', () => {
  let controller: UsersController;
  let app: INestApplication;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [UsersService],
    })
      .overrideProvider(UsersService)
      .useValue(mockUsersService)
      .overrideGuard(JwtGuard)
      .useValue(mockJwtGuard)
      .overrideGuard(RolesGuard)
      .useValue(mockRolesGuard)
      .compile();

    controller = module.get<UsersController>(UsersController);
    app = module.createNestApplication();
    await app.init();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const result = [{ id: 1, name: 'Test User' }];
      expect(await controller.findAll()).toEqual(result);
      expect(mockUsersService.findAll).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should remove a user', async () => {
      const result = { id: 1 };
      expect(await controller.remove('1')).toEqual(result);
      expect(mockUsersService.remove).toHaveBeenCalledWith(1);
    });
  });

  describe('forgotPassword', () => {
    it('should send an OTP', async () => {
      const result = { status: 'success', message: 'OTP sent successfully. Check your email' };
      expect(await controller.forgetPassword({ email: 'test@example.com' })).toEqual(result);
      expect(mockUsersService.findUserByEmail).toHaveBeenCalledWith('test@example.com');
    });
  });

  describe('verifyOtp', () => {
    it('should verify an OTP', async () => {
      const result = { status: 'verified', message: 'OTP verified successfully' };
      expect(await controller.verifyOtp({ email: 'test@example.com', otp: '123456' })).toEqual(result);
      expect(mockUsersService.findUserByEmail).toHaveBeenCalledWith('test@example.com');
    });
  });

  describe('resetPassword', () => {
    it('should reset the password', async () => {
      const result = { message: 'Password updated successfully' };
      expect(await controller.resetPassword({ email: 'test@example.com', otp: '123456', newPassword: 'newPassword' })).toEqual(result);
      expect(mockUsersService.findUserByEmail).toHaveBeenCalledWith('test@example.com');
    });
  });

  describe('e2e', () => {
    it('/users (GET)', () => {
      return request(app.getHttpServer())
        .get('/users')
        .set('Authorization', 'Bearer <admin_access_token>')
        .expect(200)
        .expect([{ id: 1, name: 'Test User' }]);
    });
  });
});
