function ElementDesign(tag = 'div'){
	
	let target = new _$(tag, '');

	let self = {target, getOptions, getClass, setOptions, remove};

	target.onupdate = function(){
		ElementHtml.value = target.outerHTML;
	}

	AttackElementDesign.target = self;

	target.onclick = function(e){
		if(e.target !== target) return;
		AttackElementDesign.target = self;
	}

	target.setTag = function(name){

		// has bug fixed
		let elementdesign = ElementDesign(name);

		// remove all attributes
		// target.innerHTML = '';
		while(target.attributes.length > 0)
		    target.removeAttribute(target.attributes[0].name);

		let new_options = Object.assign({}, TAGS[name] || TAGS['div']) || {};

		// extends old options
		for(let i in new_options){
			new_options[i] = target.options[i] || new_options[i];
		}

		new_options['childs'] = target.options['childs'];

		target = changeTagName(target, elementdesign.target)
		target.options = new_options;
		AttackElementDesign.target = elementdesign;

	}

	function _getOptions(_target){

		let options = _target.options || {};
		var children = _target.children;

		if(!children.length)
			return options;

		options.childs = [];

		for (c of children) { 
			if(!c.options) continue;
			options.childs.push(_getOptions(c));
		}
		return options;
	}

	function getClass(_target = target, is_childs = 1, is_first_char = 1){

		let options = _target.options? _target.options['BASE']: '';

		if(!options)
			return;

		function addChar(items, char='.'){
			for(let i in items){
				items[i] = `${char}${items[i]}`;
			}

			return items;
		}

		var children = _target.children;
		let ids = options['id']? [options['id']]: [];
		let classes = options['class']?  options['class'].split(' ') : [];

		if(is_first_char){	
			ids = addChar(ids, '#');
			classes = addChar(classes);
		}

		if(is_childs && children.length)
			for (c of children) {
				if(!c.options) continue;
				let {ids: _ids, classes: _classes} = getClass(c, is_childs, is_first_char);
				ids = [...new Set([...ids ,..._ids])];
				classes = [...new Set([...classes ,..._classes])];
			}

		return {ids: ids, classes: classes};

	}

	function getOptions(is_actions){
		if(!is_actions){
			UiOptions.update();
			AttackElementDesign.target = null;
		}
		let options = _getOptions(target);

		// them css tu class && id
		let classes = getClass(undefined);
			if(classes)
				classes = [...classes.ids, ...classes.classes];
		options['css'] = AppScripts.getStyles(classes);

		// thêm js từ code
		let _scripts = options['SCRIPTS'].script;
		if(_scripts){
			let scripts = [];
			for(let i in _scripts){
				let script = _scripts[i].replace('()', '');
				scripts.push(script);
			}
			options['js'] = AppScripts.getScripts(scripts);
		}

		return options;
	}

	function setOptions(options, is_root = 0){
		if(!options) return;

		// set css && js code
		AppScripts.setStyles(options.css);
		AppScripts.setScripts(options.js);
		delete options.css;
		delete options.js;

		let childs = options.childs;
		let item = is_root? self: new ElementDesign(options['BASE'].tag);
		item.target.options = options;
		if(!is_root)
			target.append(item.target);
		AttackElementDesign.target = item;
		for(let i in childs){
			item.setOptions(childs[i], 0);
		}
	}

	function remove(){
		target.remove();
		self = null;
	}

	return self;
}

const root_ui = (function(){

	let target = new _$('div', '', {id: 'app-editor'});
	let target_container = new _$('div', '', {id: 'ed-container'});
	let target_design = new _$('div', '', {id: 'ed-container-design'});
	let {add, cut, copy, past, remove, undo, redo, addHistory} = KeyMethods;

	target_design.onclick = function(e){ 
		if(e.target == target_design)
			AttackElementDesign.target = null; 
	}

	let self = new ElementDesign;

	self.target.setAttribute('tabindex', -1);
	self.target.onkeydown = function(e){
		return interceptKeys(e, add, copy, cut, past, remove, undo, redo);
	}

	let target_left = new _$;
	target_left.append(self.target, ElementHtml.target)

	target_design.append(UiStatus.target, target_left);
	target_container.append(target_design, UiOptions.target);
	target.append(target_container, ElementScripts.target);

	self._target = target;
	self.is_root = 1;

	addHistory(self);

	return self;

})();

