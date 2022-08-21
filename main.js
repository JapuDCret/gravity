/**
 * @param {HTMLCanvasElement} canvas
 */
function init(canvas) {
    const ctx = canvas.getContext('2d');

    canvas.height = window.innerHeight-2;
    canvas.width = window.innerWidth-1;

    const massSun = new Decimal(1.989).times(new Decimal(10).pow(30));
    const massEarth = new Decimal(5.972).times(new Decimal(10).pow(24));
    const massMoon = new Decimal(7.342).times(new Decimal(10).pow(22));
    const basePositionSun = new Decimal(25000000000);
    const distanceEarthSun = new Decimal(1.513).times(new Decimal(10).pow(11));
    const distanceMoonEarth = new Decimal(3.844).times(new Decimal(10).pow(8));

    const sunForceVector = new Vector(new Decimal(PI.times(0)), new Decimal(0));
    const earthForceVector = new Vector(new Decimal(0), new Decimal(10));//new Vector(PI.dividedBy(-2), new Decimal(30_000_000_00));
    const moonForceVector = new Vector(PI.dividedBy(2), new Decimal(1_028)).add(earthForceVector);

    const elements = [
        //new Body(massSun, basePositionSun, new Decimal(50000000000), sunForceVector),
        new Body(massEarth, basePositionSun.plus(distanceEarthSun), new Decimal(36500000000), new Vector(new Decimal(PI), new Decimal(10000000))),
        new Body(massEarth, basePositionSun.plus(distanceEarthSun), new Decimal(33500000000), new Vector(new Decimal(0), new Decimal(10000000))),
        //new Body(massMoon, basePositionSun.plus(distanceEarthSun.plus(distanceMoonEarth)), new Decimal(50000000000), moonForceVector.add(earthForceVector)),
        //new Body(new Decimal(100), new Decimal(100), new Decimal(100), new Vector(new Decimal(0), new Decimal(0))),
        //new Body(new Decimal(500), new Decimal(250), new Decimal(250), new Vector(new Decimal(0), new Decimal(0))),
    ];

    window.drawThreadCallbackId = setInterval(() => {
        drawThread(ctx, elements);
    }, drawUpdateInterval);

    canvas.addEventListener('click', () => {
        updateRequested = true;
    }, false);

    performCalculations(elements);
}

async function performCalculations(elements) {
    if(performUpdatesOnCommand) {
        if(updateRequested) {
            updateRequested = false;
            calcThread(elements);
        }
        window.setTimeout(() => {
            performCalculations(elements);
        }, drawUpdateInterval);
    } else {
        const startTime = new Date().getTime();
        calcThread(elements);
        const endTime = new Date().getTime();
        const timeUntilUpdate = calcUpdateInterval - (endTime - startTime);
        if (timeUntilUpdate > 0) {
            window.setTimeout(() => {
                performCalculations(elements);
            }, timeUntilUpdate);
        } else {
            performCalculations(elements);
        }
    }
}

/**
 * @param {CanvasRenderingContext2D} ctx
 */
function clearCanvas(ctx) {
    // Store the current transformation matrix
    ctx.save();

    // Use the identity matrix while clearing the canvas
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#16161d';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Restore the transform
    ctx.restore();
}


/**
 * @param {CanvasRenderingContext2D} ctx 
 * @param {Array<Body>} elements
 */
function drawThread(ctx, elements) {
    clearCanvas(ctx);

    for(const e of elements) {
        e.draw(ctx);
    }
};


/**
 * @param {Array<Body>} elements
 */
function calcThread(elements) {
    for(const e of elements) {
        e.calc(elements);
    }
    for(const e of elements) {
        e.applyCalc(elements);
    }
};

init(document.getElementById("canvas"));