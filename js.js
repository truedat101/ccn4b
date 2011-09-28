/**
#
#Copyright (c) 2011 Razortooth Communications, LLC. All rights reserved.
#
#Redistribution and use in source and binary forms, with or without modification,
#are permitted provided that the following conditions are met:
#
#    * Redistributions of source code must retain the above copyright notice,
#      this list of conditions and the following disclaimer.
#
#    * Redistributions in binary form must reproduce the above copyright notice,
#      this list of conditions and the following disclaimer in the documentation
#      and/or other materials provided with the distribution.
#
#    * Neither the name of Razortooth Communications, LLC, nor the names of its
#      contributors may be used to endorse or promote products derived from this
#      software without specific prior written permission.
#
#THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
#ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
#WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
#DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
#ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
#(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
#LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
#ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
#(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
#SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
**/

var js = exports;

/** 
  * Attributions
  */
/** 
  js.js a small server for big ideas, offering a small template starter project, 
   
  - fu.js: from the node_chat demo, source of major inspiration
  - socket.io: to handle socket oriented communication
  - node.js: for the runtime
 */



/** 
 * Imports
 */
var createServer = require('http').createServer,
	sys = require('sys'),
	assert = require('assert'), 
	fs = require('fs'),
	url = require('url'), 
	spawn = require('child_process').spawn,
	exec  = require('child_process').exec,
	logger = require('nlogger').logger(module);
	

/** 
  * CONFIG
  *
  */
DEBUG = true;

js.CONFIG = {
	'HTTPWS_PORT':8000,
	'VERSION_TAG':'0.1.0',
	'VERSION_DESCRIPTION':'Put your app description here',
	'SLIDE_DIR':'./'
};

var INTERNAL_SERVER_ERROR = 'Internal Server Error!  Oh pshaw\n';
var NOT_FOUND_ERROR = '404 Error :(  I am sad.  \n';

/**
  * js.js - jumbosocket 
  * 
  */
js.ROUTE_MAP = {}; // Populate this with the App Routes you set up
js.RE_MAP = {}; // Populate this with the App Routes you set up
js.address = '0.0.0.0'; // If you don't want this exposed on a network facing IP address, change to 'localhost'
js.channels = {}; // XXX Should move to using socket.io namespaces
js.DEFAULT_JS_HANDLER = defaultJSHandler;
js.js_handler; // Set this to some handler you want to use for Socket.IO, otherwise, default to defaultJSHandler

if (DEBUG) {
	console.log("TURN OFF DEBUG for Production");
}

js.get = function(path, handler) {
	js.ROUTE_MAP[path] = handler;
};

js.getterer = function(path, handler) {
	var repath = RegExp(path);
	js.RE_MAP[path] = repath;
	// console.log(regexMap);
	js.get(repath, handler);
}

js.executil = function(execstring, options, callback) {
	var child, data;
	var optdefaults = { encoding: 'utf8',
						timeout: 0,
						maxBuffer: 200*1024,
						killSignal: 'SIGTERM',
						cwd: null,
						env: null } /* We can change these defaults as needed */
	
	if (options) logger.debug('using options');
	if (callback) logger.debug('using callback');
	logger.debug('executil start exec of ' + execstring + ' at: ' + (new Date).getTime());
	child = exec(execstring,
				options ? options : optdefaults,
				callback ? callback :
				function (error, stdout, stderr) {
					data = stdout;
					logger.debug('stdout: ' + data + (new Date).getTime());
					logger.debug('stderr: ' + stderr);
					if (error !== null) {
						logger.error('exec error: ' + error);
					}
				});
	logger.debug('executil of ' + child.pid + ' completed at ' + (new Date).getTime());
}

js.mime = {
  // returns MIME type for extension, or fallback, or octet-steam
  lookupExtension : function(ext, fallback) {
    return js.mime.TYPES[ext.toLowerCase()] || fallback || 'application/octet-stream';
  },

  // List of most common mime-types, stolen from Rack.
  // XXX: Can we refactor this out, replace with an NPM module or something more compact?
  TYPES : { ".3gp"   : "video/3gpp"
          , ".a"     : "application/octet-stream"
          , ".ai"    : "application/postscript"
          , ".aif"   : "audio/x-aiff"
          , ".aiff"  : "audio/x-aiff"
          , ".asc"   : "application/pgp-signature"
          , ".asf"   : "video/x-ms-asf"
          , ".asm"   : "text/x-asm"
          , ".asx"   : "video/x-ms-asf"
          , ".atom"  : "application/atom+xml"
          , ".au"    : "audio/basic"
          , ".avi"   : "video/x-msvideo"
          , ".bat"   : "application/x-msdownload"
          , ".bin"   : "application/octet-stream"
          , ".bmp"   : "image/bmp"
          , ".bz2"   : "application/x-bzip2"
          , ".c"     : "text/x-c"
          , ".cab"   : "application/vnd.ms-cab-compressed"
          , ".cc"    : "text/x-c"
          , ".chm"   : "application/vnd.ms-htmlhelp"
          , ".class"   : "application/octet-stream"
          , ".com"   : "application/x-msdownload"
          , ".conf"  : "text/plain"
          , ".cpp"   : "text/x-c"
          , ".crt"   : "application/x-x509-ca-cert"
          , ".css"   : "text/css"
          , ".csv"   : "text/csv"
          , ".cxx"   : "text/x-c"
          , ".deb"   : "application/x-debian-package"
          , ".der"   : "application/x-x509-ca-cert"
          , ".diff"  : "text/x-diff"
          , ".djv"   : "image/vnd.djvu"
          , ".djvu"  : "image/vnd.djvu"
          , ".dll"   : "application/x-msdownload"
          , ".dmg"   : "application/octet-stream"
          , ".doc"   : "application/msword"
          , ".dot"   : "application/msword"
          , ".dtd"   : "application/xml-dtd"
          , ".dvi"   : "application/x-dvi"
          , ".ear"   : "application/java-archive"
          , ".eml"   : "message/rfc822"
          , ".eps"   : "application/postscript"
          , ".exe"   : "application/x-msdownload"
          , ".f"     : "text/x-fortran"
          , ".f77"   : "text/x-fortran"
          , ".f90"   : "text/x-fortran"
          , ".flv"   : "video/x-flv"
		  , ".apk"	 : "application/vnd.android.package-archive"
          , ".for"   : "text/x-fortran"
          , ".gem"   : "application/octet-stream"
          , ".gemspec" : "text/x-script.ruby"
          , ".gif"   : "image/gif"
          , ".gz"    : "application/x-gzip"
          , ".h"     : "text/x-c"
          , ".hh"    : "text/x-c"
          , ".htm"   : "text/html"
          , ".html"  : "text/html"
          , ".ico"   : "image/vnd.microsoft.icon"
          , ".ics"   : "text/calendar"
          , ".ifb"   : "text/calendar"
          , ".iso"   : "application/octet-stream"
          , ".jar"   : "application/java-archive"
          , ".java"  : "text/x-java-source"
          , ".jnlp"  : "application/x-java-jnlp-file"
          , ".jpeg"  : "image/jpeg"
          , ".jpg"   : "image/jpeg"
          , ".js"    : "application/javascript"
          , ".json"  : "application/json"
          , ".log"   : "text/plain"
          , ".m3u"   : "audio/x-mpegurl"
          , ".m4v"   : "video/mp4"
          , ".man"   : "text/troff"
          , ".mathml"  : "application/mathml+xml"
          , ".mbox"  : "application/mbox"
          , ".mdoc"  : "text/troff"
          , ".me"    : "text/troff"
          , ".mid"   : "audio/midi"
          , ".midi"  : "audio/midi"
          , ".mime"  : "message/rfc822"
          , ".mml"   : "application/mathml+xml"
          , ".mng"   : "video/x-mng"
          , ".mov"   : "video/quicktime"
          , ".mp3"   : "audio/mpeg"
          , ".mp4"   : "video/mp4"
          , ".mp4v"  : "video/mp4"
          , ".mpeg"  : "video/mpeg"
          , ".mpg"   : "video/mpeg"
          , ".ms"    : "text/troff"
          , ".msi"   : "application/x-msdownload"
          , ".odp"   : "application/vnd.oasis.opendocument.presentation"
          , ".ods"   : "application/vnd.oasis.opendocument.spreadsheet"
          , ".odt"   : "application/vnd.oasis.opendocument.text"
          , ".ogg"   : "application/ogg"
          , ".p"     : "text/x-pascal"
          , ".pas"   : "text/x-pascal"
          , ".pbm"   : "image/x-portable-bitmap"
          , ".pdf"   : "application/pdf"
          , ".pem"   : "application/x-x509-ca-cert"
          , ".pgm"   : "image/x-portable-graymap"
          , ".pgp"   : "application/pgp-encrypted"
          , ".pkg"   : "application/octet-stream"
          , ".pl"    : "text/x-script.perl"
          , ".pm"    : "text/x-script.perl-module"
          , ".png"   : "image/png"
          , ".pnm"   : "image/x-portable-anymap"
          , ".ppm"   : "image/x-portable-pixmap"
          , ".pps"   : "application/vnd.ms-powerpoint"
          , ".ppt"   : "application/vnd.ms-powerpoint"
          , ".ps"    : "application/postscript"
          , ".psd"   : "image/vnd.adobe.photoshop"
          , ".py"    : "text/x-script.python"
          , ".qt"    : "video/quicktime"
          , ".ra"    : "audio/x-pn-realaudio"
          , ".rake"  : "text/x-script.ruby"
          , ".ram"   : "audio/x-pn-realaudio"
          , ".rar"   : "application/x-rar-compressed"
          , ".rb"    : "text/x-script.ruby"
          , ".rdf"   : "application/rdf+xml"
          , ".roff"  : "text/troff"
          , ".rpm"   : "application/x-redhat-package-manager"
          , ".rss"   : "application/rss+xml"
          , ".rtf"   : "application/rtf"
          , ".ru"    : "text/x-script.ruby"
          , ".s"     : "text/x-asm"
          , ".sgm"   : "text/sgml"
          , ".sgml"  : "text/sgml"
          , ".sh"    : "application/x-sh"
          , ".sig"   : "application/pgp-signature"
          , ".snd"   : "audio/basic"
          , ".so"    : "application/octet-stream"
          , ".svg"   : "image/svg+xml"
          , ".svgz"  : "image/svg+xml"
          , ".swf"   : "application/x-shockwave-flash"
          , ".t"     : "text/troff"
          , ".tar"   : "application/x-tar"
          , ".tbz"   : "application/x-bzip-compressed-tar"
          , ".tcl"   : "application/x-tcl"
          , ".tex"   : "application/x-tex"
          , ".texi"  : "application/x-texinfo"
          , ".texinfo" : "application/x-texinfo"
          , ".text"  : "text/plain"
          , ".tif"   : "image/tiff"
          , ".tiff"  : "image/tiff"
          , ".torrent" : "application/x-bittorrent"
          , ".tr"    : "text/troff"
          , ".txt"   : "text/plain"
          , ".vcf"   : "text/x-vcard"
          , ".vcs"   : "text/x-vcalendar"
          , ".vrml"  : "model/vrml"
          , ".war"   : "application/java-archive"
          , ".wav"   : "audio/x-wav"
          , ".wma"   : "audio/x-ms-wma"
          , ".wmv"   : "video/x-ms-wmv"
          , ".wmx"   : "video/x-ms-wmx"
          , ".wrl"   : "model/vrml"
          , ".wsdl"  : "application/wsdl+xml"
          , ".xbm"   : "image/x-xbitmap"
          , ".xhtml"   : "application/xhtml+xml"
          , ".xls"   : "application/vnd.ms-excel"
          , ".xml"   : "application/xml"
          , ".xpm"   : "image/x-xpixmap"
          , ".xsl"   : "application/xml"
          , ".xslt"  : "application/xslt+xml"
          , ".yaml"  : "text/yaml"
          , ".yml"   : "text/yaml"
          , ".zip"   : "application/zip"
          }
};

js.staticHandler = function (filename) {
  var body, headers;
  var content_type = js.mime.lookupExtension(extname(filename));

  function loadResponseData(callback) {
    if (body && headers && !DEBUG) {
      callback();
      return;
    }

    sys.puts("loading " + filename + "...");
    fs.readFile(filename, function (err, data) {
      if (err) {
        sys.puts("Error loading " + filename);
		console.log("Error loading file: " + filename + " because of " + err)
      } else {
        body = data;
        headers = { "Content-Type": content_type
                  , "Content-Length": body.length
                  };
        if (!DEBUG) headers["Cache-Control"] = "public";
        // sys.puts("static file " + filename + " loaded");
        callback();
      }
    });
  }

  return function (req, res) {
    loadResponseData(function () {
      res.writeHead(200, headers);
      res.end(req.method === "HEAD" ? "" : body);
    });
  }
};

js.listenHttpWS = function (port, host) {
	server.listen(port, host);
	js.address = server.address().address;
	if (js.address == '0.0.0.0') {
		getNetworkIP(function (error, ip) {
		    if (!error) {
				js.address = ip;
				sys.puts('Started server on IP address: ', js.address);
		    } else {
				sys.puts('error:', error);
			}
		}, false); 
	  }
	sys.puts("Server at http://" + (host || "127.0.0.1") + ":" + port.toString() + "/");
};

js.close = function () { 
	server.close(); 
};

js.listenSocketIO = function(servicehandler) {
	if (server) {
		try { // Try not to let this fall out the bottom if we have an issue with the service handler implementation or any funky stuff with socket.io
			io.sockets.on('connection', servicehandler);
			sys.puts("Set connection to socket.io");
		} catch(e) {
                        logger.error("Caught a server-side Node.js exception.  Ouch!  Here's what happened: " + e.name + ". Error message: " + e.message);
                        if (e.stack) logger.error(e.stack);
						internalServerError(req, res);
                }

	} else {
		sys.err("server global is not defined");
	}
};

var server = createServer(function(req, res) {
		try {
			if (req.method === "GET" || req.method === "HEAD") {
				var handler;
				handler = js.ROUTE_MAP[url.parse(req.url).pathname];
				if (!handler) {
					for (var expr in js.RE_MAP) {
						// sys.puts('Test ' + req.url + ' against expr: ' + expr);
						if (js.RE_MAP[expr] && js.RE_MAP[expr].test(url.parse(req.url).pathname)) {
							handler = js.ROUTE_MAP[js.RE_MAP[expr].toString()];
							break;
						} else {
							handler = notFound;
						}
					}
				}
			}

			res.simpleText = function (code, body) {
		      	res.writeHead(code, { "Content-Type": "text/plain"
									, "Content-Length": body.length
							});
				res.end(body);
			};

			res.simpleJSON = function (code, obj) {
				var body = JSON.stringify(obj);
				res.writeHead(code, { "Content-Type": "text/json"
									, "Content-Length": body.length
							});
				res.end(body);
			};

			handler(req, res);
		} catch(e) {
			sys.error("Caught a server-side Node.js exception.  Ouch!  Here's what happened: " + e.name + ". Error message: " + e.message);
			internalServerError(req, res);
		}

});


js.getterer("/iui/[\\w\\.\\-]+", function(req, res) {
	return js.staticHandler("." + url.parse(req.url).pathname)(req, res);
});

js.getterer("/css/[\\w\\.\\-]+", function(req, res) {
	return js.staticHandler("." + url.parse(req.url).pathname)(req, res);
});

js.getterer("/js/[\\w\\.\\-]+", function(req, res) {
	return js.staticHandler("." + url.parse(req.url).pathname)(req, res);
});

js.getterer("/images/[\\w\\.\\-]+", function(req, res) {
	return js.staticHandler("." + url.parse(req.url).pathname)(req, res);
});



/**
  * Utility Routines
  */
function extname (path) {
  var index = path.lastIndexOf(".");
  return index < 0 ? "" : path.substring(index);
}

/** 
	getNetworkIP()
	
	Similar problem and similar answer found on python, drop down to os process and figure it out
	by sniffing off ifconfig.  May be tricky if you are looking for wireless interface, so probably
	would need to grab my code from python to remember what I did there that was clever.
	
	Code Borrowed from contribution by pumbaa80
	Thanks Stackoverflow: http://stackoverflow.com/posts/3742915/revisions
**/
var getNetworkIP = (function () {
    var ignoreRE = /^(127\.0\.0\.1|::1|fe80(:1)?::1(%.*)?)$/i;

    var exec = require('child_process').exec;
    var cached;    
    var command;
    var filterRE;

    switch (process.platform) {
	    // TODO: implement for OSs without ifconfig command
	    case 'darwin':
	         command = 'ifconfig';
	         filterRE = /\binet\s+([^\s]+)/g;
	         // filterRE = /\binet6\s+([^\s]+)/g; // IPv6
	         break;
	    default:
	         command = 'ifconfig';
	         filterRE = /\binet\b[^:]+:\s*([^\s]+)/g;
	         // filterRE = /\binet6[^:]+:\s*([^\s]+)/g; // IPv6
	         break;
    }

    return function (callback, bypassCache) {
         // get cached value
        if (cached && !bypassCache) {
            callback(null, cached);
            return;
        }
        // system call
        exec(command, function (error, stdout, sterr) {
            var ips = [];
            // extract IPs
            var matches = stdout.match(filterRE);
            // JS has no lookbehind REs, so we need a trick
            for (var i = 0; i < matches.length; i++) {
                ips.push(matches[i].replace(filterRE, '$1'));
            }

            // filter BS
            for (var i = 0, l = ips.length; i < l; i++) {
                if (!ignoreRE.test(ips[i])) {
                    //if (!error) {
                        cached = ips[i];
                    //}
                    callback(error, ips[i]);
                    return;
                }
            }
            // nothing found
            callback(error, null);
        });
    };
})();

/**
  * Error Routines
  */
function internalServerError(req, res) { // XXX Add a nicely formatted version!
  // XXX For some reason, this always returns garbage: 22 Internal Server Error.  Oh psh
  // Need to debug this!
  res.writeHead(500, {  'Content-Type': 'text/plain',
						'Content-Length': INTERNAL_SERVER_ERROR.length
                     });
  res.write(INTERNAL_SERVER_ERROR);
  // sys.log(sys.inspect(getMap, true, null)); // XXX Dump the getMap to the logs
  res.end();
}

function notFound(req, res) {
  res.writeHead(404, {  'Content-Type': 'text/plain',
						'Content-Length': NOT_FOUND_ERROR.length
                     });
  res.write(NOT_FOUND_ERROR);
  // sys.log(sys.inspect(getMap, true, null)); // XXX Dump the getMap to the logs
  res.end();
}

/**
  * JumboSocket Service Handler - Define your App Here
  */
js.get("/", js.staticHandler("index.html"));

js.get("/about", function(req, res) {
	var body = js.CONFIG['VERSION_TAG'] + ': ' + js.CONFIG['VERSION_DESCRIPTION'];
	res.writeHead(200, {
	  'Content-Length': body.length,
	  'Content-Type': 'text/plain'
	});
	res.write(body);
	res.end();
});


var io = require('socket.io').listen(server);
js.io = io; // XXX Funky, but I don't see a clean way require the io namespace inside the application wrapper.

// Setup default handler if needed
if (!js.js_handler) {
	js.js_handler = js.DEFAULT_JS_HANDLER;
}

/**
 * This is a basic handler.  XXX Clean it up.  It's messy and not clear what is the purpose.
 * For now, just use it as is.  It pongs back messages.
 *
 */
function defaultJSHandler(client) {
	// 
	// PLUG IN YOUR OWN SOCKET.IO HANDLERS HERE
	// This can be removed when you decide you want it to do something useful
	//
	console.log("*********** default listenSocketIO handler ******************");	
	client.on('message', function(data) {
		if (data) {
			sys.puts('socket client.on message data = ' + JSON.stringify(data) + '  at ' + (new Date().getTime()));
			io.sockets.send("pong - " + JSON.stringify(data));
 		} else { sys.err("empty message"); } // Ignore empty data messages
	});	
	// XXX This dies with socket.io v0.7 .  Handling of broadcast is different.
	setInterval(function() { // This could be a tweet stream, game status updates, robot messages
		sys.puts('sending something on the socket');
		if (io) { // XXX Shouldn't this exist?
			io.sockets.send("Ya'll ready for this");
		}
	}, 10000);
}

