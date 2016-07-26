var ipaddress = "0.0.0.0";
var port      = 8080;

var WebSocket = require('ws');
var WebSocketServer = WebSocket.Server;
var http = require('http');

var packages = [
  {
    pkgId: '0520 - ColdFire Parts',
    fromAddress: '100 Central Avenue, Orlando, FL',
    toAddress: 'Orlando International Airport',
    eta: Date.now() + (Math.random() * (1000 * 60 * 60 * 24 * 3))
  },
  {
    pkgId: '1000 - Ex. Corp',
    fromAddress: '648 W Field Rd, San Francisco, CA 94128',
    toAddress: '933 Jackson St, San Francisco, CA 94133',
    eta: Date.now() + (Math.random() * (1000 * 60 * 60 * 24 * 3))
  },
  {
    pkgId: '2000 - Red Hat Inc.',
    fromAddress: '1220 International Dr, Raleigh, NC 27623',
    toAddress: '100 E Davie St, Raleigh, NC 27601',
    eta: Date.now() + (Math.random() * (1000 * 60 * 60 * 24 * 3))
  },
  {
    pkgId: 'Island Exports',
    fromAddress: '50 Elliott St, Honolulu, HI 86818',
    toAddress: '98 - 1005 Moanalua Rd, Aiea, HI 96701',
    eta: Date.now() + (Math.random() * (1000 * 60 * 60 * 24 * 3))
  },
  {
    pkgId: 'NASA',
    fromAddress: 'Titusville, FL',
    toAddress: 'Washington, D.C.',
    eta: Date.now() + (Math.random() * (1000 * 60 * 60 * 24 * 3))
  },
  {
    pkgId: 'Deutsche Bank GmbH',
    fromAddress: 'Darmstadt, DE',
    toAddress: 'Frankfurt International Airport',
    eta: Date.now() + (Math.random() * (1000 * 60 * 60 * 24 * 3))
  },
  {
    pkgId: 'Honda Parts',
    fromAddress: 'Yokohama, Japan',
    toAddress: 'Narita International Airport',
    eta: Date.now() + (Math.random() * (1000 * 60 * 60 * 24 * 3))
  },
  {
    pkgId: 'Toys R Us',
    fromAddress: 'Skokie, IL',
    toAddress: 'Chicago, IL',
    eta: Date.now() + (Math.random() * (1000 * 60 * 60 * 24 * 3))
  },
  {
    pkgId: 'Rush Fan Club',
    fromAddress: 'Toronto, ON, Canada',
    toAddress: 'Pittsburgh, PA',
    eta: Date.now() + (Math.random() * (1000 * 60 * 60 * 24 * 3))
  },

]

var server = http.createServer(function(request, response) {
  console.log((new Date()) + ' Received request for ' + request.url);
  response.writeHead(200, {'Content-Type': 'text/plain'});
  response.write("Welcome to Node.js on OpenShift!\n\n");
  response.end("Thanks for visiting us! \n");
});

server.listen( port, ipaddress, function() {
  console.log((new Date()) + ' Server is listening on port ' + port);
});

function getConfigObj() {
  return packages;
}

function getDataObj(pkgId) {

  var temp = 72 + Math.random() * 6;
  var humidity = .50 + Math.random() * .1;
  var displacement = (Math.random() * 4) - 2;
  var lat = (Math.random() * 360) - 180;
  var lng = (Math.random() * 180) - 90;
  var timestamp = parseInt(Math.floor(new Date().getTime() / 1000));

  if (Math.random() > .90 && pkgId == "Deutsche Bank GmbH") temp += 20;
  if (Math.random() > .95 && pkgId == "Deutsche Bank GmbH") humidity += .3;
  if (Math.random() > .95 && pkgId == "Deutsche Bank GmbH") displacement += 20;

  return {
    pkgId: pkgId,
    timestamp: timestamp,
    temperature: temp,
    humidity: humidity,
    position: {
      lat: lat,
      lng: lng,
      progress: Math.random()
    },
    displacement: displacement
  };

}

function sendStream(ws) {
  if (ws.readyState == WebSocket.CLOSING || ws.readyState == WebSocket.CLOSED) {
    console.log("stream closed");
    return;
  }

  if (ws.readyState == WebSocket.OPEN) {
    packages.forEach(function(package) {
      ws.send(JSON.stringify(getDataObj(package.pkgId)));
    });
  }

  setTimeout(function () {
    sendStream(ws);
  }, 2000 + (Math.floor(Math.random() * 1000)));

}

function sendConfigStream(ws) {
  if (ws.readyState == WebSocket.CLOSING || ws.readyState == WebSocket.CLOSED) {
    console.log("config stream closed");
    return;
  }

  if (ws.readyState == WebSocket.OPEN) {
    ws.send(JSON.stringify(getConfigObj()));
  }

  setTimeout(function () {
    sendConfigStream(ws);
  }, 10000);

}

new WebSocketServer({
  server: server,
  path: "/stream",
  autoAcceptConnections: false
}).on('connection', function(ws) {
  console.log("New connection, sending stream");
  sendStream(ws);
});

new WebSocketServer({
  server: server,
  path: "/config",
  autoAcceptConnections: false
}).on('connection', function(ws) {
  console.log("New config connection, sending config stream");
  sendConfigStream(ws);
});



console.log("Listening to " + ipaddress + ":" + port + "...");


