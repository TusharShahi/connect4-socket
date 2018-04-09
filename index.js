var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);

app.use(express.static(__dirname + '/node_modules'));  

app.get('/', function(req, res,next) {  

    res.sendFile(__dirname + '/index.html');

});


var i = 0;


// Random name generator


function checkwinner(x)
{

for(i=0;i<3;i++)
{

    for(j=0;j<6;j++)
        if (x[i][j] != 0 && (x[i][j] == x[i+1][j] && x[i][j] == x[i+2][j]&&x[i][j] == x[i+3][j]))
               {	console.log("win");
                return x[i][j];
               }
}

for(i=0;i<6;i++)
   { for(j=0;j<3;j++)

        if (x[i][j] != 0&& (x[i][j] == x[i][j+1] && x[i][j] == x[i][j+2] && x[i][j] == x[i][j+3]))
 		  {	console.log("win");
                return x[i][j];
               }

    }



for(j=0;j<3;j++)
   { for(i=0;i<3;i++)
        if (x[i][j] != 0 && x[i][j] == x[i+1][j+1] && x[i][j] == x[i+2][j+2] && x[i][j] == x[i+3][j+3])
                 {	console.log("win");
                return x[i][j];
               }
    for(i=3;i<6;i++)
        if (x[i][j] != 0 && x[i][j] == x[i-1][j+1] && x[i][j] == x[i-2][j+2] && x[i][j] == x[i-3][j+3])
	  {	console.log("win");
                return x[i][j];
               }
    
    }
}


function makeid(x) {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < x; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}
 


io.on('connection', function(client) {  

	i++;

	//Create username for client
	client.username  = makeid(3);
    


    console.log('Client connected...');


    console.log('CLIENT ID IS ' + client.id);

	console.log('i is ' + i);

	//	console.log(io.sockets.adapter.rooms);
	client.on('disconnect',function()
	{
		console.log("disconnect");
		client.broadcast.emit('opponentdisconnect');
	});


	client.on('leave',function()
	{  	client.broadcast.emit('opponentdisconnect');
	
		client.disconnect();
	});
    
    client.on('create', function (room) {
    
    	
//    	console.log("Entered room is " + room);


    	//if First Player, create a new game
    	if((room.roomname == null)||(room.roomname =="")||(room.roomname == undefined)) 
    		{

    			client.num = 1;
    	 		var roomname = makeid(5);
			   	console.log(room.color);
 				console.log("player 1");

			   // 	console.log('roomname is ' + roomname );
			    client.join(roomname);

			    client.gameroom = roomname;
			    client.color = room.color;
			    //console.log('room is ' + roomname);
			    client.emit('roomcreated',roomname);
			//			   console.log(io.sockets.adapter.rooms);
				client.game = [ 
						  [0,0,0,0,0,0],
						  [0,0,0,0,0,0],
						  [0,0,0,0,0,0],
						  [0,0,0,0,0,0],
						  [0,0,0,0,0,0],
						  [0,0,0,0,0,0]
						];

				client.rowarray = [0,0,0,0,0,0];


		     }

		//else if second player join existing game
		else
		{
				client.num = 2;
							   	console.log(room.color);
				// if room is not full
				console.log("player 2");
				if(io.sockets.adapter.rooms[room.roomname].length<2)
				{
//					console.log(io.sockets.adapter.rooms[room].sockets);

				client.join(room.roomname);
				client.gameroom = room.roomname;

				client.color = room.color;

//					console.log("rooms");
//					console.log(client);


//				console.log(client.username);


				client.broadcast.emit("opponenthasjoined",client.username);

				io.in(room.roomname).emit('startgame');
			    
			    client.emit('yourturn');

			    //console.log('room is ' + room);
			    client.emit('roomcreated',room.roomname);

			    client.game = [ 
						  [0,0,0,0,0,0],
						  [0,0,0,0,0,0],
						  [0,0,0,0,0,0],
						  [0,0,0,0,0,0],
						  [0,0,0,0,0,0],
						  [0,0,0,0,0,0]
						];

				client.rowarray = [0,0,0,0,0,0];




		//		console.log(io.sockets.adapter.rooms);
				}

					//else if room is full
					else
					{
						client.emit('roomfull');
					}
			
			}

	});

    //send name 
	client.on('sendname',function()
	{

		client.broadcast.emit("opponenthasjoined",client.username);

	});    


	client.on("passturn",function()
	{	console.log(client.num + "will pass his trunn");
		client.broadcast.emit("yourturn");

	});


	client.on("update",function(a)
	{
		console.log("update");
	//	if(client.num == 1)
	//	client.game[5-client.rowarray[a]][a] = 2;
	//	else
		client.game[5-client.rowarray[a.column]][a.column] = a.player;
			
		client.rowarray[a.column]++;



		      var win = checkwinner(client.game)
				if(win)
				{
					io.in(client.gameroom).emit('victory',win);
				}



	});

 
	client.on("drop",function(id)
	{
		console.log(client.id + ' has played');

		switch(id) {
		    case "one":
		//        client.game[5-client.rowarray[0]][0] = client.num;
		  //      client.rowarray[0]++;
				//client.broadcast.emit("update",0);		        
		        io.in(client.gameroom).emit('fill',5-client.rowarray[0],0,client.color,client.num);
		        break;

		    case "two":
		    //    client.game[5-client.rowarray[1]][1] = client.num;
		      //  client.rowarray[1]++;
				//client.broadcast.emit("update",1);
				io.in(client.gameroom).emit('fill',5-client.rowarray[1],1,client.color,client.num);

		     	break;
			case "three":
    			//client.game[5-client.rowarray[2]][2] = client.num;
		        //client.rowarray[2]++;
		        //client.broadcast.emit("update",2);
		        io.in(client.gameroom).emit('fill',5-client.rowarray[2],2,client.color,client.num);

		       break;
			case "four":
    			//client.game[5-client.rowarray[3]][3] = client.num;
		        //client.rowarray[3]++;
		        //client.broadcast.emit("update",3);
		        io.in(client.gameroom).emit('fill',5-client.rowarray[3],3,client.color,client.num);
		      
		       break;
			case "five":
    		//	client.game[5-client.rowarray[4]][4] = client.num;
		      //  client.rowarray[4]++;
		        //client.broadcast.emit("update",4);
		        io.in(client.gameroom).emit('fill',5-client.rowarray[4],4,client.color,client.num);
		        break;
			case "six":
    			//client.game[5-client.rowarray[5]][5] = client.num;
		        //client.rowarray[5]++;
  			    //   client.broadcast.emit("update",5);
 		        io.in(client.gameroom).emit('fill',5-client.rowarray[5],5,client.color,client.num);
   		      break;
		}

	});

});


server.listen(4200);  
