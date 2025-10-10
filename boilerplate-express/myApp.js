require('dotenv').config();
let bodyParser = require('body-parser');
//////////////////////////////////////////////////
let express = require('express');
let app = express();

//CH 2-7 Implementar un logger middleware en root
/** 
 * Build a simple logger. 
 * For every request, it should log to the console a string taking the following format: method path - ip. 
 * An example would look like this: GET /json - ::ffff:127.0.0.1. 
 * Note that there is a space between method and path and that the dash separating path and ip is surrounded by a space on both sides.
 * You can get the request method (http verb), the relative route path,
 * and the caller’s ip from the request object using req.method, req.path and req.ip. 
 * Remember to call next() when you are done, or your server will be stuck forever. 
 * Be sure to have the ‘Logs’ opened, and see what happens when some request arrives.
*/
function logger(req, res, next) {
  console.log(req.method + " " + req.path + " - " + req.ip);
  next();
}
app.use(logger);
/////////////////////////////////////////////////

//CH 2-11 Use body-parser to Parse POST Requests
/**
 * body-parser has already been installed and is in your project's package.json file. 
 * require it at the top of the myApp.js file and store it in a variable named bodyParser. 
 * The middleware to handle URL encoded data is returned by bodyParser.urlencoded({extended: false}). 
 * Pass the function returned by the previous method call to app.use(). 
 * As usual, the middleware must be mounted before all the routes that depend on it.
  Note: extended is a configuration option that tells body-parser which parsing needs to be used. 
  When extended=false it uses the classic encoding querystring library. 
  When extended=true it uses qs library for parsing.
  When using extended=false, values can be only strings or arrays. 
  The object returned when using querystring does not prototypically inherit from 
  the default JavaScript Object, which means functions like hasOwnProperty, toString will 
  not be available. The extended version allows more data flexibility, but it is outmatched 
  by JSON.
 */
app.use(bodyParser.urlencoded({ extended: false }))

//CH 2-8 Encadenar middlewares
/**In the route app.get('/now', ...) chain a middleware function 
 * and the final handler. In the middleware function you should add the current 
 * time to the request object in the req.time key. You can use new Date().toString(). 
 * In the handler, respond with a JSON object, 
 * taking the structure {time: req.time}. */
app.get("/now",
  (req, res, next) => {
    req.time = new Date().toString();
    next();
  },
  (req, res) => {
    res.json({ time: req.time });
  }
);
///////////////////////////////////////////////////
const absolutePath = __dirname + "/views/index.html";
app.get("/", (req, res) => {
  res.sendFile(absolutePath);
})
app.use("/public", express.static(__dirname + "/public"));
///////////////////////////////////////////////////

// CH 2-6 Uso del .env file
/**
 * Create a .env file in the root of your project directory, and store the variable MESSAGE_STYLE=uppercase in it.
Then, in the /json GET route handler you created in the last challenge access process.env.MESSAGE_STYLE 
and transform the response object's message to uppercase if the variable equals uppercase.
The response object should either be {"message": "Hello json"} or {"message": "HELLO JSON"}, 
depending on the MESSAGE_STYLE value. Note that you must read the value of process.env.MESSAGE_STYLE inside 
the route handler, not outside of it, due to the way our tests run.
You will need to use the dotenv package. It loads environment variables from your .env file into process.env. 
The dotenv package has already been installed, and is in your project's package.json file.
 At the top of your myApp.js file, add require('dotenv').config() to load the environment variables.
 */
app.get("/json", (req, res) => {
  let message = "Hello json";
  if (process.env.MESSAGE_STYLE === "uppercase") {
    message = message.toUpperCase();
  }
  res.json({ message: message })
});
module.exports = app;
//////////////////////////////////////////////////

//CH 2-9 Get route parameter input form client
/*Build an echo server, mounted at the route GET /:word/echo. 
Respond with a JSON object, taking the structure {echo: word}. 
You can find the word to be repeated at req.params.word. 
You can test your route from your browser's address bar, visiting some matching routes, 
e.g. your-app-rootpath/freecodecamp/echo.*/
app.get("/:word/echo", (req, res) => {
  res.json({ echo: req.params.word })
})

//CH 2-10 Get Query Param Input form client
/*Build an API endpoint, mounted at GET /name. Respond with a JSON document,
taking the structure { name: 'firstname lastname'}. 
The first and last name parameters should be encoded in a query string e.g. ?first=firstname&last=lastname.
Note: In the following exercise you are going to 
receive data from a POST request, at the same /name route path. 
If you want, you can use the method app.route(path).get(handler).post(handler). 
This syntax allows you to chain different verb handlers on the same path route. 
You can save a bit of typing, and have cleaner code.*/
app.route("/name")
  .get((req, res) => {
    let first = req.query.first;
    let last = req.query.last;
    res.json({ name: first + " " + last })})
/**
* CH 2-12 Get Data from POST Requests
Mount a POST handler at the path /name. It’s the same path as before. We have prepared a form in the html frontpage. It will submit the same data of exercise 10 (Query string). If the body-parser is configured correctly, you should find the parameters in the object req.body. Have a look at the usual library example:
Respond with the same JSON object as before: {name: 'firstname lastname'}. Test if your endpoint works using the html form we provided in the app frontpage.
*/
  .post((req, res) => {
    let first = req.body.first;
    let last = req.body.last;
    res.json({name: first + " " + last})
  });