const next = require('next');
const https = require('https');
const { parse } = require('url');
const fs = require('fs');


const port = 443;
const dev = false;
const app = next({ dev });
const handle = app.getRequestHandler();

const redirectToWWW = (req, res) => {
    const redirectUrl = `https://www.projectwild.space${req.url}`;
    res.writeHead(301, { 'Location': redirectUrl });
    return redirectUrl;
};

let options = {
    key: fs.readFileSync('/etc/letsencrypt/live/www.projectwild.space/privkey.pem', 'utf8'),
    cert: fs.readFileSync('/etc/letsencrypt/live/www.projectwild.space/cert.pem', 'utf8'),
    ca: fs.readFileSync('/etc/letsencrypt/live/www.projectwild.space/chain.pem', 'utf8')
};

app.prepare().then(() => {
    https.createServer(options, (req, res) => {
        const parsedURL = parse(req.url);
        if (req.headers.host != 'www.projectwild.space') {
            redirectToWWW(req, res);
        } else {
            handle(req, res, parsedURL); // Handle request with Next.js
        }
    }).listen(port, err => {
        if (err) throw err
        console.log(`> Ready on localhost:${port}`)
    })
});
