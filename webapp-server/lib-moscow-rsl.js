
var mrcjson_extract_subfield = require('./mrc-util.js');

//////////////////////////////////////////////////////////
// Российская государственная библиотека, Москва
// Russian state library (RSL), Moscow

var find_moscow_rsl_mrcjson = function(collection, searchStr) {
    console.log("find in " + collection + " " + searchStr);
    // Поищем какие-нибудь записи
    // https://docs.mongodb.com/manual/reference/operator/query/
    // https://docs.mongodb.com/manual/reference/operator/query/regex/#op._S_regex
    // https://docs.mongodb.com/manual/reference/operator/query/text/#op._S_text
    // https://stackoverflow.com/questions/3305561/how-to-query-mongodb-with-like
    // https://stackoverflow.com/questions/17353864/query-with-like-in-mongodb-from-using-node-js
    // https://docs.mongodb.com/manual/tutorial/query-arrays/
    // https://docs.mongodb.com/manual/tutorial/query-array-of-documents/
    // https://stackoverflow.com/questions/10754888/combining-regex-and-embedded-objects-in-mongodb-queries
    
    // 245 - название
    // 245.a - название
    // 245.b - тип
    // 245.c - автор
    //collection.find({"fields.245.subfields":{$elemMatch: {"a": /Бра/}}});
    var regex = new RegExp(searchStr, 'i');
    return collection.find({$or: [
        {"fields.245.subfields": {$elemMatch: {$or: [
            {"a": regex},
            {"b": regex},
            {"c": regex}
        ]}}}
    ]});
};

var extract_moscow_rsl_mrcjson = function(item) {
    // 245 - название
    // 245.a - название
    // 245.b - тип
    // 245.c - автор
    
    var leader = undefined;
    var author = undefined;
    var bookName = undefined;
    
    // id записи
    leader = item["leader"];
    
    // 245 - название + автор
    var _245_a = mrcjson_extract_subfield(item, "245", "a");
    var _245_b = mrcjson_extract_subfield(item, "245", "b");
    var _245_c = mrcjson_extract_subfield(item, "245", "c");
    
    bookName = _245_a + " " + _245_b;
    author = _245_c;
    
    return {leader: leader, author: author, bookName: bookName};
}

// Российская государственная библиотека (RSL)
var lib_moscow_rsl = {
    db_collection: "lib-moscow-rsl-mrcjson",
    find: find_moscow_rsl_mrcjson,
    extract: extract_moscow_rsl_mrcjson
}

var lib_moscow_rsl_test1 = {
    db_collection: "lib-moscow-rsl-test1-mrcjson",
    find: find_moscow_rsl_mrcjson,
    extract: extract_moscow_rsl_mrcjson
}

module.exports = lib_moscow_rsl;

