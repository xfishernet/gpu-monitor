var jsonrpc = require('json-rpc-client')
var rpc     = require('node-json-rpc');
var REST    = require('node-rest-client').Client;
var rest    = new REST();

var options = {
  port: 3333,
  host: '127.0.0.1',
  path: '/',
  strict: true
};

var cron = require('node-cron');

var gpus = {

 /*0 : '5adbb48ad7311e652f0a05d8',
 2 : '5adbb491d7311e652f0a05d9',
 3 : '5adbb496d7311e652f0a05da',*/
 4: '5adc534ed7311e652f0a05db'

}

zmStats();

cron.schedule('*/1 * * * *', function(){

   zmStats();

});

function zmStats() {

var client = new jsonrpc({ port: 2222, host: '127.0.0.1'})

  client.connect().then(function()
  {
      // send json rpc
      client.send('getstat',).then(function(reply)
      {
          // print complete reply
          console.log(reply)

          for (var i in reply.result) {

            console.log(reply.result[i].temperature);
            console.log(reply.result[i].avg_sol_ps);


            var args = {
                data: { speed: reply.result[i].avg_sol_ps, temp: reply.result[i].temperature },
                headers: { "Content-Type": "application/x-www-form-urlencoded" }
            };

            rest.put("http://auth.x-fisher.org.ua/gpu/" + gpus[reply.result[i].gpu_id], args, function (data, response) {
                console.log(data);
            });

          }

          client.close();
      },
      //transport errors
      function(error)
      {
          console.error(error)
      })
  },
  function(error)
  {
      console.error(error)
  })

}

function cmStats(id) {

  var client = new jsonrpc({ port: 3333, host: '127.0.0.1'})

    client.connect().then(function()
    {
        // send json rpc
        client.send('miner_getstat1',).then(function(reply)
        {
            // print complete reply
            console.log(reply)

            var parts = reply.result[6].split(";");

            var args = {
                data: { speed: reply.result[3], fan: parts[1], temp: parts[0] },
                headers: { "Content-Type": "application/x-www-form-urlencoded" }
            };

            rest.put("http://auth.x-fisher.org.ua/gpu/" + id, args, function (data, response) {
                console.log(data);
            });

            client.close();
        },
        //transport errors
        function(error)
        {
            console.error(error)
        })
    },
    function(error)
    {
        console.error(error)
    })
}
