const mongoose = require('mongoose');

const reqString = {
    type: String,
    required: true
};

const discordUsers = mongoose.Schema({
    user: reqString,
    id: reqString,
    username: reqString,
    nameHistory: [String],
    introSound: reqString,
});

module.exports = mongoose.model('discordUsers', discordUsers);