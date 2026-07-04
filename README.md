# FRONTEND_IEC_N3_C2 - Interacción con documentos HTML usando JavaScript

Este proyecto corresponde a la **Evaluación de la Unidad 2** de la asignatura **Front-End** en **Inacap**. Consiste en un sistema web interactivo que combina el desarrollo de una interfaz cliente moderna (Frontend) y una base de conexión local (Backend) utilizando bases de datos no estructuradas (MongoDB).

---

## 🛠️ Estructura del Proyecto

El repositorio se divide en dos componentes principales:

```text
├── backend/
│   └── servidor.js             # Servidor Express y conexión a MongoDB
├── css/
│   └── bootstrap.min.css       # Estilos locales de Bootstrap 5
├── frontend/
│   ├── assets/                 # Recursos gráficos (iconos, imágenes)
│   ├── css/
│   │   └── stylesheet.css      # Estilos personalizados para el CV
│   ├── js/
│   │   ├── bootstrap.min.js    # Librería de Bootstrap para interacciones
│   │   └── procesar_form.js    # Lógica de validación de formulario y lógica UI
│   ├── curriculum_vitae.html   # Currículum Vitae interactivo
│   └── formulario.html         # Formulario de registro con validación avanzada
├── js/
│   └── bootstrap.min.js        # Recursos compartidos/adicionales
└── README.md
```

---

## 💻 Frontend (Cliente)

El frontend contiene dos secciones principales diseñadas con una estética oscura (*dark mode*) premium, tipografías modernas e interacciones dinámicas.

### 1. Currículum Vitae (`curriculum_vitae.html`)
Página estática e interactiva que presenta los antecedentes de **Rodrigo Peña S.**, estudiante de *Ingeniería en Ciberseguridad*. 
*   **Secciones:** Antecedentes académicos, experiencia laboral, habilidades técnicas organizadas por tags, cursos y certificaciones.
*   **Aparición visual:** Integración de fuentes personalizadas (*Outfit* desde Google Fonts) y diseño responsive adaptativo.

### 2. Formulario de Registro (`formulario.html`)
Formulario de entrada de datos equipado con validación en tiempo real en el cliente mediante JavaScript nativo (`procesar_form.js`).

#### **Validaciones Aplicadas:**
*   **Nombre Completo:** Campo requerido con un largo mínimo de 3 caracteres.
*   **RUT Chileno:** 
    *   Formateo automático interactivo al escribir (añade puntos y guion: `XX.XXX.XXX-X`).
    *   Validación matemática del dígito verificador (módulo 11).
*   **Fecha de Nacimiento:** Validación estricta del formato `dd/MM/yyyy`, validación de años bisiestos y prohibición de fechas futuras.
*   **Curriculum Vitae (Archivo):** Control de extensión. Solo se admiten documentos `.pdf` y `.docx`.
*   **Correo Electrónico:** Verificación de formato usando expresiones regulares (ej: `usuario@servidor.com`).
*   **Contraseñas:**
    *   Debe coincidir con la confirmación.
    *   **Complejidad:** Entre 8 y 12 caracteres, al menos una mayúscula, una minúscula, un número y un carácter especial (ej. `!@#$%^&*`).
*   **Feedback Visual:** Utiliza las clases `is-valid` e `is-invalid` de Bootstrap para cambiar dinámicamente los bordes de los inputs y mostrar mensajes de error específicos bajo cada campo.
*   **Resumen Modal:** Al enviar el formulario sin errores, se activa un Modal de Bootstrap (`#successModal`) que detalla de forma tabular un resumen de toda la información válida ingresada.

---

## 🗄️ Backend & Base de Datos (`backend/`)

El servidor actúa como capa intermedia para persistir o procesar la información del cliente.

*   **Tecnologías:** Node.js, Express, Mongoose.
*   **Base de Datos:** MongoDB local (Nombre de la BD: `BD-No-Estructurados`).
*   **Puerto por defecto:** `3000`.
*   **Servicio CORS:** Habilitado para permitir peticiones seguras desde el frontend.

---

## 🚀 Instalación y Ejecución

### Requisitos Previos:
*   [Node.js](https://nodejs.org/) instalado.
*   [MongoDB](https://www.mongodb.com/) corriendo localmente en el puerto `27017`.

### Pasos para iniciar el Servidor:
1. Dirígete a la carpeta del proyecto en tu terminal.
2. Accede al backend e instala las dependencias de Node:
   ```bash
   cd backend
   npm install
   ```
   *(Nota: Asegúrate de tener un archivo package.json con las dependencias `express`, `mongoose`, `cors` y `body-parser`)*
3. Inicia el servidor backend:
   ```bash
   node servidor.js
   ```
4. Abre el archivo [frontend/formulario.html](file:///C:/Users/Pacira/Desktop/Trabajos Bebeiro/Inacap-FrontEnd/Unidad 2 - Interacción con documentos HTML usando JavaScript/EVALUACION/FRONTEND_IEC_N3_C2-main/frontend/formulario.html) en tu navegador para interactuar con la interfaz de usuario.
