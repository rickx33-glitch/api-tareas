
require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs').promises;
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3000;
const SECRET_KEY = process.env.JWT_SECRET;

app.use(bodyParser.json());

// Archivos de almacenamiento
const ARCHIVO_TAREAS = './tareas.json';
const ARCHIVO_USUARIOS = './usuarios.json';

// Verificar configuracion
if (!SECRET_KEY) {
    console.error('ERROR: Falta configurar JWT_SECRET en .env');
    process.exit(1);
}

// Registro de solicitudes para debugging
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

// Leer archivos JSON
async function leerArchivo(archivo) {
    try {
        const datos = await fs.readFile(archivo, 'utf8');
        return JSON.parse(datos);
    } catch (error) {
        if (error.code === 'ENOENT') {
            return [];
        }
        throw error;
    }
}

// Guardar archivos JSON
async function guardarArchivo(archivo, datos) {
    await fs.writeFile(archivo, JSON.stringify(datos, null, 2));
}

// Middleware de autenticacion
function autenticar(req, res, next) {
    const autorizacion = req.headers.authorization;

    if (!autorizacion || !autorizacion.startsWith('Bearer ')) {
        return res.status(401).json({
            error: 'Token requerido'
        });
    }

    const token = autorizacion.split(' ')[1];

    try {
        req.usuario = jwt.verify(token, SECRET_KEY);
        next();
    } catch (error) {
        return res.status(403).json({
            error: 'Token invalido o expirado'
        });
    }
}

// Registro de usuarios
app.post('/register', async (req, res, next) => {
    try {
        const { usuario, password } = req.body;

        if (!usuario || !password) {
            return res.status(400).json({
                error: 'Usuario y contrasena requeridos'
            });
        }

        const usuarios = await leerArchivo(ARCHIVO_USUARIOS);

        if (usuarios.some(u => u.usuario === usuario)) {
            return res.status(409).json({
                error: 'El usuario ya existe'
            });
        }

        const hash = await bcrypt.hash(password, 10);

        usuarios.push({
            usuario,
            password: hash
        });

        await guardarArchivo(ARCHIVO_USUARIOS, usuarios);

        res.status(201).json({
            mensaje: 'Usuario registrado correctamente'
        });

    } catch (error) {
        next(error);
    }
});

// Inicio de sesion
app.post('/login', async (req, res, next) => {
    try {
        const { usuario, password } = req.body;

        const usuarios = await leerArchivo(ARCHIVO_USUARIOS);

        const encontrado = usuarios.find(u => u.usuario === usuario);

        if (!encontrado || !(await bcrypt.compare(password || '', encontrado.password))) {
            return res.status(401).json({
                error: 'Credenciales incorrectas'
            });
        }

        const token = jwt.sign(
            { usuario },
            SECRET_KEY,
            { expiresIn: '1h' }
        );

        res.json({
            mensaje: 'Sesion iniciada',
            token
        });

    } catch (error) {
        next(error);
    }
});

// Consultar todas las tareas
app.get('/tareas', autenticar, async (req, res, next) => {
    try {
        const tareas = await leerArchivo(ARCHIVO_TAREAS);
        res.json(tareas);

    } catch (error) {
        next(error);
    }
});

// Crear una tarea
app.post('/tareas', autenticar, async (req, res, next) => {
    try {
        const { titulo, descripcion } = req.body;

        if (!titulo || !descripcion) {
            return res.status(400).json({
                error: 'Titulo y descripcion requeridos'
            });
        }

        const tareas = await leerArchivo(ARCHIVO_TAREAS);

        const nuevaTarea = {
            id: Date.now().toString(),
            titulo,
            descripcion,
            completada: false
        };

        tareas.push(nuevaTarea);

        await guardarArchivo(ARCHIVO_TAREAS, tareas);

        res.status(201).json(nuevaTarea);

    } catch (error) {
        next(error);
    }
});

// Actualizar una tarea
app.put('/tareas/:id', autenticar, async (req, res, next) => {
    try {
        const tareas = await leerArchivo(ARCHIVO_TAREAS);

        const indice = tareas.findIndex(
            t => t.id === req.params.id
        );

        if (indice === -1) {
            return res.status(404).json({
                error: 'Tarea no encontrada'
            });
        }

        const { titulo, descripcion, completada } = req.body;

        if (titulo !== undefined) {
            tareas[indice].titulo = titulo;
        }

        if (descripcion !== undefined) {
            tareas[indice].descripcion = descripcion;
        }

        if (completada !== undefined) {
            tareas[indice].completada = completada;
        }

        await guardarArchivo(ARCHIVO_TAREAS, tareas);

        res.json(tareas[indice]);

    } catch (error) {
        next(error);
    }
});

// Eliminar una tarea
app.delete('/tareas/:id', autenticar, async (req, res, next) => {
    try {
        const tareas = await leerArchivo(ARCHIVO_TAREAS);

        const nuevasTareas = tareas.filter(
            t => t.id !== req.params.id
        );

        if (nuevasTareas.length === tareas.length) {
            return res.status(404).json({
                error: 'Tarea no encontrada'
            });
        }

        await guardarArchivo(ARCHIVO_TAREAS, nuevasTareas);

        res.json({
            mensaje: 'Tarea eliminada correctamente'
        });

    } catch (error) {
        next(error);
    }
});

// Ruta no encontrada
app.use((req, res) => {
    res.status(404).json({
        error: 'Ruta no encontrada'
    });
});

// Middleware general de errores
app.use((error, req, res, next) => {
    console.error('Error:', error.message);

    res.status(500).json({
        error: 'Error interno del servidor'
    });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor ejecutandose en http://localhost:${PORT}`);
});
