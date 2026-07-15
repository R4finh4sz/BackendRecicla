import { z } from "zod";

const REQUIRED_FIELD_MESSAGE = "Campo obrigatório";

function normalizeText(value: string) {
  return value.trim().toLowerCase();
}

function onlyDigits(value: string) {
  return value.replace(/\D/g, "");
}

function isValidCpf(value: string) {
  const cpf = onlyDigits(value);

  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) {
    return false;
  }

  const calculateDigit = (base: string, factor: number) => {
    const total = base
      .split("")
      .reduce((sum, digit) => sum + Number(digit) * factor--, 0);
    const remainder = (total * 10) % 11;

    return remainder === 10 ? 0 : remainder;
  };

  const firstDigit = calculateDigit(cpf.slice(0, 9), 10);
  const secondDigit = calculateDigit(cpf.slice(0, 10), 11);

  return firstDigit === Number(cpf[9]) && secondDigit === Number(cpf[10]);
}

function isAtLeast18YearsOld(birthDate: Date) {
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const hadBirthdayThisYear =
    today.getMonth() > birthDate.getMonth() ||
    (today.getMonth() === birthDate.getMonth() && today.getDate() >= birthDate.getDate());

  if (!hadBirthdayThisYear) {
    age--;
  }

  return age >= 18;
}

export const registerSchema = z.object({
  name: z
    .string({ required_error: REQUIRED_FIELD_MESSAGE })
    .transform(normalizeText)
    .pipe(z.string().min(2, "Nome deve ter pelo menos 2 caracteres").max(100, "Nome muito longo")),
  cpf: z
    .string({ required_error: REQUIRED_FIELD_MESSAGE })
    .transform(onlyDigits)
    .pipe(z.string().refine(isValidCpf, "CPF inválido")),
  birthDate: z
    .coerce
    .date({
      required_error: REQUIRED_FIELD_MESSAGE,
      invalid_type_error: "Data de nascimento inválida",
    })
    .refine((date) => date <= new Date(), "Data de nascimento inválida")
    .refine(isAtLeast18YearsOld, "Usuário deve ter pelo menos 18 anos"),
  phone: z
    .string({ required_error: REQUIRED_FIELD_MESSAGE })
    .transform(onlyDigits)
    .pipe(z.string().min(10, "Telefone inválido").max(11, "Telefone inválido")),
  cep: z
    .string({ required_error: REQUIRED_FIELD_MESSAGE })
    .transform(onlyDigits)
    .pipe(z.string().length(8, "CEP inválido")),
  address: z
    .string({ required_error: REQUIRED_FIELD_MESSAGE })
    .transform(normalizeText)
    .pipe(z.string().min(2, "Endereço obrigatório").max(255, "Endereço muito longo")),
  city: z
    .string({ required_error: REQUIRED_FIELD_MESSAGE })
    .transform(normalizeText)
    .pipe(z.string().min(2, "Cidade obrigatória").max(100, "Cidade muito longa")),
  state: z
    .string({ required_error: REQUIRED_FIELD_MESSAGE })
    .transform(normalizeText)
    .pipe(z.string().min(2, "Estado obrigatório").max(50, "Estado muito longo")),
  profilePhoto: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value ? value.toLowerCase() : undefined)),
  termsAccepted: z.literal(true, {
    errorMap: () => ({ message: "Aceite dos termos obrigatório" }),
  }),
  email: z
    .string({ required_error: REQUIRED_FIELD_MESSAGE })
    .trim()
    .email("E-mail inválido")
    .transform((email) => email.toLowerCase()),
  password: z
    .string({ required_error: REQUIRED_FIELD_MESSAGE })
    .min(8, "Senha deve ter pelo menos 8 caracteres")
    .max(128, "Senha muito longa"),
  passwordConfirmation: z
    .string({ required_error: REQUIRED_FIELD_MESSAGE })
    .min(8, "Confirmação de senha obrigatória")
    .max(128, "Confirmação de senha muito longa"),
}).refine((data) => data.password === data.passwordConfirmation, {
  message: "Senhas não conferem",
  path: ["passwordConfirmation"],
});
