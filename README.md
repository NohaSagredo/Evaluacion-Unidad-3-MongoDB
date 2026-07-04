# Evaluación Unidad 3 - MongoDB y Gestión de Dispositivos

Sistema web interactivo para la administración de usuarios y la asignación de dispositivos electrónicos, desarrollado con Node.js, Express, MongoDB (Mongoose) y Bootstrap.

---

## 🛠️ Estructura del Proyecto

*   `backend/servidor.js`: Servidor Express, conexión a MongoDB, esquemas Mongoose (Usuario, DispositivoElectronico, Busqueda) y rutas REST API.
*   `frontend/`: Interfaz de usuario (HTML, CSS y JS).
    *   `formulario.html`: Registro de usuarios con validación en tiempo real y subida de CV (PDF).
    *   `usuarios.html`: Listado de usuarios, filtros de búsqueda, historial de búsquedas y descarga de CV.
    *   `curriculum_vitae.html`: Vista dinámica del currículum de un usuario con visualizador de PDF embebido.
    *   `dispositivos.html`: Gestión de dispositivos electrónicos asociados a usuarios usando agregación `$lookup`.

---

## 🚀 Requisitos e Instalación

### Requisitos previos:
*   [Node.js](https://nodejs.org/) instalado.
*   [MongoDB](https://www.mongodb.com/) corriendo localmente en el puerto `27017` (Base de datos: `BD-No-Estructurados`).

### Pasos para iniciar:

1.  Abre una terminal en la carpeta `backend` del proyecto e instala las dependencias:
    ```bash
    cd backend
    npm install
    ```
2.  Inicia el servidor backend:
    ```bash
    node servidor.js
    ```
3.  Ingresa a la aplicación web a través de tu navegador:
    *   **Formulario de Registro**: [http://localhost:3000/formulario.html](http://localhost:3000/formulario.html)
    *   **Listado de Usuarios**: [http://localhost:3000/usuarios.html](http://localhost:3000/usuarios.html)
    *   **Gestión de Dispositivos**: [http://localhost:3000/dispositivos.html](http://localhost:3000/dispositivos.html)

---

## ⚙️ Características Implementadas

1.  **Validaciones Avanzadas y Condicionales**: El formulario del usuario valida RUN, correo, edad mínima, contraseñas seguras y hace obligatorio el campo de dirección solo si la nacionalidad es "Extranjera".
2.  **Carga y Visualización de Archivos**: Almacenamiento físico de currículums en formato PDF y visualización embebida interactiva en el perfil del usuario.
3.  **Historial de Búsquedas**: Historial persistente en MongoDB que guarda los criterios de búsquedas realizados y permite re-ejecutarlos al hacer clic en los badges.
4.  **Relación 1:N y Agregación `$lookup`**: Relación entre `Usuario` y `DispositivoElectronico` consultada mediante agregaciones nativas de MongoDB para mostrar los datos del propietario de forma integrada en la tabla de dispositivos.
