document.addEventListener("DOMContentLoaded", function (event) {
    document.body.style.display = "block";
    var scrollpos = localStorage.getItem("scrollpos");
    if (scrollpos)
        document
            .getElementById("contentbox")
            .scrollTo(0, scrollpos);
});

window.onbeforeunload = function (e) {
    localStorage.setItem(
        "scrollpos",
        document.getElementById("contentbox").scrollTop
    );
};

function inIframe () {
    try {
        return window.self !== window.top;
    } catch (e) {
        return true;
    }
}

function utstds(timestamp) {
    // Multiply by 1000 because JavaScript works in milliseconds
    const date = new Date(timestamp * 1000);
    // Use Date methods to get the desired parts of the date
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-indexed
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");

    // Construct the date string in the desired format
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
    document.cookie =
        name + "=" + (value || "") + expires + "; path=/";
}
function getCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(";");
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == " ") c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0)
            return c.substring(nameEQ.length, c.length);
    }
    return null;
}
function eraseCookie(name) {
    document.cookie =
        name + "=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;";
}

function loadSite(json) {
    document.getElementById("xtotal").innerText = json.data.total;

    document.getElementById("xtimestamp").innerText =
        utstds(json.data.cache / 1000) + " UTC";

    var cutoffs = json.data.cutoffs;
    var counts = json.data.counts;

    for (var i = 0; i < Object.keys(cutoffs).length; i++) {
        cutoffText = document.getElementById(
            "rank-" + Object.keys(cutoffs)[i]
        );
        cutoffText.innerHTML = Math.round(
            cutoffs[Object.keys(cutoffs)[i]]
        );
    }

    for (var i = 0; i < Object.keys(counts).length; i++) {
        countText = document.getElementById(
            "rcount-" + Object.keys(counts)[i]
        );
        countText.innerHTML =
            counts[Object.keys(counts)[i]] + " PLAYERS";
    }

    document.getElementById("un-per").innerText =
        Math.round((counts["z"] / json.data.total) * 100000000) /
        1000000;

    var overlay = document.getElementById("overlay");
    overlay.classList.add("active");

    // Optionally, you can remove the overlay from the DOM after the animation finishes
    setTimeout(function () {
        overlay.style.display = "none";
    }, 500);
}

predata = getCookie("preload");

if (predata != null) {
    console.log("Loading from local cache...");
    loadSite(JSON.parse(predata));
} else {
    overlay.style.display = "block";
    console.log("Loading from API...");
    fetch("https://klay.lol:8387/fetch", {
        method: "GET",
    })
        .then(function (response) {
            return response.json();
        })
        .then(function (json) {
            if (json.status == "error") {
                console.log("API error: " + json.message);
                document.getElementById("loadertext").innerText =
                    "Failed to load the page.";
                return;
            }
            if (inIframe()) {
                console.log("This page cannot be loaded in an iframe.");
                document.getElementById("loadertext").innerText =
                    "Failed to load the page.";
            }
            setCookie("preload", JSON.stringify(json), 1);
            loadSite(json);
        });
}