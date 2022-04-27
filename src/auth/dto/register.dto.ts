import { ApiProperty } from "@nestjs/swagger";

export class RegisterDto {
  @ApiProperty({
    type: String,
    description: "The desired username of the user account",
  })  
  username: string;
  @ApiProperty({
    type: String,
    description: "The organization of the user",
  })    
  organization: string;
  @ApiProperty({
    type: String,
    description: "The desired password of the user account",
  })  
  password: string;
  @ApiProperty({
    type: String,
    description: "The desired user active email to be registered",
  })  
  email: string;
  @ApiProperty({
    type: String,
    description: "The desired user phone number to be registered",
  })  
  phone_number: string;
}
