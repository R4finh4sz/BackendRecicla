import { Transform } from "class-transformer";
import { IsInt, IsString, IsUUID, Matches, Max, MaxLength, Min, MinLength } from "class-validator";

const moneyPattern = /^\d{1,10}(?:[.,]\d{1,2})?$/;

export class CreateProductDto {
  @Transform(({ value }) => typeof value === "string" ? value.trim() : value)
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  name!: string;

  @Transform(({ value }) => typeof value === "string" ? value.trim() : value)
  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  description!: string;

  @Transform(({ value }) => typeof value === "string" ? value.trim() : value)
  @IsString()
  @MinLength(1)
  @MaxLength(2048)
  photo!: string;

  @Transform(({ value }) => String(value).replace(",", "."))
  @Matches(moneyPattern, { message: "Valor deve ser monetário e ter no máximo duas casas decimais" })
  price!: string;

  @IsInt()
  @Min(0)
  @Max(2147483647)
  quantity!: number;
}

export class GrantEcoCoinDto {
  @IsUUID()
  userId!: string;

  @Transform(({ value }) => String(value).replace(",", "."))
  @Matches(moneyPattern, { message: "Valor deve ser monetário e ter no máximo duas casas decimais" })
  amount!: string;
}

export class RedeemProductDto {
  @IsUUID()
  productId!: string;

  @IsInt()
  @Min(1)
  @Max(1000)
  quantity!: number;
}

export class ValidatePickupDto {
  @Transform(({ value }) => typeof value === "string" ? value.trim().toUpperCase() : value)
  @IsString()
  @Matches(/^[A-F0-9]{12}$/i, { message: "Código de retirada inválido" })
  code!: string;
}
