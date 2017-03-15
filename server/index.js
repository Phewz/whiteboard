var express = require('express');
var app = require('express')();
var http = require('http').Server(app);
var path = require('path');
var io = require('socket.io')(http);
static = require('node-static'); // um files zu übermitteln / vgl express.static

// files des pfades 'public' werden von dem client zur verfügung gestellt...
var publicPath = path.resolve(__dirname, '../public');

// handler fuer pfad-export, alle pfade public sind nun auf dem server erreichbar. to-do: schöner ausdrücken..
app.use(express.static(publicPath));

// konsolenhinweis, dass server läuft und auf port 3000 erreichbar ist.
http.listen(3000, function(){
  console.log('erreichbar unter port *:3000');
  });

/*-------------------------
	         CHAT
--------------------------*/

// check 'connection' event, falls getriggert: hinweis, dass nutzer sich verbunden hat. wenn geschlossen: hinweis, dass user disconnected
io.on('connection', function(socket){
  console.log('ein Nutzer hat sich verbunden');
  socket.on('disconnect', function(){
    console.log('ein Nutzer hat die Verbindung getrennt');
  });
});

// bei nachricht wird die chat nachricht des emit befehls aus chat.js empfangen und in die server console geposted
io.on('connection', function(socket){
  socket.on('chat nachricht', function(msg){
    console.log('nachricht: ' + msg);
    io.emit('chat nachricht', msg);
  });
});

/*-------------------------
	         ZEICHNEN
--------------------------*/

io.sockets.on('connection', function (socket) {

	// wenn mousemove getriggert wird, folgt broadcast
	socket.on('mousemove', function (data) {

		// event wird an alle außer den sender geschickt
		socket.broadcast.emit('moving', data);
	});
});

/*-------------------------
	         WERKZEUGE
--------------------------*/

// Pinselbreite, BUG: Änderung der Breite bei Client A ändert auch Breite bei B
// Wenn Pinsel von small auf big geändert wird, verändert sich alles bisher gezeichnete..

io.on('connection', function(socket, lineWidth){
  socket.on('kleinerPinsel', function(){
    console.log('pinsel: ' + lineWidth);
    io.emit('kleinerPinsel');
  });
  socket.on('normalerPinsel', function(){
    console.log('pinsel: ' + lineWidth);
    io.emit('normalerPinsel');
  });
  socket.on('breiterPinsel', function(){
    console.log('pinsel: ' + lineWidth);
    io.emit('breiterPinsel');
  });
});
