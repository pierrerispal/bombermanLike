//Setup basic express server
var express = require('express'),
    app = express(),
    http = require('http'),
    server = http.createServer(app),
    io = require('socket.io')(server),
    Repeat=require('repeat'),
    port = process.env.PORT || 8080;

//setting the game variables
var gridX=25, //always odd number
    gridY=13,
    userList = [],
    bombList=[],
    spectateurList=[],
    destructibleWallList=[];
var textures = [
    'char1',
    'char2',
    'char3',
    'char4',
    'char5',
    'char6'
];
var spawnList = [
    '1-1',
    '2-1',
    '1-2',
    (gridX+1)/2+"-"+1,
    ((gridX+1)/2)+1+"-"+1,
    ((gridX+1)/2)-1+"-"+1,
    (gridX+1)/2+"-"+2,
    gridX+"-"+1,
    gridX+"-"+2,
    (gridX-1)+"-"+1,
    1+"-"+gridY,
    2+"-"+gridY,
    1+"-"+(gridY-1),
    (gridX+1)/2+"-"+gridY,
    ((gridX+1)/2)+1+"-"+gridY,
    ((gridX+1)/2)-1+"-"+gridY,
    (gridX+1)/2+"-"+(gridY-1),
    gridX+"-"+gridY,
    (gridX-1)+"-"+gridY,
    gridX+"-"+(gridY-1)
];

//Run the server
server.listen(port, function () {
    console.log('Server listening at port %d', port);
});
//setting the route for accessing other files
app.use(express.static(__dirname + '/public'));
generateWalls();

//NEW CONNECTION
io.on('connection', function(socket){
    console.log("new player connected");

    socket.on('connect user', function(user){
        if(user.pseudo!="" && user.pseudo!=""){           
            texture=textures[0];
            if(texture){
                console.log(user.pseudo+" just joined the game"); 
                switch(texture){
                    case 'char1':
                        var posX=1;
                        var posY=1;
                        break;
                    case 'char2':
                        var posX=(gridX+1)/2;
                        var posY=1;
                        break;
                    case 'char3':
                        var posX=gridX;
                        var posY=1;
                        break;
                    case 'char4':
                        var posX=1;
                        var posY=gridY;
                        break;
                    case 'char5':
                        var posX=(gridX+1)/2;
                        var posY=gridY;
                        break;
                    case 'char6':
                        var posX=gridX;
                        var posY=gridY;
                        break;
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
            sendAllWalls(socket);
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
  
function generateWalls(){
    for(var i=1;i<=gridX;i++){
        for(var j=1;j<=gridY;j++){
            if(getRandomInt(1,3)==1 || getRandomInt(1,3)==2){
                //if((j%2==0 && i%2==0) || (i==1 && j==1) || (i==(gridX+1)/2 && j==1) || (i==gridX && j==1) || (i==i && j==gridY) || (i==(gridX+1)/2 && j==gridY) || (i==gridX && j==gridY)){
                var s = spawnList.indexOf(i+"-"+j);
                if((j%2==0 && i%2==0) || s!=-1){    
                }else{
                    destructibleWallList.push(i+"-"+j);
                }
            }
        }  
    }
}  
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
            var bomb=bombList[i]
            for(var x=bomb.cooX-1;x<=bomb.cooX+1;x++){
                var j=bomb.cooY;
                var index=destructibleWallList.indexOf(x+"-"+j);
                if(index!=-1){
                    destructibleWallList.splice(index,1);
                }
            }  
            for(var j=bomb.cooY-1;j<=bomb.cooY+1;j++){
                var x=bomb.cooX;
                var index=destructibleWallList.indexOf(x+"-"+j);
                if(index!=-1){
                    destructibleWallList.splice(index,1);
                }
            }
            bombList.splice(i, 1);
        }
    });
}
function sendAllWalls(socket){
    destructibleWallList.forEach(function (e,i,a) {
        socket.emit('new wall', destructibleWallList[i]);
    });
}

 
