const UI = {
	iCss: function(value, code, key = 'style'){

		if(typeof value != 'object')
			return _$('input', '', {value});

		let old_value = value['_result'] || {};
		let target = new _$;
		let target_value = new _$;
		let target_inputs = {};

		// text area
		let target_area = _$('textarea', '', {rows: 5, spellcheck: false});
		let is_edit = 0;
		target_area.oninput = function(e){
			try{
				let value = cssToObj(e.target.value);
				old_value = target_value.value = value;
				is_edit = 1;
				target_value.oninput();
			}catch(e){}
			
		}

		target_area.onblur = function(){
			is_edit = 0;
		}

		target.append(target_area, target_value);

		for(let i in value){
			let target_label = _$('div', i);
			let f = STYLE_DESIGNS[i] || STYLE_DESIGNS['default'];
			target_inputs[i] = f(value[i], target_value, i);
			target_value.append(target_label, target_inputs[i]);
		}

		Object.defineProperty(target_value, 'value', {
			get: function(){

				let value = {};
				for(let i in target_inputs){
					value[i] = target_inputs[i].value;
					if(!value[i])
						delete old_value[i];
				}
				
				value = clearEmptyItem(value);
				value = {...old_value, ...value};
				
				if(!is_edit)
					target_area.value = objToCss(value);

				return value;
			},
			set: function(value){
				for(let i in target_inputs){
					target_inputs[i].value = value[i] || '';
				}
				if(!is_edit)
					target_area.value = objToCss(value);
			}
		})

		return {target, target_value};
	},
	iSearch: function(value, items, _target, is_tag){
		let target = new _$('div', '', {class: 'ui-isearch'});
		let target_input = new _$('input', '', {value});
		let target_recomments = new _$('div', '', {hidden: 1, class: 'option-list'});
		let target_remove = new _$('label', 'x');

		let is_search = 0;

		target_remove.onclick = function(){
			value = target_input.value = '';
			target._onchange();
		}

		target_recomments.onmouseover = function(){
			if(is_search == 2)
				target._onchange();
			is_search = 0;
		}

		if(!is_tag)
			target_input.onfocus = function(){
				target_input.value = '';
				target_input.placeholder = value;
			}

		target_input.onblur = function(){
			if(target_input.value == '')
				target_input.value = value;
		}

		target_input.onchange = function(){
			if(is_search)
				target._onchange();
			is_search = 2;
			value = target.value;
		}

		target_input.oninput = function(e){
			is_search = 1;
			let term = e.target.value;
			let matches = []
			matches = Object.fromEntries(Object.entries(items).filter(([, v]) => v.includes(term)));
			updateRecomment(matches);
		}

		function updateRecomment(_items){
			target_recomments.innerHTML = '';
			for(let i in _items){
				let item = new _$('div', items[i]);
				item.onclick = function(){
					if(is_tag == 1)
						target_input.value += `${value? ' ': ''}${i}`;
					else
						target_input.value = i;
					value = target.value;
					if(target._onchange)
						target._onchange();
				}
				target_recomments.append(item);
			}
		}updateRecomment(items);

		if(is_tag)
			target.append(target_input, target_remove, target_recomments);
		else
			target.append(target_input, target_recomments);

		Object.defineProperty(target, 'value', {
			get: function(){ return target_input.value; },
			set: function(value){ target_input.value = value; },
		});

		return target;

	},
	iSelect: function(value, items){
		let target = new _$('div', '', {class: 'option-list'});
		let default_value = (typeof value != 'object')? value: Object.keys(value)[0] || value;
		let target_value = _$('input', '', {value: default_value, hidden: 1});
		let target_active;

		for(let i in items){
			let _target = _$('div', i);

			if(i === default_value){
				target_active = _target;
				_target.setAttribute('s_active', 1);
			}
			_target.onclick = function(){
				target_value.value = i;
				target_value.oninput();
				if(target_active)
					target_active.removeAttribute('s_active');
				_target.setAttribute('s_active', 1);
				target_active = _target;
			}
			target.append(_target);
		}

		target.append(target_value);
		return {target, target_value};
	},
	iColor: function(value){
		let target = new _$('div', '', {style: 'display:flex'});
		let target_control = _$('input', '', {type: 'color', value, style: 'width: 40px; margin-left: 6px'});
		let target_value = _$('input', '', {value});

		target_value.oninput = function(){
			target_control.value = stringToColour(target_value.value);
			if(target.oninput)
				target.oninput();
		}

		target_control.oninput = function(){
			target_value.value = target_control.value;
			if(target.oninput)
				target.oninput();
		}

		target.append(target_value, target_control);

		Object.defineProperty(target, 'value', {
			get: function(){
				return target_value.value;
			},
			set: function(value){
				target_value.value = value;
				target_control.value = stringToColour(value);
			}
		});

		return target;
	},
	iRange: function(value, _target){

		let is_ = value.includes('%');
		let target_ext = _$('select', `<option value="px">px</option><option value="%">%</option>`, {value, style: 'width: 53px'});
		if(is_)
			target_ext.value = '%';

		let v = value.replace(target_ext.value, '');

		let target = _$('div', '', {style: 'display:flex'});
		let target_control = _$('input', '', {type: 'range', value: v || 0, max: 200, step: 2});
		let target_value = _$('input', '', {value, style: 'width: 60px'});

		target.oninput = new Function;

		target_value.oninput = function(){
			target_value.value.includes('%')? target_ext.value = '%': target_ext.value = 'px';
			target_control.value = target_value.value.replace(target_ext.value, '');
		}

		target_ext.onchange = target_control.oninput = function(){
			target_value.value = target_control.value + target_ext.value;
			if(_target.oninput)
				_target.oninput();
		}

		target.append(target_value, target_control, target_ext);

		Object.defineProperty(target, 'value', {
			get: function(){
				return target_value.value;
			},
			set: function(value){
				target_value.value = value;
				target_control.value = value.replace(target_ext.value, '');
			}
		});

		return target;
	},
}