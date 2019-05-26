var ideone = require('ideone-node')
var config = require('./config')
var fs = require('fs')
var ins = new ideone(config.accessToken,config.customid)
var http = require('http')
ins.setMode(44)
var port = 80
var tagsToReplace = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;'
};

function replaceTag(tag) {
    return tagsToReplace[tag] || tag;
}

function safe_tags_replace(str) {
    return str.replace(/[&<>]/g, replaceTag);
}

var server = http.createServer((req,res)=>{
    console.log('.' + req.url)
    console.log(req.connection.remoteAddress)
    if(req.method === 'GET'){
        fs.readFile('.' + req.url, function(err,html){
            if(err){
                fs.readFile('./index.html', function(err,html){
                    res.writeHead(200,{"Content-Type": "text/html"});
                    res.end(html);
                })
                return;
            }
            res.writeHead(200,{"Content-Type": "text/html"});
            res.end(html);
        })
    }else if(req.method === 'POST'){
        if(req.url==='/submit'){
            res.writeHead(200,{"Content-Type": "text/html"});
            var body = '';
    
            req.on('data', function (data) {
                body += data;
    
                // Too much POST data, kill the connection!
                // 1e6 === 1 * Math.pow(10, 6) === 1 * 1000000 ~~~ 1MB
                if (body.length > 1e6)
                    req.connection.destroy();
            });
            req.on('end',()=>{
                var lines = body.split('\r\n');
                lines.shift()
                lines.shift()
                lines.shift()
                lines.pop()
                lines.pop()
                body = lines.join('\r\n');
                ins.run(body,'').then(data=>{
                    res.write('<h3>')
                    res.write(data.cmpinfo)
                    res.write('</h3>')
                    if(data.result === 11){
                        res.write('<h1>Compile Error</h1>')
                    }else if(data.output==='Hello World!\n'){
                        res.write('<h1>Accepted</h1>')
                    }else if(data.output===''){
                        res.write('<h1>Wrong Answer(no output)</h1>')
                    }else{
                        res.write('<h1>Wrong Answer</h1>')
                    }
                    res.end();
                })
            });
        }
    }
})
server.listen(port)