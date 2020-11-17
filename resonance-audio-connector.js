import * as Common from './common.js';

let audioContext = undefined;
let resonanceAudioScene = undefined;
var sources = {};
function initResonanceAudio() {
    audioContext = new AudioContext();
    resonanceAudioScene = new ResonanceAudio(audioContext);
    resonanceAudioScene.output.connect(audioContext.destination);
    let roomDimensions = {
        width: Common.roomWidth,
        height: Common.roomHeight,
        depth: Common.roomDepth,
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
       left: 'transparent', right: 'transparent',
    up: 'transparent', down: 'grass',
    front: 'transparent', back: 'transparent',
    };

    resonanceAudioScene.setRoomProperties(roomDimensions, roomMaterials);
    resonanceAudioScene.setListenerPosition(0, 0, 0);
    Common.populateLayoutDimensions();
}

function connectVideoToResonanceAudio(streamId,element,x,y,z) {
    let audioElementSource = audioContext.createMediaElementSource(element);
    let source = resonanceAudioScene.createSource();
    audioElementSource.connect(source.input);
    source.setPosition(x, y, x);
    sources[streamId] = source;
}

function setSourcePosition(streamId,x,y,z){
	sources[streamId].setPosition(x,y,x);
}

function addMusicSource(elem){
  var audioElementSource = audioContext.createMediaElementSource(elem);
  var musicsource = resonanceAudioScene.createSource();
  audioElementSource.connect(musicsource.input);
  sources["music"] = musicsource
}

function setListenerOrientation(x,y,z,ux,uy,uz){
	resonanceAudioScene.setListenerOrientation(x,y,z,ux,uy,uz);
}

function setListenerPosition(x,y,z){
	resonanceAudioScene.setListenerPosition(x,y,z);
}

function updateSource2DPosition(elmnt) {
    let coordZ = (((parseInt(elmnt.style.top) + (Common.tileHeight / 2)) - Common.layoutHeight / 2) / (Common.layoutHeight / 2)) * (Common.roomDepth/2);
    let coordX = (((parseInt(elmnt.style.left) + (Common.tileWidth / 2)) - Common.layoutWidth / 2) / (Common.layoutWidth / 2)) * (Common.roomWidth/2);
    if(elmnt.id=="publisher"){
      resonanceAudioScene.setListenerPosition(coordX,0,coordZ);
    }
    else{
      sources[elmnt.id].setPosition(coordX, 0, coordZ);
    }
    console.log("x=" + coordX + " z=" + coordZ);
}

export {initResonanceAudio,connectVideoToResonanceAudio,addMusicSource,setSourcePosition,setListenerOrientation,setListenerPosition,updateSource2DPosition};