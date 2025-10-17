var express = require('express');
var cors = require('cors');
//1. Hacer npm install multer
//1.1 Importa el paquete multer para manejar la subida de archivos
var multer = require('multer');
require('dotenv').config()

var app = express();

/* 2. Configura multer para almacenar archivos en memoria en lugar de disco
memoryStorage() es más eficiente para este microservicio
ya que solo necesitamos los metadatos*/
var upload = multer({ storage: multer.memoryStorage() });

app.use(cors());
app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

/* 3.  Define una ruta POST en '/api/fileanalyse'
upload.single('upfile') procesa un solo archivo con el nombre 'upfile' (coincide con el formulario)
Esta función middleware de multer se encarga de parsear el archivo subido.*/
app.post('/api/fileanalyse', upload.single('upfile'), function (req, res) {
  /** 4. Verifica si se subió un archivo válido
        Si no hay archivo, retorna un error JSON inmediatamente */
  if (!req.file) {
    return res.json({ error: 'No se subió ningún archivo' });
  }
  /* 5. Retorna un objeto JSON con los metadatos requeridos
        req.file es el objeto que multer crea con toda la información del archivo*/
  res.json({
    name: req.file.originalname,  // Nombre original del archivo
    type: req.file.mimetype, // Tipo MIME (ej: image/jpeg, text/plain)
    size: req.file.size // Tamaño en bytes del archivo
  });
});

const port = process.env.PORT || 3000;
app.listen(port, function () {
  console.log('Your app is listening on port ' + port)
});
/*
ORDEN CRONOLÓGICO DE DESARROLLO:
1. Importar dependencias - Primero se importan todos los módulos necesarios
2. Configurar middleware - Se configura multer para el manejo de archivos
3. Definir rutas estáticas - Se configuran los archivos públicos
4. Ruta GET principal - Para servir la página HTML
5. Ruta POST de análisis - La funcionalidad principal del microservicio
6. Iniciar servidor - Finalmente se pone el servidor en escucha

FLUJO DE FUNCIONAMIENTO:
El usuario visita la página principal (/)
Sube un archivo mediante el formulario
El formulario hace POST a /api/fileanalyse
Multer procesa el archivo y lo almacena en memoria
La función handler extrae los metadatos del archivo
Se retorna la respuesta JSON con la información requerida
*/