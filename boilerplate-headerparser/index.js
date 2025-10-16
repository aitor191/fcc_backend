// index.js
// where your node app starts

// init project
require('dotenv').config();
var express = require('express');
var app = express();

// enable CORS (https://en.wikipedia.org/wiki/Cross-origin_resource_sharing)
// so that your API is remotely testable by FCC
var cors = require('cors');
app.use(cors({ optionsSuccessStatus: 200 })); // some legacy browsers choke on 204

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/views/index.html');
});

// your first API endpoint...
app.get('/api/whoami', function (req, res) {
  /* 1 - Obtener la dirección IP del cliente
  req.ip proporciona la IP directamente en Express
  */
  let ipaddress = req.ip;

  /* 2 - Obtener el lenguaje preferido del header Accept-Language
  Este header contiene información sobre los idiomas que el cliente acepta
  */
  let lang = req.acceptsLanguages('Accept-Language');

  /* 3 - Obtener información del software/navegador del header User-Agent
   Este header identifica el navegador, sistema operativo y versión
  */
 let software = req.get('User-Agent');

 // 4 - Devuelve el JSON con los datos requeridos
  res.json({
    ipaddress : ipaddress,
    lang : lang,
    software : software
  });
});

// listen for requests :)
var listener = app.listen(process.env.PORT || 3000, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
