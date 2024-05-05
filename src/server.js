const http = require("http");
const url = require('url');

const host = '0.0.0.0';
const port = 8000;

const api_key = "EOOEMOW4YR6QNB07";

async function login(email, password) {
    const response = await fetch('https://prod.zodiac-io.com/users/v1/login', {
        method: 'POST',
        body: JSON.stringify({
            api_key: api_key,
            email: email,
            password: password,
        }),
        headers: {
            'Content-type': 'application/json; charset=UTF-8',
        }
    }).catch((err) => {
        console.error(err)
        return null;
    })

    return  response !== null && response.status === 200 ? await response.json() : null;
}

async function getDeviceStatus(email, password, sn) {
    const loginResponse = await login(email, password);
    if (loginResponse === null) {
        return 'Login failed';
    }

    const response = await fetch('https://prod.zodiac-io.com/devices/v1/'+sn+'/shadow', {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Authorization': loginResponse.userPoolOAuth.IdToken,
            'User-Agent': 'okhttp/3.12.0',
            'Accept-Encoding': 'gzip'
        },
    }).catch((err) => {
        console.error(err)
        return 'Timeout';
    })

    return  await response.json();
}

async function sendCmd(email, password, sn, cmd) {
    const loginResponse = await login(email, password);
    if (loginResponse === null) {
        return 'Login failed';
    }

    const response = await fetch('https://prod.zodiac-io.com/devices/v1/'+sn+'/shadow', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Authorization': loginResponse.userPoolOAuth.IdToken,
            'User-Agent': 'okhttp/3.12.0',
            'Accept-Encoding': 'gzip'
        },
        body: JSON.stringify(cmd)
    }).catch((err) => {
        console.error(err)
        return 'Timeout';
    })

    return  await response.json();
}

async function startStopFiltration(email, password, sn, start) {
    cmd = {
        state: {
            desired: {
                equipment: {
                    swc_0: {
                        production: start
                    }
                }
            }
        }
    }

    return  await sendCmd(email, password, sn, cmd);
}

async function startStopHeating(email, password, sn, start) {
    cmd = {
        state: {
            desired: {
                heating: {
                    enabled: start
                }
            }
        }
    }

    return  await sendCmd(email, password, sn, cmd);
}

async function startBoost(email, password, sn) {
    cmd = {
        state: {
            desired: {
                equipment: {
                    swc_0: {
                        boost: 1
                    }
                }
            }
        }
    }

    return  await sendCmd(email, password, sn, cmd);
}

async function setHeatTemp(email, password, sn, temp) {
    cmd = {
        state: {
            desired: {
                heating: {
                    sp: temp
                }
            }
        }
    }

    return  await sendCmd(email, password, sn, cmd);
}

const server = http.createServer();
server.on('request', async (req, res) => {
    const params = url.parse(req.url, true).query;
    const pathname = url.parse(req.url, true).pathname

    let response = '';
    if (params.email === undefined) {
        response = 'Email is required';
    } else if (params.password === undefined) {
        response = 'Password is required';
    } else if (params.sn === undefined) {
        response = 'Serial number is required';
    } else {
        if (pathname === '/') {
            response = await getDeviceStatus(params.email, params.password, params.sn);
        } else if (pathname === '/start') {
            response = await startStopFiltration(params.email, params.password, params.sn, 1);
        } else if (pathname === '/stop') {
            response = await startStopFiltration(params.email, params.password, params.sn, 0);
        } else if (pathname === '/boost') {
            response = await startBoost(params.email, params.password, params.sn);
        } else if (pathname === '/heat-start') {
            response = await startStopHeating(params.email, params.password, params.sn, 1);
        } else if (pathname === '/heat-stop') {
            response = await startStopHeating(params.email, params.password, params.sn, 0);
        } else if (pathname === '/heat-temp' && params.temp !== undefined) {
            response = await setHeatTemp(params.email, params.password, params.sn, parseInt(params.temp));
        } else {
            response = 'Unsupported request';
        }
    }

    res.setHeader("Content-Type", "text/plain");
    res.writeHead(200);
    res.end(JSON.stringify(response));
});

server.listen(port, host, () => {
    console.log(`Server is running on http://${host}:${port}`);
});