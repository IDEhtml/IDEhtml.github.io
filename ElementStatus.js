function disableItem(items){
	for(let i in items){
		items[i].classList.add('item-disable');
	}
}
function enableItem(items){
	for(let i in items){
		items[i].classList.remove('item-disable');
	}
}
function tabItems(items, name = randomString(4), active, _class="tab-items"){

	let target = new _$;
	let target_header = _$('div', '', {class: _class});

	let target_containers = {};

	function update(items){

		target.innerHTML = '';
		target_header.innerHTML = '';

		target.append(target_header);

		target_containers = {};
		if(!active)
			active = Object.keys(items)[0];

		let item_active;

		for(let i in items){
			let value = items[i];
			let id = `${name}${i}`;

			let container = new _$;
			target_containers[i] = new _$;
			let input = new _$('input', '', {type: 'radio', hidden: 1, name, id});
			let label = new _$('label', value, {for: id});

			if(i == active){
				input.setAttribute('checked', 1);
				label.setAttribute('active', 1);
				item_active = label;
			}

			label.onclick = function(e){
				if(item_active)
					item_active.removeAttribute('active');
				item_active = e.target;
				item_active.setAttribute('active', 1);
			}


			container.append(input, target_containers[i])
			target_header.append(label);
			target.append(container);
		}

	}update(items);

	return {target, get target_containers(){ return target_containers; }, update};

}

function contextMenu(title, items){

	let target = new _$('div', '', {class: 'context-menu'});
	let target_title = new _$('label', title);
	let container = new _$('div', '', {class: 'context-menu-container'});
	target.append(target_title, container);

	target_title.onclick = function(){
		container.classList.toggle('active');
	}

	let target_items = {};

	for(let i in items){

		let value = items[i];
		target_items[i] = new _$('div', value);
		container.append(target_items[i]);
	}

	function disable(){
		disableItem(target_items);
	}

	function enable(){
		enableItem(target_items);
	}

	return {target, target_items, disable, enable};

}

function methodItems(parent){

	let target = new _$('div', '', {class: 'method-items'});
	let mode = new _$('input', '', {id: 'mode-dev-view', checked: 1, type: 'checkbox', hidden: 1});
	let _mode = _$('label', '<div>View/<b>Dev</b></div>', {for: 'mode-dev-view'});
	let _add = _$('label', '➕<label>add</label>');
	let _copy = _$('label', '📄<label>copy</label>');
	let _cut = _$('label', '✂️<label>cut</label>');
	let _past = _$('label', '📋<label>past</label>');
	let del = _$('label', '🗑<label>delete</label>');
	let _undo = new _$('label', '↶<label>undo</label>');
	let _redo = new _$('label', '↷<label>redo</label>');

	let {add, cut, copy, past, remove, undo, redo} = KeyMethods;

	mode.onchange = function(){
		if(mode.checked){
			parent.classList.add('dev-mode');
			_mode.innerHTML = '<div>View/<b>Dev</b></div>'
		}
		else{
			parent.classList.remove('dev-mode');
			_mode.innerHTML = '<div><b>View</b>/Dev</div>'
		}
	};
	_add.onclick = add;
	_copy.onclick = copy;
	_cut.onclick = cut;
	_past.onclick = past;
	_undo.onclick = undo;
	_redo.onclick = redo;
	del.onclick = remove;

	let _target_mode = _$('label');
	_target_mode.append(mode, _$('i', '👁'), _mode);
	target.append(_target_mode, _undo, _add, _copy, _cut, _past, del, _redo);

	function disable(){
		disableItem([_copy, _cut, _past, del]);
	}

	function enable(){
		enableItem([_copy, _cut, _past, del]);
	}

	return {target, disable, enable};

}

const UiStatus = (function(){

	let target = new _$('div', '', {id: 'ed-container-status', class: 'dev-mode'});
	let target_status = new _$('div', '', {class: 'status'});
	let target_selected = new _$('label', '');
	let target_action = new _$('label', ': ...');
	let target_warning = new _$('label', ': ...');

	let context_items = new contextMenu('File', ['Save', 'getOptions', 'setOptions']);
	target.append(context_items.target);

	function saveFile(text){
		let content = `
<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<title></title>
</head>
<body>
	${text}
	<link rel="stylesheet" type="text/css" href="styles.css">
	<script type="text/javascript" src="scripts.js"></script>
</body>
</html>`;
		downloadText('scripts.js', AppScripts.getScriptCode());
		downloadText('styles.css', AppScripts.getStyleCode());
		downloadText('html-design.html', content);
	}

	function processCss(option, css = ``){
		let style = option['STYLES'].style;
		if(style && Object.keys(style).length){
			delete option['STYLES'].style;
			let class_name = '_' + randomString(5);
			option['BASE'].class = option['BASE'].class? option['BASE'].class + ` ${class_name}`: class_name;
			css = `.${class_name}{\n${objToCss(style)}}`;
		}

		let childs = option.childs;
		for(let i in childs){
			let child = childs[i];
			css += processCss(child, css)
		}
		
		return css;	
	}

	context_items.target_items[0].onclick = function(){
		// let options = root_ui.getOptions();
		// let tmp_design = new ElementDesign;
		// tmp_design.setOptions(options);
		// console.log(tmp_design.target.innerHTML);
		let text = root_ui.target.outerHTML;
		saveFile(text);
	}
	context_items.target_items[1].onclick = function(){
		navigator.clipboard.writeText(JSON.stringify(AttackElementDesign.item.getOptions()));
	}
	context_items.target_items[2].onclick = async function(){
		const text = await navigator.clipboard.readText();
		AttackElementDesign.item.setOptions(JSON.parse(text));
	}

	let method_items = new methodItems(target);
	target.append(method_items.target);

	target_status.append(target_selected, target_action, target_warning);
	target.append(target_status);

	AttackElementDesign.onAttach = function(){
		// enableItem([context_items.target_items[1]])
		context_items.enable();
		method_items.enable();
	}

	AttackElementDesign.onDetach = function(){
		context_items.disable();
		method_items.disable();
	}

	let self = {
		get target(){ return target; },
		set selected(value){ target_selected.innerHTML = `${value}` },
		set action(value){ target_action.innerHTML = value? `,${value}`: '' },
		set warning(value){ target_warning.innerHTML = value? `,${value})`: ''; }
	};

	return self;
})();