import { ApiProperty } from "@nestjs/swagger";

export class RegisterDto {
  @ApiProperty({
    type: String,
    description: "the desired username of the user account",
  })  
  username: string;
  @ApiProperty({
    type: String,
    description: "the organization of the user",
  })    
  organization: string;
  @ApiProperty({
    type: String,
    description: "the desired password of the user account",
  })  
  password: string;
  @ApiProperty({
    type: String,
    description: "the desired user active email to be registered",
  })  
  email: string;
  @ApiProperty({
    type: String,
    description: "the desired user phone number to be registered",
  })  
  phone_number: string;
}
