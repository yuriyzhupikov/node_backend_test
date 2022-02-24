const http = require('http');

const requestServerOptions = {
    hostname: 'localhost',
    port: '8080',
    path: '/data',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    }
};

const requestSiteOptions = {
    hostname: 'fundraiseup.com',
    path: '/',
    method: 'GET'
};

const postData = {};

function startClient() {
    let isLastRequestGoodServer = true;

    let deliveryAttempt = 1;

    let pingId = 1;
    let pingSite;
    let timeBeforeResponseSite;
    let timeAfterResponseSite;
    let lastResponseServer = Date.now();

    let timeoutServer = 10000;
    let intervalBetweenRequests;

    let countRequestTotal = 0;
    let countRequest200 = 0;
    let countRequest500 = 0;

    let repeater = setTimeout(function requestAndSend() {
        countRequestTotal++;

        if (isLastRequestGoodServer) {
            pingId++;
            timeBeforeResponseSite = Date.now();
            deliveryAttempt = 1;

            intervalBetweenRequests = 1000;
        }

        //***************** Запрос на сайт *****************//
        const requestToSite = http.request(requestSiteOptions, () => {
            timeAfterResponseSite = Date.now();

            // Если сервер не отвечал, то новый пинг не вычисляем
            pingSite = isLastRequestGoodServer ? (timeAfterResponseSite - timeBeforeResponseSite) : pingSite;

            postData['pingId'] = pingId;
            postData['deliveryAttempt'] = deliveryAttempt;
            postData['data'] = Date.now();
            postData['responseTime'] = pingSite;

            console.log('Client:', isLastRequestGoodServer ? 'Отправка данных на server' : 'Повторная отправка данных на сервер');

            //***************** Запрос на сервер *****************//
            const requestServer = http.request(requestServerOptions);

            requestServer.on('response', res => {
                lastResponseServer = Date.now();

                if (res.statusCode === 200) {
                    let dataFromServer='';

                    res.on('data', chunk => dataFromServer += chunk);
                    res.on('end', () => console.log('Server:', dataFromServer));

                    countRequest200++;
                    isLastRequestGoodServer = true;
                }
                else {
                    console.log(`Сервер: код ответа: ${res.statusCode} - ${res.statusMessage}`);

                    deliveryAttempt++;
                    countRequest500++;
                    intervalBetweenRequests *= 2;
                    isLastRequestGoodServer = false;
                }
            });

            requestServer.on('error', e => {
                console.log('Перезапустите сервер');
            });

            // Отправка данных на сервер
            let stringPostData = JSON.stringify(postData);
            requestServer.write(stringPostData);
            requestServer.end();

            if (Date.now() - lastResponseServer >= timeoutServer) {
                console.log(`Клиент: сервер не отвечал ${timeoutServer} mc`);
                console.log('!Клиент отключился от сервера!\n');
                console.log('============ Отчёт ============');
                console.log('Всего запросов:', countRequestTotal-1);
                console.log('Успешных:', countRequest200);
                console.log('С ошибкой 500:', countRequest500);
                console.log('Зависшех:', countRequestTotal - (countRequest200 + countRequest500) - 1);
                console.log('========= Конец отчёта =========');
                process.exit(1);
            }
        });

        requestToSite.on('error', e => console.error(`Проблема с запросом: ${e.message}`));
        requestToSite.end();

        repeater = setTimeout(requestAndSend, intervalBetweenRequests);
    }, intervalBetweenRequests);
}

startClient();