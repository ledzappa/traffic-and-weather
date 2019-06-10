const Http = new XMLHttpRequest();
const apiKey = "apikeyhere";
let numberOfRequests = 0;
let timerSet = false;
let interval = null;
const url =
  "http://api.sl.se/api2/realtimedeparturesV4.json?key=" +
  apiKey +
  "&siteid=1860&timewindow=60";
start();

function sendRequest() {
  document.getElementById("content").innerHTML = "Laddar ...";
  Http.open("GET", url);
  Http.send();
  numberOfRequests++;
}

function getHours() {
  const d = new Date();
  return d.getHours();
}

function start() {
  sendRequest();

  if (!interval) {
    interval = setInterval(function() {
      sendRequest();
    }, 10000);
  }

  if (!timerSet) {
    timerSet = true;
    setTimeout(() => {
      clearInterval(interval);
      timerSet = false;
      interval = null;
      document.getElementById("content").innerHTML = "<h1>Uppdatera</h1>";
    }, 60000 * 10);
  }
}

Http.onreadystatechange = e => {
  if (e.currentTarget.readyState == 4) {
    let response = JSON.parse(Http.responseText);
    let buses = response.ResponseData.Buses;

    gullmars = buses.filter(obj => obj.Destination === "Gullmarsplan");
    alvsjo = buses.filter(obj => obj.Destination !== "Gullmarsplan");

    document.getElementById("content").innerHTML =
      "<h2>Gullmarsplan</h2><h1>" +
      gullmars[0].DisplayTime +
      "</h1>" +
      gullmars[1].DisplayTime +
      "<br>" +
      gullmars[2].DisplayTime +
      "<br>" +
      "<h2>Älvsjö</h2><h1>" +
      alvsjo[0].DisplayTime +
      "</h1>" +
      alvsjo[1].DisplayTime +
      "<br>" +
      alvsjo[2].DisplayTime +
      "<br>";
  }
};
