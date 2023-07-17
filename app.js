const express = require('express');
const app = express();
const { Server } = require("socket.io");
const server = require('http').createServer(app);
const chatServer = new Server(server);

app.get('/', (req, res) => {

    res.sendFile(__dirname + '/src/index.html');
});

var GuestUser = 'guest';
var count = 0;
const users = [];
const connectedUsers = [];
chatServer.on('connection', (socket) => {
    let Uname;
    socket.on('name', (name) => {
        
        if(name == "Guest"){
            name = GuestUser+count;
            count++;
            //socket.id = {name : name, id : socket.id};
        }else{
            //socket.id = {name : name, id : socket.id};
        }
       
        if( userPresent(name)) {
            console.log('user existsaa');
            socket.emit('user exists', name);
        }else{
            console.log(name + ' connected the chat');
            Uname = name;
            users.push(name);
            connectedUsers.push(socket.id);
            socket.emit('hi', {id : socket.id, name : name});
            chatServer.emit('join lobby', name);
            console.log(users.length);
            //console.log(connectedUsers);
            chatServer.emit('users', users);
        } 
    });



    socket.on('disconnect', () => {
        
        
        if(users.includes(Uname)){
            users.splice(users.indexOf(Uname), 1);
            connectedUsers.splice(users.indexOf(Uname), 1);
            console.log(users.length);
            //console.log(connectedUsers);
            chatServer.emit('users', users);
            chatServer.emit('leave lobby',Uname);
        }
        
    
    });
    socket.on('typing', (name) => {
        socket.broadcast.emit('typing', {name : name, id : socket.id});
    });



    socket.on('chat message', (msg) => {
        chatServer.emit('chat message', {msg: msg , name : Uname, id : socket.id});
    });

    socket.on('private message', (data) => {

        socket.emit('private chat message', {msg: data.msg , id : socket.id, name: Uname});
        chatServer.to(Pmassage(data.user)).emit('private chat message', {msg: data.msg , id : socket.id, name: Uname});
    });
    
  });


server.listen(process.env.PORT); 

const userPresent = (name) => {
    for(let i = 0; i < users.length; i++){
        if(users[i] == name){
            return true;
        }
    }
    return false;}



const Pmassage = (name) => {
    
    for(let i = 0; i < users.length; i++){
        if(users[i] == name){
            return connectedUsers[i];
        }
    }
}