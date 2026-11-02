const express = require('express')
const app = express()
const fs = require('fs')

app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }))

let notes = []

if (fs.existsSync('notes.json')) {
    const text = fs.readFileSync('notes.json', 'utf8')
    if (text.trim() !== "") {
        notes = JSON.parse(text)
    }
}

let nextId = 0;

for (let i = 0; i < notes.length; i++) {
    if (notes[i].id >= nextId) {
        nextId = notes[i].id + 1
    }
}

app.get('/', (req, res) => {
    res.render('index', { notes: notes, error: null })
})

app.post('/notes', (req, res) => {
    if (req.body.text.trim() === "") {
        return res.render('index', { notes: notes, error: "Note can't be empty!" })
    }

    notes.push({ id: nextId++, text: req.body.text, pinned: false })
    saveNotes();
    res.redirect('/')
})

app.post('/notes/:id/delete', (req, res) => {
    const id = Number(req.params.id)
    for (let i = 0; i < notes.length; i++) {
        if (notes[i].id === id) {
            notes.splice(i, 1)
            saveNotes();
            break
        }
    }
    res.redirect('/')
})

app.post('/notes/:id/pin', (req, res) => {
    const id = Number(req.params.id)
    for (let i = 0; i < notes.length; i++) {
        if (notes[i].id === id) {
            const note = notes[i]
            notes.splice(i, 1)
            note.pinned = !note.pinned

            if (note.pinned) {
                notes.unshift(note)
            } else {
                notes.push(note)
            }

            saveNotes()
            break
        }
    }
    res.redirect('/')
})

function saveNotes() {
    fs.writeFileSync('notes.json', JSON.stringify(notes, null, 2))
}

app.listen(3000)