# Free The Prisoners

This webapp is an implementation of a solution to Pebble’s coding challenge for their summer 2015 web developer position.

Disclaimer: I'm much better at Ruby (Rails) than I am at JavaScript, but I gave this app my best shot and everything works as expected.

## How to run the app

1. Either clone this repo to your computer by running `git clone https://github.com/krishnr/Free-The-Prisoners.git` or download it as a zip [here](https://github.com/krishnr/Free-The-Prisoners/archive/master.zip).
2. Ensure you have [Node](http://nodejs.org/) installed. Then run `npm install` to get all the necessary packages.
3. Run the app by running `node index.js` and heading to `localhost:3000` on your browser (Chrome only)
4. On the index page, click the "Voice Inputter" button once and the "Prisoner" button 4 times to set the problem up.
5. Head to the voice inputter page you just opened, and speak out your instructions (after accepting microphone permissions).
6. Go through the prisoner pages to see whose turn it is to press the button. Repeat until the prisoners are free.

## The Problem
Let’s start off with the wacky problem:

> There is a person in a room trapped behind a transparent wall with holes drilled in it. Behind the wall is a computer running your webapp. The only way for the person to interact with the computer is by voice.
 
> There are an additional four rooms numbered 1 to 4, each with a person sitting at a computer running another webapp whose only interface is a single button and a place to indicate when the user should press the button. All these computers are connected to a server over very poor connections and have identified themselves with their room numbers. The person trapped in the first room is shown the order in which the people in the other rooms must press their buttons in, in order to unlock all the rooms and free everyone.
 
> If the buttons are pressed in the wrong order, they will be trapped forever.

## My Solution

I’ve decided to build a webapp using Node + Express. socket.io will handle the websockets that will push commands from the server and receive commands from the clients. The annyang library will handle the voice commands that the first prisoner dictates. Basic styling is done with the help of SkeletonCSS.

### Application Flow
1. The voice inputter’s computer is running the “Input” page of the web app. He dictates the voice commands to his browser. He begins by yelling “Start” immediately followed by the button order e.g. “1 4 2 3 1 ...” etc.

2. Annyang parses the voice input and displays the button order instructions. The input user then says "Send" to send the instructions to the Node server.

3. The server then sends a "Press the button" message to the room corresponding to the first button press, 1 in this case. It indicates to the prisoner in the room that it’s their turn to press the button. 

4. During this whole time, all the other prisoners see a message that says “Please wait until instructed to press the button”.

5. This process repeats until all the buttons are pressed in the right order, at which point the server outputs “Free them!” and the prisoners are released.

### Design Decisions

- The voice inputter yells out all the instructions at once in a bulk input rather than inputting them one at a time. This means that he is not involved anymore after he’s given his inputs. He does not need to know how the prisoners are doing.

- Only the prisoner whose turn it is to press the button will receive an instruction from the server. The other prisoners need not know what’s going on. They will simply wait until it’s their turn to press the button.


## If I didn't have to study for my physics midterm I would ...

- Write unit tests (sorry, I'm fairly new to JS and still learning how to test properly)
- Make the app more scalable to allow for multiple voice inputters and multiple groups of prisoners
- Keep track of prisoners disconnecting
  - Right now, the app assumes that prisoners don't have any means to disconnect their socket connection to the server
- Push the web app to production and run it on multiple computers to have a real life simulation of the problem

## Scaling the problem

Suppose the problem needs to be scaled to multiple groups of rooms all with different orders the button needs to be pressed.

All this would really change is the input. The first prisoner would have to specify which group of rooms as well as which room number. For example, if the first instruction was for room #4 of group #2, the first prisoner would yell “G2R4”. Each room would have its own socket namespace from which the server would know exactly where to send each instruction.

Nothing really changes for all the prisoners in the rooms. They will still wait and watch until it’s their turn to hit the button.