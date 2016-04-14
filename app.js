//Setup basic express server
var express = require('express'),
    app = express(),
    http = require('http'),
    server = http.createServer(app),
    io = require('socket.io')(server),
    Repeat=require('repeat'),
    port = process.env.PORT || 8080;

//setting the game variables
var gridX=25,
    gridY=13,
    userList = [],
    bombList=[],
    spectateurList=[];
var textures = [
    'char1',
    'char2',
    'char3',
    'char4',
    'char5',
    'char6'
];
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
            texture=textures[0];
            if(texture){
                console.log(user.pseudo+" just joined the game"); 
                var posX=2;
                var posY=2;
                while(posX%2==0 && posY%2==0){
                    posX=getRandomInt(1,gridX);
                    posY=getRandomInt(1,gridY);
                }
                user["cooX"]=posX;
                user["cooY"]=posY;
                textures.shift();
                user["power"]=1;
                user["time"]=2;
                user["life"]=3;
                user["player"]=true;
                user["char"]=texture;
                socket.user = user;
                
                var info = {
                    gridX:gridX,
                    gridY:gridY,
                    user:socket.user};                
                //we add the player in the player list
                userList.push(socket);
            }else{
                console.log(user.pseudo+" just joined as spectator"); 
                user["player"]=false;
                socket.user = user;
                var info={
                   gridX:gridX,
                   gridY:gridY,
                   user:socket.user
                };
                spectateurList.push(socket);                
            }
            socket.broadcast.emit('new player',user);
            //we send ourselve to everyone including ourselves for us to be drawn            
            socket.emit('init',info);            
            //we send to the client all the other players
            sendAllPlayers(socket);
            sendAllBombs(socket);
        }
    });

    socket.on('disconnect', function () {
        console.log("someone just left");
        //if user is connected
        if(socket.user!=null){
            //@TODO: handle when the spec leave
            var i = userList.indexOf(socket);
            userList.splice(i, 1);
            textures.push(socket.user.char);
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
    
    socket.on('new bomb',function(bomb){
        bombList.push(bomb);
        io.emit('new bomb',bomb);
    });
    
    
});

//launched every second the bomb verification
Repeat(checkBombs).every(1, 's').start.now();
    
function sendAllPlayers(socket){
    userList.forEach(function (e,i,a) {
        socket.emit('new player', e.user);
    });
}

function sendAllBombs(socket){
    bombList.forEach(function (e,i,a) {
        console.log(bombList[i]);
        socket.emit('new bomb', bombList[i]);
    });
}
function getRandomInt(min,max){
    return Math.floor(Math.random()*(max-min))+min;
}

function checkBombs() {
    bombList.forEach(function (e,i,a) {
        if(bombList[i].time>0){
            bombList[i].time-=1;
        }else{
            io.emit('bomb exploded',bombList[i]);
            bombList.splice(i, 1);
        }
    });
};
 
