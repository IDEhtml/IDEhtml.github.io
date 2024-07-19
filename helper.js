function _$(type, content, attrs){
    let target = document.createElement(type || 'div');
    target.innerHTML = content || "";
    for(let key in attrs){
        let value = attrs[key];
        target.setAttribute(key, value);
    }

    return target;
}

function getAttributes(target){
    let attrs = target.attributes;
    let result = {};
    [...attrs].forEach(({ name, value }) => {
        result[name] = value;
    });

    return result;
}

function autoFormatSelection(editor) {
    var totalLines = editor.lineCount();  
    editor.autoFormatRange({line:0, ch:0}, {line:totalLines});
    editor.setCursor({line: 1, ch: 5})
}

function regexJs(js){
    let patern = /function (.*)\(\){([\s\S]*?)}/gm;
    var data = {};
    var getKeyValue = function(fullPattern, group1, group2, group3) {
      data[group1] = group2.replaceAll('\n', '');
    };
    js.replace(patern, getKeyValue);
    return data;
}

// console.log(regexJs(`
// function a(){
//     dsadsf
//  }
//  function b(){ fdsdf; }
// `));

function regexCss(css){
    let patern = /(.*){([\s\S]*?)}/gm;
    var data = {};
    var getKeyValue = function(fullPattern, group1, group2, group3) {
      data[group1] = group2.replaceAll('\n', '');
    };
    css.replace(patern, getKeyValue);
    return data;
}

function cssToObj(css){
    if(!css) return {};
    css = css.replaceAll('\n', '');
    css = css.substring(0, css.length - 1);
    return css.split(';').reduce(function(current, next){
        let item = next.split(':');
        if(!item[1])
            return current;
        let key = item[0].replaceAll(' ', '').replaceAll('\t', '');
        let value = item[1].replaceAll(' ', '').replaceAll('\t', '');
        return Object.assign({}, current, {[key]: value});
    }, {})
}

function objToCss(obj, f = ''){
   let css = Object.keys(obj).reduce((acc, key) => (
        acc + f + key.split(/(?=[A-Z])/).join('-').toLowerCase() + ':' + obj[key] + ';'
    ), '');
   css = css.replaceAll('\n', '').replaceAll(';', ';\n');
   return css;
}

// console.log(regexCss(`*{
// background: red;
// }
// body{
// color: red;
// }
// .a{
// text-decoration: 'none';
// }
// .a:hover{
// asd: 'sdf';
// }`))

function arrToObj(arr){

    if(typeof arr != 'object')
        arr = [];

    return arr.reduce(function(current, next){
          return Object.assign({}, current, {[next]: next});
        }, {});
}

function stringToColour(str) {
    for (var i = 0, hash = 0; i < str.length; hash = str.charCodeAt(i++) + ((hash << 5) - hash));
    color = Math.floor(Math.abs((Math.sin(hash) * 10000) % 1 * 16777216)).toString(16);
    return '#' + Array(6 - color.length + 1).join('0') + color;
}

function clearEmptyItem(items){
    for(let i in items){
        if(typeof items[i] == 'object')
            items[i] = clearEmptyItem(items[i])
        if(!items[i] || items[i] == {})
            delete items[i]
    }

    return items;
}

function extendsParent(parent, child){
    let result = {};
    for(let i in parent){
        if(!child[i])
            result[i] = parent[i];
        else if(typeof child[i] == 'object')
            result[i] = extendsParent(parent[i], child[i] || {})
        else
            result[i] = child[i];
    }
    return {...child, ...result};
}

function getItemsByKeys(items, keys){
    let result = {}
    for(let i in keys){
        let key = keys[i];
        result[key] = items[key];
    }
    return result;
}

function expand(obj) {
    var keys = Object.keys(obj);
    for (var i = 0; i < keys.length; ++i) {
        var key = keys[i],
            subkeys = key.split(/,\s?/),
            target = obj[key];
        delete obj[key];
        subkeys.forEach(function(key) { obj[key] = target; })
    }
    return obj;
}

function changeTagName(node, new_node) {
  // (1)
  // var renamed = document.createElement(newTagName);

  // (2)
  [...node.attributes].map(({ name, value }) => {
    new_node.setAttribute(name, value);
  });

  // (3)
  while (node.firstChild) {
    new_node.appendChild(node.firstChild);
  }

  // (4)
  node.parentNode.replaceChild(new_node, node);

  return new_node;
}

function keyAct(f, hot_key){ 
    f(); 
    UiStatus.warning = hot_key; 
    return false; 
}

function interceptKeys(evt, addHandle, copyHandle, cutHandle, pastHandle, removeHandle, undoHandle, redoHandle) {
    evt = evt||window.event // IE supports
    var c = evt.keyCode
    var ctrlDown = evt.ctrlKey||evt.metaKey // Mac support

    console.log(c);
    UiStatus.warning = '';

    // Check for Alt+Gr (http://en.wikipedia.org/wiki/AltGr_key)
    if (ctrlDown && evt.altKey) return true
    // Check for ctrl+c, v and x
    else if (ctrlDown && c==77) return keyAct(addHandle, 'ctrl+m') //m
    else if (ctrlDown && c==67) return keyAct(copyHandle, 'ctrl+c') //c
    else if (ctrlDown && c==86) return keyAct(pastHandle, 'ctrl+v') // v
    else if (ctrlDown && c==88) return keyAct(cutHandle, 'ctrl+x') // x
    else if (ctrlDown && c==81) return keyAct(removeHandle, 'ctrl+q') // q
    else if (ctrlDown && c==90) return keyAct(undoHandle, 'ctrl+z') // z
    else if (ctrlDown && c==89) return keyAct(redoHandle, 'ctrl+y') // y

    // Otherwise allow
    return true
}

function randomString(length){
   return (Math.random() + 1).toString(36).substring(length);
}

function downloadText(filename, text) {
  var element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
  element.setAttribute('download', filename);

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}