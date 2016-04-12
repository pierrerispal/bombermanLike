var socket = io(),
    chatTitle = "Bomberman",
    logged=false,
    global_user
    global_x=0,
    global_y=0;

$('#login form').submit(function () {
    if($('#pseudo').val().trim()!=""){
        $('#login').css('display','none');
        $('#scene').css('display','block');
        var pseudo = $('#pseudo').val().trim();
        var user = {
            pseudo:pseudo
        };
        socket.emit('connect user',user);
    }
    return false;
});

socket.on('new player',function(user){
    $('#messages').append($('<li>').text(user.pseudo+" just joined"));
    drawUser(user);
});

socket.on('disconnect user', function(user){
    $('#messages').append($('<li>').text(user.pseudo+" just left"));
    eraseUser(user,true);
});

socket.on('move',function(user){
    drawUser(user);
    eraseUser(user,false);
});

//initialisation of the board game
socket.on('init', function(send){
    generateTable(send.gridX,send.gridY);
    global_x=send.gridX;
    global_y=send.gridY;
    global_user=send.user;
    logged=true;
});

function generateTable(larg,long){
    var html='';
    for(var i=1; i<(long+1);i++)
    {
        html+='<tr>';
        for(var j=1; j<(larg+1);j++)
        {
            //@TODO: need to add the destructible walls
            if(j%2==0 && i%2==0){
                html+='<td class="undestructible wall" id="'+j+'-'+i+'"></td>';
            }else{
                html+='<td class="floor empty" id="'+j+'-'+i+'"></td>';
            }            
        }
        html+='</tr>';
    }
    $('#table').prepend(html); 
}
function drawUser(user){
    var idModif=user.cooX+"-"+user.cooY;  
    $('#'+idModif).css("background","url('../img/x64/"+user.char+".png') 0 0 no-repeat");
    $('#'+idModif).toggleClass('char empty');    
}

function eraseUser(user,deco){
    if(!deco){
        user.cooX=user.oldX;
        user.cooY=user.oldY;
    }
    var idModif=user.cooX+"-"+user.cooY;  
    $('#'+idModif).css("background","url('../img/x64/texture2.png') -64px 0 no-repeat");
    $('#'+idModif).toggleClass('char empty');
}

function checkDestination(posX,posY){
    //first we check the with the bounds of the playground
    if(posX>=1 && posY >=1 && posX<=global_x && posY<=global_y){
        //then we need to check if the case is a wall or not
        if(!testClass(posX+'-'+posY, 'wall')){
            return true;
        }
    }
    return false;
}

function testClass(id,string){
    var classes = $('#'+id).attr('class');
    return (classes.indexOf(string)!=-1);
}
document.addEventListener('keydown',function(event) {
    if(event.keyCode==37 || event.keyCode == 81){
        if(logged){
            global_user['oldX']=global_user.cooX;
            global_user['oldY']=global_user.cooY;
            if(checkDestination(global_user.cooX-1,global_user.cooY)){
                global_user.cooX=global_user.cooX-1;
                socket.emit('move',global_user);
            }   
        }        
    }else if(event.keyCode == 39 || event.keyCode == 68){
        if(logged){
            global_user['oldX']=global_user.cooX;
            global_user['oldY']=global_user.cooY;
            if(checkDestination(global_user.cooX+1,global_user.cooY)){
                global_user.cooX=global_user.cooX+1;
                socket.emit('move',global_user);
            }            
        }        
    }else if(event.keyCode == 38 || event.keyCode == 90){
        if(logged){
            global_user['oldX']=global_user.cooX;
            global_user['oldY']=global_user.cooY;
            if(checkDestination(global_user.cooX,global_user.cooY-1)){
                global_user.cooY=global_user.cooY-1;
                socket.emit('move',global_user);
            } 
        }        
    }else if(event.keyCode == 40 || event.keyCode == 83){
        if(logged){
            global_user['oldX']=global_user.cooX;
            global_user['oldY']=global_user.cooY;
            if(checkDestination(global_user.cooX,global_user.cooY+1)){
                global_user.cooY=global_user.cooY+1;
                socket.emit('move',global_user);
            }
        }        
    }
}); 


