var nr=1,
    d = new Date();
function timedCount() {
    postMessage("pulse " + (nr++)); //  post a message back to the HTML page
    setTimeout(timedCount, 1000);
}
timedCount();

self.onmessage  = function(e) {
    postMessage("["+d.toLocaleDateString()+" "+d.toLocaleTimeString()+"], owner message: "+e.data);
}
self.onoffline = function() {
    postMessage("worker is now OFFLINE");
}
self.ononline = function() {
    postMessage("worker is now ONLINE");
}
