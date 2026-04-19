
const http = require('http');
const path = require('path');
const fs = require('fs');
const fsPromises = require('fs').promises;

const logEvents = require('./logEvents');
const EventEmitter = require('events');
class Emitter extends EventEmitter { };
// initialize object
const myEmitter = new Emitter();
myEmitter.on('log', (msg, fileName) => logEvents(msg, fileName));
const PORT = process.env.PORT || 3500;

const serveFile = async (FilePath, contentType, response) => {
    try {
        // const data = await fsPromises.readFile(FilePath, 'utf8');
        // response.writeHead(200, { 'Content-Type': contentType });
        // response.end(data)
        const rawData = await fsPromises.readFile(FilePath, !contentType.includes('image') ? 'utf-8' : '');
        const data = contentType === 'application/json' ? JSON.parse(rawData) : rawData;
        response.writeHead(FilePath.includes('404.html') ? 404 : 200, { 'Content-Type': contentType });
        response.end(contentType === 'application/json' ? JSON.stringify(data) : data);
    } catch (err) {
        console.log(err);
        myEmitter.emit('log', `${err.name}: ${err.message}`, 'errLog.txt');
        response.statusCode = 500;
        response.end();
    }
};

const server = http.createServer((req, res) => {
    console.log(req.url, req.method);
    myEmitter.emit('log', `${req.url}\t${req.method}`, 'reqLog.txt');

    // let FilePath;

    // this could work but its notefficient, we will use switch statement instead
    // if (req.url === '/' || req.url === '/index.html') {
    //     res.statusCode = 200;
    //     res.setHeader('Content-Type', 'text/html');
    //     FilePath = path.join(__dirname, 'views', 'index.html');
    //     fs.readFile(FilePath, 'utf-8', (err, data) => {
    //         res.end(data);
    //     });
    // }

    // this could also work but we would have a case for every value that came in, also you have to think of every file that can be requested
    // it takes a lot of space an its not dynamic
    // switch (req.url) {
    //     case '/':
    //         res.statusCode = 200;
    //         FilePath = path.join(__dirname, 'views', 'index.html');
    //         fs.readFile(FilePath, 'utf-8', (err, data) => {
    //             res.end(data);
    //         });
    //         break;
    // }

    const extension = path.extname(req.url);

    let contentType;

    switch (extension) {
        case '.css':
            contentType = 'text/css';
            break;
        case '.js':
            contentType = 'text/javascript';
            break;
        case '.json':
            contentType = 'application/json';
            break;
        case '.jpg':
            contentType = 'image/jpeg';
            break;
        case '.png':
            contentType = 'image/png';
            break;
        case '.txt':
            contentType = 'text/plain';
            break;
        default:
            contentType = 'text/html';
    }

    let FilePath =
        contentType === 'text/html' && req.url === '/'
            ? path.join(__dirname, 'views', 'index.html')
            : contentType === 'text/html' && req.url.slice(-1) === '/'
                ? path.join(__dirname, 'views', req.url, 'index.html')
                : contentType === 'text/html'
                    ? path.join(__dirname, 'views', req.url)
                    : path.join(__dirname, req.url);

    // makes .html extension not requires in the browser,
    if (!extension && req.url.slice(-1) !== '/') FilePath += '.html';

    const fileExists = fs.existsSync(FilePath);

    if (fileExists) {
        serveFile(FilePath, contentType, res);
        // res.statusCode = 200;
        // res.setHeader('Content-Type', contentType);
    } else {
        // res.statusCode = 404;
        // res.setHeader('Content-Type', 'text/html');
        // FilePath = path.join(__dirname, 'views', '404.html');
        switch (path.parse(FilePath).base) {
            case 'old.html':
                res.writeHead(301, { 'Location': '/new-page.html' });
                res.end();
                break;
            case 'www-page.html':
                res.writeHead(301, { 'Location': '/' });
                res.end();
                break;
            default:
                // serve a 404 response 
                serveFile(path.join(__dirname, 'views', '404.html'), 'text/html', res);
        }
    };


});

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));