# Spatial Audio and 3D video using Vonage Video API

## What you need
* Vonage Video JS SDK
* Resonance Audio Web SDK from Google
* ThreeJS Web SDK
* Tween.js 

## How does it work

This demo supports 3 modes.
* Mono
* Stereo
* Spatial

We use WebAudio AudioContext to drive the logic.

When a subscriber joins the session, We use AudioContext.createMediaStreamSource to create AudioContext source from subscriber's audio. Then we connect this source to all three Gain nodes (mono, stereo and spatial). When you select a mode we set the corresponding Gain node value 1 and rest to 0.

## 2D logic
When you drag a subscriber's video tile, we dynamically calculate the position and change audio profile.
In Stereo mode - we calculate the the angle of the subsciber vs the publisher and use that to calculate the stereo level.
In Spatial mode - We calculate the X and Z co-orinates of the subscriber (Y=0 in 2D) and then send this to Resonance Audio.

![2D](images/2d.png?raw=true "2D Mode")

## 3D logic

In 3D only spatial audio is supported. You can move around using mouse and keyboard. When a remote participant moves in his 3D space, you can see him moving in your space too. We use signal API to send the position every one second (only if the position changed) and then use Tween.JS to animate the movement.

![3D](images/3d.png?raw=true "3D Mode")
