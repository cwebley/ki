var dto = module.exports = {};

dto.positive = function(x, d) {
	var i = parseInt(x || d || 0, 10);
	if (!i) return 0
	if (i < 0) return 0

	return i
}

dto.negative = function(x, d) {
	var i = parseInt(x || d || 0, 10);
	if (!i) return 0;
	if (i > 0) return 0;
	return i;
}

dto.sluggish = function(text){
	var c;
	var character;
	var slug = [];
	for(var i=0; i<text.length; i++){
		character = text.charAt(i);
		c = text.charCodeAt(i);
		if ((c > 47 && c < 58) || (c > 64 && c < 91) || (c > 96 && c < 123)) { 
			slug.push(character);
			continue;
		}
		slug.push('-')
	}
	return slug.join('');
}