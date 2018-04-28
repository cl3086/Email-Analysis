# Email-Analysis
Project for Digital Forensics: a Chrome browser extension that will analysis and map out hops in an email. It will also check contents and attachments for spam.

Steps:
1. 'npm i' to install npm modules/packages.
2. Register for a Google Maps API key and add it to script tag in index.html (in public).
3. Register for a Google Auth API key in the Google Developer console and add it to the config.js file in /src.
4. Register for a VirusTotal API key (found in your settings once you sign up) and add it to the config.js file in /src. This will handle analyzing the attachments in the email.
5. Register for a ipstack API key and add it to the config.js file in /src. This will allow you to geolocate IP address and host names.
3. Open up Chrome Extension in developer mode.
4. 'yarn build' to build entire project.
5. Upload build to Chrome Extension page.
