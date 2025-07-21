
        /**
         * Video Player v1.2
         * A modern, responsive video player with no ads, no clutter and fast
         * 
         * Copyright (c) 2025 Ankit Mehta (Starexx)
         *
         * Licensed under the Apache License, Version 2.0 (the "License");
         * you may not use this file except in compliance with the License.
         * You may obtain a copy of the License at
         *      
         * http://www.apache.org/licenses/LICENSE-2.0
         *
         * Unless required by applicable law or agreed to in writing, software
         * distributed under the License is distributed on an "AS IS" BASIS,
         * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
         * See the License for the specific language governing permissions and
         * limitations under the License.
         */
        
        if (window.top !== window.self) {
            window.top.location = window.self.location;
        }

        // Class
        class VideoPlayer {
            constructor() {
                this.videoPlayer = document.getElementById('videoPlayer');
                this.controlsContainer = document.getElementById('controlsContainer');
                this.playPauseBtn = document.getElementById('playPauseBtn');
                this.muteBtn = document.getElementById('muteBtn');
                this.settingsBtn = document.getElementById('settingsBtn');
                this.fullscreenBtn = document.getElementById('fullscreenBtn');
                this.timeDisplay = document.getElementById('timeDisplay');
                this.progressContainer = document.getElementById('progressContainer');
                this.progressBar = document.getElementById('progressBar');
                this.backBtn = document.getElementById('backBtn');
                this.forwardBtn = document.getElementById('forwardBtn');
                this.seekIndicator = document.getElementById('seekIndicator');
                this.settingsPanel = document.getElementById('settingsPanel');
                this.orientationPrompt = document.getElementById('orientationPrompt');
                this.volumeSlider = document.getElementById('volumeSlider');
                this.volumeValue = document.getElementById('volumeValue');
                this.brightnessSlider = document.getElementById('brightnessSlider');
                this.brightnessValue = document.getElementById('brightnessValue');
                this.speedSlider = document.getElementById('speedSlider');
                this.speedValue = document.getElementById('speedValue');
                this.videoInfoBtn = document.getElementById('videoInfoBtn');
                this.aboutBtn = document.getElementById('aboutBtn');
                this.pinchOverlay = document.getElementById('pinchOverlay');
                this.zoomLevel = document.getElementById('zoomLevel');
                this.customAlert = document.getElementById('customAlert');
                this.alertHeader = document.getElementById('alertHeader');
                this.alertContent = document.getElementById('alertContent');
                this.alertOkBtn = document.getElementById('alertOkBtn');
                this.alertCancelBtn = document.getElementById('alertCancelBtn');
                this.playCenterBtn = document.getElementById('playCenterBtn');
                this.thumbnailOverlay = document.getElementById('thumbnailOverlay');
                this.loadingSpinner = document.getElementById('loadingSpinner');
                
                this.controlsTimeout = null;
                this.isLandscape = window.innerWidth > window.innerHeight;
                this.initialDistance = null;
                this.currentZoom = 1;
                this.lastTouchTime = 0;
                this.videoLoaded = false;
                this.autoplayAttempted = false;
                
                this.initPlayer();
                this.registerServiceWorker();
            }
            
            /**
             * Initialize the video player with all event listeners
             */
            initPlayer() {
                // GET video URL from query parameter or use default
                const urlParams = new URLSearchParams(window.location.search);
                const videoUrl = urlParams.get('q') || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'; // Default Video "/"
                

                if (this.checkVideoUrl(videoUrl)) {
                    this.videoPlayer.src = videoUrl;
                    

                    this.setVideoThumbnail(videoUrl);
                }
                

                this.addEventListeners();
                
                this.checkOrientation();
            }
            
            /**
             * Set video thumbnail if possible
             * @param {string} videoUrl - The video URL
             */
            setVideoThumbnail(videoUrl) {
                if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
                    const videoId = this.extractYouTubeId(videoUrl);
                    if (videoId) {
                        this.thumbnailOverlay.style.backgroundImage = `url(https://img.youtube.com/vi/${videoId}/maxresdefault.jpg)`;
                    }
                } else {
                    this.thumbnailOverlay.style.background = '#000';
                }
            }
            
            /**
             * Extract YouTube video ID from URL
             * @param {string} url - YouTube URL
             * @returns {string|null} - Video ID or null
             */
            extractYouTubeId(url) {
                const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
                const match = url.match(regExp);
                return (match && match[2].length === 11) ? match[2] : null;
            }
            
            /**
             * Register Service Worker for PWA functionality
             */
            registerServiceWorker() {
                if ('serviceWorker' in navigator) {
                    window.addEventListener('load', () => {
                        navigator.serviceWorker.register('/sw.js').then(registration => {
                            console.log('ServiceWorker registration successful');
                        }).catch(err => {
                            console.log('ServiceWorker registration failed: ', err);
                        });
                    });
                }
            }
            
            /**
             * Add all event listeners to the player
             */
            addEventListeners() {
                // Controls
                this.playPauseBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.togglePlayPause();
                });
                
                this.playCenterBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.togglePlayPause();
                    this.hideCenterPlayButton();
                });
                
                this.fullscreenBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.toggleFullscreen();
                    this.showControls();
                });
                
                this.muteBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.toggleMute();
                    this.showControls();
                });
                
                this.backBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.seek(-10);
                    this.showControls();
                });
                
                this.forwardBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.seek(10);
                    this.showControls();
                });
                
                this.progressContainer.addEventListener('click', (e) => {
                    const rect = this.progressContainer.getBoundingClientRect();
                    const pos = (e.clientX - rect.left) / rect.width;
                    this.videoPlayer.currentTime = pos * this.videoPlayer.duration;
                    this.showControls();
                });
                
                this.settingsBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.toggleSettings();
                });
                
                this.videoPlayer.addEventListener('click', (e) => {
                    const now = Date.now();
                    if (now - this.lastTouchTime < 300) { // Double tap
                        if (this.currentZoom > 1) {
                            this.updateZoom(1);
                        } else {
                            this.updateZoom(1.5);
                        }
                    }
                    this.lastTouchTime = now;
                    
                    if (this.settingsPanel.classList.contains('show')) {
                        this.hideSettings();
                        return;
                    }
                    
                    this.toggleControls();
                });
                
                this.videoPlayer.addEventListener('touchstart', (e) => {
                    if (e.touches.length === 2) {
                        this.handlePinch(e);
                    }
                }, { passive: false });
                
                this.videoPlayer.addEventListener('touchmove', (e) => {
                    if (e.touches.length === 2) {
                        this.handlePinch(e);
                    }
                }, { passive: false });
                
                this.videoPlayer.addEventListener('touchend', () => {
                    this.resetPinch();
                });
                
                this.videoPlayer.addEventListener('timeupdate', () => {
                    this.updateTimeDisplay();
                });
                
                this.videoPlayer.addEventListener('play', () => {
                    this.playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
                    this.hideCenterPlayButton();
                    this.hideThumbnail();
                });
                
                this.videoPlayer.addEventListener('pause', () => {
                    this.playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
                });
                
                this.videoPlayer.addEventListener('waiting', () => {
                    this.showLoadingSpinner();
                });
                
                this.videoPlayer.addEventListener('playing', () => {
                    this.hideLoadingSpinner();
                });
                
                this.videoPlayer.addEventListener('loadedmetadata', () => {
                    this.videoLoaded = true;
                    this.hideLoadingSpinner();
                    
                    
                    if (this.isLandscape && !this.autoplayAttempted) {
                        this.autoplayAttempted = true;
                        this.videoPlayer.play().then(() => {
                            this.hideCenterPlayButton();
                        }).catch(e => {
                            this.showCenterPlayButton();
                            console.log("Autoplay blocked:", e);
                        });
                    }
                });
                
                this.videoPlayer.addEventListener('error', () => {
                    this.showAlert("Playback Error", "Failed to load the video. Please check the URL.");
                    this.hideLoadingSpinner();
                });
                
                
                this.volumeSlider.addEventListener('input', () => {
                    this.videoPlayer.volume = this.volumeSlider.value;
                    this.volumeValue.textContent = `${Math.round(this.volumeSlider.value * 100)}%`;
                    this.videoPlayer.muted = (this.volumeSlider.value == 0);
                    this.updateMuteButton();
                });
                
                this.brightnessSlider.addEventListener('input', () => {
                    this.videoPlayer.style.filter = `brightness(${this.brightnessSlider.value})`;
                    this.brightnessValue.textContent = `${Math.round(this.brightnessSlider.value * 100)}%`;
                });
                
                this.speedSlider.addEventListener('input', () => {
                    this.videoPlayer.playbackRate = this.speedSlider.value;
                    this.speedValue.textContent = `${this.speedSlider.value}x`;
                });
                
                this.videoInfoBtn.addEventListener('click', () => {
                    this.hideSettings();
                    setTimeout(() => {
                        this.showAlert("Video Details", `Video Quality: Default\nResolution: ${this.videoPlayer.videoWidth}x${this.videoPlayer.videoHeight}\nDuration: ${this.formatTime(this.videoPlayer.duration)}`);
                    }, 300);
                });
                
                this.aboutBtn.addEventListener('click', () => {
                    this.hideSettings();
                    setTimeout(() => {
                        this.showAlert("About Player", "VPL by Ankit Mehta\nA video player with smooth viewing experience. no distractions, pure playback.");
                    }, 300);
                });
                
                this.alertOkBtn.addEventListener('click', () => {
                    this.hideAlert();
                });
                
                this.alertCancelBtn.addEventListener('click', () => {
                    this.hideAlert();
                });
                
                window.addEventListener('resize', () => {
                    this.checkOrientation();
                });
                
                window.addEventListener('orientationchange', () => {
                    this.checkOrientation();
                });
                
                document.addEventListener('click', (e) => {
                    if (!this.settingsPanel.contains(e.target) && e.target !== this.settingsBtn) {
                        this.hideSettings();
                    }
                });
                

                window.addEventListener('DOMContentLoaded', () => {
                    if (window.self !== window.top) {
                        document.body.innerHTML = '';
                        document.write('This page cannot be embedded');
                    }
                });
                

                document.addEventListener('DOMContentLoaded', () => {
                    setTimeout(() => {
                        if (!document.fullscreenElement && this.isLandscape) {
                            document.documentElement.requestFullscreen().catch(e => {
                                console.log("Fullscreen error:", e);
                            });
                        }
                    }, 500);
                });
            }
            
            /**
             * Check device orientation and adjust UI accordingly
             */
            checkOrientation() {
                this.isLandscape = window.innerWidth > window.innerHeight;
                if (this.isLandscape) {
                    this.orientationPrompt.style.display = 'none';
                    if (!this.videoPlayer.paused) this.showControls();
                    
                    if (this.videoPlayer.paused && this.videoPlayer.readyState > 2 && !this.autoplayAttempted) {
                        this.autoplayAttempted = true;
                        this.videoPlayer.play().then(() => {
                            this.hideCenterPlayButton();
                        }).catch(e => {
                            this.showCenterPlayButton();
                            console.log("Autoplay blocked:", e);
                        });
                    }
                    
                    if (!document.fullscreenElement) {
                        document.documentElement.requestFullscreen().catch(e => {
                            console.log("Fullscreen error:", e);
                        });
                    }
                } else {
                    this.orientationPrompt.style.display = 'flex';
                    this.videoPlayer.pause();
                    this.playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
                    this.hideControls();
                    this.hideSettings();
                }
            }
            
            /**
             * Show video controls
             */
            showControls() {
                if (!this.isLandscape) return;
                this.controlsContainer.classList.add('visible');
                clearTimeout(this.controlsTimeout);
                this.controlsTimeout = setTimeout(() => this.hideControls(), 3000);
            }
            
            /**
             * Hide video controls
             */
            hideControls() {
                this.controlsContainer.classList.remove('visible');
            }
            
            /**
             * Toggle video controls visibility
             */
            toggleControls() {
                if (this.controlsContainer.classList.contains('visible')) {
                    this.hideControls();
                } else {
                    this.showControls();
                }
            }
            
            /**
             * Show settings panel
             */
            showSettings() {
                this.settingsPanel.classList.add('show');
                this.hideControls();
            }
            
            /**
             * Hide settings panel
             */
            hideSettings() {
                this.settingsPanel.classList.remove('show');
            }
            
            /**
             * Toggle settings panel visibility
             */
            toggleSettings() {
                if (this.settingsPanel.classList.contains('show')) {
                    this.hideSettings();
                } else {
                    this.showSettings();
                }
            }
            
            /**
             * Format time in MM:SS format
             * @param {number} seconds - Time in seconds
             * @returns {string} - Formatted time string
             */
            formatTime(seconds) {
                if (isNaN(seconds)) return '00:00';
                const minutes = Math.floor(seconds / 60);
                const secs = Math.floor(seconds % 60);
                return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
            }
            
            /**
             * Update time display and progress bar
             */
            updateTimeDisplay() {
                this.timeDisplay.textContent = `${this.formatTime(this.videoPlayer.currentTime)} / ${this.formatTime(this.videoPlayer.duration)}`;
                this.progressBar.style.width = `${(this.videoPlayer.currentTime / this.videoPlayer.duration) * 100}%`;
            }
            
            /**
             * Show seek indicator (+10s/-10s)
             * @param {number} seconds - Seconds to seek
             */
            showSeekIndicator(seconds) {
                this.seekIndicator.textContent = `${seconds > 0 ? '+' : ''}${seconds}s`;
                this.seekIndicator.classList.add('show');
                setTimeout(() => this.seekIndicator.classList.remove('show'), 1000);
            }
            
            /**
             * Toggle play/pause state
             */
            togglePlayPause() {
                if (!this.isLandscape) return;
                if (this.videoPlayer.paused) {
                    this.videoPlayer.play().then(() => {
                        this.playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
                        this.showControls();
                        this.hideCenterPlayButton();
                    }).catch(e => {
                        this.showAlert("Playback Error", "Please interact with the page first to play video.");
                    });
                } else {
                    this.videoPlayer.pause();
                    this.playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
                    this.showControls();
                }
            }
            
            /**
             * Toggle mute state
             */
            toggleMute() {
                this.videoPlayer.muted = !this.videoPlayer.muted;
                this.updateMuteButton();
            }
            
            /**
             * Update mute button icon based on current state
             */
            updateMuteButton() {
                if (this.videoPlayer.muted || this.videoPlayer.volume == 0) {
                    this.muteBtn.innerHTML = '<i class="fas fa-volume-mute"></i>';
                    this.volumeSlider.value = 0;
                    this.volumeValue.textContent = '0%';
                } else {
                    this.muteBtn.innerHTML = '<i class="fas fa-volume-up"></i>';
                    this.volumeSlider.value = this.videoPlayer.volume;
                    this.volumeValue.textContent = `${Math.round(this.videoPlayer.volume * 100)}%`;
                }
            }
            
            /**
             * Seek video by specified seconds
             * @param {number} seconds - Seconds to seek (positive or negative)
             */
            seek(seconds) {
                this.videoPlayer.currentTime += seconds;
                this.showSeekIndicator(seconds);
            }
            
            /**
             * Toggle fullscreen mode
             */
            toggleFullscreen() {
                if (document.fullscreenElement) {
                    document.exitFullscreen();
                } else {
                    document.documentElement.requestFullscreen();
                }
            }
            
            /**
             * Handle pinch-to-zoom gesture
             * @param {TouchEvent} e - Touch event
             */
            handlePinch(e) {
                e.preventDefault();
                if (e.touches.length === 2) {
                    const touch1 = e.touches[0];
                    const touch2 = e.touches[1];
                    const currentDistance = Math.hypot(
                        touch2.clientX - touch1.clientX,
                        touch2.clientY - touch1.clientY
                    );
                    
                    if (this.initialDistance === null) {
                        this.initialDistance = currentDistance;
                    } else {
                        const scale = currentDistance / this.initialDistance;
                        this.updateZoom(this.currentZoom * scale);
                        this.initialDistance = currentDistance;
                    }
                }
            }
            
            /**
             * Reset pinch-to-zoom tracking
             */
            resetPinch() {
                this.initialDistance = null;
            }
            
            /**
             * Update zoom level and video transform
             * @param {number} scale - New zoom scale
             */
            updateZoom(scale) {
                this.currentZoom = Math.max(1, Math.min(3, scale));
                this.videoPlayer.style.transform = `scale(${this.currentZoom})`;
                this.videoPlayer.style.transformOrigin = 'center center';
                this.zoomLevel.textContent = `${Math.round(this.currentZoom * 100)}%`;
                this.zoomLevel.classList.add('show');
                setTimeout(() => this.zoomLevel.classList.remove('show'), 1000);
            }
            
            /**
             * Check if video URL is valid
             * @param {string} url - Video URL to check
             * @returns {boolean} - True if valid, false otherwise
             */
            checkVideoUrl(url) {
                if (!url) {
                    this.showAlert("Invalid URL", "No video URL provided in query parameter 'q'");
                    return false;
                }
                
                const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.m3u8', '.mkv'];
                const isValid = videoExtensions.some(ext => url.includes(ext)) || 
                              url.includes('youtube.com') || 
                              url.includes('youtu.be');
                
                if (!isValid) {
                    this.showAlert("Invalid Video", "The provided URL doesn't seem to be a valid video file.");
                    return false;
                }
                
                return true;
            }
            
            /**
             * Show custom alert dialog
             * @param {string} title - Alert title
             * @param {string} message - Alert message
             */
            showAlert(title, message) {
                this.alertHeader.innerHTML = `<span>${title}</span>`;
                this.alertContent.textContent = message;
                this.customAlert.classList.add('show');
            }
            
            /**
             * Hide custom alert dialog
             */
            hideAlert() {
                this.customAlert.classList.remove('show');
            }
            
            /**
             * Show center play button (when autoplay fails)
             */
            showCenterPlayButton() {
                this.playCenterBtn.classList.add('visible');
            }
            
            /**
             * Hide center play button
             */
            hideCenterPlayButton() {
                this.playCenterBtn.classList.remove('visible');
            }
            
            /**
             * Show video thumbnail overlay
             */
            showThumbnail() {
                this.thumbnailOverlay.style.display = 'flex';
            }
            
            /**
             * Hide video thumbnail overlay
             */
            hideThumbnail() {
                this.thumbnailOverlay.style.display = 'none';
            }
            
            /**
             * Show loading spinner if
             */
            showLoadingSpinner() {
                this.loadingSpinner.style.display = 'block';
            }
            
            /**
             * Hide loading if
             */
            hideLoadingSpinner() {
                this.loadingSpinner.style.display = 'none';
            }
        }
        
        document.addEventListener('DOMContentLoaded', () => {
            const player = new VideoPlayer();
            
            window.player = player;
        });
