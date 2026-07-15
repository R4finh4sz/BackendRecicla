import { Transform } from "class-transformer";
import { IsIn, IsOptional, IsString, MaxLength, MinLength } from "class-validator";

export class CreateTermDto {
  @IsOptional()
  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  @IsString({ message: "Título deve ser um texto" })
  @MaxLength(150, { message: "Título muito longo" })
  title?: string;

  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  @IsString({ message: "Texto obrigatório" })
  @MinLength(1, { message: "Texto obrigatório" })
  text!: string;

  @IsIn(["USER", "ADMIN"], { message: "Tipo deve ser USER ou ADMIN" })
  type!: "USER" | "ADMIN";
}
