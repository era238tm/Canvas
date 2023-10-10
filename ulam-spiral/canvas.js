const canvas = document.querySelector('canvas');
const context = canvas.getContext('2d');

const inputs = document.querySelectorAll('input');
const [inputScale, inputSize, inputStart] = inputs;

inputSize.defaultValue = `${canvas.width / +inputScale.value}`;

const params = {
    scale: +inputScale.value,
    size: +inputSize.value,
    start: +inputStart.value
};

const colors = ['#000000', '#ffffff', '#ff0009'];

/**
 * @param {number} number 
 * @returns {number[]}
 */
function getCoordinate(number) {
    let layer = Math.ceil((Math.sqrt(number) - 1) / 2);
    let sideLength = 2 * layer + 1;
    let maxValue = sideLength * sideLength;

    sideLength -= 1;

    if (number >= maxValue - sideLength) {
        return [layer - (maxValue - number), -layer];
    }

    maxValue -= sideLength;
    if (number >= maxValue - sideLength) {
        return [-layer, -layer + (maxValue - number)];
    }

    maxValue -= sideLength;
    if (number >= maxValue - sideLength) {
        return [-layer + (maxValue - number), layer];
    }

    maxValue -= sideLength;
    return [layer, layer - (maxValue - number)];
}

/**
 * @param {number} number 
 * @returns {boolean}
 */
function isPrime(number) {
    if (number <= 1) {
        return false;
    }

    if (number <= 3) {
        return true;
    }

    if (number % 2 === 0 || number % 3 === 0) {
        return false;
    }

    for (let i = 5; i * i <= number; i += 6) {
        if (number % i === 0 || number % (i + 2) === 0) {
            return false;
        }
    }

    return true;
}

function updateCanvas() {
    const { scale, size, start } = params;
    canvas.width = canvas.height = scale * size;

    context.resetTransform();
    context.clearRect(0, 0, canvas.width, canvas.height);

    if (size % 2 === 0) {
        context.translate(-scale / 2, scale / 2);
    }

    for (let i = 0; i < size * size; i++) {
        let [x, y] = getCoordinate(i + 1);
        x = canvas.width / 2 + x * scale;
        y = canvas.height / 2 - y * scale;

        context.beginPath();
        context.arc(x, y, scale / 3, 0, 2 * Math.PI);
        context.fillStyle = colors[i ? +isPrime(i + start) : 2];
        context.fill();
    }
}

updateCanvas();

/**
 * @param {Event} ev 
 */
function handleChange(ev) {
    if (!(ev.target instanceof HTMLInputElement)) {
        return;
    }

    if (ev.target.validity.rangeUnderflow) {
        ev.target.value = ev.target.min;
    }

    if (ev.target.validity.stepMismatch) {
        const { value, min } = ev.target;
        const step = ev.target.step || '1';

        let interval = +value - +min;
        interval = Math.floor(interval / +step) * +step;

        ev.target.value = `${+min + interval}`;
    }

    params[ev.target.id] = +ev.target.value;

    updateCanvas();
}

inputs.forEach((input) => {
    input.addEventListener('change', handleChange);
});
