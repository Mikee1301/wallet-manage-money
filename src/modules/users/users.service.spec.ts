import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { DeleteResult, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

// Mock the repository
const mockUserRepository = () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  save: jest.fn(),
  create: jest.fn(),
});

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe('UsersService', () => {
  let service: UsersService;
  let userRepository: MockRepository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useFactory: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userRepository = module.get<MockRepository<User>>(getRepositoryToken(User));
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findUserByEmail', () => {
    it('should return a user if found', async () => {
      const expectedUser = { id: 1, email: 'test@example.com' };
      userRepository.findOne.mockResolvedValue(expectedUser);
      const user = await service.findUserByEmail('test@example.com');
      expect(user).toEqual(expectedUser);
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
    });

    it('should return null if user is not found', async () => {
      userRepository.findOne.mockResolvedValue(null);
      const user = await service.findUserByEmail('test@example.com');
      expect(user).toBeNull();
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
    });
  });

  describe('create', () => {
    it('should create a user', async () => {
      const createUserDto = {
        email: 'test@example.com',
        password: 'password',
        name: 'Test User',
      };
      const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
      const expectedUser = {
        id: 1,
        ...createUserDto,
        password: hashedPassword,
        guid: expect.any(String),
      };
      userRepository.findOne.mockResolvedValue(null);
      const createdUser = {
        ...createUserDto,
        password: hashedPassword,
        guid: uuidv4(),
      };
      userRepository.create.mockReturnValue(createdUser);
      userRepository.save.mockResolvedValue(expectedUser);
      const user = await service.create(createUserDto);
      expect(user).toEqual(expectedUser);
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { email: createUserDto.email },
      });
      expect(userRepository.create).toHaveBeenCalledWith({
        ...createUserDto,
        password: expect.any(String),
        guid: expect.any(String),
      });
      expect(userRepository.save).toHaveBeenCalledWith(createdUser);
    });

    it('should throw BadRequestException if email already exists', async () => {
      const createUserDto = {
        email: 'test@example.com',
        password: 'password',
        name: 'Test User',
      };
      userRepository.findOne.mockResolvedValue({});
      await expect(service.create(createUserDto)).rejects.toThrow(
        BadRequestException,
      );
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { email: createUserDto.email },
      });
    });
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const expectedUsers = [{ id: 1, name: 'Test User' }];
      userRepository.find.mockResolvedValue(expectedUsers);
      const users = await service.findAll();
      expect(users).toEqual(expectedUsers);
      expect(userRepository.find).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a user', async () => {
      const expectedUser = { id: 1, name: 'Test User' };
      userRepository.findOne.mockResolvedValue(expectedUser);
      const user = await service.findOne(1);
      expect(user).toEqual(expectedUser);
      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('should throw NotFoundException if user is not found', async () => {
      userRepository.findOne.mockResolvedValue(null);
      await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const expectedUser = { id: 1, name: 'Updated User' };
      userRepository.findOne.mockResolvedValue({
        id: 1,
        name: 'Test User',
      });
      userRepository.update.mockResolvedValue(expectedUser);
      const user = await service.update(1, { name: 'Updated User' });
      expect(user).toEqual({ id: 1, name: 'Test User' });
      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(userRepository.update).toHaveBeenCalledWith(1, {
        name: 'Updated User',
      });
    });

    it('should throw NotFoundException if user is not found', async () => {
      userRepository.findOne.mockResolvedValue(null);
      await expect(service.update(1, { name: 'Updated User' })).rejects.toThrow(
        NotFoundException,
      );
      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    });
  });

  describe('remove', () => {
    it('should remove a user', async () => {
      userRepository.delete.mockResolvedValue({ affected: 1 } as DeleteResult);
      await service.remove(1);
      expect(userRepository.delete).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException if user is not found', async () => {
      userRepository.delete.mockResolvedValue({ affected: 0 } as DeleteResult);
      await expect(service.remove(1)).rejects.toThrow(NotFoundException);
      expect(userRepository.delete).toHaveBeenCalledWith(1);
    });
  });
});
