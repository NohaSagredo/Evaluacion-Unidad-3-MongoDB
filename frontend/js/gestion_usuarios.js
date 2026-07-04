document.addEventListener("DOMContentLoaded", () => {
    const tableBody = document.getElementById("users_table_body");
    const filterForm = document.getElementById("filterForm");
    const filterNombre = document.getElementById("filter_nombre");
    const filterRut = document.getElementById("filter_rut");
    const filterNacionalidad = document.getElementById("filter_nacionalidad");
    const filterGenero = document.getElementById("filter_genero");
    const filterEstado = document.getElementById("filter_estado");
    const btnLimpiar = document.getElementById("btn_limpiar_filtros");
    
    const historyContainer = document.getElementById("search_history_container");
    const btnLimpiarHistorial = document.getElementById("btn_limpiar_historial");

    // Modal de edición y su formulario
    const editModalEl = document.getElementById("editModal");
    const editModal = new bootstrap.Modal(editModalEl);
    const editForm = document.getElementById("editForm");
    const editRut = document.getElementById("edit_rut");
    const editNombre = document.getElementById("edit_nombre");
    const editEmail = document.getElementById("edit_email");
    const editTelefono = document.getElementById("edit_telefono");
    const editFecha = document.getElementById("edit_fecha");
    const editGenero = document.getElementById("edit_genero");
    const editNacionalidad = document.getElementById("edit_nacionalidad");
    const editDireccion = document.getElementById("edit_direccion");
    const editEstado = document.getElementById("edit_estado");
    const labelEditEstado = document.getElementById("label_edit_estado");
    const editInteres = document.getElementById("edit_interes");
    const btnGuardarEdicion = document.getElementById("btn_guardar_edicion");

    // Estado local para los usuarios
    let usuariosList = [];

    // Cargar usuarios e historial al iniciar
    cargarUsuarios();
    cargarHistorial();

    // Event listener para el switch de estado del modal (cambiar etiqueta dinámicamente)
    editEstado.addEventListener("change", (e) => {
        labelEditEstado.textContent = e.target.checked ? "Activo" : "Inactivo";
    });

    // Event listener para buscar / filtrar
    filterForm.addEventListener("submit", (e) => {
        e.preventDefault();
        cargarUsuarios();
    });

    // Event listener para limpiar filtros
    btnLimpiar.addEventListener("click", () => {
        filterNombre.value = "";
        filterRut.value = "";
        filterNacionalidad.value = "";
        filterGenero.value = "";
        filterEstado.value = "";
        cargarUsuarios();
    });

    // Event listener para limpiar todo el historial de búsquedas
    btnLimpiarHistorial.addEventListener("click", () => {
        if (confirm("¿Está seguro de que desea vaciar todo el historial de búsquedas?")) {
            fetch("http://localhost:3000/historial", { method: "DELETE" })
                .then(res => {
                    if (!res.ok) throw new Error("Error al vaciar historial.");
                    cargarHistorial();
                })
                .catch(err => alert("Error al borrar historial: " + err.message));
        }
    });

    // Cargar usuarios desde el servidor con filtros aplicados
    function cargarUsuarios() {
        tableBody.innerHTML = `
            <tr>
                <td colspan="10" class="text-center py-4 text-secondary">
                    <div class="spinner-border text-primary spinner-border-sm me-2" role="status"></div>
                    Cargando usuarios desde MongoDB...
                </td>
            </tr>
        `;

        const queryParams = new URLSearchParams();
        if (filterNombre.value.trim()) queryParams.append("nombre", filterNombre.value.trim());
        if (filterRut.value.trim()) queryParams.append("run", filterRut.value.trim());
        if (filterNacionalidad.value) queryParams.append("nacionalidad", filterNacionalidad.value);
        if (filterGenero.value) queryParams.append("genero", filterGenero.value);
        if (filterEstado.value) queryParams.append("activo", filterEstado.value);

        const url = `http://localhost:3000/usuarios?${queryParams.toString()}`;

        fetch(url)
            .then(res => {
                if (!res.ok) throw new Error("Error al obtener los datos del servidor.");
                return res.json();
            })
            .then(data => {
                usuariosList = data;
                renderizarTabla(data);
                cargarHistorial(); // Recargar historial después de ejecutar una búsqueda
            })
            .catch(err => {
                tableBody.innerHTML = `
                    <tr>
                        <td colspan="10" class="text-center text-danger py-4">
                            <i class="bi bi-exclamation-triangle-fill me-2"></i>Error al cargar usuarios: ${err.message}
                        </td>
                    </tr>
                `;
            });
    }

    // Renderizar la tabla de usuarios
    function renderizarTabla(usuarios) {
        tableBody.innerHTML = "";

        if (usuarios.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="10" class="text-center py-4 text-muted">
                        No se encontraron usuarios registrados con los filtros aplicados.
                    </td>
                </tr>
            `;
            return;
        }

        usuarios.forEach(user => {
            const tr = document.createElement("tr");

            // Formatear fecha para mostrar
            const fechaFormateada = formatearFechaVista(user.fechaNacimiento);
            const badgeClass = user.activo ? "badge-active" : "badge-inactive";
            const estadoTexto = user.activo ? "Activo" : "Inactivo";

            tr.innerHTML = `
                <td class="ps-4 fw-semibold">${escaparHTML(user.nombre)}</td>
                <td><code class="text-info">${escaparHTML(user.run)}</code></td>
                <td>${escaparHTML(user.correo)}</td>
                <td>${escaparHTML(user.telefono)}</td>
                <td>${escaparHTML(user.nacionalidad)}</td>
                <td>${escaparHTML(user.genero)}</td>
                <td class="text-truncate" style="max-width: 120px;" title="${escaparHTML(user.direccion || '')}">
                    ${escaparHTML(user.direccion || 'No requerida')}
                </td>
                <td>${fechaFormateada}</td>
                <td><span class="badge ${badgeClass} badge-state-toggle" style="cursor: pointer;" title="Haga clic para cambiar estado">${estadoTexto}</span></td>
                <td class="text-center pe-4">
                    <a href="./curriculum_vitae.html?run=${user.run}" class="btn btn-sm btn-outline-info me-1 btn-action" title="Ver CV en página aparte">
                        <i class="bi bi-file-earmark-person-fill"></i>
                    </a>
                    <a href="http://localhost:3000/uploads/${user.curriculum}" download class="btn btn-sm btn-outline-success me-1 btn-action" title="Descargar CV PDF">
                        <i class="bi bi-download"></i>
                    </a>
                    <button class="btn btn-sm btn-outline-warning me-1 btn-action btn-edit" data-run="${user.run}" title="Editar usuario">
                        <i class="bi bi-pencil-fill"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger btn-action btn-delete" data-run="${user.run}" title="Eliminar usuario">
                        <i class="bi bi-trash3-fill"></i>
                    </button>
                </td>
            `;

            // Asignar listeners
            tr.querySelector(".badge-state-toggle").addEventListener("click", () => toggleEstado(user.run, user.activo));
            tr.querySelector(".btn-edit").addEventListener("click", () => abrirModalEdicion(user));
            tr.querySelector(".btn-delete").addEventListener("click", () => eliminarUsuario(user.run));

            tableBody.appendChild(tr);
        });
    }

    // Cambiar estado activo/inactivo rápidamente
    function toggleEstado(run, activoActual) {
        fetch(`http://localhost:3000/usuarios/${run}/estado`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ activo: !activoActual })
        })
        .then(res => {
            if (!res.ok) throw new Error("Error al alternar estado del usuario.");
            return res.json();
        })
        .then(() => {
            cargarUsuarios();
        })
        .catch(err => {
            alert("Error: " + err.message);
        });
    }

    // Abrir Modal de Edición cargando los datos
    function abrirModalEdicion(user) {
        // Limpiar estilos de validación previos
        editForm.reset();
        const campos = editForm.querySelectorAll(".form-control, .form-select");
        campos.forEach(campo => {
            campo.classList.remove("is-invalid");
            campo.classList.remove("is-valid");
        });

        // Cargar datos en los inputs
        editRut.value = user.run;
        editNombre.value = user.nombre;
        editEmail.value = user.correo;
        editTelefono.value = user.telefono;
        editFecha.value = formatearFechaVista(user.fechaNacimiento);
        editGenero.value = user.genero;
        editNacionalidad.value = user.nacionalidad;
        editDireccion.value = user.direccion || "";
        
        editEstado.checked = !!user.activo;
        labelEditEstado.textContent = user.activo ? "Activo" : "Inactivo";
        
        editInteres.checked = !!user.interes;

        editModal.show();
    }

    // Guardar los cambios de la edición (Petición PUT)
    btnGuardarEdicion.addEventListener("click", () => {
        // Validar campos en el modal
        const esNombreValido = validarCampoTexto(editNombre, "edit_error_nombre", 3);
        const esEmailValido = validarEmail(editEmail, "edit_error_email");
        const esTelefonoValido = validarTelefono(editTelefono, "edit_error_telefono");
        const esFechaValida = validarFechaYEdad(editFecha, "edit_error_fecha");
        
        // Dirección es opcional si es Chilena
        const esDireccionValida = (editNacionalidad.value === "Extranjera") 
            ? validarCampoTexto(editDireccion, "edit_error_direccion", 1) 
            : (() => { 
                editDireccion.classList.remove("is-invalid");
                editDireccion.classList.add("is-valid");
                const errDiv = document.getElementById("edit_error_direccion");
                if (errDiv) errDiv.textContent = "";
                return true; 
            })();

        if (!esNombreValido || !esEmailValido || !esTelefonoValido || !esFechaValida || !esDireccionValida) {
            return;
        }

        const runUser = editRut.value;
        const datosActualizados = {
            nombre: editNombre.value.trim(),
            correo: editEmail.value.trim(),
            telefono: editTelefono.value.trim(),
            fechaNacimiento: editFecha.value.trim(),
            genero: editGenero.value,
            nacionalidad: editNacionalidad.value,
            direccion: editNacionalidad.value === "Extranjera" ? editDireccion.value.trim() : "",
            activo: editEstado.checked,
            interes: editInteres.checked
        };

        // Enviar PUT al backend
        fetch(`http://localhost:3000/usuarios/${runUser}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(datosActualizados)
        })
        .then(res => {
            if (!res.ok) {
                return res.json().then(errData => {
                    const msg = errData.errores ? errData.errores.join("\n") : "Error al actualizar el usuario.";
                    throw new Error(msg);
                });
            }
            return res.json();
        })
        .then(data => {
            editModal.hide();
            cargarUsuarios(); // Recargar tabla
            alert("Usuario actualizado correctamente.");
        })
        .catch(err => {
            alert("Error al actualizar:\n" + err.message);
        });
    });

    // Eliminar un usuario (Petición DELETE)
    function eliminarUsuario(run) {
        if (confirm(`¿Está seguro de que desea eliminar permanentemente al usuario con RUN ${run}?`)) {
            fetch(`http://localhost:3000/usuarios/${run}`, {
                method: "DELETE"
            })
            .then(res => {
                if (!res.ok) throw new Error("Error al intentar eliminar el usuario.");
                return res.json();
            })
            .then(data => {
                cargarUsuarios(); // Recargar tabla
                alert("Usuario eliminado correctamente.");
            })
            .catch(err => {
                alert("Error al eliminar:\n" + err.message);
            });
        }
    }

    // --- FUNCIONES DE VALIDACIÓN UI (MODAL) ---

    function validarCampoTexto(input, errorDivId, minLargo) {
        const valor = input.value.trim();
        if (valor === "" || valor.length < minLargo) {
            marcarCampo(input, errorDivId, false);
            return false;
        }
        marcarCampo(input, errorDivId, true);
        return true;
    }

    function validarEmail(input, errorDivId) {
        const valor = input.value.trim();
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (valor === "" || !emailRegex.test(valor)) {
            marcarCampo(input, errorDivId, false);
            return false;
        }
        marcarCampo(input, errorDivId, true);
        return true;
    }

    function validarTelefono(input, errorDivId) {
        const valor = input.value.trim();
        if (valor === "" || !/^\d{9}$/.test(valor)) {
            marcarCampo(input, errorDivId, false);
            return false;
        }
        marcarCampo(input, errorDivId, true);
        return true;
    }

    function validarFechaYEdad(input, errorDivId) {
        const valor = input.value.trim();
        const reg = /^(\d{2})\/(\d{2})\/(\d{4})$/;
        const match = valor.match(reg);
        if (!match) {
            marcarCampo(input, errorDivId, false);
            return false;
        }

        const dia = parseInt(match[1], 10);
        const mes = parseInt(match[2], 10);
        const anio = parseInt(match[3], 10);

        if (mes < 1 || mes > 12) {
            marcarCampo(input, errorDivId, false);
            return false;
        }

        const esBisiesto = (anio % 4 === 0 && (anio % 100 !== 0 || anio % 400 === 0));
        const diasPorMes = [31, esBisiesto ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

        if (dia < 1 || dia > diasPorMes[mes - 1]) {
            marcarCampo(input, errorDivId, false);
            return false;
        }

        const fechaIngresada = new Date(anio, mes - 1, dia);
        const hoy = new Date();

        hoy.setHours(0, 0, 0, 0);
        if (fechaIngresada > hoy) {
            marcarCampo(input, errorDivId, false);
            return false;
        }

        // Mayoría de edad (18 años)
        let edad = hoy.getFullYear() - fechaIngresada.getFullYear();
        const difMeses = hoy.getMonth() - fechaIngresada.getMonth();
        if (difMeses < 0 || (difMeses === 0 && hoy.getDate() < fechaIngresada.getDate())) {
            edad--;
        }

        if (edad < 18) {
            marcarCampo(input, errorDivId, false);
            return false;
        }

        marcarCampo(input, errorDivId, true);
        return true;
    }

    function marcarCampo(inputElement, errorDivId, esValido) {
        if (esValido) {
            inputElement.classList.remove("is-invalid");
            inputElement.classList.add("is-valid");
        } else {
            inputElement.classList.add("is-invalid");
            inputElement.classList.remove("is-valid");
        }
    }

    // --- UTILS ---

    function formatearFechaVista(fechaIso) {
        if (!fechaIso) return "";
        const fecha = new Date(fechaIso);
        if (isNaN(fecha.getTime())) return fechaIso;
        
        // Usamos UTC para evitar desajustes de zona horaria al renderizar fechas solas
        const dia = String(fecha.getUTCDate()).padStart(2, '0');
        const mes = String(fecha.getUTCMonth() + 1).padStart(2, '0');
        const anio = fecha.getUTCFullYear();
        return `${dia}/${mes}/${anio}`;
    }

    function escapingRegex(str) {
        return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    // Cargar y mostrar historial de búsquedas
    function cargarHistorial() {
        fetch("http://localhost:3000/historial")
            .then(res => {
                if (!res.ok) throw new Error("Error al cargar historial.");
                return res.json();
            })
            .then(historial => {
                historyContainer.innerHTML = "";
                if (historial.length === 0) {
                    historyContainer.innerHTML = '<span class="text-muted" style="font-size: 0.9rem;">No hay búsquedas recientes en el historial.</span>';
                    return;
                }

                historial.forEach(busqueda => {
                    const terms = busqueda.terminos;
                    let textParts = [];
                    if (terms.nombre) textParts.push(`Nombre: ${terms.nombre}`);
                    if (terms.run) textParts.push(`RUN: ${terms.run}`);
                    if (terms.nacionalidad) textParts.push(`Nac: ${terms.nacionalidad}`);
                    if (terms.genero) textParts.push(`Gén: ${terms.genero}`);
                    if (terms.activo) textParts.push(`Activo: ${terms.activo === 'true' ? 'Sí' : 'No'}`);

                    const labelText = textParts.join(", ");
                    
                    const badge = document.createElement("div");
                    badge.className = "badge bg-dark border border-secondary text-white d-flex align-items-center gap-2 p-2";
                    badge.style.cursor = "pointer";
                    badge.style.fontSize = "0.85rem";
                    
                    const textSpan = document.createElement("span");
                    textSpan.textContent = labelText || "Búsqueda vacía";
                    textSpan.addEventListener("click", () => {
                        // Aplicar filtros
                        filterNombre.value = terms.nombre || "";
                        filterRut.value = terms.run || "";
                        filterNacionalidad.value = terms.nacionalidad || "";
                        filterGenero.value = terms.genero || "";
                        filterEstado.value = terms.activo || "";
                        cargarUsuarios();
                    });
                    
                    const deleteBtn = document.createElement("button");
                    deleteBtn.className = "btn-close btn-close-white p-0";
                    deleteBtn.style.fontSize = "0.65rem";
                    deleteBtn.style.width = "auto";
                    deleteBtn.style.height = "auto";
                    deleteBtn.type = "button";
                    deleteBtn.addEventListener("click", (e) => {
                        e.stopPropagation();
                        eliminarHistorialEntry(busqueda._id);
                    });
                    
                    badge.appendChild(textSpan);
                    badge.appendChild(deleteBtn);
                    historyContainer.appendChild(badge);
                });
            })
            .catch(err => {
                historyContainer.innerHTML = `<span class="text-danger" style="font-size: 0.9rem;">Error al cargar historial: ${err.message}</span>`;
            });
    }

    function eliminarHistorialEntry(id) {
        fetch(`http://localhost:3000/historial/${id}`, { method: "DELETE" })
            .then(res => {
                if (!res.ok) throw new Error("Error al eliminar entrada del historial.");
                cargarHistorial();
            })
            .catch(err => alert("Error: " + err.message));
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
