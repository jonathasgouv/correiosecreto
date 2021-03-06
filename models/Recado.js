const mongoose = require('../database');

const RecadoSchema = new mongoose.Schema({
  name:  { 
    type: String, 
    require: true 
  },
  nameSearch:  { 
    type: String, 
    require: true,
    lowercase: true,
  },
  message: { 
    type: String, 
    require: true 
  },
  color:   { 
    type: String, 
    default: '484848' 
  },
  date: { 
    type: Date, 
    default: Date.now 
  },
});

const Recado = mongoose.model('Recado', RecadoSchema);

module.exports = Recado;