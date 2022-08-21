const PI = Decimal.acos(-1);

/**
 * @param {Body} a 
 * @param {Body} b 
 * @returns {Decimal}
 */
function distance(a, b) {
    return a.x.minus(b.x).pow(2).plus(a.y.minus(b.y).pow(2)).sqrt();
}

//const G = new Decimal(6.67408).times(new Decimal(10).pow(-11));
const G = new Decimal(6.67408).times(new Decimal(10).pow(-2));

/**
 * @param {Body} a 
 * @param {Body} b 
 * @returns {Vector}
 */
 function gravForce(a, b) {
    // console.log('a.x = ', a.x, ', a.y = ', a.y);
    // console.log('b.x = ', b.x, ', b.y = ', b.y);
    return new Vector(gravForceAngle(a, b), gravForceMagnitude(a, b));
}

/**
 * @param {Body} a 
 * @param {Body} b 
 * @returns {Decimal}
 */
 function gravForceMagnitude(a, b) {
    const dist = distance(a, b);

    //console.log('gravForceMagnitude(): a.mass = ', a.mass);
    //console.log('gravForceMagnitude(): b.mass = ', b.mass);
    //console.log('gravForceMagnitude(): dist = ', dist);
    //console.log('gravForceMagnitude(): G = ', G);
    //console.log('gravForceMagnitude(): Math.pow(dist, 2) = ', Math.pow(dist, 2));

    // const magnitude = G * (a.mass * b.mass) / Math.pow(dist, 2);
    //console.log('gravForceMagnitude(): magnitude = ', magnitude);
    return G.times(a.mass.times(b.mass)).dividedBy(dist.pow(2));
}

/**
 * @param {Body} a 
 * @param {Body} b 
 * @returns {Decimal}
 */
 function gravForceAngle(a, b) {
    const angle = Decimal.atan2(b.y.minus(a.y), b.x.minus(a.x));
    log('gravForceMagnitude(): angle = ', angle.toNumber());
    log('gravForceMagnitude(): angle = ', angle.times(180).dividedBy(PI).toFixed(2), '°');
    return angle;
}

/**
 * @param {any[]} message 
 */
function log(...data) {
    if(logFilter()) {
        console.log(calcContext.id, ...data);
    }
}