import * as ThreeX from './threejs-connector.js';
import * as Common from './common.js';

var OTSession = undefined;
var subscriberVideoElems = {};
var subscribers = {};
var token = "T1==cGFydG5lcl9pZD0zODE2OTQ1MiZzaWc9ZjcxMWY3NjlkM2NmNjRjNzFhMDE5MWE3ZDZmMWZjNjNjMmZjMGY1OTpzZXNzaW9uX2lkPTFfTVg0ek9ERTJPVFExTW41LU1UWXdOVFl3TWpnd056Y3dPWDV4ZDFJd2JEaGxUMWMyVkM5MEt6aE5XamwyUm5sRUswbC1mZyZjcmVhdGVfdGltZT0xNjA1NjAyODA4Jm5vbmNlPTAuNjEwODQ5NzkwNzAzNjU2NyZyb2xlPW1vZGVyYXRvciZleHBpcmVfdGltZT0xNjA2MjA3NjA4JmluaXRpYWxfbGF5b3V0X2NsYXNzX2xpc3Q9";
var sessionId = "1_MX4zODE2OTQ1Mn5-MTYwNTYwMjgwNzcwOX5xd1IwbDhlT1c2VC90KzhNWjl2RnlEK0l-fg";
var apiKey = "38169452";

function initializeVideoSession() {
    OTSession = OT.initSession(apiKey, sessionId);
    OTSession.connect(token, function(error) {
        if (error) {
            handleError(error);
            return false;
        } else {
            console.log("session connected");
        }
    });
    OTSession.on('streamCreated', function(event) {

        var subscriber = OTSession.subscribe(event.stream, {
            insertDefaultUI: false
        }, handleError);

        subscriber.on('videoElementCreated', function(event) {
            subscriberVideoElems[subscriber.stream.id] = event.element;
            subscribers[subscriber.stream.id] = subscriber;
            if(is3DMode){
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
    var tempHtml = '<div id="' + streamId + '" class="video-tile"><div id="' + streamId + '-header" class="video-header subheader"><img src="images/move.png" style="width:20px;height:20px;float:right"/></div></div>';
    document.getElementById('layout').insertAdjacentHTML('beforeend', tempHtml);
    element.width=320;
    element.height=240;
    document.getElementById(streamId).appendChild(element);
    Common.dragElement(document.getElementById(streamId), document.getElementById(streamId + "-header"),function(elem){
    	ResonanceX.updateSource2DPosition(elem);
    });
    if(!sources.hasOwnProperty(streamId)){
      /* we are adding this subscriber for the first time, so connect to resonance */
      connectVideoToResonanceAudio(streamId,element,3,0,3);
    }
}

function addSubscribersToDom(){
  for (var streamId in subscribers) {
    addSubcriberToDom(streamId,subscriberVideoElems[streamId]);
  }
}

function removeSubscriber(event) {
    document.getElementById(event.stream.id).remove();
    delete subscribers[event.stream.id];
    delete subscriberVideoElems[event.stream.id];
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
          height: '120px',
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
