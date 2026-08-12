import { Injectable, NotFoundException, ConflictException, UnauthorizedException } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UserFilterDto } from './dto/user-filter.dto';
import { TaskStatus } from '@prisma/client';
import { createPaginatedResponse } from '../../common/utils/pagination.util';
import { PaginationDto } from '../../common/dto/pagination.dto';

/** Strip password from any user object before returning to client */
function stripPassword<T extends Record<string, any>>(user: T): Omit<T, 'password'> {
  const { password: _pw, ...safe } = user;
  return safe as Omit<T, 'password'>;
}

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async findAll(filterDto: UserFilterDto) {
    const { page = 1, limit = 20, search, role, status, sortBy, sortOrder } = filterDto;
    const { users, total } = await this.usersRepository.findAll({
      page, limit, search, role, status, sortBy, sortOrder,
    });
    // Strip password from every user in the list
    const safeUsers = users.map((u: any) => stripPassword(u));
    return createPaginatedResponse(safeUsers, total, page, limit);
  }

  async create(createUserDto: CreateUserDto) {
    const existing = await this.usersRepository.findByEmail(createUserDto.email);
    if (existing) {
      throw new ConflictException(`A user with email "${createUserDto.email}" already exists`);
    }
    const user = await this.usersRepository.create({
      name: createUserDto.name,
      email: createUserDto.email,
      role: createUserDto.role ?? 'DEVELOPER',
      status: 'ACTIVE',
      jobTitle: createUserDto.jobTitle,
      department: createUserDto.department,
      phone: createUserDto.phone,
      timezone: createUserDto.timezone ?? 'UTC',
      bio: createUserDto.bio,
      password: (createUserDto as any).password,
    } as any);
    return stripPassword(user as any);
  }

  async findById(id: string) {
    const user = await this.usersRepository.findById(id);
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return stripPassword(user as any);
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    await this.findById(id);
    const updated = await this.usersRepository.update(id, updateUserDto);
    return stripPassword(updated as any);
  }

  async changePassword(id: string, dto: ChangePasswordDto) {
    // findByEmail returns raw user including password
    const userBasic = await this.findById(id);
    const userRecord = await this.usersRepository.findByEmail((userBasic as any).email);
    const pw = (userRecord as any)?.password;
    if (!pw) {
      throw new UnauthorizedException('No password set for this account');
    }
    if (pw !== dto.currentPassword) {
      throw new UnauthorizedException('Current password is incorrect');
    }
    await this.usersRepository.update(id, { password: dto.newPassword } as any);
    return { message: 'Password updated successfully' };
  }

  async getUserTasks(
    id: string,
    paginationDto: PaginationDto & { status?: TaskStatus },
  ) {
    await this.findById(id);
    const { page = 1, limit = 20, sortBy, sortOrder, status } = paginationDto;
    const { tasks, total } = await this.usersRepository.getUserTasks({
      userId: id, page, limit, status, sortBy, sortOrder,
    });
    return createPaginatedResponse(tasks, total, page, limit);
  }

  async getUserActivity(id: string, paginationDto: PaginationDto) {
    await this.findById(id);
    const { page = 1, limit = 20 } = paginationDto;
    const { activity, total } = await this.usersRepository.getUserActivity({
      userId: id, page, limit,
    });
    return createPaginatedResponse(activity, total, page, limit);
  }
}
