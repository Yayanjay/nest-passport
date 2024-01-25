import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersEntity } from './entities/users.entity';
import { JwtService } from '@nestjs/jwt';

// This should be a real class/interface representing a user entity
export type User = any;

@Injectable()
export class UsersService {
  private readonly users = [
    {
      userId: 1,
      username: 'john',
      password: 'changeme',
    },
    {
      userId: 2,
      username: 'maria',
      password: 'guess',
    },
  ];
  constructor(
    @InjectRepository(UsersEntity)
    private userRepository: Repository<UsersEntity>,
    private jwtService: JwtService,
  ) {}

  async findOne(username: string): Promise<User | undefined> {
    return this.users.find((user) => user.username === username);
  }

  async findUser(username: string) {
    try {
      return await this.userRepository.findOneBy({ username: username });
    } catch (error) {}
  }

  async myInfo(token: string) {
    try {
      const data = this.jwtService.decode(token);
      console.log(data);

      const { id, password, ...profile } = await this.userRepository.findOneBy({
        username: data['username'],
      });
      
      return { profile };
    } catch (error) {
      return new InternalServerErrorException();
    }
  }
}
