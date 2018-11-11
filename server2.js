const express = require("express");
const path = require("path");
const app = express();
var server = require('http').Server(app);
var io = require('socket.io').listen(server);

//configuraciones

// archivos estaticos, archivo de nuestros codigos
app.use(express.static(path.join(__dirname, 'public')));

// middlewares
app.get('/', function (request, response){
  response.sendFile(path.resolve(__dirname, 'public/inicio.html'));
});

//iniciador de servidor
server.listen(process.env.PORT || 8000,function(){
    console.log('Listening on '+server.address().port);
});

//sockets
server.lastPlayderID = 0;

io.on('connection', function(socket){
	socket.on('chat message', function(msg, name){
		console.log('message: ' + msg);
		io.emit('chat message', msg, name);
	});
});
