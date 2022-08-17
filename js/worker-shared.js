onconnect = function(e) {
    importScripts("utils.js");
    // importScripts("pusher.worker.js");
    var client_port = e.ports[0],
        nr = 1,
        d = new Date();
    clients = [];
    clients.push(client_port); // fill list of worker clients (windows,tabs,...)
    // client_port.start();

    // // Connect to Pusher
    // var pusher = new Pusher('1fb94680701ab31a3139', {
    //     encrypted: true
    // });
    // // Subscribe to test_channel
    // var pusherChannel = pusher.subscribe('test_channel');
    // bind to 'my_event' on pusherChannel
    // pusherChannel.bind('my_event', function(data) {
    //     // Relay the payload on to each client_port
    //     clients.forEach(function(client_port){
    //         client_port.postMessage(data);
    //     });
    // });
        
    function timedCount() {
        // self.name
        client_port.postMessage("pulse " + (nr++)); //  post a message back to the HTML page
        setTimeout(timedCount, 1000);
    }
    timedCount();

    client_port.onmessage  = function(e) {
        client_port.postMessage("["+
            d.toLocaleDateString()+" "+d.toLocaleTimeString()+
            "], owner message: "+e.data+
            ", own message: "+utils_randomInt()+
            " pulse "+(nr++)
        );
    }
    client_port.onerror  = function(e) {
        client_port.postMessage("["+d.toLocaleDateString()+" "+d.toLocaleTimeString()+"], ERROR ! ");
    }
    client_port.onoffline = function() {
        client_port.postMessage("worker is now OFFLINE");
    }
    client_port.ononline = function() {
        client_port.postMessage("worker is now ONLINE");
    }
}

// var canvas = document.getElementById('myCanvas'),
// ctx = canvas.getContext('2d'),
// image = new Image();

// image.onload = function() {
//   Promise.all([
//     createImageBitmap(image, 0, 0, 32, 32),
//     createImageBitmap(image, 32, 0, 32, 32)
//   ]).then(function(sprites) {
//     ctx.drawImage(sprites[0], 0, 0);
//     ctx.drawImage(sprites[1], 32, 32);
//   });
// }

// image.src = 'sprites.png';