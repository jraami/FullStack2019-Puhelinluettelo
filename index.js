const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')

app.use(express.static('build'))
app.use(bodyParser.json())
app.use(cors())
morgan.token('bodycontent', function (req, res) { return JSON.stringify(req.body) })
app.use(morgan(':method :url :bodycontent :status :res[content-length] - :response-time ms'))

// Formatoidaan id uudestaan
const formatPerson = (person) => {
    return {
        id: person._id,
        name: person.name,
        number: person.number
    }
}

// How many entries

app.get('/info', (request, response) => {
    Person
        .count({}, (err, count) => {
            response.send('There are ' + count + ' people in the phonebook.')
        })
        .catch(error => next(error))
})

// All entries in json

app.get('/api/persons', (request, response) => {
    Person
        .find({})
        .then(persons => {
            response.json(persons.map(formatPerson))
        })
})

// Get one entry by id

app.get('/api/persons/:id', (request, response, next) => {
    Person
        .findById(request.params.id)
        .then(person => {
            if (person) {
                response.json(formatPerson(person))
            }
            else {
                response.status(404).end()
            }
        })
        .catch(error => next(error))
})

// Delete one entry by id

app.delete('/api/persons/:id', (request, response, next) => {
    const id = request.params.id
    Person
        .findByIdAndDelete(id)
        .then(result => {
            response.status(204).end()
        })
        .catch(error => next(error))
})

/* app.delete('/api/persons/:id', (request, response) => {
    const id = request.params.id
    //    entriesToShow = entriesToShow.filter(person => person.id !== id)
    Person
        .findByIdAndDelete(id, (err, deletedPerson) => {
            if (err) return response.status(500).send(err)
            const res = {
                message: "Success",
                id: deletedPerson.id
            }
        })
        .then(person => {
            if (person) {
                response.json(person)
                response.status(204).end()
            }
            else {
                response.status(404).end()
            }
        })
        .catch(error => next(error))
}) */


// Post a new entry

app.post('/api/persons', (request, response, next) => {
    const body = request.body
    if (!body.name) {
        return response.status(400).json({ error: 'Needs a name.' })
    }
    else if (!body.number) {
        return response.status(400).json({ error: 'Needs a number.' })
    }

    const person = new Person({
        name: body.name,
        number: body.number
    })
    person
        .save()
        .then(savedEntry => {
            response.json(formatPerson(savedEntry))
        })
        .catch(error => next(error))

})

// Update existing

app.put('/api/persons/:id', (request, response) => {
    const id = request.params.id
    const body = request.body
    Person
        .findByIdAndUpdate(id, { $set: { number: body.number } }, { new: true }, (err) => {
            if (err) return response.status(500).end()
        })
        .then(updated => {
            response.json(updated)
            response.status(204).end()
        })
        .catch(error => next(error))
})

// Unknown endpoints

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

// Error handling 

const errorHandler = (error, request, response, next) => {
    console.error(error.message)

    if (error.name === 'CastError' && error.kind == 'ObjectId') {
        return response.status(400).send({ error: 'malformatted id' })
    }
    else if (error.name === 'ValidationError') {
        return response.status(400).json({ error: error.message })
    }

    next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
