
/**
 * @param mongodbConnection mongo db connection instance
 * @param libraryContext
 */
var pergamum_search = function(mongodbConnection, libraryContext, searchStr, page, pageSize, callback) {
    // ответ
    var sresult = {
        search: searchStr,
        count: 0,
        page: page,
        pageSize: pageSize,
        items: []
    };
    
    if(!mongodbConnection) {
        // почему-то не успели подключиться
        callback(new Error("Not connected to db"));
    } else {
        // делаем запрос в базу данных
        var collection = mongodbConnection.collection(libraryContext.db_collection);
        
        // https://docs.mongodb.com/master/reference/method/js-cursor/
        var cursor = libraryContext.find(collection, searchStr);
        
        // выбор страницы
        cursor.skip(pageSize*(page-1)).limit(pageSize);
        
        // https://docs.mongodb.com/master/reference/method/cursor.count/#cursor.count
        // applySkipLimit=false
        // по умолчанию и так должен быть выключен, но, похоже, в более новых версиях mongo
        // (у нас на убунте 14.04 mongo-2.4.9)
        cursor.count(false, function(err, count) {
            if(err) {
                callback(err);
                
                // закрываем курсор
                cursor.close();
            } else {
                sresult.count = count;
            
                // сначала посчитали записи, потом берем значения
                cursor.toArray(function (err, result) {
                    if (err) {
                        callback(err);
                    } else {
                        for (i = 0; i < result.length; i++) {
                            var record = libraryContext.extract(result[i]);
                            record.index = (pageSize*(page-1) + (i+1));
                            sresult.items.push(record);
                        }
                        // колбэк
                        callback(undefined, sresult);
                    }
                    
                    // закрываем курсор
                    cursor.close();
                });
            }
        });
    }
}

module.exports = pergamum_search;

