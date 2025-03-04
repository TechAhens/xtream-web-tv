let updateEPG;
const categories = document.getElementById("categories");
const player = document.getElementById("player");
const categoriesClasses = ["col-md-2", "col-md-3", "col-md-4"];
const playerClasses = ["col-md-8", "col-md-7", "col-md-6"];
const liveToast = document.getElementById('liveToast')
const toast = bootstrap.Toast.getOrCreateInstance(liveToast)
window.addEventListener("DOMContentLoaded", loadClassesFromStorage);
window.addEventListener("DOMContentLoaded", loadSettingsFromStorage);

document.querySelectorAll('.dropdown-item.no-close').forEach(item => {
    item.addEventListener('click', function (event) {
        event.stopPropagation(); // Verhindert das Schließen des Dropdowns
    });
});

// Event Listener für das Klicken auf einen Kanal
document.querySelectorAll('.channel-item').forEach(function (item) {
    item.addEventListener('click', function () {
        var epg_url = item.getAttribute('epg-url');
        clearTimeout(updateEPG);
        fetchEPGData(epg_url);
        document.getElementById("channelName").innerHTML = item.getAttribute('channel-name');
        var videoUrl = item.getAttribute('data-url');
        var video = document.getElementById('videoPlayer');
        var hls = new Hls();
        hls.loadSource(videoUrl);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, function () {
            video.play();
        });
    });
});

window.onload = function () {
    document.getElementById('searchinput').focus()
};

function searchChannels(search) {
    let searchTerms = search.toLowerCase().trim().split(/\s+/);
    document.querySelectorAll('.channel-item').forEach(item => {
        channelText = item.textContent.toLowerCase().trim();
        matches = searchTerms.every(term => channelText.includes(term));
        if (!matches) {
            item.style.display = 'none';
        } else {
            item.style.display = '';
        }
    });
    document.querySelectorAll('.accordion-item').forEach(item => {
        hide = true;
        item.childNodes[3].childNodes[1].childNodes[1].childNodes.forEach(channel => {
            if (channel instanceof Element) {
                if (getComputedStyle(channel).display == "block") {
                    hide = false;
                }
            }
        });
        if (hide) {
            item.style.display = 'none';
        } else {
            item.style.display = '';
        }
    });
    if (search.length == 1) {
        openAllCollapses();
    }
}

function clearSearchInput() {
    document.getElementById('searchinput').value = '';
    searchChannels('');
    closeAllCollapses();
}

function openAllCollapses() {
    document.querySelectorAll('.collapse').forEach(collapse => {
        let bsCollapse = new bootstrap.Collapse(collapse, { toggle: false });
        bsCollapse.show();
    });
}

function closeAllCollapses() {
    document.querySelectorAll('.collapse.show').forEach(collapse => {
        let bsCollapse = new bootstrap.Collapse(collapse, { toggle: false });
        bsCollapse.hide();
    });
}

function toggleAllCollapses() {
    document.querySelectorAll('.collapse').forEach(collapse => {
        let bsCollapse = new bootstrap.Collapse(collapse, { toggle: false });
        collapse.classList.contains('show') ? bsCollapse.hide() : bsCollapse.show();
    });
}

function togglePicons() {
    document.querySelectorAll('.picon').forEach(picon => {
        picon.classList.toggle("d-none");
        picon.classList.toggle("d-block");
    });
    document.querySelectorAll('.channel-item').forEach(channel_item => {
        channel_item.classList.toggle("py-1");
        channel_item.classList.toggle("py-0");
    });


    if (document.getElementById('piconsCheck').checked) {
        showPicons = "1";
    } else {
        showPicons = "0";
    }
    localStorage.setItem('showPicons', showPicons);
}

function toggleSidebar() {
    if (categories && player) {
        let currentCategoriesClass = categories.classList[0];
        let currentPlayerClass = player.classList[0];
        let currentCategoriesIndex = categoriesClasses.indexOf(currentCategoriesClass);
        let currentPlayerIndex = playerClasses.indexOf(currentPlayerClass);
        let nextCategoriesIndex = (currentCategoriesIndex + 1) % categoriesClasses.length;
        let nextPlayerIndex = (currentPlayerIndex + 1) % playerClasses.length;
        categories.classList.replace(currentCategoriesClass, categoriesClasses[nextCategoriesIndex]);
        player.classList.replace(currentPlayerClass, playerClasses[nextPlayerIndex]);
        localStorage.setItem('categoriesClass', categoriesClasses[nextCategoriesIndex]);
        localStorage.setItem('playerClass', playerClasses[nextPlayerIndex]);
    }
}

function loadClassesFromStorage() {
    let savedCategoriesClass = localStorage.getItem('categoriesClass');
    let savedPlayerClass = localStorage.getItem('playerClass');
    categories.style.transition = "none"
    player.style.transition = "none"
    if (savedPlayerClass && savedCategoriesClass) {
        categories.classList.replace("col-md-3", savedCategoriesClass);
        player.classList.replace("col-md-7", savedPlayerClass);
    }
    categories.offsetWidth;  // Trigger Reflow (wichtig für Neustart der Transition)
    player.offsetWidth;
    categories.style.transition = ""
    player.style.transition = ""
}

function loadSettingsFromStorage() {
    let showPicons = localStorage.getItem('showPicons');
    if (showPicons != null && showPicons == 0) {
        togglePicons();
        document.getElementById('piconsCheck').checked = false;
    }
}

function decodeBase64(str) {
    //return atob(str);
    return decodeURIComponent(escape(window.atob(str)));
}

function formatTime(dateTimeString) {
    const date = new Date(dateTimeString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function differenzInMinuten(datum1, datum2) {
    const differenzMs = Math.abs(new Date(datum1) - new Date(datum2)); // Differenz in Millisekunden
    return Math.floor(differenzMs / (1000 * 60)); // Umwandlung in Minuten
}

function populateEPGList(epgData) {
    const epgList = document.getElementById("epgList");
    epgList.innerHTML = "";
    epgData.epg_listings.forEach(program => {
        const listItem = document.createElement("li");
        listItem.classList.add("list-group-item");
        /*listItem.innerHTML =
        `<strong>${formatTime(program.start)} - ${formatTime(program.end)}</strong><br>
        <a tabindex='0' role='button' class='epg_title text-decoration-none text-muted' data-bs-placement='left' data-bs-toggle='popover' data-bs-trigger='focus' data-bs-title='Info' data-bs-content='${decodeBase64(program.description)}'>${decodeBase64(program.title)}</a>`;
        */
        listItem.innerHTML = `<strong>${formatTime(program.start)} - ${formatTime(program.end)}</strong><br>`
        if (program.description != '') {
            listItem.innerHTML += `<details class='text-muted'><summary>${decodeBase64(program.title)}</summary><p>${decodeBase64(program.description)}</p></details>`;
        } else {
            listItem.innerHTML += `<div class='text-muted'>${decodeBase64(program.title)}</div>`;
        }
        if (program == epgData.epg_listings[0]) {
            programmLength = differenzInMinuten(program.end, program.start);
            programProgress = (differenzInMinuten(Date.now(), program.start) * 100) / programmLength;
            listItem.innerHTML += `<div class="progress" role="progressbar" aria-label="Basic example" aria-valuenow="0" aria-valuemin="0" aria-valuemax='${programmLength}'>
                    <div class="progress-bar bg-secondary" style="width: ${programProgress}%"></div>
                 </div>`;
        }
        listItem.classList.add('w-100');
        epgList.appendChild(listItem);
    });
    /*
    tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
    tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl))
    const popoverTriggerList = document.querySelectorAll('[data-bs-toggle="popover"]')
    const popoverList = [...popoverTriggerList].map(popoverTriggerEl => new bootstrap.Popover(popoverTriggerEl))
    */
}

function fetchEPGData(epgUrl) {
    console.log("updating epg data...");
    var now = new Date();
    var delay = (60 - now.getSeconds()) * 1000;
    updateEPG = setTimeout(function () {
        fetchEPGData(epgUrl);
    }, delay);
    fetch(epgUrl)
        .then(response => response.json())
        .then(data => populateEPGList(data))
        .catch(error => console.error("Fehler beim Laden der EPG-Daten:", error));

}

function updateChannelsManually() {
    document.getElementById("updateMenuItem").classList.add("disabled")
    newToast("<div class='spinner-border text-muted d-block mb-1' role='status'>\
            <span class='visually-hidden'>Loading...</span>\
            </div>\
            Updating stream-database in the background.\
            <br>Page will reload when update is finished.");
    fetch('/update')
        .then(response => response.json()) // JSON-Antwort abrufen
        .then(data => {
            if (data.success) {
                console.log("Successfully updated database...");
                location.reload(); // Seite neu laden
            } else {
                console.error("Error updating database: ", data.error);
                newToast("Error updating database.");
            }
        })
        .catch(error => newToast('Error updating database: ' + error));

}

function newToast(message) {
    document.getElementById("toastMessage").innerHTML = (message);
    toast.show();
}