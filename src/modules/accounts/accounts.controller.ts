import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Req,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AccountService } from './accounts.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { JwtGuard } from '../../common/guards/jwt.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/role.decorator';
import { Role } from '../../common/enums/role.enum';
import { User } from '../../common/decorators/user.decorator';

@Controller('accounts')
@UseGuards(JwtGuard, RolesGuard)
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Post()
  @Roles(Role.ADMIN, Role.USER)
  async createAccount(
    @Body() createAccountDto: CreateAccountDto,
    @User('id') userId: string,
  ) {
    console.log(userId);
    return this.accountService.create(createAccountDto, userId);
  }

  @Get()
  @Roles(Role.ADMIN, Role.USER)
  async getAccounts(@User('id') userId: string) {
    return this.accountService.findAll(userId);
  }

  @Get(':accountId')
  @Roles(Role.ADMIN, Role.USER)
  async getAccount(
    @Param('accountId', ParseUUIDPipe) accountId: string,
    @User('id') userId: string,
  ) {
    return this.accountService.findOne(accountId, userId);
  }

  @Put(':accountId')
  @Roles(Role.ADMIN, Role.USER)
  async updateAccount(
    @Param('accountId', ParseUUIDPipe) accountId: string,
    @Body() updateAccountDto: UpdateAccountDto,
    @User('id') userId: string,
  ) {
    return this.accountService.update(accountId, updateAccountDto, userId);
  }

  @Delete(':accountId')
  @Roles(Role.ADMIN, Role.USER)
  async deleteAccount(
    @Param('accountId', ParseUUIDPipe) accountId: string,
    @User('id') userId: string,
  ) {
    return this.accountService.remove(accountId, userId);
  }
}
