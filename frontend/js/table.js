/**
 * ==========================================================================
 * Evaluación Unidad 3 - Control de Tabla de Usuarios (table.js)
 * ==========================================================================
 */

$(document).ready(function () {
    const apiUrl = "https://jsonplaceholder.typicode.com/users";
    cargarUsuarios(apiUrl);
});

/**
 * Realiza la petición AJAX para obtener la lista de usuarios y poblar la tabla.
 * @param {string} url - Dirección de la API
 */
function cargarUsuarios(url) {
    $.ajax({
        url: url,
        method: "GET",
        dataType: "json",
        success: function (data) {
            if (Array.isArray(data) && data.length > 0) {
                renderizarTabla(data);
            } else {
                mostrarErrorTabla("No se recibieron datos válidos de la API.");
            }
        },
        error: function (xhr, status, error) {
            console.error("Error al cargar usuarios:", error);
            mostrarErrorTabla("Hubo un problema al conectar con el servidor. Intente de nuevo más tarde.");
        }
    });
}

/**
 * Genera el marcado HTML para la tabla, la puebla con datos y la inicializa como DataTable.
 * @param {Array} usuarios - Lista de objetos de tipo usuario obtenidos de la API
 */
function renderizarTabla(usuarios) {
    const $tbody = $("#usersTable tbody");
    $tbody.empty();

    $.each(usuarios, function (index, usuario) {
        const filaHtml = `
            <tr>
                <td><span class="user-badge-id">${usuario.id}</span></td>
                <td class="fw-semibold">${usuario.name}</td>
                <td>@${usuario.username}</td>
                <td>
                    <a href="mailto:${usuario.email}" class="table-custom-link">
                        <i class="bi bi-envelope-fill me-1"></i>${usuario.email}
                    </a>
                </td>
                <td>
                    <a href="https://${usuario.website}" target="_blank" rel="noopener noreferrer" class="table-custom-link">
                        <i class="bi bi-box-arrow-up-right me-1"></i>${usuario.website}
                    </a>
                </td>
                <td>
                    <i class="bi bi-geo-alt-fill text-secondary me-1"></i>${usuario.address.city}
                </td>
            </tr>
        `;
        $tbody.append(filaHtml);
    });

    // Ocultar el loader y mostrar el contenedor de la tabla
    $("#table-loader").addClass("d-none");
    $("#table-container").removeClass("d-none");

    // Inicializar jQuery DataTable con configuraciones cyberpunk y traducción al español
    $("#usersTable").DataTable({
        responsive: true,
        pageLength: 5,
        lengthMenu: [[5, 10, 25, -1], [5, 10, 25, "Todos"]],
        order: [[0, "asc"]],
        language: {
            processing: "Procesando...",
            search: "<i class='bi bi-search text-secondary me-1'></i>Buscar:",
            searchPlaceholder: "Filtrar por nombre, usuario, email...",
            lengthMenu: "Mostrar _MENU_ registros",
            info: "Mostrando del _START_ al _END_ de un total de _TOTAL_ usuarios",
            infoEmpty: "Mostrando 0 al 0 de 0 usuarios",
            infoFiltered: "(filtrado de un total de _MAX_ usuarios)",
            loadingRecords: "Cargando registros...",
            zeroRecords: "No se encontraron usuarios coincidentes",
            emptyTable: "No hay datos disponibles en la tabla",
            paginate: {
                first: "<i class='bi bi-chevron-double-left'></i>",
                previous: "<i class='bi bi-chevron-left'></i>",
                next: "<i class='bi bi-chevron-right'></i>",
                last: "<i class='bi bi-chevron-double-right'></i>"
            }
        },
        columnDefs: [
            { orderable: false, targets: [3, 4] }
        ]
    });
}

/**
 * Muestra un mensaje de error en la interfaz en caso de que la carga falle.
 * @param {string} mensaje - Texto descriptivo del error
 */
function mostrarErrorTabla(mensaje) {
    const $loader = $("#table-loader");
    $loader.html(`
        <div class="alert alert-danger d-inline-flex align-items-center gap-2" role="alert" style="background-color: rgba(255, 59, 48, 0.15); border: 1.5px solid #ff3b30; color: #ff5b5b;">
            <i class="bi bi-exclamation-triangle-fill fs-4 me-2"></i>
            <div><strong>Error de Carga:</strong> ${mensaje}</div>
        </div>
        <div class="mt-3">
            <button class="btn btn-outline-info" onclick="location.reload();" style="border-color: #32fbe2; color: #32fbe2;">
                <i class="bi bi-arrow-clockwise me-1"></i> Reintentar Carga
            </button>
        </div>
    `);
}
