const express = require('express');
const router = express.Router();
const moment = require('moment');;

const Note = require('../models/Activity');
const { isAuthenticated } = require('../helpers/salida');


router.get('/activities/add', isAuthenticated, (req, res) => {
    res.render('activity/new-activity');
});

router.post('/activities/new-activity', isAuthenticated, async (req, res) => {
    const { title, description, calendar_start, calendar_finish } = req.body;
    const errors = [];
    if (!title) {
        errors.push({ text: 'Por favor escriba un Titulo' });
    }
    if (!description) {
        errors.push({ text: 'Por favor escriba la Descripcion' });
    }
    if (errors.length > 0) {
        res.render('activities/new-activity', {
            errors,
            title,
            description
        });
    } else {
        const newNote = new Note({ title, description, calendar_start, calendar_finish });
        newNote.user = req.user.id;
        newNote.calendar_start = new Date(newNote.calendar_start).getTime() + 21600000;
        newNote.calendar_finish = new Date(newNote.calendar_finish).getTime() + 21600000;
        await newNote.save();
        req.flash('success_msg', 'Actividad Agregada');
        res.redirect('/activities');
    }
});
// mostrar todas las actividades
router.get('/activities', isAuthenticated, async (req, res) => {
    const notes = await Note.find({ user: req.user.id }).sort({ date: 'desc' });
    res.render('activity/activities', { notes });
});

router.get('/activities/edit/:id', isAuthenticated, async (req, res) => {
    let note = await Note.findById(req.params.id);
    let calendar_start = new Date(note.calendar_start).toISOString().substring(0, 10)
    let calendar_finish = new Date(note.calendar_finish).toISOString().substring(0, 10)
    res.render('activity/edit-activity', { note, calendar_finish, calendar_start });
});

router.put('/activities/edit-activity/:id', isAuthenticated, async (req, res) => {
    let { title, description, calendar_start, calendar_finish } = req.body;
    calendar_start = new Date(calendar_start).getTime() + 21600000;
    calendar_finish = new Date(calendar_finish).getTime() + 21600000;
    await Note.findByIdAndUpdate(req.params.id, {
        title,
        description,
        calendar_start,
        calendar_finish
    });
    req.flash('success_msg', 'Actividad Actualizada!!!');
    res.redirect('/activities')
});

router.delete('/activities/delete/:id', isAuthenticated, async (req, res) => {
    await Note.findByIdAndDelete(req.params.id);
    req.flash('success_msg', 'Actividad Eliminada!!!');
    res.redirect('/activities');
});


module.exports = router;