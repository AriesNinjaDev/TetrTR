document.addEventListener("DOMContentLoaded", function (event) {
    document.body.style.display = "block";
    var scrollpos = localStorage.getItem("scrollpos");
    if (scrollpos) document.getElementById("contentbox").scrollTo(0, scrollpos);
});

window.onbeforeunload = function (e) {
    localStorage.setItem(
        "scrollpos",
        document.getElementById("contentbox").scrollTop
    );
};

function inIframe() {
    try {
        return window.self !== window.top;
    } catch (e) {
        return true;
    }
}

function urlFriendlyPM(str) {
    return str.replace(/\+/g, 'p').replace(/-/g, 'm');
}

function utstds(timestamp) {
    const date = new Date(timestamp * 1000);
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const day = String(date.getUTCDate()).padStart(2, "0");
    const hours = String(date.getUTCHours()).padStart(2, "0");
    const minutes = String(date.getUTCMinutes()).padStart(2, "0");
    const seconds = String(date.getUTCSeconds()).padStart(2, "0");

    const dateString = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

    return dateString;
}

function setCookie(name, value, hrs) {
    var expires = "";
    if (hrs) {
        var date = new Date();
        date.setTime(date.getTime() + hrs * 60 * 60 * 1000);
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/";
}
function getCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(";");
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == " ") c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}
function eraseCookie(name) {
    document.cookie =
        name + "=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;";
}

function loadSiteUser(json) {
    
    document.getElementById("player-name").innerText = json.user.username;
    document.getElementById("player-tr").innerText = Math.round(json.user.league.rating);
    document.getElementById("player-perc").innerText = "(top "+Math.round((json.user.league.standing/json.data.total)*1000)/10+"% of players)";
    document.getElementById("player-rank-icon").src = "assets/icons/"+urlFriendlyPM(json.user.league.rank)+".png";

    document.getElementById("player-content").style.display = "block";
    
    loadSite(json);
}

function loadSite(json) {
    document.getElementById("xtotal").innerText = json.data.total;

    document.getElementById("xtimestamp").innerText =
        utstds(json.data.cache / 1000) + " utc";

    var cutoffs = json.data.cutoffs;
    var counts = json.data.counts;

    for (var i = 0; i < Object.keys(cutoffs).length; i++) {
        if (Object.keys(cutoffs)[i] === "z") {
            continue;
        }
        cutoffText = document.getElementById("rank-" + Object.keys(cutoffs)[i]);
        cutoffText.innerHTML = Math.round(cutoffs[Object.keys(cutoffs)[i]]);
        cutoffText.title = cutoffs[Object.keys(cutoffs)[i]] + " TR";
    }

    for (var i = 0; i < Object.keys(counts).length; i++) {
        if (Object.keys(cutoffs)[i] === "z") {
            continue;
        }
        countText = document.getElementById("rcount-" + Object.keys(counts)[i]);
        countText.innerHTML = counts[Object.keys(counts)[i]] + " PLAYERS";
    }

    let unranked = json.general.usercount - json.general.anoncount - json.general.rankedcount;

    document.getElementById("rcount-z").innerText = unranked + " PLAYERS";

    document.getElementById("un-per").innerText =
        Math.round((unranked / (json.general.usercount - json.general.anoncount)) * 10000) / 100;

    document.getElementById("un-per").title =
        unranked / (json.general.usercount - json.general.anoncount)*100 + "%";

    var overlay = document.getElementById("overlay");
    overlay.classList.add("active");

    setTimeout(function () {
        overlay.style.display = "none";
    }, 500);
}

predata = getCookie("preload");

const url = new URL(window.location.href);
const userParam = url.searchParams.get("user");

if (userParam) {
    overlay.style.display = "block";
    console.log("Loading from API for user "+userParam+"...");
    fetch("https://klay.aries.ninja:8387/fetch/"+userParam, {
        method: "GET",
    })
        .then(function (response) {
            return response.json();
        })
        .then(function (json) {
            if (json.status == "error") {
                console.log("API error: " + json.message);
                document.getElementById("loadertext").innerText =
                    "failed to load the page.";
                return;
            }
            if (inIframe()) {
                console.log("This page cannot be loaded in an iframe.");
                document.getElementById("loadertext").innerText =
                    "failed to load the page.";
                return;
            }
            setCookie("preload", JSON.stringify(json), 1);
            loadSiteUser(json);
        });
} else if (predata != null) {
    console.log("Loading from local cache...");
    loadSite(JSON.parse(predata));
} else {
    overlay.style.display = "block";
    console.log("Loading from API...");
    fetch("https://klay.aries.ninja:8387/fetch", {
        method: "GET",
    })
        .then(function (response) {
            return response.json();
        })
        .then(function (json) {
            if (json.status == "error") {
                console.log("API error: " + json.message);
                document.getElementById("loadertext").innerText =
                    "failed to load the page.";
                return;
            }
            if (inIframe()) {
                console.log("This page cannot be loaded in an iframe.");
                document.getElementById("loadertext").innerText =
                    "failed to load the page.";
                return;
            }
            setCookie("preload", JSON.stringify(json), 1);
            loadSite(json);
        });
}
