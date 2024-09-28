const canvas = document.querySelector('canvas');
const context = canvas.getContext('2d');

const inputs = document.querySelectorAll('input');
const [mazeState, mazeWidth, mazeHeight, newMaze] = inputs;

const sections = document.querySelectorAll('section');
const [startState, gameState] = sections;

const params = {
    width: +mazeWidth.value,
    height: +mazeHeight.value
};

let maze = [[{ id: 0, weight: 0 }]];
let visited = [0];
let end = 0;

/**
 * @param {number[]} weights 
 * @param {boolean[]} visited 
 * @returns {number} 
 */
function getMinWeight(weights, visited) {
    let weight = Infinity;
    let index = -1;

    for (i = 0; i < weights.length; i++) {
        if (visited[i] === false && weights[i] < weight) {
            weight = weights[i];
            index = i;
        }
    }

    return index;
}

/**
 * 
 * @param {number} source 
 * @returns {number} 
 */
function longestPath(source) {
    const discovered = Array(maze.length).fill(false);
    const queue = [source];

    discovered[source] = true;
    let uIndex = 0;

    while (queue.length !== 0) {
        uIndex = queue.shift();

        for (let i = 0; i < maze[uIndex].length; i++) {
            if (maze[uIndex][i] === undefined) {
                continue;
            }

            let vIndex = maze[uIndex][i].id;

            if (discovered[vIndex] === false) {
                discovered[vIndex] = true;

                queue.push(vIndex);
            }
        }
    }

    return uIndex;
}

function generateMaze() {
    const { width, height } = params;

    maze = Array.from({ length: width * height }, _ => []);

    for (let i = 0; i < maze.length; i++) {
        const x = i % width;
        const y = Math.floor(i / width);

        if (x !== width - 1) {
            let weight = Math.floor(Math.random() * 1024);

            maze[i][1] = { id: i + 1, weight };
            maze[i + 1][3] = { id: i, weight };
        }

        if (y !== height - 1) {
            let weight = Math.floor(Math.random() * 1024);

            maze[i][2] = { id: i + width, weight };
            maze[i + width][0] = { id: i, weight };
        }
    }

    const weights = Array(maze.length).fill(Infinity);
    const parents = Array(maze.length).fill(-1);
    const explored = Array(maze.length).fill(false);

    weights[Math.floor(Math.random() * maze.length)] = 0

    for (let i = 0; i < maze.length; i++) {
        const uIndex = getMinWeight(weights, explored);

        for (let j = 0; j < maze[uIndex].length; j++) {
            if (maze[uIndex][j] === undefined) {
                continue;
            }

            const { id: vIndex, weight } = maze[uIndex][j];

            if (!explored[vIndex] && weight < weights[vIndex]) {
                parents[vIndex] = uIndex;
                weights[vIndex] = weight;
            }
        }

        explored[uIndex] = true;
    }

    maze = Array.from({ length: width * height }, _ => []);

    for (let i = 0; i < maze.length; i++) {
        if (parents[i] === -1) {
            continue;
        }

        switch (parents[i]) {
            case i + 1:
                maze[i][1] = { id: i + 1 };
                maze[i + 1][3] = { id: i };
                break;

            case i + width:
                maze[i][2] = { id: i + width };
                maze[i + width][0] = { id: i };
                break;

            case i - 1:
                maze[i][3] = { id: i - 1 };
                maze[i - 1][1] = { id: i };
                break;

            case i - width:
                maze[i][0] = { id: i - width };
                maze[i - width][2] = { id: i };
        }
    }

    visited = [longestPath(Math.floor(Math.random() * maze.length))];
    end = longestPath(visited[0]);

    updateCanvas();
}

function updateCanvas() {
    const { width, height } = params;

    const canvasRect = canvas.getBoundingClientRect();
    const availWidth = window.innerWidth - (canvasRect.x + 76);
    const availHeight = window.innerHeight - (canvasRect.y + 76);

    const scale = Math.min(Math.max(availWidth, 640) / width,
        Math.max(availHeight, 640) / height);

    canvas.width = width * scale;
    canvas.height = height * scale;

    let x = (end % width) * scale;
    let y = Math.floor(end / width) * scale;

    context.fillStyle = '#ff7f00';

    for (let i = 0; i < visited.length; i++) {
        context.fillRect(x, y, scale, scale);

        x = (visited[i] % width) * scale;
        y = Math.floor(visited[i] / width) * scale;

        context.fillStyle = '#80bcff';
    }

    context.fillStyle = '#0079ff';
    context.fillRect(x, y, scale, scale);

    context.lineWidth = 0.2 * scale;
    context.lineCap = 'round';

    for (let i = 0; i < maze.length; i++) {
        const _x = i % width;
        const _y = Math.floor(i / width);

        x = (_x + 1) * scale;
        y = (_y + 1) * scale;

        context.beginPath();

        if (_x !== width - 1 && maze[i][1] === undefined) {
            context.moveTo(x, y - scale);
            context.lineTo(x, y);
        }

        if (_y !== height - 1 && maze[i][2] === undefined) {
            context.moveTo(x, y);
            context.lineTo(x - scale, y);
        }

        context.stroke();
    }
}

generateMaze();

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

    generateMaze();
}

mazeWidth.addEventListener('change', handleChange);
mazeHeight.addEventListener('change', handleChange);

mazeState.addEventListener('click', function() {
    if (this.closest('section') === startState) {
        gameState.prepend(this.parentElement);
        this.value = 'Stop';

        visited = [visited[0]];
    }
    else {
        startState.prepend(this.parentElement);
        this.value = 'Explore';
    }

    updateCanvas();
});

newMaze.addEventListener('click', generateMaze);

window.addEventListener('resize', updateCanvas);

window.addEventListener('keydown', function(ev) {
    if (mazeState.closest('section') === gameState) {
        const direction = ['Up', 'Right', 'Down', 'Left']
            .indexOf(ev.key.replace('Arrow', ''));
        const position = visited[visited.length - 1];

        if (direction !== -1 &&
                maze[position][direction] !== undefined) {
            visited.push(maze[position][direction].id);
        }

        updateCanvas();

        if (visited[visited.length - 1] === end) {
            startState.prepend(mazeState.parentElement);
            mazeState.value = 'Explore';
        }
    }
});
