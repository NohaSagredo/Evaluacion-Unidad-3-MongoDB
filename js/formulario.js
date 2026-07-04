function lenguaje(){
    alert('Cargando un script externo...')

    console.log('Mensaje por consola...')

    let nombre_personal;
    nombre_personal = 'Rodrigo Peña';
    console.log(nombre_personal)
    console.log(typeof(nombre_personal))

    nombre_personal = 789
    console.log(nombre_personal)
    console.log(typeof(nombre_personal))



    const apellido = 'Peña';
    console.log(apellido)


    let Apellido_Paterno = 'Peña'
    let apellido_paterno = 'peña'

    console.log(Apellido_Paterno)
    console.log(apellido_paterno)


    let $;
    let _;
    let $nombre;
    let _apellido;
    let a1b2;

    const COLOR_BLANCO = '#fff'
    const COLOR_AZUL = '#3907ce'
}

// document.body.style.backgroundColor=COLOR_AZUL
window.onload = function(){
    //document.body.style.backgroundColor=COLOR_AZUL
}

function enviarFormulario(url){
    alert('Enviando datos...')
    // location.reload()
}