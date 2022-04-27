import { ApiProperty } from "@nestjs/swagger";

export class LoginDto {
@ApiProperty({
  type: String,
  description: "the username of the registered user account",
})
  username: string;
@ApiProperty({
  type: String,
  description: "the organization of the user",
})  
  organization: string;
@ApiProperty({
  type: String,
  description: "the password of the registered user account",
})
  password: string;
}
