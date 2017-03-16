/*--------------------------------------
ERSTELLUNG UND LÖSCHUNG VON RÄUMEN
problem: zurück gestellt

SERVER SEITE.. buggy.. mit etwas Hilfe von P. Hilgenstock
--------------------------------------*/

io.on('connection', function(socket) {

	socket.on('raumerstellen', raumErstellen)


	function raumErstellen(name) {
		if(isValidRoomName(name) {
			rooms.push(name)
			socket.emit('raumerstellt', true) // information, dass raum OK ist
			createRoomHandler(name)
			io.sockets.emit('neuerraum', name) // information an clients, dass raum erstellt wurde (update für die raumliste)
		} else {
			socket.emit('raumerstellt', false) // information, dass raum nicht OK ist
		}

	}

	socket.emit('rooms', rooms) //information aller bestehenden räume an clients senden

	function isValidRoomName(name) {
	//test, ob raumname OK ist
	return true;
	}
})

function raumErsteller(name) {

	var room = io.of('/rooms/'+name)

	var roommember /*string[]*/ = [];
	room.on('connection' function(socket) {

		socket.on('authenticate', onAuthenticate);
		var name
		function onAuthenticate(data) {
			//check, dass name nicht schon vergeben wurde
			socket.brodcast.emit('neuerclient', data.name) // information, dass neuer client beigetreten ist
			socket.emit('member', roommember) // neuem client die bestehenden clients im raum mitteilen
			roommember.push(data.name)
			name = data.name
			socket.on('disconnect', onDisconnect)
			socket.on('message', handleMessage)
		})

		function onDisconnect() {
			//name wird immer einen WErt haben, da der user schon einmal authentifiziert wurde wenn diese funktion ausgeführt wird
			roommember.splice(roommember.indexOf(name),1 ) //client von liste entfernen
			if(roommember.length ==0) {
				//funktion, dass raum gelöscht wird
			}
		}
		socket.broadcast.emit('clientdisconnected', name)
	})


}
