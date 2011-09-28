/**
#Created by David J. Kordsmeier on 2011-01-30.
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

/* 
 * ccn4bnode-client.js
 * 
 * Setup all handlers specific to the CCN4BNODE.js demo
 * 
 **/

// Randomly add a data point every 500ms
var random = new TimeSeries();
setInterval(function() {
  random.append(new Date().getTime(), Math.random() * 10000);
}, 500);

function createTimeline() {
  var chart = new SmoothieChart();
  chart.addTimeSeries(random, { strokeStyle: 'rgba(0, 255, 0, 1)', fillStyle: 'rgba(0, 255, 0, 0.2)', lineWidth: 4 });
  chart.streamTo(document.getElementById("chart"), 500);
}

$(document).ready(function() {
	pingStatusInterval(); // Check if ccnd is alive every so often
	statsInterval(); // Check ccnd status every so often
	rssInterval(); // Check server memory every so often
	dumpnamesInterval(); // Get dump of names every so often
	// XXX Why doesn't this work here :( 
	// createTimeline(); // Create a fake chart 
	
	$('#ccn_stop').click(function() {
		console.log('ccn_stop');
		$('#ccn_stop').attr('disabled', 'true').removeClass('primary');
		$.ajax({
			url: '/ccnd/stop',
			dataType: 'json',
			data: {},
			cache: false,
			success: function() {
				// XXX Should set a status message
			},
			error: handleError
		});
		return false;
	});
	$('#ccn_start').click(function() {
		console.log('ccn_start');
		$('#ccn_start').attr('disabled', 'true').removeClass('primary');
		$.ajax({
			url: '/ccnd/start',
			dataType: 'json',
			data: {},
			cache: false,
			success: function() {
				// XXX Should set a status message
			},
			error: handleError
		});
		return false;
	});
	$('#ccn_restart').click(function() {
		console.log('ccn_restart');
		alert('Not Implemented');
		return false;
	});
	
	$('#ccnr_stop').click(function() {
		console.log('ccnr_stop');
		$('#ccnr_stop').attr('disabled', 'true').removeClass('primary');
		$('#ccnr_start').removeAttr('disabled').addClass('primary');
		$.ajax({
			url: '/ccnr/stop',
			dataType: 'json',
			data: {},
			cache: false,
			success: function() {
				// XXX Should set a status message
			},
			error: handleError
		});
		return false;
	});
	$('#ccnr_start').click(function() {
		console.log('ccnr_start');
		$('#ccnr_start').attr('disabled', 'true').removeClass('primary');
		$('#ccnr_stop').removeAttr('disabled').addClass('primary');
		$.ajax({
			url: '/ccnr/start',
			dataType: 'json',
			data: {},
			cache: false,
			success: function() {
				// XXX Should set a status message
			},
			error: handleError
		});
		return false;
	});
	$('#ccnr_restart').click(function() {
		console.log('ccnr_restart');
		alert('Not Implemented');
		return false;
	});
});

function pingStatusInterval() {
	setInterval(function() {
		$.ajax({
			url: '/pingstatus',
			dataType: 'json',
			data: {},
			cache: false,
			success: pingStatusHandler,
			error: handleError
		});
	}, 10000);
}

function rssInterval() {
	setInterval(function() {
		$.ajax({
			url: '/ccnd/rss',
			dataType: 'json',
			data: {},
			cache: false,
			success: function(data) {
				var results = data['results'];
				$('#rss').text('rss:' + Math.round((results.rss/(1024*1024))*10)/10 + 'mb, vsize:' + Math.round((results.vsize/(1024*1024))*10)/10 + 'mb, heapTotal:' + Math.round((results.heapTotal/(1024*1024))*10)/10 + 'mb, heapUsed:' + Math.round((results.heapUsed/(1024*1024))*10)/10);
			},
			error: handleError
		});
	}, 10000);
}

function dumpnamesInterval() {
	setInterval(function() {
		$.ajax({
			url: '/ccnd/dumpnames',
			dataType: 'json',
			data: {},
			cache: false,
			success: function(data) {
				var results = data['results'];
				$('#dumpofnames').text('* ' + results); // XXX This doesn't show up without some leading text
			},
			error: handleError
		});
	}, 15000);
}

function statsInterval() {
	setInterval(function() {
		$.ajax({
			url: '/ccnd/stats',
			dataType: 'json',
			data: {},
			cache: false,
			success: function(data) {
				var results = data['results'];
				// $('#ccnd_status').text('<p>' + data['results']);
				for (var i = 0; i < 19; i++) { // XXX Hardcode the max table size, bad, fix this, and pretty up the formatting
					if (results[i]) { 
						$('#status-' + i).text(results[i]);
					} else {
						$('#status-' + i).text(''); // Empty out the field if there is nothing there.
					}
				}
			},
			error: handleError
		});
	}, 10000);
}

function pingStatusHandler(data) {
	if (data) {
		if (data.status) {
			switch(data.status) {
				case 'stopped': {
					$('#ccn_start').removeAttr('disabled').addClass('primary');
					$('#ccn_stop').attr('disabled', 'true').removeClass('primary');
					$('#ccn_restart').attr('disabled', 'true');
					break;
				} 
				case 'started': {
					$('#ccn_start').attr('disabled', 'true').removeClass('primary');
					$('#ccn_stop').removeAttr('disabled').addClass('primary');
					$('#ccn_restart').removeAttr('disabled');
					break;
				}
				case 'stopping': {
					$('#ccn_start').removeAttr('disabled').addClass('primary');
					$('#ccn_stop').attr('disabled', 'true').removeClass('primary');
					$('#ccn_restart').attr('disabled', 'true');
					break;
				}
				case 'starting': {
					$('#ccn_start').attr('disabled', 'true').removeClass('primary');
					$('#ccn_stop').removeAttr('disabled').addClass('primary');
					$('#ccn_restart').attr('disabled', 'true');
					break;
				}
				case 'restart': {
					$('#ccn_start').attr('disabled', 'true');
					$('#ccn_stop').removeAttr('disabled');
					$('#ccn_restart').attr('disabled', 'true');
					break;
				}
				default: {
					console.log('Status Unknown');
				}
			}
		}
	} else {
		
	}
}



function handleError(jqXHR, textStatus, errorThrown) {
	// XXX Implement?
}
