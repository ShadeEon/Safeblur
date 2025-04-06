const postBtn = document.querySelector('.post-btn'); // Post button
const loginBtn = document.querySelector('.login-btn'); // Login button
const uploadBtn = document.querySelector('.upload-btn'); // Upload button
const userInput = document.querySelector('.profile-description input'); // Input field for user thoughts
const userPostedContainer = document.querySelector('.user-posted__container'); // Container for posts
let uploadedFiles = []; // To store the uploaded files temporarily

function showNotification(message, type) {
    let notificationContainer = document.getElementById('notification-container');
    if (!notificationContainer) {
        notificationContainer = document.createElement('div');
        notificationContainer.id = 'notification-container';
        document.body.appendChild(notificationContainer);
    }

    const notification = document.createElement('div');
    notification.classList.add('notification', type);
    notification.textContent = message;
    notificationContainer.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 5000); // Remove the notification after 5 seconds
}

// Handle image upload (multiple files)
uploadBtn.addEventListener('click', (e) => {
    e.preventDefault(); // Prevent default button behavior

    // Create a file input element dynamically
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*'; // Accept only image files
    fileInput.multiple = true; // Allow multiple files to be selected

    // Listen for file selection
    fileInput.addEventListener('change', () => {
        const files = fileInput.files;

        // Validate files
        if (files.length === 0) {
            alert('No files selected!');
            return;
        }

        // Preview each file
        const imagePreviewContainer = document.getElementById('imagePreview');
        imagePreviewContainer.innerHTML = ''; // Clear existing previews

        // Loop over the selected files and generate previews
        for (const file of files) {
            if (!file.type.startsWith('image/')) {
                alert('Please upload a valid image file!');
                continue;
            }

            const reader = new FileReader();
            reader.onload = function (e) {
                const previewItem = document.createElement('div');
                previewItem.classList.add('preview-item'); // Use 'preview-item' class instead of 'img-preview'
                previewItem.innerHTML = `
                    <img src="${e.target.result}" alt="Preview Image">
                    <button class="remove-btn">X</button>
                `;

                // Add the remove functionality for each image preview
                const removeBtn = previewItem.querySelector('.remove-btn');
                removeBtn.addEventListener('click', () => {
                    previewItem.remove();
                    uploadedFiles = uploadedFiles.filter(f => f !== file); // Remove the file from the array
                });

                imagePreviewContainer.appendChild(previewItem);
            };
            reader.readAsDataURL(file);

            // Add the file to the uploaded files array (if needed for further processing)
            uploadedFiles.push(file);
        }
    });

    // Trigger the file input
    fileInput.click();
});

// Handle post button functionality (only posts the image and description)
postBtn.addEventListener('click', (e) => {
    e.preventDefault();

    const description = userInput.value.trim();

    if (uploadedFiles.length === 0) {
        alert('Please upload at least one image before posting!');
        return;
    }

    // Create and append post content for each uploaded image
    uploadedFiles.forEach(file => {
        const userPostContent = document.createElement('div');
        userPostContent.classList.add('user-posted__content');

        const reader = new FileReader();
        reader.onload = function (e) {
            userPostContent.innerHTML = `
                <div class="user">
                    <img src="fire.svg" alt="">
                    <a href="#">Jo</a>
                </div>
                <div class="posted-img">
                    <img src="${e.target.result}" alt="Uploaded Image">
                </div>
                <div class="profile-caption">
                    <div class="user">
                        <img src="fire.svg" alt="">
                        <a href="#">Jo</a>
                        <p>${description}</p>
                    </div>
                </div>
            `;

            userPostedContainer.appendChild(userPostContent);
        };
        reader.readAsDataURL(file);
    });

    // Clear the input and preview after posting
    userInput.value = '';
    uploadedFiles = [];
    const imagePreviewContainer = document.getElementById('imagePreview');
    imagePreviewContainer.innerHTML = ''; // Remove the previews

    showNotification('Post Updated', 'success');
});

loginBtn.addEventListener('click', async (e) => {
    e.preventDefault();

    const postedImages = document.querySelectorAll('.posted-img img'); // Get all images in .posted-img
    if (postedImages.length === 0) {
        alert('No images to process!');
        return;
    }

    loginBtn.classList.toggle('toggled');

    const textElement = loginBtn.querySelector('.text'); // Select the text element inside the button
    if (loginBtn.classList.contains('toggled')) {
        textElement.textContent = 'OFF';  // Change text to OFF when toggled
    } else {
        textElement.textContent = 'ON';  // Change text back to ON when not toggled
    }

    const loadingScreen = document.getElementById('loadingScreen');
    loadingScreen.classList.add('active'); // Show loading screen

    try {
        for (let img of postedImages) {
            // Fetch the image as a Blob
            const response = await fetch(img.src);
            if (!response.ok) {
                throw new Error(`Failed to fetch the image: ${img.src}`);
            }
            const blob = await response.blob();

            // Create FormData and append the image
            const formData = new FormData();
            formData.append('image', blob, 'uploaded-image.jpg'); // Provide a name for the file

            // Send the image to the backend for processing
            const uploadResponse = await fetch('https://0e7a-34-80-134-79.ngrok-free.app/process', {
                method: 'POST',
                body: formData,
            });

            if (!uploadResponse.ok) {
                const error = await uploadResponse.json();
                throw new Error(error.error || 'Failed to process the image.');
            }

            // Get the processed image as a Blob and update the image source
            const processedBlob = await uploadResponse.blob();
            const processedImageUrl = URL.createObjectURL(processedBlob);
            img.src = processedImageUrl;
        }

        showNotification('SafeBlur is ON', 'success');
    } catch (error) {
        console.error('Error:', error);
        alert(`Error: ${error.message}`);
    } finally {
        loadingScreen.classList.remove('active'); // Hide loading screen
    }
});