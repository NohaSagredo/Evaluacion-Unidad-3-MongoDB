const EXTENSIONES_PERMITIDAS = ['pdf'];

const CONFIG_FORMULARIO = {
    nombreMinLargo: 3,
    passMinLargo: 8,
    passMaxLargo: 12
};

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("registrationForm");
    const inputNombre = document.getElementById("input_nombre");
    const inputRut = document.getElementById("input_rut");
    const inputFecha = document.getElementById("input_fecha");
    const inputCv = document.getElementById("input_cv");
    const inputEmail = document.getElementById("input_email");
    const selectGenero = document.getElementById("select_genero");
    
    // Nuevos campos
    const inputTelefono = document.getElementById("input_telefono");
    const selectNacionalidad = document.getElementById("select_nacionalidad");
    const inputDireccion = document.getElementById("input_direccion");
    const checkTerminos = document.getElementById("check_terminos");
    const checkInteres = document.getElementById("check_interes");

    const inputContrasena = document.getElementById("input_contrasena");
    const inputConfirmContrasena = document.getElementById("input_confirm_contrasena");

    // Formateador y validador interactivo de RUT
    inputRut.addEventListener("input", (e) => {
        let cursorPosition = e.target.selectionStart;
        let originalLength = e.target.value.length;

        let rutFormateado = formatearRut(e.target.value);
        e.target.value = rutFormateado;

        let newLength = rutFormateado.length;
        let diff = newLength - originalLength;
        e.target.setSelectionRange(cursorPosition + diff, cursorPosition + diff);

        validarIndividualRut();
    });

    // Event listeners para validaciones en tiempo real (Blur/Input)
    inputNombre.addEventListener("blur", validarIndividualNombre);
    inputNombre.addEventListener("input", validarIndividualNombre);

    inputRut.addEventListener("blur", validarIndividualRut);

    inputFecha.addEventListener("blur", validarIndividualFecha);
    inputFecha.addEventListener("input", validarIndividualFecha);

    inputCv.addEventListener("change", validarIndividualCv);

    inputEmail.addEventListener("blur", validarIndividualEmail);
    inputEmail.addEventListener("input", validarIndividualEmail);

    selectGenero.addEventListener("change", validarIndividualGenero);
    selectGenero.addEventListener("blur", validarIndividualGenero);

    // Listeners para los campos nuevos
    inputTelefono.addEventListener("blur", validarIndividualTelefono);
    inputTelefono.addEventListener("input", validarIndividualTelefono);

    selectNacionalidad.addEventListener("change", () => {
        const label = document.getElementById("label_direccion");
        if (selectNacionalidad.value === "Extranjera") {
            if (label) label.textContent = "Dirección *";
        } else {
            if (label) label.textContent = "Dirección";
            limpiarEstadoCampo(inputDireccion, "error_direccion");
        }
        validarIndividualNacionalidad();
        validarIndividualDireccion();
    });
    selectNacionalidad.addEventListener("blur", () => {
        validarIndividualNacionalidad();
        validarIndividualDireccion();
    });

    inputDireccion.addEventListener("blur", validarIndividualDireccion);
    inputDireccion.addEventListener("input", validarIndividualDireccion);

    checkTerminos.addEventListener("change", validarIndividualTerminos);

    inputContrasena.addEventListener("blur", validarIndividualContrasena);
    inputContrasena.addEventListener("input", validarIndividualContrasena);

    inputConfirmContrasena.addEventListener("blur", validarIndividualConfirm);
    inputConfirmContrasena.addEventListener("input", validarIndividualConfirm);

    // Funciones de validación individual
    function validarIndividualNombre() {
        const valor = inputNombre.value.trim();
        if (valor === "") {
            marcarError(inputNombre, "error_nombre", "El nombre completo es requerido.");
            return false;
        } else if (valor.length < CONFIG_FORMULARIO.nombreMinLargo) {
            marcarError(inputNombre, "error_nombre", `Debe tener al menos ${CONFIG_FORMULARIO.nombreMinLargo} caracteres.`);
            return false;
        }
        marcarValido(inputNombre, "error_nombre");
        return true;
    }

    function validarIndividualRut() {
        const valor = inputRut.value.trim();
        if (valor === "") {
            marcarError(inputRut, "error_rut", "El RUT es requerido.");
            return false;
        }
        if (!validarRutChile(valor)) {
            marcarError(inputRut, "error_rut", "El RUT ingresado no es válido (ej: 12.345.678-9).");
            return false;
        }
        marcarValido(inputRut, "error_rut");
        return true;
    }

    function validarIndividualFecha() {
        const valor = inputFecha.value.trim();
        if (valor === "") {
            marcarError(inputFecha, "error_fecha", "La fecha de nacimiento es requerida.");
            return false;
        }
        
        const resValidacion = validarFechaNacimientoYEdad(valor);
        if (!resValidacion.valido) {
            marcarError(inputFecha, "error_fecha", resValidacion.mensaje);
            return false;
        }
        
        marcarValido(inputFecha, "error_fecha");
        return true;
    }

    function validarIndividualCv() {
        if (!inputCv.files || inputCv.files.length === 0) {
            marcarError(inputCv, "error_cv", "El currículum en formato PDF es obligatorio.");
            return false;
        }
        if (!validarCVArchivo(inputCv)) {
            marcarError(inputCv, "error_cv", "Tipo de archivo no permitido. Solo se acepta .pdf.");
            return false;
        }
        marcarValido(inputCv, "error_cv");
        return true;
    }

    function validarIndividualEmail() {
        const valor = inputEmail.value.trim();
        if (valor === "") {
            marcarError(inputEmail, "error_email", "El email es requerido.");
            return false;
        }
        if (!validarEmailRegex(valor)) {
            marcarError(inputEmail, "error_email", "Formato de email inválido (ej: usuario@servidor.com).");
            return false;
        }
        marcarValido(inputEmail, "error_email");
        return true;
    }

    function validarIndividualGenero() {
        const valor = selectGenero.value;
        if (valor === "") {
            marcarError(selectGenero, "error_genero", "Debe seleccionar un género.");
            return false;
        }
        marcarValido(selectGenero, "error_genero");
        return true;
    }

    // Validadores de nuevos campos
    function validarIndividualTelefono() {
        const valor = inputTelefono.value.trim();
        if (valor === "") {
            marcarError(inputTelefono, "error_telefono", "El teléfono de contacto es requerido.");
            return false;
        }
        if (!/^\d{9}$/.test(valor)) {
            marcarError(inputTelefono, "error_telefono", "El teléfono debe contener exactamente 9 dígitos.");
            return false;
        }
        marcarValido(inputTelefono, "error_telefono");
        return true;
    }

    function validarIndividualNacionalidad() {
        const valor = selectNacionalidad.value;
        if (valor === "") {
            marcarError(selectNacionalidad, "error_nacionalidad", "Debe seleccionar su nacionalidad.");
            return false;
        }
        marcarValido(selectNacionalidad, "error_nacionalidad");
        return true;
    }

    function validarIndividualDireccion() {
        const valor = inputDireccion.value.trim();
        if (selectNacionalidad.value === "Extranjera") {
            if (valor === "") {
                marcarError(inputDireccion, "error_direccion", "La dirección residencial es requerida para ciudadanos extranjeros.");
                return false;
            }
            marcarValido(inputDireccion, "error_direccion");
            return true;
        } else {
            limpiarEstadoCampo(inputDireccion, "error_direccion");
            return true;
        }
    }

    function validarIndividualTerminos() {
        const checked = checkTerminos.checked;
        if (!checked) {
            marcarError(checkTerminos, "error_terminos", "Debe aceptar los términos y condiciones.");
            return false;
        }
        marcarValido(checkTerminos, "error_terminos");
        return true;
    }

    function validarIndividualContrasena() {
        const valor = inputContrasena.value;
        const res = comprobarContrasenaCompleja(valor);
        if (!res.valido) {
            marcarError(inputContrasena, "error_contrasena", res.mensaje);
            if (inputConfirmContrasena.value !== "") {
                validarIndividualConfirm();
            }
            return false;
        }
        marcarValido(inputContrasena, "error_contrasena");
        if (inputConfirmContrasena.value !== "") {
            validarIndividualConfirm();
        }
        return true;
    }

    function validarIndividualConfirm() {
        const valorConfirm = inputConfirmContrasena.value;
        const valorPass = inputContrasena.value;
        if (valorConfirm === "") {
            marcarError(inputConfirmContrasena, "error_confirm_contrasena", "Debe repetir la contraseña.");
            return false;
        }
        if (valorConfirm !== valorPass) {
            marcarError(inputConfirmContrasena, "error_confirm_contrasena", "Las contraseñas no coinciden.");
            return false;
        }
        marcarValido(inputConfirmContrasena, "error_confirm_contrasena");
        return true;
    }

    // Envío del Formulario
    form.addEventListener("submit", (event) => {
        event.preventDefault();

        // Ejecutar todas las validaciones
        const esNombreValido = validarIndividualNombre();
        const esRutValido = validarIndividualRut();
        const esFechaValida = validarIndividualFecha();
        const esCvValido = validarIndividualCv();
        const esEmailValido = validarIndividualEmail();
        const esGeneroValido = validarIndividualGenero();
        const esTelefonoValido = validarIndividualTelefono();
        const esNacionalidadValida = validarIndividualNacionalidad();
        const esDireccionValida = validarIndividualDireccion();
        const esPassValida = validarIndividualContrasena();
        const esConfirmValida = validarIndividualConfirm();
        const esTerminosValido = validarIndividualTerminos();

        if (!esNombreValido || !esRutValido || !esFechaValida || !esCvValido || 
            !esEmailValido || !esGeneroValido || !esTelefonoValido || !esNacionalidadValida || 
            !esDireccionValida || !esPassValida || !esConfirmValida || !esTerminosValido) {
            console.warn("Validación en frontend fallida. Revise los campos en rojo.");
            return;
        }

        // Construcción del FormData
        const formData = new FormData();
        formData.append("nombre", inputNombre.value.trim());
        formData.append("run", inputRut.value.trim());
        formData.append("fechaNacimiento", inputFecha.value.trim());
        formData.append("correo", inputEmail.value.trim());
        formData.append("telefono", inputTelefono.value.trim());
        formData.append("nacionalidad", selectNacionalidad.value);
        formData.append("genero", selectGenero.value);
        formData.append("direccion", selectNacionalidad.value === "Extranjera" ? inputDireccion.value.trim() : "");
        formData.append("contrasena", inputContrasena.value);
        formData.append("terminosYCond", checkTerminos.checked);
        formData.append("interes", checkInteres.checked);
        
        if (inputCv.files && inputCv.files[0]) {
            formData.append("curriculum", inputCv.files[0]);
        }

        // Petición POST al backend
        fetch("http://localhost:3000/usuarios", {
            method: "POST",
            body: formData
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(errData => {
                    const mensajeError = errData.errores ? errData.errores.join("\n") : "Error al registrar el usuario en el servidor.";
                    throw new Error(mensajeError);
                });
            }
            return response.json();
        })
        .then(resData => {
            console.log("Servidor responde exitosamente:", resData);

            // Cargar datos en la tabla resumen del Modal
            const modalBody = document.getElementById("modal_summary_body");
            modalBody.innerHTML = "";

            const camposMostrar = [
                { etiqueta: "Nombre Completo", valor: inputNombre.value.trim() },
                { etiqueta: "RUN", valor: inputRut.value.trim() },
                { etiqueta: "Fecha de Nacimiento", valor: inputFecha.value.trim() },
                { etiqueta: "Email", valor: inputEmail.value.trim() },
                { etiqueta: "Teléfono", valor: inputTelefono.value.trim() },
                { etiqueta: "Nacionalidad", valor: selectNacionalidad.value },
                { etiqueta: "Género", valor: selectGenero.value },
                { etiqueta: "Dirección", valor: selectNacionalidad.value === "Extranjera" ? inputDireccion.value.trim() : "No requerida" }
            ];

            camposMostrar.forEach(item => {
                const tr = document.createElement("tr");
                tr.innerHTML = `
                    <td class="fw-bold text-secondary">${item.etiqueta}</td>
                    <td>${item.valor}</td>
                `;
                modalBody.appendChild(tr);
            });

            // Mostrar modal de confirmación
            const successModal = new bootstrap.Modal(document.getElementById('successModal'));
            successModal.show();

            // Limpiar campos del formulario tras registro exitoso
            cancelarFormulario();
        })
        .catch(error => {
            alert("Error en el registro:\n" + error.message);
        });
    });
});

// --- FUNCIONES AUXILIARES ---

// Validador de RUT chileno con dígito verificador módulo 11
function validarRutChile(rutCompleto) {
    let valor = rutCompleto.replace(/\./g, '').replace(/-/g, '').trim().toUpperCase();
    if (valor.length < 2) return false;

    let cuerpo = valor.slice(0, -1);
    let dvIngresado = valor.slice(-1);

    if (!/^\d+$/.test(cuerpo)) return false;

    let suma = 0;
    let multiplicador = 2;

    for (let i = cuerpo.length - 1; i >= 0; i--) {
        suma += parseInt(cuerpo[i], 10) * multiplicador;
        multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
    }

    let residuo = suma % 11;
    let dvEsperado = 11 - residuo;

    if (dvEsperado === 11) {
        dvEsperado = '0';
    } else if (dvEsperado === 10) {
        dvEsperado = 'K';
    } else {
        dvEsperado = dvEsperado.toString();
    }

    return dvIngresado === dvEsperado;
}

// Formatea el RUT de manera dinámica a medida que se ingresa (XX.XXX.XXX-X)
function formatearRut(rut) {
    let valor = rut.replace(/[^0-9kK]/g, '').toUpperCase();
    if (valor.length === 0) return '';
    if (valor.length === 1) return valor;

    let cuerpo = valor.slice(0, -1);
    let dv = valor.slice(-1);

    let cuerpoFormateado = '';
    let count = 0;
    for (let i = cuerpo.length - 1; i >= 0; i--) {
        cuerpoFormateado = cuerpo[i] + cuerpoFormateado;
        count++;
        if (count === 3 && i > 0) {
            cuerpoFormateado = '.' + cuerpoFormateado;
            count = 0;
        }
    }
    return cuerpoFormateado + '-' + dv;
}

// Validador de formato de correo
function validarEmailRegex(email) {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
}

// Validar Fecha de Nacimiento (dd/MM/yyyy) y mayoría de edad (18 años o más)
function validarFechaNacimientoYEdad(fechaStr) {
    const reg = /^(\d{2})\/(\d{2})\/(\d{4})$/;
    const match = fechaStr.match(reg);
    if (!match) {
        return { valido: false, mensaje: "Formato dd/MM/yyyy incorrecto." };
    }

    const dia = parseInt(match[1], 10);
    const mes = parseInt(match[2], 10);
    const anio = parseInt(match[3], 10);

    if (mes < 1 || mes > 12) {
        return { valido: false, mensaje: "Mes inválido." };
    }
    if (anio < 1900 || anio > new Date().getFullYear()) {
        return { valido: false, mensaje: "Año fuera de rango." };
    }

    const esBisiesto = (anio % 4 === 0 && (anio % 100 !== 0 || anio % 400 === 0));
    const diasPorMes = [31, esBisiesto ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

    if (dia < 1 || dia > diasPorMes[mes - 1]) {
        return { valido: false, mensaje: "Día inválido para ese mes." };
    }

    const fechaIngresada = new Date(anio, mes - 1, dia);
    const hoy = new Date();

    hoy.setHours(0, 0, 0, 0);
    if (fechaIngresada > hoy) {
        return { valido: false, mensaje: "La fecha de nacimiento no puede ser futura." };
    }

    // Cálculo y validación de la mayoría de edad (18 años)
    let edad = hoy.getFullYear() - fechaIngresada.getFullYear();
    const difMeses = hoy.getMonth() - fechaIngresada.getMonth();
    if (difMeses < 0 || (difMeses === 0 && hoy.getDate() < fechaIngresada.getDate())) {
        edad--;
    }

    if (edad < 18) {
        return { valido: false, mensaje: "Debe ser mayor de edad para registrarse (18 años o más)." };
    }

    return { valido: true };
}

// Validar extensión de CV
function validarCVArchivo(inputCv) {
    if (!inputCv.files || inputCv.files.length === 0) return true;
    const file = inputCv.files[0];
    const extension = file.name.split('.').pop().toLowerCase();

    return EXTENSIONES_PERMITIDAS.includes(extension);
}

// Validar complejidad de contraseña
function comprobarContrasenaCompleja(pass) {
    if (pass === "") {
        return { valido: false, mensaje: "La contraseña es requerida." };
    }
    if (pass.length < CONFIG_FORMULARIO.passMinLargo || pass.length > CONFIG_FORMULARIO.passMaxLargo) {
        return { valido: false, mensaje: `Debe tener entre ${CONFIG_FORMULARIO.passMinLargo} y ${CONFIG_FORMULARIO.passMaxLargo} caracteres.` };
    }
    if (!/[A-Z]/.test(pass)) {
        return { valido: false, mensaje: "Debe contener al menos una letra mayúscula." };
    }
    if (!/[a-z]/.test(pass)) {
        return { valido: false, mensaje: "Debe contener al menos una letra minúscula." };
    }
    if (!/[0-9]/.test(pass)) {
        return { valido: false, mensaje: "Debe contener al menos un número." };
    }
    if (!/[!@#$%^&*(),.?":{}|<>_\-+=~`[\]\\|;'\/]/.test(pass)) {
        return { valido: false, mensaje: "Debe contener al menos un carácter especial (ej: !@#$*)." };
    }
    return { valido: true };
}

// Funciones UI para marcar estados de validación en Bootstrap
function marcarError(inputElement, errorDivId, mensaje) {
    inputElement.classList.add("is-invalid");
    inputElement.classList.remove("is-valid");
    const errDiv = document.getElementById(errorDivId);
    if (errDiv) {
        errDiv.textContent = mensaje;
    }
}

function marcarValido(inputElement, errorDivId) {
    inputElement.classList.remove("is-invalid");
    inputElement.classList.add("is-valid");
    const errDiv = document.getElementById(errorDivId);
    if (errDiv) {
        errDiv.textContent = "";
    }
}

function limpiarEstadoCampo(inputElement, errorDivId) {
    inputElement.classList.remove("is-invalid");
    inputElement.classList.remove("is-valid");
    const errDiv = document.getElementById(errorDivId);
    if (errDiv) {
        errDiv.textContent = "";
    }
}

// Limpiar formulario y resetear estados
function cancelarFormulario() {
    const form = document.getElementById("registrationForm");
    if (form) {
        form.reset();

        const campos = form.querySelectorAll(".form-control, .form-select, .form-check-input");
        campos.forEach(campo => {
            campo.classList.remove("is-invalid");
            campo.classList.remove("is-valid");
        });

        const divsError = form.querySelectorAll(".invalid-feedback");
        divsError.forEach(div => {
            div.textContent = "";
        });
    }
}
