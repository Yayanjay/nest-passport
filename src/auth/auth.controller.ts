import { Controller, Body } from '@nestjs/common';
import { Post } from '@nestjs/common/decorators';
import {
  ApiBody,
  ApiTags,
  ApiNotFoundResponse,
  ApiOkResponse,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { AuthLoginDto } from './dtos/auth-login.dto';
import { AuthRegisterDTO } from './dtos/auth-register.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiBody({ type: AuthLoginDto })
  @ApiNotFoundResponse({ description: 'User Not Found', type: AuthLoginDto })
  @ApiOkResponse()
  @Post('login')
  async login(@Body() req: AuthLoginDto) {
    return this.authService.login(req);
  }

  @ApiBody({ type: AuthRegisterDTO })
  @Post('register')
  async register(@Body() req: AuthRegisterDTO) {
    return this.authService.register(req);
  }
}
