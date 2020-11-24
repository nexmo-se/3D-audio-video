import * as Common from './common.js';

let audioContext = undefined;
let resonanceAudioScene = undefined;
let resonanceGain = undefined;
var resonanceSources = {};
var pannerSources = {};
var pannerGains = {};
var noneGains = {};

let MODE_NONE=0;
let MODE_STEREO=1;
let MODE_SPATIAL=2;

var audioMode = MODE_SPATIAL;

function getAudioMode(){
    return audioMode;
}

function setAudioMode(mode){
    audioMode = mode;
}
function initResonanceAudio() {
    audioContext = new AudioContext();
    resonanceGain = audioContext.createGain();
    resonanceAudioScene = new ResonanceAudio(audioContext,{
        ambisonicOrder: 1
    });
    
    resonanceAudioScene.output.connect(resonanceGain);
    resonanceGain.connect(audioContext.destination);

    let roomDimensions = {
        width: Common.roomWidth*Common.dimensionFactor,
        height: Common.roomHeight*Common.dimensionFactor,
        depth: Common.roomDepth*Common.dimensionFactor,
    };

    /*let roomMaterials = {
        left: 'curtain-heavy',
        right: 'curtain-heavy',
        up: 'curtain-heavy',
        down: 'curtain-heavy',
        front: 'curtain-heavy',
        back: 'curtain-heavy'
    };*/
    let roomMaterials = {
        left: 'uniform',
        right: 'uniform',
        up: 'uniform',
        down: 'uniform',
        front: 'uniform',
        back: 'uniform'
    };

    /*let roomMaterials = {
       left: 'transparent', right: 'transparent',
    up: 'transparent', down: 'grass',
    front: 'transparent', back: 'transparent',
    };*/

    resonanceAudioScene.setRoomProperties(roomDimensions, roomMaterials);
    resonanceAudioScene.setListenerPosition(0, 0, 0);
    Common.populateLayoutDimensions();
    resonanceGain.gain.value=1;
}

function changeMode(mode){
    if(mode == MODE_SPATIAL){
        resonanceGain.gain.value=1;
        setStereoPannerValue(0);
        setNoneGainValue(0);
    }
    else if(mode == MODE_STEREO){
        resonanceGain.gain.value=0;
        setStereoPannerValue(1);
        setNoneGainValue(0);
    }
    else if(mode == MODE_NONE){
        resonanceGain.gain.value=0;
        setStereoPannerValue(0);
        setNoneGainValue(1);
    }
}

function setNoneGainValue(val){
    for (var streamId in noneGains) {
        noneGains[streamId].gain.value=val;
    }
}
function setStereoPannerValue(val){
    //console.log(pannerSources);
    for (var streamId in pannerGains) {
        pannerGains[streamId].gain.value=val;
    }
}

function connectVideoToResonanceAudio(streamId,element,x,y,z) {
    let audioElementSource = audioContext.createMediaStreamSource(element.captureStream ? element.captureStream():element.mozCaptureStream());
    let source = resonanceAudioScene.createSource();
    audioElementSource.connect(source.input);
    source.setPosition(x, y, x);
    resonanceSources[streamId] = source;
    
    let pannerGain = audioContext.createGain();
    let pannerNode = audioContext.createStereoPanner();
    pannerNode.connect(pannerGain);
    pannerGain.connect(audioContext.destination);
    audioElementSource.connect(pannerNode);
    pannerGain.gain.value=0;
    pannerSources[streamId]=pannerNode;
    pannerGains[streamId]=pannerGain;
    
    let noneGain = audioContext.createGain();
    audioElementSource.connect(noneGain);
    noneGain.connect(audioContext.destination);
    noneGains[streamId] = noneGain;
    noneGain.gain.value=0;
}

function setPannerStereoLevel(streamId,level){
    pannerSources[streamId].pan.setValueAtTime(level, audioContext.currentTime);
    //console.log("Level="+level);
}
function setSourcePosition(streamId,x,y,z){
	resonanceSources[streamId].setPosition(x,y,z);
}

function sourceExists(streamId){
    return resonanceSources.hasOwnProperty(streamId);
}
function addMusicSource(elem){
  var audioElementSource = audioContext.createMediaElementSource(elem);
  var musicsource = resonanceAudioScene.createSource();
  audioElementSource.connect(musicsource.input);
  resonanceSources["music"] = musicsource
    
  let pannerGain = audioContext.createGain();
    let pannerNode = audioContext.createStereoPanner();
    pannerNode.connect(pannerGain);
    pannerGain.connect(audioContext.destination);
    audioElementSource.connect(pannerNode);
    pannerSources["music"]=pannerNode;
    pannerGain.gain.value=0;
    pannerGains["music"] = pannerGain;
    
    let noneGain = audioContext.createGain();
    audioElementSource.connect(noneGain);
    noneGain.connect(audioContext.destination);
    noneGains["music"] = noneGain;
    noneGain.gain.value=0;
}

function setListenerOrientation(x,y,z,ux,uy,uz){
	resonanceAudioScene.setListenerOrientation(x,y,z,ux,uy,uz);
}

function setListenerPosition(x,y,z){
	resonanceAudioScene.setListenerPosition(x,y,z);
    audioContext.listener.setPosition(x, y, z);
}

function updateSource2DPosition(elmnt,listener) {
    let sourceZ = (parseInt(elmnt.style.top) + (Common.tileHeight / 2));
    let sourceX = (parseInt(elmnt.style.left) + (Common.tileWidth / 2))
    
    let coordZ = ((sourceZ - Common.layoutHeight / 2) / (Common.layoutHeight / 2)) * (Common.roomDepth/2);
    let coordX = ((sourceX - Common.layoutWidth / 2) / (Common.layoutWidth / 2)) * (Common.roomWidth/2);
    coordX = Math.round(coordX*Common.dimensionFactor*100)/100;
    coordZ = Math.round(coordZ*Common.dimensionFactor*100)/100;
    if(elmnt.id=="publisher"){
        setListenerPosition(coordX,0,coordZ);
    }
    else{
        setSourcePosition(elmnt.id,coordX, 0, coordZ);
        
        var listnerRect = listener.getBoundingClientRect();
        let listenerZ = (parseInt(listnerRect.top) + (Common.pubHeight / 2));
        let listenerX = (parseInt(listnerRect.left) + (Common.pubWidth / 2));
        let angle = findAngle(listenerX,listenerZ,sourceX, sourceZ)
        if(angle<0)
            angle = -1*angle;
        let fraction = 1- (angle/90);
        setPannerStereoLevel(elmnt.id,fraction);
    }
    //console.log("Elem: "+elmnt.id+" x=" + coordX + " z=" + coordZ);
}

function findAngle(cx, cy, ex, ey) {
  var dy = ey - cy;
  var dx = ex - cx;
  var theta = Math.atan2(dy, dx); // range (-PI, PI]
  theta *= 180 / Math.PI; // rads to degs, range (-180, 180]
  //if (theta < 0) theta = 360 + theta; // range [0, 360)
  return theta;
}
export {initResonanceAudio,connectVideoToResonanceAudio,addMusicSource,setSourcePosition,setListenerOrientation,setListenerPosition,updateSource2DPosition,sourceExists,setAudioMode,getAudioMode,MODE_NONE,MODE_STEREO,MODE_SPATIAL,changeMode};