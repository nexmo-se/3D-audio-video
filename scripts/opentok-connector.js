import * as ThreeX from './threejs-connector.js';
import * as Common from './common.js';
import * as ResonanceX from './resonance-audio-connector.js';

var OTSession = undefined;
var publisher;
var subscriberVideoElems = {};
var subscribers = {};
var isConnected = false;
var callback = undefined;

var apiKey="";
var sessionId = "";
var token ="";

var STATUS_DISCONNECTED=0;
var STATUS_CONNECTED=1;
var STATUS_ERROR=2;

function setConnectionCallback(func){
    callback = func;
}
function connectOrDisconnect(userid){
    if(isConnected){
        isConnected = false;
        OTSession.disconnect();
        if(callback)
            callback(STATUS_DISCONNECTED);
    }
    else{
        getSessionInfo(userid);
    }
}

function getSessionInfo(userid){
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var info = JSON.parse(xhttp.responseText);
            try{
                apiKey = info.apiKey;
                token = info.token;
                sessionId = info.sessionId;
                initializeVideoSession()
            }
            catch(error){
                alert("Error parsing session information");
            }
        }
    };
    xhttp.open("GET", "/token?u="+userid, true);
    xhttp.send();
}

function getStatus(){
    return isConnected;
}
function initializeVideoSession() {
    OTSession = OT.initSession(apiKey, sessionId);
    OTSession.connect(token, function(error) {
        if (error) {
            handleError(error);
            if(callback)
                callback(STATUS_ERROR);
        } else {
            console.log("session connected");
            startPublishing();
        }
    });
    OTSession.on('streamCreated', function(event) {

        var subscriber = OTSession.subscribe(event.stream, {
            insertDefaultUI: false
        }, handleError);

        subscriber.on('videoElementCreated', function(event) {
            subscriberVideoElems[subscriber.stream.connection.connectionId] = event.element;
            subscribers[subscriber.stream.connection.connectionId] = subscriber;
            if(Common.is3DMode()){
              ThreeX.create3DSubscriber(subscriber.stream.connection.connectionId,event.element);
            }
            else{
              addSubcriberToDom(subscriber.stream.connection.connectionId,event.element);
            }
        });

    });
    OTSession.on('disconnected', function(event) {
        isConnected = false;
        if(callback)
            callback(STATUS_DISCONNECTED);
    });
    
    OTSession.on('streamDestroyed', function(event) {
        removeSubscriber(event);
    });
    
    OTSession.on('signal:position', function(event){
        if(event.from.connectionId != OTSession.connection.id){
            console.log("received position: "+event.data);
            var position = JSON.parse(event.data);
            if(Common.is3DMode()){
                ThreeX.moveSubscriberToPos(event.from.connectionId,position);
            }
        }
    })
}

function addSubcriberToDom(streamId,element) {
    var x = Common.randomIntFromInterval(100,500);
    var z = Common.randomIntFromInterval(100,500);
    
    let coordZ = ((z - (Common.layoutHeight / 2)) / (Common.layoutHeight / 2)) * (Common.roomDepth/2);
    let coordX = ((x - (Common.layoutWidth / 2)) / (Common.layoutWidth / 2)) * (Common.roomWidth/2);
    coordX = Math.round(coordX*Common.dimensionFactor*100)/100;
    coordZ = Math.round(coordZ*Common.dimensionFactor*100)/100;
    
    var tempHtml = '<div id="' + streamId + '" class="video-tile" style="top:'+z+'px;left:'+x+'px"><div id="' + streamId + '-header" class="video-header subheader"><img src="images/move.png" style="width:20px;height:20px;float:right"/></div></div>';
    document.getElementById('layout').insertAdjacentHTML('beforeend', tempHtml);
    element.width=320;
    element.height=240;
    document.getElementById(streamId).appendChild(element);
    element.volume=0;
    Common.dragElement(document.getElementById(streamId), document.getElementById(streamId + "-header"),function(elem){
    	ResonanceX.updateSource2DPosition(elem,document.getElementById("publisher"));
    });
 
    if(!ResonanceX.sourceExists()){
      /* we are adding this subscriber for the first time, so connect to resonance */
      console.log("Adding source:"+streamId+" at top:"+z+" left:"+x+" and coordX:"+coordX+" coordZ:"+coordZ);
      ResonanceX.connectVideoToResonanceAudio(streamId,element,coordX,0,coordZ);
    }
}

function addSubscribersToDom(){
  for (var streamId in subscribers) {
    addSubcriberToDom(streamId,subscriberVideoElems[streamId]);
  }
}

function removeSubscriber(event) {
    if(Common.is3DMode()){
        ThreeX.remove3DSubscriber(event.stream.connection.connectionId);
    }
    else{
        document.getElementById(event.stream.connection.connectionId).remove();
        delete subscribers[event.stream.connection.connectionId];
        delete subscriberVideoElems[event.stream.connection.connectionId];
    }
}

function removeSubscribersFromDom(){
  for (var streamId in subscribers) {
    document.getElementById(streamId).remove();
  }
}

function startPublishing() {
    
      publisher = OT.initPublisher('publisher', {
          insertMode: 'append',
          width: '150px',
          height: '120px'
      }, (err) => {
          if (err) {
              handleError(err);
              OTSession.disconnect();
              if(callback)
                callback(STATUS_ERROR);
          } else {
              OTSession.publish(publisher, function(error) {
                  if (error) {
                      handleError(error);
                      OTSession.disconnect();
                      if(callback)
                        callback(STATUS_ERROR);
                  } else {
                      console.log('Publishing a stream.');
                      isConnected = true;
                      if(callback)
                        callback(STATUS_CONNECTED);
                  }
              });
          }
      });
}

function handleError(error) {
    if (error) {
        console.log(error.message);
    }
}

function getSubscriberList(){
	return subscribers;
}

function getSubscriberElemList(){
	return subscriberVideoElems;
}

function sendPositionUpdate(position){
    if(isConnected){
        console.log("Sending position update: " + JSON.stringify(position));
        OTSession.signal({data: JSON.stringify(position), type:'position'},function(error) {
           if(error){
               handleError(error);
           }             
        });
    }
}

export{initializeVideoSession,addSubscribersToDom,removeSubscribersFromDom,getSubscriberList,getSubscriberElemList,connectOrDisconnect,getStatus,STATUS_CONNECTED,STATUS_DISCONNECTED,STATUS_ERROR,setConnectionCallback,callback,sendPositionUpdate};
