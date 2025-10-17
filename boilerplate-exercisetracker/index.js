const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const mongoose = require('mongoose')

// 1. Conectar a MongoDB
const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/exercise-tracker'
mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('MongoDB connected')
}).catch(err => {
  console.error('MongoDB connection error:', err)
})

app.use(cors())

// 4. Middleware para parsear form data y JSON
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
})

// 2. Crear modelo USUARIO
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true }
})
const User = mongoose.model('User', userSchema)

// 2.1 Crear modelo EJERCICIO
const exerciseSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  description: { type: String, required: true },
  duration: { type: Number, required: true },
  date: { type: Date, default: Date.now }
})
const Exercise = mongoose.model('Exercise', exerciseSchema)

// 5. Implementar API

// POST /api/users - Crear nuevo usuario
app.post('/api/users', async (req, res) => {
  try {
    const { username } = req.body
    if (!username) {
      return res.status(400).json({ error: 'Username is required' })
    }

    const newUser = new User({ username })
    await newUser.save()

    res.json({ username: newUser.username, _id: newUser._id })
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ error: 'Username already exists' })
    } else {
      res.status(500).json({ error: 'Server error' })
    }
  }
})

// GET /api/users - Obtener todos los usuarios
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find({}, 'username _id')
    res.json(users)
  } catch (error) {
    res.status(500).json({ error: 'Server error' })
  }
})

// POST /api/users/:_id/exercises - Agregar ejercicio
app.post('/api/users/:_id/exercises', async (req, res) => {
  try {
    const { _id } = req.params
    const { description, duration, date } = req.body

    if (!description || !duration) {
      return res.status(400).json({ error: 'Description and duration are required' })
    }

    const user = await User.findById(_id)
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    const exerciseDate = date ? new Date(date) : new Date()
    const newExercise = new Exercise({
      userId: _id,
      description,
      duration: parseInt(duration),
      date: exerciseDate
    })

    await newExercise.save()

    res.json({
      _id: user._id,
      username: user.username,
      description: newExercise.description,
      duration: newExercise.duration,
      date: newExercise.date.toDateString()
    })
  } catch (error) {
    res.status(500).json({ error: 'Server error' })
  }
})

// GET /api/users/:_id/logs - Obtener log de ejercicios
app.get('/api/users/:_id/logs', async (req, res) => {
  try {
    const { _id } = req.params
    const { from, to, limit } = req.query

    const user = await User.findById(_id)
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    let query = { userId: _id }
    if (from) {
      query.date = { ...query.date, $gte: new Date(from) }
    }
    if (to) {
      query.date = { ...query.date, $lte: new Date(to) }
    }

    let exercisesQuery = Exercise.find(query, 'description duration date')
    if (limit) {
      exercisesQuery = exercisesQuery.limit(parseInt(limit))
    }

    const exercises = await exercisesQuery.exec()

    const log = exercises.map(exercise => ({
      description: exercise.description,
      duration: exercise.duration,
      date: exercise.date.toDateString()
    }))

    res.json({
      _id: user._id,
      username: user.username,
      count: log.length,
      log
    })
  } catch (error) {
    res.status(500).json({ error: 'Server error' })
  }
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})