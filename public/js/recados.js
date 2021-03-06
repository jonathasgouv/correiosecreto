const colorshexa = {
  'grey': '484848',
  'blue': '1965a9',
  'red': 'c52208c4',
  'green': '00ad35c4',
  'yellow': 'ffbf09d1',
  'pink': 'dc0449'
};

recado = {
  'name':'',
  'message':'',
  'color':''
}

var getParams = function (url) {
	var params = {};
	var parser = document.createElement('a');
	parser.href = url;
	var query = parser.search.substring(1);
	var vars = query.split('&');
	for (var i = 0; i < vars.length; i++) {
		var pair = vars[i].split('=');
		params[pair[0]] = decodeURIComponent(pair[1]);
	}
	return params;
};

adjustSize = function() {
    var contentPlacement = $('#headertop').position().top + $('#headertop').height() + 60;
    $('#recadospage').css('margin-top',contentPlacement);
}

$(document).ready(adjustSize());

window.onresize = adjustSize;

$('#message-text').twemojiPicker();

setInterval(function(){ 
  remainingCharacters = 350 - document.getElementById('message-text').value.length
  document.getElementById('counter').innerText = `${remainingCharacters} caracteres restantes`
}, 100);

document.getElementById('save').addEventListener('click', async function() {
  img = await fetch(`/api/render?id=${id}`)
  imgblob = await img.blob()

  blobUrl = URL.createObjectURL(imgblob);
  link = document.createElement("a"); // Or maybe get it from the current document
  link.href = blobUrl;
  link.download = "recado.png";
  document.body.appendChild(link);
  link.click();
}) 


async function GenerateHTML() {
  recados = await GetData();
  recado.name = recados[0].name
  recado.message = recados[0].message
  recado.color = recados[0].color

  html = '';

  for (let i = 0; i < recados.length; i++) {
    html += `
      <div class="card text-white bg-secondary mb-3 truncate" id="recado" style="background-color: #${recados[i].color} !important;">
  <div class="card-header" id="header">${recados[i].name}</div>
  <div class="card-body">
    <p class="card-text" id="message">${recados[i].message.replace('\n','<br>')}</p>
  </div>
</div>
    `
  }

  document.getElementById('recadospage').innerHTML = html;

  twemoji.parse(document.body);
}

async function GetData() {
  id = getParams(document.location.href).id

  window.history.pushState("", "", `/recados/${id}`);

  if (!id) {
    document.location = '/'
  }

  data = await fetch(`/api/searchById?id=${id}`)
  data = await data.json()

  return data
}

document.querySelector('#Search').addEventListener('keypress', function (e) {
  if (e.key === 'Enter') {
    e.preventDefault()
    query = document.getElementById('Search').value

    if (!query) {
      return
    }

    window.location.href = `/search/${query}`
  }
});

document.getElementById('searchBtn').addEventListener('click', function() {
  query = document.getElementById('Search').value

  if (!query) {
      return
  }

  window.location.href = `/search/${query}`
});



function cleanColorChoice() {
  colors = document.getElementsByClassName('dot');

  for (color of colors) {
    color.classList.remove("isselected");
  }
}

function colorChoice(element) {
  cleanColorChoice();
  element.classList.add('isselected');
}

function getSelectedColor() {
  colors = document.getElementsByClassName('dot');

  for (color of colors) {
    if (color.classList.contains('isselected')) {
      return color.classList[1]
    }
  }
}

document.getElementById('message-btn').addEventListener('click', () => {
  name = document.getElementById('recipient-name').value
  text = document.getElementById('message-text').value
  color = colorshexa[getSelectedColor()]

  data = {
    'name': name,
    'message': text,
    'color': color
  };

  fetch("/api/recado", {
    method: "POST",
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });

  document.location.href = '/';
})


GenerateHTML();