// 1. Importación de módulos necesarios
require('dotenv').config();
const express = require('express');
const cors = require('cors');
// 2. Agregar body-parser para procesar datos POST
const bodyParser = require('body-parser');
// 3. Importar módulo DNS para validación de URLs
const dns = require('dns');
const app = express();

// 4. Configuración básica del puerto
const port = process.env.PORT || 3000;

// 5. Configurar middleware CORS
app.use(cors());
// 6. Configurar middleware body-parser para datos URL-encoded y JSON
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// 7. Servir archivos estáticos desde la carpeta public
app.use('/public', express.static(`${process.cwd()}/public`));

// 8. Ruta principal que sirve el archivo HTML
app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// 9. Implementar almacenamiento en memoria para URLs
let urlDatabase = [];
let shortUrlCounter = 1;

// 10. Función para validar formato de URL
function isValidUrl(url) {
  try {
    const urlObj = new URL(url);
    // 11. Validar que el protocolo sea HTTP o HTTPS
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch (error) {
    return false;
  }
}

// 12. Endpoint POST para acortar URLs - Cumple requisito #2
app.post('/api/shorturl', function(req, res) {
  const originalUrl = req.body.url;
  
  // 13. Validación inicial del formato de URL
  if (!isValidUrl(originalUrl)) {
    // 14. Manejo de error para URL inválida - Cumple requisito #4
    return res.json({ error: 'invalid url' });
  }

  try {
    const urlObj = new URL(originalUrl);
    // 15. Validación DNS para verificar que el host existe
    dns.lookup(urlObj.hostname, (err, address) => {
      if (err) {
        return res.json({ error: 'invalid url' });
      }
      
      // 16. URL válida, agregar a la base de datos
      const shortUrl = shortUrlCounter++;
      urlDatabase.push({ original_url: originalUrl, short_url: shortUrl });
      
      // 17. Respuesta JSON con original_url y short_url - Cumple requisito #2
      res.json({ 
        original_url: originalUrl, 
        short_url: shortUrl 
      });
    });
  } catch (error) {
    res.json({ error: 'invalid url' });
  }
});

// 18. Endpoint GET para redireccionar - Cumple requisito #3
app.get('/api/shorturl/:short_url', function(req, res) {
  const shortUrl = parseInt(req.params.short_url);
  // 19. Buscar la URL original en la base de datos
  const urlEntry = urlDatabase.find(entry => entry.short_url === shortUrl);
  
  if (urlEntry) {
    // 20. Redirección a la URL original
    res.redirect(urlEntry.original_url);
  } else {
    res.json({ error: 'short url not found' });
  }
});

// 21. Endpoint de ejemplo existente (no modificado)
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

// 22. Iniciar el servidor
app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});