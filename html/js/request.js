function post(url, data) {
    let xhr = new XMLHttpRequest();
    xhr.open('POST', url, true);
    xhr.responseType = 'json';
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    return new Promise((resolve, reject) => {
        xhr.onreadystatechange = function () {
            if (xhr.readyState === XMLHttpRequest.DONE) {
                if (xhr.status === 200) {
                    resolve(xhr.response);
                } else {
                    reject(xhr);
                }
            }
        }
        xhr.send(JSON.stringify(data));
    });
}

function get(options) {
    let xhr = new XMLHttpRequest();
    xhr.open('GET', options.url, true);
    xhr.responseType = 'text';
    for (let h in options.headers) {
        xhr.setRequestHeader(h, options.headers[h]);
    }
    return new Promise((resolve, reject) => {
        xhr.onreadystatechange = function () {
            if (xhr.readyState === XMLHttpRequest.DONE) {
                if (xhr.status === 200) {
                    resolve(xhr.response);
                } else {
                    reject(xhr);
                }
            }
        }
        xhr.send();
    });
}

function sendPlaylist(e = null) {
    if (e) e.preventDefault();
    closeInfo();
    if (!app.configs.plURL && !plURL.value) {
        plURL.classList.remove('none');
        plURL.focus();
        return;
    }
    let pl = [];
    for (let o of playlist.getElementsByClassName('result')) {
        let v = o.getAttribute('value');
        if (v) pl.push(JSON.parse(v));
    }
    post(`https://${plURL.value}`, { playlist: pl, token: password.value })
        .then(() => {
            app.save('plURL', plURL.value);
            plURL.classList.add('none');
            sendBtn.classList.add('success');
            setTimeout(function () {
                sendBtn.classList.remove('success');
            }, 1000);
        }).catch(() => {
            plURL.classList.remove('none');
        });
}

function getPlaylist(e = null) {
    if (e) e.preventDefault();
    closeInfo();
    if (!app.configs.plURL && !plURL.value) {
        plURL.classList.remove('none');
        plURL.focus();
        return;
    }

    get({ url: `https://${plURL.value}` })
        .then((pl) => {
            playlist.innerHTML = '';
            addSong({ id: '_filter', title: '', lyrics: '' }, playlist);
            for (let s of JSON.parse(pl)) {
                addSong(s, playlist);
            }
            savePlaylist();
            showLyrics();
            changeFocus();
            selectSong();
            app.save('plURL', plURL.value);
            plURL.classList.add('none');
        }).catch(() => {
            plURL.classList.remove('none');
        });
}