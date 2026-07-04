document.addEventListener("DOMContentLoaded", () => {
    const tableBody = document.getElementById("devices_table_body");
    const deviceForm = document.getElementById("deviceForm");
    const selectUsuario = document.getElementById("select_usuario");
    
    // Inputs del formulario
    const inputTipo = document.getElementById("input_tipo");
    const inputMarca = document.getElementById("input_marca");
    const inputModelo = document.getElementById("input_modelo");
    const inputSerie = document.getElementById("input_serie");
    const inputSO = document.getElementById("input_sistema_operativo");
    const inputFecha = document.getElementById("input_fecha_compra");
    const inputGarantia = document.getElementById("input_garantia");
    const inputEstado = document.getElementById("input_estado");
    const inputValor = document.getElementById("input_valor");
    
    const btnCancelar = document.getElementById("btn_cancelar_dispositivo");

    // Inicializar vistas
    cargarUsuariosDropdown();
    cargarDispositivos();

    // Event listeners para validaciones en tiempo real
    inputTipo.addEventListener("blur", () => validarCampoVacio(inputTipo, "error_tipo", "El tipo es requerido."));
    inputMarca.addEventListener("blur", () => validarCampoVacio(inputMarca, "error_marca", "La marca es requerida."));
    inputModelo.addEventListener("blur", () => validarCampoVacio(inputModelo, "error_modelo", "El modelo es requerido."));
    inputSerie.addEventListener("blur", () => validarCampoVacio(inputSerie, "error_serie", "El número de serie es requerido."));
    inputSO.addEventListener("blur", () => validarCampoVacio(inputSO, "error_so", "El sistema operativo es requerido."));
    inputEstado.addEventListener("blur", () => validarCampoVacio(inputEstado, "error_estado", "El estado es requerido."));
    inputFecha.addEventListener("blur", validarIndividualFechaCompra);
    inputGarantia.addEventListener("blur", validarIndividualGarantia);
    inputValor.addEventListener("blur", validarIndividualValor);
    selectUsuario.addEventListener("change", () => validarCampoVacio(selectUsuario, "error_usuario", "Seleccione un propietario."));

    // Event listener para botón limpiar
    btnCancelar.addEventListener("click", limpiarFormulario);

    // Event listener para envío
    deviceForm.addEventListener("submit", (e) => {
        e.preventDefault();
        
        // Ejecutar todas las validaciones
        const esUserValido = validarCampoVacio(selectUsuario, "error_usuario", "Seleccione un propietario.");
        const esTipoValido = validarCampoVacio(inputTipo, "error_tipo", "El tipo es requerido.");
        const esMarcaValido = validarCampoVacio(inputMarca, "error_marca", "La marca es requerida.");
        const esModeloValido = validarCampoVacio(inputModelo, "error_modelo", "El modelo es requerido.");
        const esSerieValido = validarCampoVacio(inputSerie, "error_serie", "El número de serie es requerido.");
        const esSOValido = validarCampoVacio(inputSO, "error_so", "El sistema operativo es requerido.");
        const esEstadoValido = validarCampoVacio(inputEstado, "error_estado", "El estado es requerido.");
        const esFechaValida = validarIndividualFechaCompra();
        const esGarantiaValida = validarIndividualGarantia();
        const esValorValido = validarIndividualValor();

        if (!esUserValido || !esTipoValido || !esMarcaValido || !esModeloValido || 
            !esSerieValido || !esSOValido || !esEstadoValido || !esFechaValida || 
            !esGarantiaValida || !esValorValido) {
            return;
        }

        const datosDispositivo = {
            usuario: selectUsuario.value,
            tipo: inputTipo.value.trim(),
            marca: inputMarca.value.trim(),
            modelo: inputModelo.value.trim(),
            serie: inputSerie.value.trim(),
            fechaCompra: inputFecha.value.trim(),
            garantiaMeses: Number(inputGarantia.value),
            sistemaOperativo: inputSO.value.trim(),
            estado: inputEstado.value.trim(),
            valor: Number(inputValor.value)
        };

        // Enviar POST al backend
        fetch("http://localhost:3000/dispositivos", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(datosDispositivo)
        })
        .then(res => {
            if (!res.ok) {
                return res.json().then(errData => {
                    const msg = errData.errores ? errData.errores.join("\n") : "Error al registrar el dispositivo.";
                    throw new Error(msg);
                });
            }
            return res.json();
        })
        .then(data => {
            alert("Dispositivo electrónico registrado y asociado correctamente.");
            limpiarFormulario();
            cargarDispositivos();
        })
        .catch(err => {
            alert("Error al registrar dispositivo:\n" + err.message);
        });
    });

    // --- FUNCIONES DE CARGA DE DATOS ---

    // Cargar usuarios en el select dropdown
    function cargarUsuariosDropdown() {
        fetch("http://localhost:3000/usuarios")
            .then(res => {
                if (!res.ok) throw new Error("Error al obtener usuarios.");
                return res.json();
            })
            .then(usuarios => {
                // Mantener la primera opción
                selectUsuario.innerHTML = '<option value="" selected>Seleccione el propietario...</option>';
                usuarios.forEach(user => {
                    const opt = document.createElement("option");
                    opt.value = user._id;
                    opt.textContent = `${user.nombre} (${user.run})`;
                    selectUsuario.appendChild(opt);
                });
            })
            .catch(err => {
                console.error("Error al cargar dropdown de usuarios:", err);
            });
    }

    // Cargar y renderizar dispositivos con agregación $lookup
    function cargarDispositivos() {
        tableBody.innerHTML = `
            <tr>
                <td colspan="11" class="text-center py-4 text-secondary">
                    <div class="spinner-border text-primary spinner-border-sm me-2" role="status"></div>
                    Cargando dispositivos electrónicos...
                </td>
            </tr>
        `;

        fetch("http://localhost:3000/dispositivos")
            .then(res => {
                if (!res.ok) throw new Error("Error al obtener dispositivos.");
                return res.json();
            })
            .then(dispositivos => {
                tableBody.innerHTML = "";
                if (dispositivos.length === 0) {
                    tableBody.innerHTML = `
                        <tr>
                            <td colspan="11" class="text-center py-4 text-muted">
                                No hay dispositivos electrónicos registrados.
                            </td>
                        </tr>
                    `;
                    return;
                }

                dispositivos.forEach(dev => {
                    const tr = document.createElement("tr");
                    const ownerName = dev.datosUsuario ? dev.datosUsuario.nombre : '<span class="text-danger">Sin dueño</span>';
                    const ownerRun = dev.datosUsuario ? dev.datosUsuario.run : '-';
                    const fCompraFormateada = formatearFechaVista(dev.fechaCompra);
                    
                    tr.innerHTML = `
                        <td class="ps-4 fw-semibold">${escaparHTML(ownerName)}</td>
                        <td><code class="text-info">${escaparHTML(ownerRun)}</code></td>
                        <td>${escaparHTML(dev.tipo)}</td>
                        <td>${escaparHTML(dev.marca)} ${escaparHTML(dev.modelo)}</td>
                        <td><code class="text-secondary">${escaparHTML(dev.serie)}</code></td>
                        <td>${fCompraFormateada}</td>
                        <td>${dev.garantiaMeses}</td>
                        <td>${escaparHTML(dev.sistemaOperativo)}</td>
                        <td>${escaparHTML(dev.estado)}</td>
                        <td class="fw-semibold text-success">$${Number(dev.valor).toLocaleString("es-CL")}</td>
                        <td class="text-center pe-4">
                            <button class="btn btn-sm btn-outline-danger btn-action btn-delete" data-id="${dev._id}">
                                <i class="bi bi-trash3-fill"></i>
                            </button>
                        </td>
                    `;
                    
                    tr.querySelector(".btn-delete").addEventListener("click", () => eliminarDispositivo(dev._id));
                    tableBody.appendChild(tr);
                });
            })
            .catch(err => {
                tableBody.innerHTML = `
                    <tr>
                        <td colspan="11" class="text-center text-danger py-4">
                            <i class="bi bi-exclamation-triangle-fill me-2"></i>Error al cargar dispositivos: ${err.message}
                        </td>
                    </tr>
                `;
            });
    }

    // Eliminar dispositivo
    function eliminarDispositivo(id) {
        if (confirm("¿Está seguro de que desea eliminar permanentemente este dispositivo electrónico?")) {
            fetch(`http://localhost:3000/dispositivos/${id}`, {
                method: "DELETE"
            })
            .then(res => {
                if (!res.ok) throw new Error("Error al eliminar el dispositivo.");
                return res.json();
            })
            .then(() => {
                cargarDispositivos();
            })
            .catch(err => {
                alert("Error al eliminar: " + err.message);
            });
        }
    }

    // --- FUNCIONES DE VALIDACIÓN UI ---

    function validarCampoVacio(input, errorDivId, mensaje) {
        const valor = input.value.trim();
        if (valor === "") {
            marcarCampo(input, errorDivId, false, mensaje);
            return false;
        }
        marcarCampo(input, errorDivId, true);
        return true;
    }

    function validarIndividualFechaCompra() {
        const valor = inputFecha.value.trim();
        if (valor === "") {
            marcarCampo(inputFecha, "error_fecha_compra", false, "La fecha de compra es requerida.");
            return false;
        }
        
        const reg = /^(\d{2})\/(\d{2})\/(\d{4})$/;
        const match = valor.match(reg);
        if (!match) {
            marcarCampo(inputFecha, "error_fecha_compra", false, "Formato dd/MM/yyyy incorrecto.");
            return false;
        }

        const dia = parseInt(match[1], 10);
        const mes = parseInt(match[2], 10);
        const anio = parseInt(match[3], 10);

        if (mes < 1 || mes > 12) {
            marcarCampo(inputFecha, "error_fecha_compra", false, "Mes inválido.");
            return false;
        }

        const esBisiesto = (anio % 4 === 0 && (anio % 100 !== 0 || anio % 400 === 0));
        const diasPorMes = [31, esBisiesto ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

        if (dia < 1 || dia > diasPorMes[mes - 1]) {
            marcarCampo(inputFecha, "error_fecha_compra", false, "Día inválido para ese mes.");
            return false;
        }

        const fechaIngresada = new Date(anio, mes - 1, dia);
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);

        if (fechaIngresada > hoy) {
            marcarCampo(inputFecha, "error_fecha_compra", false, "La fecha de compra no puede ser futura.");
            return false;
        }

        marcarCampo(inputFecha, "error_fecha_compra", true);
        return true;
    }

    function validarIndividualGarantia() {
        const valor = inputGarantia.value.trim();
        if (valor === "") {
            marcarCampo(inputGarantia, "error_garantia", false, "Garantía requerida.");
            return false;
        }
        const num = Number(valor);
        if (isNaN(num) || num < 0) {
            marcarCampo(inputGarantia, "error_garantia", false, "Mínimo 0 meses.");
            return false;
        }
        marcarCampo(inputGarantia, "error_garantia", true);
        return true;
    }

    function validarIndividualValor() {
        const valor = inputValor.value.trim();
        if (valor === "") {
            marcarCampo(inputValor, "error_valor", false, "El valor es requerido.");
            return false;
        }
        const num = Number(valor);
        if (isNaN(num) || num < 0) {
            marcarCampo(inputValor, "error_valor", false, "Mínimo $0.");
            return false;
        }
        marcarCampo(inputValor, "error_valor", true);
        return true;
    }

    function marcarCampo(inputElement, errorDivId, esValido, mensaje = "") {
        if (esValido) {
            inputElement.classList.remove("is-invalid");
            inputElement.classList.add("is-valid");
            const errDiv = document.getElementById(errorDivId);
            if (errDiv) errDiv.textContent = "";
        } else {
            inputElement.classList.add("is-invalid");
            inputElement.classList.remove("is-valid");
            const errDiv = document.getElementById(errorDivId);
            if (errDiv) errDiv.textContent = mensaje;
        }
    }

    // Limpiar formulario y resetear estados
    function limpiarFormulario() {
        deviceForm.reset();
        const campos = deviceForm.querySelectorAll(".form-control, .form-select");
        campos.forEach(campo => {
            campo.classList.remove("is-invalid");
            campo.classList.remove("is-valid");
        });
        const divsError = deviceForm.querySelectorAll(".invalid-feedback");
        divsError.forEach(div => {
            div.textContent = "";
        });
    }

    // --- UTILS ---

    function formatearFechaVista(fechaIso) {
        if (!fechaIso) return "";
        const fecha = new Date(fechaIso);
        if (isNaN(fecha.getTime())) return fechaIso;
        
        const dia = String(fecha.getUTCDate()).padStart(2, '0');
        const mes = String(fecha.getUTCMonth() + 1).padStart(2, '0');
        const anio = fecha.getUTCFullYear();
        return `${dia}/${mes}/${anio}`;
    }

    function escaparHTML(str) {
        if (typeof str !== 'string') return str;
        return str.replace(/[&<>'"]/g, 
            tag => ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                "'": '&#39;',
                '"': '&quot;'
            }[tag] || tag)
        );
    }
});
