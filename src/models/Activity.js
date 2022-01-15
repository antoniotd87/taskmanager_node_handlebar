const mongoose = require('mongoose');
const { Schema } = mongoose;

const NoteSchema = new Schema({
    title: { type: String, required: true },
    url: { type: String, required: true },
    description: { type: String, required: true },
    calendar_start: { type: Date, default: Date.now },
    calendar_finish: { type: Date, default: Date.now },
    user: { type: String }
});

module.exports = mongoose.model('Activity', NoteSchema)