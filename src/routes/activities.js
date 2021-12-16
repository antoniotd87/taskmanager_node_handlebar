const express = require('express');
const router = express.Router();

const Note = require('../models/Activity');
const { isAuthenticated } = require('../helpers/salida');


router.get('/activities/add', isAuthenticated, (req, res) => {
    res.render('activity/new-activity');
});

router.post('/activities/new-activity', isAuthenticated, async(req, res) => {
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
        await newNote.save();
        req.flash('success_msg', 'Actividad Agregada');
        res.redirect('/activities');
    }
});
// mostrar todas las actividades
router.get('/activities', isAuthenticated, async(req, res) => {
    const notes = await Note.find({ user: req.user.id }).sort({ date: 'desc' });
    res.render('activity/activities', { notes });
});

router.get('/activities/edit/:id', isAuthenticated, async(req, res) => {
    const note = await Note.findById(req.params.id);
    res.render('activity/edit-activity', { note });
});

router.put('/activities/edit-activity/:id', isAuthenticated, async(req, res) => {
    const { title, description, calendar_start, calendar_finish } = req.body;
    await Note.findByIdAndUpdate(req.params.id, { title, description, calendar_start, calendar_finish });
    req.flash('success_msg', 'Actividad Actualizada!!!');
    res.redirect('/activities')
});

router.delete('/activities/delete/:id', isAuthenticated, async(req, res) => {
    await Note.findByIdAndDelete(req.params.id);
    req.flash('success_msg', 'Actividad Eliminada!!!');
    res.redirect('/activities');
});


module.exports = router;