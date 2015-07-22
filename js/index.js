// Sockets configuration 
var servidor = 'http://dannegm.pro',
    puerto = '3124';
var socket = io.connect(servidor + ':' + puerto);
// Javascript API Plugins
Array.prototype.desorder = function () {
	var m = this.length-1;
	for (var i = m; i > 1; i--) { 
		var alea = Math.floor(i * Math.random()); 
		var temp = this[i]; this[i] = this[alea]; this[alea] = temp; 
	}
}

var players = [];
var codes = {};

var config = {
	sounds: {
		enabled: true,
		volume: 0.2
	},
	iio: {
		instances: [],
		FPS: 24,
		debug: false
	},
	selectionEnabled: false,
	imgPath: 'img/',
	audioPath: 'audios/'
};
var degub = {
	enabled: false,
	logs: [],
	log: function (txt) {
		this.logs.push(txt);
		console.log(txt);
	},
	showOnDiv: function (selector) {
		for (x in this.logs) {
			$(selector).append('<p>' + this.logs[x] + '</p>');
		}
	}
};
var utils = {
	rand: function (a,b) { return Math.floor((Math.random() * b) + a); },
	round: function (n) { return Math.round( n * 100 ) / 100 },
	isOfPercent: function (entero, porcentaje) { return (entero / 100) * porcentaje; },
	isPrecentOf: function (entero, extraido) { return (extraido / entero) * 100; },
	is100pOf: function (entero, porcentaje) { return (entero * 100) / porcentaje; },
	proporcional: function (lado1, lado2, nuevoLado1) {
		v1 = (lado2 / lado1) * nuevoLado1;
		v1 = this.round(v1);
		return v1;
	},
	createSound: function (url) {
		_a = document.createElement('audio');
		_a.src = url;
		_a.volume = config.sounds.volume;
		return _a;
	}
};
var win = {
	width: 0,
	height: 0,
	init: function () {
		this.resize();
		$(window).resize(this.resize);
	},
	resize: function () {
	}
};
var sounds = {
	fondoInicio: utils.createSound(config.audioPath + 'Fondo_2.mp3'),
	fondoSeleccion: utils.createSound(config.audioPath + 'Fondo_3.mp3'),
	fondoCarrera: utils.createSound(config.audioPath + 'Fondo_3.mp3'),
	motor: utils.createSound(config.audioPath + 'motor.mp3'),
	choque: utils.createSound(config.audioPath + 'explosion_3.mp3'),
	readySetGo: utils.createSound(config.audioPath + '1-2-3_op_1.mp3'),
	seleccion: utils.createSound(config.audioPath + 'seleccion.mp3'),
	normaliza: function () {
		this.seleccion.volume = 0.9;
		this.motor.volume = 0.9;
		this.choque.volume = 0.9;
	}
}

road = (function (io) {
	config.iio.instances.push(io);
	d = config.iio.debug;
	if (d) console.info('Debugger Enabled');
	iio.Obj.prototype.nplayer = null;

	// Groups
		io.addGroup('car', 10);
		io.addGroup('car_collider', 1);
		io.addGroup('obst_collider', 1);
		io.addGroup('wall_l', 1);
		io.addGroup('wall_r', 1);

	// Updater
		var _updater = new iio.Rect(0,0,5,5)
			.enableKinematics()
			.setVel(0,2)
			.setBound('bottom', io.canvas.height, function(obj) {
				obj.pos.y = 0;
				return false;
			});
		io.addObj(_updater, -10);
		if (d) _updater.setFillStyle('#12751e');

	// Utils
		var SimpleRect = function (rect, group, debugColor) {
			var _x = (rect.w / 2) + rect.x;
			var _y = (rect.h / 2) + rect.y;
			var w = new iio.SimpleRect(_x, _y, rect.w, rect.h);
			if (d) w.setFillStyle(debugColor);
			return io.addToGroup(group, w);
		}

	// Walls
		SimpleRect ({ x: 0, y: 0, w: 123, h: 720 }, 'wall_l', 'blue');
		SimpleRect ({ x: 508, y: 0, w: 128, h: 720 }, 'wall_r', 'pink');
		SimpleRect ({ x: 636, y: 0, w: 128, h: 720 }, 'wall_l', 'blue');
		SimpleRect ({ x: 1148, y: 0, w: 132, h: 720 }, 'wall_r', 'pink');

	// Carro 1
		var carFig1 = new iio.Rect(314, 550, 128, 128).addImage(config.imgPath + 'golf_green.png', function () {
			io.addToGroup('car', carFig1);
		});
		if (d) carFig1.setStrokeStyle('green', 2);

		var carColl1 = new iio.SimpleRect(carFig1.pos.x, carFig1.pos.y, 60, 128);
		if (d) carColl1.setFillStyle('#ff0');
		io.addToGroup('car_collider', carColl1);
		carColl1.nplayer = codes.one;

	// Carro 2
		var carFig2 = new iio.Rect(962, 550, 128, 128).addImage(config.imgPath + 'golf_red.png', function () {
			io.addToGroup('car', carFig2);
		});
		if (d) carFig2.setStrokeStyle('red', 2);

		var carColl2 = new iio.SimpleRect(carFig2.pos.x, carFig2.pos.y, 60, 128);
		if (d) carColl2.setFillStyle('#ff0');
		io.addToGroup('car_collider', carColl2);
		carColl2.nplayer = codes.two;

	// Translate
		socket.on('acce', function (p) {
			switch (p.nplayer) {
				case 1:
					carColl1.pos.x -= (p.acc * 1.5);
					break;
				case 2:
					carColl2.pos.x -= (p.acc * 1.5);
					break;
			}
		});

	// Obstáculos
		var obstacle = function (_ls, _ws, _ts, _vel) {
			setInterval (function () {
				var nObstaculos = 'aceite bache mancha barrera'.split(' ');
				var figObstaculo = new Image ();
				var intObstacule = utils.rand(0,3);
				figObstaculo.src = config.imgPath + 'obstaculo_' + nObstaculos[intObstacule] + '.png';

				var rTop = iio.getRandomInt(-128, -512);
				var rLeft = iio.getRandomInt(_ls, (_ls + _ws) );

				objObstacule = new iio.SimpleRect(rLeft, rTop)
					.createWithImage(figObstaculo).enableKinematics().setVel(0, _vel)
					.setBound('bottom', io.canvas.height + 128, function (o) { return false; });

				if (d) objObstacule.setStrokeStyle('#f0f', 2);

				return io.addToGroup('obst_collider', objObstacule);
			}, _ts);
		};
		obstacle(820, 270, 3000, 10);
		obstacle(180, 270, 3000, 10);


	// Updaters
		io.setFramerate(config.iio.FPS, function () {
			carFig1.pos = carColl1.pos;
			carFig2.pos = carColl2.pos;
		});

	// Colliders
		io.setCollisionCallback('wall_l', 'car_collider', function(_wall, _carr){
			_carr.pos.x += 30;
			socket.emit('crash', players[_carr.nplayer]);
		});
		io.setCollisionCallback('wall_r', 'car_collider', function(_wall, _carr){
			_carr.pos.x -= 30;
			socket.emit('crash', players[_carr.nplayer]);
		});

		io.setCollisionCallback('obst_collider', 'car_collider', function(_obst, _carr){
			socket.emit('crash', players[_carr.nplayer]);
			sounds.choque.play();
			io.rmvObj(_obst);
		});
});

var main = {
	ready: function () {
		win.init();
		sounds.normaliza();
		if (config.sounds.enabled) sounds.fondoInicio.play();
	//	iio.start(road, 'player1_canvas');

		if (config.iio.debug) {
			$('#player1_canvas').addClass('debug');
		}
		document.onselectstart = function(){ return config.selectionEnabled; }
	},
	events: function () {
		$(document).on('click', '#start', function () {
			codes = {
				one: utils.rand(1000,8999),
				two: utils.rand(1000,8999)
			}
			socket.emit('codes', codes);

			$('#player1_code').val(codes.one);
			$('#player2_code').val(codes.two);

			$('#home').fadeOut();
			$('#seleccionar').fadeIn();

			if (config.sounds.enabled) {
				sounds.seleccion.play();
				sounds.fondoInicio.pause();
				sounds.fondoInicio.muted = true;
				sounds.fondoSeleccion.play();
			}
		});

		socket.on('entro', function (player) {
			players[player.code] = player;
			if (config.sounds.enabled) sounds.seleccion.play();

			if (typeof players[codes.one] != "undefined" && typeof players[codes.two] != "undefined") {
				$('#seleccionar').fadeOut();
				$('#game_canvas').fadeIn();

				iio.start(road, 'player1_canvas');

				if (config.sounds.enabled) {
					sounds.fondoSeleccion.pause();
					sounds.fondoSeleccion.muted = true;

					sounds.readySetGo.play();
					sounds.readySetGo.addEventListener('timeupdate', function () {
						if (sounds.readySetGo.ended) {
							sounds.fondoCarrera.play();
							sounds.motor.play();
						}
					});
				}

			}
		});
	},
	init: function () {
		$(document).ready(this.ready);
		this.events();
	}
};
main.init();