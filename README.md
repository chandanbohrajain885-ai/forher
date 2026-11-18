# Inera SafeHer – Women Safety Prediction System

A static web app (HTML + CSS + JavaScript). No build step, no API keys, no backend.

## Files
- `index.html` – page layout
- `style.css` – styling (mobile friendly)
- `app.js` – prediction engine, helplines, live weather, location sharing

## Deploy on Vercel
1. Create a new GitHub repository and upload all the files to the repository root.
2. In Vercel, click **Add New → Project** and import the repository.
3. Framework Preset: **Other**. Leave Build Command and Output Directory empty.
4. Click **Deploy**.

## Features
- Safety prediction (Safe / Be Cautious / Not Safe) with a safety score out of 100
- Inputs: place type, time of day, weather (clear, rain, fog, winter, storm), crowd, lighting, company, and safety features present
- Hints that explain why the place is or isn't safe
- Safer alternatives (police station, hospital, metro, petrol pump, and more) that open in Google Maps near you
- Emergency helplines you can tap to call: 112, 100, 1091, 181, 108, 1098, 1930, 101
- Live weather detection at your location (free Open-Meteo API)
- Share your live location (native share sheet or WhatsApp)

## Note
The prediction is rule-based and uses the conditions the user enters. It does not use crime data.
Location and weather features need HTTPS, which Vercel provides automatically.
