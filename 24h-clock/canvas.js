const canvas = document.querySelector('canvas');
const context = canvas.getContext('2d');
const { width, height } = canvas;

const duration = [24, 60, 60];
const colors = ['#ff0900', '#00f11d', '#0079ff'];

context.font = '36px monospace';
context.textAlign = 'center';
context.lineWidth = 8;
context.lineCap = 'round';
context.fillStyle = '#ffef00';

context.translate(width / 2, height / 2);

function animate() {
    context.clearRect(-width / 2, -height / 2, width, height);

    // Marks for minutes and seconds
    for (let i = 0; i < duration[1]; i++) {
        context.save();
        context.lineWidth = i % 5 === 0 ? 4 : 2;
        context.rotate((i / duration[1]) * 2 * Math.PI);

        context.beginPath();
        context.moveTo(0, -160);
        context.lineTo(0, -160 - (i % 5 === 0 ? 20 : 15));
        context.strokeStyle = '#ffffff';
        context.stroke();

        context.restore();
    }

    // Marks and numbers for hours
    for (let i = 0; i < duration[0]; i++) {
        const angle = (i / duration[0]) * 2 * Math.PI;

        context.save();
        context.fillStyle = '#ffffff';
        context.rotate(angle);

        context.beginPath();
        context.arc(0, -300, 3, 0, 2 * Math.PI);
        context.fill();

        context.save();
        context.translate(0, -335);
        context.rotate(-angle);

        context.textBaseline = 'middle';
        context.fillText(`${i}`.padStart(2, '0'), 0, 0);

        context.restore();
        context.restore();
    }

    const dt = new Date();

    const time = dt.toLocaleTimeString('en-GB').split(':');
    const day = dt.toLocaleString('en-GB', { weekday: 'long' });
    const date = dt.toLocaleDateString('en-GB');

    time.forEach((value, index) => {
        const radius = (9 - index) * width / 24;
        const angle = (+value / duration[index]) * 2 * Math.PI;

        context.beginPath();
        context.arc(0, 0, radius, 0, 2 * Math.PI);
        context.strokeStyle = '#0f0f0f';
        context.stroke();

        context.save();
        context.rotate(-Math.PI / 2);

        context.beginPath();
        context.arc(0, 0, radius, 0, angle);
        context.strokeStyle = colors[index];
        context.stroke();

        context.restore();
    });

    context.fillText(day.toUpperCase(), 0, -14);
    context.fillText(date.replace(/\//g, '-'), 0, 40);

    requestAnimationFrame(animate);
}

animate();
