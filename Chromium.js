module.exports = (function() {
  if(global.__TINT.Chromium) {
    return global.__TINT.Chromium;
  }
  var path = require('path');
  var execpath = path.dirname(require.resolve('./Chromium.js'));
  process.bridge.dotnet.import(path.join(execpath,'bin/win/CefSharp.dll'));
  process.bridge.dotnet.import(path.join(execpath,'bin/win/CefSharp.Core.dll'));
  process.bridge.dotnet.import(path.join(execpath,'bin/win/CefSharp.Wpf.dll'));
  process.bridge.dotnet.import(path.join(execpath,'bin/win/CefSharp.InterfacesToEvents.dll'));


  var util = require('Utilities');
  var Container = require('Container');
  var $ = process.bridge.dotnet;

  var settings = new $.CefSharp.CefSettings();
  settings.BrowserSubprocessPath = path.join(execpath,'bin/win/CefSharp.BrowserSubprocess.exe');

  var customSchema = new $.CefSharp.CefCustomScheme();
  customSchema.SchemeName = "app";
  customSchema.SchemeHandlerFactory = new $.CefSharp.InterfacesToEvents.AppSchemaChromiumHandler();
  customSchema.IsLocal = false;
  customSchema.IsStandard = false;
  settings.RegisterScheme(customSchema);
  $.CefSharp.Cef.Initialize(settings);

  process.on('exit', function() {
    $.CefSharp.Cef.Shutdown();
  });

  function Chromium(options) {
    options = options || {};
    options.nonStandardEvents = true;
    this.nativeClass =  this.nativeClass || $.CefSharp.Wpf.ChromiumWebBrowser;
    this.nativeViewClass = this.nativeViewClass || $.CefSharp.Wpf.ChromiumWebBrowser;
    Container.call(this, options);
    this.private.devtools = false;

    // Create the interface to bind interfaces
    // to events.
    var eventDelegate = new $.CefSharp.InterfacesToEvents.InterfacesToEvents();
    this.nativeView.DialogHandler = eventDelegate;
    this.nativeView.JsDialogHandler = eventDelegate;
    this.nativeView.RequestHandler = eventDelegate;
    this.nativeView.DownloadHandler = eventDelegate;
    this.nativeView.LifeSpanHandler = eventDelegate;
    this.nativeView.MenuHandler = eventDelegate;

    function callbackHandle(str) { this.fireEvent('message',[str]); }
    var scriptInterface = process.bridge.createScriptInterface(callbackHandle.bind(this));
    this.nativeView.RegisterJsObject("TintMessages", scriptInterface);
    var previousUrl = null, firstLoad = true;

    // Url, IsMainFrame
    this.private.frameLoadStart = function(frame) {
      try {
        this.fireEvent('loading', [frame.Url]);
        if(previousUrl !== frame.Url) {
          this.fireEvent('location-change', [previousUrl, frame.Url]);
          previousUrl = frame.Url;
        }
        this.nativeView.EvaluateScriptAsync('window.postMessageToHost = function(e) { TintMessages.postMessageBackOnMain(e); }');
      } catch (e) {
        console.log('error in frame load');
        console.log(e);
        process.exit(1);
      }
    }
    // Url, IsMainFrame, HttpStatusCode
    this.private.frameLoadEnd = function(frame) {
      try {
        if(firstLoad) {
          firstLoad = false;
        } else {
          this.fireEvent('unload');
        }
        this.fireEvent('load', [frame.Url, frame.HttpStatusCode]);
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
    this.private.policyHandler = function(sender, object) {
      try {
        var obj = $.fromPointer(object);
        var res = this.fireEvent('policy', [ obj.request.Url]);
        obj.shouldCancelResource = res ? true : false;
      } catch (e) {
        console.log(e);
        process.exit(1);
      }
    };
    this.private.newWindowHandler = function(sender, object) {
      try {
        var obj = $.fromPointer(object);
        var newWebview = new Chromium();
        this.fireEvent('new-window', [newWebview]);
        console.log('setting to location: ', obj.targetUrl);
        setTimeout(function() { newWebview.location = obj.targetUrl; }, 100);
        obj.shouldCancelPopUp = true;
      } catch (e) {
        console.log(e);
        process.exit(1);
      }
    }

    this.nativeView.addEventListener('FrameLoadStart', this.private.frameLoadStart.bind(this));
    this.nativeView.addEventListener('FrameLoadEnd', this.private.frameLoadEnd.bind(this));
    this.nativeView.addEventListener('LoadError', this.private.loadError.bind(this));
    this.nativeView.addEventListener('NavStateChanged', this.private.navStateChanged.bind(this));
    this.nativeView.addEventListener('StatusMessage', this.private.statusMessage.bind(this));
    this.nativeView.addEventListener('ConsoleMessage', this.private.consoleMessage.bind(this));

    // Events from delegates:
    //
    // FileDialog, JSAlert, JSConfirm, JSPrompt, JSBeforeUnload. BeforeBrowser
    // CertificateError, PluginCrashed, BeforeResourceLoad, AuthCredentials, BeforePluginLoad
    // RenderProcessTerminated, BeforeDownload, DownloadUpdated, BeforePopUp, BeforeClose
    //
    eventDelegate.addEventListener('BeforeResourceLoad', this.private.policyHandler.bind(this));
    eventDelegate.addEventListener('BeforePopUp', this.private.newWindowHandler.bind(this));

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
    var payload = 'var msg = document.createEvent("MessageEvent");\n'+
    'msg.initMessageEvent("message",true,true,\''+e.toString().replace(/'/g,"\\'")+'\',window.location.protocol + "//" + window.location.host, 12, window, null);\n'+
    'window.dispatchEvent(msg);\n';
    this.nativeView.EvaluateScriptAsync(payload);
  }

  Chromium.prototype.execute = function(e, cb) {
    try {
      var taskRunner = this.nativeView.EvaluateScriptAsync(e);
      taskRunner.Wait(1000);
      setTimeout(function() { cb(taskRunner.Result.Result); }, 10);
    } catch (e) {
      console.log(e);
      process.exit(1);
    }
  }

  // TODO
  util.def(Chromium.prototype, 'progress',
    function() { return -1; }
  );

  util.def(Chromium.prototype, 'location',
    function() { return this.nativeView.Address },
    function(url) { setTimeout(function() { this.nativeView.Load(url); }.bind(this), 100); }
  );

  util.def(Chromium.prototype, "useragent",
    function() { return settings.UserAgent; },
    function(e) { throw new Error('The user agent for Windows Chromium cannot be changed. yet.') }
  );

  util.def(Chromium.prototype, "devtools",
    function() { return this.private.devtools; },
    function(e) {
      if(e) {
        setTimeout(function() { this.nativeView.ShowDevTools(); }.bind(this), 100);
      } else {
        setTimeout(function() { this.nativeView.CloseDevTools();  }.bind(this), 100);
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
