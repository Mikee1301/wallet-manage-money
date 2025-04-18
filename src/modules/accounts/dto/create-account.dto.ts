import { IsEnum, IsNotEmpty, IsOptional, IsString, IsNumber, Min } from 'class-validator';
import { AccountType } from '../../../common/enums/account.type.enums';

export class CreateAccountDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsEnum(AccountType, { message: 'type must be one of: CASH, BANK, CREDIT, DEBIT,WALLET,OTHER' })
  type?: AccountType;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  @Min(0, { message: 'Initial amount must be a positive number' })
  balance: number; 
}
