import { BadRequestException, Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Put, Req, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { BudgetService } from './budget.service';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { JwtGuard } from '../../common/guards/jwt.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/role.decorator';
import { Role } from '../../common/enums/role.enum';
import { UpdateBudgetDto } from './dto/update-budget.dto';
import { User } from '../../common/decorators/user.decorator';


@Controller('budgets')
@UseGuards(JwtGuard, RolesGuard)
export class BudgetController {
    constructor(private readonly budgetService: BudgetService){}

    @Post()
    @Roles(Role.ADMIN,Role.USER)
    @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    async createBudget(@Body() createBudgetDto: CreateBudgetDto,  @User('id') userId: string) {
        return this.budgetService.create(createBudgetDto,userId);
    }

    @Get()
    @Roles(Role.ADMIN,Role.USER)
    async getBudgets(@User('id') userId: string) {
        return this.budgetService.findAll(userId);
    }

    @Get(':budgetId')
    @Roles(Role.ADMIN, Role.USER)
    async getBudget(
        @Param('budgetId', ParseUUIDPipe) budgetId: string,
        @User('id') userId: string
    ) {
        return this.budgetService.findById(budgetId, userId);
    }

    @Put(':budgetId')
    @Roles(Role.ADMIN,Role.USER)
    async updateBudget(
        @Param('budgetId', ParseUUIDPipe) budgetId: string,
        @Body() updateBudgetDto: UpdateBudgetDto, 
        @User('id') userId: string
    ) {
        return this.budgetService.update(budgetId, updateBudgetDto, userId);
    }   

    @Delete(':budgetId')
    @Roles(Role.ADMIN,Role.USER)
    async deleteBudget(
        @Param('budgetId', ParseUUIDPipe) budgetId: string,
        @User('id') userId: string
    ) {
        return this.budgetService.remove(budgetId, userId);
    }

}
