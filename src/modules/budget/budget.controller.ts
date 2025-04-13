import { BadRequestException, Body, Controller, Delete, Get, Param, Post, Put, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { BudgetService } from './budget.service';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { JwtGuard } from '../../common/guards/jwt.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/role.decorator';
import { Role } from '../../common/enums/role.enum';
import { UsersService } from '../users/users.service';
import { UpdateBudgetDto } from './dto/update-budget.dto';



@Controller('budget')
@UseGuards(JwtGuard, RolesGuard)
export class BudgetController {
    constructor(private readonly budgetService: BudgetService,private readonly userService: UsersService){}

    @Post()
    @Roles(Role.ADMIN,Role.USER)
    @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    async createBudget(@Body() createBudgetDto: CreateBudgetDto) {
        const isBudgetExist = await this.budgetService.findByName(createBudgetDto.name);
        if (isBudgetExist) throw new BadRequestException( "Budget name already exists!" );
        return this.budgetService.create(createBudgetDto);
    }

    @Get(':userId/:budgetId')
    @Roles(Role.ADMIN,Role.USER)
    async getBudgets(@Param('userId') userId: number, @Param('budgetId') budgetId: string) {
        if (!userId || !budgetId)  throw new BadRequestException('userId and budgetId are required.');

        const user = await this.userService.findOne(userId);
        if (!user) throw new BadRequestException('User not found');

        const budget = await this.budgetService.findById(budgetId);
        if (!budget) throw new BadRequestException('Budget not found');

        return budget;
    }

    @Put(':userId/:budgetId')
    @Roles(Role.ADMIN,Role.USER)
    async updateBudget(@Param('userId') userId: number, @Param('budgetId') budgetId: string, @Body() updateBudgetDto: UpdateBudgetDto) {
        const user = await this.userService.findOne(userId);
        if (!user) throw new BadRequestException('User not found');
        if (!budgetId)  throw new BadRequestException('budgetId is required!');
        return this.budgetService.update(budgetId, updateBudgetDto);
    }   

    @Delete(':userId/:budgetId')
    @Roles(Role.ADMIN,Role.USER)
    async deleteBudget(@Param('userId') userId: number, @Param('budgetId') budgetId: string) {
        const user = await this.userService.findOne(userId);
        if (!user) throw new BadRequestException('User not found');
        if (!budgetId)  throw new BadRequestException('budgetId is required!');
        return this.budgetService.remove(budgetId);
    }

}
