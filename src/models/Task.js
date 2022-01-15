const mongoose = require('mongoose');
const { Schema } = mongoose;

const NoteSchema = new Schema({
    title: { type: String, required: true },
    status: { type: Boolean, required: true },
    activityId: { type: String }
});

module.exports = mongoose.model('Task', NoteSchema)