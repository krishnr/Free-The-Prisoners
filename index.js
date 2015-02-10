var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = 3000; // port can be changed if necessary

app.use(express.static(__dirname + '/public'));

// Setting up jade as the view engine
app.set('views', __dirname + '/views');
app.set('view engine', "jade");
app.engine('jade', require('jade').__express);

// To keep track of number of user connections
// MAX: 1 input and 4 prisoners (for this problem)
var users = {
  'input': 0,
  'prisoners': 0
};

// to record to order of button presses as given by the voice inputter
var order = [];

// Array of prisoner socket ids
// Each prisoner's socket id acts as a default room for that prisoner indentified by the socket ID
// Source: http://socket.io/docs/rooms-and-namespaces/#default-room
// Emitting data to a specific prisoner is as easy as emitting it to their socket ID which is stored in this array
var prisoners = [];

// loads home page
app.get('/', function(req, res){
  res.render('index');
});

// loads a maximum of 1 voice input page
app.get('/input', function(req, res){
  if(users['input'] < 1) {
    res.render('input');
  } else {
    res.send("<h1>There is already a voice inputter!</h1>");
  }
})

// loads a maximum of 4 prisoner pages
app.get('/prisoner', function(req, res){
  if(users['prisoners'] < 4) {
    res.render('prisoner', {prisonerNumber: users['prisoners']+1});
  } else {
    res.send("<h1>There are already 4 prisoners!</h1>")
  }
});

// Socket connection with voice inputter
var input_socket = io.of('/input').on('connection', function(socket){
  users['input']++;
  console.log("Input user connected");
  socket.on('disconnect', function(){
      users['input']--;
      console.log("Input user disconnected");
  })

  // Receives the voice input from the client and sends off the first instruction to the appropriate prisoner
  socket.on('voice-input', function(input){
    order = input;
    console.log("Order left to press: " + order);
    io.of('/prisoner').to(prisoners[order[0]-1]).emit('message', 'Press your button');
  })
});

// Socket connection with the prisoners
var prisoner_socket = io.of('/prisoner').on('connection', function(socket){
  prisoners.push(socket.id);
  users['prisoners']++;
  console.log("Prisoner " + users['prisoners'] + " connected");

  socket.on('disconnect', function(){
    console.log("Prisoner " + users['prisoners'] + " disconnected");
    users['prisoners']--;
  })

  // After receiving button press from prisoner
  socket.on('button-press', function(id) {
    
    // If all instructions are executed, don't do anything
    if(order.length == 0) { return; }

    console.log("Order left to press: " + order);
    console.log("Button Pressed: " + (prisoners.indexOf(id)+1));

    // if the prisoner who pressed the button matches the instruction order
    if(id == prisoners[order[0]-1]){
      // pop the first element of the order array
      order.shift();

      // Reset the #message div of all prisoners
      io.of('/prisoner').emit('message', '');

      // notify the next prisoner to press his button
      io.of('/prisoner').to(prisoners[order[0]-1]).emit('message', 'Press your button');

      // if there are no instructions left, output a congratulation message to the prisoners
      // and a "Free them!" to the console
      if(order.length == 0) {
        console.log('Free them!');
        io.of('/prisoner').emit('message', 'Congratulations, you are free to go!');
      }
    } else {
      // else if prisoner who pressed the button did NOT match the instruction order

      // output evil message with maniacal laughter
      io.of('/prisoner').emit('message', 'You are trapped here forever mwahaha!');
      console.log("Wrong button pressed. The prisoners remain trapped!");
      
      // Set order length to 0, so that button presses don't do anything
      order.length = 0;
    }
  })
});

// Notify the console when the node server spins up
http.listen(port, function(){
  console.log("You're all set! Head to http://localhost:" + port + " on Chrome.");
});