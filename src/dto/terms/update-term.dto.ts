import { Transform } from "class-transformer";
import { IsOptional, IsString, MaxLength, MinLength } from "class-validator";

export class UpdateTermDto {
  @IsOptional()
  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  @IsString({ message: "Titulo deve ser um texto" })
  @MaxLength(150, { message: "Titulo muito longo" })
  title?: string;

  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  @IsString({ message: "Texto obrigatorio" })
  @MinLength(1, { message: "Texto obrigatorio" })
  text!: string;
}
