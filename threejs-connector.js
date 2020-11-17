import * as THREE from './node_modules/three/build/three.module.js';
import { OrbitControls } from './node_modules/three/examples/jsm/controls/OrbitControls.js';
import { PointerLockControls } from './node_modules/three/examples/jsm/controls/PointerLockControls.js';
import * as ResonanceX from './resonance-audio-connector.js';
import * as Common from './common.js';
import * as OpentokX from './opentok-connector.js';

var threeScene = undefined;
var camera = undefined;
var controls = undefined;
var renderer = undefined;
var canvasDiv = undefined;
let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;
let canJump = false;

let prevTime = performance.now();
const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();
const vertex = new THREE.Vector3();
const color = new THREE.Color();

let controlsDirection = new THREE.Vector3();

function init3D(){
  canvasDiv = document.getElementById("3dcanvas");
  console.log(canvasDiv);
  renderer = new THREE.WebGLRenderer( { antialias: true } );
  renderer.setSize( canvasDiv.clientWidth, canvasDiv.clientHeight );
  renderer.setClearColor( 0x808080 );
  renderer.outputEncoding = THREE.sRGBEncoding;
  canvasDiv.appendChild( renderer.domElement );

  threeScene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera( 75, canvasDiv.clientWidth / canvasDiv.clientHeight, 0.01, 20 );
  camera.position.set(0,-0.5,0);
  //camera.lookAt(0,0,0);
  threeScene.add( camera );

  var hlight = new THREE.HemisphereLight( 0xffffbb, 0x080820, 1 );
  threeScene.add( hlight );
  controls = new PointerLockControls( camera, document.body );
  controls.minPolarAngle = 0;
  controls.maxPolarAngle = Math.PI / 2;
  controls.addEventListener('change', function(){controlsDirectionChanged();});
  threeScene.add( controls.getObject() );

  threeScene.add( new THREE.AmbientLight( 0x444444 ) );
  create3DRoom();
  bindKeys();
  animate();
}

function controlsDirectionChanged(){
  controls.getDirection(controlsDirection);
  ResonanceX.setListenerOrientation(-1*controlsDirection.x,-1*controlsDirection.y,-1*controlsDirection.z,-1*camera.up.x,-1*camera.up.y,-1*camera.up.z);
}

function animate() {
    setInterval(function(){
      const time = performance.now();
      if(Common.is3DMode()){
        const delta = ( time - prevTime ) / 1000;
        velocity.x -= velocity.x * 10.0 * delta;
        velocity.z -= velocity.z * 10.0 * delta;

        velocity.y -= 9.8 * 100.0 * delta; // 100.0 = mass

        direction.z = Number( moveForward ) - Number( moveBackward );
        direction.x = Number( moveRight ) - Number( moveLeft );
        direction.normalize(); // this ensures consistent movements in all directions

        if ( moveForward || moveBackward ) velocity.z -= direction.z * 400.0 * delta;
        if ( moveLeft || moveRight ) velocity.x -= direction.x * 400.0 * delta;
        if(camera.position.x + (-velocity.x * delta*0.2) < Common.roomWidth/2 && camera.position.x + (-velocity.x * delta*0.2) > -1*Common.roomWidth/2){
          controls.moveRight( - velocity.x * delta *0.05);
        }
        else{
          controls.moveRight(  velocity.x * delta *0.2);
        }
        if(camera.position.z + (velocity.z * delta*0.2) < Common.roomDepth/2 && camera.position.z + (velocity.z * delta*0.2) > -1*Common.roomDepth/2){
          controls.moveForward( - velocity.z * delta*0.05 );
        }
        else{
          controls.moveForward(  velocity.z * delta*0.2 );
        }
        ResonanceX.setListenerPosition(camera.position.x,camera.position.y,camera.position.z);
        renderer.render( threeScene, camera );
      }
      prevTime = time;
  },40);
}

function bindKeys(){
  const onKeyDown = function ( event ) {

    switch ( event.keyCode ) {
      case 38: // up
      case 87: // w
        moveForward = true;
        console.log(camera.position);
        break;
      case 37: // left
      case 65: // a
        moveLeft = true;
        break;
      case 40: // down
      case 83: // s
        moveBackward = true;
        break;
      case 39: // right
      case 68: // d
        moveRight = true;
        break;
      case 32: // space
        if ( canJump === true ) velocity.y += 350;
        canJump = false;
        break;
    }
  };

  const onKeyUp = function ( event ) {
    switch ( event.keyCode ) {
      case 38: // up
      case 87: // w
        moveForward = false;
        break;
      case 37: // left
      case 65: // a
        moveLeft = false;
        break;
      case 40: // down
      case 83: // s
        moveBackward = false;
        break;
      case 39: // right
      case 68: // d
        moveRight = false;
        break;
    }

  };

  document.addEventListener( 'keydown', onKeyDown, false );
  document.addEventListener( 'keyup', onKeyUp, false );
}

function create3DRoom(){

  var wall1 = new THREE.BoxBufferGeometry( Common.roomWidth, Common.roomHeight, 0.1 );
  var wall2 = new THREE.BoxBufferGeometry( Common.roomWidth, Common.roomHeight, 0.1 );
  var wall3 = new THREE.BoxBufferGeometry( Common.roomDepth, Common.roomHeight, 0.1 );
  var wall4 = new THREE.BoxBufferGeometry( Common.roomDepth, Common.roomHeight, 0.1 );
  var loader = new THREE.TextureLoader();   
  const materials = [
    new THREE.MeshBasicMaterial({color: 0x000000}),
    new THREE.MeshBasicMaterial({color: 0x022000}),
    new THREE.MeshBasicMaterial({color: 0x002200}),
    new THREE.MeshBasicMaterial({color: 0x000330}),
    new THREE.MeshBasicMaterial({map: loader.load('images/wall2.jpg')}),
    new THREE.MeshBasicMaterial({map: loader.load('images/wall2.jpg')})
  ];

  var mesh = new THREE.Mesh( wall1, materials );
  mesh.position.set( 0, 0, Common.roomDepth/2 );
  mesh.rotation.set( 0, 0, 0 );
  mesh.receiveShadow = true;
  threeScene.add( mesh );

  mesh = new THREE.Mesh( wall2, materials );
  mesh.position.set( 0, 0, -1*(Common.roomDepth/2) );
  mesh.rotation.x = Math.PI * 1;
  mesh.receiveShadow = true;
  threeScene.add( mesh );
  
  mesh = new THREE.Mesh( wall3, materials );
  mesh.position.set( Common.roomWidth/2, 0, 0 );
  mesh.rotation.set( 0, - Math.PI / 2, 0 );
  mesh.receiveShadow = true;
  threeScene.add( mesh );
  
  mesh = new THREE.Mesh( wall4, materials );
  mesh.position.set( -1*(Common.roomWidth/2), 0, 0 );
  mesh.rotation.set( 0, Math.PI / 2, 0 );
  mesh.receiveShadow = true;
  threeScene.add( mesh );

  addCeiling();
  addFlooring();
}

function addFlooring(){
  
    var loader = new THREE.TextureLoader();
    loader.load('images/flooring.jpg', function (texture) {
      texture.wrapS = texture.wrapY = THREE.RepeatWrapping
      texture.offset.set( 0, 0 );
      texture.repeat.set( 4, 1 );

      var mesh = new THREE.Mesh( new THREE.BoxBufferGeometry( Common.roomWidth, Common.roomDepth, 0.1 ), new THREE.MeshPhongMaterial({map: texture}) );
      mesh.position.set( 0, -1*(Common.roomHeight/2), 0 );
      mesh.rotation.set( - Math.PI / 2, 0, 0 );
      threeScene.add( mesh );
    },undefined, function(error){
      
    });
  
}

function addCeiling(){
  
    var loader = new THREE.TextureLoader();
    loader.load('images/metalceiling.jpg', function (texture) {
      texture.wrapS = texture.wrapY = THREE.RepeatWrapping
      texture.offset.set( 0, 0 );
      texture.repeat.set( 4, 1 );

      var mesh = new THREE.Mesh( new THREE.BoxBufferGeometry( Common.roomWidth, Common.roomDepth, 0.1 ), new THREE.MeshBasicMaterial({map: texture}) );
      mesh.position.set( 0, Common.roomHeight/2, 0 );
      mesh.rotation.set( - Math.PI / 2, 0, 0 );
      threeScene.add( mesh );
    },undefined, function(error){
        
    });
  
}

function create3DSubscriber(streamId, element){
   var subscriber3d = new THREE.BoxBufferGeometry( 0.2, 0.2, 0.2 );
   /*var video1   = document.createElement('video');
    video1.width  = 320;
    video1.height = 240;
    video1.muted  = false;
    video1.autoplay = true;
    video1.loop = true;
    video1.src  = "video/vonage.mp4";
    video1.play();*/
    var video1Texture  = new THREE.VideoTexture(element/*video1*/ );
    video1Texture.wrapS = THREE.RepeatWrapping;
    video1Texture.wrapT = THREE.RepeatWrapping;
    video1Texture.repeat.set(-1, 1);
    video1Texture.offset.set(1, 0);

    var vidMesh = new THREE.Mesh(subscriber3d, new THREE.MeshBasicMaterial({map: video1Texture}));
    vidMesh.name = streamId;

    var x = Common.randomIntFromInterval(-10*(Common.roomWidth-3)/2,10*(Common.roomWidth-3)/2)/10;
  	var y = -0.5;//randomIntFromInterval(-10*(roomHeight-1.5)/2,10*(roomHeight-1.5)/2)/10;
  	var z = Common.randomIntFromInterval(-10*(Common.roomDepth-3)/2,10*(Common.roomDepth-3)/2)/10;

    if(sources.hasOwnProperty(streamId)){
        /* this stream was already added to resonance, so just change its position*/
        setObjectPosition(vidMesh,x,y,z);
        ResonanceX.setSourcePosition(streamId,x,y,z);
        threeScene.add(vidMesh);
    }
    else{
  		ResonanceX.connectVideoToResonanceAudio(streamId,element,x,y,z);
  		setObjectPosition(vidMesh,x,y,z);
        threeScene.add(vidMesh);
    }

}

function add3DSubscribersToScene(){
  var elemList = OpentokX.getSubscriberElemList();
  var streamList = OpentokX.getSubscriberList();
  for (var streamId in streamList) {
    create3DSubscriber(streamId,elemList[streamId]);
  }
}

function remove3DSubscribers(){
 var streamList = OpentokX.getSubscriberList();
 for (var streamId in streamList) {
    const object = threeScene.getObjectByName(streamId);
    object.geometry.dispose();
    object.material.dispose();
    threeScene.remove( object );
  }
}

function setObjectPosition(o,x,y,z){
	o.position.set(x,y,z);
}

function setCanvasSize(){
	let width =canvasDiv.clientWidth;
	let height= canvasDiv.clientHeight;
	camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize( width, height);
}

function unlockPointerControls(){
	if(controls.isLocked){
      controls.unlock();
    }
}
function lockPointerControls(){
	if(!controls.isLocked){
      controls.lock();
    }
}

export {init3D, create3DSubscriber,add3DSubscribersToScene,remove3DSubscribers,setObjectPosition,setCanvasSize,lockPointerControls,unlockPointerControls};