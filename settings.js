const drawUpdateInterval = 1000 / 120;
const calcUpdateInterval = 1000 / 60;
const performUpdatesOnCommand = false;
let updateRequested = true;

const scaleFactor = 1_000_000_00;

window.calcContext = {
    id: -1,
    log: true,
};

let logCounter = 0;

window.logFilter = () => {
    if(calcContext.log && window.calcContext.id == 2/* && (logCounter++ % 10 == 0)*/) {
        return true;
    }
    return false;
};