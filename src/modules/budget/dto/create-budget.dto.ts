import {
    IsString,
    IsNotEmpty,
    IsNumber,
    IsDate,
    IsBoolean,
    IsOptional,
    IsIn,
    IsUUID,
  } from 'class-validator';
  import { Type } from 'class-transformer';
  
  export class CreateBudgetDto {
    @IsNotEmpty()
    userId: string;
  
    @IsString()
    @IsNotEmpty()
    name: string;
  
    @IsNumber()
    @IsNotEmpty()
    amount: number;
  
    @Type(() => Date)
    @IsDate()
    @IsNotEmpty()
    startDate: Date;

    @IsNotEmpty()
    categoryId: string;
  
    @IsBoolean()
    @IsNotEmpty()
    isRecurring: boolean;
  
    @IsOptional()
    @IsIn(['monthly', 'weekly', 'yearly'])
    recurrenceType?: string;
  
    @IsOptional()
    @IsNumber()
    resetDay?: number;
  
    @IsOptional()
    @Type(() => Date)
    @IsDate()
    nextResetDate?: Date;
  }
  