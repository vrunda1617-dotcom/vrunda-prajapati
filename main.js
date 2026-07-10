document.addEventListener('DOMContentLoaded', () => {
  setupHeaderScroll();
  setupMobileMenu();
  setupIntersectionObserver();
  setupNavigationHighlighting();
  setupInteractiveScrubber();
  setupDraggableMarquee();
  setupPhotoMarquees();
  setupInfluencerVideos();
});

// 1. Header background styling on scroll
function setupHeaderScroll() {
  const header = document.querySelector('header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });
}

// 2. Scroll Reveal animations via IntersectionObserver
function setupIntersectionObserver() {
  const revealElements = document.querySelectorAll('.reveal');
  
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.15
  };
  
  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        // Once revealed, no need to track it further
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);
  
  revealElements.forEach(el => observer.observe(el));
}

// 3. Highlight navigation link matching visible section
function setupNavigationHighlighting() {
  const sections = document.querySelectorAll('section');
  const navItems = document.querySelectorAll('.nav-links li');
  
  const highlightOptions = {
    root: null,
    rootMargin: '-50% 0px -50% 0px', // Trigger when section is in middle of viewport
    threshold: 0
  };
  
  const highlightObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navItems.forEach(item => {
          item.classList.remove('active');
          const link = item.querySelector('a');
          if (link && link.getAttribute('href') === `#${id}`) {
            item.classList.add('active');
          }
        });
      }
    });
  }, highlightOptions);
  
  sections.forEach(section => highlightObserver.observe(section));
}

// 4. Interactive Frame Scrubber for Cafezza video frames
function setupInteractiveScrubber() {
  const cards = document.querySelectorAll('.scrubber-card');
  const imgs = document.querySelectorAll('.scrubber-img');
  if (cards.length === 0 || imgs.length === 0) return;

  const totalFrames = 300;
  const preloadedImages = [];
  let isHovered = false;

  // Function to get padded frame URL
  function getFrameUrl(index) {
    const paddedIndex = String(index).padStart(3, '0');
    return `assets/frames/ezgif-frame-${paddedIndex}.jpg`;
  }

  // Preload a subset of frames to start with, then preload all when user hovers
  function startPreloading() {
    // Preload first, middle and end frames instantly
    const keyFrames = [1, 50, 100, 150, 200, 250, 300];
    keyFrames.forEach(idx => {
      const tempImg = new Image();
      tempImg.src = getFrameUrl(idx);
    });
  }

  function preloadAllFrames() {
    if (preloadedImages.length > 0) return; // Already preloading or completed
    
    // We preload all 300 frames in chunks to avoid blocking
    for (let i = 1; i <= totalFrames; i++) {
      const tempImg = new Image();
      tempImg.src = getFrameUrl(i);
      preloadedImages.push(tempImg);
    }
  }

  // Start initial small preload
  startPreloading();

  // Add listeners to all scrubber cards (including duplicates in marquee)
  cards.forEach((card, index) => {
    const img = imgs[index];
    if (!img) return;

    card.addEventListener('mousemove', (e) => {
      if (!isHovered) {
        isHovered = true;
        preloadAllFrames();
      }
      
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left; // Position inside the element
      const width = rect.width;
      
      // Calculate fraction and map to frame index
      let fraction = x / width;
      fraction = Math.max(0, Math.min(1, fraction)); // Clamp 0 to 1
      
      // Map fraction to frame range [1, 300]
      const frameIndex = Math.max(1, Math.min(totalFrames, Math.round(fraction * (totalFrames - 1)) + 1));
      
      // Update image src
      img.src = getFrameUrl(frameIndex);
    });

    card.addEventListener('mouseleave', () => {
      // Smooth reset back to frame 150 (middle) on mouse leave
      let currentFrame = 150;
      img.src = getFrameUrl(currentFrame);
    });
  });
}

// 5. Lightbox Modal logic
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
const lightboxVideo = document.getElementById('lightbox-video');

function openLightbox(src) {
  if (!lightbox) return;
  
  const isVideo = src.toLowerCase().endsWith('.mp4');
  if (isVideo) {
    if (lightboxImg) {
      lightboxImg.src = '';
      lightboxImg.style.display = 'none';
    }
    if (lightboxVideo) {
      lightboxVideo.src = src;
      lightboxVideo.style.display = 'block';
      lightboxVideo.play().catch(e => console.log("Video auto-play blocked or failed", e));
    }
  } else {
    if (lightboxVideo) {
      lightboxVideo.pause();
      lightboxVideo.src = '';
      lightboxVideo.style.display = 'none';
    }
    if (lightboxImg) {
      lightboxImg.src = src;
      lightboxImg.style.display = 'block';
    }
  }
  
  lightbox.classList.add('active');
  document.body.style.overflow = 'hidden'; // Stop scrolling behind modal
}

function closeLightbox() {
  if (!lightbox) return;
  lightbox.classList.remove('active');
  document.body.style.overflow = ''; // Restore scroll
  
  // Pause and clear video if any
  if (lightboxVideo) {
    lightboxVideo.pause();
    lightboxVideo.src = '';
  }
}

// Close lightbox on click outside the image
if (lightbox) {
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) {
      closeLightbox();
    }
  });
}

// 5b. Influencer Video Inline Playback Handling
function setupInfluencerVideos() {
  const videos = document.querySelectorAll('#influencer video');
  videos.forEach(video => {
    const card = video.closest('.showcase-card');
    if (!card) return;
    
    video.addEventListener('play', () => {
      card.classList.add('video-playing');
      video.setAttribute('controls', 'true');
    });
    
    video.addEventListener('pause', () => {
      card.classList.remove('video-playing');
      video.removeAttribute('controls');
    });

    video.addEventListener('ended', () => {
      video.removeAttribute('controls');
      card.classList.remove('video-playing');
      video.currentTime = 0;
    });
  });
}

function togglePlayVideo(card) {
  const video = card.querySelector('video');
  if (!video) return;

  if (video.hasAttribute('controls')) {
    return;
  }

  const allVideos = document.querySelectorAll('#influencer video');
  allVideos.forEach(v => {
    if (v !== video && !v.paused) {
      v.pause();
    }
  });

  if (video.paused) {
    video.play().catch(err => {
      console.error("Failed to play video:", err);
    });
  } else {
    video.pause();
  }
}

// 6. Interactive Draggable Infinite Marquee
function setupDraggableMarquee() {
  const container = document.querySelector('.marquee-container');
  const track = document.querySelector('.marquee-track');
  if (!container || !track) return;

  const firstGroup = track.querySelector('.showcase-card-group');
  if (!firstGroup) return;

  let currentX = 0;
  let isDragging = false;
  let isHovered = false;
  let startX = 0;
  let dragStartX = 0;
  const speed = 0.6; // Speed in pixels per frame (~36px/sec at 60fps)
  let groupWidth = firstGroup.offsetWidth || 990;

  // Recalculate groupWidth on window resize
  window.addEventListener('resize', () => {
    groupWidth = firstGroup.offsetWidth || 990;
  });

  // Animation Loop
  function update() {
    if (!isDragging) {
      currentX -= speed;
      
      // Infinite loop wrapping (going left)
      if (currentX <= -groupWidth) {
        currentX += groupWidth;
      }
      // Infinite loop wrapping (going right)
      if (currentX > 0) {
        currentX -= groupWidth;
      }
      
      track.style.transform = `translate3d(${currentX}px, 0, 0)`;
    }
    requestAnimationFrame(update);
  }
  
  // Start the animation loop
  requestAnimationFrame(update);

  // Dragging interaction handlers
  function handleDragStart(clientX) {
    isDragging = true;
    container.classList.add('grabbing');
    startX = clientX;
    dragStartX = currentX;
    // Update groupWidth just in case it changed
    groupWidth = firstGroup.offsetWidth || 990;
  }
  
  function handleDragMove(clientX) {
    if (!isDragging) return;
    if (groupWidth <= 0 || isNaN(groupWidth)) return;
    
    const dx = clientX - startX;
    let newX = dragStartX + dx;
    
    // Wrap around instantly to ensure we never run out of cards
    while (newX <= -groupWidth) {
      newX += groupWidth;
      dragStartX += groupWidth;
    }
    while (newX > 0) {
      newX -= groupWidth;
      dragStartX -= groupWidth;
    }
    
    currentX = newX;
    track.style.transform = `translate3d(${currentX}px, 0, 0)`;
  }
  
  function handleDragEnd() {
    if (!isDragging) return;
    isDragging = false;
    container.classList.remove('grabbing');
  }

  // Mouse Listeners
  container.addEventListener('mousedown', (e) => {
    // Only respond to primary (left) click
    if (e.button !== 0) return;
    handleDragStart(e.clientX);
  });

  window.addEventListener('mousemove', (e) => {
    handleDragMove(e.clientX);
  });

  window.addEventListener('mouseup', () => {
    handleDragEnd();
  });

  // Touch Listeners (with passive: true for scroll performance)
  container.addEventListener('touchstart', (e) => {
    if (e.touches.length > 0) {
      handleDragStart(e.touches[0].clientX);
    }
  }, { passive: true });

  window.addEventListener('touchmove', (e) => {
    if (isDragging && e.touches.length > 0) {
      handleDragMove(e.touches[0].clientX);
    }
  }, { passive: true });

  window.addEventListener('touchend', () => {
    handleDragEnd();
  });

  // Hover detection to handle mouse release outside container
  container.addEventListener('mouseleave', () => {
    handleDragEnd(); // Stop dragging if mouse leaves container
  });

  // Setup dynamic lightbox click event listeners on cards (avoiding inline onclick interference)
  const cards = track.querySelectorAll('.showcase-card');
  cards.forEach(card => {
    let clickStartX = 0;
    let clickStartY = 0;
    
    card.addEventListener('mousedown', (e) => {
      clickStartX = e.clientX;
      clickStartY = e.clientY;
    });
    
    card.addEventListener('mouseup', (e) => {
      const clickEndX = e.clientX;
      const clickEndY = e.clientY;
      const dist = Math.sqrt(Math.pow(clickEndX - clickStartX, 2) + Math.pow(clickEndY - clickStartY, 2));
      
      // Only open lightbox if it was a distinct click, not a drag movement
      if (dist < 6) {
        const src = card.getAttribute('data-lightbox-src');
        if (src) {
          openLightbox(src);
        }
      }
    });

    // Touch event lightbox mapping
    card.addEventListener('touchstart', (e) => {
      if (e.touches.length > 0) {
        clickStartX = e.touches[0].clientX;
        clickStartY = e.touches[0].clientY;
      }
    }, { passive: true });

    card.addEventListener('touchend', (e) => {
      if (e.changedTouches.length > 0) {
        const clickEndX = e.changedTouches[0].clientX;
        const clickEndY = e.changedTouches[0].clientY;
        const dist = Math.sqrt(Math.pow(clickEndX - clickStartX, 2) + Math.pow(clickEndY - clickStartY, 2));
        
        if (dist < 6) {
          const src = card.getAttribute('data-lightbox-src');
          if (src) {
            openLightbox(src);
          }
        }
      }
    });
  });
}

// 7. Double-row Photo Wall scrolling marquees (Left/Right)
function setupPhotoMarquees() {
  const marquee1 = document.getElementById('wall-row-1');
  const marquee2 = document.getElementById('wall-row-2');
  const marquee3 = document.getElementById('wall-row-3');
  
  if (marquee1) {
    initMarqueeRow(marquee1, 0.4); // Positive speed = moves right
  }
  if (marquee2) {
    initMarqueeRow(marquee2, -0.4); // Negative speed = moves left
  }
  if (marquee3) {
    initMarqueeRow(marquee3, 0.4); // Positive speed = moves right
  }
}

function initMarqueeRow(container, baseSpeed) {
  const track = container.querySelector('.photo-wall-track');
  if (!track) return;
  
  const firstGroup = track.querySelector('.photo-strip-group');
  if (!firstGroup) return;
  
  let currentX = 0;
  let isDragging = false;
  let startX = 0;
  let dragStartX = 0;
  let groupWidth = firstGroup.offsetWidth || 1700;

  // Recalculate groupWidth on resize
  window.addEventListener('resize', () => {
    groupWidth = firstGroup.offsetWidth || 1700;
  });

  // Small delay to make sure elements are fully loaded
  setTimeout(() => {
    groupWidth = firstGroup.offsetWidth || 1700;
  }, 300);

  // Animation Loop
  function update() {
    if (!isDragging) {
      currentX += baseSpeed;
      
      // Loop wrap (going left - baseSpeed negative)
      if (baseSpeed < 0 && currentX <= -groupWidth) {
        currentX += groupWidth;
      }
      // Loop wrap (going right - baseSpeed positive)
      if (baseSpeed > 0 && currentX >= 0) {
        currentX -= groupWidth;
      }
      
      track.style.transform = `translate3d(${currentX}px, 0, 0)`;
    }
    requestAnimationFrame(update);
  }
  requestAnimationFrame(update);

  // Dragging handlers
  function handleDragStart(clientX) {
    isDragging = true;
    container.classList.add('grabbing');
    startX = clientX;
    dragStartX = currentX;
    groupWidth = firstGroup.offsetWidth || 1700;
  }
  
  function handleDragMove(clientX) {
    if (!isDragging) return;
    if (groupWidth <= 0 || isNaN(groupWidth)) return;
    
    const dx = clientX - startX;
    let newX = dragStartX + dx;
    
    // Wrap around instantly to ensure we never run out of cards
    while (newX <= -groupWidth) {
      newX += groupWidth;
      dragStartX += groupWidth;
    }
    while (newX > 0) {
      newX -= groupWidth;
      dragStartX -= groupWidth;
    }
    
    currentX = newX;
    track.style.transform = `translate3d(${currentX}px, 0, 0)`;
  }
  
  function handleDragEnd() {
    if (!isDragging) return;
    isDragging = false;
    container.classList.remove('grabbing');
  }

  // Mouse Events
  container.addEventListener('mousedown', (e) => {
    if (e.button !== 0) return;
    handleDragStart(e.clientX);
  });

  window.addEventListener('mousemove', (e) => {
    handleDragMove(e.clientX);
  });

  window.addEventListener('mouseup', () => {
    handleDragEnd();
  });

  // Touch Events (passive true to avoid scroll blocking warning)
  container.addEventListener('touchstart', (e) => {
    if (e.touches.length > 0) {
      handleDragStart(e.touches[0].clientX);
    }
  }, { passive: true });

  window.addEventListener('touchmove', (e) => {
    if (isDragging && e.touches.length > 0) {
      handleDragMove(e.touches[0].clientX);
    }
  }, { passive: true });

  window.addEventListener('touchend', () => {
    handleDragEnd();
  });

  // Click on items should open lightbox if it wasn't a drag gesture
  const items = track.querySelectorAll('.photo-strip-item');
  items.forEach(item => {
    let clickStartX = 0;
    let clickStartY = 0;
    
    item.addEventListener('mousedown', (e) => {
      clickStartX = e.clientX;
      clickStartY = e.clientY;
    });
    
    item.addEventListener('mouseup', (e) => {
      const clickEndX = e.clientX;
      const clickEndY = e.clientY;
      const dist = Math.sqrt(Math.pow(clickEndX - clickStartX, 2) + Math.pow(clickEndY - clickStartY, 2));
      
      if (dist < 6) {
        const img = item.querySelector('img');
        if (img) {
          const src = img.getAttribute('src');
          if (src) {
            openLightbox(src);
          }
        }
      }
    });

    item.addEventListener('touchstart', (e) => {
      if (e.touches.length > 0) {
        clickStartX = e.touches[0].clientX;
        clickStartY = e.touches[0].clientY;
      }
    }, { passive: true });

    item.addEventListener('touchend', (e) => {
      if (e.changedTouches.length > 0) {
        const clickEndX = e.changedTouches[0].clientX;
        const clickEndY = e.changedTouches[0].clientY;
        const dist = Math.sqrt(Math.pow(clickEndX - clickStartX, 2) + Math.pow(clickEndY - clickStartY, 2));
        
        if (dist < 6) {
          const img = item.querySelector('img');
          if (img) {
            const src = img.getAttribute('src');
            if (src) {
              openLightbox(src);
            }
          }
        }
      }
    });
  });
}

// 8. Mobile hamburger menu navigation toggle
function setupMobileMenu() {
  const navToggle = document.querySelector('.nav-toggle');
  const header = document.querySelector('header');
  const navLinksContainer = document.querySelector('.nav-links');
  const navLinks = document.querySelectorAll('.nav-links a');

  if (!navToggle || !navLinksContainer) return;

  navToggle.addEventListener('click', () => {
    header.classList.toggle('nav-open');
    navLinksContainer.classList.toggle('active');
  });

  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      header.classList.remove('nav-open');
      navLinksContainer.classList.remove('active');
    });
  });
}
