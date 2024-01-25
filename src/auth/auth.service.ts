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
import {
  BadRequestException,
  ConflictException,
} from '@nestjs/common/exceptions';
import { use } from 'passport';

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
      const savedUser = await this.userRepository.findOneBy({
        username: user.username,
      });

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
        roles: [savedUser.role],
        previlage: [],
      };
      // console.log(payload);
      const data = this.jwtService.sign(payload);
      if (isMatched) {
        return {
          statusCode: 200,
          message: 'Login Succeed',
          data: { access_token: data },
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

  async register(request: AuthRegisterDTO) {
    try {
      const isUserExist = await this.userRepository.findBy({
        username: request.username,
      });
      console.log(isUserExist);

      if (isUserExist.length >= 1) {
        return new ConflictException('Username Already Exist');
      }
      const hashedPassword = await this.encryptAndHashing.hashPassword(
        request.password,
      );
      const newUser = this.userRepository.create({
        email: request.email,
        username: request.username,
        fullname: request.fullname,
        password: hashedPassword,
        role: request.role,
      });

      const { password, id, ...data } = await this.userRepository.save(newUser);
      console.log(data);

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
