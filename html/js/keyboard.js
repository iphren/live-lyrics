search.oninput = function(e) {
    if (e.target.value === 'whosyourdaddy') app.thisWin.webContents.openDevTools();
    else if (e.target.value === 'thereisnospoon') {
        send.style.display = 'inline-block';
        app.save('send',true);
    }
    let term = '';
    let py = pinyin(e.target.value.replace(/行/g,'形'), {style: pinyin.STYLE_NORMAL});
    for (let p of py) {
        term += p[0].toLowerCase().replace(/[^a-z0-9]/g, '');
    }
    let found = false;
    for (let song of songlist.childNodes) {
        if (song.getAttribute('keywords').indexOf(term) > -1) {
            song.classList.add('result');
            found = true;
        } else {
            song.classList.remove('result');
        }       
    }
    notFound.style.visibility = found ? 'hidden' : 'visible';
    if (hideUp.classList.contains('active')) hideUp.click();
}

address.onkeydown = function(e) {
    e.stopPropagation();
    if (e.key === 'Enter')
        password.focus();
}

password.onkeydown = function(e) {
    e.stopPropagation();
    if (e.key === 'Enter') {
        reload();
        password.focus();
    }
}

search.onkeydown = function(e) {
    if (e.key === 'Tab' || (e.ctrlKey && e.key in ctrlKeys)) {
        e.preventDefault();
        search.blur();
        return;
    }
    e.stopPropagation();
    switch (e.key) {
        case 'Enter':
            if (!hideUp.classList.contains('active')) {
                if (songlist.getElementsByClassName('result').length !== 0) {
                    changeFocus(songlist.parentNode);
                    selectSong(getNext(songlist), songlist);
                } else {
                    break;
                }
            } else {
                hideUp.click();
                break;
            }
        case 'Escape':
            search.blur();
            break;
        case 'Backspace':
            if (search.value === '' && !hideUp.classList.contains('active')) {
                hideUp.click();
                search.blur();
            }
            break;
    }
}

plURL.onkeydown = function(e) {
    e.stopPropagation();
    switch (e.key) {
        case 'Enter':
            sendPlaylist();
    }
}

window.onkeydown = function (e) {
    if ((e.ctrlKey && !(e.key in ctrlKeys)) || (e.metaKey && !(e.key in metaKeys))) return;
    hide.focus();
    switch (e.key) {
        case 'Tab':
            e.preventDefault();
            let ind = 0;
            if (focused) {
                for (let i = 0; i < rotation.length; i++) {
                    if (rotation[i].isSameNode(focused)) ind = (i + 1) % rotation.length;
                }
            }
            if (rotation[ind].classList.contains('hide')) ind = (ind + 1) % rotation.length;
            if (rotation[ind].id === 'forSonglist' && songlist.getElementsByClassName('result').length === 0) ind = (ind + 1) % rotation.length;
            if (rotation[ind].id === 'forPlaylist' && playlist.getElementsByClassName('result').length === 0) ind = (ind + 1) % rotation.length;
            if (rotation[ind].id === 'forLive' && live.getElementsByClassName('result').length === 0) ind = (ind + 1) % rotation.length;
            if (rotation[ind].isSameNode(focused)) changeFocus();
            else changeFocus(rotation[ind]);
            break;
        case '/':
            e.preventDefault();
            clear.click();
            break;
        case 'Enter':
            if (selected && focused) {
                if (focused.id === 'forPlaylist' && selectedParent.isSameNode(playlist)) {
                    showLyrics(selected);
                } else if (focused.id === 'forSonglist' && selectedParent.isSameNode(songlist)) {
                    addToPlaylist(selected);
                    selectSong(getPrev(playlist), playlist);
                }
            } else if (!focused && live.innerHTML) {
                changeFocus(live.parentNode);
            }
            break;
        case 'Backspace':
            changeLyrics();
            break;
        case 'Delete':
            if (focused && focused.id === 'forPlaylist' && selectedParent.isSameNode(playlist)) {
                let next = getNext(playlist, selected);
                if (next.isSameNode(selected)) next = getPrev(playlist, selected);
                if (next.isSameNode(selected)) next = null;
                if (selected.isSameNode(currentPlaying)) showLyrics();
                selected.remove();
                selectSong(next, playlist);
                if (!selected) changeFocus();
                savePlaylist();
            }
            break;
        case 'Escape':
            selectSong();
            showLyrics();
            changeFocus();
            break;
        case 'ArrowDown':
            if (focused) {
                if (focused.id === 'forLive') {
                    if (currentPlaying) changeLyrics(getNext(live, currentPlayingLyrics));
                } else if (focused.id === 'forSonglist') {
                    selectSong(getNext(songlist, selected), songlist);
                } else if (focused.id === 'forPlaylist') {
                    selectSong(getNext(playlist, selected), playlist);
                }
            }
            break;
        case 'ArrowUp':
            if (focused) {
                if (focused.id === 'forLive') {
                    if (currentPlaying) changeLyrics(getPrev(live, currentPlayingLyrics));
                } else if (focused.id === 'forSonglist') {
                    selectSong(getPrev(songlist, selected), songlist);
                } else if (focused.id === 'forPlaylist') {
                    selectSong(getPrev(playlist, selected), playlist);
                }
            }
            break;
        case 'ArrowRight':
        case 'PageDown':
            showLyrics(getNext(playlist, currentPlaying));
            break;
        case 'ArrowLeft':
        case 'PageUp':
            showLyrics(getPrev(playlist, currentPlaying));
            break;
        case 'F5':
            reload();
            break;
        default:
            if (e.ctrlKey) {
                if (e.key.toLowerCase() === 'r') {
                    reload();
                    break;
                } else if (e.key.toLowerCase() === 'h') {
                    hideUp.click();
                    break;
                } else if (e.key.toLowerCase() === 's' && app.configs.send) {
                    sendBtn.click();
                    break;
                }
            }
            let item = document.getElementById(`live-${e.key.toUpperCase()}`);
            if (item) {
                changeLyrics(item);
            }
    }
}