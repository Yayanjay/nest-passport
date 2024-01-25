import { ApiProperty } from '@nestjs/swagger';

export class AuthRegisterDTO {
  @ApiProperty({ type: String })
  fullname: string;
  
  @ApiProperty({ type: String })
  email: string;

  @ApiProperty({ type: String })
  username: string;

  @ApiProperty({ type: String })
  password: string;

  @ApiProperty({ type: String })
  role: string;
}
