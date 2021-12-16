const express = require('express');
const router = express.Router();

const Note = require('../models/Note');
const { isAuthenticated } = require('../helpers/salida');


router.get('/notes/add', isAuthenticated, (req, res) => {
    res.render('notes/new-note');
});

router.post('/notes/new-note', isAuthenticated, async(req, res) => {
    const { title, description, time, calendar } = req.body;
    const errors = [];
    if (!title) {
        errors.push({ text: 'Por favor escriba un Titulo' });
    }
    if (!description) {
        errors.push({ text: 'Por favor escriba la Descripcion' });
    }
    if (errors.length > 0) {
        res.render('notes/new-note', {
            errors,
            title,
            description
        });
    } else {
        const newNote = new Note({ title, description, time, calendar });
        newNote.user = req.user.id;
        console.log(newNote);
        await newNote.save();
        req.flash('success_msg', 'Actividad Agregada');
        res.redirect('/notes');
    }
});
// mostrar todas las actividades
router.get('/notes', isAuthenticated, async(req, res) => {
    const notes = await Note.find({ user: req.user.id }).sort({ date: 'desc' }).lean();
    res.render('notes/all-notes', { notes });
});

router.get('/notes/edit/:id', isAuthenticated, async(req, res) => {
    const note = await Note.findById(req.params.id);
    res.render('notes/edit-note', { note });
});

router.put('/notes/edit-note/:id', isAuthenticated, async(req, res) => {
    const { title, description, time, calendar } = req.body;
    await Note.findByIdAndUpdate(req.params.id, { title, description, time, calendar });
    req.flash('success_msg', 'Actividad Actualizada!!!');
    res.redirect('/notes')
});

router.delete('/notes/delete/:id', isAuthenticated, async(req, res) => {
    await Note.findByIdAndDelete(req.params.id);
    req.flash('success_msg', 'Actividad Eliminada!!!');
    res.redirect('/notes');
});


module.exports = router;