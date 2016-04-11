//Setup basic express server
var express = require('express'),
    app = express(),
    http = require('http'),
    server = http.createServer(app),
    io = require('socket.io')(server),
    port = process.env.PORT || 3000,

    //Setup modules and specifics variable
    bot = require('./bot'),
    userList = [];

//Run the server
server.listen(port, function () {
    console.log('Server listening at port %d', port);
});

app.use(express.static(__dirname + '/public'));

io.on('connection', function(socket){
    console.log("new connection");

    socket.on('connect user', function(user){
        if(user.pseudo!="" && user.pseudo!=""){
            console.log(user.pseudo+" just joined the channel #"+user.channel);
            socket.user = user;
            userList.push(socket);
            updateUserList('connect',socket.user);
        }
    });

    socket.on('disconnect', function () {
        console.log("someone just left");
        //if user is connected
        if(socket.user!=null){
            var i = userList.indexOf(socket);
            userList.splice(i,1);
            updateUserList('disconnect',socket.user);
        }
    });

    socket.on('chat message', function(send){
        if(socket.user==null){
            socket.emit('refresh user');
        }
        if(send.msg!=""){
            send.pseudo = socket.user.pseudo;
            console.log("["+send.channel+"] "
                +send.pseudo
                +" : "+send.msg);
            io.emit('chat message', send);
            if(bot.command(send)){
                io.emit('chat message',bot.botMessage(send,userList));
            }
            socket.emit('clear title');
        }
    });
});


//useful function to make things shorter
function updateUserList(emit,user){
    io.emit(emit+' user', user);
    io.emit('clear list');
    userList.forEach(function (e,i,a) {
        io.emit('user list', e.user);
    });
}
