const mongoose = require('mongoose');
const PersonalLogSchema = new mongoose.Schema({
    message: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true,
        enum: ['Report', 'Praise', 'Incident', 'Announcement']
    },
    writter:{
        type: String,
        required: true
    },
    studentId:{
        type: String,
        required: true
    },
    image : {
        type: [String],
        required: false
    },
    timestamp: {
        type: Date,
        required: true,
        default: Date.now
    }
});

module.exports = mongoose.model('PersonalLog', PersonalLogSchema);