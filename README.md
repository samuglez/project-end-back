# TrophyWorld - Backend

Este es el backend de **TrophyWorld**, una API desarrollada con Node.js, Express y MongoDB para gestionar álbumes y compras, así como la funcionalidad de una red social para compartir trofeos/logros de consola.

## Tecnologías utilizadas

### Lenguaje y entorno

- **Node.js**: Entorno de ejecución para JavaScript en el servidor.

### Frameworks y librerías principales

- **Express**: Framework web minimalista para Node.js.
- **Mongoose**: ODM para modelar y gestionar la base de datos MongoDB.
- **jsonwebtoken** y **express-jwt**: Para la autenticación basada en tokens JWT.
- **bcrypt**: Para el hash de contraseñas y mejorar la seguridad de los usuarios.

### Middleware

- **cors**: Habilita la comunicación entre el frontend y el backend con distintas políticas de CORS.
- **cookie-parser**: Permite analizar cookies en las solicitudes.
- **morgan**: Middleware de logging para registrar las peticiones HTTP.

### Variables de entorno

- **dotenv**: Carga las variables de entorno desde un archivo `.env`.

### Desarrollo y utilidades

- **nodemon**: Recarga automáticamente el servidor en desarrollo cuando se detectan cambios en el código.

## Instalación y ejecución

1. Clona este repositorio:

   ```sh
   https://github.com/samuglez/project-end-back.git
   cd project-end-back
   ```

2. Instala las dependencias:

   ```sh
   npm install
   ```

3. Configura las variables de entorno en un archivo `.env`.

4. Para ejecutar el servidor en modo desarrollo:

   ```sh
   npm run dev
   ```

5. Para ejecutar en producción:

   ```sh
   npm start
   ```


