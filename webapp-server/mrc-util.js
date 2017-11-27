
///////////////////////////////////////
// Вспомогательные вызовы для работы с MRC-JSON 

/**
 * Извлечь значение элемента внутри массива subfields из объекта JSON вида:
 *   {
 *     ...
 *     "fields": [
 *       {
 *         "245": {
 *           ...
 *           "subfields": [
 *             {"a": "\"Братья-мусульмане\" на общественно-политической арене Египт\nа и Сирии в 1928-1963 гг. :"},
 *             { "b": "автореферат дис. ... кандидата исторических наук : 07.00.03"},
 *             {"c": "Абдувахитов Абдужабар Абдусаттарович ; Ташк. гос. ун-т"}
 *           ]
 *         }
 *       },
 *     ...
 *     ]
 *   }
 * @param item - корневой элемент - объект JSON
 * @param field - имя элемента внутри массива "fields"
 * @param subfield - имя элемента внутри массива "subfields"
 * @return значение элемента subfield или undefiled, если элемент не найден
 */
var mrcjson_extract_subfield = function(item, field, subfield) {
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/find
    var _subfield = undefined;

    if(item["fields"]) {
        var _field = item["fields"].find(function(elem){
            return elem.hasOwnProperty(field);
        });
        if(_field && _field[field]["subfields"]) {
            var _subfields = _field[field]["subfields"];
            
            var _subfield = _subfields.find(function(elem){
                return elem.hasOwnProperty(subfield);
            });
            _subfield = _subfield ? _subfield[subfield] : undefined;
        }
    }
    return _subfield;
}

module.exports = mrcjson_extract_subfield;

