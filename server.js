const mongo = require('mongodb').MongoClient;
const io = require('socket.io').listen(4000).sockets;

var app = require('express')();
 

mongo.connect('mongodb://localhost:27017/mongoChat', function(err,db){
    if(err){
        throw err
    }
    console.log('connected')

    //connect to socket io
    io.on('connection', function(socket){
        let chat = db.collection('chat');
   

    //function to send status
    sendStatus = function (s){
        socket.emit('status', s)
    }

    //get chats from mongo collection
    chat.find().limit(100).sort({_id:1}).toArray((err,res)=>{
        if(err){
            throw err;
        }

        //Emit Messages
        socket.emit('output',res);

    })

    //Handle input messages
    socket.on('input',(data)=>{
        let name = data.name;
        let message = data.message;

        // check for name and message
        if (name=='' || message==''){
            sendStatus('Please enter a name and message')
        }
        else{
            //Insert Message
            chat.insert({name:name, message:message}, ()=>{
                io.emit('output', [data]);
            });

            //Send status object
            sendStatus({
                message:"Message Sent",
                clear:true
            })
        }
    })
     //handle clear

     socket.on('clear',function(data){
         //remove all chats from the collection
         chat.remove({},()=>{
             //emit cleated
             socket.emit('cleared')
         })

         
     })
    });
})

app.get('/',(req,res,next)=>{
  res.status(200).json({message:"good"})
})

app.listen(3000)
console.log('listening')
