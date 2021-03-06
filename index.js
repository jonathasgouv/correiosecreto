const express = require('express');
const bodyParser = require('body-parser');
const Recado = require('./models/Recado');
const { createCanvas, registerFont} = require('canvas')


function getLines(ctx, text, maxWidth) {
    var words = text.split(" ");
    var lines = [];
    var currentLine = words[0];

    for (var i = 1; i < words.length; i++) {
        var word = words[i];
        var width = ctx.measureText(currentLine + " " + word).width;
        if (width < maxWidth) {
            currentLine += " " + word;
        } else {
            lines.push(currentLine);
            currentLine = word;
        }
    }
    lines.push(currentLine);
    return lines;
}


const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile('public/index.html');
});

app.get('/recados/:id', (req, res) => {
  id = req.params.id
  res.redirect(`../recados.html?id=${id}`);
});

app.get('/search/:query', (req, res) => {
  query = req.params.query
  if (!query || query == '') {
    res.redirect('/');
  }
  res.redirect(`../search.html?query=${query}`);
});

app.get('/api/getRecados', async (req, res) => {
    try {
      const Recados = await Recado.find({})
      
      return res.json(Recados.reverse())
    } catch(err) {
      return res.status(500).send({error: 'Internal server error'});
    }
  }
)

app.get('/api/search', async (req, res) => {
    try {
      let name = req.query.name.normalize('NFKD')

      if (!name) {
        return res.status(400).send({error: 'Missing search string'})
      }

      const Recados = await Recado.find({'nameSearch': new RegExp(name, 'i')});

      return res.json(Recados.reverse())
    } catch(err) {
      return res.status(500).send({error: 'Internal server error'})
    }
  }
)

app.get('/api/searchById', async (req, res) => {
    try {
      let id = req.query.id

      if (!id) {
        return res.status(400).send({error: 'Missing search string'})
      }

      const Recados = await Recado.find({'_id': id});

      return res.json(Recados)
    } catch(err) {
      return res.status(500).send({error: 'Internal server error'})
    }
  }
)


app.get(`/api/render`, async function(req, res) {
  let id = req.query.id

  if (!id) {
    return res.status(400).send({error: 'Missing search string'})
  }

  const Recados = await Recado.find({'_id': id});
  
  line = 0
  const name = Recados[0].name
  const message = Recados[0].message
  const color = Recados[0].color
  
  const width = 1050
  const height = 1100

  const canvas = createCanvas(width, height)
  const context = canvas.getContext('2d')

  registerFont('./fonts/Montserrat-Bold.otf', { family: 'Montserrat' })

  context.fillStyle = `#${color}`
  context.fillRect(0, 0, width, height)

  context.font = 'bold 50pt Montserrat'
  context.textAlign = 'left'
  context.textBaseline = 'top'
  context.fillStyle = '#0000001f'

  const text = name

  context.fillRect(0, 0, width, 180)
  context.fillStyle = '#fff'
  context.fillText(text, 35, 50)

  registerFont('./fonts/Montserrat-Regular.otf', { family: 'MontserratRegular' })

  for (lines of getLines(context, message, 1720)) {
    context.fillStyle = '#fff'
    context.font = 'regular 30pt MontserratRegular'
    context.fillText(lines, 35, 250 + 40*line)
    line++;
  }

  const buffer = canvas.toBuffer('image/png')

  res.writeHead(200, { 'Content-Type': 'image/png' });
  res.end(buffer, 'binary');
});

app.post('/api/recado', async (req, res) => {
    try {
     req.body.nameSearch = req.body.name.normalize('NFKD')

     if (req.body.name.length > 21 || req.body.message.length > 350) {
      return res.status(400).send({error: 'Name or message has more characters than the allowed'})
     }

     const recado = await Recado.create(req.body);

     if (!recado) {
       return res.status(400).send({error: 'Missing parameters. Registration failed'})
     }

     return res.send({recado});
    } catch(err) {
      console.log(err)
      return res.status(400).send({error: 'Registration failed'})
    }
  }
)

app.get('*', function(req, res){
  res.redirect('/');
});

app.listen(process.env.PORT || 3000, () => console.log('server started'));