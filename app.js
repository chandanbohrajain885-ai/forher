/* Inera SafeHer - Women Safety Prediction System
 * Pure client-side JavaScript. No build step, no API keys.
 * Live weather uses the free Open-Meteo API (no key needed).
 */
(function () {
  "use strict";

  // ---------- DATA ----------
  var HELPLINES = [
    { num: "112", name: "National Emergency (All-in-one)" },
    { num: "100", name: "Police" },
    { num: "1091", name: "Women Helpline (Police)" },
    { num: "181", name: "Women Helpline (Domestic abuse)" },
    { num: "108", name: "Ambulance" },
    { num: "1098", name: "Child Helpline" },
    { num: "1930", name: "Cyber Crime Helpline" },
    { num: "101", name: "Fire" }
  ];

  // risk: base risk points (0-100 scale) for each place type
  var PLACE_TYPES = [
    { id: "university", label: "University / College campus", risk: 15, hint: "Campuses usually have security, students and staff around." },
    { id: "hospital", label: "Hospital", risk: 10, hint: "Hospitals stay staffed 24x7 with security and CCTV." },
    { id: "mall", label: "Shopping mall", risk: 12, hint: "Malls have guards, CCTV and crowds during open hours." },
    { id: "office", label: "Office / IT park", risk: 18, hint: "Office areas are safe in work hours but empty after hours." },
    { id: "residential", label: "Residential area", risk: 20, hint: "Residential areas have people nearby who can help." },
    { id: "market", label: "Market / Shopping street", risk: 25, hint: "Markets are busy, but crowds can hide pickpockets and harassers." },
    { id: "restaurant", label: "Restaurant / Café", risk: 15, hint: "Restaurants are public, staffed and usually well lit." },
    { id: "metro", label: "Metro station", risk: 18, hint: "Metro stations have CCTV, guards and women-only coaches." },
    { id: "railway", label: "Railway station", risk: 38, hint: "Railway stations are crowded with many strangers, especially at night." },
    { id: "busstand", label: "Bus stand / Bus stop", risk: 38, hint: "Bus stops are often poorly lit and empty at off-peak times." },
    { id: "tourist", label: "Tourist spot", risk: 30, hint: "Tourist spots attract strangers; remote ones are risky after sunset." },
    { id: "park", label: "Public park / Garden", risk: 35, hint: "Parks get isolated and dark after evening." },
    { id: "parking", label: "Parking lot / Basement", risk: 45, hint: "Parking areas are isolated with many blind spots." },
    { id: "highway", label: "Highway / Isolated road", risk: 55, hint: "Isolated roads have little help available and few people around." },
    { id: "construction", label: "Construction site / Abandoned area", risk: 65, hint: "Abandoned or construction areas have no help, no lighting, no CCTV." }
  ];

  var TIMES = [
    { id: "morning", label: "Morning (6 AM - 12 PM)", risk: 0, hint: "Daytime with good visibility and people around." },
    { id: "afternoon", label: "Afternoon (12 PM - 5 PM)", risk: 0, hint: "Daytime with good visibility and people around." },
    { id: "evening", label: "Evening (5 PM - 8 PM)", risk: 10, hint: "Evening: light is fading, so stay alert." },
    { id: "night", label: "Night (8 PM - 11 PM)", risk: 22, hint: "Night: lower visibility and fewer people around." },
    { id: "latenight", label: "Late night (11 PM - 6 AM)", risk: 35, hint: "Late night is the highest-risk window: very few people and little help." }
  ];

  var WEATHERS = [
    { id: "clear", label: "Clear / Sunny / Cloudy", risk: 0, hint: "Weather is not adding risk." },
    { id: "rain", label: "Rain", risk: 10, hint: "Rain lowers visibility, empties streets and makes it hard to find transport." },
    { id: "fog", label: "Fog / Mist", risk: 18, hint: "Fog badly reduces visibility, so others may not see you if you need help." },
    { id: "winter", label: "Winter / Cold", risk: 8, hint: "Winter brings early darkness, and people stay indoors." },
    { id: "storm", label: "Storm / Thunderstorm", risk: 20, hint: "Storms cause power cuts and empty roads, and transport is unavailable." }
  ];

  var CROWDS = [
    { id: "crowded", label: "Crowded (many people)", risk: 0, hint: "Many people around means help is close." },
    { id: "moderate", label: "Moderate (some people)", risk: 6, hint: "Some people are around, so stay where others can see you." },
    { id: "few", label: "Very few people", risk: 15, hint: "Very few people around means less chance of quick help." },
    { id: "isolated", label: "Isolated / Nobody", risk: 25, hint: "An isolated area is a major risk because no one can help quickly." }
  ];

  var LIGHTING = [
    { id: "good", label: "Well lit", risk: 0, hint: "Good lighting helps you see and be seen." },
    { id: "partial", label: "Partially lit", risk: 8, hint: "Partial lighting creates dark patches and blind spots." },
    { id: "dark", label: "Dark / No lights", risk: 18, hint: "Dark areas are high risk because attackers can hide." }
  ];

  var COMPANY = [
    { id: "group", label: "With a group / family", risk: -10, hint: "Being in a group strongly reduces risk." },
    { id: "friend", label: "With one friend", risk: -4, hint: "Having a companion reduces risk." },
    { id: "alone", label: "Alone", risk: 10, hint: "Being alone increases risk, so share your live location." }
  ];

  var FEATURES = [
    { id: "cctv", risk: -6, good: "CCTV cameras discourage crime and record evidence.", bad: "There is no CCTV coverage, so crime is less likely to be deterred." },
    { id: "security", risk: -8, good: "A security guard or police presence nearby is a strong safety factor.", bad: "No security or police are nearby." },
    { id: "transport", risk: -5, good: "Public transport or cabs are available to leave quickly.", bad: "No transport is available, so leaving quickly will be hard." },
    { id: "phone", risk: -3, good: "Your phone is charged and connected, so you can call for help.", bad: "Charge your phone and keep mobile data on." }
  ];

  var ALTERNATIVES = [
    { q: "police station", icon: "👮", name: "Police Station", desc: "Safest place to go, open 24x7" },
    { q: "hospital", icon: "🏥", name: "Hospital", desc: "Staffed 24x7 with security" },
    { q: "metro station", icon: "🚇", name: "Metro Station", desc: "CCTV, guards, women coaches" },
    { q: "petrol pump", icon: "⛽", name: "Petrol Pump", desc: "Well lit, staffed, often 24x7" },
    { q: "shopping mall", icon: "🏬", name: "Shopping Mall", desc: "Guards and crowds (open hours)" },
    { q: "24 hour pharmacy", icon: "💊", name: "24x7 Pharmacy", desc: "Open late with staff present" },
    { q: "hotel", icon: "🏨", name: "Hotel Lobby", desc: "Reception and security 24x7" },
    { q: "atm", icon: "🏧", name: "ATM with guard", desc: "Lit, with CCTV and often a guard" }
  ];

  // ---------- HELPERS ----------
  function $(id) { return document.getElementById(id); }

  function findById(list, id) {
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === id) return list[i];
    }
    return list[0];
  }

  function fillSelect(el, list, defaultId) {
    el.innerHTML = "";
    list.forEach(function (item) {
      var opt = document.createElement("option");
      opt.value = item.id;
      opt.textContent = item.label;
      if (item.id === defaultId) opt.selected = true;
      el.appendChild(opt);
    });
  }

  function currentTimeId() {
    var h = new Date().getHours();
    if (h >= 6 && h < 12) return "morning";
    if (h >= 12 && h < 17) return "afternoon";
    if (h >= 17 && h < 20) return "evening";
    if (h >= 20 && h < 23) return "night";
    return "latenight";
  }

  function isNightTime(timeId) {
    return timeId === "night" || timeId === "latenight";
  }

  var lastCoords = null; // { lat, lon }

  function getPosition() {
    return new Promise(function (resolve, reject) {
      if (!("geolocation" in navigator)) {
        reject(new Error("Location is not supported on this device."));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        function (pos) {
          lastCoords = { lat: pos.coords.latitude, lon: pos.coords.longitude };
          resolve(lastCoords);
        },
        function (err) {
          var msg = "Could not get location.";
          if (err && err.code === 1) msg = "Location permission denied. Allow location in browser settings.";
          else if (err && err.code === 3) msg = "Location request timed out. Try again.";
          reject(new Error(msg));
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 }
      );
    });
  }

  function mapsSearchUrl(query) {
    if (lastCoords) {
      return "https://www.google.com/maps/search/" + encodeURIComponent(query) +
        "/@" + lastCoords.lat.toFixed(6) + "," + lastCoords.lon.toFixed(6) + ",15z";
    }
    return "https://www.google.com/maps/search/" + encodeURIComponent(query + " near me");
  }

  // ---------- PREDICTION ENGINE ----------
  function predict(input) {
    var place = findById(PLACE_TYPES, input.place);
    var time = findById(TIMES, input.time);
    var weather = findById(WEATHERS, input.weather);
    var crowd = findById(CROWDS, input.crowd);
    var light = findById(LIGHTING, input.lighting);
    var company = findById(COMPANY, input.company);
    var night = isNightTime(time.id);

    var risk = 0;
    var hints = [];

    function addHint(points, text) {
      var cls = points >= 15 ? "bad" : points > 0 ? "mid" : "good";
      hints.push({ cls: cls, text: text, points: points });
    }

    // Place
    risk += place.risk;
    addHint(place.risk >= 35 ? 20 : place.risk >= 20 ? 5 : 0, "📍 " + place.label + ": " + place.hint);

    // Time
    var timeRisk = time.risk;
    // places that become much riskier at night
    var nightSensitive = ["park", "parking", "highway", "busstand", "railway", "tourist", "office", "construction", "university"];
    if (night && nightSensitive.indexOf(place.id) !== -1) {
      timeRisk += 8;
    }
    risk += timeRisk;
    addHint(timeRisk, "🕒 " + time.hint + (timeRisk > time.risk ? " This type of place becomes noticeably riskier at night." : ""));

    // Weather
    var weatherRisk = weather.risk;
    if (night && (weather.id === "fog" || weather.id === "rain" || weather.id === "storm")) {
      weatherRisk += 5; // bad weather at night compounds the risk
    }
    risk += weatherRisk;
    addHint(weatherRisk, "🌦️ " + weather.hint);

    // Crowd
    var crowdRisk = crowd.risk;
    if (night && crowd.id === "isolated") crowdRisk += 5;
    risk += crowdRisk;
    addHint(crowdRisk, "👥 " + crowd.hint);

    // Lighting (daytime lighting matters less)
    var lightRisk = night ? light.risk : Math.round(light.risk / 3);
    risk += lightRisk;
    addHint(lightRisk, "💡 " + light.hint + (!night && light.risk > 0 ? " This matters less in daylight." : ""));

    // Company
    risk += company.risk;
    addHint(company.risk > 0 ? 10 : 0, "🧑‍🤝‍🧑 " + company.hint);

    // Features
    FEATURES.forEach(function (f) {
      if (input.features[f.id]) {
        risk += f.risk;
        addHint(0, "✔️ " + f.good);
      } else {
        addHint(f.id === "security" || f.id === "cctv" ? 5 : 3, "✖️ " + f.bad);
      }
    });

    // Smooth saturation curve: stacked factors raise risk but never jump straight to 100.
    risk = risk <= 0 ? 0 : 100 * (1 - Math.exp(-risk / 70));
    risk = Math.max(0, Math.min(100, Math.round(risk)));

    var level;
    if (risk < 35) level = "safe";
    else if (risk < 60) level = "caution";
    else level = "unsafe";

    // most important hints first
    hints.sort(function (a, b) { return b.points - a.points; });

    return {
      risk: risk,
      safety: 100 - risk,
      level: level,
      night: night,
      hints: hints,
      tips: buildTips(level, { place: place, time: time, weather: weather, crowd: crowd, light: light, company: company, night: night, features: input.features })
    };
  }

  function buildTips(level, c) {
    var tips = [];
    if (level === "unsafe") {
      tips.push("Leave this place now and move towards a busy, well-lit area or one of the safer places listed below.");
      tips.push("Share your live location with family or friends using the red button above.");
      tips.push("Keep 112 on speed dial. In danger, call 112, or 1091 for the women helpline.");
    } else if (level === "caution") {
      tips.push("Stay alert. Avoid using earphones and keep your phone in your hand.");
      tips.push("Tell someone where you are and when you expect to reach your destination.");
    } else {
      tips.push("The place looks reasonably safe for these conditions, but stay aware of your surroundings.");
    }

    if (c.company.id === "alone") tips.push("You are alone, so share your trip or live location with a trusted contact.");
    if (c.night) tips.push("At night, use registered cabs and share the ride details. Sit behind the driver and keep the child lock off.");
    if (c.weather.id === "fog") tips.push("In fog, stay on main roads and avoid shortcuts through empty lanes.");
    if (c.weather.id === "rain" || c.weather.id === "storm") tips.push("Bad weather makes transport hard to find, so book transport early and wait in a covered, lit, busy spot.");
    if (c.weather.id === "winter") tips.push("It gets dark early in winter, so plan to finish travel before sunset.");
    if (c.light.id === "dark") tips.push("Avoid dark stretches and turn on your phone torch if needed.");
    if (c.crowd.id === "isolated" || c.crowd.id === "few") tips.push("Move to a place with more people, such as a shop, petrol pump or main road.");
    if (!c.features.phone) tips.push("Charge your phone and carry a power bank.");
    tips.push("Trust your instincts. If something feels wrong, leave and call for help.");
    return tips;
  }

  // ---------- RENDER ----------
  function renderHelplines() {
    var grid = $("emgGrid");
    HELPLINES.forEach(function (h) {
      var a = document.createElement("a");
      a.className = "emg-item";
      a.href = "tel:" + h.num;
      var n = document.createElement("span");
      n.className = "emg-num";
      n.textContent = "📞 " + h.num;
      var t = document.createElement("span");
      t.className = "emg-name";
      t.textContent = h.name;
      a.appendChild(n);
      a.appendChild(t);
      grid.appendChild(a);
    });
  }

  function renderAlternatives() {
    var grid = $("altGrid");
    grid.innerHTML = "";
    ALTERNATIVES.forEach(function (alt) {
      var a = document.createElement("a");
      a.className = "alt-item";
      a.href = mapsSearchUrl(alt.q);
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      var s = document.createElement("strong");
      s.textContent = alt.icon + " " + alt.name;
      var d = document.createElement("span");
      d.textContent = alt.desc;
      a.appendChild(s);
      a.appendChild(d);
      grid.appendChild(a);
    });
  }

  function renderResult(result, placeName) {
    $("placeholder").classList.add("hidden");
    $("resultContent").classList.remove("hidden");

    var cfg = {
      safe: { icon: "✅", label: "SAFE", color: "var(--safe)" },
      caution: { icon: "⚠️", label: "BE CAUTIOUS", color: "var(--warn)" },
      unsafe: { icon: "⛔", label: "NOT SAFE", color: "var(--danger)" }
    }[result.level];

    var verdict = $("verdict");
    verdict.className = "verdict " + result.level;
    $("verdictIcon").textContent = cfg.icon;
    $("verdictLabel").textContent = cfg.label;
    $("verdictPlace").textContent = placeName
      ? "for women at " + placeName + " under these conditions"
      : "for women under these conditions";

    var fill = $("meterFill");
    fill.style.background = cfg.color;
    fill.style.width = result.safety + "%";
    $("safetyScore").textContent = String(result.safety);
    $("riskScore").textContent = String(result.risk);

    var hl = $("hintList");
    hl.innerHTML = "";
    result.hints.forEach(function (h) {
      var li = document.createElement("li");
      li.className = h.cls;
      li.textContent = h.text;
      hl.appendChild(li);
    });

    var tl = $("tipList");
    tl.innerHTML = "";
    result.tips.forEach(function (t) {
      var li = document.createElement("li");
      li.textContent = t;
      tl.appendChild(li);
    });

    // Alternatives: always for unsafe, also for caution at night
    var showAlt = result.level === "unsafe" || (result.level === "caution" && result.night);
    if (showAlt) {
      renderAlternatives();
      $("altBlock").classList.remove("hidden");
    } else {
      $("altBlock").classList.add("hidden");
    }

    if (window.matchMedia && window.matchMedia("(max-width: 820px)").matches) {
      $("resultCard").scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  // ---------- LIVE WEATHER (Open-Meteo, no API key) ----------
  function mapWeatherCode(code, tempC) {
    if (code === 45 || code === 48) return "fog";
    if (code >= 95) return "storm";
    if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return "rain";
    if ((code >= 71 && code <= 77) || code === 85 || code === 86) return "winter";
    if (typeof tempC === "number" && tempC < 15) return "winter";
    return "clear";
  }

  function detectLiveWeather() {
    var btn = $("liveWeatherBtn");
    var status = $("weatherStatus");
    btn.disabled = true;
    status.textContent = "Getting your location…";

    getPosition()
      .then(function (c) {
        status.textContent = "Fetching live weather…";
        var url = "https://api.open-meteo.com/v1/forecast?latitude=" + c.lat.toFixed(4) +
          "&longitude=" + c.lon.toFixed(4) + "&current=temperature_2m,weather_code,is_day";
        return fetch(url).then(function (res) {
          if (!res.ok) throw new Error("Weather service unavailable.");
          return res.json();
        });
      })
      .then(function (data) {
        if (!data || !data.current) throw new Error("Weather data not available.");
        var cur = data.current;
        var wid = mapWeatherCode(Number(cur.weather_code), Number(cur.temperature_2m));
        $("weather").value = wid;
        $("timeOfDay").value = currentTimeId();
        status.textContent = "Live: " + findById(WEATHERS, wid).label + ", " +
          Math.round(Number(cur.temperature_2m)) + "°C" + (cur.is_day === 0 ? " (dark outside)" : "");
      })
      .catch(function (err) {
        status.textContent = (err && err.message ? err.message : "Could not detect weather.") + " Please select manually.";
      })
      .then(function () {
        btn.disabled = false;
      });
  }

  // ---------- SHARE LOCATION ----------
  function shareLocation() {
    var btn = $("shareLocBtn");
    var status = $("shareStatus");
    btn.disabled = true;
    status.textContent = "Getting your location…";

    getPosition()
      .then(function (c) {
        var link = "https://maps.google.com/?q=" + c.lat.toFixed(6) + "," + c.lon.toFixed(6);
        var msg = "I may need help. My current location: " + link;

        if (navigator.share) {
          return navigator.share({ title: "My Location - SafeHer", text: msg })
            .then(function () { status.textContent = "Location shared."; })
            .catch(function () { showWhatsAppLink(msg, status); });
        }
        showWhatsAppLink(msg, status);
        return null;
      })
      .catch(function (err) {
        status.textContent = err && err.message ? err.message : "Could not get location.";
      })
      .then(function () {
        btn.disabled = false;
      });
  }

  function showWhatsAppLink(msg, status) {
    status.textContent = "";
    var a = document.createElement("a");
    a.href = "https://wa.me/?text=" + encodeURIComponent(msg);
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.textContent = "Tap here to send via WhatsApp";
    status.appendChild(a);
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(msg).then(function () {
        status.appendChild(document.createTextNode(" (also copied to clipboard)"));
      }).catch(function () { /* clipboard not allowed: ignore */ });
    }
  }

  // ---------- INIT ----------
  function init() {
    fillSelect($("placeType"), PLACE_TYPES, "university");
    fillSelect($("timeOfDay"), TIMES, currentTimeId());
    fillSelect($("weather"), WEATHERS, "clear");
    fillSelect($("crowd"), CROWDS, "moderate");
    fillSelect($("lighting"), LIGHTING, "good");
    fillSelect($("company"), COMPANY, "alone");
    renderHelplines();
    $("year").textContent = String(new Date().getFullYear());

    $("nowBtn").addEventListener("click", function () {
      $("timeOfDay").value = currentTimeId();
    });
    $("liveWeatherBtn").addEventListener("click", detectLiveWeather);
    $("shareLocBtn").addEventListener("click", shareLocation);

    $("safetyForm").addEventListener("submit", function (e) {
      e.preventDefault();
      var input = {
        place: $("placeType").value,
        time: $("timeOfDay").value,
        weather: $("weather").value,
        crowd: $("crowd").value,
        lighting: $("lighting").value,
        company: $("company").value,
        features: {
          cctv: $("cctv").checked,
          security: $("security").checked,
          transport: $("transport").checked,
          phone: $("phone").checked
        }
      };
      var result = predict(input);
      renderResult(result, $("placeName").value.trim());
    });
  }

  // Expose engine for testing (harmless in browser)
  if (typeof window !== "undefined") {
    window.SafeHerEngine = { predict: predict, mapWeatherCode: mapWeatherCode };
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
