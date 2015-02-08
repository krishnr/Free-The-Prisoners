# Free The Prisoners

This webapp is an implementation of a solution to Pebble’s coding challenge for their summer 2015 web developer position.

## How to run the app

1. Download the whole repository to your computer
2. Run the app by running `node server.js`

## The Problem
Let’s start off with the wacky problem:

> There is a person in a room trapped behind a transparent wall with holes drilled in it. Behind the wall is a computer running your webapp. The only way for the person to interact with the computer is by voice.
 
> There are an additional four rooms numbered 1 to 4, each with a person sitting at a computer running another webapp whose only interface is a single button and a place to indicate when the user should press the button. All these computers are connected to a server over very poor connections and have identified themselves with their room numbers. The person trapped in the first room is shown the order in which the people in the other rooms must press their buttons in, in order to unlock all the rooms and free everyone.
 
> If the buttons are pressed in the wrong order, they will be trapped forever.

## My Solution

I’ve decided to build a webapp using Node + Express. socket.io will handle the websockets that will push commands from the server and receive commands from the clients. The annyang library will handle the voice commands that the first prisoner dictates.

### Application Flow
1. Prisoner 1’s computer is running the “Input” page of the web app. He dictates the voice commands to his browser. He begins by yelling “Start” and ends by yelling “Stop”. The button order is just yelled out like “1 4 2 3 1 ...” etc.

2. Annyang parses the voice input and stores the button order instructions, which it sends to the Node server.

3. The server then opens a connection with the room corresponding to the first button press, 1 in this case. It indicates to the prisoner in the room that it’s their turn to press the button. 

4. The prisoner presses the button and when it is received by the server, the server sends an acknowledgement to the prisoner. During this whole time, all the other prisoners see a message that says “Please wait until instructed to press the button”.

5. This process repeats until the instructions are exhausted, at which point the server outputs “Free them!” and the prisoners are released.

### Design Decisions

1. The first prisoners yells out all the instructions at once in a bulk input rather than inputting them one at a time. This means that the first prisoner is not involved anymore after he’s given his inputs. He does not need to receive any feedback.

2. Only the prisoner whose turn it is to press the button will receive an instruction from the server. The other prisoners need not know what’s going on. They will simply wait until it’s their turn to press the button.

## Scaling the problem

Suppose the problem needs to be scaled to multiple groups of rooms all with different orders the button needs to be pressed.

All this would really change is the input. The first prisoner would have to specify which group of rooms as well as which room number. For example, if the first instruction was for room #4 of group #2, the first prisoner would yell “G2R4”. The server would then know exactly which connection to open to send the instruction.

Nothing really changes for all the prisoners in the rooms. They will still wait and watch until it’s their turn to hit the button.