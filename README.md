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
