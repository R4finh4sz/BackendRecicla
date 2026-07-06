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
        RegisterResponse: {
          type: "object",
          properties: {
            user: {
              $ref: "#/components/schemas/User",
            },
          },
        },
        LoginResponse: {
          type: "object",
          properties: {
            token: {
              type: "string",
            },
            user: {
              $ref: "#/components/schemas/User",
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
              example: "Dados invalidos",
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
              description: "Usuario cadastrado",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/RegisterResponse",
                  },
                },
              },
            },
            400: {
              description: "Dados invalidos",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/ValidationErrorResponse",
                  },
                },
              },
            },
            409: {
              description: "E-mail ou CPF ja cadastrado",
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
              description: "Dados invalidos",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/ValidationErrorResponse",
                  },
                },
              },
            },
            401: {
              description: "Token nao informado ou invalido",
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
              description: "E-mail ou CPF ja cadastrado",
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
              description: "Login realizado",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/LoginResponse",
                  },
                },
              },
            },
            400: {
              description: "Dados invalidos",
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
              description: "Usuario desativado",
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
      "/me": {
        get: {
          tags: ["Usuarios"],
          summary: "Retorna o usuario autenticado",
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: "Usuario autenticado",
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
              description: "Token nao informado ou invalido",
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
