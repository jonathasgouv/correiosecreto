const colorshexa = {
  'grey': '484848',
  'blue': '1965a9',
  'red': 'c52208c4',
  'green': '00ad35c4',
  'yellow': 'ffbf09d1'
};

page = 1;

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
    var contentPlacement = $('#header').position().top + $('#header').height() + 20;
    $('#recados').css('margin-top',contentPlacement);
}

$(document).ready(adjustSize());

window.onresize = adjustSize;

function truncate(str, n) {
	return str.length > n ? str.substr(0, n - 1) + '&hellip;' : str;
}

async function GenerateHTML() {
  if (page == 1) {
    recadosdata = await GetData();
  }

  recados = recadosdata.slice(page * 15 - 15, page * 15);

  if (recados.length < 15) {
    window.onscroll = undefined;
  }

  html = '';

  for (recado of recados) {
    html += `<li>
      <div class="card text-white bg-secondary mb-3 truncate" style="background-color: #${recado.color} !important;" data-id="${recado._id}" onClick="goToMessagePage(this)">
  <div class="card-header">${recado.name}</div>
  <div class="card-body">
    <p class="card-text">${truncate(recado.message.replace('\n','<br>'), 250)}</p>
  </div>
</div>
    </li>`
  }

  document.getElementById('recadoslist').innerHTML += html;
  page ++;
}

async function GetData() {
  query = getParams(document.location.href).query
  document.getElementById('Search').value = query;

  window.history.pushState("", "", `/search/${query}`);

  if (!query) {
    document.location = '/'
  }

  data = await fetch(`/api/search?name=${query}`)
  data = await data.json()

  return data
}

function goToMessagePage(recado) {
  document.location.href = `/recados/${recado.dataset.id}`;
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

function characterCounter(inputelement) {
  remainingCharacters = 350 - inputelement.value.length

  document.getElementById('counter').innerText = `${remainingCharacters} caracteres restantes`
}

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