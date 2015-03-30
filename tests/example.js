require('Common');
Chromium = require('../win/Chromium');
var win = new Window();
var chromium = new Chromium();
chromium.left = chromium.right = chromium.top = chromium.bottom = 0;
win.appendChild(chromium);
win.visible = true;
chromium.location = "https://www.google.com";