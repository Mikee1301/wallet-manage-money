import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Account } from './entities/account.entity';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';

@Injectable()
export class AccountService {
  constructor(
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
  ) {}

  // Helper function to check if account name exists for the user
  private async accountExistsForUser(accountName: string, userId: string): Promise<Account> {
    const query = this.accountRepository.createQueryBuilder('account');
    return query
        .where('LOWER(account.name) = :name', { name: accountName.toLowerCase() })
        .andWhere('account.userId = :userId', { userId })
        .getOne();
  }

  async create(createAccountDto: CreateAccountDto, userId: string): Promise<Account> {

    const isAccountExist = await this.accountExistsForUser(createAccountDto.name, userId);
    if (isAccountExist) throw new ConflictException(`Account with name "${createAccountDto.name}" already exists for this user.`);

    const account = this.accountRepository.create({
      ...createAccountDto,
      userId,
    });
    return this.accountRepository.save(account);
  }

  async findAll(userId: string): Promise<Account[]> {
    return this.accountRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, userId: string): Promise<Account> {
    const account = await this.accountRepository.findOne({
      where: { id, userId },
    });
    if (!account) throw new NotFoundException('Account not found');
    return account;
  }

  async update(id: string, updateDto: UpdateAccountDto, userId: string): Promise<Account> {
    const account = await this.findOne(id, userId);


    if (updateDto.name && updateDto.name !== account.name) {
      const isAccountExist = await this.accountExistsForUser(updateDto.name, userId);
      if (isAccountExist) {
        throw new ConflictException(`Account with name "${updateDto.name}" already exists for this user.`);
      }
    }

    const updated = this.accountRepository.merge(account, updateDto);
    return this.accountRepository.save(updated);
  }

  async remove(id: string, userId: string): Promise<void> {
    const account = await this.findOne(id, userId);
    await this.accountRepository.remove(account);
  }
}
