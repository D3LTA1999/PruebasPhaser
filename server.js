const express = require("express");
const path = require("path");
const app = express();
var server = require('http').Server(app);
var io = require('socket.io').listen(server);
//configuraciones
// archivos estaticos, archivo de nuestros codigos
app.use(express.static(path.join(__dirname, 'public')));
// middlewares
app.get('/', function(request, response) {
    response.sendFile(path.resolve(__dirname, 'public/inicio.html'));
});
//iniciador de servidor
server.listen(process.env.PORT || 8000, function() {
    console.log('Listening on ' + server.address().port);
});
//sockets
var jugadores = new Array();
io.on('connection', function(socket) {
    console.log('usuario conectado: ', socket.id);
    // creado nuevo jugador dentro del array jugadores
    jugadores.push({
        x: 0,
        y: 0,
        playerId: socket.id
    });
    socket.emit('Jugadores_conectados', jugadores);
    socket.broadcast.emit('nuevojugador', jugadores[jugadores.length - 1]);
    socket.on('disconnect', function() {
        console.log('usuario disconnected: ', socket.id);
        for (var i = 0; i < jugadores.length; i++) {
            if (jugadores[i].playerId === socket.id) {
                jugadores.splice(i, 1);
            }
        }
        io.emit('disconnect', socket.id);
    });
    socket.on('MovimientoDeJugador', function(detalles) {
        for (var i = 0; i < jugadores.length; i++) {
            if (jugadores[i].playerId === socket.id) {
                jugadores[i].x = detalles.x;
                jugadores[i].y = detalles.y;
                // informa a los demás jugadores que el jugador se ha movido
                socket.broadcast.emit('jugador_movido', jugadores[i]);
            }
        }
    });
});
