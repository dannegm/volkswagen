var servidor = require('socket.io').listen(3124);
	servidor.set('log level', 0);

var Players = [];
var SpeedControl = {};
var idconnection = null;


servidor.sockets.on('connection', function(socket) {
	idconnection = socket.id;
	console.log(idconnection);

	socket.on('disconnect', function () {});
	socket.on('codes', function (codes) {
		Players[codes.one.toString()] = {
			code: codes.uno,
			sceneID: socket.id,
			nplayer: 1,
			mandoID: null,
			acc: 0,
			car: {
				turnLeft: false,
				turnRight: false,
				run: false,
			}
		};
		Players[codes.two.toString()] = {
			code: codes.dos,
			sceneID: socket.id,
			nplayer: 2,
			mandoID: null,
			acc: 0,
			car: {

			}
		};
		console.log(codes);
	});

	socket.on('asocia', function (code) {
		if (typeof Players[code] != "undefined") {
			if (Players[code].mandoID == null) {
				Players[code].code = code;
				Players[code].mandoID = socket.id;
				servidor.sockets.socket(Players[code].sceneID).emit('entro', Players[code]);
				servidor.sockets.socket(Players[code].mandoID).emit('entro', Players[code]);

				console.log(Players[code]);
			} else {
				servidor.sockets.socket(socket.id).emit('error', {code: 2, description: 'El código ya está asociado a un usuario'});
			}
		} else {
			servidor.sockets.socket(socket.id).emit('error', {code: 1, description: 'El código no existe'});
		}
	});

	socket.on('acce', function (p) {
		servidor.sockets.socket(p.sceneID).emit('acce', p);
		console.log(p);
	});

	socket.on('crash', function (p) {
		servidor.sockets.socket(p.mandoID).emit('crash', p);
		console.log("Crash Player #" + p.nplayer);
	});
});