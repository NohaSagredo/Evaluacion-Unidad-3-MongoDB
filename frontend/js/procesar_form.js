/**
 * ==========================================================================
 * Evaluación Unidad 3 - Lógica de Validación y DOM del Formulario (procesar_form.js)
 * ==========================================================================
 */

$(document).ready(function () {
    // Vincular el evento submit al formulario
    $("#registrationForm").on("submit", function (e) {
        e.preventDefault(); // Evitar recarga de página por defecto
        procesarEnvio();
    });

    // Vincular el evento click al botón de cancelar
    $("#btnCancelar").on("click", function () {
        cancelarFormulario();
    });

    // Vincular eventos de entrada (input) para validaciones en tiempo real
    configurarValidacionEnTiempoReal();
});

/**
 * Procesa el envío del formulario realizando las validaciones.
 * Si todos los campos son correctos, simula el envío y redirige a index.html.
 */
function procesarEnvio() {
    // 1. Obtener valores de los campos del formulario
    const valores = {
        nombre: $("#nombre").val(),
        usuario: $("#usuario").val(),
        fechaIngreso: $("#fechaIngreso").val(),
        email: $("#email").val(),
        sitioWeb: $("#sitioWeb").val()
    };

    // 2. Realizar las validaciones individuales (Uso de Objeto para almacenar resultados)
    const validaciones = {
        nombre: validarNombre(valores.nombre),
        usuario: validarUsuario(valores.usuario),
        fechaIngreso: validarFecha(valores.fechaIngreso),
        email: validarEmail(valores.email),
        sitioWeb: validarUrl(valores.sitioWeb)
    };

    let formularioValido = true;
    const camposConError = []; // Uso de Arreglo para identificar campos con error

    // 3. Modificar el DOM según los resultados de las validaciones
    $.each(validaciones, function (campo, resultado) {
        const $input = $(`#${campo}`);
        const $errorDiv = $(`#${campo}-error`);

        if (!resultado.valido) {
            formularioValido = false;
            camposConError.push(campo);
            
            // Modificación del DOM para mostrar error
            $input.addClass("is-invalid").removeClass("is-valid");
            $errorDiv.html(`<i class="bi bi-exclamation-circle-fill me-1"></i> ${resultado.mensaje}`).show();
        } else {
            // Modificación del DOM para mostrar éxito
            $input.addClass("is-valid").removeClass("is-invalid");
            $errorDiv.hide();
        }
    });

    // 4. Si el formulario es totalmente válido, proceder a la simulación de envío
    if (formularioValido) {
        // Estructura de objeto con la información validada del usuario
        const usuarioRegistrado = {
            nombre: valores.nombre.trim(),
            usuario: valores.usuario.trim(),
            fechaIngresoFormatted: validaciones.fechaIngreso.fechaFormateada,
            email: valores.email.trim(),
            sitioWeb: valores.sitioWeb.trim() || "No especificado"
        };

        mostrarAlertaExito(usuarioRegistrado);
    } else {
        // Alerta de error en el formulario (Personalizado con colores cyberpunk)
        Swal.fire({
            icon: 'error',
            title: '<span style="color: #ff5b5b;">Campos Inválidos</span>',
            html: 'Por favor, revise los errores marcados en rojo en el formulario.',
            background: '#1b1330',
            confirmButtonColor: '#ea39b8',
            customClass: {
                popup: 'border border-danger'
            }
        });
    }
}

/**
 * Valida que el nombre cumpla con los requisitos.
 * @param {string} nombre - Valor del campo nombre
 * @returns {Object} Resultado de la validación
 */
function validarNombre(nombre) {
    if (!nombre || nombre.trim() === "") {
        return { valido: false, mensaje: "El nombre completo es obligatorio." };
    }
    if (nombre.trim().length < 3) {
        return { valido: false, mensaje: "El nombre debe tener al menos 3 caracteres." };
    }
    return { valido: true };
}

/**
 * Valida que el usuario cumpla con los requisitos.
 * @param {string} usuario - Valor del campo usuario
 * @returns {Object} Resultado de la validación
 */
function validarUsuario(usuario) {
    if (!usuario || usuario.trim() === "") {
        return { valido: false, mensaje: "El nombre de usuario es obligatorio." };
    }
    if (usuario.includes(" ")) {
        return { valido: false, mensaje: "El nombre de usuario no puede contener espacios." };
    }
    if (usuario.trim().length < 4) {
        return { valido: false, mensaje: "El usuario debe tener al menos 4 caracteres." };
    }
    return { valido: true };
}

/**
 * Valida que la fecha tenga el formato requerido y exista en el calendario.
 * @param {string} fecha - Valor devuelto por el input date (formato yyyy-mm-dd)
 * @returns {Object} Resultado de la validación
 */
function validarFecha(fecha) {
    if (!fecha) {
        return { valido: false, mensaje: "La fecha de ingreso es obligatoria." };
    }

    // Dividir la fecha obtenida del input date (yyyy-mm-dd)
    const partesDate = fecha.split('-');
    if (partesDate.length !== 3) {
        return { valido: false, mensaje: "Formato de fecha inválido." };
    }

    const anio = parseInt(partesDate[0], 10);
    const mes = parseInt(partesDate[1], 10);
    const dia = parseInt(partesDate[2], 10);

    // Formatear a dd/mm/yyyy para realizar la validación del formato solicitado
    const diaStr = dia < 10 ? '0' + dia : dia;
    const mesStr = mes < 10 ? '0' + mes : mes;
    const fechaFormateada = `${diaStr}/${mesStr}/${anio}`;

    // Expresión regular para validar el formato de fecha "dd/mm/yyyy"
    const regexFormato = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;
    if (!regexFormato.test(fechaFormateada)) {
        return { valido: false, mensaje: "El formato de fecha debe ser dd/mm/yyyy." };
    }

    // Validar existencia real de la fecha (ej. evitar 30 de febrero)
    const dateObj = new Date(anio, mes - 1, dia);
    if (dateObj.getFullYear() !== anio || dateObj.getMonth() !== (mes - 1) || dateObj.getDate() !== dia) {
        return { valido: false, mensaje: "La fecha ingresada no existe en el calendario." };
    }

    // Validación: no permitir fechas futuras
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    if (dateObj > hoy) {
        return { valido: false, mensaje: "La fecha de ingreso no puede ser futura." };
    }

    return { 
        valido: true, 
        fechaFormateada: fechaFormateada 
    };
}

/**
 * Valida el correo electrónico usando una expresión regular.
 * @param {string} email - Valor del campo email
 * @returns {Object} Resultado de la validación
 */
function validarEmail(email) {
    if (!email || email.trim() === "") {
        return { valido: false, mensaje: "El correo electrónico es obligatorio." };
    }
    
    // Expresión regular estricta para el formato usuario@servidor.dom
    const regexEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!regexEmail.test(email)) {
        return { valido: false, mensaje: "El correo debe tener un formato válido (ej: usuario@servidor.dom)." };
    }
    
    return { valido: true };
}

/**
 * Valida la URL del sitio web si es que se ha ingresado algo.
 * @param {string} url - Valor del campo de sitio web
 * @returns {Object} Resultado de la validación
 */
function validarUrl(url) {
    if (!url || url.trim() === "") {
        return { valido: true }; // Es un campo opcional
    }

    // Expresión regular para validar formato URL estándar
    const regexUrl = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
    if (!regexUrl.test(url)) {
        return { valido: false, mensaje: "Ingrese un formato de URL válido." };
    }

    return { valido: true };
}

/**
 * Limpia todos los campos del formulario y remueve los estilos de validación del DOM.
 */
function cancelarFormulario() {
    // Resetear formulario nativo
    $("#registrationForm")[0].reset();

    // Limpiar clases CSS de Bootstrap
    $(".form-control").removeClass("is-invalid is-valid");
    $(".invalid-feedback").hide();

    // Notificación del reset
    Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'info',
        title: 'Formulario restablecido',
        background: '#1b1330',
        color: '#ffffff',
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true
    });
}

/**
 * Muestra el cuadro de diálogo modal premium para simular el envío de datos.
 * @param {Object} usuario - Datos validados del usuario a enviar
 */
function mostrarAlertaExito(usuario) {
    Swal.fire({
        icon: 'success',
        title: '<span style="color: #32fbe2;">¡Registro Exitoso!</span>',
        background: '#1b1330',
        color: '#ffffff',
        html: `
            <div class="text-start mt-3 p-3 rounded" style="background-color: rgba(26, 9, 51, 0.8); border: 1.5px solid #ea39b8;">
                <p class="mb-2"><strong>Nombre:</strong> ${usuario.nombre}</p>
                <p class="mb-2"><strong>Usuario:</strong> @${usuario.usuario}</p>
                <p class="mb-2"><strong>Fecha Ingreso:</strong> ${usuario.fechaIngresoFormatted}</p>
                <p class="mb-2"><strong>Email:</strong> ${usuario.email}</p>
                <p class="mb-0"><strong>Sitio Web:</strong> ${usuario.sitioWeb}</p>
            </div>
            <div class="mt-4 text-center">
                <span class="badge px-3 py-2 text-dark bg-warning">
                    <i class="bi bi-info-circle-fill me-1"></i> Simulación local sin base de datos activa
                </span>
            </div>
        `,
        confirmButtonText: '<i class="bi bi-house-door-fill me-1"></i> Aceptar y Volver al Inicio',
        confirmButtonColor: '#ea39b8',
        allowOutsideClick: false,
        scrollbarPadding: false
    }).then((result) => {
        if (result.isConfirmed) {
            $("#registrationForm")[0].reset();
            window.location.href = "index.html";
        }
    });
}

/**
 * Agrega oyentes en tiempo real para validar los campos mientras el usuario escribe.
 */
function configurarValidacionEnTiempoReal() {
    $("#nombre").on("input", function () {
        const val = $(this).val();
        const res = validarNombre(val);
        toggleClasesValidacion($(this), $("#nombre-error"), res);
    });

    $("#usuario").on("input", function () {
        const val = $(this).val();
        const res = validarUsuario(val);
        toggleClasesValidacion($(this), $("#usuario-error"), res);
    });

    $("#fechaIngreso").on("change input", function () {
        const val = $(this).val();
        const res = validarFecha(val);
        toggleClasesValidacion($(this), $("#fechaIngreso-error"), res);
    });

    $("#email").on("input", function () {
        const val = $(this).val();
        const res = validarEmail(val);
        toggleClasesValidacion($(this), $("#email-error"), res);
    });

    $("#sitioWeb").on("input", function () {
        const val = $(this).val();
        const res = validarUrl(val);
        toggleClasesValidacion($(this), $("#sitioWeb-error"), res);
    });
}

/**
 * Función auxiliar para alternar las clases CSS de validación e inyectar el error en el DOM.
 * @param {jQuery} $input - Elemento del input
 * @param {jQuery} $errorDiv - Contenedor del mensaje de error
 * @param {Object} validacion - Objeto con el resultado del validador
 */
function toggleClasesValidacion($input, $errorDiv, validacion) {
    if (!validacion.valido) {
        $input.addClass("is-invalid").removeClass("is-valid");
        $errorDiv.html(`<i class="bi bi-exclamation-circle-fill me-1"></i> ${validacion.mensaje}`).show();
    } else {
        $input.addClass("is-valid").removeClass("is-invalid");
        $errorDiv.hide();
    }
}
