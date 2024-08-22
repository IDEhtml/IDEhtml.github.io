const CSSJS = (()=>{

	const CHAR_START = '{', CHAR_END = '}';

	function contentToJs(css){
	    if(!css) return {};
	    let result = {};
	    let patern_item = /(.*?):(.*?);/g;
	    css.replace(patern_item, function(m, _g1, _g2){
	        result[_g1.trim()] = _g2.trim();
	    })
	    return result;
	}

	function cotentToCss(obj, space = '\t'){
	   let css = Object.keys(obj).reduce((acc, key) => (
	        acc + space + key.split(/(?=[A-Z])/).join('-').toLowerCase() + ':' + obj[key] + ';'
	    ), '');
	   css = css.replaceAll('\n', '').replaceAll(';', ';\n');
	   return css;
	}

	function toCss(obj){
		let css = '';
		for(let i in obj){
			let item = obj[i];
			if(typeof item[Object.keys(item)[0]] == 'object')
				css += `${i}{\n${toCss(item)}}\n`;
			else
				css += `${i}{\n${cotentToCss(item)}}\n`;
		}

		return css;
	}

	function toJs(css){

		if(!css) return {};

		let _css = css.replace(/\/\*.*?\*\//gs, '');

		let has_child = 0;
		let result = {};
		let pattern = /([\s\S]+?){(.*?)}/sg;
		let tmp_value = '';
		let tmp_id = '';
		_css.replace(pattern, (m, g1, g2)=>{
			let _g1 = g1.replaceAll(CHAR_END, '').trim();
			if(g2.includes(CHAR_START) && !has_child){
				has_child = 1;
				tmp_id = _g1;
				m = g2+CHAR_END;
			}
			if(has_child){
				if(g1.includes(CHAR_END)){
					result[[tmp_id.trim()]] = toJs(tmp_value)
					if(!g2.includes(CHAR_START)){
						result[[_g1]] = contentToJs(g2);
						tmp_value = '';
						has_child = 0;
					}else{
						tmp_id = _g1;
						tmp_value = g2+CHAR_END;
					}
				}else{
					tmp_value += m;
				}
			}
			else
				result[[_g1]] = contentToJs(g2);
		});

		if(has_child)
			result[[tmp_id]] = toJs(tmp_value)

		return result;
	}

	return {toCss, toJs};

})();