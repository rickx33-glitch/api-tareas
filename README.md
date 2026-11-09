# API RESTful de Gestión de Tareas

## Descripción
API RESTful desarrollada con Node.js y Express para gestionar tareas mediante operaciones CRUD. Incluye registro e inicio de sesión de usuarios, cifrado de contraseñas con bcryptjs y autenticación mediante JSON Web Tokens (JWT).

## Tecnologías utilizadas
- Node.js
- Express
- JavaScript
- bcryptjs
- JSON Web Token (JWT)
- Archivos JSON
- dotenv

## Funcionalidades
- Registro de usuarios.
- Inicio de sesión.
- Autenticación mediante JWT.
- Consulta de tareas.
- Creación de tareas.
- Actualización de tareas.
- Eliminación de tareas.
- Validación de datos y manejo de errores.

## Endpoints

| Método | Ruta | Descripción |
|---|---|---|
| POST | /register | Registrar usuario |
| POST | /login | Iniciar sesión |
| GET | /tareas | Consultar tareas |
| POST | /tareas | Crear tarea |
| PUT | /tareas/:id | Actualizar tarea |
| DELETE | /tareas/:id | Eliminar tarea |

Las rutas de tareas requieren un token JWT válido.

## Instalación y ejecución

1. Clonar el repositorio.
2. Instalar dependencias con `npm install`.
3. Crear un archivo `.env` con las variables necesarias.
4. Ejecutar con `npm start`.

## Variables de entorno

PORT=3000

JWT_SECRET=tu_clave_secreta

## Autor
Actividad académica de Desarrollo Full Stack.