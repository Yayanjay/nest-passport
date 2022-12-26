import { ApiProperty } from '@nestjs/swagger';

export class AuthLoginDto {
  id: string;

  @ApiProperty({ type: String })
  username: string;

  @ApiProperty({ type: String })
  password: string;
}
