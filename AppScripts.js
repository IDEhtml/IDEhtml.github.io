const AppScripts = (()=>{

	let target = new _$;

	let target_css = new _$('style');
	let target_js = new _$('script');

	target.append(target_css, target_js);

	let self = {
		target,
		getStyleCode, setStyleCode, getStyles, setStyles, addStyle, removeStyle,
		getScriptCode, getScripts, setScript, setScripts
	};

	let styles = {};

	let scripts = {};

	function toCode(){
		let result = '';
		for(let i in styles){
			result += `${i}{\n${objToCss(styles[i], '  ')}}\n`;
		}
		return result;
	}

	function getStyleCode(){
		return target_css.innerHTML;
	}

	function setStyleCode(code){
		styles = regexCss(code);
		for(let i in styles){
			styles[i] = cssToObj(styles[i].replaceAll('\t', ''));
		}
		target_css.innerHTML = code;
	}

	function getStyles(keys){
		let value = {};
		keys.map(item=>{
			if(styles[item])
				value[item] = styles[item];
		});
		return value;
	}

	function setStyles(styles, is_append = 1){
		for(let i in styles){
			addStyle(i, styles[i], is_append);
		}
	}

	function addStyle(key, value, is_append){
		if(is_append)
			styles[key] = {...styles[key], ...value};
		else
			styles[key] = value;
		target_css.innerHTML = toCode();
		ElementScripts.code_css.value = target_css.innerHTML;
	}

	function removeStyle(key){
		delete styles[key];
		target_css.innerHTML = toCode();
	}

	function setScript(code){
		target_js.remove();
		target_js = new _$('script', code);
		target.append(target_js);
	}

	function setScripts(scripts){
		let js = regexJs(target_js.innerHTML);
		let funs = {...scripts, ...js};
		let code = '';
		for(let i in funs){
			code += `function ${i}(){ ${funs[i]} }`;
		}

		setScript(code);
	}

	function getScriptCode(){
		return target_js.innerHTML;
	}

	function getScripts(keys){
		let value = {};
		let funs = regexJs(target_js.innerHTML);
		for(let i in keys){
			let key = keys[i];
			value[key] = funs[key];
		}
		return value;
	}

	return self;

})();