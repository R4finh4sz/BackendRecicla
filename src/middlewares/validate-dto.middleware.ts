import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { NextFunction, Request, Response } from "express";

type DtoClass<T extends object> = new () => T;

export function validateDto<T extends object>(Dto: DtoClass<T>) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const dto = plainToInstance(Dto, req.body);
    const errors = await validate(dto, {
      whitelist: true,
      forbidNonWhitelisted: true,
      skipMissingProperties: false,
    });

    if (errors.length > 0) {
      const fieldErrors = errors.reduce<Record<string, string[]>>((acc, error) => {
        acc[error.property] = Object.values(error.constraints ?? {});
        return acc;
      }, {});

      return res.status(400).json({
        message: "Dados inválidos",
        errors: fieldErrors,
      });
    }

    req.body = dto;
    return next();
  };
}
