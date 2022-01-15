const express = require('express');
const router = express.Router();
const moment = require('moment');
const shortid = require('shortid')

const Note = require('../models/Activity');
const Task = require('../models/Task');
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
    let inicio = moment(calendar_start)
    let fin = moment(calendar_finish)
    let time = fin.diff(inicio, 'days');
    console.log(time);
    if (time < 1) {
        errors.push({ text: 'Por favor seleccione fechas validas' });
    }
    if (errors.length > 0) {
        res.render('activity/new-activity', {
            errors,
            title,
            description
        });
    } else {
        const newNote = new Note({ title, description, calendar_start, calendar_finish });
        newNote.user = req.user.id;
        newNote.calendar_start = new Date(newNote.calendar_start).getTime() + 21600000;
        newNote.calendar_finish = new Date(newNote.calendar_finish).getTime() + 21600000;
        newNote.url = `${title.trim()}-${shortid.generate()}`
        await newNote.save();
        req.flash('success_msg', 'Actividad Agregada');
        res.redirect('/activities');
    }
});
// mostrar todas las actividades
router.get('/activities', isAuthenticated, async (req, res) => {
    let notes = await Note.find({ user: req.user.id }).sort({ date: 'desc' });
    notes = notes.map(note => {
        let calendar_start = new Date(note.calendar_start).toISOString().substring(0, 10)
        let calendar_finish = new Date(note.calendar_finish).toISOString().substring(0, 10)
        let inicio = moment(calendar_start)
        let fin = moment(calendar_finish)
        note.time = fin.diff(inicio, 'days');
        return note
    });
    res.render('activity/activities', { notes });
});
// mostrar detalles de una actividad
router.get('/activity/:url', isAuthenticated, async (req, res) => {
    let note = await Note.findOne({ url: req.params.url })

    console.log(req.params.url);
    console.log(note);

    const tasks = await Task.find({ activityId: note.id });
    let total = 0;
    let completo = 0;

    tasks.forEach(task => {
        if (task.status) {
            completo++;
        }
        total++;
    });
    let porcentaje = (completo / total) * 100;
    if (total == 0) {
        porcentaje = 0;
    }
    res.render('activity/show-activity', { note, tasks, porcentaje });
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

router.get('/all-activities', isAuthenticated, async (req, res) => {
    res.render('activity/gant');
});
router.get('/all-activities-json', async (req, res) => {
    // const notes = await Note.find({ user: req.user.id }).sort({ date: 'asc' });
    const notes = await Note.find({});
    let id = 1;
    let data = notes.map(async note => {
        let tasks = await Task.find({ activityId: note.id });
        // console.log(tasks);
        let calendar_start = new Date(note.calendar_start).toISOString().substring(0, 10)
        let calendar_finish = new Date(note.calendar_finish).toISOString().substring(0, 10)
        calendar_start = new Date(calendar_start).getTime()
        calendar_finish = new Date(calendar_finish).getTime()

        let total = 0;
        let completo = 0;

        tasks.forEach(task => {
            if (task.status) {
                completo++;
            }
            total++;
        });
        let porcentaje = (completo / total) * 100;
        if (total == 0) {
            porcentaje = 0;
        }

        let dataNote = {
            id,
            name: note.title,
            progressValue: `${porcentaje}%`,
            actualStart: calendar_start,
            actualEnd: calendar_finish
        }
        id++;
        return dataNote
    });
    let i = 0;
    let datos = []
    data.map(datanote => {
        datanote.then(val => {
            datos.push(val)
            i++;
            if (i == data.length) {
                console.log(datos);
                res.send(datos);
            }
        })
    });
});



module.exports = router;