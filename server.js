const http = require('http');
const { serverStatus, medianPings, averagePings } = require("./utils");

const pings = [];

function startServer() {
    const server = http.createServer((req, res) => {

        const status = serverStatus();

        if (status === 'OK') {
            if (req.url === '/data' && req.method === 'POST') {
                let dataFromClient ='';
                req.on('data', chunk => dataFromClient += chunk);
                req.on('end', () => {
                    console.log(dataFromClient);
                    const dataParse = JSON.parse(dataFromClient);

                    pings[pings.length] = dataParse['responseTime'];
                });
                res.writeHead(200);
                res.end('OK');
            }
        }
        else if (status === 'ERROR_CODE_500') {
            res.writeHead(500, 'Internal server error');
            res.end();
        }

    });
    server.listen(8080);

    process.stdin.resume();
    process.on('SIGINT', function () {

        server.close(() => {
            console.log('\n');
            console.log('!Сервер остановлен!');
            console.log('============ Отчёт ============');
            console.log('Среднее время пинга:', averagePings(pings));
            console.log('Медианное время пинга:', medianPings(pings));
            console.log('========= Конец отчёта =========');

            process.exit(1);
        });
    });
}

startServer();