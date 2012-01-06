var Express = require("express")
var app = Express.createServer();

var io = require("socket.io").listen(app);

var GLOBAL_ID = 0;
var DELAY = 1000;
var MULTIPART_BOUNDARY = "EVENT";

var writeSSEEvent = function(res, data){
    var lines = data.split("\n");
    lines.forEach(function(l){
        res.write("data: SSE/" + l + "\n");
    });
    res.write("\n");
};

var startLoop = function(func, delay) {
    var repeat = func();
    if(repeat) {
        setTimeout(function(){
            startLoop(func, delay);
        }, delay);
    }
};

app.get("/", function(req, res){
    res.sendfile("index.html");
});

app.get("/sse", function(req, res){
    res.header("Content-type", "text/event-stream");
    startLoop(function(){
        // console.log("SSE");
        if(res.finished) return false;

        writeSSEEvent(res, (new Date).toUTCString());
        return true;
    }, DELAY);
});
app.get("/eventsource.js", function(req, res){
    res.sendfile("eventsource.js");
});

function writeMultipartEvent(res, data){
    res.write("\r\n--" + MULTIPART_BOUNDARY + "\r\n");
    res.write("Content-type: text/plain\r\n\r\n");
    res.write("MULTIPART/" + data + "\r\n");
};

app.get("/multipart", function(req, res){
    res.header("Content-type", "multipart/x-mixed-replace;boundary=" + MULTIPART_BOUNDARY);
    res.write("                                                                                                                                                                                                                                                                                                \n");
    startLoop(function(){
        if(res.finished) return false;
        writeMultipartEvent(res, (new Date).toUTCString());
        return true;
    }, DELAY);
});

var dateChanSubscribers = 0;
var dateChan = io
    .of("/date")
    .on("connection", function(socket){
        console.log("SOCKET IO SUBSCRIBERS: " + dateChanSubscribers);
        if(dateChanSubscribers === 0) {
            dateChanSubscribers += 1;
            startLoop(function(){
                if(dateChanSubscribers === 0) return false
                dateChan.emit("date", "SOCKETIO/" + (new Date).toUTCString())
                return true;
            }, DELAY);
        } else {
            dateChanSubscribers += 1;
        }
    }).on("disconnect", function(){
        console.log("SOCKET IO DISCONNECT");
        dateChanSubscribers -= 1;
    });

app.listen(8000);
