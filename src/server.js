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
    })

    return  response.status === 200 ? await response.json() : null;
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
    })

    return  await response.json();
}

const server = http.createServer();
server.on('request', async (req, res) => {
    const params = url.parse(req.url, true).query;

    let response = '';
    if (params.email === undefined) {
        response = 'Email is required';
    } else if (params.password === undefined) {
        response = 'Password is required';
    } else if (params.sn === undefined) {
        response = 'Serial number is required';
    } else {
        response = await getDeviceStatus(params.email, params.password, params.sn);
    }

    res.setHeader("Content-Type", "text/plain");
    res.writeHead(200);
    res.end(JSON.stringify(response));
});

server.listen(port, host, () => {
    console.log(`Server is running on http://${host}:${port}`);
});