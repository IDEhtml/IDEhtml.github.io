const KeyMethods = (function(){

	let copy_options;

	let histories = [];

	let history_index = 0;

	function addHistory(item = root_ui){
		histories.splice(0, history_index - 1);
		history_index = 1;
		let options = item.getOptions(1);
		histories.unshift(JSON.stringify(options));
	}

	function undo(){
		let options = histories[history_index];
		if(!options){
			UiStatus.action = 'Undo empty!';
			return;
		}
		options = JSON.parse(options);
		root_ui.target.innerHTML = '';
		root_ui.setOptions(options, 1);
		history_index++;
		UiStatus.action = `undo`;
	}

	// chua redo được đến histories mới nhât
	// lý do chưa thêm được histories mới vào history_index 0
	function redo(){
		history_index-=2;
		if(!histories[history_index]){ 
			history_index += 2;
			UiStatus.action = 'Redo empty!';
			return; 
		}
		undo();
		UiStatus.action = `redo`;
	}

	function detachOptions(){
		return AttackElementDesign.item.getOptions();
	}

	function attachOptions(options){
		let _item = AttackElementDesign.item;
		AttackElementDesign.item.setOptions(options);
		AttackElementDesign.target = _item;
	}

	function copy(){
		copy_options = detachOptions();
		UiStatus.action = `copy`;
	}

	function cut(){
		copy();
		remove();
		UiStatus.action = `cut`;
	}

	function past(){
		// if(AttackElementDesign.item.target.innerHTML){
		// 	UiStatus.action = `Item has value... is not past`;
		// 	return;
		// }
		attachOptions(copy_options);
		UiStatus.action = `past`;
		addHistory();
	}

	function add(target, e){
		if(!e || (e.target != target)){
			target = UiOptions.value? AttackElementDesign.item.target : root_ui.target;
		}
		let new_target = new ElementDesign;
		target.append(new_target.target);
		UiStatus.action = `add`;
		addHistory();
	}

	function remove(){
		AttackElementDesign.item.remove();
		UiStatus.action = `remove`;
		addHistory();
	}

	return {add, cut, copy, past, remove, undo, redo, addHistory};

})();
