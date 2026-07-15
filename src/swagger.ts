import swaggerJSDoc from "swagger-jsdoc";

export const swaggerSpec = swaggerJSDoc({
  definition: {
    openapi: "3.0.0",
    info: {
      title: "ReciclaOnline API",
      version: "1.0.0",
      description: "Documentacao da API do Backend ReciclaOnline",
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Servidor local",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        RegisterInput: {
          type: "object",
          required: [
            "name",
            "cpf",
            "birthDate",
            "phone",
            "cep",
            "address",
            "city",
            "state",
            "termsAccepted",
            "email",
            "password",
            "passwordConfirmation",
          ],
          properties: {
            name: {
              type: "string",
              minLength: 2,
              maxLength: 100,
              example: "joao da silva",
            },
            cpf: {
              type: "string",
              minLength: 11,
              maxLength: 14,
              example: "12345678909",
            },
            birthDate: {
              type: "string",
              format: "date",
              example: "1990-05-20",
            },
            phone: {
              type: "string",
              example: "11999999999",
            },
            cep: {
              type: "string",
              example: "01001000",
            },
            address: {
              type: "string",
              example: "rua exemplo, 123",
            },
            city: {
              type: "string",
              example: "sao paulo",
            },
            state: {
              type: "string",
              example: "sp",
            },
            profilePhoto: {
              type: "string",
              nullable: true,
              example: "https://exemplo.com/foto.jpg",
            },
            termsAccepted: {
              type: "boolean",
              enum: [true],
              example: true,
            },
            email: {
              type: "string",
              format: "email",
              example: "usuario@email.com",
            },
            password: {
              type: "string",
              minLength: 8,
              maxLength: 128,
              example: "12345678",
            },
            passwordConfirmation: {
              type: "string",
              minLength: 8,
              maxLength: 128,
              example: "12345678",
            },
          },
        },
        LoginInput: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: {
              type: "string",
              format: "email",
              example: "usuario@email.com",
            },
            password: {
              type: "string",
              minLength: 1,
              maxLength: 128,
              example: "12345678",
            },
          },
        },
        VerifyTwoFactorInput: {
          type: "object",
          required: ["challengeId", "code"],
          properties: {
            challengeId: {
              type: "string",
              format: "uuid",
              example: "3f57a0f8-6f3c-4b19-a0e2-6b4e8b7a1f2a",
            },
            code: {
              type: "string",
              pattern: "^\\d{6}$",
              example: "123456",
            },
          },
        },
        ForgotPasswordInput: {
          type: "object",
          required: ["email"],
          properties: {
            email: {
              type: "string",
              format: "email",
              example: "usuario@email.com",
            },
          },
        },
        VerifyPasswordResetCodeInput: {
          type: "object",
          required: ["challengeId", "code"],
          properties: {
            challengeId: {
              type: "string",
              format: "uuid",
              example: "3f57a0f8-6f3c-4b19-a0e2-6b4e8b7a1f2a",
            },
            code: {
              type: "string",
              pattern: "^\\d{6}$",
              example: "123456",
            },
          },
        },
        ResetPasswordInput: {
          type: "object",
          required: ["resetToken", "password", "passwordConfirmation"],
          properties: {
            resetToken: {
              type: "string",
              description: "Token temporario retornado depois da validacao do codigo",
            },
            password: {
              type: "string",
              format: "password",
              minLength: 8,
              maxLength: 128,
              example: "NovaSenha123",
            },
            passwordConfirmation: {
              type: "string",
              format: "password",
              minLength: 8,
              maxLength: 128,
              example: "NovaSenha123",
            },
          },
        },
        ForgotPasswordResponse: {
          type: "object",
          properties: {
            challengeId: { type: "string", format: "uuid" },
            expiresAt: { type: "string", format: "date-time" },
            message: { type: "string", example: "Código de recuperação enviado por e-mail" },
          },
        },
        VerifyPasswordResetCodeResponse: {
          type: "object",
          properties: {
            resetToken: { type: "string" },
            expiresAt: { type: "string", format: "date-time" },
            message: { type: "string", example: "Código validado" },
          },
        },
        InvalidPasswordResetCodeResponse: {
          type: "object",
          properties: {
            message: { type: "string", example: "Código de recuperação inválido" },
          },
        },
        PasswordResetBlockedResponse: {
          type: "object",
          properties: {
            message: { type: "string", example: "Recuperacao bloqueada por 6 horas" },
            blockedUntil: { type: "string", format: "date-time" },
          },
        },
        User: {
          type: "object",
          properties: {
            id: {
              type: "string",
              format: "uuid",
            },
            name: {
              type: "string",
            },
            cpf: {
              type: "string",
            },
            birthDate: {
              type: "string",
              format: "date-time",
            },
            phone: {
              type: "string",
            },
            cep: {
              type: "string",
            },
            address: {
              type: "string",
            },
            city: {
              type: "string",
            },
            state: {
              type: "string",
            },
            profilePhoto: {
              type: "string",
              nullable: true,
            },
            email: {
              type: "string",
              format: "email",
            },
            role: {
              type: "string",
              enum: ["USER", "ADMIN", "MASTER"],
            },
            level: {
              type: "number",
              example: 1,
            },
          },
        },
        AuthenticatedUser: {
          type: "object",
          properties: {
            id: {
              type: "string",
              format: "uuid",
            },
            role: {
              type: "string",
              enum: ["USER", "ADMIN", "MASTER"],
            },
            level: {
              type: "number",
              example: 1,
            },
          },
        },
        RegisterResponse: {
          type: "object",
          properties: {
            user: {
              type: "object",
              properties: {
                id: { type: "string", format: "uuid" },
              },
            },
          },
        },
        LoginResponse: {
          type: "object",
          properties: {
            twoFactorRequired: {
              type: "boolean",
              enum: [true],
              example: true,
            },
            challengeId: {
              type: "string",
              format: "uuid",
            },
            expiresAt: {
              type: "string",
              format: "date-time",
              description: "Valido por ate 15 minutos",
            },
            message: {
              type: "string",
              example: "Código 2FA enviado para o e-mail cadastrado",
            },
          },
        },
        AuthResponse: {
          type: "object",
          properties: {
            token: {
              type: "string",
            },
          },
        },
        TermInput: {
          type: "object",
          required: ["text", "type"],
          properties: {
            title: {
              type: "string",
              nullable: true,
              example: "termos de uso",
            },
            text: {
              type: "string",
              example: "conteudo completo do termo",
            },
            type: {
              type: "string",
              enum: ["USER", "ADMIN"],
              example: "USER",
            },
          },
        },
        UpdateTermInput: {
          type: "object",
          required: ["text"],
          properties: {
            title: {
              type: "string",
              nullable: true,
              example: "termos de uso atualizados",
            },
            text: {
              type: "string",
              example: "novo conteudo completo do termo",
            },
          },
        },
        Term: {
          type: "object",
          properties: {
            id: {
              type: "string",
              format: "uuid",
            },
            documentId: {
              type: "string",
              format: "uuid",
            },
            title: {
              type: "string",
              nullable: true,
            },
            text: {
              type: "string",
            },
            type: {
              type: "string",
              enum: ["USER", "ADMIN"],
            },
            version: {
              type: "number",
              example: 3,
            },
            active: {
              type: "boolean",
              example: true,
            },
            createdAt: {
              type: "string",
              format: "date-time",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
            },
          },
        },
        TermAccept: {
          type: "object",
          properties: {
            accepted: {
              type: "boolean",
              example: true,
            },
            acceptedAt: {
              type: "string",
              format: "date-time",
            },
            documentId: { type: "string", format: "uuid" },
            version: { type: "integer", example: 3 },
          },
        },
        TermStatusResponse: {
          type: "object",
          properties: {
            accepted: {
              type: "boolean",
              example: false,
            },
            currentVersion: {
              type: "number",
              example: 3,
            },
            acceptedVersion: {
              type: "number",
              nullable: true,
              example: 2,
            },
          },
        },
        ErrorResponse: {
          type: "object",
          properties: {
            message: {
              type: "string",
            },
          },
        },
        ValidationErrorResponse: {
          type: "object",
          properties: {
            message: {
              type: "string",
              example: "Dados inválidos",
            },
            errors: {
              type: "object",
              additionalProperties: {
                type: "array",
                items: {
                  type: "string",
                },
              },
            },
          },
        },
      },
    },
    paths: {
      "/auth/register/user": {
        post: {
          tags: ["Auth"],
          summary: "Cadastra um usuario comum",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/RegisterInput",
                },
              },
            },
          },
          responses: {
            201: {
              description: "Usuário cadastrado",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/RegisterResponse",
                  },
                },
              },
            },
            400: {
              description: "Dados inválidos",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/ValidationErrorResponse",
                  },
                },
              },
            },
            409: {
              description: "E-mail ou CPF já cadastrado",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/ErrorResponse",
                  },
                },
              },
            },
            500: {
              description: "Erro interno",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/ErrorResponse",
                  },
                },
              },
            },
          },
        },
      },
      "/auth/register/admin": {
        post: {
          tags: ["Auth"],
          summary: "Cadastra um administrador",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/RegisterInput",
                },
              },
            },
          },
          responses: {
            201: {
              description: "Administrador cadastrado",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/RegisterResponse",
                  },
                },
              },
            },
            400: {
              description: "Dados inválidos",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/ValidationErrorResponse",
                  },
                },
              },
            },
            401: {
              description: "Token não informado ou inválido",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/ErrorResponse",
                  },
                },
              },
            },
            403: {
              description: "Acesso negado",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/ErrorResponse",
                  },
                },
              },
            },
            409: {
              description: "E-mail ou CPF já cadastrado",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/ErrorResponse",
                  },
                },
              },
            },
            500: {
              description: "Erro interno",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/ErrorResponse",
                  },
                },
              },
            },
          },
        },
      },
      "/auth/login": {
        post: {
          tags: ["Auth"],
          summary: "Realiza login",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/LoginInput",
                },
              },
            },
          },
          responses: {
            200: {
              description: "Credenciais validas e codigo 2FA enviado por e-mail",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/LoginResponse",
                  },
                },
              },
            },
            400: {
              description: "Dados inválidos",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/ValidationErrorResponse",
                  },
                },
              },
            },
            401: {
              description: "Credenciais invalidas",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/ErrorResponse",
                  },
                },
              },
            },
            403: {
              description: "Usuário desativado",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/ErrorResponse",
                  },
                },
              },
            },
            500: {
              description: "Erro interno",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/ErrorResponse",
                  },
                },
              },
            },
          },
        },
      },
      "/auth/2fa/verify": {
        post: {
          tags: ["Auth"],
          summary: "Valida o codigo 2FA enviado por e-mail",
          description:
            "Recebe o challengeId retornado no login e o codigo numerico de 6 digitos. O codigo expira em ate 15 minutos e o desafio bloqueia apos excesso de tentativas.",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/VerifyTwoFactorInput",
                },
              },
            },
          },
          responses: {
            200: {
              description: "Código validado e token emitido",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/AuthResponse",
                  },
                },
              },
            },
            400: {
              description: "Dados inválidos",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/ValidationErrorResponse",
                  },
                },
              },
            },
            401: {
              description: "Código inválido",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/ErrorResponse",
                  },
                },
              },
            },
            403: {
              description: "Código expirado ou usuário desativado",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/ErrorResponse",
                  },
                },
              },
            },
            404: {
              description: "Desafio 2FA não encontrado",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/ErrorResponse",
                  },
                },
              },
            },
            429: {
              description: "Muitas tentativas de validacao",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/ErrorResponse",
                  },
                },
              },
            },
            500: {
              description: "Erro interno",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/ErrorResponse",
                  },
                },
              },
            },
          },
        },
      },
      "/auth/password/forgot": {
        post: {
          tags: ["Auth"],
          summary: "Solicita a recuperação de senha",
          description: "Envia um codigo numerico de 6 digitos ao e-mail cadastrado. O codigo expira em 15 minutos.",
          requestBody: {
            required: true,
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/ForgotPasswordInput" } },
            },
          },
          responses: {
            200: {
              description: "Código enviado por e-mail",
              content: {
                "application/json": { schema: { $ref: "#/components/schemas/ForgotPasswordResponse" } },
              },
            },
            400: {
              description: "E-mail inválido",
              content: {
                "application/json": { schema: { $ref: "#/components/schemas/ValidationErrorResponse" } },
              },
            },
            500: {
              description: "Erro interno",
              content: {
                "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } },
              },
            },
          },
        },
      },
      "/auth/password/verify-code": {
        post: {
          tags: ["Auth"],
          summary: "Valida o código de recuperação de senha",
          description: "Permite 5 tentativas. A quinta falha bloqueia novas tentativas e solicitacoes por 6 horas.",
          requestBody: {
            required: true,
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/VerifyPasswordResetCodeInput" } },
            },
          },
          responses: {
            200: {
              description: "Código validado e token temporário emitido",
              content: {
                "application/json": { schema: { $ref: "#/components/schemas/VerifyPasswordResetCodeResponse" } },
              },
            },
            400: {
              description: "Dados inválidos",
              content: {
                "application/json": { schema: { $ref: "#/components/schemas/ValidationErrorResponse" } },
              },
            },
            401: {
              description: "Código inválido, expirado ou desafio inexistente",
              content: {
                "application/json": { schema: { $ref: "#/components/schemas/InvalidPasswordResetCodeResponse" } },
              },
            },
            429: {
              description: "Limite de tentativas atingido; bloqueio por 6 horas",
              content: {
                "application/json": { schema: { $ref: "#/components/schemas/PasswordResetBlockedResponse" } },
              },
            },
            500: {
              description: "Erro interno",
              content: {
                "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } },
              },
            },
          },
        },
      },
      "/auth/password/reset": {
        post: {
          tags: ["Auth"],
          summary: "Redefine a senha",
          description: "Consome o token temporario, altera a senha e revoga todas as sessoes abertas do usuario.",
          requestBody: {
            required: true,
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/ResetPasswordInput" } },
            },
          },
          responses: {
            200: {
              description: "Senha redefinida com sucesso",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: { message: { type: "string", example: "Senha redefinida com sucesso" } },
                  },
                },
              },
            },
            400: {
              description: "Senhas invalidas ou diferentes",
              content: {
                "application/json": { schema: { $ref: "#/components/schemas/ValidationErrorResponse" } },
              },
            },
            401: {
              description: "Token inválido, expirado ou já utilizado",
              content: {
                "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } },
              },
            },
            500: {
              description: "Erro interno",
              content: {
                "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } },
              },
            },
          },
        },
      },
      "/me": {
        get: {
          tags: ["Usuários"],
          summary: "Retorna o usuario autenticado",
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: "Usuário autenticado",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      user: {
                        $ref: "#/components/schemas/AuthenticatedUser",
                      },
                    },
                  },
                },
              },
            },
            401: {
              description: "Token não informado ou inválido",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/ErrorResponse",
                  },
                },
              },
            },
          },
        },
      },
      "/terms/create": {
        post: {
          tags: ["Termos"],
          summary: "Cria uma nova versao de termo",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/TermInput",
                },
              },
            },
          },
          responses: {
            201: {
              description: "Termo criado",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      term: {
                        $ref: "#/components/schemas/Term",
                      },
                    },
                  },
                },
              },
            },
            400: {
              description: "Dados inválidos",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/ValidationErrorResponse",
                  },
                },
              },
            },
            401: {
              description: "Token não informado ou inválido",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/ErrorResponse",
                  },
                },
              },
            },
            403: {
              description: "Acesso negado",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/ErrorResponse",
                  },
                },
              },
            },
          },
        },
      },
      "/terms/list": {
        get: {
          tags: ["Termos"],
          summary: "Lista todos os termos, incluindo versoes",
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: "Termos encontrados",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      terms: {
                        type: "array",
                        items: {
                          $ref: "#/components/schemas/Term",
                        },
                      },
                    },
                  },
                },
              },
            },
            401: {
              description: "Token não informado ou inválido",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/ErrorResponse",
                  },
                },
              },
            },
            403: {
              description: "Acesso negado",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/ErrorResponse",
                  },
                },
              },
            },
          },
        },
      },
      "/terms/edit/{documentId}": {
        put: {
          tags: ["Termos"],
          summary: "Atualiza um termo criando uma nova versao",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "documentId",
              in: "path",
              required: true,
              schema: {
                type: "string",
                format: "uuid",
              },
            },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/UpdateTermInput",
                },
              },
            },
          },
          responses: {
            201: {
              description: "Nova versao criada",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      term: {
                        $ref: "#/components/schemas/Term",
                      },
                    },
                  },
                },
              },
            },
            400: {
              description: "Dados inválidos",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/ValidationErrorResponse",
                  },
                },
              },
            },
            401: {
              description: "Token não informado ou inválido",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/ErrorResponse",
                  },
                },
              },
            },
            403: {
              description: "Acesso negado",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/ErrorResponse",
                  },
                },
              },
            },
            404: {
              description: "Termo não encontrado",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/ErrorResponse",
                  },
                },
              },
            },
          },
        },
      },
      "/terms/detail/{documentId}": {
        get: {
          tags: ["Termos"],
          summary: "Retorna um termo especifico",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "documentId",
              in: "path",
              required: true,
              schema: {
                type: "string",
                format: "uuid",
              },
            },
          ],
          responses: {
            200: {
              description: "Termo encontrado",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      term: {
                        $ref: "#/components/schemas/Term",
                      },
                    },
                  },
                },
              },
            },
            401: {
              description: "Token não informado ou inválido",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/ErrorResponse",
                  },
                },
              },
            },
            403: {
              description: "Acesso negado",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/ErrorResponse",
                  },
                },
              },
            },
            404: {
              description: "Termo não encontrado",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/ErrorResponse",
                  },
                },
              },
            },
          },
        },
      },
      "/terms/current": {
        get: {
          tags: ["Termos"],
          summary: "Retorna a versao ativa do termo da role do usuario",
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: "Termo vigente",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      term: {
                        $ref: "#/components/schemas/Term",
                      },
                    },
                  },
                },
              },
            },
            401: {
              description: "Token não informado ou inválido",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/ErrorResponse",
                  },
                },
              },
            },
            404: {
              description: "Termo vigente não encontrado",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/ErrorResponse",
                  },
                },
              },
            },
          },
        },
      },
      "/terms/status": {
        get: {
          tags: ["Termos"],
          summary: "Informa se o usuario aceitou a versao vigente",
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: "Status de aceite",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/TermStatusResponse",
                  },
                },
              },
            },
            401: {
              description: "Token não informado ou inválido",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/ErrorResponse",
                  },
                },
              },
            },
            404: {
              description: "Termo vigente não encontrado",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/ErrorResponse",
                  },
                },
              },
            },
          },
        },
      },
      "/terms/accept": {
        post: {
          tags: ["Termos"],
          summary: "Aceita a versao vigente do termo",
          security: [{ bearerAuth: [] }],
          responses: {
            201: {
              description: "Termo aceito",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      accept: {
                        $ref: "#/components/schemas/TermAccept",
                      },
                    },
                  },
                },
              },
            },
            401: {
              description: "Token não informado ou inválido",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/ErrorResponse",
                  },
                },
              },
            },
            404: {
              description: "Termo vigente não encontrado",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/ErrorResponse",
                  },
                },
              },
            },
            409: {
              description: "Termo vigente já aceito",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/ErrorResponse",
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  apis: [],
});
