export interface RegisterInput {
  name: string;
  cpf: string;
  birthDate: Date;
  phone: string;
  cep: string;
  address: string;
  city: string;
  state: string;
  profilePhoto?: string;
  termsAccepted: true;
  email: string;
  password: string;
  passwordConfirmation: string;
}
