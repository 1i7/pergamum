//lets require/import the mongodb native drivers.
var mongodb = require('mongodb');

//We need to work with "MongoClient" interface in order to connect to a mongodb server.
var MongoClient = mongodb.MongoClient;

// Connection URL. This is where your mongodb server is running.
var db_url = 'mongodb://localhost:27017/pergamum';

/**
 * Импортировать файл json в базу mongo
 * @param db_url - url базы данных
 * @param lib - имя библиотеки (коллекция внутри базы)
 * @param file - имя или путь к файлу в формате json с массивом данных для импорта
 * @param drop_lib - true: удалить коллекцию с указанным имененем lib перед импортом,
 *     false: добавить записи к существующим (по умолчанию)
 */
var json2mongo = function(db_url, lib, file, drop_lib, callback) {
    MongoClient.connect(db_url, function (err, db) {
        if (err) {
            console.log('Failed to connect: ', err);
            if(callback) callback(err);
        } else {
            console.log('Connected to ', db_url);

            // Get the documents collection
            var collection = db.collection(lib);
            
            if(drop_lib) {
                // https://docs.mongodb.com/manual/reference/method/db.collection.drop/
                collection.drop();
            }
            // читаем строки из файла json, сгенерированного из файла mrc
            // https://www.npmjs.com/package/filereader
            // https://github.com/node-file-api/file-api
            // https://stackoverflow.com/questions/39941583/electron-open-file-from-menu
            // https://stackoverflow.com/questions/9346052/difference-between-readasbinarystring-and-readastext-using-filereader
            
            var FileReader = require('file-api').FileReader;
            var File = require('file-api').File;
            var reader = new FileReader();
            reader.onload = function (e) {
                var fileStr = e.target.result;
                //console.log(fileStr);
                
                console.log("Parse string as JSON: " + file);
                var booksEntries = JSON.parse(fileStr);
                
                console.log("Insert JSON to db: " + lib);
                collection.insert(booksEntries, function (err, result) {
                    if (err) {
                        console.log(err);
                        if(callback) callback(err);
                    } else {
                        //console.log('Inserted: ', result);
                        if(callback) callback(undefined, result);
                    }
                    db.close();
                });
            }.bind(this);
            reader.readAsText(new File(file));
        }
    });
};


var libs = [
    // Петербург, Национальная российская библиотека (NLR)
    {lib: 'lib-spb-nlr-test1-mrcjson', file: "./libs/spb-nlr/spb-nlr-test1.json", drop_lib: true},

    // Москва, Российская государственная библиотека (RSL)
    
    // файлы по 100000 записей: x100000
//    {lib: 'lib-moscow-rsl-mrcjson', file: "../../libs/moscow-rsl/x100000/json/moscow-rsl-0001.json", drop_lib: true},
    
    // файлы по 50000 записей: x50000
    {lib: 'lib-moscow-rsl-mrcjson', file: "../../libs/moscow-rsl/x50000/json/moscow-rsl-0001.json", drop_lib: true},
    {lib: 'lib-moscow-rsl-mrcjson', file: "../../libs/moscow-rsl/x50000/json/moscow-rsl-0002.json", drop_lib: false},
    
    // файлы по 10000 записей: x10000
//    {lib: 'lib-moscow-rsl-mrcjson', file: "../../libs/moscow-rsl/x10000/json/moscow-rsl-0001.json", drop_lib: true},
//    {lib: 'lib-moscow-rsl-mrcjson', file: "../../libs/moscow-rsl/x10000/json/moscow-rsl-0002.json", drop_lib: false},
//    {lib: 'lib-moscow-rsl-mrcjson', file: "../../libs/moscow-rsl/x10000/json/moscow-rsl-0003.json", drop_lib: false},
//    {lib: 'lib-moscow-rsl-mrcjson', file: "../../libs/moscow-rsl/x10000/json/moscow-rsl-0004.json", drop_lib: false},
//    {lib: 'lib-moscow-rsl-mrcjson', file: "../../libs/moscow-rsl/x10000/json/moscow-rsl-0005.json", drop_lib: false},
//    {lib: 'lib-moscow-rsl-mrcjson', file: "../../libs/moscow-rsl/x10000/json/moscow-rsl-0006.json", drop_lib: false},
//    {lib: 'lib-moscow-rsl-mrcjson', file: "../../libs/moscow-rsl/x10000/json/moscow-rsl-0007.json", drop_lib: false},
//    {lib: 'lib-moscow-rsl-mrcjson', file: "../../libs/moscow-rsl/x10000/json/moscow-rsl-0008.json", drop_lib: false},
//    {lib: 'lib-moscow-rsl-mrcjson', file: "../../libs/moscow-rsl/x10000/json/moscow-rsl-0009.json", drop_lib: false},
//    {lib: 'lib-moscow-rsl-mrcjson', file: "../../libs/moscow-rsl/x10000/json/moscow-rsl-0010.json", drop_lib: false}
];

// подряд
var batch_import_libs = function(db_url, libs) {
    var i = 0;
    var import_next = function() {
        if(i < libs.length) {
            var lib= libs[i];
            i++;
            console.log("import: to=" + lib.lib + " from='" + lib.file + "' drop old=" + lib.drop_lib);
            json2mongo(db_url, lib.lib, lib.file, lib.drop_lib, function() {
                import_next();
            });
        } else {
            console.log("DONE");
        }
    }
    import_next();
}

batch_import_libs(db_url, libs);



// Петербург, Национальная российская библиотека (NLR)
//json2mongo(url, 'lib-spb-nlr-test1-mrcjson', "./libs/spb-nlr/spb-nlr-test1.json", true);

// Москва, Российская государственная библиотека (RSL)
//json2mongo(url, 'lib-moscow-rsl-test1-mrcjson', "./libs/moscow-rsl/moscow-rsl-test1.json", true);

//json2mongo(url, 'lib-moscow-rsl-mrcjson', "../../libs/moscow-rsl/json/moscow-rsl-0001.json", true);
//json2mongo(url, 'lib-moscow-rsl-mrcjson', "../../libs/moscow-rsl/json/moscow-rsl-0002.json", false);
//json2mongo(url, 'lib-moscow-rsl-mrcjson', "../../libs/moscow-rsl/json/moscow-rsl-0001.json", false);
//json2mongo(url, 'lib-moscow-rsl-mrcjson', "../../libs/moscow-rsl/json/moscow-rsl-0002.json", false);
//json2mongo(url, 'lib-moscow-rsl-mrcjson', "../../libs/moscow-rsl/json/moscow-rsl-0003.json", false);
//json2mongo(url, 'lib-moscow-rsl-mrcjson', "../../libs/moscow-rsl/json/moscow-rsl-0004.json", false);
//json2mongo(url, 'lib-moscow-rsl-mrcjson', "../../libs/moscow-rsl/json/moscow-rsl-0005.json", false);
//json2mongo(url, 'lib-moscow-rsl-mrcjson', "../../libs/moscow-rsl/json/moscow-rsl-0006.json", false);
//json2mongo(url, 'lib-moscow-rsl-mrcjson', "../../libs/moscow-rsl/json/moscow-rsl-0007.json", false);
//json2mongo(url, 'lib-moscow-rsl-mrcjson', "../../libs/moscow-rsl/json/moscow-rsl-0008.json", false);
//json2mongo(url, 'lib-moscow-rsl-mrcjson', "../../libs/moscow-rsl/json/moscow-rsl-0009.json", false);
//json2mongo(url, 'lib-moscow-rsl-mrcjson', "../../libs/moscow-rsl/json/moscow-rsl-0010.json", false);

