/* eslint-disable prettier/prettier */
import { JwtService } from '@nestjs/jwt';
import { compare, genSalt, hash } from 'bcrypt';

export class EncryptAndHashing {
  constructor(private jwtService: JwtService) {

  }

  async hashPassword(password) {
    try {
      const salt = await genSalt(10);
      const hashedPassword = await hash(password, salt);
      return hashedPassword;
    } catch (error) {
      throw error;
    }
  }

  async validatePassword(passwordInput, passwordHashed) {
    try {
      const isMatched = await compare(passwordInput, passwordHashed);
      return isMatched;
    } catch (error) {
      throw error;
    }
  }

  async generateToken(payload) {
    try {
        console.log(payload);
        const data = this.jwtService.sign(payload);
        return data
    } catch (error) {
        throw error;
    }
  }
}
