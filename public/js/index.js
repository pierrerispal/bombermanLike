var socket = io(),
    newMessagesCount = 0,
    channel='';
    chatTitle = "Chat Paleur";

$('#login form').submit(function () {
    if($('#pseudo').val().trim()!="" && $('#channel').val().trim()!=""){
        $('#login').css('display','none');
        $('#chat').css('display','block');
        var pseudo = $('#pseudo').val().trim();
        channel = $('#channel').val().trim();
        $('#channel-title').append('#'+channel);
        var user = {
            pseudo:pseudo,
            channel:channel
        };
        socket.emit('connect user',user);
    }
    return false;
});

$('#chat form').submit(function(){
    var msg = $('#m').val(),
        send = {
            channel:channel,
            msg:msg.trim()
        };
    socket.emit('chat message', send);
    $('#m').val('');
    return false;
});

$('#chat').focusin(function () {
    clearTitle();
});
$('#chat').click(function () {
    clearTitle();
})

$('#expand').click(function(){
    $('#list').toggleClass("open");
});

socket.on('connect user', function(user){
    if(user.channel==channel){
        var msg = user.pseudo+" est connecté.";
        $('#messages').append($('<li class="connection">').text(msg));        
    }
});

socket.on('disconnect user', function(user){
    if(user.channel==channel){
        var msg = user.pseudo+" est déconnecté.";
        $('#messages').append($('<li class="unconnection">').text(msg));
    }
});

socket.on('clear list', function(){
    $('#list #userList').text('');
});

socket.on('user list', function(user){
    if(user.channel==channel){
       $('#list #userList').append($('<li class="list-group-item">').text(user.pseudo));
    }    
});

socket.on('chat message', function(send){
    if(send.channel==channel){
        var msg = send.pseudo+" : "+send.msg;
        $('#messages').append($('<li>').text(msg));
        //Add 1 to the "lastMessages" and show it in the doc title
        newMessagesCount++;
        $(document).prop('title', '('+newMessagesCount+") - "+chatTitle);
        scrollChatDown();
    }
});

socket.on('clear title', function(){
    clearTitle();
});

function clearTitle(){
    newMessagesCount=0;
    $(document).prop('title',chatTitle);
}

function scrollChatDown(){
    $('#messages').animate({
        scrollTop: $('#messages').get(0).scrollHeight
    }, 2000);
}