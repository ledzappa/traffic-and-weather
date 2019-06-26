let numberOfRequests = 0;
let timerSet = false;
let interval = null;
let temp = 0;
const trafficUrl =
  "http://api.sl.se/api2/realtimedeparturesV4.json?key=" +
  apiKeys.sl +
  "&siteid=1860&timewindow=60";
const temperatureUrl =
  "https://api.weather.com/v2/turbo/vt1observation?apiKey=" +
  apiKeys.weather +
  "&format=json&geocode=59.33%2C18.07&language=en-US&units=m";
const Http = new XMLHttpRequest();
const Http2 = new XMLHttpRequest();
start();

function getSLinfo() {
  this.getTime();
  // document.querySelector(".content").innerHTML = "Laddar ...";
  Http.open("GET", trafficUrl);
  Http.send();
  numberOfRequests++;
}

function getTemp() {
  document.getElementById("temp").innerHTML = "Laddar ...";
  Http2.open("GET", temperatureUrl);
  Http2.send();
  numberOfRequests++;
}

function getHours() {
  const d = new Date();
  return d.getHours();
}

function start() {
  getSLinfo();
  getTemp();
  getTime();
  isItFriday();

  if (!interval) {
    interval = setInterval(function() {
      getSLinfo();
      getTime();
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

function getTime() {
  const d = new Date();
  document.getElementById("last-update").innerHTML =
    "Uppdaterad: " + d.toLocaleTimeString();
}

function isItFriday() {
  let d = new Date();
  let text = "";
  if (d.getDay() === 5) {
    text = (temp > 15 ? "OCH" : "MEN") + " DET ÄR FREDAG! :D :D :D";
  } else {
    text = "Det är inte fredag :(";
  }
  document.getElementById("friday").innerHTML = text;
  console.log(d.getDay());
}

function getTrafficTimes(array) {
  let output = "";
  for (let [index, item] of array.entries()) {
    output +=
      index === 0
        ? "<h1>" + item.DisplayTime + "</h1><h4>"
        : item.DisplayTime +
          (index !== array.length - 1 ? "&nbsp;&nbsp;&nbsp;" : "");
  }
  output += "</h4>";
  return output;
}

Http.onreadystatechange = e => {
  if (e.currentTarget.readyState == 4) {
    let response = JSON.parse(Http.responseText);
    let buses = response.ResponseData.Buses;
    gullmars = buses.filter(obj => obj.Destination === "Gullmarsplan");
    alvsjo = buses.filter(obj => obj.Destination !== "Gullmarsplan");
    gullmarsOutput = "<h2>Gullmarsplan</h2>" + getTrafficTimes(gullmars);
    alvsjoOutput = "<h2>Älvsjö</h2>" + getTrafficTimes(alvsjo);
    document.getElementById("gullmars").innerHTML = gullmarsOutput;
    document.getElementById("alvsjo").innerHTML = alvsjoOutput;
  }
};

Http2.onreadystatechange = e => {
  if (e.currentTarget.readyState == 4) {
    let response = JSON.parse(Http2.responseText);
    temp = response.vt1observation.temperature;
    document.getElementById("temp").innerHTML =
      "<b>" + temp + "</b> jävla grader är det!";
  }
};
