const net = require('net');
const fs = require('fs');
const port = 8100;

const client = new net.Socket();
client.setEncoding('utf8');

client.connect(port, function() {
    console.log('Connected');
    client.write('FILES');
});
client.on('close', function() {
    console.log('Connection closed');
});
client.on('data', function(data,err){
    if(err) console.log('Err in data client-file');
    else
    {
        if(data === 'ASC')
        {
            console.log('Server is asc');
            client.destroy();
        }
        if(data === 'DSC')
        {
            onsole.log('Server is dsc');
            client.destroy();
        }
    }
});