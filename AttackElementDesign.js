const AttackElementDesign = (()=>{

	let item;
	let prev_target;

	let onAttach = onDetach = new Function;

	function updateAttributes(target){
		// target.classList.remove('ui-design');
		let options = target.options || UiOptions.def_options;
		for(let i in options){
			for(let key in options[i]){
				let value = options[i][key];
				if(value){
					let f = ATTR_CONTROLS[key] || ATTR_CONTROLS['default'];
					f(target, value, key);
					target.onupdate();
				}
			}
		}

		return options;
	}

	function update(e){

		prev_target? prev_target.removeAttribute('active'): '';
		if(!e){
			UiOptions.update();
			onDetach();
			return;
		}

		onAttach();
		let target = e.target;
		item = e;

		UiStatus.selected = `"${target.tagName}"`;
		UiStatus.warning = ``;

		ElementHtml.value = target.outerHTML;

		prev_target? prev_target.ondblclick = null: '';
		// target.setAttribute('tabindex',"0");
		target.setAttribute('active', 1);
		prev_target = target;
		target.ondblclick = e=> KeyMethods.add(target, e);

		let options = updateAttributes(target);

		UiOptions.update(options);
		target.options = UiOptions.value;
		UiOptions.onitemupdate = function(e){
			let {key, value} = e;

			if(key == 'tag')
				target.setTag(value);
			else{
				let f = ATTR_CONTROLS[key] || ATTR_CONTROLS['default'];
				f(target, value, key);
				target.onupdate();
			}
		}

	}

	return {
		set target(value){ update(value); },
		set attrs(value){ updateAttributes(value); },
		get item(){ return item; },
		set onAttach(value){ onAttach = value; },
		set onDetach(value){ onDetach = value; },
	}

})();