/*---------------------------------------------------------------------
ZEICHNEN AUF CANVAS, WELCHES IN ECHTZEIT MIT TEILNEHMERN GETEILT WIRD.
client seite
---------------------------------------------------------------------*/

$(function(){

  var url = 'http://localhost:3000';
  var socket = io.connect(url);
  var teilnehmer = {};
  var zeiger = {};

  var dokument = $(document),
  fenster = $(window),
  canvas = $('#zeichenflaeche'),
  // zweidimensionalen rendering context erstellen
  ctx = canvas[0].getContext('2d'),
  anleitung = $('#anleitung');

  // jQuery für $.now() Funktion, die die anzahl der ms seit epoch/unixzeit zurück gibt. (1. Januar 1970, 00:00 utc, ohne schaltsec)
  var id = Math.round($.now()*Math.random());
  // check ob gerade gezeichnet wird
  var zeichnen = false;
  var farbe = "";

  // HILFSLINIEN UND LINEALE AUSBLENDEN
  horizontalehilfslinie = $('#horizontale-hilfslinie');
  vertikalehilfslinie = $('#vertikale-hilfslinie');

  horizontalehilfslinie.fadeOut();
  vertikalehilfslinie.fadeOut();
  $('#lineal-h').fadeOut();
  $('#lineal-v').fadeOut();

  /* ------------------------------------------------------------------
  ZEICHENFUNKTION,
  erstellen von zeigern wenn client online kommt, bewegung des zeigers,
  check ob gezeichnet wird und speichern des aktuellen zustandes
  --------------------------------------------------------------------*/

  socket.on('moving', function (data) {

    if(! (data.id in teilnehmer)){
      // erstellung des zeigers für client, der online kommt
      zeiger[data.id] = $('<div class="zeiger">').appendTo('#zeiger');
    }

    // zeigerbewegung, zeiger css wird bearbeitet
    zeiger[data.id].css({
      'left' : data.x,
      'top' : data.y
    });
    // check ob gezeichnet wird
    if(data.zeichnen && teilnehmer[data.id]){
      // linie auf canvas zeichnen. teilnehmer[data.id] enthält vorherige position des zeigers
      drawLine(teilnehmer[data.id].x, teilnehmer[data.id].y, data.x, data.y);
    }

    // aktuellen zustand in data speichern
    teilnehmer[data.id] = data;
    teilnehmer[data.id].updated = $.now();
  });

  var prev = {};

  canvas.on('mousedown',function(e){
    e.preventDefault();
    zeichnen = true;
    prev.x = e.pageX;
    prev.y = e.pageY;
    anleitung.fadeOut();
  });

  dokument.bind('mouseup mouseleave',function(){
    zeichnen = false;
  });
  var lastEmit = $.now();

  dokument.on('mousemove',function(e){
    if($.now() - lastEmit > 30){
      socket.emit('mousemove',{
        'x': e.pageX,
        'y': e.pageY,
        'zeichnen': zeichnen,
        'id': id
        // farben, groesse, buggy
      });
      lastEmit = $.now();
    }

    if(zeichnen){
      drawLine(prev.x, prev.y, e.pageX, e.pageY);
      prev.x = e.pageX;
      prev.y = e.pageY;
    }
  });

  // zeiger der clients nach 5 sekunden inaktivität entfernen, dass das fenster nicht mit zeigern zugemüllt wird
  // + zähler der aktiven nutzer
  setInterval(function(){
    var aktiveNutzer = 0;
    for(ident in teilnehmer){
      if($.now() - teilnehmer[ident].updated > 5000){
        zeiger[ident].remove();
        delete teilnehmer[ident];
        delete zeiger[ident];
      }
      else aktiveNutzer++;
    }
    // anzeige aktiver Nutzer
    $('#aktiveNutzer').html('Aktive Nutzer: ' + aktiveNutzer);
  },5000);

  function drawLine(fromx, fromy, tox, toy){
    ctx.moveTo(fromx, fromy);
    ctx.lineTo(tox, toy);
    ctx.stroke();
  }

  /* -----------------------------
  WERKZEUGE
  -------------------------------*/

  ctx.lineCap = 'round';
  ctx.lineJoin = 'round'; // 'mitter' für kanten
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#000000'; // Schwarz

  // Breite des Pinsels
  var lineWidthSmall = 1;
  var lineWidthNormal = 3;
  var lineWidthBig = 10;

  // Pinselbreite auswählen
  document.getElementById ("kleinerPinsel").addEventListener ("click", kleinerPinsel, false);
  document.getElementById ("normalerPinsel").addEventListener ("click", normalerPinsel, false);
  document.getElementById ("breiterPinsel").addEventListener ("click", breiterPinsel, false);

  function kleinerPinsel(){
    ctx.lineWidth = lineWidthSmall;
    ctx.beginPath();
    socket.emit('kleinerPinsel', {lineWidthSmall});     // Pinselbreite an Server senden
  }
  socket.on('kleinerPinsel', function(){
    ctx.beginPath();
    ctx.lineWidth = lineWidthSmall;
  });

  function normalerPinsel(){
    ctx.lineWidth = lineWidthNormal;
    ctx.beginPath();
    socket.emit('normalerPinsel', {lineWidthNormal});
  }
  socket.on('normalerPinsel', function(){
    ctx.beginPath();
    ctx.lineWidth = lineWidthNormal;
  });

  function breiterPinsel(){
    ctx.lineWidth = lineWidthBig;
    ctx.beginPath();
    socket.emit('breiterPinsel', {lineWidthBig});
  }
  socket.on('breiterPinsel', function(){
    ctx.beginPath();
    ctx.lineWidth = lineWidthBig;
  });

  /* -----------------------------------------------
  RADIERGUMMI + FARBEN
  Canvas Reset
  BUG: wird wiederhergestellt / synced durch server -- fixed
  Farben fix ggf. mit data.farbe?
  -------------------------------------------------*/

  document.getElementById ("reset").addEventListener ("click", resetClear);

  function resetClear(){
    console.log('ausgeführt');
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.beginPath();
  }

  var weisseFarbe = '#FFFFFF';
  var schwarzeFarbe = '#000000';
  var roteFarbe = '#FF0000';
  var blaueFarbe = '#0000FF';
  var grueneFarbe = '#00FF00';

  document.getElementById ("radiergummi").addEventListener ("click", radierGummi);

  function radierGummi(){
    ctx.strokeStyle = weisseFarbe;
    ctx.beginPath();
    socket.emit('radierGummi', data);
  }
  socket.on('radierGummi', function(){
    ctx.strokeStyle = weisseFarbe;
    ctx.beginPath();
  });

  // schwarz
  document.getElementById ("schwarz").addEventListener ("click", schwarzeFarbe);

  function schwarzeFarbe(){
    ctx.strokeStyle = schwarzeFarbe;
    ctx.beginPath();
  }

  // rot
  document.getElementById ("rot").addEventListener ("click", roteFarbe);

  function roteFarbe(){
    ctx.closePath();
    ctx.strokeStyle = roteFarbe;
    ctx.beginPath();
  }

  // blau
  document.getElementById ("blau").addEventListener ("click", blaueFarbe);

  function blaueFarbe(){
    ctx.closePath();
    ctx.strokeStyle = blaueFarbe;
    ctx.beginPath();
  }

  // gruen
  document.getElementById ("gruen").addEventListener ("click", grueneFarbe);

  function grueneFarbe(){
    ctx.closePath();
    ctx.strokeStyle = grueneFarbe;
    ctx.beginPath();
  }

  /* -----------------------------------------------
  HILFSLINIEN
  -------------------------------------------------*/
  document.getElementById ("hilfslinie-on").addEventListener ("click", hilfslinieOn);
  document.getElementById ("hilfslinie-off").addEventListener ("click", hilfslinieOff);

  function hilfslinieOn() {
    horizontalehilfslinie.fadeIn();
    vertikalehilfslinie.fadeIn();
  }

  function hilfslinieOff() {
    horizontalehilfslinie.fadeOut();
    vertikalehilfslinie.fadeOut();
  }

  /* -----------------------------------------------
  LINEALE
  -------------------------------------------------*/
  document.getElementById ("lineal-on").addEventListener ("click", linealOn);
  document.getElementById ("lineal-off").addEventListener ("click", linealOff);

  function linealOff() {
    $('#lineal-h').fadeOut();
    $('#lineal-v').fadeOut();
  }

  function linealOn() {
    $('#lineal-h').fadeIn();
    $('#lineal-v').fadeIn();
  }

  /* -----------------------------------------------
  KREIS + RECHTECK
  BUG...
  -------------------------------------------------*/

  function kreisZeichnen(centerX, centerY, radius){
    var centerX = canvas.width / 2;
    var centerY = canvas.height / 2;
    var radius = 70;
    ctx.beginPath();
    ctx.arc(centerX,centerY,radius,0,2*Math.PI);
    ctx.stroke();
  }

  function rechteckZeichnen(){
    ctx.beginPath();
    ctx.rect(150, 150, 150, 150);
    ctx.fill();
    ctx.lineWidth = 7;
    ctx.stroke();
  }

});
