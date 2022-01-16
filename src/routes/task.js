const express = require('express');
const router = express.Router();
const moment = require('moment');
const shortid = require('shortid')

const Task = require('../models/Task');
const Note = require('../models/Activity');
const { isAuthenticated } = require('../helpers/salida');


// mostrar detalles de una actividad
router.post('/activity/:url', isAuthenticated, async (req, res) => {
    let note = await Note.findOne({ url: req.params.url })

    const { title } = req.body;
    const errors = [];
    if (!title) {
        errors.push({ text: 'Por favor escriba una tarea' });
    }
    if (errors.length > 0) {
        res.render('activities/new-activity', {
            errors,
            title
        });
    } else {
        let status = 0
        let activityId = note.id;
        const newTask = new Task({ title, status, activityId });
        await newTask.save();
        req.flash('success_msg', 'Tarea Agregada');
        res.redirect(`/activity/${note.url}`);
    }
});

router.put('/tasks/check/:id', isAuthenticated, async (req, res) => {
    let task = await Task.findById(req.params.id);
    let note = await Note.findById(req.body.activityId)
    task.status = task.status == false ? true : false;
    let message = task.status == false ? 'Tarea Incompleta' : 'Tarea Terminada';
    await task.save()
    req.flash('success_msg', message);
    res.redirect(`/activity/${note.url}`);
});

router.delete('/tasks/delete/:id', isAuthenticated, async (req, res) => {
    await Task.findByIdAndDelete(req.params.id);
    let note = await Note.findById(req.body.activityId)
    req.flash('success_msg', 'Tarea Eliminada!!!');
    res.redirect(`/activity/${note.url}`);
});

module.exports = router;