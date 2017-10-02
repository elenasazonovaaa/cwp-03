// server.js
const net = require('net');
const fs = require('fs');


const connect = {host: "127.0.0.1", port: 3001};
let seed = 0;
let Clients = [];

let questions = [];
let correct = [];
let incorrect = [];
let buffFile = [];
let buffName = [];
getJSON();

const server = net.createServer(function (client) {

        client.setEncoding('utf8');
        client.on('error', (err) => {
            console.error(err);
        });
        client.on('data', function (data) {

            if (data === 'QA') {
                isFileClient = false;
                client.id = Date.now() + seed++;
                console.log(' +++ ' + 'Client-' + client.id);
                client.write('ASC');
                fs.writeFile(client.id + `.txt`, `Client ${client.id} is connect\r\n`, function (err) {
                    if (err) console.log('Err in create LOG');
                });
            }
            if (data === 'FILES') {
                client.id = Date.now() + seed++;
                fs.mkdir(process.env.pathSave+'\\'+client.id,()=>{});
                Clients[client.id] = data;
                buffFile[client.id] = [];
                buffName[client.id] = [];
                console.log(' +++ ' + 'Client-' + client.id);
                client.write('ASC');
            }
        });
        client.on('data', function (data) {

            if (data !== 'QA' && data !== 'FILES') {
                for (let i = 0; i < questions.length; i++) {
                    if (questions[i] === data) {
                        if (Date.now() % 2 === 0) {
                            client.write(correct[i].toString());
                            fs.appendFile(client.id + `.txt`,
                                'Questions: ' + questions[i].toString() + `\r\n` + 'Answer: ' + correct[i].toString() + `\r\n`,
                                (err) => {
                                    if (err) console.log('Err in create LOG');
                                });
                        }
                        else {
                            client.write(incorrect[i].toString());
                            fs.appendFile(client.id + `.txt`,
                                'Questions: ' + questions[i].toString() + `\r\n` + 'Answer: ' + incorrect[i].toString() + `\r\n`,
                                (err) => {
                                    if (err) console.log('Err in create LOG');
                                });
                        }
                    }
                }
            }
        });
        client.on('data',function (data) {
            if(Clients[client.id] === 'FILES' && data !== 'FILES'){
               buffFile[client.id].push(Buffer.from(data,'hex'));
               buffName[client.id].push(Buffer.from(data));
               if(data.toString().endsWith('END')) {
                   createFile(client.id);
                   client.write('NEXT');
               }
            }
        });
        client.on('end', function () {
            if (client.id === undefined) console.log(' --- ' + 'no connect for Client');
            else {
                //fs.appendFile(client.id+`.txt`,'Client disconnected :)',(err)=>{if(err) console.log('Err in create LOG');});
                console.log(' --- ' + 'Client-' + client.id);
            }
        });
    })
;

server.listen(connect, () => {
    console.log(`Server listening on localhost:${connect.host}:${connect.port}`);
    console.log(process.env.pathSave.toString());
});

function getJSON() {
    fs.readFile('qa.json', function (err, data) {
        if (err) console.log('Error in read JSON');
        else {
            let json = JSON.parse(data);
            for (let i = 0; i < json.length; i++) {
                questions[i] = json[i].question;
                correct[i] = json[i].correct;
                incorrect[i] = json[i].incorrect;
            }
        }
    })
}
function createFile(id) {
    let fileData = Buffer.concat(buffFile[id]);
    let fileName = Buffer.concat(buffName[id]).toString().split('####')[0];
    if(fileData.length === 0) fileData = Buffer.concat(buffName[id]).toString().split('####')[1];
    console.log(`name ${fileName} -- ${fileData.length} `);
    fs.writeFile(process.env.pathSave + '\\' + id + '\\' + fileName, fileData , function (err) {
            if (err)
                console.error(err);
        }
    );
    buffFile[id]=[];
    buffName[id] = [];
}