// server.js
const net = require('net');
const fs = require('fs');

const port = 8100;
var seed = 0;

let questions = [];
let correct = [];
let incorrect = [];

const server = net.createServer(function(client){

client.setEncoding('utf8');

client.on('data', function(data,err){
   if(err) console.log(`Error in get data`);
   else
   {
       if(data === 'QA')
       {
               client.id = Date.now() + seed++;
               console.log(' +++ '+'Client-'+ client.id);
               client.write('ASC');
               fs.writeFile(client.id+`.txt`,`Client ${client.id} is connect\r\n`,function(err){
                   if(err) console.log('Err in create LOG');});
               getJSON();
       }
       if(data === 'FILES')
       {
           client.id = Date.now() + seed++;
           console.log(' +++ '+'Client-'+ client.id);
           client.write('ASC');
       }
   }
});
client.on('data',function (data,err) {
    if(err) console.log('Error in get data-2');
    else
    {
        if(data !== 'QA' && data !== 'FILES' )
        {
            let flag = false;
            for(let i = 0; i < questions.length; i++)
            {
                if(questions[i] === data)
                {
                    if(Date.now()%2 === 0)
                    {
                        client.write(correct[i].toString());
                        fs.appendFile(client.id+`.txt`,
                            'Questions: '+ questions[i].toString()+ `\r\n` + 'Answer: '+ correct[i].toString()+ `\r\n` ,
                            (err)=>{if(err) console.log('Err in create LOG');});
                    }
                    else
                    {
                        client.write(incorrect[i].toString());
                        fs.appendFile(client.id+`.txt`,
                            'Questions: '+ questions[i].toString()+ `\r\n` + 'Answer: '+ incorrect[i].toString()+ `\r\n`,
                            (err)=>{if(err) console.log('Err in create LOG');});
                    }
                    flag = true;
                }
            }
            if(!flag) client.write('DSC');
        }
    }
});


client.on('end', function(){
    if(client.id === undefined) console.log(' --- '+'no connect for Client');
    else
    {
        //fs.appendFile(client.id+`.txt`,'Client disconnected :)',(err)=>{if(err) console.log('Err in create LOG');});
        console.log(' --- '+'Client-' + client.id);
    }
    } );

});

server.listen(port, () => {
    console.log(`Server listening on localhost:${port}`);
});

function getJSON()
{
    fs.readFile('qa.json',function (err,data) {
        if(err) console.log('Error in read JSON');
        else
        {
            let json = JSON.parse(data);
            for(let i = 0; i < json.length;i++)
            {
                questions[i] = json[i].question;
                correct[i] = json[i].correct;
                incorrect[i] = json[i].incorrect;
            }
        }
    })
}
