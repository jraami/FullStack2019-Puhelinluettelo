const mongoose = require('mongoose')

if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}
const url = process.env.MONGODB_URI
console.log(process.env)

mongoose.connect(url)
    .then(result => {
        console.log('connected to database.')
    })
    .catch((error) => {
        console.log('database connection error: ', error.message)
    })
mongoose.Promise = global.Promise;

const personSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 3
    },
    number: {
        type: String,
        required: true,
        minlength: 8
    }
})

personSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id
        delete returnedObject._id
        delete returnedObject.__v
    }
})

/*
const person = new Person({
    name: 'Etunimi Sukunimi',
    number: '050-1234567'
})
const Person = mongoose.model('Person', {
    name: String,
    number: String
})*/

module.exports = mongoose.model('Person', personSchema)