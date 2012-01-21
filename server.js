var Express = require("express")
var app = Express.createServer();

var io = require("socket.io").listen(app);

io.configure(function(){
    io.set("transports", ["htmlfile", "xhr-polling", "jsonp-polling"]);
});

var GLOBAL_ID = 0;
var DELAY = 1000;
var MULTIPART_BOUNDARY = "EVENT";
var EMPTY_2KB = "";

for(var i = 0; i < 2048; i++) {
    EMPTY_2KB += "\n";
};

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
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*'
    });

    // Send 2KB prelude if this is IE
    if(req.header("user-agent").indexOf("MSIE") !== -1) {
        res.write(EMPTY_2KB);
    }
    startLoop(function(){
        console.log("SSE");
        if(!res.connection.writable) return false;

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


var writeIFrameScriptTag = function(res, text){
    var data = {text: "HTMLFILE/" + text};
    res.write(
        "<script>" +
        "parent.callback(" + JSON.stringify(data) + ");" +
        "</script>\n"
    );
};

app.get("/htmlfile.js", function(req, res){
    //res.header("Content-type", "text/javascript");
    startLoop(function(){
        if(res.finished) return false;
        writeIFrameScriptTag(res, (new Date).toUTCString());
        return true
    }, DELAY);
});


app.listen(8000);

console.log("Listening on http://0.0.0.0:8000");
