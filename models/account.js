var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');

var Account = new Schema({
    username: String,
    access_level: { type: String, enum: ['Administrator', 'Client'] },
    creation_date: { type: Date },
    date_last_edited: { type: Date },
    isActive: { type: Boolean, required: true },
    password: String
});

Account.plugin(passportLocalMongoose);

// Virtual for viewer's URL
Account
    .virtual('url')
    .get(function() {
        return '/admin/users/~/' + this._id;
    });

module.exports = mongoose.model('Account', Account);