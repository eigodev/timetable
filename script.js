// Configuration
const START_HOUR = 8; // 8 AM
const END_HOUR = 22; // 10 PM (22:00)
const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// LocalStorage key (fallback)
const STORAGE_KEY = 'timetable_schedules';

// Teachers list
const TEACHERS = [
    'Bruno', 'Carol', 'Deluca', 'Ester', 'Leandro', 'Lesley', 
    'Livia', 'Nataly', 'Nino', 'Pedro', 'Priscilla', 'Ricardo', 
    'Samuel', 'Thiago', 'Vickie'
];

// Store schedules for all teachers: { teacherName: { 'day-hour': state } }
const teacherSchedules = {};

// Current selected teacher
let currentTeacher = null;

// Store slot states for current teacher (working copy)
let slotStates = {};

// State cycling order for left-click
const STATE_CYCLE = [null, 'available', 'unavailable'];

// Context menu
let contextMenu = null;
let currentSlot = null;

// Cloudflare API endpoint
const API_ENDPOINT = '/api/schedules';

// Polling interval for checking updates (in milliseconds)
const POLL_INTERVAL = 2000; // 2 seconds - faster polling for better sync

// Track if we're currently saving
let isSaving = false;

// Track last update timestamp to prevent unnecessary updates
let lastUpdateTimestamp = null;

// Debounce timer for saving
let saveTimer = null;

// Polling timer for checking updates
let pollTimer = null;

// Track if status update is pending
let statusUpdateTimer = null;

// Update sync status indicator
function updateSyncStatus(status, message) {
    const syncStatus = document.getElementById('syncStatus');
    const syncIcon = document.getElementById('syncIcon');
    const syncText = document.getElementById('syncText');
    
    if (!syncStatus) return;
    
    // Don't override "Saving to cloud..." status while saving
    if (isSaving && status !== 'syncing' && syncText.textContent.includes('Saving')) {
        return;
    }
    
    syncStatus.className = 'sync-status ' + status;
    syncIcon.className = status === 'syncing' ? 'syncing' : '';
    syncText.textContent = message;
}

// Load all schedules from Cloudflare KV or localStorage
async function loadAllSchedules() {
    try {
        updateSyncStatus('syncing', 'Syncing with cloud...');
        
        const response = await fetch(API_ENDPOINT, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        
        if (response.ok) {
            const data = await response.json();
            
            if (data.success) {
                if (data.schedules) {
                    Object.assign(teacherSchedules, data.schedules);
                }
                lastUpdateTimestamp = data.lastUpdated;
                
                // Start polling for updates
                startPolling();
                
                updateSyncStatus('synced', '✓ Cloud sync active');
            } else {
                // API returned error
                const errorMsg = data.error || 'Unknown error';
                console.error('API Error:', errorMsg);
                if (errorMsg.includes('KV_SCHEDULES not configured')) {
                    updateSyncStatus('local-only', '⚠ KV not configured - see CLOUDFLARE_SETUP.md');
                } else {
                    updateSyncStatus('local-only', '⚠ Cloud error - using local storage');
                }
                // Fallback to localStorage
                loadAllSchedulesLocal();
            }
        } else {
            // Get error details
            let errorDetails = `HTTP ${response.status}`;
            try {
                const errorData = await response.json();
                if (errorData.error) {
                    errorDetails = errorData.error;
                }
            } catch (e) {
                // Couldn't parse error
            }
            
            throw new Error(errorDetails);
        }
    } catch (error) {
        console.error('Error loading schedules from Cloudflare:', error);
        
        // Check if it's a network error or API error
        let statusMessage = '⚠ Offline mode (localStorage only)';
        if (error.message.includes('KV_SCHEDULES not configured')) {
            statusMessage = '⚠ KV not configured - check Pages settings';
        } else if (error.message.includes('HTTP 404')) {
            statusMessage = '⚠ API not found - check function path';
        } else if (error.message.includes('HTTP 503')) {
            statusMessage = '⚠ KV not bound - see CLOUDFLARE_SETUP.md';
        }
        
        updateSyncStatus('local-only', statusMessage);
        // Fallback to localStorage
        loadAllSchedulesLocal();
    }
}

// Start polling for updates from other devices
function startPolling() {
    // Clear any existing polling
    if (pollTimer) {
        clearInterval(pollTimer);
    }
    
    console.log('Starting polling for updates every', POLL_INTERVAL / 1000, 'seconds');
    
    // Poll every few seconds for updates
    pollTimer = setInterval(async () => {
        // Don't poll while we're saving
        if (isSaving) {
            return;
        }
        
        try {
            const response = await fetch(API_ENDPOINT + '?t=' + Date.now(), {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                cache: 'no-cache',
            });
            
            if (response.ok) {
                const data = await response.json();
                
                if (data.success && data.schedules) {
                    // Always update timestamp (even if data hasn't changed)
                    const timestampChanged = data.lastUpdated && data.lastUpdated !== lastUpdateTimestamp;
                    
                    // Compare data to see if it changed
                    const localSchedulesStr = JSON.stringify(teacherSchedules);
                    const remoteSchedulesStr = JSON.stringify(data.schedules);
                    const dataChanged = localSchedulesStr !== remoteSchedulesStr;
                    
                    // Update if timestamp changed (means someone else made changes)
                    if (timestampChanged) {
                        console.log('Timestamp changed - checking for updates');
                        
                        if (dataChanged) {
                            console.log('Data changed - updating from cloud');
                            // Update local schedules with remote data
                            Object.assign(teacherSchedules, data.schedules);
                            lastUpdateTimestamp = data.lastUpdated;
                            
                            // If current teacher is selected, refresh their calendar
                            if (currentTeacher) {
                                loadTeacherSchedule(currentTeacher);
                                refreshCalendarDisplay();
                                updateSummary();
                            }
                            
                            updateSyncStatus('synced', '✓ Updated from cloud');
                            setTimeout(() => {
                                updateSyncStatus('synced', 'Cloud sync active');
                            }, 2000);
                        } else {
                            // Timestamp changed but data is same - just update timestamp
                            lastUpdateTimestamp = data.lastUpdated;
                            console.log('Timestamp updated, data unchanged');
                        }
                    }
                } else if (data.success && !data.schedules) {
                    // Empty schedules - update timestamp
                    lastUpdateTimestamp = data.lastUpdated;
                }
            } else {
                console.error('Polling failed with status:', response.status);
            }
        } catch (error) {
            // Silent error - don't show error for polling failures
            console.error('Polling error:', error);
        }
    }, POLL_INTERVAL);
}

// Load from localStorage (fallback)
function loadAllSchedulesLocal() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            const parsed = JSON.parse(saved);
            Object.assign(teacherSchedules, parsed);
        }
    } catch (error) {
        console.error('Error loading schedules from localStorage:', error);
    }
}

// Save all schedules to Cloudflare KV or localStorage (with debouncing)
function saveAllSchedules() {
    // Don't queue another save if we're already saving
    if (isSaving) {
        return;
    }
    
    // Clear any pending save
    if (saveTimer) {
        clearTimeout(saveTimer);
    }
    
    // Debounce saves - wait 800ms before actually saving
    saveTimer = setTimeout(async () => {
        saveTimer = null; // Clear timer reference
        await performSave();
    }, 800);
}

// Actually perform the save operation
async function performSave() {
    // Clear any pending status updates
    if (statusUpdateTimer) {
        clearTimeout(statusUpdateTimer);
        statusUpdateTimer = null;
    }
    
    try {
        isSaving = true;
        updateSyncStatus('syncing', 'Saving to cloud...');
        
        console.log('Saving schedules to cloud...', Object.keys(teacherSchedules).length, 'teachers');
        
        const response = await fetch(API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                schedules: teacherSchedules,
            }),
        });
        
        if (response.ok) {
            const data = await response.json();
            
            if (data.success) {
                lastUpdateTimestamp = data.lastUpdated;
                console.log('Successfully saved to cloud. Timestamp:', data.lastUpdated);
                
                // Also save to localStorage as backup (even when cloud save succeeds)
                saveAllSchedulesLocal();
                
                // Update status after a short delay
                statusUpdateTimer = setTimeout(() => {
                    isSaving = false;
                    updateSyncStatus('synced', '✓ Saved to cloud');
                    
                    // Reset to normal status after a delay
                    statusUpdateTimer = setTimeout(() => {
                        updateSyncStatus('synced', 'Cloud sync active');
                        statusUpdateTimer = null;
                    }, 1500);
                }, 300);
            } else {
                throw new Error(data.error || 'Save failed');
            }
        } else {
            // Get error details from response
            let errorDetails = `HTTP ${response.status}`;
            try {
                const errorData = await response.json();
                if (errorData?.error) {
                    errorDetails = errorData.error;
                    console.error('API Error:', errorData);
                }
            } catch (e) {
                // Couldn't parse error response
            }
            throw new Error(errorDetails);
        }
    } catch (error) {
        console.error('Error saving schedules to Cloudflare:', error);
        console.error('Error details:', error.message);
        
        isSaving = false;
        
        // Determine error message
        let errorMessage = 'Save failed';
        if (error.message.includes('KV_SCHEDULES not configured') || error.message.includes('503')) {
            errorMessage = 'KV not configured - check Pages settings';
        } else if (error.message.includes('404')) {
            errorMessage = 'API not found - check function deployment';
        } else if (error.message) {
            errorMessage = error.message;
        }
        
        updateSyncStatus('local-only', `⚠ ${errorMessage} - using local storage`);
        
        // Still save locally as fallback
        saveAllSchedulesLocal();
    }
}

// Save to localStorage (fallback)
function saveAllSchedulesLocal() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(teacherSchedules));
    } catch (error) {
        console.error('Error saving schedules to localStorage:', error);
    }
}

// Initialize teachers sidebar
async function initTeachers() {
    // Load schedules (will wait for Firebase if available)
    await loadAllSchedules();
    
    const teacherList = document.getElementById('teacherList');
    
    TEACHERS.forEach(teacher => {
        // Initialize empty schedule for each teacher if not already loaded
        if (!teacherSchedules[teacher]) {
            teacherSchedules[teacher] = {};
        }
        
        const teacherItem = document.createElement('div');
        teacherItem.className = 'teacher-item';
        teacherItem.textContent = teacher;
        teacherItem.dataset.teacher = teacher;
        
        teacherItem.addEventListener('click', () => {
            selectTeacher(teacher);
        });
        
        teacherList.appendChild(teacherItem);
    });
    
    // Select first teacher by default
    if (TEACHERS.length > 0) {
        selectTeacher(TEACHERS[0]);
    }
}

// Select a teacher and load their schedule
function selectTeacher(teacherName) {
    // Save current teacher's schedule before switching
    if (currentTeacher) {
        saveTeacherSchedule(currentTeacher);
    }
    
    // Update current teacher
    currentTeacher = teacherName;
    
    // Update UI
    document.querySelectorAll('.teacher-item').forEach(item => {
        item.classList.remove('active');
        if (item.dataset.teacher === teacherName) {
            item.classList.add('active');
        }
    });
    
    document.getElementById('currentTeacherName').textContent = `${teacherName}'s Schedule`;
    
    // Load teacher's schedule
    loadTeacherSchedule(teacherName);
    
    // Refresh calendar display
    refreshCalendarDisplay();
    updateSummary();
}

// Save current schedule to teacherSchedules
function saveTeacherSchedule(teacherName) {
    teacherSchedules[teacherName] = { ...slotStates };
    // Save to Cloudflare (will also save to localStorage as backup)
    saveAllSchedules();
}

// Load schedule from teacherSchedules
function loadTeacherSchedule(teacherName) {
    slotStates = teacherSchedules[teacherName] ? { ...teacherSchedules[teacherName] } : {};
}

// Initialize the calendar
function initCalendar() {
    const timeSlotsContainer = document.getElementById('timeSlots');
    
    // Initialize context menu
    contextMenu = document.getElementById('contextMenu');
    
    // Generate time slots for each hour
    for (let hour = START_HOUR; hour < END_HOUR; hour++) {
        // Time label
        const timeLabel = document.createElement('div');
        timeLabel.className = 'time-label';
        timeLabel.textContent = formatHour(hour);
        timeSlotsContainer.appendChild(timeLabel);
        
        // Time slots for each day
        DAYS.forEach((day, dayIndex) => {
            const slot = document.createElement('div');
            slot.className = 'time-slot';
            slot.dataset.day = day;
            slot.dataset.hour = hour;
            
            // Left click: cycle through states
            slot.addEventListener('click', (e) => {
                if (e.button === 0 || !e.button) { // Left click
                    cycleSlotState(day, hour);
                }
            });
            
            // Right click: show context menu
            slot.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                showContextMenu(e, day, hour);
            });
            
            timeSlotsContainer.appendChild(slot);
        });
    }
    
    // Close context menu when clicking elsewhere
    document.addEventListener('click', () => {
        hideContextMenu();
    });
    
    // Handle context menu item clicks
    document.querySelectorAll('.context-menu-item').forEach(item => {
        item.addEventListener('click', (e) => {
            const color = item.dataset.color;
            if (currentSlot) {
                setSlotState(currentSlot.day, currentSlot.hour, color === 'clear' ? null : color);
                hideContextMenu();
            }
        });
    });
}

// Refresh calendar display based on current slotStates
function refreshCalendarDisplay() {
    DAYS.forEach(day => {
        for (let hour = START_HOUR; hour < END_HOUR; hour++) {
            const key = `${day}-${hour}`;
            const state = slotStates[key] || null;
            const slot = document.querySelector(`[data-day="${day}"][data-hour="${hour}"]`);
            
            if (slot) {
                // Remove all state classes
                slot.classList.remove('state-available', 'state-unavailable', 'state-navy', 'state-cyan', 'state-magenta', 'state-salmon');
                
                // Add current state class
                if (state) {
                    slot.classList.add(`state-${state}`);
                }
            }
        }
    });
}

// Format hour for display (e.g., 8 -> "8:00 AM", 13 -> "1:00 PM")
function formatHour(hour) {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : (hour === 0 ? 12 : hour);
    return `${displayHour}:00 ${period}`;
}

// Get current state of a slot
function getSlotState(day, hour) {
    const key = `${day}-${hour}`;
    return slotStates[key] || null;
}

// Set state of a slot
function setSlotState(day, hour, state) {
    if (!currentTeacher) return;
    
    const key = `${day}-${hour}`;
    const slot = document.querySelector(`[data-day="${day}"][data-hour="${hour}"]`);
    
    if (!slot) return;
    
    // Remove all state classes
    slot.classList.remove('state-available', 'state-unavailable', 'state-navy', 'state-cyan', 'state-magenta', 'state-salmon');
    
    if (state) {
        slotStates[key] = state;
        slot.classList.add(`state-${state}`);
    } else {
        slotStates[key] = null;
    }
    
    // Save to teacher schedule and localStorage
    saveTeacherSchedule(currentTeacher);
    
    updateSummary();
}

// Cycle through states on left click: null -> available -> unavailable -> null
function cycleSlotState(day, hour) {
    if (!currentTeacher) return;
    
    const currentState = getSlotState(day, hour);
    const currentIndex = STATE_CYCLE.indexOf(currentState);
    const nextIndex = (currentIndex + 1) % STATE_CYCLE.length;
    const nextState = STATE_CYCLE[nextIndex];
    
    setSlotState(day, hour, nextState);
}

// Show context menu on right click
function showContextMenu(event, day, hour) {
    if (!currentTeacher) return;
    
    currentSlot = { day, hour };
    contextMenu.classList.add('show');
    
    // Position menu near cursor
    contextMenu.style.left = `${event.pageX}px`;
    contextMenu.style.top = `${event.pageY}px`;
    
    // Adjust if menu goes off screen
    setTimeout(() => {
        const rect = contextMenu.getBoundingClientRect();
        if (rect.right > window.innerWidth) {
            contextMenu.style.left = `${event.pageX - rect.width}px`;
        }
        if (rect.bottom > window.innerHeight) {
            contextMenu.style.top = `${event.pageY - rect.height}px`;
        }
    }, 0);
}

// Hide context menu
function hideContextMenu() {
    if (contextMenu) {
        contextMenu.classList.remove('show');
    }
    currentSlot = null;
}

// Update the summary panel - show only Available slots
function updateSummary() {
    if (!currentTeacher) return;
    
    const summaryContent = document.getElementById('summaryContent');
    
    // Only collect available slots
    const availableSlots = {};
    
    DAYS.forEach(day => {
        for (let hour = START_HOUR; hour < END_HOUR; hour++) {
            const state = getSlotState(day, hour);
            if (state === 'available') {
                if (!availableSlots[day]) {
                    availableSlots[day] = [];
                }
                availableSlots[day].push(hour);
            }
        }
    });
    
    // Check if there are any available slots
    const hasAvailable = Object.values(availableSlots).some(hours => hours.length > 0);
    
    if (!hasAvailable) {
        summaryContent.innerHTML = '<p class="empty-message">No available hours selected yet. Left-click to mark available time slots.</p>';
        return;
    }
    
    let html = '';
    
    // Only show Available section
    html += '<div class="day-summary" style="border-left-color: #6b8e23;">';
    html += '<h3 style="color: #6b8e23;">Available</h3>';
    
    DAYS.forEach(day => {
        if (availableSlots[day] && availableSlots[day].length > 0) {
            html += `<div style="margin-bottom: 8px;"><strong>${day}:</strong> `;
            const ranges = groupConsecutiveHours(availableSlots[day]);
            html += ranges.map(range => {
                if (range.start === range.end) {
                    return formatHour(range.start);
                } else {
                    return `${formatHour(range.start)} - ${formatHour(range.end + 1)}`;
                }
            }).join(', ');
            html += '</div>';
        }
    });
    
    html += '</div>';
    
    summaryContent.innerHTML = html;
}

// Group consecutive hours into ranges
function groupConsecutiveHours(hours) {
    if (hours.length === 0) return [];
    
    const sortedHours = [...hours].sort((a, b) => a - b);
    const ranges = [];
    let start = sortedHours[0];
    let end = sortedHours[0];
    
    for (let i = 1; i < sortedHours.length; i++) {
        if (sortedHours[i] === end + 1) {
            end = sortedHours[i];
        } else {
            ranges.push({ start, end });
            start = sortedHours[i];
            end = sortedHours[i];
        }
    }
    
    ranges.push({ start, end });
    return ranges;
}

// Select all time slots as available
function selectAll() {
    if (!currentTeacher) return;
    
    for (let hour = START_HOUR; hour < END_HOUR; hour++) {
        DAYS.forEach(day => {
            const key = `${day}-${hour}`;
            const slot = document.querySelector(`[data-day="${day}"][data-hour="${hour}"]`);
            
            if (slot) {
                slot.classList.remove('state-available', 'state-unavailable', 'state-navy', 'state-cyan', 'state-magenta', 'state-salmon');
                slotStates[key] = 'available';
                slot.classList.add('state-available');
            }
        });
    }
    
    // Save once after all changes
    saveTeacherSchedule(currentTeacher);
    updateSummary();
}

// Clear all selections
function clearAll() {
    if (!currentTeacher) return;
    
    for (let hour = START_HOUR; hour < END_HOUR; hour++) {
        DAYS.forEach(day => {
            const key = `${day}-${hour}`;
            const slot = document.querySelector(`[data-day="${day}"][data-hour="${hour}"]`);
            
            if (slot) {
                slot.classList.remove('state-available', 'state-unavailable', 'state-navy', 'state-cyan', 'state-magenta', 'state-salmon');
                slotStates[key] = null;
            }
        });
    }
    
    // Save once after all changes
    saveTeacherSchedule(currentTeacher);
    updateSummary();
}

// Export schedule as text
function exportSchedule() {
    if (!currentTeacher) {
        alert('Please select a teacher first.');
        return;
    }
    
    // Save current schedule before exporting
    saveTeacherSchedule(currentTeacher);
    
    let text = `${currentTeacher.toUpperCase()}'S TEACHING AVAILABILITY SCHEDULE\n`;
    text += '='.repeat(50) + '\n\n';
    
    const stateLabels = {
        available: 'Available',
        unavailable: 'Unavailable',
        navy: 'Home Teachers',
        cyan: 'Home Teachers (extra)',
        magenta: 'SpeakOn',
        salmon: 'SpeakOn (extra)'
    };
    
    let hasSelections = false;
    
    Object.keys(stateLabels).forEach(state => {
        const days = {};
        
        DAYS.forEach(day => {
            const hours = [];
            for (let hour = START_HOUR; hour < END_HOUR; hour++) {
                if (getSlotState(day, hour) === state) {
                    hours.push(hour);
                }
            }
            if (hours.length > 0) {
                days[day] = hours;
                hasSelections = true;
            }
        });
        
        if (Object.keys(days).length > 0) {
            text += `${stateLabels[state]}:\n`;
            text += '-'.repeat(30) + '\n';
            
            DAYS.forEach(day => {
                if (days[day] && days[day].length > 0) {
                    text += `  ${day}:\n`;
                    const ranges = groupConsecutiveHours(days[day]);
                    ranges.forEach(range => {
                        if (range.start === range.end) {
                            text += `    - ${formatHour(range.start)}\n`;
                        } else {
                            text += `    - ${formatHour(range.start)} - ${formatHour(range.end + 1)}\n`;
                        }
                    });
                }
            });
            text += '\n';
        }
    });
    
    if (!hasSelections) {
        text += 'No hours selected.\n';
    }
    
    // Create and download file
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentTeacher}-availability.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    alert('Schedule exported! Check the downloaded file.');
}

// Export schedule as PDF
function exportSchedulePDF() {
    if (!currentTeacher) {
        alert('Please select a teacher first.');
        return;
    }
    
    // Save current schedule before exporting
    saveTeacherSchedule(currentTeacher);
    
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Colors for PDF (RGB values)
    const stateColors = {
        available: [107, 142, 35],      // Olive green
        unavailable: [139, 0, 0],        // Dark red
        navy: [0, 0, 128],               // Navy blue
        cyan: [0, 188, 212],             // Cyan
        magenta: [255, 0, 255],          // Magenta
        salmon: [250, 128, 114]          // Salmon
    };
    
    const stateLabels = {
        available: 'Available',
        unavailable: 'Unavailable',
        navy: 'Home Teachers',
        cyan: 'Home Teachers (extra)',
        magenta: 'SpeakOn',
        salmon: 'SpeakOn (extra)'
    };
    
    // Title
    doc.setFontSize(18);
    doc.setTextColor(255, 102, 0);
    doc.text(`${currentTeacher}'s Teaching Availability`, 105, 20, { align: 'center' });
    
    // Date
    const now = new Date();
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated: ${now.toLocaleDateString()} ${now.toLocaleTimeString()}`, 105, 28, { align: 'center' });
    
    let yPos = 40;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 20;
    const maxWidth = 170;
    let hasSelections = false;
    
    // Organize data by state
    Object.keys(stateLabels).forEach(state => {
        const days = {};
        
        DAYS.forEach(day => {
            const hours = [];
            for (let hour = START_HOUR; hour < END_HOUR; hour++) {
                if (getSlotState(day, hour) === state) {
                    hours.push(hour);
                }
            }
            if (hours.length > 0) {
                days[day] = hours;
                hasSelections = true;
            }
        });
        
        if (Object.keys(days).length > 0) {
            // Check if we need a new page
            if (yPos > pageHeight - 40) {
                doc.addPage();
                yPos = 20;
            }
            
            // Section header with color
            const color = stateColors[state];
            doc.setFillColor(color[0], color[1], color[2]);
            doc.rect(margin, yPos - 5, maxWidth, 8, 'F');
            
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(12);
            doc.setFont(undefined, 'bold');
            doc.text(stateLabels[state], margin + 2, yPos + 2);
            
            yPos += 12;
            
            // Days and hours
            DAYS.forEach(day => {
                if (days[day] && days[day].length > 0) {
                    // Check if we need a new page
                    if (yPos > pageHeight - 30) {
                        doc.addPage();
                        yPos = 20;
                    }
                    
                    doc.setFontSize(10);
                    doc.setTextColor(70, 70, 70);
                    doc.setFont(undefined, 'bold');
                    doc.text(day + ':', margin + 5, yPos);
                    
                    const ranges = groupConsecutiveHours(days[day]);
                    let timeText = ranges.map(range => {
                        if (range.start === range.end) {
                            return formatHour(range.start);
                        } else {
                            return `${formatHour(range.start)} - ${formatHour(range.end + 1)}`;
                        }
                    }).join(', ');
                    
                    doc.setFont(undefined, 'normal');
                    doc.text(timeText, margin + 45, yPos);
                    
                    yPos += 7;
                }
            });
            
            yPos += 5; // Space between sections
        }
    });
    
    if (!hasSelections) {
        doc.setTextColor(150, 150, 150);
        doc.setFontSize(12);
        doc.text('No hours selected.', margin, yPos);
    }
    
    // Save the PDF
    doc.save(`${currentTeacher}-availability.pdf`);
    alert('PDF exported successfully!');
}

// Event listeners
document.addEventListener('DOMContentLoaded', async () => {
    await initTeachers();
    initCalendar();
    
    document.getElementById('selectAllBtn').addEventListener('click', selectAll);
    document.getElementById('clearAllBtn').addEventListener('click', clearAll);
    document.getElementById('exportPdfBtn').addEventListener('click', exportSchedulePDF);
});

// Save schedules before page unload as a safety backup
window.addEventListener('beforeunload', () => {
    if (currentTeacher) {
        saveTeacherSchedule(currentTeacher);
    }
    
    // Clean up polling
    if (pollTimer) {
        clearInterval(pollTimer);
    }
});
