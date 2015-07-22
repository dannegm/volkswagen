(function (window) {

// Sockets configuration 
var servidor = 'http://dannegm.pro',
    puerto = '3124';
var socket = io.connect(servidor + ':' + puerto);
// Javascript API Plugins
Array.prototype.desorder = function() {
    var m = this.length - 1;
    for (var i = m; i > 1; i--) {
        var alea = Math.floor(i * Math.random());
        var temp = this[i];
        this[i] = this[alea];
        this[alea] = temp;
    }
}
// jQuery plugins
jQuery.fn.mousehold = function(timeout, f) {
    if (timeout && typeof timeout == 'function') {
        f = timeout;
        timeout = 100;
    }
    if (f && typeof f == 'function') {
        var timer = 0;
        var fireStep = 0;
        return this.each(function() {
            jQuery(this).mousedown(function() {
                fireStep = 1;
                var ctr = 0;
                var t = this;
                timer = setInterval(function() {
                    ctr++;
                    f.call(t, ctr);
                    fireStep = 2;
                }, timeout);
            })
 
            clearMousehold = function() {
                clearInterval(timer);
                if (fireStep == 1) f.call(this, 1);
                fireStep = 0;
            }
 
            jQuery(this).mouseout(clearMousehold);
            jQuery(this).mouseup(clearMousehold);
        })
    }
}
 
var player;
var config = {
    selectionEnabled: false
};
var degub = {
    enabled: false,
    logs: [],
    log: function(txt) {
        this.logs.push(txt);
        console.log(txt);
    },
    showOnDiv: function(selector) {
        for (x in this.logs) {
            $(selector).append('<p>' + this.logs[x] + '</p>');
        }
    }
};
var utils = {
    rand: function(a, b) {
        return Math.floor((Math.random() * b) + a);
    },
    round: function(n) {
        return Math.round(n * 100) / 100
    },
    isOfPercent: function(entero, porcentaje) {
        return (entero / 100) * porcentaje;
    },
    isPrecentOf: function(entero, extraido) {
        return (extraido / entero) * 100;
    },
    is100pOf: function(entero, porcentaje) {
        return (entero * 100) / porcentaje;
    },
    proporcional: function(lado1, lado2, nuevoLado1) {
        v1 = (lado2 / lado1) * nuevoLado1;
        v1 = this.round(v1);
        return v1;
    }
};
var win = {
    width: 0,
    height: 0,
    init: function() {
        this.resize();
        $(window).resize(this.resize);
    },
    resize: function() {}
};
var myCar;
 
var main = {
    ready: function() {
        win.init();
        document.onselectstart = function() {
            return config.selectionEnabled;
        }
    },
    events: function() {
        $(document).on('click', '#asosciar', function() {
            var code = $('#code').val();
            socket.emit('asocia', code);
        });
        $(document).on('keypress', function(e) {
            if (e.keyCode == 13) {
                var code = $('#code').val();
                socket.emit('asocia', code);
            }
        })
 
        socket.on('entro', function(p) {
            console.log(p);
            
            if ('vibrate' in navigator) {
                navigator.vibrate([200]);
            }
            
            $('#player_n').text('JUGADOR ' + p.nplayer);
            player = p;
 
            $('#input_code').hide();
            $('#mando').show();
       
            
 
            var accX, accY;
            window.ondevicemotion = function(event) {
                accX = Math.round(event.accelerationIncludingGravity.x * 10) / 10;
                accY = Math.round(event.accelerationIncludingGravity.y * 10) / 10;
                player.acc = accY;
 
                socket.emit('acce', player);
 
            }
        });
        socket.on('error', function(e) {
            switch (e.code) {
                case 1:
                    alert('Código inválido');
                    break;
                case 2:
                    alert(e.description);
                    break;
            }
        });
        socket.on('crash', function(p) {
            if ('vibrate' in navigator) {
                navigator.vibrate([100]);
            }
            console.log("Crash Player #" + p.nplayer);
 
            $('#border').addClass('move');
            setTimeout(function() {
                $('#border').removeClass('move');
            }, 200);
        });
    },
    init: function() {
        $(document).ready(this.ready);
        this.events();
    }
};
main.init();

})(window)