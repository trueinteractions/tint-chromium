module.exports = (function() {
  if(global.__TINT.Chromium) {
    return global.__TINT.Chromium;
  }
  var path = require('path');
  var execpath = path.dirname(require.resolve('./Chromium.js'));
  process.bridge.dotnet.import(path.join(execpath,'bin/win/CefSharp.dll'));
  console.log(path.join(execpath,'bin/win/CefSharp.Core.dll'));
  process.bridge.dotnet.import(path.join(execpath,'bin/win/CefSharp.Core.dll'));
  process.bridge.dotnet.import(path.join(execpath,'bin/win/CefSharp.Wpf.dll'));
  var util = require('Utilities');
  var Container = require('Container');
  var $ = process.bridge.dotnet;

  var settings = new $.CefSharp.CefSettings();
  settings.BrowserSubprocessPath = path.join(execpath,'bin/win/CefSharp.BrowserSubprocess.exe');
  $.CefSharp.Cef.Initialize(settings);

  process.on('exit', function() {
    $.CefSharp.Cef.Shutdown();
  });
  
  //var schema = new $.CefSharp.CefCustomScheme();
  //schema.SchemaName = "app";
  //schema.CefSharpSchemeHandlerFactory

  function Chromium(options) {
    options = options || {};
    options.nonStandardEvents = true;
    this.nativeClass =  this.nativeClass || $.CefSharp.Wpf.ChromiumWebBrowser;
    this.nativeViewClass = this.nativeViewClass || $.CefSharp.Wpf.ChromiumWebBrowser;
    Container.call(this, options);
    //this.nativeView.SetDpiAware();
    this.private.devtools = false;
    function callbackHandle(str) { this.fireEvent('message',[str]); }
    var scriptInterface = process.bridge.createScriptInterface(callbackHandle.bind(this));
    this.nativeView.RegisterJsObject("TintMessages", scriptInterface);
    var previousUrl = null, firstLoad = true;

    // Url, IsMainFrame
    this.private.frameLoadStart = function(frame) {
      try {
        if(frame.IsMainFrame) {
          this.fireEvent('loading', [frame.Url]);
          if(previousUrl !== frame.Url) {
            this.fireEvent('location-change', [previousUrl, frame.Url]);
            previousUrl = frame.Url;
          }
        }
      } catch (e) {
        console.log('error in frame load');
        console.log(e);
        process.exit(1);
      }
    }
    // Url, IsMainFrame, HttpStatusCode
    this.private.frameLoadEnd = function(frame) {
      try {
        if(frame.IsMainFrame) {
          if(firstLoad) {
            firstLoad = false;
          } else {
            this.fireEvent('unload');
          }
          this.fireEvent('load', [frame.Url, frame.HttpStatusCode]);
        }

      } catch (e) {
        console.log(e);
        process.exit(1);
      }
    }

    this.private.loadError = function() {
      this.fireEvent('error');
    };
    this.private.navStateChanged = function() {
      this.fireEvent('request');
    };
    this.private.statusMessage = function(status) {
      try {
        this.fireEvent('status', [status.Value]);
      } catch (e) {
        console.log(e);
        process.exit(1);
      }
    };
    // Message, Source, Line
    this.private.consoleMessage = function(consoleMessage) {
      this.fireEvent('console', [consoleMessage.Message, consoleMessage.Source, consoleMessage.Line]); 
    };
    
    this.nativeView.addEventListener('FrameLoadStart', this.private.frameLoadStart.bind(this));
    this.nativeView.addEventListener('FrameLoadEnd', this.private.frameLoadEnd.bind(this));
    this.nativeView.addEventListener('LoadError', this.private.loadError.bind(this));
    this.nativeView.addEventListener('NavStateChanged', this.private.navStateChanged.bind(this));
    this.nativeView.addEventListener('StatusMessage', this.private.statusMessage.bind(this));
    this.nativeView.addEventListener('ConsoleMessage', this.private.consoleMessage.bind(this));
  }

  Chromium.prototype = Object.create(Container.prototype);
  Chromium.prototype.constructor = Container;
  Chromium.prototype.back = function() { this.nativeView.Back(); }
  Chromium.prototype.forward = function() { this.nativeView.Forward(); }
  Chromium.prototype.reload = function() { this.nativeView.Reload(); }
  Chromium.prototype.stop = function() { this.nativeView.Stop(); }

  Chromium.prototype.boundsOnWindowOfElement = function(e, cb) {
  }

  Chromium.prototype.postMessage = function(e) {
  }

  Chromium.prototype.execute = function(e, cb) {
    this.nativeView.ExecuteScriptAsync(e);
  }

  util.def(Chromium.prototype, 'progress',
    function() { }
  );

  util.def(Chromium.prototype, 'location',
    function() { return this.nativeView.Address },
    function(url) { this.nativeView.Address = url; }
  );

  util.def(Chromium.prototype, "useragent",
    function() { return settings.UserAgent; },
    function(e) { settings.UserAgent = e; }
  );

  util.def(Chromium.prototype, "devtools",
    function() { return this.private.devtools; },
    function(e) {
      if(e) {
        this.nativeView.ShowDevTools();
      } else {
        this.nativeView.CloseDevTools();
      }
      this.private.devtools = e ? true : false;
    }
  );

  util.def(Chromium.prototype, 'loading', 
    function() { return this.nativeView.IsLoading; },
    function(e) {
      if(this.nativeView.IsLoading && !e) {
        this.nativeView.Stop();
      }
    }
  );

  util.def(Chromium.prototype, 'title', 
    function() { return this.nativeView.Title; }
  );

  global.__TINT.Chromium = Chromium;
  return Chromium;
})();
