var socket = io(),
    chatTitle = "Bomberman",
    player=false,
    global_user,
    currentBomb=false;
    global_x=0,
    global_y=0,
    global_direction=0;
    //@TODO: transform the current bomb in a list because a player can put more than 1 at a time

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
    if(user.player){
        var str=" as a player";
        drawUser(user);
        $('#row').append('<td id="'+user.char+'">'
                            +'<div id="list_pseudo">'+user.pseudo+'</div>'
                            +'<div id="list_head" class="'+user.char+'"></div>'
                            +'</td>');
    }else{
        var str=" as a spectator";
    }
});

//initialisation of the board game
socket.on('init', function(send){
    generateTable(send.gridX,send.gridY);
    player=send.user.player;
    global_x=send.gridX;
    global_y=send.gridY;
    if(player){
        global_user=send.user;
        $('#char').addClass(send.user.char);
        $('#data_pseudo').append(send.user.pseudo);
        //console.log(global_user.char+global_user.cooX+global_user.cooY);
        //drawUser(global_user);
    }else{
        //do the spectateur thing
    }    
});

socket.on('disconnect user', function(user){
    eraseUser(user,true);
    $('#'+user.char).remove();
});

socket.on('move',function(user){
    drawUser(user);
    eraseUser(user,false);
});

socket.on('new bomb',function(bomb){
    var idModif=bomb.cooX+"-"+bomb.cooY;
    //$('#'+idModif).addClass("bomb");
    //$('#'+idModif).removeClass("empty");
    $('#'+idModif).children(".con").children(".level3").toggleClass('bomb empty');
});

socket.on('bomb exploded',function(bomb){
    var idModif=bomb.cooX+"-"+bomb.cooY;
    $('#'+idModif).children(".con").children(".level3").toggleClass('bomb empty');
    if(player){
      bombExplosion(bomb);  
    }    
});

socket.on('new wall',function(string){
    $('#'+string).children(".con").children(".level1").toggleClass('floor wall');
    $('#'+string).children(".con").children(".level2").toggleClass('empty destructible');  
});

function bombExplosion(bomb){
    if((currentBomb.cooX==bomb.cooX) && (currentBomb.cooY==bomb.cooY)){
        currentBomb=false;
    }
    for(var i=bomb.cooX-1;i<=bomb.cooX+1;i++){
        var j=bomb.cooY;
        if(i<1 || j<1 || i>global_x || j>global_y){
        }else{
            if(testClass(i+"-"+j,'destructible','level2')){
                $('#'+i+"-"+j).children(".con").children(".level1").toggleClass('floor wall');
                $('#'+i+"-"+j).children(".con").children(".level2").toggleClass('destructible empty');
                console.log(i+"-"+j);
            }
        }
    }
    for(var j=bomb.cooY-1;j<=bomb.cooY+1;j++){
        var i=bomb.cooX;
        if(i<1 || j<1 || i>global_x || j>global_y){
        }else{
            if(testClass(i+"-"+j,'destructible','level2')){
                console.log(i+"-"+j);
                $('#'+i+"-"+j).children(".con").children(".level1").toggleClass('floor wall');
                $('#'+i+"-"+j).children(".con").children(".level2").toggleClass('destructible empty');
            }
        }
    }
    //need to add the rayon of the bomb
    if((bomb.cooX==global_user.cooX) && (bomb.cooY=global_user.cooY)){
        console.log("aie!");
    }
}

function generateTable(larg,long){
    
    var html='';
    for(var i=1; i<(long+1);i++)
    {
        html+='<tr>';
        for(var j=1; j<(larg+1);j++)
        {
            //@TODO: need to add the destructible walls
            
            if(j%2==0 && i%2==0){
                html+=  '<td id="'+j+'-'+i+'">'
                        +'<div class="con">'
                            +'<div class="level1 wall"></div>'
                            +'<div class="level2 hard"></div>'
                            +'<div class="level3 empty"></div>'
                        +'</div>'
                        +'</td>';
                //html+='<td class="undestructible wall" id="'+j+'-'+i+'">'+'<div style="width: 64px; height: 64px; position: relative;"></div>'+'</td>';
            }else{
                html+=  '<td id="'+j+'-'+i+'">'
                        +'<div class="con">'
                            +'<div class="level1 floor"></div>'
                            +'<div class="level2 empty"></div>'
                            +'<div class="level3 empty"></div>'
                        +'</div>'
                        +'</td>';
                //html+='<td class="floor empty" id="'+j+'-'+i+'">'+'<div style="width: 64px; height: 64px; position: relative;"></div>'+'</td>';
            } 
            html+='</div>';
        }
        html+='</tr>';
    }
    $('#table').prepend(html); 
}

function drawUser(user){
    var position='0';
    //need to check the direction
    if(user.cooX<user.oldX){
        //he went left
        position='-192';
    }else if(user.cooX>user.oldX){
        //he went right
        position='-64';
    }else if(user.cooY<user.oldY){
        //he went up
        position='-128';
    }else{ 
        position=position;
    }   
    var idModif=user.cooX+"-"+user.cooY;
    
    $('#'+idModif).children(".con").children(".level2").toggleClass(user.char+' empty');
    $('#'+idModif).children(".con").children(".level2").css("background-position",position+"px 0px");
}

function eraseUser(user,deco){
    if(!deco){
        user.cooX=user.oldX;
        user.cooY=user.oldY;
    }
    var idModif=user.cooX+"-"+user.cooY;
    $('#'+idModif).prop("style",null);
    $('#'+idModif).children(".con").children(".level2").toggleClass(user.char+' empty');
}

function checkDestination(posX,posY){
    //first we check the with the bounds of the playground
    if(posX>=1 && posY >=1 && posX<=global_x && posY<=global_y){
        //then we need to check if the case is a wall or not
        if(!testClass(posX+'-'+posY, 'wall','level1')){
            return true;
        }
    }
    return false;
}

function testClass(id,string,level){
    //var classes = $('#'+id).attr('class');
    var classes = $('#'+id).children(".con").children("."+level).attr('class');
    return (classes.indexOf(string)!=-1);
}

document.addEventListener('keydown',function(event) {
    if(event.keyCode==37 || event.keyCode == 81){
        if(player){
            //left
            global_direction=-192;
            global_user['oldX']=global_user.cooX;
            global_user['oldY']=global_user.cooY;
            if(checkDestination(global_user.cooX-1,global_user.cooY)){
                global_user.cooX=global_user.cooX-1;
                socket.emit('move',global_user);
            }else{
                $("."+global_user.char).css("background-position",global_direction+"px 0px");                   
                //drawUser(global_user);
            }            
        }        
    }else if(event.keyCode == 39 || event.keyCode == 68){
        if(player){
            //right
            global_direction=-64;
            global_user['oldX']=global_user.cooX;
            global_user['oldY']=global_user.cooY;
            if(checkDestination(global_user.cooX+1,global_user.cooY)){
                global_user.cooX=global_user.cooX+1;
                socket.emit('move',global_user);
            }else{
                //var idModif=global_user.cooX+"-"+global_user.cooY;
                //$('#'+idModif).css("background","url('../img/x64/"+global_user.char+".png') -64px 0px no-repeat");
                $("."+global_user.char).css("background-position",global_direction+"px 0px");                   
                //drawUser(global_user);
            }
        }        
    }else if(event.keyCode == 38 || event.keyCode == 90){
        if(player){
            global_direction=-128;
            //up
            global_user['oldX']=global_user.cooX;
            global_user['oldY']=global_user.cooY;
            if(checkDestination(global_user.cooX,global_user.cooY-1)){
                global_user.cooY=global_user.cooY-1;
                socket.emit('move',global_user);
            }else{
                //var idModif=global_user.cooX+"-"+global_user.cooY;
                //$('#'+idModif).css("background","url('../img/x64/"+global_user.char+".png') -128px 0px no-repeat");
                $("."+global_user.char).css("background-position",global_direction+"px 0px");             
                //drawUser(global_user);                
            }
        }        
    }else if(event.keyCode == 40 || event.keyCode == 83){
        if(player){
            //down
            global_direction=0;
            global_user['oldX']=global_user.cooX;
            global_user['oldY']=global_user.cooY;
            if(checkDestination(global_user.cooX,global_user.cooY+1)){
                global_user.cooY=global_user.cooY+1;
                socket.emit('move',global_user);
            }else{
                //var idModif=global_user.cooX+"-"+global_user.cooY;
                //$('#'+idModif).css("background","url('../img/x64/"+global_user.char+".png') -0px 0px no-repeat");
                $("."+global_user.char).css("background-position",global_direction+"px 0px");                
                //drawUser(global_user);
            }
        }   
    }else if(event.keyCode == 13 || event.keyCode == 69){
        if(player){
            //enter OR e pressed to drop a bomb
            //need to check that there isnt already a bomb
            if(!currentBomb){
                if(!testClass(global_user.cooX+"-"+global_user.cooY,"bomb",'level3')){
                    var bomb={
                     'cooX':global_user.cooX,
                     'cooY':global_user.cooY,
                     'power':global_user.power,
                     'time':global_user.time
                    };
                    socket.emit('new bomb',bomb); 
                    currentBomb=bomb;
                }
            }
        }   
    }
}); 


