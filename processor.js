const testImageURL = "https://i.kym-cdn.com/entries/icons/original/000/026/638/cat.jpg";

const clearOutputField = () => document.getElementById('ImageContainer').innerHTML = '';

const fillFileName = () => {
    document.getElementById('fileName').innerText = document.getElementById('imagefile').files[0].name;
}

const clearRatioField = () => {
    document.getElementById('ratioWidth').value = '';
    document.getElementById('ratioHeight').value = '';
}

const showInputPrompt = () => {
    let imageUrl = prompt("Image URL:", testImageURL);
    document.getElementById('imageUrl').value = imageUrl;
}

const showInputField = (event) => {
    const inputField = document.getElementById('input-field');
    inputField.style.visibility = 'visible';
    if (event.target.value === 'upload') {
        document.getElementById('imagefile').click();
    } else if (event.target.value === 'url') {
        showInputPrompt();
    }
    document.getElementById('processBtn').style.visibility = 'visible';
    clearOutputField(); // Initialize containers
}

const urlToImage = (url, callback) => {
    clearOutputField();
    const loader = document.getElementsByClassName('loader')[0];
    loader.style.display = 'block';
    fetch(`https://api.allorigins.win/raw?url=${url}`)
        .then(response => response.blob())
        .then(blob => {
            loader.style.display = 'none';
            const reader = new FileReader();
            reader.onloadend = () => {
                const image = new Image();
                image.onload = () => callback(image);
                image.src = reader.result;
            };
            reader.readAsDataURL(blob);
        })
        .catch(error => {
            console.error('Error fetching image:', error);
            alert('Error loading image from URL. Please check the URL and try again.');
        });
}

const fileToImage = (file, callback) => {
    const reader = new FileReader();

    reader.onloadend = () => {
        const image = new Image();
        image.onload = () => {
            callback(image);
        };
        image.src = reader.result;
    };

    reader.readAsDataURL(file);
}

const padImage = (image, ratio, backgroundColor) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    const width = image.width;
    const height = image.height;
    const woverh = ratio[0] / ratio[1];
    const hoverw = ratio[1] / ratio[0];

    let marginLeft = 0;
    let marginTop = 0;
    let newWidth = height * woverh;
    let newHeight = height;
    if (newWidth < width) {
        newHeight = width * hoverw;
        newWidth = width;
        marginTop = Math.floor((newHeight - height) / 2);
    } else {
        marginLeft = Math.floor((newWidth - width) / 2);
    }

    canvas.width = newWidth;
    canvas.height = newHeight;

    ctx.fillStyle = backgroundColor || 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, marginLeft, marginTop);

    return canvas.toDataURL('image/jpeg');
}

const radioGroupName = 'imageSubmitType';
const processImage = () => {
    const wr = document.getElementById('ratioWidth').value;
    const hr = document.getElementById('ratioHeight').value;
    const imageRatio = [];
    // Default to 1 if not provided
    imageRatio.push(wr ? Number(wr) : 1);
    imageRatio.push(hr ? Number(hr) : 1);
    const checkedRadio = document.querySelector(`input[name=${radioGroupName}]:checked`); // Get checked radio element
    let srcImage = null;
    let converter = null;
    if (checkedRadio.value === 'upload') {
        srcImage = document.getElementById('imagefile').files[0];
        converter = fileToImage;
        if (!srcImage) {
            srcImage = testImageURL;
            converter = urlToImage;
        }
    } else if (checkedRadio.value === 'url') {
        srcImage = document.getElementById('imageUrl').value;
        converter = urlToImage;
    }
    if (srcImage && imageRatio.length === 2 && imageRatio.every(val => val >= 0)) {
        converter(srcImage, (originalImage) => {
            const ImageContainer = document.getElementById('ImageContainer');
            ImageContainer.innerHTML = ''; // Initialize container

            const paddingColor = document.getElementById('bgColor').value;
            const processedDataURL = padImage(originalImage, imageRatio, paddingColor);
            const processedImage = new Image();
            processedImage.src = processedDataURL;
            const downloadImage = document.createElement('a');  // Apply download link to processed image
            downloadImage.href = processedDataURL;
            downloadImage.download = 'processed_image.jpg';
            downloadImage.appendChild(processedImage);
            ImageContainer.appendChild(downloadImage);
        });
    } else {
        clearOutputField();
        clearRatioField();
        alert('Please enter a valid Image URL and non-negative Ratio.');
    }
}

for (const radioInput of document.getElementsByClassName('radio-input')) {
    radioInput.addEventListener("click", showInputField)
}

document.getElementById('imagefile').addEventListener("change", fillFileName)
document.getElementsByClassName('processBtn')[0].addEventListener("click", processImage)