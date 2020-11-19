import * as ThreeX from './threejs-connector.js';
import * as OpentokX from './opentok-connector.js';
import * as ResonanceX from './resonance-audio-connector.js';
import * as Common from './common.js';

var isMusicPlaying = false;
let musicElement = undefined;


function mainInit(){
  //alert("x");
  document.getElementById("publisher").style.top=((document.getElementById("layout").clientHeight/2) - 75)+"px";
  document.getElementById("publisher").style.left=((document.getElementById("layout").clientWidth/2) - 75)+"px";
  document.getElementById("playpausebtn").onclick = playPauseMusic;
  document.getElementById("togBtn").onclick = switchLayout;
  document.getElementById("volume").onchange = changeMusicVolume;
  document.getElementById("stereomode").onclick = changeAudioMode;
  document.getElementById("spatialmode").onclick = changeAudioMode;
  window.addEventListener('resize', onWindowResize, false);
  document.body.addEventListener( 'click', function () {
    if(Common.is3DMode()){
     ThreeX.lockPointerControls();
    }
  });
  ResonanceX.initResonanceAudio();
  addMusicElement();
  OpentokX.initializeVideoSession();
  ThreeX.init3D();
  Common.dragElement(document.getElementById("publisher"), document.getElementById("publisher-header"),function(elem){
    ResonanceX.updateSource2DPosition(elem);
  });
}

function onWindowResize() {
    Common.populateLayoutDimensions();
    ThreeX.setCanvasSize()
}

function changeAudioMode(){
    if(document.getElementById("stereomode").checked){
        console.log("enabling stereo mode");
        ResonanceX.changeMode(ResonanceX.MODE_STEREO);
    }
    else if(document.getElementById("spatialmode").checked){
        console.log("enabling spatial mode");
        ResonanceX.changeMode(ResonanceX.MODE_SPATIAL);
    }
}
function switchLayout() {
  if(Common.is3DMode()){
    ThreeX.unlockPointerControls();
    Common.hide3DLayout();
    Common.show2DLayout();
    /* if we are currently in 3D mode, remove subscribers from the scene and stop animation loop */
    ThreeX.remove3DSubscribers();
    Common.set3DMode(false);
    /* add subscribers to DOM */
    OpentokX.addSubscribersToDom();
  }
  else{
    Common.hide2DLayout();
    Common.show3DLayout();
    /* if we are currently in 2D mode, remove subscribers from DOM, stop playing music */
    OpentokX.removeSubscribersFromDom();
    pauseMusic();
    Common.set3DMode(true);
    /* add subscribers to the 3D scene */
    ThreeX.add3DSubscribersToScene();
  }
}


function changeMusicVolume(){
  if(musicElement!=undefined){
    musicElement.volume = document.getElementById("volume").value;
  }
}
function playPauseMusic(){
  if(musicElement != undefined){
    if(isMusicPlaying){
      isMusicPlaying = false;
      musicElement.pause();
      document.getElementById("playpausebtn").innerHTML = "Play";
    }
    else{
      isMusicPlaying = true;
      musicElement.play();
      document.getElementById("playpausebtn").innerHTML = "Pause";
    }
  }
}

function pauseMusic(){
  isMusicPlaying = false;
  musicElement.pause();
  document.getElementById("playpausebtn").innerHTML = "Play";
}

function addMusicElement(){
  musicElement = document.createElement('audio');
  musicElement.src = "audio/music.wav";
  musicElement.crossOrigin = 'anonymous';
  musicElement.load();
  musicElement.loop = true;
  ResonanceX.addMusicSource(musicElement);
  Common.dragElement(document.getElementById("music"), document.getElementById("music-header"),function(elem){
    ResonanceX.updateSource2DPosition(elem, document.getElementById("publisher"));
  });
  ResonanceX.updateSource2DPosition(document.getElementById("music"),document.getElementById("publisher"));
}

export {mainInit};