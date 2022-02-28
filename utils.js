function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min)
}

function serverStatus () {
    if (getRandomInt(1, 100) >= 40) {
        return 'OK';
    }
    else if (getRandomInt(1, 100) >= 50) {
        return 'ERROR_CODE_500';
    }
    else {
        return 'FROZEN';
    }
}

function medianPings(pings) {
    let median = 0;
    let len = pings.length;

    if (!len) {
        return 0;
    }
    pings.sort((a, b) => a - b);

   if (len % 2) {
        median = pings[Math.floor(len / 2)];
    } else {
        median = Math.round((pings[len / 2] + pings[len / 2 - 1])/ 2);
    }
    return median;
}

function averagePings(pings) {
    if (!pings.length) {
        return 0;
    }
    const sum = pings.reduce((prev, cur) => prev + cur, 0);
    return Math.round(sum / pings.length);
}

module.exports = { serverStatus, medianPings, averagePings };