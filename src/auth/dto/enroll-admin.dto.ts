import { ApiProperty } from "@nestjs/swagger";

export class EnrollAdminDto {
@ApiProperty({
  type: String,
  description: "sets organization with admin authority"
})  
  organization: string;
}
