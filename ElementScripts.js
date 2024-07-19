let ElementScripts_container = new _$;

function todoItem(id = Math.round(Math.random()*999), value = '', type="href"){
	let target = new _$('div', '', {class: 'todo-item'});
	let target_input = new _$('input', value, {placeholder: 'Enter link...'});
	let target_remove = new _$('label', 'x');
	let target_script = new _$('link', '', {type: "text/css", rel: "stylesheet"});
	let onremove = new Function;

	if(type != 'href')
		target_script = new _$('script', '', {type: "text/javascript"});

	target_input.onchange = function(){
		target_script.setAttribute(type, target_input.value);
	}

	target_remove.onclick = remove;

	target.append(target_input, target_remove);

	function remove(){
		target.remove();
		target_script.remove();
		onremove(id);
	}

	ElementScripts_container.append(target_script);

	return {
		target, id, remove, 
		set onremove(value){ onremove = value; },
		get value(){ return target_input.value; },
		set value(value){ target_input.value = value; }
	};
}

function todoList(type='href'){

	let target = new _$('div', '', {class: 'todo-list'});
	let target_container = new _$;
	let target_add = new _$('label', `+ Import ${type=='href'? 'Css': 'Javascript'} file`, {class: 'todo-list-add'});

	let items = {};
	let onremove = new Function;

	target.append(target_add, target_container);
	target_add.onclick = function(){ add(); };

	function remove(id){
		let item = items[id];
		if(!item) return;
		// item.remove();
		delete items[id];
		onremove(self);
	}

	function add(id, value){
		let item = new todoItem(id, value, type);
		item.onremove = function(){ remove(item.id); }
		items[item.id] = item;
		target_container.append(item.target);
	}

	let self = {
		target, add, remove, 
		set onremove(value){ onremove = value; },
		get value(){
			let result = {};
			for(let i in items){
				result[i] = items[i].value;
			}

			return result;
		},
		set value(value){
			for(let i in value){
				if(!items[i])
					add(i, value[i]);
				items[i].value = value[i];
			}
		}
		
	};

	return self;

}

ElementScripts = (()=>{

	let target = new _$('div', '', {class: 'scripts-panel'});
	let target_header = new _$('div', 'Code editor', {class: 'code-editor-header'});
	let target_body = new _$('div', '', {class: 'code-editor-body'});
	let target_js = new _$;
	let target_css = new _$;
	let target_js_link = new _$('div', '', {class: 'todo-list-container'});
	let target_css_link = new _$('div', '', {class: 'todo-list-container'});
	let lbl_link_css = new _$('label', '⚙');
	let lbl_link_js = new _$('label', '⚙');
	let lbl_code_css = new _$('label', 'Css Editor');
	let lbl_code_js = new _$('label', 'Javascript Editor');

	let input_css = new _$('textarea', AppScripts.getStyleCode());
	let input_js = new _$('textarea', AppScripts.getScriptCode());

	let todo_css = new todoList;
	let todo_js = new todoList('src');
	let code_css, code_js;

	target_css_link.append(lbl_link_css, todo_css.target);
	target_js_link.append(lbl_link_js, todo_js.target);

	target_css.append(target_css_link, input_css);
	target_js.append(target_js_link, input_js);
	target_body.append(target_css, target_js)
	target.append(target_header, target_body);

	let is_show = 1;
	target_header.onclick = function(){
		if(is_show){
			target_js.setAttribute('hidden', 1);
			target_css.setAttribute('hidden', 1);
		}else{
			target_js.removeAttribute('hidden');
			target_css.removeAttribute('hidden');
		}
		is_show = !is_show;
	}

	return {
		get target(){

			setTimeout(function(){
				code_css = CodeMirror.fromTextArea(input_css, {
				        lineNumbers: true,
				        lineWrapping: true,
				        mode: 'text/css'
				    });
				code_js = CodeMirror.fromTextArea(input_js, {
				        lineNumbers: true,
				        lineWrapping: true,
				        mode: 'text/javascript'
				    });

			    code_css.on('change', function(){
			    	let value = code_css.getValue();
			    	AppScripts.setStyleCode(value.replaceAll(' ', ''));
			    	let codes = AppScripts.getStyles(Object.keys(css_items));
			    	for(let i in codes){
			    		let code = codes[i];
			    		css_items[i].target_value.value = code;
			    	}
			    });

			    code_js.on('blur', function(){
			    	let value = code_js.getValue();
			    	AppScripts.setScript(value);
			    });

			}, 10);

			return target;

		},
		todo_css: {
			get value(){ return todo_css.value; },
			set value(value){ todo_css.value = value; },
		},
		todo_js: {
			get value(){ return todo_js.value; },
			set value(value){ todo_js.value = value; },
		},
		code_css: {
			get value(){ return code_css.getValue(); },
			set value(value){ code_css.setValue(value); },
		},
		code_js: {
			get value(){ return code_js.getValue(); },
			set value(value){ code_js.setValue(value); },
		}
	};

})();