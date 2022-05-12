import { ApiProperty } from "@nestjs/swagger";

export class EnrollAdminDto {
@ApiProperty({
  type: String,
  description: "Sets organization with admin authority"
})  
  organization: string;
}
