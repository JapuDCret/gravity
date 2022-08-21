class Point {
    /**
     * @param {Decimal} x 
     * @param {Decimal} y 
     */
    constructor(x, y) {
      this.x = x;
      this.y = y;
    }
}

class Vector {
    /**
     * @param {Decimal} direction multiple of Math.PI
     * @param {Decimal} magnitude
     */
    constructor(direction, magnitude) {
        this.direction = direction;
        this.magnitude = magnitude;
    }

    /**
     * @returns {boolean} 
     */
    isZero() {
        return this.magnitude.isZero();
    }

    /**
     * @param {Decimal} factor  
     * @returns {Vector} 
     */
    dividedBy(factor) {
        return new Vector(this.direction, this.magnitude.dividedBy(factor));
    }

    /**
     * @param {Vector} v 
     * @returns {Vector} result
     */
    add(v) {
        // http://hyperphysics.phy-astr.gsu.edu/hbase/vect.html#vec4
        if(v.isZero()) return this;
        if(this.isZero()) return v;
        const a = this.getComponents();
        const b = v.getComponents();
        // log('a.x = ', a.x, ', a.y = ', a.y);
        // log('b.x = ', b.x, ', b.y = ', b.y);
        
        const rx = a.x.plus(b.x);
        const ry = a.y.plus(b.y);
        log('Vector.add(): rx = ', rx.toNumber());
        log('Vector.add(): ry = ', ry.toNumber());
        const magnitude = rx.pow(2).plus(ry.pow(2)).sqrt();
        let direction;
        if(rx.isPositive() && ry.isPositive()) {
            direction = Decimal.atan(ry.abs().dividedBy(rx.abs()));
            direction = direction;
        } else if(rx.isNegative() && ry.isPositive()) {
            direction = Decimal.atan(rx.abs().dividedBy(ry.abs()));
            direction = direction.plus(PI.dividedBy(2));
        } else if(rx.isNegative() && ry.isNegative()) {
            //direction = Decimal.atan(rx.abs().dividedBy(ry.abs()));
            direction = Decimal.atan(ry.abs().dividedBy(rx.abs()));
            direction = direction.plus(PI);
        } else  {
            direction = Decimal.atan(rx.abs().dividedBy(ry.abs()));
            direction = direction.minus(PI.dividedBy(2));
        }
        /*
        const magnitude = rx.pow(2).plus(ry.pow(2)).sqrt();
        let direction;
        if(rx.isPositive() && ry.isPositive()) {
            direction = Decimal.asin(ry.abs().dividedBy(magnitude));
        } else if(rx.isNegative() && ry.isPositive()) {
            direction = Decimal.asin(ry.abs().dividedBy(magnitude)).plus(PI);
        } else if(rx.isNegative() && ry.isNegative()) {
            direction = Decimal.asin(ry.abs().dividedBy(magnitude)).plus(PI);//.plus(PI.dividedBy(2).times(3));
        } else  {
            direction = Decimal.asin(ry.abs().dividedBy(magnitude)).plus(PI);
        }*/
        direction = direction.plus(PI.times(2).mod(PI.times(2)));
        log('Vector.add(): magnitude = ', magnitude.toNumber());
        log('Vector.add(): direction = ', direction.toNumber());

        return new Vector(direction, magnitude);
    }

    /**
     * @returns {Point}
     */
    getComponents() {
        const x = this.magnitude.times(Decimal.cos(this.direction));
        const y = this.magnitude.times(Decimal.sin(this.direction));

        return new Point(x, y);
    }
}

let bodyCount = 0;

class Body {
    /**
     * @param {Decimal} mass
     * @param {Decimal} x
     * @param {Decimal} y
     * @param {Vector} trajectory
     * @param {Vector} nextTrajectory
     */
    constructor(mass, x, y, trajectory) {
        this.id = ++bodyCount;
        this.mass = mass;
        this.x = x;
        this.y = y;
        this.trajectory = trajectory;
        this.nextTrajectory = trajectory;
    }

    /**
     * @param {CanvasRenderingContext2D} ctx
     */
     draw(ctx) {
        ctx.save();
        const radius = Decimal.log10(this.mass.cubeRoot().times(1000));

        const scaledX = this.x.dividedBy(scaleFactor);
        const scaledY = this.y.dividedBy(scaleFactor);
        /*if(window.calcContext.log && this.id == 2) {
            console.log('draw(): x: ', this.x.toFixed(2));
            console.log('draw(): y: ', this.y.toFixed(2));
            console.log('draw(): scaledX: ', scaledX.toFixed(2));
            console.log('draw(): scaledY: ', scaledY.toFixed(2));
        }*/

        // draw circle
        if(this.id % 4 == 0) {
            ctx.fillStyle = "#aaa";
        } else if(this.id % 4 == 1) {
            ctx.fillStyle = "#a99";
        } else if(this.id % 4 == 2) {
            ctx.fillStyle = "#a77";
        } else if(this.id % 4 == 3) {
            ctx.fillStyle = "#a55";
        }
        ctx.beginPath();
        ctx.arc(scaledX, scaledY, radius, 0, 2 * Math.PI);
        ctx.fill();

        // draw trajectory
        ctx.strokeStyle = "#666";
        ctx.lineWidth = 2;
        ctx.beginPath();
        const radiusOffsetX = radius.times(this.trajectory.direction.cos());
        const radiusOffsetY = radius.times(this.trajectory.direction.sin());
        const baseX = scaledX.plus(radiusOffsetX).toNumber();
        const baseY = scaledY.plus(radiusOffsetY).toNumber();
        ctx.moveTo(baseX, baseY);
        const trajectoryComponents = this.trajectory.getComponents();
        const normalizeFactor = Decimal.log10(this.trajectory.magnitude);
        const xComponent = trajectoryComponents.x.dividedBy(normalizeFactor).toNumber();
        const yComponent = trajectoryComponents.y.dividedBy(normalizeFactor).toNumber();
        ctx.lineTo(baseX + xComponent, baseY + yComponent);
        ctx.stroke();
        ctx.restore();
    }

    /**
     * @param {Array<Body>} elements
     */
    calc(elements) {
        calcContext.id = this.id;

        for(const e of elements) {
            if(this.id != e.id) {
                const f = gravForce(this, e).dividedBy(this.mass);
                log('calc(): f.magnitude: ', f.magnitude.toNumber());
                log('calc(): f.direction: ', f.direction.toNumber());
                log('calc(): f.direction: ', f.direction.times(180).dividedBy(PI).toFixed(2), '°');
                this.nextTrajectory = this.trajectory.add(f);
            }
        }

        // apply current trajectory
        const trajectoryComponents = this.trajectory.getComponents();
        this.x = this.x.plus(trajectoryComponents.x);
        this.y = this.y.plus(trajectoryComponents.y);

        //console.log('calc(): this.id: ', this.id);
        //console.log('calc(): this.x: ', this.x.toNumber());
        //console.log('calc(): this.y: ', this.y.toNumber());
        log('calc(): trajectory.magnitude: ', this.trajectory.magnitude.toNumber());
        log('calc(): trajectory.direction: ', this.trajectory.direction.toNumber());
        log('calc(): trajectory.direction: ', this.trajectory.direction.times(180).dividedBy(PI).toFixed(2), '°');
    }

    /**
     * 
     */
    applyCalc() {
        this.trajectory = this.nextTrajectory;
    }
}