const imageContainer = document.querySelector('.preview');
const imageElement = document.getElementById('image');
const zoomInBtn = document.getElementById('zoom-in-btn');
const zoomOutBtn = document.getElementById('zoom-out-btn');

let scale = 1;
let initialScale = 1;
let translateX = 0;
let translateY = 0;
let isDragging = false;
let startX, startY;
let canvas, ctx;

function convertImageToCanvas(imageElement) {
    canvas = document.createElement("canvas");
    ctx = canvas.getContext("2d");
    canvas.width = imageElement.naturalWidth;
    canvas.height = imageElement.naturalHeight;
    ctx.drawImage(imageElement, 0, 0, canvas.width, canvas.height);
    return canvas;
}

function initializeCanvas(imageElement) {
    canvas = convertImageToCanvas(imageElement);
    imageContainer.innerHTML = ''; // Clear the image element
    imageContainer.appendChild(canvas);
    fitImageToContainer();
}

function setTransform() {
    canvas.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
}

function fitImageToContainer() {
    const containerAspect = imageContainer.clientWidth / imageContainer.clientHeight;
    const imageAspect = canvas.width / canvas.height;

    if (imageAspect > containerAspect) {
        initialScale = imageContainer.clientWidth / canvas.width;
    } else {
        initialScale = imageContainer.clientHeight / canvas.height;
    }

    // Prevent image from scaling beyond 100% of its original size
    const maxInitialScale = 1;
    initialScale = Math.min(initialScale, maxInitialScale);

    scale = initialScale;
    centerImage();
    limitBounds(); // Ensure the image stays within the container
}

function centerImage() {
    translateX = (imageContainer.clientWidth - canvas.width * scale) / 2;
    translateY = (imageContainer.clientHeight - canvas.height * scale) / 2;
    setTransform();
}

function zoom(delta) {
    const oldScale = scale;
    const maxScale = imageContainer.clientWidth / canvas.width;
    scale = Math.min(Math.max(initialScale, scale * delta), maxScale);
    
    if (scale !== oldScale) {
        // Calculate the center of the canvas
        const centerX = imageContainer.clientWidth / 2;
        const centerY = imageContainer.clientHeight / 2;

        // Adjust the translation values to keep the center position
        translateX = centerX - (centerX - translateX) * (scale / oldScale);
        translateY = centerY - (centerY - translateY) * (scale / oldScale);

        limitBounds(); // Ensure the image stays within the container after zooming
        setTransform();
    }
}

function limitBounds() {
    const imageWidth = canvas.width * scale;
    const imageHeight = canvas.height * scale;

    const minTranslateX = Math.min(0, imageContainer.clientWidth - imageWidth);
    const minTranslateY = Math.min(0, imageContainer.clientHeight - imageHeight);

    translateX = Math.max(minTranslateX, Math.min(0, translateX));
    translateY = Math.max(minTranslateY, Math.min(0, translateY));
}

imageContainer.addEventListener('wheel', (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    zoom(delta);
});

imageContainer.addEventListener('mousedown', (e) => {
    if (scale > initialScale) {
        isDragging = true;
        startX = e.clientX - translateX;
        startY = e.clientY - translateY;
        imageContainer.style.cursor = 'grabbing';
    }
});

imageContainer.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    translateX = e.clientX - startX;
    translateY = e.clientY - startY;
    limitBounds();
    setTransform();
});

imageContainer.addEventListener('mouseup', () => {
    isDragging = false;
    imageContainer.style.cursor = 'grab';
});

imageContainer.addEventListener('mouseleave', () => {
    isDragging = false;
    imageContainer.style.cursor = 'grab';
});

zoomInBtn.addEventListener('click', () => zoom(1.1));
zoomOutBtn.addEventListener('click', () => zoom(0.9));

imageElement.onload = () => initializeCanvas(imageElement);
window.addEventListener('resize', fitImageToContainer);
window.addEventListener('load', () => initializeCanvas(imageElement));