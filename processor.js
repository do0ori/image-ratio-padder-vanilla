const testImageURL = "https://i.kym-cdn.com/entries/icons/original/000/026/638/cat.jpg";
let userImage = null;
let loadedImage = null;

const clearOutputField = () => document.getElementById('ImageContainer').innerHTML = '';

const clearRatioField = () => {
    document.getElementById('ratioWidth').value = '';
    document.getElementById('ratioHeight').value = '';
}

const clearBtnAttributes = () => {
    const downloadBtn = document.querySelector('#downlodBtn > a');
    downloadBtn.removeAttribute('href')
    downloadBtn.removeAttribute('download')
}

const setBtnAttributes = (href, fileName) => {
    const downloadBtn = document.querySelector('#downlodBtn > a');
    downloadBtn.href = href;
    downloadBtn.download = fileName;
}

const showOriginalImage = (originalImage) => {
    const ImageContainer = document.getElementById('ImageContainer');
    ImageContainer.innerHTML = ''; // Initialize container
    ImageContainer.appendChild(originalImage);
    loadedImage = originalImage;
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

function getCurrentDateTimeFormatted() {
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0'); // 월은 0부터 시작하므로 +1을 해줌
    const day = now.getDate().toString().padStart(2, '0');
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');

    const formattedDateTime = `${year}${month}${day}_${hours}${minutes}${seconds}`;
    return formattedDateTime;
}

const radioGroupName = 'imageSubmitType';
const processImage = () => {
    // Get ratio
    const wr = document.getElementById('ratioWidth').value;
    const hr = document.getElementById('ratioHeight').value;
    const imageRatio = [];
    // Default to 1 if not provided
    imageRatio.push(wr ? Number(wr) : 1);
    imageRatio.push(hr ? Number(hr) : 1);
    if (userImage && imageRatio.length === 2 && imageRatio.every(val => val >= 0)) {
        const ImageContainer = document.getElementById('ImageContainer');
        const paddingColor = document.getElementById('bgColor').value;
        const processedDataURL = padImage(loadedImage, imageRatio, paddingColor);
        const processedImage = new Image();
        processedImage.src = processedDataURL;
        ImageContainer.innerHTML = ''; // Initialize container
        ImageContainer.appendChild(processedImage);
        setBtnAttributes(processedDataURL, `processed_image_${getCurrentDateTimeFormatted()}.jpg`);
    } else {
        clearOutputField();
        clearRatioField();
        alert('Please enter a valid Image URL and non-negative Ratio.');
    }
}

const showInputField = (event) => {
    document.getElementById('input-field').style.visibility = 'visible';
    if (event.target.value === 'upload') {
        document.getElementById('imagefile').click();
    } else if (event.target.value === 'url') {
        // Get image url from user, convert url to image and show it.
        let imageURL = prompt("Image URL:", testImageURL);
        if (imageURL) {
            userImage = imageURL;
            urlToImage(userImage, showOriginalImage)
        };
    }
    clearRatioField();
    clearBtnAttributes();
}

for (const radioInput of document.getElementsByClassName('radio-input')) {
    radioInput.addEventListener("click", showInputField);
}

document.getElementById('imagefile').addEventListener("change", () => {
    const imageFile = document.getElementById('imagefile').files[0];
    if (imageFile) {
        userImage = imageFile.name;
        fileToImage(imageFile, showOriginalImage);
    }
});

// Immdiately display processed image whenever input value changes.
document.getElementById('ratio').addEventListener("change", processImage)
document.getElementById('colorPicker').addEventListener("change", processImage)
