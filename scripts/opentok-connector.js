import * as ThreeX from './threejs-connector.js';
import * as Common from './common.js';
import * as ResonanceX from './resonance-audio-connector.js';

var OTSession = undefined;
var publisher;
var subscriberVideoElems = {};
var subscribers = {};
/*var token = "T1==cGFydG5lcl9pZD0zODE2OTQ1MiZzaWc9ZjcxMWY3NjlkM2NmNjRjNzFhMDE5MWE3ZDZmMWZjNjNjMmZjMGY1OTpzZXNzaW9uX2lkPTFfTVg0ek9ERTJPVFExTW41LU1UWXdOVFl3TWpnd056Y3dPWDV4ZDFJd2JEaGxUMWMyVkM5MEt6aE5XamwyUm5sRUswbC1mZyZjcmVhdGVfdGltZT0xNjA1NjAyODA4Jm5vbmNlPTAuNjEwODQ5NzkwNzAzNjU2NyZyb2xlPW1vZGVyYXRvciZleHBpcmVfdGltZT0xNjA2MjA3NjA4JmluaXRpYWxfbGF5b3V0X2NsYXNzX2xpc3Q9";
var sessionId = "1_MX4zODE2OTQ1Mn5-MTYwNTYwMjgwNzcwOX5xd1IwbDhlT1c2VC90KzhNWjl2RnlEK0l-fg";
var apiKey = "38169452";*/

var apiKey="46183452";
var sessionId = "2_MX40NjE4MzQ1Mn5-MTU2NDgyMzMxNDIxMX5KaVlsM1MvdmF0dU1XOFBCalM0T09Ic1Z-fg";
var token ="T1==cGFydG5lcl9pZD00NjE4MzQ1MiZzaWc9YmUzYWMxNzZkODRkMGQ0NjQxMTMzODNhZjc3MjE0NjRjZDYyZmRlMjpzZXNzaW9uX2lkPTJfTVg0ME5qRTRNelExTW41LU1UVTJORGd5TXpNeE5ESXhNWDVLYVZsc00xTXZkbUYwZFUxWE9GQkNhbE0wVDA5SWMxWi1mZyZjcmVhdGVfdGltZT0xNjA1ODY3OTgxJnJvbGU9cHVibGlzaGVyJm5vbmNlPTE2MDU4Njc5ODEuNzgyMjU5NDgwOTU2NQ==";

function initializeVideoSession() {
    OTSession = OT.initSession(apiKey, sessionId);
    OTSession.connect(token, function(error) {
        if (error) {
            handleError(error);
            return false;
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
            subscriberVideoElems[subscriber.stream.id] = event.element;
            subscribers[subscriber.stream.id] = subscriber;
            if(Common.is3DMode()){
              ThreeX.create3DSubscriber(event.target.streamId,event.element);
            }
            else{
              addSubcriberToDom(event.target.streamId,event.element);
            }
        });

    });

    OTSession.on('streamDestroyed', function(event) {
        removeSubscriber(event);
    });

    return true;
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
        ThreeX.remove3DSubscriber(event.stream.id);
    }
    else{
        document.getElementById(event.stream.id).remove();
        delete subscribers[event.stream.id];
        delete subscriberVideoElems[event.stream.id];
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
          } else {
              OTSession.publish(publisher, function(error) {
                  if (error) {
                      handleError(error);
                  } else {
                      console.log('Publishing a stream.');
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

export {initializeVideoSession,addSubscribersToDom,removeSubscribersFromDom,getSubscriberList,getSubscriberElemList};
