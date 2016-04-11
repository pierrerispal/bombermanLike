//Setup basic express server
var express = require('express'),
    app = express(),
    http = require('http'),
    server = http.createServer(app),
    io = require('socket.io')(server),
    port = process.env.PORT || 3000;

//setting the game variables
var gridX=20,
    gridY=15,
    userList = [];

//Run the server
server.listen(port, function () {
    console.log('Server listening at port %d', port);
});
//setting the route for accessing other files
app.use(express.static(__dirname + '/public'));

//NEW CONNECTION
io.on('connection', function(socket){
    console.log("new player connected");

    socket.on('connect user', function(user){
        if(user.pseudo!="" && user.pseudo!=""){
            console.log(user.pseudo+" just joined the game");
            //at this point the user only have a nickname so we need to give him new propreties
            user["color"]='red';
            posX=getRandomInt(1,gridX);
            posY=getRandomInt(1,gridY);
            user["cooX"]=posX;
            user["cooY"]=posY;
            
            socket.user = user;
            
            //the init draw the play grid
            var info = {
                gridX:gridX,
                gridY:gridY};
            socket.emit('init',info);
            
            //we send to the client all the other players
            sendAllPlayers(socket);
            
            //we send ourselve to everyone including ourselves for us to be drawn          
            io.emit('new player',user);

            //we add the player in the player list
            userList.push(socket);
        }
    });

    socket.on('disconnect', function () {
        console.log("someone just left");
        //if user is connected
        if(socket.user!=null){
            var i = userList.indexOf(socket);
        }
    });
});


//useful function to make things shorter
function sendAllPlayers(socket){
    userList.forEach(function (e,i,a) {
        socket.emit('new player', e.user);
    });
}
function getRandomInt(min,max){
    return Math.floor(Math.random()*(max-min))+min;
}