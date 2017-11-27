var http = require('http');
var fs = require('fs');
var serveStatic = require('serve-static');
var finalhandler = require('finalhandler');

var serve = serveStatic('client-build', {'index': ['index.html', 'index.htm']})

// mongo
var mongodb = require('mongodb');
var MongoClient = mongodb.MongoClient;
var mongo_url = 'mongodb://localhost:27017/pergamum';

var _db;

MongoClient.connect(mongo_url, function (err, db) {
    if (err) {
        console.log('failed to connect to mongo: ', err);
    } else {
        // connected to mongo
        console.log('connected to mongo: ', mongo_url);
        _db = db;
    }
});

var pergamum_search = require('./pergamum-mongo.js')

// Контекст библиотеки
//var libraryContext = require('./lib-spb-nlr.js');
var libraryContext = require('./lib-moscow-rsl.js');


var pergamumSearchStub = function(searchStr, page, pageSize) {
    return sresult = {
        search: searchStr,
        err: undefined,
        count: 120,
        page: page,
        pageSize: pageSize,
        items: [{
            index: pageSize*(page-1)+1,
            src: "dummy",
            id: pageSize*(page-1)+1,
            leader: "xxx",
            author: "Ф.М. Достоевский",
            bookName: "Преступление и наказание"
        }, {
            index: pageSize*(page-1)+2,
            src: "dummy",
            id: pageSize*(page-1)+2,
            leader: "yyy",
            author: "И.А. Гончаров",
            bookName: "Обломов"
        }, {
            index: pageSize*(page-1)+3,
            src: "dummy",
            id: pageSize*(page-1)+3,
            leader: "zzz",
            author: "Д.И. Фонвизин",
            bookName: "Недоросль"
        }, {
            index: pageSize*(page-1)+4,
            src: "dummy",
            id: pageSize*(page-1)+4,
            leader: "yyy",
            author: "И.А. Гончаров",
            bookName: "Обломов"
        }, {
            index: pageSize*(page-1)+5,
            src: "dummy",
            id: pageSize*(page-1)+5,
            leader: "zzz",
            author: "Д.И. Фонвизин",
            bookName: "Недоросль"
        }, {
            index: pageSize*(page-1)+6,
            src: "dummy",
            id: pageSize*(page-1)+6,
            leader: "yyy",
            author: "И.А. Гончаров",
            bookName: "Обломов"
        }, {
            index: pageSize*(page-1)+7,
            src: "dummy",
            id: pageSize*(page-1)+7,
            leader: "zzz",
            author: "Д.И. Фонвизин",
            bookName: "Недоросль"
        }, {
            index: pageSize*(page-1)+8,
            src: "dummy",
            id: pageSize*(page-1)+8,
            leader: "yyy",
            author: "И.А. Гончаров",
            bookName: "Обломов"
        }, {
            index: pageSize*(page-1)+9,
            src: "dummy",
            id: pageSize*(page-1)+9,
            leader: "zzz",
            author: "Д.И. Фонвизин",
            bookName: "Недоросль"
        }, {
            index: pageSize*(page-1)+10,
            src: "dummy",
            id: pageSize*(page-1)+10,
            leader: "zzz",
            author: "Д.И. Фонвизин",
            bookName: "Недоросль"
        }]
    };
}

http.createServer(function (req, res) {
    console.log("request: " + decodeURIComponent(req.url));
    if(req.url.startsWith("/api/search/")) {
        // поисковый запрос:
        // /api/search/str
        // /api/search/str/page_num
        var requestParts = decodeURIComponent(req.url).split('/');
        
        // строка запроса
        var searchStr = requestParts[3];
        
        // страница
        var pageNumberStr = requestParts.length > 4 ? requestParts[4] : 1;
        var pageNumber = parseInt(pageNumberStr);
        pageNumber = pageNumber > 0 ? pageNumber : 1;
        var pageSize = 10;
        
        //var sresult = pergamumSearchStub(searchStr, pageNumber, pageSize);
        // ответ отправляем в колбэке на найденные записи
        //res.writeHead(200, {'Content-Type': 'text/json'});
        //res.end(JSON.stringify(sresult));
        
        pergamum_search(_db, libraryContext, searchStr, pageNumber, pageSize, function(err, sresult) {
            if(!err) {
                console.log("Found: " + sresult.count);
                
                // ответ отправляем в колбэке на найденные записи
                res.writeHead(200, {'Content-Type': 'text/json'});
                res.end(JSON.stringify(sresult));
            } else {
                console.log(err);
                
                res.writeHead(200, {'Content-Type': 'text/json'});
                res.end(JSON.stringify({err: err.message}));
            }
        });
    } else if(req.url.startsWith("/s/")) {
        fs.readFile("./client-build/index.html", function(err, content) {
            if(!err) {
                res.writeHead(200, {'Content-Type': 'text/html'});
                res.end(content, 'utf-8');
            } else {
                res.writeHead(500, {'Content-Type': 'text/html'});
                res.end(err.message, 'utf-8');
                console.log(err);
            }
        });
    } else {
        serve(req, res, finalhandler(req, res));
    }
}).listen(3000);

console.log('Server running at http://localhost:3000/');

