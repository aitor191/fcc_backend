require('dotenv').config();
const mongoose = require('mongoose'); //Require
//Generar conexion con el cluster
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

// Manejo de eventos de conexión
mongoose.connection.on('connected', () => {
  console.log('✅ Conectado a MongoDB Atlas');
});

mongoose.connection.on('error', (err) => {
  console.log('❌ Error de conexión:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('⚠️ Desconectado de MongoDB Atlas');
});

//3.2 Esquema defina la forma de los documentos en el cluster a través de mongoose.
const personSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  age: {
    type: Number
  },
  favoriteFoods: {
    type: [String]
  }
})
//3.2 Creamos modelo para interactuar con el cluster (Constructor)
let Person = mongoose.model('Person', personSchema);


const createAndSavePerson = (done) => {
  //3.3 creamos instancia de los datos, pero no se guarda hasta hacer un .save()
  let aitor = new Person({ name: 'Aitor', age: 29, favoriteFoods: ['Pizza', 'Patata'] })
  //primero se pasa el error y luego la funcion (done)
  aitor.save((error, data) => {
    if (error) {
      console.log(error)
    } else {
      done(null, data)
    }
  })
};

//3.3 Crear personas y meterlas en el array
let p1 = new Person ({name: 'hector', age: 10, favoriteFoods: ['Lechuga', 'tomate']})
let p2 = new Person ({name: 'miguel', age: 15, favoriteFoods: ['Pan', 'Carne']})
let p3 = new Person ({name: 'Pablo', age: 20, favoriteFoods: ['Queso', 'Cebolla']})

let arrayOfPeople = [p1, p2, p3];

const createManyPeople = (arrayOfPeople, done) => {
  Person.create(arrayOfPeople, (error, data) => {
    if (error) {
      console.log('Error al crear múltiples personas:', error);
      done(error);
    } else {
      console.log('Personas creadas exitosamente:', data.length);
      done(null, data);
    }
  });
};

const findPeopleByName = (personName, done) => {
  Person.find({name: personName}, (error, data)=>{
    if (error){
      console.log('Error al buscar por nombre:', error);
      done(error);
    }else{
      console.log('Personas filtradas por nombre: ', data);
      done(null, data);
    }
  });
};

const findOneByFood = (food, done) => {
  Person.findOne({favoriteFoods: food}, (error, data)=>{
    if (error){
      console.log('Imposible de encontrar:', error);
      done(error);
    }else{
      console.log('Filtrado por comida:', data);
      done(null, data);
    }
  })
};

const findPersonById = (personId, done) => {
  Person.findById(personId, (error, data)=>{
    if(error){
      console.log('Not found.', error);
      done(error);
    }else{
      console.log('Encontrado por ID: ', data);
      done(null , data);
    }
  })
};
//3.7 Usamos findById() para encontrar la persona por su ID único
const findEditThenSave = (personId, done) => {
  //El callback recibe el documento completo como person
  Person.findById(personId, (error, person)=>{
    //manejo del flujo de errores
    if(error){
      console.log('No encontrado', error);
    } else{
      console.log('Encontrado por ID:', person);
      const foodToAdd = "hamburger";
      //person es el documento encontrado
      //person.favoriteFoods accede al array de comidas favoritas
      //.push("hamburger") agrega "hamburger" al array
      person.favoriteFoods.push(foodToAdd);
      //Guardamos cambios.
      //Es asicncrono, por eso necesita otro callback
      person.save((saveError, updatedPerson)=>{
        //flujo de errores
        if(saveError){
          console.log('Error al guardar:', saveError);
          done(saveError);
        }else{
          console.log('Exito al guardar', updatedPerson);
          done(null, updatedPerson);
        }
      })
    }
  })

};

//3.8 Simplificacion de modificar
const findAndUpdate = (personName, done) => {
  const ageToSet = 20;

  Person.findOneAndUpdate(
    {name : personName}, // Filtro de búsqueda
    {age : ageToSet}, // Datos a actualizar
    {new : true},  // Opciones: devolver documento actualizado
    (error, updatedData)=>{ //Flujo de error/exito
      if(error){
        console.log('Error al actualizar:', error);
        done(error);
      }else {
        console.log('Persona actualizada', updatedData);
        done(null, updatedData);
      }
    }
  )
};

//3.9 Buscar y borrar
const removeById = (personId, done) => {
  //usamos metodo para buscar y borrar
  Person.findByIdAndRemove(personId, (error, data)=>{
    if(error){
      console.log('No encontrado', error);
      done(error);
    }else{
      console.log('Encontrado y borrado', data);
      done(null, data);
    }
  })
};

//3.10 Delete many con model.Remove()
const removeManyPeople = (done) => {
  const nameToRemove = "Mary";
  //Al metodo le pasamos la variable a borrar y el callback (error, nameRemoved)
  Person.remove(
    {name: nameToRemove}, //variable a borrar
    (error, nameRemoved)=>{ //callback de la funcion
      //flujo de error/resultado
      if(error){
        console.log('No se pudo borrar', error);
        done(error);
      }else{
        console.log('Nombre borrado con exito', nameRemoved);
        done(null, nameRemoved);
      }
    })
};

//3.11 Encadenar consultas para estrechar busqueda
const queryChain = (done) => {
  const foodToSearch = "burrito";

  Person.find({favoriteFoods: foodToSearch}) // Filtra por personas que tengan burrito en su array
  .sort({name: 1}) // Ordenar por el campo nombre (ascendente = 1 | descendente -1)
  .limit(2)  // Limitar a dos resultados
  .select({age : 0}) // Ocultar campo age (excluir = 0 | incluir = 1)
  .exec((error, data)=>{ // ejecutar query con el callback
    if(error){
      console.log('Error en la query', error);
      done(error);
    }else{
      console.log('Resultado encontrados:', data);
      done(null, data);
    }
    // Encontraría máx. 2 personas que les guste el burrito, 
    // ordenadas por nombre, sin mostrar su edad.
  })
};

/** **Well Done !!**
/* You completed these challenges, let's go celebrate !
 */

//----- **DO NOT EDIT BELOW THIS LINE** ----------------------------------

exports.PersonModel = Person;
exports.createAndSavePerson = createAndSavePerson;
exports.findPeopleByName = findPeopleByName;
exports.findOneByFood = findOneByFood;
exports.findPersonById = findPersonById;
exports.findEditThenSave = findEditThenSave;
exports.findAndUpdate = findAndUpdate;
exports.createManyPeople = createManyPeople;
exports.removeById = removeById;
exports.removeManyPeople = removeManyPeople;
exports.queryChain = queryChain;