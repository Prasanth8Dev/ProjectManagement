import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersRepository } from '../users/users.repository';

@Injectable()
export class AuthService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async login(email: string, password: string) {
    const user = await this.usersRepository.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!user.password) {
      throw new UnauthorizedException(
        'No password set for this account. Set one directly in the database.',
      );
    }

    if (user.password !== password) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Return user without password field
    const { password: _, ...safeUser } = user;
    return safeUser;
  }
}
