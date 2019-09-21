const r1 = new XMLHttpRequest();
const r2 = new XMLHttpRequest();
const r3 = new XMLHttpRequest();
const r4 = new XMLHttpRequest();
const giphySearchTerms = [
  ["sunday", "hangover", "chilling"],
  ["monday"],
  ["tuesday"],
  ["wednesday"],
  ["thursday"],
  ["friday", "party", "beer"],
  ["saturdays", "party", "beer"]
];
const slRealtimeUrl =
  "http://api.sl.se/api2/realtimedeparturesV4.json?key=" +
  apiKeys.slRealtime +
  "&siteid=1860&timewindow=60";
const slDeviationsUrl =
  "http://api.sl.se/api2/deviations.json?key=" + apiKeys.slDeviations + "&siteId=9529";
const temperatureUrl =
  "https://api.weather.com/v2/turbo/vt1observation?apiKey=" +
  apiKeys.weather +
  "&format=json&geocode=59.33%2C18.07&language=en-US&units=m";
let timerSet = false;
let interval = null;
let temp = 0;
let d = new Date();
let giphyResponse;

function start() {
  getSLRealtime();
  getSLDeviations();
  getTemp();
  getGiphy();
  getTime();
  isItFriday();

  // update time and traffic info every 10s
  if (!interval) {
    interval = setInterval(function() {
      getSLRealtime();
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

function getSLRealtime() {
  this.getTime();
  r1.open("GET", slRealtimeUrl);
  r1.send();
}

function getSLDeviations() {
  r4.open("GET", slDeviationsUrl);
  r4.send();
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
    "&limit=50&offset=0&lang=en";
  r3.open("GET", url);
  r3.send();
}

function getRandomGiphyImage() {
  let gif =
    "https://media.giphy.com/media/" +
    giphyResponse.data[Math.floor(Math.random() * giphyResponse.data.length)]
      .id +
    "/giphy.gif";
  document.getElementById("output-giphy").innerHTML = "<img src='" + gif + "'>";
}

function getTemp() {
  document.getElementById("output-temp").innerHTML = "Laddar ...";
  r2.open("GET", temperatureUrl);
  r2.send();
}

function getHours() {
  const d = new Date();
  return d.getHours();
}

function getTime() {
  const d = new Date();
  document.getElementById("output-last-update").innerHTML =
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
  document.getElementById("output-friday").innerHTML = text;
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

r1.onreadystatechange = e => {
  if (e.currentTarget.readyState == 4) {
    const response = JSON.parse(r1.responseText);
    let buses = response.ResponseData.Buses;
    gullmars = buses.filter(obj => obj.Destination === "Gullmarsplan");
    alvsjo = buses.filter(obj => obj.Destination !== "Gullmarsplan");
    gullmarsOutput = "<h2>Gullmarsplan</h2>" + getTrafficTimes(gullmars);
    alvsjoOutput = "<h2>Älvsjö</h2>" + getTrafficTimes(alvsjo);
    document.getElementById("output-gullmars").innerHTML = gullmarsOutput;
    document.getElementById("output-alvsjo").innerHTML = alvsjoOutput;
  }
};

r2.onreadystatechange = e => {
  if (e.currentTarget.readyState == 4) {
    const response = JSON.parse(r2.responseText);
    temp = response.vt1observation.temperature;
    document.getElementById("output-temp").innerHTML =
      "<b>" + temp + "</b> jävla grader är det!";
  }
};

r3.onreadystatechange = e => {
  if (e.currentTarget.readyState == 4) {
    giphyResponse = JSON.parse(r3.responseText);
    getRandomGiphyImage();
  }
};

r4.onreadystatechange = e => {
  if (e.currentTarget.readyState == 4) {
    const response = JSON.parse(r4.responseText);
  }
};

start();
