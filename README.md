# VDX.tv

## Problem statement
Create a custom video player, where some of the controls are with video player object and some of them can be shared across all instance of player on same screen

- Create a video player component
- Use that component multiple time on same screen 
- Controls at one place should not affect another places when used same component at multiple places
- Provide a way where are instance of the component will achieve the effect

## Solution

- Created a custom component vdx-player
- All solution is done in vannila JS
- `Play` and `Full screen` control in each video component responsible for its own instance
- `Mute` control will mute all instance of vdx-player


## How to run locally

- clone the repo
- run `npm i`
- run `npm start`
- go to [http://localhost:5000](http://localhost:5000)