import * as ThreeX from './threejs-connector.js';
import * as OpentokX from './opentok-connector.js';
import * as ResonanceX from './resonance-audio-connector.js';
import * as Common from './common.js';

var isMusicPlaying = false;
let musicElement = undefined;
var userid='';

function getQueryStringValue (key) {  
  return decodeURIComponent(window.location.search.replace(new RegExp("^(?:.*[&\\?]" + encodeURIComponent(key).replace(/[\.\+\*]/g, "\\$&") + "(?:\\=([^&]*))?)?.*$", "i"), "$1"));  
}  


function mainInit(){
  userid = getQueryStringValue("u");
  document.getElementById("publisher").style.top=((document.getElementById("layout").clientHeight/2) - 75)+"px";
  document.getElementById("publisher").style.left=((document.getElementById("layout").clientWidth/2) - 75)+"px";
  document.getElementById("playpausebtn").onclick = playPauseMusic;
  document.getElementById("togBtn").onclick = switchLayout;
  document.getElementById("volume").onchange = changeMusicVolume;
  document.getElementById("stereomode").onclick = changeAudioMode;
  document.getElementById("spatialmode").onclick = changeAudioMode;
  document.getElementById("nonemode").onclick = changeAudioMode;
  document.getElementById("callBtn").onclick = callBtnClicked;
  window.addEventListener('resize', onWindowResize, false);
  document.body.addEventListener( 'click', function () {
    if(Common.is3DMode()){
     ThreeX.lockPointerControls();
    }
  });
  ResonanceX.initResonanceAudio();
  addMusicElement();
  OpentokX.setConnectionCallback(videoCallBack);
  ThreeX.init3D();
  Common.dragElement(document.getElementById("publisher"), document.getElementById("publisher-header"),function(elem){
    ResonanceX.updateSource2DPosition(elem);
  });
  /* remove loading screen */
  var loader = document.getElementById("loading-screen");
  loader.remove();
}

function videoCallBack(status){
    document.getElementById("callBtn").disabled = false;
    if(status == OpentokX.STATUS_CONNECTED){
        document.getElementById("callcontrol").src="images/hangup.png";
    }
    else if(status == OpentokX.STATUS_DISCONNECTED){
        document.getElementById("callcontrol").src="images/call.png";
    }
    else if(status == OpentokX.STATUS_ERROR){
        
    }
}

function onWindowResize() {
    Common.populateLayoutDimensions();
    ThreeX.setCanvasSize()
}

function callBtnClicked(){
    document.getElementById("callBtn").disabled = true;
    OpentokX.connectOrDisconnect(userid);
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
    else if(document.getElementById("nonemode").checked){
        console.log("enabling none mode");
        ResonanceX.changeMode(ResonanceX.MODE_NONE);
    }
}
function switchLayout() {
  if(Common.is3DMode()){
    ThreeX.unlockPointerControls();
    /* re-enable stereo mode */
    document.getElementById("stereomode").disabled=false;
    Common.hide3DLayout();
    Common.show2DLayout();
    /* if we are currently in 3D mode, remove subscribers from the scene and stop animation loop */
    ThreeX.remove3DSubscribers();
    Common.set3DMode(false);
    /* add subscribers to DOM */
    OpentokX.addSubscribersToDom();
  }
  else{
    /* when going from 2D to 3D, disable stereo mode */
    ResonanceX.changeMode(ResonanceX.MODE_SPATIAL);
    document.getElementById("spatialmode").checked=true;
    document.getElementById("stereomode").disabled=true;
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