const mongoose = require('mongoose');
const PersonalLogSchema = new mongoose.Schema({
    message: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true,
        enum: ['Incident', 'Daily Report', 'Reminder']
    },
    writter:{
        type: String,
        required: true
    },
    studentId:{
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        required: true,
        default: Date.now
    }
});

module.exports = mongoose.model('PersonalLog', PersonalLogSchema);