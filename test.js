var vash = require('vash');
var tpl = vash.compile('<p>I am a @model.forEach(function(item){@item})!</p>');

var out = tpl([1,2,3]);
console.log(out);