document.getElementById('reload').onclick = reload;

search.oninput = function(e) {
    let term = '';
    let py = pinyin(e.target.value, {style: pinyin.STYLE_NORMAL});
    for (let p of py) {
        term += p[0].toLowerCase().replace(/[^a-z0-9]/g, '');
    }
    for (let song of songlist.childNodes) {
        if (song.getAttribute('keywords').indexOf(term) > -1)
            song.style.display = 'block';
        else
            song.style.display = 'none';
    }
}

path.value = 'file:///' + app.html.replace(/\\/g,'/');
path.onfocus = () => path.setSelectionRange(0, path.value.length);

addSong({id: '_filter',title: '',lyrics: ''}, playlist);
fs.readFile(app.playlist, function(err, data) {
    if (!err) {
        let list = JSON.parse(data);
        for (let i of list) {
            let item = JSON.parse(i);
            if (item.id != '_filter')
                addSong(JSON.parse(i), playlist);
        }
    }
    reload();
});

new Sortable(songlist, {
    group: {
        name: 'shared',
        pull: 'clone',
        put: false
    },
    sort: false,
    draggable: '.option',
    onChoose: showBin,
    onUnchoose: hideBin,
    onClone: e => e.clone.classList.remove('selected'),
    onChange: e => bin.parentNode.style.opacity = 0.5,
    animation: 150
});
new Sortable(playlist, {
    group: 'shared',
    draggable: '.option',
    filter: '.filter',
    onChoose: showBin,
    onUnchoose: hideBin,
    onSort: savePlaylist,
    onChange: e => bin.parentNode.style.opacity = 0.5,
    animation: 150
});
new Sortable(bin, {
    group: 'shared',
    draggable: '.option',
    onChange: e => bin.parentNode.style.opacity = 1,
    onAdd: e => e.item.remove()
});

function showBin(e) {
    bin.parentNode.style.zIndex = 100;
    bin.parentNode.style.opacity = 0.5;
}

function hideBin(e) {
    bin.parentNode.style.opacity = 0;
    bin.parentNode.style.zIndex = -100;
}

function savePlaylist() {
    let list = [];
    for (let i of playlist.childNodes)
        list.push(i.getAttribute('value'));
    fs.writeFile(app.playlist,JSON.stringify(list),()=>{});
}

async function reload() {
    let songs = await getLyrics()
    .then(x => {
        login.style.display = 'none';
        fs.writeFile(app.token, token, ()=>{});
        return x;
    })
    .catch(() => {
        login.style.display = 'flex';
        password.focus();
        return [];
    });
    songlist.innerHTML = '';
    for (let song of songs) {
        let item = addSong(song, songlist);
        for (let i of playlist.childNodes) {
            if (i.getAttribute('songId') == song.id)
                playlist.replaceChild(item.cloneNode(true), i);
        }
    }
    pTitle.innerHTML = '';
    pLyrics.innerHTML = '';
    live.innerHTML = '';
    search.value = '';
}

function addSong(song, list) {
    let item = document.createElement('div');
    let title = document.createElement('div');
    let lyrics = document.createElement('div');

    if (song.id == '_filter')
        item.className = 'filter song preview';
    else
        item.className = 'song option preview';
    item.setAttribute('keywords', song.keywords);
    item.setAttribute('songId', song.id);
    item.setAttribute('value', JSON.stringify(song));

    title.className = 'title';
    title.innerHTML = escapeHtml(song.title);
    lyrics.className = 'lyrics';
    lyrics.innerHTML = escapeHtml(song.lyrics).replace('\n', ' ');

    item.appendChild(title);
    item.appendChild(lyrics);
    list.appendChild(item);
    return item;
}

function getLyrics() {
    let xhr = new XMLHttpRequest();
    let url = 'https://elimfgcc.org/lyrics/';
    let method = 'GET';
    xhr.open(method, url, true);
    xhr.setRequestHeader('Auth', token);
    xhr.responseType = 'json';
    return new Promise((resolve, reject) => {
        xhr.onreadystatechange = function () {
            if(xhr.readyState === XMLHttpRequest.DONE) {
                if (xhr.status === 200) {
                    resolve(xhr.response);
                } else {
                    reject();
                }
            }
        }
        xhr.send();
    });
}

function escapeHtml(text) {
    return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}