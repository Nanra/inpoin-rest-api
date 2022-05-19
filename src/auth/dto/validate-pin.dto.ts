import { ApiProperty } from "@nestjs/swagger";

export class ValidatePinDto {
    @ApiProperty({
      type: String,
      description: "input the PIN code from the user's registered email"
    })  
      pin: string;
    }