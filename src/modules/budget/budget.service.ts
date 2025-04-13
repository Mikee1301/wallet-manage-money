import { BadRequestException, Injectable } from '@nestjs/common';
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

    async findByName(name: string): Promise<Budget> {
        const query = this.budgetsRepository.createQueryBuilder('budget');
        return query.where('LOWER(budget.name) = :name', { name: name.toLowerCase() })
            .getOne();
    }

    async create(createBudgetDto: CreateBudgetDto): Promise<Budget> {
        const budget = this.budgetsRepository.create({
            ...createBudgetDto,
            remainingAmount: createBudgetDto.amount,
          });
        const isBudgetExist = await this.findByName(createBudgetDto.name);
        if (isBudgetExist) throw new BadRequestException( "Budget name already exists!" );
        return this.budgetsRepository.save(budget);
    }

    async findAll(): Promise<Budget[]> {
        return this.budgetsRepository.find();
    }

    async findById(id: string): Promise<Budget> {
        const budget = await this.budgetsRepository.findOne({ where: { id } });
        if (!budget) throw new BadRequestException(`Budget with ID ${id} not found`);
        return budget;
    }
    async update(id: string, updateBudgetDto: UpdateBudgetDto): Promise<Budget> {
        const budget = await this.budgetsRepository.findOne({ where: { id } });
        if (!budget) throw new BadRequestException('Budget not found');
        await this.budgetsRepository.update(id, updateBudgetDto);
        return budget;
    }
    async remove(id: string): Promise<{ message: string; deletedId: string }> {
        const result = await this.budgetsRepository.delete(id);
        if (!result.affected) throw new BadRequestException('Budget not found');
        return {
            message: 'Budget successfully deleted',
            deletedId: id,
        };
    }
}
