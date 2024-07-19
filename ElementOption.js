const TAGS = expand({
	'div, aside, section, header, main, footer, ul, ol, table, tr, th, td': {'BASE': '', 'TEXT': '', 'STYLES': '', 'SCRIPTS': ''},
	a: {'BASE': '', 'TEXT': '', 'LINK': '', 'STYLES': '', 'SCRIPTS': ''},
	'label, p, h1, h2, h3, h4, h5, li, button': {'BASE': '', 'TEXT': '', 'STYLES': '', 'SCRIPTS': ''},
	form: {'BASE': '', 'FORM': '', 'STYLES': '', 'SCRIPTS': ''},
	input: {'BASE': '', 'INPUT': '', 'STYLES': '', 'SCRIPTS': ''},
	'img, audio, video, iframe': {'BASE': '', 'MEDIA': '', 'STYLES': '', 'SCRIPTS': ''},
});

const STYLE_DESIGNS = expand({
	'default': function(value){
		return _$('input', '',{value});
	},
	'display, position': function(value, target_inputs, key){
		let recomments = arrToObj(ATTR_STYLES[key]);
		value = (typeof value == 'object')? '': value;
		let target = UI.iSearch(value, recomments, undefined, 2);
		target._onchange = function(){
			target_inputs.oninput();
		}
		return target;
	},
	'background,color': UI.iColor,
	'margin, padding, width, height, min-width, max-width, min-height, max-height': UI.iRange
});

const ATTR_STYLES = {
	display: ['none', 'flex', 'block', 'inline', 'inline-block'],
	position: ['relative', 'absolute', 'sticky'],
	background: '',
	color: '',
	margin: '',
	padding: '',
	width: '',
	height: ''
}

const ATTR_SCRIPTS = {
	onclick: '',
	ondblclick: '',
	onchange: '',
	oninput: '',
	onmouseover: '',
	onmouseout:''
}

const ATTR_CONTROLS = {
	default:  function(target, value, key){ 
		if(!value){
			target.removeAttribute(key);
			return;
		}
		try{target.setAttribute(key, value);}catch(e){} 
	},
	tag: function(target, value){ target.onupdate(); },
	text: function(target, value){ target.onupdate(); target.innerText = value; },
	style: function(target, value){ 
		target.onupdate();
		target.removeAttribute('style');
		for(let i in value){
			target.style[i] = value[i];
		}
	},
	script: function(target, value){
		target.onupdate();
		for(let i in ATTR_SCRIPTS){
			// target[i] = null;
			target.removeAttribute(i);
		}
		for(let i in value){
			try{target.setAttribute(i, value[i]);}catch(e){}
		}
	}
}

var css_items = {};
var style_update;
// design render item
const ATTR_DESIGNS = expand({
	default: function(value){ 
		return _$('input', '', {value}); 
	},
	'id': function(value){
		let input = _$('input', '', {value});
		input.onchange = function(){
			style_update();
		}
		return input;
	},
	'class': function(value){
		let target_value = new _$('input', '', {value, hidden: 1});

		let classes = {};

		try{
			let _class = root_ui.getClass(undefined, undefined, 0);
			classes = arrToObj(_class.classes);
		}catch(e){
			// console.log(e);
		}

		let target = UI.iSearch(value, classes, undefined, 1)
		target._onchange = function(){
			target_value.value = target.value;
			target_value.oninput();
			style_update();
		}
		return {target, target_value};
	},
	'text': function(value){ return _$('textarea', value); },
	'tag, type': function(value, code, key){
		value = (typeof value == 'object')? Object.keys(value)[0]: value;
		let target_value = new _$('input', '', {value, hidden: 1});
		let target = UI.iSearch(value, ATTRIBUTES[code][key]);
		target.append(target_value);
		target._onchange = function(){
			target_value.value = target.value;
			target_value.oninput();
		}
		return {target, target_value};
	},
	'methods': function(value, code, key){
		return UI.iSelect(value, ATTRIBUTES[code][key]);
	},
	'script': function(value, code, key){
		return UI.iCss(value, code, key);
	},
	'style': function(value, code, key){

		let tab = new tabItems({}, undefined, undefined, 'option-list');

		let {target: t, target_value} = UI.iCss(value, code, key);

		style_update = function(){
			const zKey = 'target';
			let class_items = [zKey];
			if(AttackElementDesign.item){
				let classes = AttackElementDesign.item.getClass(undefined, 0);
				if(classes)
					class_items = [...class_items, ...classes.ids, ...classes.classes];
			}
			tab.update(arrToObj(class_items));
			tab.target_containers[zKey].append(t);
			class_items.shift();

			// css_items = {};
			for(let i in class_items){
				let item = class_items[i];
				let value = AppScripts.getStyles([item]);
				css_items[item] = new UI.iCss({...ATTR_STYLES, ...value[item]});
				let {target: t, target_value: _target_value} = css_items[item];
				tab.target_containers[item].append(t);

				// fix refresh inputs value
				_target_value.value;

				_target_value.oninput = function(){
					let value = _target_value.value;
					AppScripts.setStyles({[item]: value}, 0);
				}
			}
		}

		style_update();

		return {target: tab.target, target_value};

	}
});

const ATTRIBUTES = {
	BASE: {
		tag: arrToObj(Object.keys(TAGS)),
		id: '',
		class: '',
		name: '',
	},
	TEXT: {
		text: ''
	},
	FORM: {
		action: '',
		methods: arrToObj(['GET', 'POST', 'PUT', 'UPDATE', 'DELETE']),
	},
	INPUT: {
		value: '',
		placeholder: '',
		type: arrToObj(['text', 'submit', 'password', 'radio', 'checkbox']),
	},
	MEDIA: {
		src: ''
	},
	LINK: {
		href: ''
	},
	STYLES: {
		style: ATTR_STYLES
	},
	SCRIPTS: {
		script: ATTR_SCRIPTS
	}
}

function OptionItem(key, value, code){
	let target = new _$('tr');
	let target_td1 = new _$('td');
	let target_td2 = new _$('td');
	let target_label = _$('label', key);
	let target_value;

	let changeHandle = new Function;

	let self = {};

	if(!['style', 'script'].includes(key))
		target_td1.append(target_label);
	target.append(target_td1, target_td2);

	function update(_value = value){
		let f = ATTR_DESIGNS[key] || ATTR_DESIGNS['default'];
		let design = f(_value, code, key);
		target_value = design.target_value || design;
		// target_value.onchange = function(){
		// 	KeyMethods.addHistory();
		// }
		target_value.oninput = function(){
			changeHandle(self)
		};
		target_td2.append(design.target || target_value);
	}update(value);

	self = {
		get key(){ return key; },
		get value(){ return target_value.value; },
		set value(value){ update(value); },
		get target(){ return target; },
		set onchange(value){ 
			if(typeof value != 'function') 
				throw "value not a function!";
			 changeHandle = value;
		}
	};

	return self;
}

function OptionItems(items){
	
	let target = new _$('div', '', {id: 'eo-container'});

	let itemUpdateHandle = new Function;

	let self = {};

	let tab_item_active;

	function update(options){

		target.innerHTML = '';
		target.removeAttribute('hidden');

		let {target: t, target_containers} = new tabItems(['Attributes', 'Styles', 'Scripts']);
		target.append(t);
		
		if(!options){
			items = null;
			target.setAttribute('hidden', 1);
			return;
		}

		items = {};
		
		['BASE', 'STYLES', 'SCRIPTS'].map(item=>{ options[item] = options[item] });

		let tag = options['BASE']? options['BASE'].tag: 'div';

		options = extendsParent(getItemsByKeys(ATTRIBUTES, Object.keys(TAGS[tag] || TAGS['div'])), options);

		// xoa css & js code
		delete options.css;
		delete options.js;

		for(let code in options){

			let _target = target_containers[0];
			switch(code){
				case 'STYLES': _target = target_containers[1]; break;
				case 'SCRIPTS': _target = target_containers[2]; break;
			}

			// fix bug childs
			if(code == 'childs') continue;

			let value = options[code];
			let _items = ATTRIBUTES[code] || ATTRIBUTES[value];
			if(typeof value === 'object'){
				_items = {..._items, ...value};
			}

			let target_group = _$('table');
			let target_group_title = _$('th', code, {'colspan': 2})
			target_group.append(target_group_title);
			_target.append(target_group);

			items[code] = {};

			for(let i in _items){
				let option_item = OptionItem(i, _items[i], code);
				items[code][i] = option_item.value;
				option_item.onchange = function(e){
					items[code][i] = option_item.value;
					itemUpdateHandle(e);
				};
				target_group.append(option_item.target);
			}
		}

	}update(items);

	self = {
		get target(){ return target; },
		get value(){ return clearEmptyItem(items); },
		get update(){ return update; },
		set onitemupdate(value){ 
			if(typeof value != 'function') 
				throw "value not a function!";
			 itemUpdateHandle = value;
		}
	};

	return self;
}

function ElementOption(type = 'div'){
	
	let self = OptionItems(TAGS[type] || TAGS.form);

	self.def_options = self.value;

	return self;
}

const UiOptions = new ElementOption;