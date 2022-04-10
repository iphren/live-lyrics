window.oncontextmenu = function (e) {
    if (!app.isPackaged) {
        remote.getCurrentWindow().inspectElement(e.x, e.y);
    }
}

window.onmousedown = function () {
    plURL.classList.add('none');
    closeInfo();
    changeFocus();
}

window.onmouseup = function() {
    startSizing = false;
}

send.onmousedown = function(e) {
    e.stopPropagation();
}

for (let list of document.getElementsByClassName('select')) {
    list.ondblclick = play;
    list.onmousedown = select;
}

search.onmousedown = function(e) {
    e.stopPropagation();
    hideUp.classList.contains('active') && toggleHide();
}

clear.onmousedown = function(e) {
    if (!clear.classList.contains('disabled')) clearSearch(e);
}

function clearSearch(e = null) {
    if (e) {
        e.stopPropagation();
        e.preventDefault();
    }
    search.value = '';
    for (let song of songlist.childNodes) {
        song.classList.add('result');
    }
    notFound.classList.add('none');
    search.focus();
}

reloadBtn.onmousedown = function(e) {
    if (!reloadBtn.classList.contains('disabled')) reload(e);
}

slidesBtn.onmousedown = toggleSlides;

slidesFolder.onmousedown = function(e) {
    const folders = dialog.showOpenDialogSync({
        properties: ['openDirectory']
    });
    if (!folders) return;
    app.save('slidesFolder', folders[0]);
    if (slidesFolderWatcher) slidesFolderWatcher.close();
    getPictures(folders[0]);
}

slidesPrevPage.onmouseup = function(e) {
    e.stopPropagation();
    e.preventDefault();
    goToPage(slidesPage - 1);
}

slidesNextPage.onmouseup = function(e) {
    e.stopPropagation();
    e.preventDefault();
    goToPage(slidesPage + 1);
}

styleBtn.onmousedown = function(e) {
    let n = styleBtn.innerHTML.match(/[0-9]+/);
    if (!n) return;
    n = (+n[0] + 1) % totalStyles;
    styleBtn.innerHTML = `Style ${n}`;
    ipcRenderer.send('lineStyle', n);
}

sizeBtn.onmousedown = function(e) {
    startSizing = true;
    lineSizing(e);
}

sizeBtn.onmousemove = lineSizing;

function lineSizing(e) {
    if (startSizing) {
        let frac = +e.offsetX / sizeBtn.clientWidth;
        frac = Math.min(1, frac);
        frac = Math.max(0, frac);
        sizeBtnBg.style.width = `${frac * 100}%`;
        ipcRenderer.send('lineSize', frac);
    }
}

clearBtn.onmousedown = function(e) {
    if (!currentLyrics) return update([]);
    let evt = {
        key: 'Backspace',
        preventDefault:function(){}
    };
    keyControl(evt);
}

infoBtn.onmousedown = function(e) {
    changeLyrics();
    currentInfo = unescape(infoBtn.getAttribute('data-html'));
    ipcRenderer.send('songInfo', currentInfo);
}

ipcRenderer.send(sizesBtn.innerHTML === 'Fullscreen' ? 'maxShow' : 'minShow');
sizesBtn.onmousedown = function(e) {
    ipcRenderer.send(sizesBtn.innerHTML === 'Fullscreen' ? 'maxShow' : 'minShow');
}

slideBtn.onmousedown = function(e) {
    let evt = {
        key: 'F5',
        preventDefault:function(){}
    };
    keyControl(evt);
}

newBtn.onmousedown = newSong;

hideUp.onmousedown = toggleHide;

function toggleSlides(e) {
    if (slidesBtn.classList.contains('active')) {
        slidesBtn.classList.remove('active');
        slidesSettings.classList.add('none');
        songEditor.classList.remove('none');
        forLive.classList.remove('none');
    } else {
        slidesBtn.classList.add('active');
        slidesSettings.classList.remove('none');
        songEditor.classList.add('none');
        forLive.classList.add('none');
    }
}

function toggleHide(e = null) {
    if (e) {
        e.stopPropagation();
        e.preventDefault();
    }
    closeInfo();
    if (hideUp.classList.contains('disabled')) return;
    let act = hideUp.classList.contains('active');
    if (act)
        hideUp.classList.remove('active');
    else
        hideUp.classList.add('active');
    for (let c of document.getElementsByClassName('container')) {
        if (c.id === 'slidesSettings') continue;
        if (c.nextElementSibling) {
            if (act)
                c.classList.remove('hide');
            else {
                c.classList.add('hide');
                c.classList.remove('focused');
            }
        }
    }
}

sendBtn.onmousedown = sendPlaylist;
receiveBtn.onmousedown = getPlaylist;

liveStats.onmousedown = function(e) {
    e.stopPropagation();
    e.preventDefault();
    ipcRenderer.send('stats');
}

pin.onmousedown = function(e) {
    e.stopPropagation();
    e.preventDefault();
    closeInfo();
    ipcRenderer.send('toggleTop', true);
}

songlist.onmouseover = function(e) {
    songX = e.clientX;
    songY = e.clientY;
}

songlist.onscroll = function(e) {
    clearTimeout(scrollTimer);
    let id = document.elementFromPoint(songX, songY).getAttribute('songId');
    if (id) letter.innerHTML = /^./.exec(id)[0].toUpperCase();
    letter.classList.add('scrolling');
    scrollTimer = setTimeout(() => {
        letter.classList.remove('scrolling');
    }, 1000);
}

editInfo.onmousedown = openInfo;
edit.onmousedown = openEditor;
cancel.onmousedown = closeEditor;
saveBtn.onmousedown = save;

for (let m of document.getElementsByClassName('modal')) {
    m.onmousedown = function(e) {
        e.stopPropagation();
        if (!e.target.classList.contains('modal')) return;
        e.preventDefault();
        let f = false;
        for (let i of e.target.getElementsByTagName('input')) {
            if (document.activeElement.isSameNode(i)) {
                f = true;
                break;
            }
        }
        if (!f) {
            for (let i of e.target.getElementsByTagName('input')) {
                if (!i.readOnly) {
                    f = true;
                    i.focus();
                    break;
                }
            }
            if (!f) e.target.getElementsByTagName('input')[0].focus();
        }
    }
}

for (let c of document.getElementsByClassName('close')) {
    c.onmousedown = function(e) {
        if (e.target.parentNode.classList.contains('modal')) {
            e.preventDefault();
            e.stopPropagation();
            e.target.parentNode.classList.add('none');
        }
    }
}

askDelete.onmousedown = function(e) {
    e.stopPropagation();
    e.preventDefault();
    typeDelete.focus();
}
cancelDelete.onmousedown = noDelete;

confirmDelete.onmousedown = function(e) {
    e.stopPropagation();
    e.preventDefault();
    if (confirmDelete.classList.contains('disabled') || !confirmDelete.getAttribute('songid')) return;
    onDelete.classList.add('none');
    typeDelete.value = '';
    confirmDelete.classList.add('disabled');
    if (local) {
        localDelete(confirmDelete.getAttribute('songid'))
        .then(() => {
            reload();
        }).catch(e => {
            console.error(e);
        }).finally(() => {
            confirmDelete.setAttribute('songid', '');
        });
    } else {
        post(`https://${address.value}/delete`, {id: confirmDelete.getAttribute('songid'), token: password.value})
        .then(x => {
            if (x.deleted) reload();
        }).catch(xhr => {
            status.value = `Server Response: ${xhr.status} ${xhr.response ? xhr.response.error : 'server not found'}`;
            login.classList.remove('none');
        }).finally(() => {
            confirmDelete.setAttribute('songid', '');
        });
    }
}