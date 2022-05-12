import { ApiProperty } from "@nestjs/swagger";

export class ValidateOtpDto {
@ApiProperty({
  type: String,
  description: "input the received OTP code from the user's registered email"
})  
  otp_code: string;
}