import { ApiProperty } from "@nestjs/swagger";

export class LoginDto {
@ApiProperty({
  type: String,
  description: "The email of the registered user account",
})
  email: string;
@ApiProperty({
  type: String,
  description: "The organization of the user",
})  
  organization: string;
@ApiProperty({
  type: String,
  description: "The password of the registered user account",
})
  password: string;
}
