/* eslint-disable prettier/prettier */
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private userService:UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme('Bearer'),
      ignoreExpiration: false,
      secretOrKey: `${process.env.JWT_SECRET}`,
    });
    
  }

  async validate(payload: any) {
    const { username } = payload;
    const user = await this.userService.findUser(username);
    if (!user) {
      throw new UnauthorizedException()
    }

    return user
  }
  // async validate(payload: any) {
  //   const user = await this.userRepository.find();
  //   console.log(`env ${process.env.JWT_SECRET}`);
  //   console.log(`payload ${payload}`);
  //   if (!user) {
  //     return new UnauthorizedException();
  //   }
  //   return payload;
  // }
}
