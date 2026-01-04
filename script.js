// Configuration
const START_HOUR = 8; // 8 AM
const END_HOUR = 22; // 10 PM (22:00)
const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// LocalStorage key (fallback)
const STORAGE_KEY = 'timetable_schedules';
const FIRESTORE_COLLECTION = 'timetable_schedules';

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

// Firebase real-time listener (to unsubscribe when needed)
let firestoreUnsubscribe = null;

// Track if we're currently saving (to prevent listener loops)
let isSaving = false;

// Debounce timer for saving
let saveTimer = null;

// Check if Firebase is available
function isFirebaseAvailable() {
    return window.firestoreFunctions && window.firestoreFunctions.db;
}

// Update sync status indicator
function updateSyncStatus(status, message) {
    const syncStatus = document.getElementById('syncStatus');
    const syncIcon = document.getElementById('syncIcon');
    const syncText = document.getElementById('syncText');
    
    if (!syncStatus) return;
    
    syncStatus.className = 'sync-status ' + status;
    syncIcon.className = status === 'syncing' ? 'syncing' : '';
    syncText.textContent = message;
}

// Load all schedules from Firestore or localStorage
async function loadAllSchedules() {
    if (isFirebaseAvailable()) {
        try {
            updateSyncStatus('syncing', 'Syncing with cloud...');
            
            const { db, doc, getDoc, collection, onSnapshot } = window.firestoreFunctions;
            const schedulesRef = doc(db, FIRESTORE_COLLECTION, 'all_schedules');
            
            // First, get current data
            const docSnap = await getDoc(schedulesRef);
            if (docSnap.exists()) {
                const data = docSnap.data();
                Object.assign(teacherSchedules, data.schedules || {});
            }
            
            // Set up real-time listener for changes from other devices
            firestoreUnsubscribe = onSnapshot(schedulesRef, (snapshot) => {
                // Ignore updates while we're saving (to prevent loop)
                if (isSaving) {
                    isSaving = false; // Reset flag
                    return;
                }
                
                if (snapshot.exists()) {
                    const data = snapshot.data();
                    const remoteSchedules = data.schedules || {};
                    
                    // Check if data actually changed before updating
                    const dataChanged = JSON.stringify(remoteSchedules) !== JSON.stringify(teacherSchedules);
                    
                    if (dataChanged) {
                        // Update local schedules
                        Object.assign(teacherSchedules, remoteSchedules);
                        
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
                    }
                }
            }, (error) => {
                console.error('Firestore listener error:', error);
                updateSyncStatus('local-only', '⚠ Offline mode (localStorage only)');
            });
            
            updateSyncStatus('synced', '✓ Cloud sync active');
        } catch (error) {
            console.error('Error loading schedules from Firestore:', error);
            updateSyncStatus('local-only', '⚠ Offline mode (localStorage only)');
            // Fallback to localStorage
            loadAllSchedulesLocal();
        }
    } else {
        updateSyncStatus('local-only', 'ℹ Local storage only (Firebase not configured)');
        // Fallback to localStorage
        loadAllSchedulesLocal();
    }
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

// Save all schedules to Firestore or localStorage (with debouncing)
function saveAllSchedules() {
    // Clear any pending save
    if (saveTimer) {
        clearTimeout(saveTimer);
    }
    
    // Debounce saves - wait 500ms before actually saving
    saveTimer = setTimeout(async () => {
        await performSave();
    }, 500);
}

// Actually perform the save operation
async function performSave() {
    if (isFirebaseAvailable()) {
        try {
            isSaving = true; // Set flag to prevent listener from triggering
            updateSyncStatus('syncing', 'Saving to cloud...');
            
            const { db, doc, setDoc } = window.firestoreFunctions;
            const schedulesRef = doc(db, FIRESTORE_COLLECTION, 'all_schedules');
            
            await setDoc(schedulesRef, {
                schedules: teacherSchedules,
                lastUpdated: new Date().toISOString()
            }, { merge: false });
            
            // Small delay before resetting flag to ensure listener sees it
            setTimeout(() => {
                isSaving = false;
                updateSyncStatus('synced', '✓ Saved');
                setTimeout(() => {
                    updateSyncStatus('synced', 'Cloud sync active');
                }, 1000);
            }, 200);
            
        } catch (error) {
            console.error('Error saving schedules to Firestore:', error);
            isSaving = false;
            updateSyncStatus('local-only', '⚠ Save failed, using local storage');
            // Fallback to localStorage
            saveAllSchedulesLocal();
        }
    } else {
        // Fallback to localStorage
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
    // Also save to localStorage
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

// Update the summary panel
function updateSummary() {
    if (!currentTeacher) return;
    
    const summaryContent = document.getElementById('summaryContent');
    
    // Organize by state
    const byState = {
        available: {},
        unavailable: {},
        navy: {},
        cyan: {},
        magenta: {},
        salmon: {}
    };
    
    DAYS.forEach(day => {
        for (let hour = START_HOUR; hour < END_HOUR; hour++) {
            const state = getSlotState(day, hour);
            if (state) {
                if (!byState[state][day]) {
                    byState[state][day] = [];
                }
                byState[state][day].push(hour);
            }
        }
    });
    
    // Check if there are any selections
    const hasSelections = Object.values(byState).some(dayObj => 
        Object.values(dayObj).some(hours => hours.length > 0)
    );
    
    if (!hasSelections) {
        summaryContent.innerHTML = '<p class="empty-message">No hours selected yet. Left-click to mark available/unavailable, or right-click for custom colors.</p>';
        return;
    }
    
    let html = '';
    
    const stateLabels = {
        available: { label: 'Available', color: '#6b8e23' },
        unavailable: { label: 'Unavailable', color: '#8b0000' },
        navy: { label: 'Home Teachers', color: '#000080' },
        cyan: { label: 'Home Teachers (extra)', color: '#00bcd4' },
        magenta: { label: 'SpeakOn', color: '#ff00ff' },
        salmon: { label: 'SpeakOn (extra)', color: '#fa8072' }
    };
    
    Object.keys(stateLabels).forEach(state => {
        const days = byState[state];
        const hasDays = Object.values(days).some(hours => hours.length > 0);
        
        if (hasDays) {
            html += `<div class="day-summary" style="border-left-color: ${stateLabels[state].color};">`;
            html += `<h3 style="color: ${stateLabels[state].color};">${stateLabels[state].label}</h3>`;
            
            DAYS.forEach(day => {
                if (days[day] && days[day].length > 0) {
                    html += `<div style="margin-bottom: 8px;"><strong>${day}:</strong> `;
                    const ranges = groupConsecutiveHours(days[day]);
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
        }
    });
    
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
    // Wait for Firebase to be ready (if configured)
    if (window.firebaseReady) {
        await initTeachers();
    } else {
        // Wait for Firebase initialization event
        window.addEventListener('firebaseReady', async () => {
            await initTeachers();
        }, { once: true });
        
        // If Firebase doesn't load within 2 seconds, proceed with localStorage
        setTimeout(async () => {
            if (!window.firebaseReady) {
                console.log('Firebase not configured, using localStorage fallback');
                await initTeachers();
            }
        }, 2000);
    }
    
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
    
    // Clean up Firestore listener
    if (firestoreUnsubscribe) {
        firestoreUnsubscribe();
    }
});
