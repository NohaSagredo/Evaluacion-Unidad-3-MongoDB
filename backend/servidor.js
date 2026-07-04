// Importa el framework Express para facilitar la creación de servidores y rutas HTTP
const express = require("express");
// Importa el paquete CORS para permitir que clientes en otros dominios o puertos accedan a este servidor
const cors = require("cors");
// Importa Mongoose, un ODM que facilita la interacción con bases de datos MongoDB
const mongoose = require("mongoose");
// Importa Body-Parser para analizar los datos JSON incluidos en los cuerpos de las solicitudes entrantes
const bodyParser = require("body-parser");
// Importa Multer para manejar la carga de archivos
const multer = require("multer");
// Importa Path para manejar rutas de archivos
const path = require("path");
// Importa Fs para crear directorios
const fs = require("fs");
    
// Crea la instancia principal de la aplicación Express
const app = express();
// Define el puerto de red en el que escuchará el servidor
const port = 3000;

// Habilita el middleware CORS para evitar restricciones de seguridad al consumir la API desde el frontend
app.use(cors());
// Habilita el middleware de Body-Parser para procesar las peticiones con datos en formato JSON
app.use(bodyParser.json());

// Servir la carpeta de subidas de forma estática
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}
app.use("/uploads", express.static(uploadDir));

// Servir la carpeta frontend de forma estática
app.use(express.static(path.join(__dirname, "../frontend")));

// Configuración de Multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + "-" + file.originalname);
    }
});
const upload = multer({
    storage: storage,
    fileFilter: function (req, file, cb) {
        if (file.mimetype === "application/pdf") {
            cb(null, true);
        } else {
            cb(new Error("Solo se permiten archivos en formato PDF."));
        }
    }
});

// Realiza la conexión a la base de datos local de MongoDB llamada "BD-No-Estructurados"
mongoose.connect("mongodb://localhost:27017/BD-No-Estructurados")
.then(() => {
    console.log("Conexión exitosa a la base de datos");
}).catch((error) => {
    console.log("Error al conectar a la base de datos", error);
});

// Obtiene el objeto de conexión de Mongoose para monitorear el estado de la base de datos
const db = mongoose.connection;

// Si ocurre un error al intentar conectarse, se registra y muestra en la consola
db.on("error", console.error.bind(console, "Error de conexión a la base de datos:"));
// Una vez que la conexión se abre exitosamente por primera vez, se muestra un mensaje confirmándolo
db.once("open", () => {
    console.log("Conexión exitosa a la base de datos por evento");
});

// Definición del esquema de Mongoose para Usuarios
const usuarioSchema = new mongoose.Schema({
    nombre: { type: String, required: true, minlength: 3 },
    run: { type: String, required: true, unique: true },
    correo: { type: String, required: true },
    telefono: { type: String, required: true },
    fechaNacimiento: { type: Date, required: true },
    nacionalidad: { type: String, required: true },
    genero: { type: String, required: true },
    direccion: { 
        type: String, 
        required: function() { 
            return this.nacionalidad === 'Extranjera'; 
        } 
    },
    contrasena: { type: String, required: true },
    terminosYCond: { type: Boolean, required: true },
    interes: { type: Boolean, default: false },
    activo: { type: Boolean, default: true },
    curriculum: { type: String, required: true },
    fechaRegistro: { type: Date, default: Date.now }
}, { timestamps: true });

const Usuario = mongoose.model("Usuario", usuarioSchema);

// Definición del esquema de Mongoose para Historial de Búsquedas
const busquedaSchema = new mongoose.Schema({
    terminos: { type: mongoose.Schema.Types.Mixed, required: true },
    fecha: { type: Date, default: Date.now }
});

const Busqueda = mongoose.model("Busqueda", busquedaSchema);

// Definición del esquema de Mongoose para Dispositivos Electrónicos
const dispositivoSchema = new mongoose.Schema({
    usuario: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Usuario", 
        required: true 
    },
    tipo: { type: String, required: true },
    marca: { type: String, required: true },
    modelo: { type: String, required: true },
    serie: { type: String, required: true, unique: true },
    fechaCompra: { type: Date, required: true },
    garantiaMeses: { type: Number, required: true, min: 0 },
    sistemaOperativo: { type: String, required: true },
    estado: { type: String, required: true },
    valor: { type: Number, required: true, min: 0 }
}, { timestamps: true });

const DispositivoElectronico = mongoose.model("DispositivoElectronico", dispositivoSchema);

// --- FUNCIONES AUXILIARES DE VALIDACIÓN ---

// Validador matemático del RUT Chileno con módulo 11
function validarRutChile(rutCompleto) {
    if (!rutCompleto) return false;
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

// Validador de mayoría de edad (18 años o más)
function esMayorDeEdad(fechaNacStr) {
    if (!fechaNacStr) return false;
    
    // Si la fecha viene en formato dd/mm/yyyy la convertimos para el constructor Date
    let fechaProcesada = fechaNacStr;
    if (typeof fechaNacStr === 'string' && fechaNacStr.includes('/')) {
        const partes = fechaNacStr.split('/');
        if (partes.length === 3) {
            fechaProcesada = `${partes[2]}-${partes[1]}-${partes[0]}`;
        }
    }
    
    const fechaNac = new Date(fechaProcesada);
    if (isNaN(fechaNac.getTime())) return false;
    
    const hoy = new Date();
    let edad = hoy.getFullYear() - fechaNac.getFullYear();
    const mes = hoy.getMonth() - fechaNac.getMonth();
    
    if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNac.getDate())) {
        edad--;
    }
    return edad >= 18;
}

// Validador de complejidad de contraseña (8-12 caracteres, mayúscula, minúscula, número, especial)
function validarContrasenaCompleja(pass) {
    if (!pass || pass.length < 8 || pass.length > 12) return false;
    if (!/[A-Z]/.test(pass)) return false;
    if (!/[a-z]/.test(pass)) return false;
    if (!/[0-9]/.test(pass)) return false;
    if (!/[!@#$%^&*(),.?":{}|<>_\-+=~`[\]\\|;'\/]/.test(pass)) return false;
    return true;
}

// Validador de formato de correo electrónico
function validarEmailRegex(email) {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
}

// Validador de teléfono (9 dígitos exactos)
function validarTelefono(telefono) {
    const telRegex = /^\d{9}$/;
    return telRegex.test(telefono);
}

// --- RUTAS DE LA API REST ---

// GET /usuarios: Lista usuarios con soporte de filtros para búsqueda avanzada
app.get("/usuarios", async (req, res) => {
    try {
        const { run, nacionalidad, estado, activo, nombre, genero } = req.query;
        let query = {};
        let searchTerms = {};
        
        if (run) {
            const runLimpio = run.replace(/\./g, "").replace(/-/g, "").trim();
            const regexStr = runLimpio.split("").join("[.-]?");
            query.run = { $regex: regexStr, $options: "i" };
            searchTerms.run = run.trim();
        }
        if (nombre) {
            query.nombre = { $regex: nombre.trim(), $options: "i" };
            searchTerms.nombre = nombre.trim();
        }
        if (nacionalidad) {
            query.nacionalidad = nacionalidad;
            searchTerms.nacionalidad = nacionalidad;
        }
        if (genero) {
            query.genero = genero;
            searchTerms.genero = genero;
        }
        const stateVal = activo !== undefined ? activo : estado;
        if (stateVal !== undefined && stateVal !== "") {
            query.activo = stateVal === "true";
            searchTerms.activo = stateVal;
        }
        
        // Registrar en el historial si hay filtros de búsqueda reales aplicados
        if (Object.keys(searchTerms).length > 0) {
            await new Busqueda({ terminos: searchTerms }).save();
        }

        const usuarios = await Usuario.find(query).sort({ createdAt: -1 });
        res.json(usuarios);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener usuarios: " + error.message });
    }
});

// POST /usuarios: Registra un nuevo usuario con validaciones en el backend y soporte de Multer para CV
app.post("/usuarios", upload.single("curriculum"), async (req, res) => {
    try {
        const {
            nombre, run, correo, telefono, fechaNacimiento,
            nacionalidad, genero, direccion, contrasena,
            terminosYCond, interes
        } = req.body;

        const errores = [];

        // Validaciones backend
        if (!nombre || nombre.trim().length < 3) {
            errores.push("El nombre completo debe tener al menos 3 caracteres.");
        }
        
        const runFormateado = run ? run.trim() : "";
        if (!validarRutChile(runFormateado)) { // Mantiene el nombre de función original validarRutChile
            errores.push("El RUN ingresado no es válido.");
        }

        if (!correo || !validarEmailRegex(correo)) {
            errores.push("El formato del correo electrónico es inválido.");
        }

        if (!telefono || !validarTelefono(telefono)) {
            errores.push("El teléfono de contacto debe tener exactamente 9 dígitos numéricos.");
        }

        if (!fechaNacimiento || !esMayorDeEdad(fechaNacimiento)) {
            errores.push("El usuario debe ser mayor de edad (18 años o más).");
        }

        if (!nacionalidad) {
            errores.push("La nacionalidad es requerida.");
        }

        if (!genero) {
            errores.push("El género es requerido.");
        }

        // Dirección es obligatoria SOLO para extranjeros
        if (nacionalidad === "Extranjera" && (!direccion || direccion.trim() === "")) {
            errores.push("La dirección es obligatoria si la nacionalidad es extranjera.");
        }

        if (!validarContrasenaCompleja(contrasena)) {
            errores.push("La contraseña debe tener de 8 a 12 caracteres y contener al menos una mayúscula, una minúscula, un número y un carácter especial.");
        }

        if (terminosYCond !== true && terminosYCond !== "true") {
            errores.push("Debe aceptar los términos y condiciones para registrarse.");
        }

        // El currículum en PDF es obligatorio
        if (!req.file) {
            errores.push("El currículum en formato PDF es obligatorio.");
        }

        if (errores.length > 0) {
            // Eliminar archivo si se subió pero hay otros errores de validación
            if (req.file) {
                fs.unlinkSync(req.file.path);
            }
            return res.status(400).json({ errores });
        }

        // Comprobar si el RUN ya está en la base de datos
        const usuarioExistente = await Usuario.findOne({ run: runFormateado });
        if (usuarioExistente) {
            if (req.file) {
                fs.unlinkSync(req.file.path);
            }
            return res.status(400).json({ errores: ["El RUN ingresado ya se encuentra registrado."] });
        }

        // Convertir fecha de nacimiento
        let fechaProcesada = fechaNacimiento;
        if (typeof fechaNacimiento === 'string' && fechaNacimiento.includes('/')) {
            const partes = fechaNacimiento.split('/');
            fechaProcesada = `${partes[2]}-${partes[1]}-${partes[0]}`;
        }

        const nuevoUsuario = new Usuario({
            nombre: nombre.trim(),
            run: runFormateado,
            correo: correo.trim(),
            telefono: telefono.trim(),
            fechaNacimiento: new Date(fechaProcesada),
            nacionalidad,
            genero,
            direccion: nacionalidad === "Extranjera" ? direccion.trim() : "",
            contrasena,
            terminosYCond: terminosYCond === true || terminosYCond === "true",
            interes: interes === true || interes === "true",
            activo: true,
            curriculum: req.file.filename
        });

        await nuevoUsuario.save();
        res.status(201).json({ mensaje: "Usuario registrado correctamente en MongoDB.", usuario: nuevoUsuario });
    } catch (error) {
        if (req.file) {
            fs.unlinkSync(req.file.path);
        }
        res.status(500).json({ error: "Error al registrar el usuario: " + error.message });
    }
});

// PUT /usuarios/:run: Actualiza los datos de un usuario buscando por su RUN
app.put("/usuarios/:run", async (req, res) => {
    try {
        const { run } = req.params;
        const {
            nombre, correo, telefono, fechaNacimiento,
            nacionalidad, genero, direccion, contrasena,
            activo, interes
        } = req.body;

        const errores = [];

        // Verificar existencia
        const usuario = await Usuario.findOne({ run });
        if (!usuario) {
            return res.status(404).json({ error: "Usuario no encontrado." });
        }

        // Validaciones si vienen los campos en la petición
        if (nombre !== undefined && nombre.trim().length < 3) {
            errores.push("El nombre completo debe tener al menos 3 caracteres.");
        }

        if (correo !== undefined && !validarEmailRegex(correo)) {
            errores.push("El formato del correo electrónico es inválido.");
        }

        if (telefono !== undefined && !validarTelefono(telefono)) {
            errores.push("El teléfono de contacto debe tener exactamente 9 dígitos numéricos.");
        }

        if (fechaNacimiento !== undefined && !esMayorDeEdad(fechaNacimiento)) {
            errores.push("El usuario debe ser mayor de edad (18 años o más).");
        }

        if (contrasena !== undefined && contrasena !== "" && !validarContrasenaCompleja(contrasena)) {
            errores.push("La contraseña debe tener de 8 a 12 caracteres y contener al menos una mayúscula, una minúscula, un número y un carácter especial.");
        }

        // Validación condicional de dirección si se modifica la nacionalidad o la dirección
        const nacEval = nacionalidad !== undefined ? nacionalidad : usuario.nacionalidad;
        const dirEval = direccion !== undefined ? direccion : usuario.direccion;
        if (nacEval === "Extranjera" && (!dirEval || dirEval.trim() === "")) {
            errores.push("La dirección es obligatoria si la nacionalidad es extranjera.");
        }

        if (errores.length > 0) {
            return res.status(400).json({ errores });
        }

        // Actualización de campos
        if (nombre !== undefined) usuario.nombre = nombre.trim();
        if (correo !== undefined) usuario.correo = correo.trim();
        if (telefono !== undefined) usuario.telefono = telefono.trim();
        
        if (fechaNacimiento !== undefined) {
            let fechaProcesada = fechaNacimiento;
            if (typeof fechaNacimiento === 'string' && fechaNacimiento.includes('/')) {
                const partes = fechaNacimiento.split('/');
                fechaProcesada = `${partes[2]}-${partes[1]}-${partes[0]}`;
            }
            usuario.fechaNacimiento = new Date(fechaProcesada);
        }
        
        if (nacionalidad !== undefined) usuario.nacionalidad = nacionalidad;
        if (genero !== undefined) usuario.genero = genero;
        if (direccion !== undefined) {
            usuario.direccion = nacEval === "Extranjera" ? direccion.trim() : "";
        }
        if (contrasena !== undefined && contrasena !== "") usuario.contrasena = contrasena;
        if (activo !== undefined) usuario.activo = !!activo;
        if (interes !== undefined) usuario.interes = !!interes;

        await usuario.save();
        res.json({ mensaje: "Usuario actualizado correctamente en MongoDB.", usuario });
    } catch (error) {
        res.status(500).json({ error: "Error al actualizar el usuario: " + error.message });
    }
});

// PATCH /usuarios/:run/estado: Cambia el estado activo/inactivo de un usuario de forma rápida
app.patch("/usuarios/:run/estado", async (req, res) => {
    try {
        const { run } = req.params;
        const { activo } = req.body;
        
        const usuario = await Usuario.findOne({ run });
        if (!usuario) {
            return res.status(404).json({ error: "Usuario no encontrado." });
        }
        
        usuario.activo = !!activo;
        await usuario.save();
        
        res.json({ mensaje: `Usuario ${activo ? 'activado' : 'desactivado'} correctamente.`, usuario });
    } catch (error) {
        res.status(500).json({ error: "Error al cambiar el estado del usuario: " + error.message });
    }
});

// DELETE /usuarios/:run: Elimina permanentemente a un usuario por su RUN
app.delete("/usuarios/:run", async (req, res) => {
    try {
        const { run } = req.params;
        const usuario = await Usuario.findOne({ run });
        
        if (!usuario) {
            return res.status(404).json({ error: "Usuario no encontrado." });
        }
        
        // Eliminar el archivo de currículum asociado si existe
        if (usuario.curriculum) {
            const cvPath = path.join(uploadDir, usuario.curriculum);
            if (fs.existsSync(cvPath)) {
                fs.unlinkSync(cvPath);
            }
        }

        await Usuario.deleteOne({ run });
        res.json({ mensaje: "Usuario eliminado correctamente de MongoDB." });
    } catch (error) {
        res.status(500).json({ error: "Error al eliminar el usuario: " + error.message });
    }
});

// --- RUTAS DEL HISTORIAL DE BÚSQUEDAS ---

// GET /historial: Obtiene el listado de las búsquedas anteriores
app.get("/historial", async (req, res) => {
    try {
        const historial = await Busqueda.find().sort({ fecha: -1 }).limit(10);
        res.json(historial);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener historial de búsquedas: " + error.message });
    }
});

// DELETE /historial/:id: Elimina un registro específico del historial
app.delete("/historial/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const resultado = await Busqueda.findByIdAndDelete(id);
        if (!resultado) {
            return res.status(404).json({ error: "Registro de historial no encontrado." });
        }
        res.json({ mensaje: "Registro de búsqueda eliminado del historial." });
    } catch (error) {
        res.status(500).json({ error: "Error al eliminar del historial: " + error.message });
    }
});

// DELETE /historial: Borra todo el historial de búsquedas
app.delete("/historial", async (req, res) => {
    try {
        await Busqueda.deleteMany({});
        res.json({ mensaje: "Historial de búsquedas vaciado correctamente." });
    } catch (error) {
        res.status(500).json({ error: "Error al vaciar el historial: " + error.message });
    }
});

// --- RUTAS DE DISPOSITIVOS ELECTRÓNICOS ---

// POST /dispositivos: Registra un nuevo dispositivo electrónico
app.post("/dispositivos", async (req, res) => {
    try {
        const {
            usuario, tipo, marca, modelo, serie,
            fechaCompra, garantiaMeses, sistemaOperativo,
            estado, valor
        } = req.body;

        const errores = [];

        // Validaciones
        if (!usuario) errores.push("El usuario propietario es obligatorio.");
        if (!tipo || tipo.trim() === "") errores.push("El tipo es obligatorio.");
        if (!marca || marca.trim() === "") errores.push("La marca es obligatoria.");
        if (!modelo || modelo.trim() === "") errores.push("El modelo es obligatorio.");
        if (!serie || serie.trim() === "") errores.push("El número de serie es obligatorio.");
        if (!fechaCompra) errores.push("La fecha de compra es obligatoria.");
        if (garantiaMeses === undefined || garantiaMeses < 0) errores.push("La garantía en meses debe ser mayor o igual a 0.");
        if (!sistemaOperativo || sistemaOperativo.trim() === "") errores.push("El sistema operativo es obligatorio.");
        if (!estado || estado.trim() === "") errores.push("El estado es obligatorio.");
        if (valor === undefined || valor < 0) errores.push("El valor del dispositivo debe ser mayor o igual a 0.");

        if (errores.length > 0) {
            return res.status(400).json({ errores });
        }

        // Verificar si la serie ya está registrada
        const serieExistente = await DispositivoElectronico.findOne({ serie: serie.trim() });
        if (serieExistente) {
            return res.status(400).json({ errores: ["El número de serie ingresado ya se encuentra registrado."] });
        }

        // Formatear fecha
        let fechaProcesada = fechaCompra;
        if (typeof fechaCompra === 'string' && fechaCompra.includes('/')) {
            const partes = fechaCompra.split('/');
            fechaProcesada = `${partes[2]}-${partes[1]}-${partes[0]}`;
        }

        const nuevoDispositivo = new DispositivoElectronico({
            usuario,
            tipo: tipo.trim(),
            marca: marca.trim(),
            modelo: modelo.trim(),
            serie: serie.trim(),
            fechaCompra: new Date(fechaProcesada),
            garantiaMeses: Number(garantiaMeses),
            sistemaOperativo: sistemaOperativo.trim(),
            estado: estado.trim(),
            valor: Number(valor)
        });

        await nuevoDispositivo.save();
        res.status(201).json({ mensaje: "Dispositivo electrónico registrado correctamente.", dispositivo: nuevoDispositivo });
    } catch (error) {
        res.status(500).json({ error: "Error al registrar el dispositivo: " + error.message });
    }
});

// GET /dispositivos: Obtiene los dispositivos cruzándolos con la colección usuarios usando $lookup
app.get("/dispositivos", async (req, res) => {
    try {
        const dispositivos = await DispositivoElectronico.aggregate([
            {
                $lookup: {
                    from: "usuarios", // Nombre de la colección en la base de datos
                    localField: "usuario", // Campo en DispositivoElectronico
                    foreignField: "_id", // Campo en Usuario
                    as: "datosUsuario"
                }
            },
            {
                $unwind: {
                    path: "$datosUsuario",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $sort: { createdAt: -1 }
            }
        ]);
        res.json(dispositivos);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener dispositivos: " + error.message });
    }
});

// DELETE /dispositivos/:id: Elimina un dispositivo por su ID
app.delete("/dispositivos/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const resultado = await DispositivoElectronico.findByIdAndDelete(id);
        if (!resultado) {
            return res.status(404).json({ error: "Dispositivo no encontrado." });
        }
        res.json({ mensaje: "Dispositivo electrónico eliminado correctamente." });
    } catch (error) {
        res.status(500).json({ error: "Error al eliminar el dispositivo: " + error.message });
    }
});

// Hace que la aplicación comience a escuchar en el puerto definido y notifica cuando esté listo
app.listen(port, () => {
    console.log(`Servidor corriendo en el puerto ${port}`);
});