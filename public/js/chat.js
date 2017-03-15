/*----------------------------
CHAT ZWISCHEN DEN TEILNEHMERN
BUG NAME
-----------------------------*/

$(function () {
  // io() erstellt neuen client für server, user connected und wird erkannt
  var socket = io();
  // timestamps für chat
  var datum = new Date();
  var timestamp = datum.toString();
  var name = "name";

  // Namen durch eingabe importieren, to-do/bugfix: an server senden und clients syncen
  $('nameinput').submit(function(){
    name = document.getElementById("nameinput").value;
  });

  $('form').submit(function(){
    socket.emit('chat nachricht', $('#n').val());
    $('#n').val('');
    return false;
   });
    socket.on('chat nachricht', function(msg){
      // to do für weiterentwicklung: html einschränken, nur plain text senden. sicherheit!
      $('#nachrichten').append($('<li>').html("<strong>" + msg + "</strong>" + "<small>     - Nachricht gesendet am: " + timestamp + "</small>"));
    });
  });
