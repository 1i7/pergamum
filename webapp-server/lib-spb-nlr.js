
var mrcjson_extract_subfield = require('./mrc-util.js');

//////////////////////////////////////////////////////////
// Российская национальная библиотека, Санкт-Петербург
// SPB NLR

var find_spb_nlr_mrcjson = function(collection, searchStr) {
    // Поищем какие-нибудь записи
    // https://docs.mongodb.com/manual/reference/operator/query/
    // https://docs.mongodb.com/manual/reference/operator/query/regex/#op._S_regex
    // https://docs.mongodb.com/manual/reference/operator/query/text/#op._S_text
    // https://stackoverflow.com/questions/3305561/how-to-query-mongodb-with-like
    // https://stackoverflow.com/questions/17353864/query-with-like-in-mongodb-from-using-node-js
    // https://docs.mongodb.com/manual/tutorial/query-arrays/
    // https://docs.mongodb.com/manual/tutorial/query-array-of-documents/
    // https://stackoverflow.com/questions/10754888/combining-regex-and-embedded-objects-in-mongodb-queries
    
    //collection.find({"=260": '\\\\$aЛенинград$c1987'}).toArray(function (err, result) {
    //collection.find({"=260": /Ленинград/}).toArray(function (err, result) {
    //collection.find({"=260": /1987/}).toArray(function (err, result) {
    //collection.find({"=260": new RegExp(searchStr, 'i')}).toArray(function (err, result) {
    
    //collection.find({"fields.702.subfields.4": "570"}).toArray(function (err, result) {
    //collection.find({"fields.702.subfields.a": searchStr}).toArray(function (err, result) {
    //collection.find({"fields.702.subfields": {$elemMatch: {"a": new RegExp(searchStr, 'i')}}}).toArray(function (err, result) {
    return collection.find({$or: [
            {"fields.702.subfields": {$elemMatch: {"a": new RegExp(searchStr, 'i')}}},
            {"fields.200.subfields": {$elemMatch: {$or: [
                {"a": new RegExp(searchStr, 'i')},
                {"e": new RegExp(searchStr, 'i')},
                {"f": new RegExp(searchStr, 'i')}
            ]}}}
    ]});
};

var extract_spb_nlr_mrcjson = function(item) {
    //console.log(result[i]);
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/find
    
    var leader = undefined;
    var author = undefined;
    var bookName = undefined;
    
    leader = item["leader"];
    
    // 702 - автор
    // 702.a - имя
    // 702.b - инициалы
    var _702_a = mrcjson_extract_subfield(item, "702", "a");
    var _702_b = mrcjson_extract_subfield(item, "702", "b");
    if(_702_a) {
        author = _702_a + (_702_b ? _702_b : "");
    }
    
    // 200 - название
    var _200_a = mrcjson_extract_subfield(item, "200", "a");
    var _200_e = mrcjson_extract_subfield(item, "200", "e");
    var _200_f = mrcjson_extract_subfield(item, "200", "f");
    
    if(_200_a || _200_e || _200_f) {
        bookName = _200_a + ", " + _200_e + ", " + _200_f;
    }
    
    return {src: "spb-nlr", id: leader, leader: leader, author: author, bookName: bookName};
}


// Российская национальная библиотека, Санкт-Петербург (NLR)
var lib_spb_nlr = {
    db_collection: "lib-spb-nlr-mrcjson",
    find: find_spb_nlr_mrcjson,
    extract: extract_spb_nlr_mrcjson
}

var lib_spb_nlr_test1 = {
    db_collection: "lib-spb-nlr-test1-mrcjson",
    find: find_spb_nlr_mrcjson,
    extract: extract_spb_nlr_mrcjson
}

module.exports = lib_spb_nlr;


