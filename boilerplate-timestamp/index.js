// index.js
// where your node app starts

// init project
var express = require('express');
var app = express();

// enable CORS (https://en.wikipedia.org/wiki/Cross-origin_resource_sharing)
// so that your API is remotely testable by FCC 
var cors = require('cors');
app.use(cors({ optionsSuccessStatus: 200 }));  // some legacy browsers choke on 204

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (req, res) {
  res.sendFile(__dirname + '/views/index.html');
});


/* 1 - Ruta principal para el timestamp microservice 
Se define la ruta. El ? del parametro date hace que sea opcional. Así se puede manejar
tanto la api/xx-xx-xx como aquella sin parametro
*/
app.get("/api/:date?", function (req, res) {
  let dateParam = req.params.date;
  /* 2 - Manejar parametro vacio
Si no hay parametro se usa la fecha actual.
new Date() la crea
getTime() devuelve el timestamp en milisegundos
toUTCString la formatea
*/
  if (!dateParam) {
    const currentDate = new Date();
    return res.json({
      unix: currentDate.getTime(),
      utc: currentDate.toUTCString()
    });
  }

  /* 3 - Verificacion numerica del timestamp
  /^\d+$/.test(dateParam) verifica si es solo números (timestamp)
  Si es numerico lo convertimos a numero con parseInt(). Si no lo e, se trata como
  string de fecha.
  */
  if (/^\d+$/.test(dateParam)) {
    date = new Date(parseInt(dateParam));
  } else {
    date = new Date(dateParam);
  }

  /* Paso 4: Validar si la fecha es inválida (requisito 6)
  isNaN(date.getTime()) verifica si la fecha es válida. Si no devolvemos error.
  */
  if (isNaN(date.getTime())) {
    return res.json({ error: "Invalid Date" });
  }

  /* Paso 5: Retornar respuesta exitosa (requisito 2, 3 y 4)
  Se devuelven ambos formatos: unix y utc
  */
  res.json({
    unix: date.getTime(),
    utc: date.toUTCString()
  });

});



// Listen on port set in environment variable or default to 3000
var listener = app.listen(process.env.PORT || 3000, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});


/*Tests
1. You should provide your own project, not the example URL.

2. A request to /api/:date? with a valid date should return a JSON object
  with a unix key that is a Unix timestamp of the input date in milliseconds 
  (as type Number)

3. A request to /api/:date? with a valid date should return a JSON object with
  a utc key that is a string of the input date in the format: Thu,
  01 Jan 1970 00:00:00 GMT

4. A request to /api/1451001600000 should return { unix: 1451001600000, 
utc: "Fri, 25 Dec 2015 00:00:00 GMT" }

5. Your project can handle dates that can be successfully parsed by new Date(date_string)

6. If the input date string is invalid, the API returns an object 
having the structure { error : "Invalid Date" }

7. An empty date parameter should return the current time in a JSON object with a unix key

8. An empty date parameter should return the current time in a JSON object with a utc key

  */