import "dotenv/config";
import { prisma } from "@/lib/prisma";
import {
  createSearchHash,
  decryptSensitiveData,
  encryptSensitiveData,
} from "@/services/data-protection/data-protection.service";

async function main() {
  const users = await prisma.user.findMany();

  for (const user of users) {
    const email = decryptSensitiveData(user.email).trim().toLowerCase();
    const cpf = decryptSensitiveData(user.cpf).replace(/\D/g, "");

    await prisma.user.update({
      where: { id: user.id },
      data: {
        name: encryptSensitiveData(decryptSensitiveData(user.name)),
        cpf: encryptSensitiveData(cpf),
        cpfHash: createSearchHash(cpf),
        birthDate: encryptSensitiveData(decryptSensitiveData(user.birthDate)),
        phone: encryptSensitiveData(decryptSensitiveData(user.phone)),
        cep: encryptSensitiveData(decryptSensitiveData(user.cep)),
        address: encryptSensitiveData(decryptSensitiveData(user.address)),
        city: encryptSensitiveData(decryptSensitiveData(user.city)),
        state: encryptSensitiveData(decryptSensitiveData(user.state)),
        profilePhoto: user.profilePhoto
          ? encryptSensitiveData(decryptSensitiveData(user.profilePhoto))
          : null,
        email: encryptSensitiveData(email),
        emailHash: createSearchHash(email),
      },
    });
  }

  console.log(`${users.length} usuário(s) protegido(s) com sucesso.`);
}

main()
  .catch((error) => {
    console.error("Falha ao proteger os dados pessoais:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
