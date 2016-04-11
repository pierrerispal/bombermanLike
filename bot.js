var command = function(text){
    return (text.msg.charAt(0)=="!");
}

var botMessage=function(text,allClients){  
    var msg='';
    var pseudo = 'BOT';
    var channel = text.channel;
    switch (text.msg){
        case '!hello':           
            msg = 'hello everyone';            
            break;
        case '!me':
            msg = 'you are '+text.pseudo;
            break;
        case '!people':
            msg='there are '+allClients.length+' persons on this chat';
            break;
        case '!time':
            msg = 'it is '+getDateTime('time');
            break;
        case '!day':
            msg = 'we are the '+getDateTime('day');
            break;
        
    }
  return {pseudo,channel,msg};
}

exports.command = command;
exports.botMessage = botMessage;

function getDateTime(string) {
    var now     = new Date(); 
    var year    = now.getFullYear();
    var month   = now.getMonth()+1; 
    var day     = now.getDate();
    var hour    = now.getHours();
    var minute  = now.getMinutes();
    var second  = now.getSeconds(); 
    if(month.toString().length == 1) {
        var month = '0'+month;
    }
    if(day.toString().length == 1) {
        var day = '0'+day;
    }   
    if(hour.toString().length == 1) {
        var hour = '0'+hour;
    }
    if(minute.toString().length == 1) {
        var minute = '0'+minute;
    }
    if(second.toString().length == 1) {
        var second = '0'+second;
    } 
    if(string=='time'){
        return hour+':'+minute+':'+second;
    }else{
        return year+'/'+month+'/'+day;
    }
}