const uploadBtn = document.getElementById('imageUpload');
const submitBtn = document.querySelector('.submit-btn');
const descriptionInput = document.getElementById('description');
const imageContentContainer = document.getElementById('imageContentContainer');
const uploadedImagesSection = document.querySelector('.image__container');

// Function to show the image container
function showImageContainer() {
    uploadedImagesSection.classList.add('visible');
}

// Handle form submission
submitBtn.addEventListener('click', async () => {
    const file = uploadBtn.files[0];
    const description = descriptionInput.value.trim();

    // Validate file input
    if (!file) {
        alert('Please upload an image before submitting!');
        return;
    }
    if (!file.type.startsWith('image/')) {
        alert('Please upload a valid image file!');
        return;
    }

    // Validate description input
    if (!description) {
        alert('Please enter a description!');
        return;
    }

    // Prepare form data
    const formData = new FormData();
    formData.append('image', file);
    formData.append('description', description);

    try {
        // Show loading state
        submitBtn.textContent = 'Processing...';
        submitBtn.disabled = true;

        // Send image and description to the backend
        const response = await fetch('https://bd41-34-125-133-233.ngrok-free.app/process', {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const errorDetails = await response.json();
            throw new Error(errorDetails.error || 'Failed to process the image. Please try again later.');
        }

        // Get the blurred image from the backend
        const blob = await response.blob();
        const imageUrl = URL.createObjectURL(blob);

        // Show the uploaded images section
        showImageContainer();

        // Create a new image-description container
        const imageDescriptionDiv = document.createElement('div');
        imageDescriptionDiv.classList.add('image-description');

        const anchor = document.createElement('a');
        anchor.href = imageUrl; // Set the blurred image URL
        anchor.target = '_blank'; // Open in a new tab

        const img = document.createElement('img');
        img.src = imageUrl; // Blurred image preview
        img.alt = 'Blurred Image';

        const desc = document.createElement('p');
        desc.textContent = description;

        anchor.appendChild(img);
        imageDescriptionDiv.appendChild(anchor);
        imageDescriptionDiv.appendChild(desc);

        imageContentContainer.appendChild(imageDescriptionDiv);

        // Reset inputs
        uploadBtn.value = '';
        descriptionInput.value = '';
    } catch (error) {
        console.error('Error:', error);
        alert(`Error: ${error.message}`);
    } finally {
        // Reset button state
        submitBtn.textContent = 'Submit';
        submitBtn.disabled = false;
    }
});
