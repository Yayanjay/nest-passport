/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import { AuthLoginDto } from './dtos/auth-login.dto';
import { AuthRegisterDTO } from './dtos/auth-register.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersEntity } from 'src/users/entities/users.entity';
import { EncryptAndHashing } from 'src/utils/encryptAndHash';
import { BadRequestException } from '@nestjs/common/exceptions';

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private jwtService: JwtService,
    @InjectRepository(UsersEntity)
    private userRepository: Repository<UsersEntity>,
    private encryptAndHashing: EncryptAndHashing,
  ) {}

  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.userService.findOne(username);
    if (user && user.password === password) {
      const { password, ...res } = user;
      return res;
    }

    return null;
  }

  async login(user: AuthLoginDto) {
    try {
      const savedUser = await this.userRepository
        .createQueryBuilder('users')
        .where('users.username = :username', { username: user.username })
        .getOne();

      if (!savedUser) {
        return new NotFoundException('User Not Found', {
          cause: new Error(),
          description: 'Please Kindly Check if User Already Registered or Not',
        }).getResponse();
      }

      const isMatched = await this.encryptAndHashing.validatePassword(
        user.password,
        savedUser.password,
      );
      const payload = {
        sub: savedUser.id,
        username: savedUser.username,
        email: savedUser.email,
        roles: [],
        previlage: [],
      };
      // console.log(payload);
      const data = this.jwtService.sign(payload);
      if (isMatched) {
        return {
          statusCode: 200,
          message: 'Login Succeed',
          data: { ...payload, access_token: data },
        };
      }
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException();
    }
    // const payload = { username: user.username, sub: user.id };
    // return {
    //   access_token: this.jwtService.sign(payload),
    // };
  }

  async register(user: AuthRegisterDTO) {
    try {
      const hashedPassword = await this.encryptAndHashing.hashPassword(
        user.password,
      );
      const newUser = this.userRepository.create({
        email: user.email,
        username: user.username,
        password: hashedPassword,
      });

      const { password, ...data } = await this.userRepository.save(newUser);

      return {
        status: 201,
        desc: 'Created',
        data: data,
      };
    } catch (error) {
      return new InternalServerErrorException();
    }
  }
}
