const net = require('net');
const fs = require('fs');
const path = require('path');

const pathFor = process.argv[2];
const connect = {host: "127.0.0.1", port: 3001};
let files = [];

const client = new net.Socket();
client.setEncoding('utf8');

client.connect(connect, function () {
    console.log('Connected');
    readFiles();
    client.write('FILES');
});
client.on('error', (err) => {
    console.error(err);
});
client.on('close', function () {
    console.log('Connection closed');
});
client.on('data', function (data) {
    if (data === 'ASC' || data === 'NEXT') {
        sendFiles();
    }
    if (data === 'DSC') {
        console.log('Server is dsc');
        client.destroy();
    }

});

function sendFiles() {
    if(files.length !== 0){
        let file = files.pop();
        fs.readFile(file,function (err,data) {
            if(!err) {
                console.log(data.length);
                let buf = data.toString('hex');
                client.write(path.basename(file)+'####');
                client.write(buf);
                client.write('####'+'END');
            }
        });
    }
}

function readFiles() {
    fs.readdir(pathFor, function (err, items) {
        if (!err) {
            for (let i = 0; i < items.length; i++) {
                let filePath = path.join(pathFor, items[i]);
                fs.stat(filePath, function (err, stat) {
                    if (!err && stat.isFile()) files.push(filePath);
                });
            }
        }
    });
}