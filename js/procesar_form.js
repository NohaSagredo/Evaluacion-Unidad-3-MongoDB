function validarFormulario() {
    let campoNombre = document.getElementById("input_nombre");
    console.log(campoNombre.value)

    let campoRut = document.getElementById("input_rut");
    console.log(campoRut.value)

    let campoEmail = document.getElementById("input_email");
    console.log(campoEmail.value)

    let campoFechaNac = document.getElementById("inputFechaNac");
    console.log(campoFechaNac.value)

    let campoGenero = document.querySelector('input[name="radioGenero"]:checked');
    let generoValor = campoGenero ? campoGenero.value : "No seleccionado";
    console.log(generoValor);

    let campoContrasena = document.getElementById("input_contrasena");
    console.log(campoContrasena.value)

    let campoConfirmContrasena = document.getElementById("input_confirm_contrasena");
    console.log(campoConfirmContrasena.value)

    alert("Formulario enviado con éxito: " + campoNombre.value + " " + campoRut.value + " " + campoEmail.value + " " + campoFechaNac.value + " " + generoValor + " " + campoContrasena.value + " " + campoConfirmContrasena.value);

}

function funcionPrueba() {
    let numero1 = 25;
    let numero2 = 44;
    let resultadoSuma = numero1 + numero2;

    console.log("numero1:", numero1);
    console.log("numero2:", numero2);
    console.log("resultadoSuma:", resultadoSuma);


    alert("Función de prueba ejecutada")
}
