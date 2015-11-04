(function() {
  function FlashClosedCaptions(options) {
    var player = this;

    if (!options) {
      options = {};
    }

    var captionsExist = false;
    var overlay = null;
    var textContainer = null;
    var displayTimeout = null;
    var captionText = null;
    var captionsEnabled = false;

    var activeLines = [];
    var numRows = options.numRows !== undefined ? options.numRows : 2;
    var numLinesPerRow = options.numLinesPerRow !== undefined ? options.numLinesPerRow : 2;
    var enableCookies = options.enableCookies !== undefined ? options.enableCookies : true;

    /**
     * Properly format the lines to fit in the specified number of rows/columns.
     *
     * @param line
     * @returns {string}
     */
    function processLines(line) {
      if (activeLines.length == 0) {
        activeLines.push("");
      }

      var nline = activeLines.length - 1;

      var currline = activeLines[nline];

      for (var i = 0; i < line.length; i++) {
        var c = line.charAt(i);
        if (c == "\n") {
          activeLines.push("");
          nline++;
        }
        else {
          activeLines[nline] += c;
        }
      }

      while (activeLines.length > numRows * numLinesPerRow) {
        // we need to shift the active lines to make room for
        // new text
        for (var j = 0; j < numLinesPerRow; j++) {
          activeLines.shift();
        }
      }

      var retVal = "";
      for (var k = 0; k < activeLines.length; k++) {
        retVal += activeLines[k];

        if (k == activeLines.length - 1) {
          break;
        }

        if ((k + 1) % numLinesPerRow == 0) {
          retVal += "<br/>\n";
        }
        else {
          retVal += " ";
        }
      }

      return retVal;
    }

    /**
     * Event handler to receive the text data from the flash object.
     */
    this.on('textdata', function(player, data) {
      clearTimeout(displayTimeout);
      textContainer.innerHTML = processLines(data[0].text);

      displayTimeout = setTimeout(function() {
        textContainer.innerHTML = '';
      }, 5000);
    });

    /**
     * Tiny cookie 'framework' for managing cookies in vanilla JS from MSDN.
     * https://developer.mozilla.org/en-US/docs/Web/API/Document/cookie
     */
    var docCookies = {
      getItem: function(sKey) {
        if (!sKey) {
          return null;
        }
        return decodeURIComponent(document.cookie.replace(new RegExp("(?:(?:^|.*;)\\s*" + encodeURIComponent(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=\\s*([^;]*).*$)|^.*$"), "$1")) || null;
      },
      setItem: function(sKey, sValue, vEnd, sPath, sDomain, bSecure) {
        if (!sKey || /^(?:expires|max\-age|path|domain|secure)$/i.test(sKey)) {
          return false;
        }
        var sExpires = "";
        if (vEnd) {
          switch (vEnd.constructor) {
            case Number:
              sExpires = vEnd === Infinity ? "; expires=Fri, 31 Dec 9999 23:59:59 GMT" : "; max-age=" + vEnd;
              break;
            case String:
              sExpires = "; expires=" + vEnd;
              break;
            case Date:
              sExpires = "; expires=" + vEnd.toUTCString();
              break;
          }
        }
        document.cookie = encodeURIComponent(sKey) + "=" + encodeURIComponent(sValue) + sExpires + (sDomain ? "; domain=" + sDomain : "") + (sPath ? "; path=" + sPath : "") + (bSecure ? "; secure" : "");
        return true;
      },
      removeItem: function(sKey, sPath, sDomain) {
        if (!this.hasItem(sKey)) {
          return false;
        }
        document.cookie = encodeURIComponent(sKey) + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT" + (sDomain ? "; domain=" + sDomain : "") + (sPath ? "; path=" + sPath : "");
        return true;
      },
      hasItem: function(sKey) {
        if (!sKey) {
          return false;
        }
        return (new RegExp("(?:^|;\\s*)" + encodeURIComponent(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=")).test(document.cookie);
      },
      keys: function() {
        var aKeys = document.cookie.replace(/((?:^|\s*;)[^\=]+)(?=;|$)|^\s*|\s*(?:\=[^;]*)?(?:\1|$)/g, "").split(/\s*(?:\=[^;]*)?;\s*/);
        for (var nLen = aKeys.length, nIdx = 0; nIdx < nLen; nIdx++) {
          aKeys[nIdx] = decodeURIComponent(aKeys[nIdx]);
        }
        return aKeys;
      }
    };

    // Initialize overlay and button components
    var Component = videojs.getComponent('Component');
    videojs.registerComponent('ClosedCaptionText', videojs.extend(Component, {
      constructor: function(name) {
        Component.call(this, name);
        this.addClass('vjs-closed-caption-text');
        textContainer = document.createElement('div');
        textContainer.className = 'caption-text-container';
        this.el().appendChild(textContainer);
      }
    }));

    var ccButton = document.createElement('div');
    ccButton.className = 'vjs-button vjs-control vjs-flash-captions-button';
    player.controlBar.el().appendChild(ccButton);

    /**
     * Event handler to handle toggling of the captions on and off.
     */
    ccButton.onclick = function(e) {
      var self = e.target || e.srcElement;
      captionsEnabled = !captionsEnabled;
      if (captionsEnabled) {
        overlay = player.addChild('ClosedCaptionText');
        self.className = self.className + " active";

        if (enableCookies) {
          docCookies.setItem('videojs-flash-captions', captionsEnabled, 3600 * 1000 * 24 * 365, '/');
        }
      } else {
        player.removeChild('ClosedCaptionText');
        overlay = null;
        self.className = self.className.replace(/\s*active\s*/, '');

        if (enableCookies) {
          docCookies.removeItem('videojs-flash-captions', '/');
        }
      }
    };

    if (docCookies.hasItem('videojs-flash-captions')) {
      if (docCookies.getItem('videojs-flash-captions')) {
        ccButton.click();
      }
    }
  }

  videojs.plugin('FlashClosedCaptions', FlashClosedCaptions);
})();
