var socket = io(),
    newMessagesCount = 0,
    channel='';
    chatTitle = "Bomberman";

$('#login form').submit(function () {
    if($('#pseudo').val().trim()!=""){
        $('#login').css('display','none');
        $('#scene').css('display','block');
        var pseudo = $('#pseudo').val().trim();
        $('#channel-title').append('#'+channel);
        var user = {
            pseudo:pseudo
        };
        socket.emit('connect user',user);
    }
    return false;
});

socket.on('connect user', function(user){
    
});

socket.on('new player',function(user){
    drawUser(user);
});

socket.on('disconnect user', function(user){
    
});

//initialisation of the board game
socket.on('init', function(send){
    generateTable(send.gridX,send.gridY);
});

function generateTable(larg,long){
    larg = larg;
    long = long;
    var html='';
    for(var i=1; i<(long+1);i++)
    {
        html+='<tr>';
        for(var j=1; j<(larg+1);j++)
        {
            //@TODO: need to add the walls
            html+='<td class="empty" id="'+j+'-'+i+'"></td>'
        }
        html+='</tr>';
    }
    $('#table').prepend(html); 
}
function drawUser(user){
    var idModif=user.cooX+"-"+user.cooY;    
    $('#'+idModif).toggleClass('char empty');
}