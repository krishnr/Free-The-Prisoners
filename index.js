var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = 3000;

app.use(express.static(__dirname + '/public'));

app.set('views', __dirname + '/views');
app.set('view engine', "jade");
app.engine('jade', require('jade').__express);

// To keep track of user connections
var users = {
  'input': 0,
  'prisoners': 0
};

var order = [];

// Array of prisoner socket ids
var prisoners = [];

app.get('/', function(req, res){
  res.render('index');
});

app.get('/input', function(req, res){
  if(users['input'] < 1) {
    res.render('input');
  } else {
    res.send("<h1>There is already a voice inputter!</h1>");
  }
})

app.get('/prisoner', function(req, res){
  if(users['prisoners'] < 4) {
    res.render('prisoner', {prisonerNumber: users['prisoners']+1});
  } else {
    res.send("<h1>There are already 4 prisoners!</h1>")
  }
});

var input_socket = io.of('/input').on('connection', function(socket){
  users['input']++;
  console.log("Input user connected");
  socket.on('disconnect', function(){
      users['input']--;
      console.log("Input user disconnected");
  })

  socket.on('voice-input', function(input){
    order = input;
    console.log("Order left to press: " + order);
    io.of('/prisoner').to(prisoners[order[0]-1]).emit('message', 'Press your button');
  })
});

var prisoner_socket = io.of('/prisoner').on('connection', function(socket){
  prisoners.push(socket.id);
  users['prisoners']++;
  console.log("Prisoner " + users['prisoners'] + " connected");

  socket.on('disconnect', function(){
    console.log("Prisoner " + users['prisoners'] + " disconnected");
    users['prisoners']--;
  })

  socket.on('button-press', function(id) {
    
    if(order.length == 0) { return; }

    console.log("Order left to press: " + order);
    console.log("Button Pressed: " + (prisoners.indexOf(id)+1));

    if(id == prisoners[order[0]-1]){
      order.shift();

      io.of('/prisoner').emit('message', '');
      io.of('/prisoner').to(prisoners[order[0]-1]).emit('message', 'Press your button');
      if(order.length == 0) {
        console.log('Free them!');
        io.of('/prisoner').emit('message', 'Congratulations, you are free to go!');
      }
    } else {
      io.of('/prisoner').emit('message', 'You are trapped here forever mwahaha!');
      console.log("Wrong button pressed. The prisoners remain trapped!");
      order.length = 0;
    }
  })
});


http.listen(port, function(){
  console.log("You now rockin' with the best");
});