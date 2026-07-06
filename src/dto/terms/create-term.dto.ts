import { Transform } from "class-transformer";
import { IsIn, IsOptional, IsString, MaxLength, MinLength } from "class-validator";

export class CreateTermDto {
  @IsOptional()
  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  @IsString({ message: "Titulo deve ser um texto" })
  @MaxLength(150, { message: "Titulo muito longo" })
  title?: string;

  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  @IsString({ message: "Texto obrigatorio" })
  @MinLength(1, { message: "Texto obrigatorio" })
  text!: string;

  @IsIn(["USER", "ADMIN"], { message: "Tipo deve ser USER ou ADMIN" })
  type!: "USER" | "ADMIN";
}
