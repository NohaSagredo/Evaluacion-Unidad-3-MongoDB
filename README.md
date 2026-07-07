# Evaluación Unidad 3 - Desarrollo de Aplicaciones Web (FrontEnd)

Este proyecto corresponde al desarrollo de la **Evaluación N°3** para la asignatura de Desarrollo de Aplicaciones Web. Se implementa una WebApp responsiva e interactiva basada en una estética **Cyberpunk / Neon** (fondo oscuro morado `#1a0933`, acentos rosa `#ea39b8` y cian `#32fbe2`), utilizando **jQuery** y **jQuery DataTables** como frameworks basados en JavaScript.

---

## 🛠️ Estructura del Proyecto (FrontEnd)

El código de la aplicación cliente se encuentra ubicado en la carpeta `frontend/`:

*   **[frontend/index.html](file:///home/noha/Documentos/E3%20FrontEnd/frontend/index.html)**: Página de inicio y panel de visualización. Contiene el contenedor para la tabla de usuarios registrados.
*   **[frontend/formulario.html](file:///home/noha/Documentos/E3%20FrontEnd/frontend/formulario.html)**: Formulario de registro para simular el ingreso de nuevos usuarios con validaciones avanzadas e interactivas.
*   **[frontend/js/table.js](file:///home/noha/Documentos/E3%20FrontEnd/frontend/js/table.js)**: Lógica en jQuery encargada de realizar la petición AJAX, generar avatares visuales y configurar la inicialización de **jQuery DataTables** con traducción al español.
*   **[frontend/js/procesar_form.js](file:///home/noha/Documentos/E3%20FrontEnd/frontend/js/procesar_form.js)**: Motor de validaciones interactivas de campos en tiempo real y flujo de simulación de envío mediante **SweetAlert2**.

---

## ⚙️ Requerimientos y Características Implementadas

### 1. Navegación Consistente
Se incluye un menú de navegación responsive superior que permite el acceso fluido entre las dos secciones principales de la aplicación:
- **Inicio** (`index.html`)
- **Registro** (`formulario.html`)

### 2. Formulario de Registro con Validaciones Avanzadas (jQuery)
El formulario de ingreso solicita los siguientes campos con validaciones dinámicas:
*   **Nombre completo**: Campo obligatorio de tipo `text`. Mínimo 3 caracteres.
*   **Nombre de Usuario**: Campo obligatorio de tipo `text`. Mínimo 4 caracteres y no debe contener espacios en blanco.
*   **Fecha de Ingreso**: Campo obligatorio de tipo `date`. Se valida que la fecha represente una fecha real en el calendario (ej: evitar 30 de febrero) y que no corresponda a una fecha futura.
*   **Correo Electrónico**: Campo obligatorio de tipo `email`. Se valida bajo el estándar regex `usuario@servidor.dom` (por ejemplo, `usuario@servidor.cl`).
*   **Sitio Web**: Campo opcional de tipo `url`. Si se ingresa información, se valida que cumpla con el formato estándar de URL.

### 3. Acciones de Botones (Formulario)
*   **Cancelar**: Limpia por completo los datos del formulario, remueve las clases CSS de validación (`is-invalid` / `is-valid`) y muestra una notificación flotante de confirmación.
*   **Enviar Registro**: Realiza las validaciones de todos los inputs. Si existen errores, marca visualmente los campos con el color de advertencia neón y abre un modal SweetAlert2. Si la validación es correcta, compila la información en un objeto JavaScript y despliega un modal detallado de éxito. Al aceptar, limpia los campos y redirige al usuario a la página de inicio.

### 4. Tabla de Usuarios con jQuery DataTables
La página principal consume datos externos en tiempo real desde la API pública de **JSONPlaceholder** (`https://jsonplaceholder.typicode.com/users`).
- Realiza una consulta **AJAX** para obtener la lista de usuarios.
- Genera dinámicamente un avatar de iniciales para cada usuario y puebla el DOM.
- Inicializa **DataTables** en español, habilitando ordenamiento de columnas, paginación local (de 5 en 5 elementos) y búsqueda interactiva.
- Adapta los colores, bordes de entrada y botones de navegación de la tabla al tema neón del proyecto.

---

## 🚀 Instalación y Ejecución Local

### Pasos para iniciar el servidor de desarrollo:

1.  Abre una terminal en la carpeta raíz del proyecto.
2.  Puedes servir el frontend utilizando cualquier servidor HTTP estático. Por ejemplo, utilizando Python en el puerto `8080`:
    ```bash
    cd frontend
    python3 -m http.server 8080
    ```
3.  Ingresa a la aplicación web a través de tu navegador:
    - **Panel de Inicio (DataTables)**: [http://localhost:8080/index.html](http://localhost:8080/index.html)
    - **Formulario de Registro**: [http://localhost:8080/formulario.html](http://localhost:8080/formulario.html)
