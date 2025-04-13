import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Budget } from './entities/budget.entity';
import { Repository } from 'typeorm';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';


@Injectable()
export class BudgetService {
    constructor(
        @InjectRepository(Budget)
        private budgetsRepository: Repository<Budget>,
    ) {}

    async findByNameForUser(budgetName: string, userId: string): Promise<Budget> {
        const query = this.budgetsRepository.createQueryBuilder('budget');
        return query
            .where('LOWER(budget.name) = :name', { name: budgetName.toLowerCase() })
            .andWhere('budget.userId = :userId', {userId})
            .getOne();
    }

    async create(createBudgetDto: CreateBudgetDto, userId: string): Promise<Budget> {
        const isBudgetExist = await this.findByNameForUser(createBudgetDto.name, userId);
        if (isBudgetExist) throw new ConflictException(`Budget with name "${createBudgetDto.name}" already exists for this user.`);
        const budget = this.budgetsRepository.create({
            ...createBudgetDto,
            remainingAmount: createBudgetDto.amount,
            userId: userId,
          });
        return this.budgetsRepository.save(budget);
    }

    async findAll(userId: string): Promise<Budget[]> {
        return this.budgetsRepository.find({where: {userId}});
    }

    async findById(budgetId: string, userId: string): Promise<Budget> {
        const budget = await this.budgetsRepository.findOne({
            where: { 
                id:budgetId, 
                userId },
          });
        if (!budget) throw new BadRequestException(`Budget with ID ${budgetId} not found`);
        return budget;
    }
    async update(budgetId: string, updateBudgetDto: UpdateBudgetDto, userId: string): Promise<Budget> {
        const budget = await this.findById(budgetId, userId);
        this.budgetsRepository.merge(budget, updateBudgetDto);
        const updatedBudget = await this.budgetsRepository.save(budget);
        return updatedBudget;
    }
    async remove(budgetId: string, userId: string): Promise<{ message: string; deletedId: string }> {
        await this.findById(budgetId, userId);
        const result = await this.budgetsRepository.delete({ id:budgetId, userId });
        if (!result.affected || result.affected === 0) {
           throw new NotFoundException(`Budget with ID ${budgetId} not found or not accessible by this user.`);
       }
       return {
           message: 'Budget successfully deleted',
           deletedId: budgetId,
       };
    }
}
