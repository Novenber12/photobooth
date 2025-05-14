// DOM Elements
const tabs = document.querySelectorAll('.tab');
const sections = document.querySelectorAll('.section');
const themeToggle = document.getElementById('theme-toggle');
const video = document.getElementById('video');
const captureBtn = document.getElementById('capture-btn');
const toggleCameraBtn = document.getElementById('toggle-camera-btn');
const toggleFlashBtn = document.getElementById('toggle-flash-btn');
const effectsBtn = document.getElementById('effects-btn');
const countdown = document.getElementById('countdown');
const flash = document.getElementById('flash');
const errorMessage = document.getElementById('error-message');
const photoSlots = document.querySelectorAll('.photo-slot');
const retakePhotosBtn = document.getElementById('retake-photos-btn');
const continueToEditorBtn = document.getElementById('continue-to-editor-btn');
const uploadSlots = document.querySelectorAll('.upload-slot');
const uploadInputs = document.querySelectorAll('.upload-slot input');
const clearUploadsBtn = document.getElementById('clear-uploads-btn');
const submitUploadsBtn = document.getElementById('submit-uploads-btn');
const photostrip = document.getElementById('photostrip');
const photostripContainer = document.querySelector('.photostrip-container');
const photostripImages = document.querySelectorAll('#photostrip img');
const stickerButtons = document.querySelectorAll('.sticker-btn');
const frameButtons = document.querySelectorAll('.frame-btn');
const bgButtons = document.querySelectorAll('.bg-btn');
const filterButtons = document.querySelectorAll('.filter-btn');
const enableDateToggle = document.getElementById('enable-date');
const dateStamp = document.getElementById('date-stamp');
const enableAnimationToggle = document.getElementById('enable-animation');
const customTextInput = document.getElementById('custom-text');
const textColorInput = document.getElementById('text-color');
const addTextBtn = document.getElementById('add-text-btn');
const previewBtn = document.getElementById('preview-btn');
const saveToGalleryBtn = document.getElementById('save-to-gallery-btn');
const downloadBtn = document.getElementById('download-btn');
const shareBtn = document.getElementById('share-btn');
const collageGrid = document.getElementById('collage-grid');
const collageItems = document.querySelectorAll('.collage-item');
const collageLayoutButtons = document.querySelectorAll('.collage-layout-btn');
const clearCollageBtn = document.getElementById('clear-collage-btn');
const downloadCollageBtn = document.getElementById('download-collage-btn');
const gallery = document.getElementById('gallery');
const emptyGalleryMessage = document.getElementById('empty-gallery-message');
const createNewBtn = document.getElementById('create-new-btn');
const previewModal = document.getElementById('preview-modal');
const closePreviewModal = document.getElementById('close-preview-modal');
const closePreviewBtn = document.getElementById('close-preview-btn');
const previewPhotos = [
  document.getElementById('preview-photo-1'),
  document.getElementById('preview-photo-2'),
  document.getElementById('preview-photo-3'),
  document.getElementById('preview-photo-4')
];
const shareModal = document.getElementById('share-modal');
const closeShareModal = document.getElementById('close-share-modal');
const copyLinkBtn = document.getElementById('copy-link-btn');
const loadingContainer = document.getElementById('loading-container');

// State variables
let stream = null;
let currentFacingMode = 'user';
let flashEnabled = false;
let capturedImages = [];
let uploadedImages = [];
let currentFilter = 'none';
let stickers = [];
let currentFrame = 'none';
let textElements = [];
let collageImages = [];
let currentCollageLayout = '2x2';
let savedPhotostrips = [];
let nextStickerPositionIndex = 0;
let isDarkMode = false;
let selectedImageIndex = -1; // Track which image is currently selected

// Sticker positions around the photostrip
const stickerPositions = [
  { left: -30, top: 10 },    // Top-left
  { left: 230, top: 10 },    // Top-right
  { left: -30, top: 250 },   // Middle-left
  { left: 230, top: 250 },   // Middle-right
  { left: -30, top: 500 },   // Bottom-left
  { left: 230, top: 500 },   // Bottom-right
  { left: -30, top: 750 },   // Photo 3 left
  { left: 230, top: 750 },   // Photo 3 right
  { left: -30, top: 1000 },  // Photo 4 left
  { left: 230, top: 1000 }   // Photo 4 right
];

// Initialize the app
async function init() {
  try {
    // Request camera permission immediately with more permissive options
    const constraints = {
      video: {
        facingMode: currentFacingMode,
        width: { ideal: 1280 },
        height: { ideal: 720 }
      },
      audio: false
    };
    
    // Add additional options for permissions policy
    const mediaOptions = {
      video: true,
      audio: false
    };
    
    stream = await navigator.mediaDevices.getUserMedia(constraints);
    video.srcObject = stream;
    errorMessage.style.display = 'none';
    
    // Initialize all features
    setupTabNavigation();
    setupPhotoCapture();
    setupUploadSection();
    setupEditorControls();
    setupCollageSection();
    setupGallerySection();
    setupModals();
    setupThemeToggle();
    
    // Set current date in the photostrip
    const today = new Date();
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    dateStamp.textContent = today.toLocaleDateString('en-US', options);
  } catch (error) {
    console.error('Error accessing camera:', error);
    errorMessage.style.display = 'block';
    
    // Show specific error messages
    if (error.name === 'NotAllowedError') {
      errorMessage.textContent = 'Camera access was denied. Please enable camera access in your browser settings to use this feature.';
    } else if (error.name === 'NotFoundError') {
      errorMessage.textContent = 'No camera device found. Please connect a camera and try again.';
    } else if (error.name === 'NotReadableError') {
      errorMessage.textContent = 'Camera is in use by another application. Please close other applications that might be using the camera.';
    } else if (error.name === 'OverconstrainedError') {
      // Try again with less constraints
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        video.srcObject = stream;
        errorMessage.style.display = 'none';
      } catch (fallbackError) {
        errorMessage.textContent = 'Camera access failed. Your device may not support the camera requirements.';
      }
    } else {
      errorMessage.textContent = 'Unable to access camera. Please allow camera permissions in your browser settings.';
    }
  }
}

// Tab navigation
function setupTabNavigation() {
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const tabId = tab.getAttribute('data-tab');
      
      // Update active tab
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      
      // Show corresponding section
      sections.forEach(section => {
        section.classList.remove('active');
        if (section.id === `${tabId}-section`) {
          section.classList.add('active');
        }
      });
    });
  });
}

// Camera setup
async function setupCamera() {
  try {
    // Try with standard constraints first
    const constraints = {
      video: { 
        facingMode: currentFacingMode,
        width: { ideal: 1280 },
        height: { ideal: 720 }
      },
      audio: false
    };
    
    stream = await navigator.mediaDevices.getUserMedia(constraints);
    video.srcObject = stream;
    errorMessage.style.display = 'none';
  } catch (error) {
    console.error('Error accessing camera:', error);
    errorMessage.style.display = 'block';
    
    // Handle different types of errors
    if (error.name === 'NotAllowedError') {
      errorMessage.innerHTML = 'Camera access was denied. Please allow camera access in your browser settings to use this feature.<br><br>' +
        'If you\'re accessing this from a shared link (like IP address 192.168.x.x), make sure to click "Allow" when prompted.';
    } else if (error.name === 'NotFoundError') {
      errorMessage.textContent = 'No camera device found. Please connect a camera and try again.';
    } else if (error.name === 'NotReadableError') {
      errorMessage.textContent = 'Camera is in use by another application. Please close other applications that might be using the camera.';
    } else if (error.name === 'OverconstrainedError') {
      // Try with minimal constraints
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        video.srcObject = stream;
        errorMessage.style.display = 'none';
      } catch (fallbackError) {
        errorMessage.textContent = 'Camera access failed. Your device may not support the camera requirements.';
      }
    } else {
      errorMessage.innerHTML = 'Unable to access camera. Please allow camera permissions in your browser settings.<br><br>' +
        'Note: If you\'re using Chrome and accessing via a LAN IP address, you may need to enable "Insecure origins treated as secure" in chrome://flags and add your IP address.';
    }
  }
}

// Switch camera (front/back)
async function switchCamera() {
  if (stream) {
    // Stop all tracks
    stream.getTracks().forEach(track => track.stop());
    
    // Toggle facing mode
    currentFacingMode = currentFacingMode === 'user' ? 'environment' : 'user';
    
    // Restart camera with new facing mode
    await setupCamera();
  }
}

// Photo capture setup
function setupPhotoCapture() {
  // Capture button click
  captureBtn.addEventListener('click', startCountdown);
  
  // Auto capture button
  const autoCaptureBtn = document.getElementById('auto-capture-btn');
  autoCaptureBtn.addEventListener('click', startAutoCapture);
  
  // Toggle camera button
  toggleCameraBtn.addEventListener('click', switchCamera);
  
  // Toggle flash button
  toggleFlashBtn.addEventListener('click', () => {
    flashEnabled = !flashEnabled;
    toggleFlashBtn.classList.toggle('active');
  });
  
  // Retake photos button
  retakePhotosBtn.addEventListener('click', () => {
    capturedImages = [];
    photoSlots.forEach(slot => {
      slot.innerHTML = '<div class="placeholder">' + (Array.from(photoSlots).indexOf(slot) + 1) + '</div>';
    });
    retakePhotosBtn.disabled = true;
    continueToEditorBtn.disabled = true;
  });
  
  // Continue to editor button
  continueToEditorBtn.addEventListener('click', () => {
    // Switch to editor tab
    const editorTab = document.querySelector('.tab[data-tab="editor"]');
    editorTab.click();
    
    // Update photostrip with captured images
    updatePhotostrip();
  });
}

// Start countdown and capture photo
function startCountdown() {
  let timeLeft = 3;
  captureBtn.disabled = true;
  
  countdown.style.display = 'flex';
  countdown.textContent = timeLeft;
  
  const countdownInterval = setInterval(() => {
    timeLeft--;
    
    if (timeLeft > 0) {
      countdown.textContent = timeLeft;
    } else {
      clearInterval(countdownInterval);
      countdown.style.display = 'none';
      capturePhoto();
      captureBtn.disabled = false;
    }
  }, 1000);
}

// Capture photo
function capturePhoto() {
  // Create canvas to capture the current video frame
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  
  // Flash effect if enabled
  if (flashEnabled) {
    flash.style.opacity = '1';
    setTimeout(() => {
      flash.style.opacity = '0';
    }, 150);
  }
  
  // Draw video frame to canvas
  context.drawImage(video, 0, 0, canvas.width, canvas.height);
  
  // Get image data URL
  const dataURL = canvas.toDataURL('image/png');
  
  // Find the first empty slot
  const emptySlotIndex = capturedImages.length;
  if (emptySlotIndex < photoSlots.length) {
    // Create image element
    const img = document.createElement('img');
    img.src = dataURL;
    
    // Clear placeholder and add image to slot
    photoSlots[emptySlotIndex].innerHTML = '';
    photoSlots[emptySlotIndex].appendChild(img);
    
    // Add to captured images array
    capturedImages.push(dataURL);
    
    // Enable buttons if we have at least one photo
    retakePhotosBtn.disabled = false;
    continueToEditorBtn.disabled = false;
  }
}

// Start auto capture sequence to take 4 photos automatically
function startAutoCapture() {
  // Disable all camera buttons during auto capture
  const captureBtn = document.getElementById('capture-btn');
  const autoCaptureBtn = document.getElementById('auto-capture-btn');
  const toggleCameraBtn = document.getElementById('toggle-camera-btn');
  const toggleFlashBtn = document.getElementById('toggle-flash-btn');
  const effectsBtn = document.getElementById('effects-btn');
  
  captureBtn.disabled = true;
  autoCaptureBtn.disabled = true;
  toggleCameraBtn.disabled = true;
  toggleFlashBtn.disabled = true;
  effectsBtn.disabled = true;
  
  // Clear any existing images
  capturedImages = [];
  photoSlots.forEach(slot => {
    slot.innerHTML = '<div class="placeholder">' + (Array.from(photoSlots).indexOf(slot) + 1) + '</div>';
  });
  
  // Show a message to inform the user
  const messageEl = document.createElement('div');
  messageEl.className = 'auto-capture-message';
  messageEl.innerHTML = 'Auto Capture Mode<br>Get ready for 4 photos!';
  messageEl.style.position = 'absolute';
  messageEl.style.top = '50%';
  messageEl.style.left = '50%';
  messageEl.style.transform = 'translate(-50%, -50%)';
  messageEl.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
  messageEl.style.color = 'white';
  messageEl.style.padding = '20px';
  messageEl.style.borderRadius = '10px';
  messageEl.style.fontSize = '1.5rem';
  messageEl.style.textAlign = 'center';
  messageEl.style.zIndex = '10';
  
  const videoContainer = document.querySelector('.video-container');
  videoContainer.appendChild(messageEl);
  
  // Wait 2 seconds before starting the sequence
  setTimeout(() => {
    videoContainer.removeChild(messageEl);
    captureSequence(0);
  }, 2000);
  
  // Function to capture a sequence of photos
  function captureSequence(photoIndex) {
    if (photoIndex >= 4) {
      // All 4 photos taken, enable buttons and continue
      captureBtn.disabled = false;
      autoCaptureBtn.disabled = false;
      toggleCameraBtn.disabled = false;
      toggleFlashBtn.disabled = false;
      effectsBtn.disabled = false;
      
      // Enable retake and continue buttons
      retakePhotosBtn.disabled = false;
      continueToEditorBtn.disabled = false;
      
      return;
    }
    
    // Show photo number
    const photoNumberEl = document.createElement('div');
    photoNumberEl.className = 'photo-number';
    photoNumberEl.textContent = `Photo ${photoIndex + 1} of 4`;
    photoNumberEl.style.position = 'absolute';
    photoNumberEl.style.top = '10px';
    photoNumberEl.style.left = '10px';
    photoNumberEl.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    photoNumberEl.style.color = 'white';
    photoNumberEl.style.padding = '5px 10px';
    photoNumberEl.style.borderRadius = '5px';
    photoNumberEl.style.fontSize = '1rem';
    photoNumberEl.style.zIndex = '10';
    
    videoContainer.appendChild(photoNumberEl);
    
    // Start countdown for this photo
    let timeLeft = 3;
    countdown.style.display = 'flex';
    countdown.textContent = timeLeft;
    
    const countdownInterval = setInterval(() => {
      timeLeft--;
      
      if (timeLeft > 0) {
        countdown.textContent = timeLeft;
      } else {
        clearInterval(countdownInterval);
        countdown.style.display = 'none';
        
        // Capture the photo
        capturePhotoForSequence(photoIndex);
        
        // Remove photo number display
        videoContainer.removeChild(photoNumberEl);
        
        // Wait before taking the next photo
        setTimeout(() => {
          captureSequence(photoIndex + 1);
        }, 1500);
      }
    }, 1000);
  }
  
  // Capture photo for the sequence
  function capturePhotoForSequence(index) {
    // Create canvas to capture the current video frame
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Flash effect if enabled
    if (flashEnabled) {
      flash.style.opacity = '1';
      setTimeout(() => {
        flash.style.opacity = '0';
      }, 150);
    }
    
    // Draw video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Get image data URL
    const dataURL = canvas.toDataURL('image/png');
    
    // Create image element
    const img = document.createElement('img');
    img.src = dataURL;
    
    // Clear placeholder and add image to slot
    photoSlots[index].innerHTML = '';
    photoSlots[index].appendChild(img);
    
    // Add to captured images array
    capturedImages[index] = dataURL;
  }
}

// Upload section setup
function setupUploadSection() {
  // Setup upload slots
  uploadSlots.forEach((slot, index) => {
    slot.addEventListener('click', () => {
      uploadInputs[index].click();
    });
    
    uploadInputs[index].addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          // Create image element
          const img = document.createElement('img');
          img.src = e.target.result;
          
          // Clear placeholder and add image to slot
          slot.innerHTML = '';
          slot.appendChild(img);
          
          // Add to uploaded images array
          uploadedImages[index] = e.target.result;
          
          // Enable submit button if we have at least one image
          submitUploadsBtn.disabled = uploadedImages.filter(Boolean).length === 0;
        };
        reader.readAsDataURL(file);
      }
    });
  });
  
  // Clear uploads button
  clearUploadsBtn.addEventListener('click', () => {
    uploadedImages = [];
    uploadSlots.forEach(slot => {
      slot.innerHTML = '<div class="upload-icon">+</div>';
    });
    uploadInputs.forEach(input => {
      input.value = '';
    });
    submitUploadsBtn.disabled = true;
  });
  
  // Submit uploads button
  submitUploadsBtn.addEventListener('click', () => {
    // Filter out empty slots
    const filteredImages = uploadedImages.filter(Boolean);
    
    // Use uploaded images for the photostrip
    capturedImages = filteredImages;
    
    // Switch to editor tab
    const editorTab = document.querySelector('.tab[data-tab="editor"]');
    editorTab.click();
    
    // Update photostrip with uploaded images
    updatePhotostrip();
  });
}

// Update photostrip with current images and filter
function updatePhotostrip() {
  photostripImages.forEach((img, index) => {
    if (index < capturedImages.length) {
      img.src = capturedImages[index];
    } else {
      // If we have fewer images than slots, duplicate the last image
      img.src = capturedImages[capturedImages.length - 1] || '/placeholder.svg?height=250&width=250';
    }
    
    // Apply current filter
    img.style.filter = currentFilter;
    
    // Apply current frame
    applyFrame(index);
  });
}

// Apply frame to photostrip images
function applyFrame(index) {
  const container = photostripImages[index].parentElement;
  
  // Reset styles
  container.style.padding = '0';
  container.style.backgroundColor = 'transparent';
  photostripImages[index].style.border = 'none';
  
  // Apply selected frame
  switch (currentFrame) {
    case 'classic':
      photostripImages[index].style.border = '5px solid var(--primary)';
      break;
    case 'polaroid':
      container.style.padding = '10px';
      container.style.paddingBottom = '30px';
      container.style.backgroundColor = 'white';
      break;
    case 'vintage':
      photostripImages[index].style.border = '5px solid #d4a373';
      break;
    case 'modern':
      photostripImages[index].style.border = '2px solid black';
      break;
    default:
      // No frame
      break;
  }
}

// Editor controls setup
function setupEditorControls() {
  // Setup image selection
  const photoContainers = document.querySelectorAll('.photostrip-img-container');
  const selectedImageInfo = document.getElementById('selected-image-info');
  
  photoContainers.forEach(container => {
    container.addEventListener('click', () => {
      // Get the index of the selected image
      const index = parseInt(container.getAttribute('data-index'));
      
      // Update selection state
      selectedImageIndex = index;
      
      // Update UI to show which image is selected
      photoContainers.forEach(c => c.classList.remove('selected'));
      container.classList.add('selected');
      
      // Update selection text
      selectedImageInfo.textContent = `Editing Photo ${index + 1}`;
      
      // Update controls to reflect current image's settings
      updateControlsForSelectedImage();
    });
  });
  
  // Sticker buttons
  stickerButtons.forEach(button => {
    button.addEventListener('click', () => {
      const sticker = button.textContent;
      
      // Create sticker element
      const stickerEl = document.createElement('span');
      stickerEl.className = 'sticker';
      stickerEl.textContent = sticker;
      
      // Get position based on which image is selected
      let position;
      if (selectedImageIndex === -1) {
        // If no image selected, place sticker at random position
        position = stickerPositions[nextStickerPositionIndex % stickerPositions.length];
        nextStickerPositionIndex++;
      } else {
        // Calculate position based on selected image
        const selectedContainer = document.querySelector(`.photostrip-img-container[data-index="${selectedImageIndex}"]`);
        const containerRect = selectedContainer.getBoundingClientRect();
        const photostripRect = photostrip.getBoundingClientRect();
        
        // Calculate position relative to the photostrip
        position = {
          left: Math.random() * 150 + 50, // Random position between 50-200px from left
          top: (containerRect.top - photostripRect.top) + Math.random() * (containerRect.height - 50) + 25
        };
      }
      
      // Set initial position
      stickerEl.style.left = position.left + 'px';
      stickerEl.style.top = position.top + 'px';
      
      // Make sticker draggable
      makeDraggable(stickerEl, selectedImageIndex);
      
      // Add to photostrip container with image index data attribute
      photostripContainer.appendChild(stickerEl);
      stickerEl.dataset.imageIndex = selectedImageIndex;
      stickers.push({
        element: stickerEl,
        imageIndex: selectedImageIndex
      });
    });
  });
  
  // Frame buttons
  frameButtons.forEach(button => {
    button.addEventListener('click', () => {
      // Update active button
      frameButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
      
      // Set current frame
      currentFrame = button.getAttribute('data-frame');
      
      if (selectedImageIndex === -1) {
        // Apply to all images
        photostripImages.forEach((img, index) => {
          applyFrame(index);
        });
      } else {
        // Apply only to selected image
        applyFrame(selectedImageIndex);
      }
    });
  });
  
  // Filter buttons
  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      // Update active button
      filterButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
      
      // Set current filter
      currentFilter = button.getAttribute('data-filter');
      
      if (selectedImageIndex === -1) {
        // Apply to all images
        photostripImages.forEach(img => {
          img.style.filter = currentFilter;
        });
      } else {
        // Apply only to selected image
        photostripImages[selectedImageIndex].style.filter = currentFilter;
      }
    });
  });
  
  // Add text button
  addTextBtn.addEventListener('click', () => {
    const text = customTextInput.value.trim();
    if (text) {
      if (selectedImageIndex === -1) {
        // Add text to photostrip (old behavior)
        const textEl = document.createElement('div');
        textEl.className = 'sticker';
        textEl.textContent = text;
        textEl.style.left = '100px';
        textEl.style.top = '100px';
        textEl.style.color = textColorInput.value;
        textEl.style.fontSize = '18px';
        textEl.style.fontWeight = 'bold';
        textEl.style.textShadow = '1px 1px 2px rgba(0,0,0,0.3)';
        
        // Make text draggable
        makeDraggable(textEl);
        
        // Add to photostrip container
        photostripContainer.appendChild(textEl);
        textElements.push(textEl);
      } else {
        // Add text to the selected image
        const selectedContainer = document.querySelector(`.photostrip-img-container[data-index="${selectedImageIndex}"]`);
        
        // Create text element
        const textEl = document.createElement('div');
        textEl.className = 'sticker image-text';
        textEl.dataset.imageIndex = selectedImageIndex;
        textEl.textContent = text;
        textEl.style.left = '50%';
        textEl.style.top = '50%';
        textEl.style.transform = 'translate(-50%, -50%)';
        textEl.style.color = textColorInput.value;
        textEl.style.fontSize = '18px';
        textEl.style.fontWeight = 'bold';
        textEl.style.textShadow = '1px 1px 2px rgba(0,0,0,0.3)';
        
        // Make text draggable
        makeDraggable(textEl);
        
        // Add to the selected image container
        selectedContainer.appendChild(textEl);
        textElements.push(textEl);
      }
      
      // Clear input
      customTextInput.value = '';
    }
  });
  
  // Background, date toggle, animation toggle, preview, save, download, and share
  // (keeping those the same as they apply to the whole photostrip)
  
  // ... Rest of the existing code for these buttons ...
  
  // Add reset button for selected image
  const resetBtn = document.createElement('button');
  resetBtn.id = 'reset-image-btn';
  resetBtn.className = 'btn btn-outline';
  resetBtn.innerHTML = '<span class="btn-icon">🔄</span> Reset This Image';
  resetBtn.style.marginBottom = '20px';
  resetBtn.addEventListener('click', () => {
    if (selectedImageIndex !== -1) {
      resetSelectedImage();
    }
  });
  
  // Add the reset button at the top of controls
  const controls = document.querySelector('.controls');
  controls.insertBefore(resetBtn, controls.firstChild);
  
  // Background buttons
  bgButtons.forEach(button => {
    button.addEventListener('click', () => {
      // Update active button
      bgButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
      
      // Set photostrip background color
      const bgColor = button.getAttribute('data-bg');
      photostrip.style.backgroundColor = bgColor;
    });
  });
  
  // Date toggle
  enableDateToggle.addEventListener('change', () => {
    dateStamp.style.display = enableDateToggle.checked ? 'block' : 'none';
  });
  
  // Animation toggle
  enableAnimationToggle.addEventListener('change', () => {
    if (enableAnimationToggle.checked) {
      photostrip.classList.add('pulse');
    } else {
      photostrip.classList.remove('pulse');
    }
  });
  
  // Preview button
  previewBtn.addEventListener('click', () => {
    // Update preview images
    previewPhotos.forEach((img, index) => {
      if (index < capturedImages.length) {
        img.src = capturedImages[index];
      } else {
        img.src = capturedImages[capturedImages.length - 1] || '/placeholder.svg?height=150&width=150';
      }
      img.style.filter = photostripImages[index].style.filter || 'none';
    });
    
    // Show preview modal
    previewModal.style.display = 'flex';
  });
  
  // Save to gallery button
  saveToGalleryBtn.addEventListener('click', () => {
    // Show loading overlay
    loadingContainer.style.display = 'flex';
    
    // Generate photostrip image
    generatePhotostrip().then(dataURL => {
      // Create new gallery item
      const galleryItem = createGalleryItem(dataURL);
      
      // Add to gallery
      gallery.appendChild(galleryItem);
      
      // Hide empty gallery message
      emptyGalleryMessage.style.display = 'none';
      
      // Save to local storage
      savedPhotostrips.push({
        id: Date.now(),
        dataURL: dataURL,
        date: new Date().toLocaleDateString('en-US')
      });
      localStorage.setItem('savedPhotostrips', JSON.stringify(savedPhotostrips));
      
      // Hide loading overlay
      loadingContainer.style.display = 'none';
      
      // Show success message
      alert('Photostrip saved to gallery!');
    });
  });
  
  // Download button
  downloadBtn.addEventListener('click', () => {
    // Show loading overlay
    loadingContainer.style.display = 'flex';
    
    // Generate photostrip image
    generatePhotostrip().then(dataURL => {
      // Create download link
      const a = document.createElement('a');
      a.href = dataURL;
      a.download = 'photostrip-' + new Date().getTime() + '.png';
      a.click();
      
      // Hide loading overlay
      loadingContainer.style.display = 'none';
    });
  });
  
  // Share button
  shareBtn.addEventListener('click', () => {
    // Show share modal
    shareModal.style.display = 'flex';
  });
}

// Update controls based on the selected image
function updateControlsForSelectedImage() {
  if (selectedImageIndex === -1) return;
  
  const selectedImage = photostripImages[selectedImageIndex];
  
  // Update filter buttons to match the selected image's filter
  const currentImageFilter = selectedImage.style.filter || 'none';
  filterButtons.forEach(btn => {
    btn.classList.remove('active');
    if (btn.getAttribute('data-filter') === currentImageFilter) {
      btn.classList.add('active');
    }
  });
  
  // Update frame buttons to match the selected image's frame
  const container = selectedImage.parentElement;
  let currentImageFrame = 'none';
  
  if (selectedImage.style.border === '5px solid var(--primary)') {
    currentImageFrame = 'classic';
  } else if (container.style.padding === '10px' && container.style.paddingBottom === '30px') {
    currentImageFrame = 'polaroid';
  } else if (selectedImage.style.border === '5px solid #d4a373') {
    currentImageFrame = 'vintage';
  } else if (selectedImage.style.border === '2px solid black') {
    currentImageFrame = 'modern';
  }
  
  frameButtons.forEach(btn => {
    btn.classList.remove('active');
    if (btn.getAttribute('data-frame') === currentImageFrame) {
      btn.classList.add('active');
    }
  });
}

// Reset the selected image to its original state
function resetSelectedImage() {
  if (selectedImageIndex === -1) return;
  
  const selectedImage = photostripImages[selectedImageIndex];
  const container = selectedImage.parentElement;
  
  // Reset filter
  selectedImage.style.filter = 'none';
  
  // Reset frame
  container.style.padding = '0';
  container.style.backgroundColor = 'transparent';
  selectedImage.style.border = 'none';
  
  // Remove stickers and text attached to this image
  const imageStickers = container.querySelectorAll('.sticker');
  imageStickers.forEach(sticker => {
    sticker.remove();
    // Also remove from the stickers/textElements arrays
    stickers = stickers.filter(s => s !== sticker);
    textElements = textElements.filter(t => t !== sticker);
  });
  
  // Update controls to reflect changes
  updateControlsForSelectedImage();
}

// Update makeDraggable function to limit sticker movement
function makeDraggable(element, imageIndex) {
  let isDragging = false;
  let currentX;
  let currentY;
  let initialX;
  let initialY;
  let xOffset = 0;
  let yOffset = 0;

  element.addEventListener('mousedown', dragStart);
  element.addEventListener('mousemove', drag);
  element.addEventListener('mouseup', dragEnd);
  element.addEventListener('mouseleave', dragEnd);
  element.addEventListener('touchstart', dragStart, { passive: true });
  element.addEventListener('touchmove', drag, { passive: true });
  element.addEventListener('touchend', dragEnd);

  function dragStart(e) {
    if (e.type === 'mousedown') {
      initialX = e.clientX - xOffset;
      initialY = e.clientY - yOffset;
    } else {
      initialX = e.touches[0].clientX - xOffset;
      initialY = e.touches[0].clientY - yOffset;
    }

    if (e.target === element) {
      isDragging = true;
      element.classList.add('dragging');
    }
  }

  function drag(e) {
    if (isDragging) {
      e.preventDefault();

      if (e.type === 'mousemove') {
        currentX = e.clientX - initialX;
        currentY = e.clientY - initialY;
      } else {
        currentX = e.touches[0].clientX - initialX;
        currentY = e.touches[0].clientY - initialY;
      }

      xOffset = currentX;
      yOffset = currentY;

      // Get photostrip container boundaries
      const container = photostripContainer;
      const containerRect = container.getBoundingClientRect();
      const elementRect = element.getBoundingClientRect();

      if (imageIndex === -1) {
        // If no specific image, allow movement within the entire container
        const maxX = containerRect.width - elementRect.width;
        const maxY = containerRect.height - elementRect.height;
        currentX = Math.min(Math.max(0, currentX), maxX);
        currentY = Math.min(Math.max(0, currentY), maxY);
      } else {
        // Calculate boundaries for the specific image
        const imageHeight = 250; // Height of each image
        const imageY = imageIndex * imageHeight;
        const minY = imageY;
        const maxY = imageY + imageHeight;

        // Limit movement within the specific image area
        const maxX = containerRect.width - elementRect.width;
        currentX = Math.min(Math.max(0, currentX), maxX);
        currentY = Math.min(Math.max(minY, currentY), maxY - elementRect.height);
      }

      setTranslate(currentX, currentY, element);
    }
  }

  function dragEnd() {
    initialX = currentX;
    initialY = currentY;
    isDragging = false;
    element.classList.remove('dragging');
  }

  function setTranslate(xPos, yPos, el) {
    el.style.transform = `translate(${xPos}px, ${yPos}px)`;
  }
}

// Generate photostrip image
async function generatePhotostrip() {
  return new Promise(resolve => {
    // Create canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Set canvas size to match photostrip
    const photoWidth = 250;
    const photoHeight = 250;
    const padding = 20;
    const dateHeight = 30;
    
    canvas.width = photoWidth + (padding * 2);
    canvas.height = (photoHeight * photostripImages.length) + (padding * 2) + dateHeight;
    
    // Draw background
    ctx.fillStyle = photostrip.style.backgroundColor || '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw images
    const drawImages = async () => {
      for (let i = 0; i < photostripImages.length; i++) {
        const img = photostripImages[i];
        const y = padding + (i * photoHeight);
        
        // Create temporary canvas for applying filters
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        tempCanvas.width = photoWidth;
        tempCanvas.height = photoHeight;
        
        // Create image object
        const imgObj = new Image();
        imgObj.crossOrigin = 'anonymous';
        imgObj.src = img.src;
        
        await new Promise(resolve => {
          imgObj.onload = () => {
            // Draw image to temp canvas
            tempCtx.drawImage(imgObj, 0, 0, photoWidth, photoHeight);
            
            // Apply filter if any
            if (img.style.filter) {
              tempCtx.filter = img.style.filter;
              tempCtx.drawImage(tempCanvas, 0, 0);
              tempCtx.filter = 'none';
            }
            
            // Draw to main canvas
            ctx.drawImage(tempCanvas, padding, y);
            
            // Draw frame if any
            if (currentFrame === 'classic') {
              ctx.strokeStyle = '#ff6b6b';
              ctx.lineWidth = 5;
              ctx.strokeRect(padding, y, photoWidth, photoHeight);
            } else if (currentFrame === 'polaroid') {
              ctx.fillStyle = '#ffffff';
              ctx.fillRect(padding - 10, y - 10, photoWidth + 20, photoHeight + 30);
              ctx.drawImage(tempCanvas, padding, y);
            } else if (currentFrame === 'vintage') {
              ctx.strokeStyle = '#d4a373';
              ctx.lineWidth = 5;
              ctx.strokeRect(padding, y, photoWidth, photoHeight);
            } else if (currentFrame === 'modern') {
              ctx.strokeStyle = '#000000';
              ctx.lineWidth = 2;
              ctx.strokeRect(padding, y, photoWidth, photoHeight);
            }
            
            resolve();
          };
        });
      }
    };
    
    // Draw date if enabled
    const drawDate = () => {
      if (enableDateToggle.checked) {
        const y = padding + (photostripImages.length * photoHeight) + 15;
        ctx.font = '14px Poppins, sans-serif';
        ctx.fillStyle = '#000000';
        ctx.textAlign = 'center';
        ctx.fillText(dateStamp.textContent, canvas.width / 2, y);
      }
    };
    
    // Draw stickers and text
    const drawStickers = () => {
      // Draw stickers
      stickers.forEach(sticker => {
        const stickerElement = sticker.element;
        
        // Get position information
        let x, y;
        if (stickerElement.style.transform) {
          // Get position from transform property
          const transformValues = stickerElement.style.transform.match(/translate\((.+)px, (.+)px\)/);
          if (transformValues && transformValues.length === 3) {
            x = parseFloat(transformValues[1]) + parseFloat(stickerElement.style.left || 0) + padding;
            y = parseFloat(transformValues[2]) + parseFloat(stickerElement.style.top || 0) + padding;
          } else {
            x = parseFloat(stickerElement.style.left) + padding;
            y = parseFloat(stickerElement.style.top) + padding;
          }
        } else {
          x = parseFloat(stickerElement.style.left) + padding;
          y = parseFloat(stickerElement.style.top) + padding;
        }
        
        // Draw the sticker
        ctx.font = '30px sans-serif';
        ctx.fillText(stickerElement.textContent, x, y);
      });
      
      // Draw text elements
      textElements.forEach(textEl => {
        let x, y;
        if (textEl.style.transform) {
          // Get position from transform property
          const transformValues = textEl.style.transform.match(/translate\((.+)px, (.+)px\)/);
          if (transformValues && transformValues.length === 3) {
            x = parseFloat(transformValues[1]) + parseFloat(textEl.style.left || 0) + padding;
            y = parseFloat(transformValues[2]) + parseFloat(textEl.style.top || 0) + padding;
          } else {
            x = parseFloat(textEl.style.left) + padding;
            y = parseFloat(textEl.style.top) + padding;
          }
        } else {
          x = parseFloat(textEl.style.left) + padding;
          y = parseFloat(textEl.style.top) + padding;
        }
        
        ctx.font = textEl.style.fontSize + ' Poppins, sans-serif';
        ctx.fillStyle = textEl.style.color;
        ctx.fillText(textEl.textContent, x, y);
      });
    };
    
    // Execute drawing operations in sequence
    drawImages().then(() => {
      drawDate();
      drawStickers();
      
      // Return data URL
      resolve(canvas.toDataURL('image/png'));
    });
  });
}

// Create gallery item
function createGalleryItem(dataURL, itemId) {
  const item = document.createElement('div');
  item.className = 'gallery-item';
  
  const img = document.createElement('img');
  img.src = dataURL;
  img.alt = 'Saved photo strip';
  
  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'delete-btn';
  deleteBtn.innerHTML = '×';
  deleteBtn.title = 'Delete photo';
  
  // Stop event propagation when clicking delete button
  deleteBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    
    // Show confirmation dialog
    if (confirm('Are you sure you want to delete this photo?')) {
      // Remove from savedPhotostrips array
      savedPhotostrips = savedPhotostrips.filter(photo => photo.id !== itemId);
      
      // Update localStorage
      localStorage.setItem('savedPhotostrips', JSON.stringify(savedPhotostrips));
      
      // Remove from DOM
      item.remove();
      
      // Show empty gallery message if no items left
      if (savedPhotostrips.length === 0) {
        emptyGalleryMessage.style.display = 'block';
      }
    }
  });
  
  const info = document.createElement('div');
  info.className = 'info';
  
  const title = document.createElement('div');
  title.className = 'title';
  title.textContent = 'Photo Strip #' + (savedPhotostrips.length + 1);
  
  const date = document.createElement('div');
  date.className = 'date';
  date.textContent = new Date().toLocaleDateString('en-US');
  
  info.appendChild(title);
  info.appendChild(date);
  
  item.appendChild(deleteBtn);
  item.appendChild(img);
  item.appendChild(info);
  
  // Add click event to view the photostrip
  item.addEventListener('click', () => {
    // Show preview modal with this photostrip
    previewPhotos[0].src = dataURL;
    previewModal.style.display = 'flex';
  });
  
  return item;
}

// Collage section setup
function setupCollageSection() {
  // Setup collage items
  collageItems.forEach((item, index) => {
    item.addEventListener('click', () => {
      if (item.classList.contains('empty')) {
        // Open file picker
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        
        input.onchange = (e) => {
          const file = e.target.files[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
              // Create image
              const img = document.createElement('img');
              img.src = e.target.result;
              
              // Clear placeholder and add image
              item.innerHTML = '';
              item.appendChild(img);
              item.classList.remove('empty');
              
              // Store image
              collageImages[index] = e.target.result;
              
              // Enable download button if we have at least one image
              downloadCollageBtn.disabled = collageImages.filter(Boolean).length === 0;
            };
            reader.readAsDataURL(file);
          }
        };
        
        input.click();
      }
    });
  });
  
  // Collage layout buttons
  collageLayoutButtons.forEach(button => {
    button.addEventListener('click', () => {
      // Update active button
      collageLayoutButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
      
      // Set current layout
      currentCollageLayout = button.getAttribute('data-layout');
      
      // Apply layout
      applyCollageLayout();
    });
  });
  
  // Clear collage button
  clearCollageBtn.addEventListener('click', () => {
    collageImages = [];
    collageItems.forEach(item => {
      item.innerHTML = '+';
      item.classList.add('empty');
    });
    downloadCollageBtn.disabled = true;
  });
  
  // Download collage button
  downloadCollageBtn.addEventListener('click', () => {
    // Show loading overlay
    loadingContainer.style.display = 'flex';
    
    // Generate collage image
    generateCollage().then(dataURL => {
      // Create download link
      const a = document.createElement('a');
      a.href = dataURL;
      a.download = 'collage-' + new Date().getTime() + '.png';
      a.click();
      
      // Hide loading overlay
      loadingContainer.style.display = 'none';
    });
  });
}

// Apply collage layout
function applyCollageLayout() {
  const grid = collageGrid;
  
  // Reset grid
  grid.style.gridTemplateColumns = '';
  grid.style.gridTemplateRows = '';
  
  // Apply selected layout
  switch (currentCollageLayout) {
    case '2x2':
      grid.style.gridTemplateColumns = 'repeat(2, 1fr)';
      grid.style.gridTemplateRows = 'repeat(2, 1fr)';
      collageItems.forEach(item => {
        item.style.gridColumn = '';
        item.style.gridRow = '';
      });
      break;
    case '1x2':
      grid.style.gridTemplateColumns = '1fr';
      grid.style.gridTemplateRows = 'repeat(2, 1fr)';
      collageItems.forEach((item, index) => {
        if (index < 2) {
          item.style.display = 'block';
          item.style.gridColumn = '';
          item.style.gridRow = '';
        } else {
          item.style.display = 'none';
        }
      });
      break;
    case '2x1':
      grid.style.gridTemplateColumns = 'repeat(2, 1fr)';
      grid.style.gridTemplateRows = '1fr';
      collageItems.forEach((item, index) => {
        if (index < 2) {
          item.style.display = 'block';
          item.style.gridColumn = '';
          item.style.gridRow = '';
        } else {
          item.style.display = 'none';
        }
      });
      break;
    case '1-2':
      grid.style.gridTemplateColumns = 'repeat(2, 1fr)';
      grid.style.gridTemplateRows = 'repeat(2, 1fr)';
      collageItems.forEach((item, index) => {
        if (index === 0) {
          item.style.gridColumn = '1';
          item.style.gridRow = '1 / span 2';
          item.style.display = 'block';
        } else if (index < 3) {
          item.style.gridColumn = '2';
          item.style.gridRow = index === 1 ? '1' : '2';
          item.style.display = 'block';
        } else {
          item.style.display = 'none';
        }
      });
      break;
    case '2-1':
      grid.style.gridTemplateColumns = 'repeat(2, 1fr)';
      grid.style.gridTemplateRows = 'repeat(2, 1fr)';
      collageItems.forEach((item, index) => {
        if (index < 2) {
          item.style.gridColumn = index === 0 ? '1' : '2';
          item.style.gridRow = '1';
          item.style.display = 'block';
        } else if (index === 2) {
          item.style.gridColumn = '1 / span 2';
          item.style.gridRow = '2';
          item.style.display = 'block';
        } else {
          item.style.display = 'none';
        }
      });
      break;
  }
}

// Generate collage image
async function generateCollage() {
  return new Promise(resolve => {
    // Create canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Set canvas size to match collage grid
    canvas.width = 400;
    canvas.height = 400;
    
    // Draw background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw images based on layout
    const drawImages = async () => {
      const filteredImages = collageImages.filter(Boolean);
      
      if (currentCollageLayout === '2x2') {
        // 2x2 grid
        for (let i = 0; i < Math.min(filteredImages.length, 4); i++) {
          const row = Math.floor(i / 2);
          const col = i % 2;
          const x = col * 200;
          const y = row * 200;
          
          await drawCollageImage(filteredImages[i], x, y, 200, 200);
        }
      } else if (currentCollageLayout === '1x2') {
        // 1x2 grid (vertical)
        for (let i = 0; i < Math.min(filteredImages.length, 2); i++) {
          const y = i * 200;
          await drawCollageImage(filteredImages[i], 0, y, 400, 200);
        }
      } else if (currentCollageLayout === '2x1') {
        // 2x1 grid (horizontal)
        for (let i = 0; i < Math.min(filteredImages.length, 2); i++) {
          const x = i * 200;
          await drawCollageImage(filteredImages[i], x, 0, 200, 400);
        }
      } else if (currentCollageLayout === '1-2') {
        // Left big, right 2 small
        if (filteredImages.length > 0) {
          await drawCollageImage(filteredImages[0], 0, 0, 200, 400);
        }
        if (filteredImages.length > 1) {
          await drawCollageImage(filteredImages[1], 200, 0, 200, 200);
        }
        if (filteredImages.length > 2) {
          await drawCollageImage(filteredImages[2], 200, 200, 200, 200);
        }
      } else if (currentCollageLayout === '2-1') {
        // Top 2 small, bottom big
        if (filteredImages.length > 0) {
          await drawCollageImage(filteredImages[0], 0, 0, 200, 200);
        }
        if (filteredImages.length > 1) {
          await drawCollageImage(filteredImages[1], 200, 0, 200, 200);
        }
        if (filteredImages.length > 2) {
          await drawCollageImage(filteredImages[2], 0, 200, 400, 200);
        }
      }
    };
    
    // Helper function to draw a collage image
    const drawCollageImage = async (src, x, y, width, height) => {
      return new Promise(resolve => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = src;
        
        img.onload = () => {
          ctx.drawImage(img, x, y, width, height);
          
          // Draw border
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 4;
          ctx.strokeRect(x + 2, y + 2, width - 4, height - 4);
          
          resolve();
        };
      });
    };
    
    // Execute drawing operations
    drawImages().then(() => {
      // Return data URL
      resolve(canvas.toDataURL('image/png'));
    });
  });
}

// Gallery section setup
function setupGallerySection() {
  // Load saved photostrips from local storage
  const saved = localStorage.getItem('savedPhotostrips');
  if (saved) {
    savedPhotostrips = JSON.parse(saved);
    
    // Create gallery items
    if (savedPhotostrips.length > 0) {
      // Clear placeholder
      gallery.innerHTML = '';
      
      // Add saved items
      savedPhotostrips.forEach(item => {
        const galleryItem = createGalleryItem(item.dataURL, item.id);
        gallery.appendChild(galleryItem);
      });
      
      // Hide empty gallery message
      emptyGalleryMessage.style.display = 'none';
    } else {
      // Show empty gallery message
      emptyGalleryMessage.style.display = 'block';
    }
  } else {
    // Show empty gallery message
    emptyGalleryMessage.style.display = 'block';
  }
  
  // Create new button
  createNewBtn.addEventListener('click', () => {
    // Switch to capture tab
    const captureTab = document.querySelector('.tab[data-tab="capture"]');
    captureTab.click();
  });
}

// Modals setup
function setupModals() {
  // Preview modal
  closePreviewModal.addEventListener('click', () => {
    previewModal.style.display = 'none';
  });
  
  closePreviewBtn.addEventListener('click', () => {
    previewModal.style.display = 'none';
  });
  
  // Share modal
  closeShareModal.addEventListener('click', () => {
    shareModal.style.display = 'none';
  });
  
  // Copy link button
  copyLinkBtn.addEventListener('click', () => {
    const linkInput = shareModal.querySelector('.text-input');
    linkInput.select();
    document.execCommand('copy');
    copyLinkBtn.textContent = '✓ Copied!';
    setTimeout(() => {
      copyLinkBtn.innerHTML = '<span class="btn-icon">📋</span> Copy Link';
    }, 2000);
  });
  
  // Close modals when clicking outside
  window.addEventListener('click', (e) => {
    if (e.target === previewModal) {
      previewModal.style.display = 'none';
    }
    if (e.target === shareModal) {
      shareModal.style.display = 'none';
    }
  });
}

// Theme toggle
function setupThemeToggle() {
  themeToggle.addEventListener('click', () => {
    isDarkMode = !isDarkMode;
    document.body.classList.toggle('dark-mode', isDarkMode);
    themeToggle.textContent = isDarkMode ? '☀️' : '🌙';
  });
}

// Alert Notification Functions
function showAlert(message, type = 'info', title = '', duration = 3000) {
  const alertContainer = document.getElementById('alert-container');
  const alert = document.createElement('div');
  alert.className = `alert alert-${type}`;
  
  let iconType = '📢';
  if (type === 'success') iconType = '✅';
  if (type === 'error') iconType = '❌';
  if (type === 'warning') iconType = '⚠️';
  
  if (!title) {
    if (type === 'success') title = 'Success!';
    if (type === 'error') title = 'Error!';
    if (type === 'warning') title = 'Warning!';
    if (type === 'info') title = 'Information';
  }
  
  alert.innerHTML = `
    <div class="alert-icon">${iconType}</div>
    <div class="alert-content">
      <div class="alert-title">${title}</div>
      <div class="alert-message">${message}</div>
    </div>
    <button class="alert-close">×</button>
  `;
  
  // Add close functionality
  alert.querySelector('.alert-close').addEventListener('click', () => {
    alert.style.opacity = '0';
    setTimeout(() => {
      alertContainer.removeChild(alert);
    }, 300);
  });
  
  alertContainer.appendChild(alert);
  
  // Auto remove after duration
  if (duration > 0) {
    setTimeout(() => {
      if (alert.parentNode === alertContainer) {
        alert.style.opacity = '0';
        setTimeout(() => {
          if (alert.parentNode === alertContainer) {
            alertContainer.removeChild(alert);
          }
        }, 300);
      }
    }, duration);
  }
}

// Example usage of alerts
// Uncomment these to test alerts
/*
document.addEventListener('DOMContentLoaded', () => {
  // Success alert example
  document.getElementById('save-to-gallery-btn').addEventListener('click', () => {
    showAlert('Your photo has been saved to gallery!', 'success');
  });
  
  // Error alert example
  document.getElementById('download-btn').addEventListener('click', () => {
    showAlert('Could not download photo. Please try again.', 'error');
  });
  
  // Warning alert example
  document.getElementById('share-btn').addEventListener('click', () => {
    showAlert('Share feature is currently in beta', 'warning');
  });
  
  // Info alert example
  document.getElementById('preview-btn').addEventListener('click', () => {
    showAlert('Click on an image to edit it', 'info');
  });
});
*/

// Initialize when the page loads
document.addEventListener('DOMContentLoaded', init);
