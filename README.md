## Chromium for Tint ##

Use chromium as a control in Tint (v2).

Tint: <https://www.trueinteractions.com/tint2/docs/>

Tint @ GitHub: <https://www.github.com/trueinteractions/tint2/>

Chromium-Tint: <https://www.github.com/trueinteractions/tint-chromium/>

### API ###

This follows the same API and functionality as:

<https://www.trueinteractions.com/tint2/docs/WebView.html>

It adds the additional functionality:

* Cross-OS standard browser (rather than relying on WebKit or IE for your WebView).
* Transparency support with hardware acceleration (just set the background-color to transparent on the HTML and BODY control as well as your window.)
* Open/close the dev tools via chromium.devtools = true
* New event 'status' (with the passed in status string)
* New event 'console' (with the passed in console message, source, and line for the callback)


### Install ###

Install from NPM:

```bash
$ npm install chromium
```
Or, Install from Github:
```bash
$ git clone https://github.com/trueinteractions/tint-chromium.git
$ cd tint-chromium
$ install.[bat|sh]
```

### Example ###

```javascript
require('Common');
Chromium = require('chromium');

var win = new Window();
var webview = new Chromium();
win.appendChild(webview);
webview.left = webview.right = webview.top = webview.bottom = 0;
webview.location = "https://www.trueinteractions.com/tint2/docs/";
win.visible = true;
```
