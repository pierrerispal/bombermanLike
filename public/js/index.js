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
    drawUser(user);
});

socket.on('disconnect user', function(user){
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
            //@TODO: need to add the walls
            html+='<td class="empty" id="'+j+'-'+i+'"></td>'
        }
        html+='</tr>';
    }
    $('#table').prepend(html); 
}
function drawUser(user){
    var idModif=user.cooX+"-"+user.cooY;  
    $('#'+idModif).css("background-color",user.color);
    $('#'+idModif).toggleClass('char empty');    
}
function eraseUser(user,deco){
    user.color="white";
    if(!deco){
        user.cooX=user.oldX;
        user.cooY=user.oldY;
    }
    drawUser(user);
}
document.addEventListener('keydown',function(event) {
    //@TODO for each check that we are logged
    if(event.keyCode==37 || event.keyCode == 81){
        if(logged){
            console.log('left');
            global_user['oldX']=global_user.cooX;
            global_user['oldY']=global_user.cooY;
            if(global_user.cooX-1<1){                
            }else{
                global_user.cooX=global_user.cooX-1;
                socket.emit('move',global_user);
            }      
        }        
    }else if(event.keyCode == 39 || event.keyCode == 68){
        if(logged){
            console.log('right');
            global_user['oldX']=global_user.cooX;
            global_user['oldY']=global_user.cooY;
            if(global_user.cooX+1>global_x){                
            }else{
                global_user.cooX=global_user.cooX+1;
                socket.emit('move',global_user);
            }            
        }        
    }else if(event.keyCode == 38 || event.keyCode == 90){
        if(logged){
            console.log('up');  
            global_user['oldX']=global_user.cooX;
            global_user['oldY']=global_user.cooY;
            if(global_user.cooY-1<1){                
            }else{
                global_user.cooY=global_user.cooY-1;
                socket.emit('move',global_user);
            }  
        }        
    }else if(event.keyCode == 40 || event.keyCode == 83){
        if(logged){
            console.log('down');
            global_user['oldX']=global_user.cooX;
            global_user['oldY']=global_user.cooY;
            if(global_user.cooY+1>global_y){                
            }else{
                global_user.cooY=global_user.cooY+1;
                socket.emit('move',global_user);
            }  
        }        
    }
}); 


