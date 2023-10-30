let cvs = document.getElementById("canvas");
let ctx = cvs.getContext("2d");


function adjustCanvasSize() {
    ctx.canvas.width  = window.innerWidth;
    ctx.canvas.height = window.innerHeight;
}

adjustCanvasSize();
// window.addEventListener('resize', adjustCanvasSize, false);


const SHUTTER_ROWS = 8;
const SHUTTER_COLS = 7;
// const SHUTTER_ROWS = 20;
// const SHUTTER_COLS = 15;

const SHUTTER_WIDTH = ctx.canvas.width / SHUTTER_COLS;
const SHUTTER_HEIGHT = ctx.canvas.height / SHUTTER_ROWS;

const ShutterStates = {
	OPENING: 1,
	CLOSING: -1,
	IDLE: 0
}

class Shutter {

    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height= height;
        this.closed = 1;
        this.state = ShutterStates.IDLE;
        this.prevstate = ShutterStates.IDLE;
        this.speed = 0.001;
    }

    draw() {
        ctx.fillStyle = "black";
        ctx.fillRect(this.x, this.y, this.width, this.height * this.closed);
    }

    updateState(newState){
        this.prevstate = this.state;
        this.state = newState;
    }

    open() {
        this.updateState(ShutterStates.OPENING);
    }

    close() {
        this.updateState(ShutterStates.CLOSING);
    }

    stop() {
        this.updateState(ShutterStates.IDLE);
    }

    toggle() {
        if(this.state === ShutterStates.IDLE && (this.prevstate === ShutterStates.CLOSING || this.prevstate === ShutterStates.IDLE)){
            this.updateState(ShutterStates.OPENING);
        }
        else if(this.state === ShutterStates.IDLE && (this.prevstate === ShutterStates.OPENING || this.prevstate === ShutterStates.IDLE)){
            this.updateState(ShutterStates.CLOSING);
        }
        else if(this.state === ShutterStates.CLOSING || this.state === ShutterStates.OPENING){
            this.updateState(ShutterStates.IDLE);
        }
    }

    update() {
        if (this.state === ShutterStates.OPENING) {
            this.closed -= this.speed;
            if(this.closed <= 0){
                this.closed = 0;
                this.updateState(ShutterStates.IDLE);
            }
        }
        else if (this.state === ShutterStates.CLOSING) {
            this.closed += this.speed;
            if(this.closed >= 1){
                this.closed = 1;
                this.updateState(ShutterStates.IDLE);
            }
        }
        this.draw();
    }

    hit(x, y){
        return this.x <= x && x <= (this.x + this.width) &&
               this.y <= y && y <= (this.y + this.height);

    }
}


// create shutters

let shutters = [];

for (let row = 0; row < SHUTTER_ROWS; row++) {
    shutters.push([]);
    for (let col = 0; col < SHUTTER_COLS; col++) {
        shutters[row][col] = new Shutter(col * SHUTTER_WIDTH, row * SHUTTER_HEIGHT, SHUTTER_WIDTH, SHUTTER_HEIGHT)
        shutters[row][col].draw();
    }    
}

// Event Handlers

function shuttersClose(){
    shutters.forEach(rows => {
        rows.forEach(shutter => {
            shutter.close();
        });
    });
}
document.getElementById("btn-close").addEventListener('click', shuttersClose, false);

function shuttersOpen(){
    shutters.forEach(rows => {
        rows.forEach(shutter => {
            shutter.open();
        });
    });
}
document.getElementById("btn-open").addEventListener('click', shuttersOpen, false);


function shuttersStop(){
    shutters.forEach(rows => {
        rows.forEach(shutter => {
            shutter.stop();
        });
    });
}
document.getElementById("btn-stop").addEventListener('click', shuttersStop, false);

function canvasClick(e){
    shutters.forEach(rows => {
        rows.forEach(shutter => {
            if(shutter.hit(e.x, e.y)){
                shutter.toggle();
            }
        });
    });
}
cvs.addEventListener('click', canvasClick, false);



function draw(){
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, cvs.width, cvs.height);

    shutters.forEach(rows => {
        rows.forEach(shutter => {
            shutter.update();
        });
    });

    window.requestAnimationFrame(draw);
}

draw();