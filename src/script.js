const Http = new XMLHttpRequest();
const Http2 = new XMLHttpRequest();
const Http3 = new XMLHttpRequest();
let timerSet = false;
let interval = null;
let temp = 0;
let d = new Date();
let giphyResponse;
const giphySearchTerms = [
  ["sunday", "hangover", "chilling"],
  ["monday"],
  ["tuesday"],
  ["wednesday"],
  ["thursday"],
  ["friday", "party", "beer"],
  ["saturdays", "party", "beer"]
];

const trafficUrl =
  "http://api.sl.se/api2/realtimedeparturesV4.json?key=" +
  apiKeys.sl +
  "&siteid=1860&timewindow=60";
const temperatureUrl =
  "https://api.weather.com/v2/turbo/vt1observation?apiKey=" +
  apiKeys.weather +
  "&format=json&geocode=59.33%2C18.07&language=en-US&units=m";

function start() {
  getSLinfo();
  getTemp();
  getGiphy();
  getTime();
  isItFriday();

  // update time and traffic info every 10s
  if (!interval) {
    interval = setInterval(function() {
      getSLinfo();
      getTime();
    }, 10000);
  }

  // clear timers after 10 min
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

function getSLinfo() {
  this.getTime();
  Http.open("GET", trafficUrl);
  Http.send();
}

function getGiphy() {
  const searchTermGroup = giphySearchTerms[d.getDay()];
  const searchTerm =
    searchTermGroup[Math.floor(Math.random() * searchTermGroup.length)];

  const url =
    "https://api.giphy.com/v1/gifs/search?api_key=" +
    apiKeys.giphy +
    "&q=" +
    searchTerm +
    "&limit=50&offset=0&rating=G&lang=en";
  Http3.open("GET", url);
  Http3.send();
}

function getRandomGiphyImage() {
  let gif =
    "https://media.giphy.com/media/" +
    giphyResponse.data[Math.floor(Math.random() * giphyResponse.data.length)]
      .id +
    "/giphy.gif";
  document.getElementById("giphy").innerHTML = "<img src='" + gif + "'>";
}

function getTemp() {
  document.getElementById("temp").innerHTML = "Laddar ...";
  Http2.open("GET", temperatureUrl);
  Http2.send();
}

function getHours() {
  const d = new Date();
  return d.getHours();
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

Http3.onreadystatechange = e => {
  if (e.currentTarget.readyState == 4) {
    giphyResponse = JSON.parse(Http3.responseText);
    getRandomGiphyImage();
  }
};

start();
