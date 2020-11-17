var roomWidth = 4;
var roomHeight = 3.2;
var roomDepth = 3.9;

var layoutWidth = 0;
var layoutHeight = 0;

var tileWidth = 320;
var tileHeight = 260;

var is3DModeVar = false;

function is3DMode(){
    return is3DModeVar;
}

function set3DMode(val){
    is3DModeVar = val;
}
function hide2DLayout(){
    document.getElementById("layout").style.visibility="hidden";
}
function hide3DLayout(){
    document.getElementById("3dcanvas").style.visibility="hidden";
}
function show2DLayout(){
    document.getElementById("layout").style.visibility="visible";
}
function show3DLayout(){
    document.getElementById("3dcanvas").style.visibility="visible";
}
function populateLayoutDimensions() {
    var layout = document.getElementById("layout");
    layoutWidth = layout.clientWidth;
    layoutHeight = layout.clientHeight;
}

function randomIntFromInterval(min,max){
    return Math.floor(Math.random()*(max-min+1)+min);
}

function dragElement(elmnt, header,func) {
    var pos1 = 0,
        pos2 = 0,
        pos3 = 0,
        pos4 = 0;

    header.onmousedown = dragMouseDown;

    function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        // get the mouse cursor position at startup:
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        // call a function whenever the cursor moves:
        document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        // calculate the new cursor position:
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        // set the element's new position:
        elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
        elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
        func(elmnt);
    }

    function closeDragElement() {
        /* stop moving when mouse button is released:*/
        document.onmouseup = null;
        document.onmousemove = null;
        func(elmnt)
    }
}

export {dragElement,populateLayoutDimensions,randomIntFromInterval,hide2DLayout,hide3DLayout,show2DLayout,show3DLayout,layoutWidth,layoutHeight,roomHeight,roomWidth,roomDepth,tileWidth,tileHeight,is3DMode,set3DMode};
