const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODBURL, {useNewUrlParser: true});
mongoose.Promise = global.Promise;

module.exports = mongoose;
