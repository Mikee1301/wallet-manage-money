import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findUserByEmail(email: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { email } });
    return user; 
  }
  
  async create(createUserDto: CreateUserDto): Promise<User> {
    // Check if user is exist via email
    const isUserExist = await this.findUserByEmail(createUserDto.email);
    if (isUserExist) throw new BadRequestException( "Email is already exist!");

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10); // Hash password with salt rounds = 10
    const guid = uuidv4();
    const user = this.usersRepository.create({ ...createUserDto, password: hashedPassword, guid: guid });
    return this.usersRepository.save(user);
    
  } 

  async findAll():Promise<User[]> {
    return this.usersRepository.find();
  } 

  async findOne(id: number): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException(`User with ID ${id} not found`);
    return user; 
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    await this.usersRepository.update(id, updateUserDto);
    return user;
  }

  async remove(id: number): Promise<void> {
    const result = await this.usersRepository.delete(id);
    if (!result.affected) throw new NotFoundException('User not found');
  }
}
