//Setup basic express server
var express = require('express'),
    app = express(),
    http = require('http'),
    server = http.createServer(app),
    io = require('socket.io')(server),
    port = process.env.PORT || 8080;

//setting the game variables
var gridX=25,
    gridY=13,
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
            var textures = [
                'char1',
                'char2',
                'char3',
                'char4',
                'char5'
            ];
            
            var posX=2;
            var posY=2;
            while(posX%2==0 && posY%2==0){
                posX=getRandomInt(1,gridX);
                posY=getRandomInt(1,gridY);
            }
            
            texture=getRandomInt(0,textures.length);
            user["cooX"]=posX;
            user["cooY"]=posY;
            user["char"]=textures[texture];
            socket.user = user;
            console.log(texture+" - "+user.char);
            //the init draw the play grid
            var info = {
                gridX:gridX,
                gridY:gridY,
                user:socket.user};
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
            userList.splice(i, 1);
            
            io.emit('disconnect user',socket.user);
        }
    });
    
    socket.on('move', function (user) {
        
        //We do a first test for out of bounds, if its okey, we tell everyone the player moved
        //if(user.cooX<=gridX && user.cooX>0 &&user.cooY<=gridY && user.cooY>0){
            //console.log(user.pseudo+" just moved from "+user.oldX+"-"+user.oldY+" to "+user.cooX+"-"+user.cooY);
            var i = userList.indexOf(socket);
            userList[i].user=user;
            io.emit('move',user);
        //}
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