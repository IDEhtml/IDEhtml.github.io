const ElementHtml = (()=>{

	let target = new _$('section');
    let target_status = new _$('section', '<div>Html Code</div>')
	let target_container = new _$('div', '', {style: 'height: 100%; width: calc(100% - 30px)'});
	let target_input = new _$('textarea');

	target_container.append(target_input);
	target.append(target_status, target_container);

    target_status.onclick = function(){
        target_container.classList.toggle('hidden');
        if(target_container.classList.contains('hidden'))
            target.style.width = 'unset';
        else
            target.style.width = '';
    }

	let code_input;
	setTimeout(function(){

		code_input = CodeMirror.fromTextArea(target_input, {
	        lineNumbers: true,
            readOnly: true,
	        mode: "htmlmixed",
            lineWrapping: true,
	    });

        code_input.setValue(root_ui.target.outerHTML);
        autoFormatSelection(code_input);

	    code_input.on('blur', function(){
	    	// console.log(getAttributes(AttackElementDesign.item.target));
	    	// AttackElementDesign.item.target.innerHTML = code_input.getValue();
	    	// console.log(htmlToDesign(code_input.getValue()));
	    });

	}, 30);

	return {
		target,
		get value(){ return code_input.getValue(); },
		set value(value){ 
            if(!code_input) return;
            code_input.setValue(value);
            autoFormatSelection(code_input);
		}
	};

})();