let isMaintenanceMode = false;
let testScanCount = 0;
let sessionScanCount = 0;
let lastScans = {};

let rfidInput;
let isProcessingScan = false;

function ensureUserRegistry() {
    const existingUsers = JSON.parse(localStorage.getItem('wmsu_users')) || [];
    if (existingUsers.length === 0) {
        const defaultUsers = [
            { id: "2025-02697", name: "AGEAS, ROVHIC CHAWEE A.", firstName: "ROVHIC CHAWEE", lastName: "AGEAS", role: "Student", gender: "Male", year: "ACT-1", section: "1B", enrollDate: "Jan 12, 2024", status: "Active", curriculum: "ACT-AD", academicYear: "2024-2025", semester: "1st Semester" },
            { id: "2025-01218", name: "AHAMAD, AINEE HANA TAN.", firstName: "AINEE HANA", lastName: "AHAMAD", role: "Student", gender: "Female", year: "ACT-1", section: "1B", enrollDate: "Jan 12, 2024", status: "Active", curriculum: "ACT-AD", academicYear: "2024-2025", semester: "1st Semester" },
            { id: "2025-02972", name: "BAGARINAO, ONYX FERRER.", firstName: "ONYX", lastName: "BAGARINAO", role: "Student", gender: "Male", year: "ACT-1", section: "1B", enrollDate: "Jan 12, 2024", status: "Active", curriculum: "ACT-AD", academicYear: "2024-2025", semester: "1st Semester" },
            { id: "2025-02601", name: "VILLALOBOS, RURIK RAE RELLON.", firstName: "RURIK RAE", lastName: "VILLALOBOS", role: "Student", gender: "Male", year: "ACT-1", section: "1B", enrollDate: "Jan 12, 2024", status: "Active", curriculum: "ACT-AD", academicYear: "2024-2025", semester: "1st Semester" },
            { id: "2025-001", name: "ROJAS, MARJORIE", role: "Faculty", status: "Active", firstName: "MARJORIE", lastName: "ROJAS", gender: "Female", enrollDate: "Aug 20, 2023", section: "CCS" },
            { id: "2025-002", name: "LINES, MARVIC", role: "Faculty", status: "Active", firstName: "MARVIC", lastName: "LINES", gender: "Male", enrollDate: "Aug 20, 2023", section: "CCS" },
            { id: "2025-003", name: "BALLAHO, JAYDEE", role: "Faculty", status: "Active", firstName: "JAYDEE", lastName: "BALLAHO", gender: "Male", enrollDate: "Aug 20, 2023", section: "CCS" },
            { id: "2025-004", name: "BALAN, JOJEN", role: "Faculty", status: "Active", firstName: "JOJEN", lastName: "BALAN", gender: "Male", enrollDate: "Aug 20, 2023", section: "CCS" },
            { id: "2025-005", name: "RHAMIR, JAAFAR", role: "Faculty", status: "Active", firstName: "JAAFAR", lastName: "RHAMIR", gender: "Male", enrollDate: "Aug 20, 2023", section: "CCS" },
            { id: "2025-006", name: "MARTIN, BILLY JEAN", role: "Faculty", status: "Active", firstName: "BILLY JEAN", lastName: "MARTIN", gender: "Female", enrollDate: "Aug 20, 2023", section: "CCS" },
            { id: "2025-007", name: "REIGN RAIN, REIN", role: "Faculty", status: "Active", firstName: "REIN", lastName: "REIGN", gender: "Female", enrollDate: "Aug 20, 2023", section: "CCS" }
        ];
        localStorage.setItem('wmsu_users', JSON.stringify(defaultUsers));
    }
    if (!localStorage.getItem('wmsu_attendance')) {
        localStorage.setItem('wmsu_attendance', JSON.stringify([]));
    }
}

function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) {
        sidebar.classList.toggle('collapsed');
        localStorage.setItem('terminalSidebarCollapsed', sidebar.classList.contains('collapsed'));
    }
}

function applySidebarState() {
    const sidebar = document.querySelector('.sidebar');
    if (sidebar && localStorage.getItem('terminalSidebarCollapsed') === 'true') {
        sidebar.classList.add('collapsed');
    }
}

function openLogoutModal(e) {
    if (e) e.preventDefault();
    const modal = document.getElementById('logoutModal');
    if (modal) {
        modal.style.display = 'flex';
    }
}

function closeLogoutModal() {
    const modal = document.getElementById('logoutModal');
    if (modal) {
        modal.style.display = 'none';
    }
    focusScanner();
}

function confirmLogout() {
    window.location.href = 'Landing_page.html';
}

function closeStudentDetailsModal() {
    const modal = document.getElementById('studentDetailsModal');
    if (modal) {
        modal.style.display = 'none';
    }
    focusScanner();
}

function showStudentDetails(id) {
    const users = JSON.parse(localStorage.getItem('wmsu_users')) || [];
    const user = users.find(u => u.id === id);
    if (!user) return;

    const content = document.getElementById('studentDetailsContent');
    if (content) {
        content.innerHTML = `
            <div style="text-align: center; margin-bottom: 2rem;">
                <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || user.id)}&background=dc143c&color=fff&size=100&bold=true" style="width: 100px; height: 100px; border-radius: 50%; border: 3px solid var(--wmsu-crimson);">
                <h3 style="color: var(--text-main); margin-top: 1rem; text-transform: uppercase; font-weight: 700;">${user.name || 'System User'}</h3>
                <code style="color: var(--wmsu-crimson); font-weight: 800; font-size: 1.1rem;">ID: ${user.id}</code>
            </div>
            <div style="display: grid; gap: 1rem;">
                <div style="background: rgba(15, 23, 42, 0.4); padding: 1.2rem; border-radius: 8px; border: 1px solid var(--panel-border);">
                    <p style="color: var(--text-muted); font-size: 0.75rem; text-transform: uppercase; font-weight: 800; letter-spacing: 1px; margin-bottom: 5px;">Academic Role</p>
                    <p style="color: var(--text-main); font-weight: 600; font-size: 1.1rem;">${user.role || 'Student'}</p>
                </div>
                <div style="background: rgba(15, 23, 42, 0.4); padding: 1.2rem; border-radius: 8px; border: 1px solid var(--panel-border);">
                    <p style="color: var(--text-muted); font-size: 0.75rem; text-transform: uppercase; font-weight: 800; letter-spacing: 1px; margin-bottom: 5px;">Account Status</p>
                    <p style="color: ${user.status === 'Active' ? 'var(--success)' : 'var(--wmsu-crimson)'}; font-weight: 800; font-size: 1.1rem;">${(user.status || 'Active').toUpperCase()}</p>
                </div>
            </div>
        `;
    }

    const modal = document.getElementById('studentDetailsModal');
    if (modal) modal.style.display = 'flex';
}

function toggleMaintenanceMode() {
    isMaintenanceMode = !isMaintenanceMode;
    const toggleBtn = document.querySelector('label[for="maintenance-mode-toggle"]');
    if (toggleBtn) {
        if (isMaintenanceMode) {
            toggleBtn.classList.add('active');
            toggleBtn.style.background = 'var(--warning)';
            toggleBtn.style.color = 'black';
        } else {
            toggleBtn.classList.remove('active');
            toggleBtn.style.background = '';
            toggleBtn.style.color = '';
        }
    }

    const visualScanner = document.querySelector('.visual-scanner');
    if (visualScanner) {
        visualScanner.classList.toggle('maintenance-active', isMaintenanceMode);
    }

    const maintLogSection = document.getElementById('maintenance-log-section');
    if (maintLogSection) {
        maintLogSection.style.display = isMaintenanceMode ? 'block' : 'none';
    }

    const restoreBtn = document.getElementById('restore-btn');
    if (restoreBtn) {
        restoreBtn.style.display = isMaintenanceMode ? 'block' : 'none';
    }

    updateTerminalInfoGroup();
    showToast(Maintenance Mode: ${isMaintenanceMode ? 'ACTIVATED' : 'DEACTIVATED'});
    focusScanner();
}

function restoreSystemDefaults() {
    if (confirm("SYSTEM OVERRIDE: This will purge all logs, attendance records, and reset the registry to factory defaults. Proceed?")) {
        localStorage.clear();
        showToast("SYSTEM RESTORED TO DEFAULT");
        location.reload();
    }
}

window.addEventListener('storage', (e) => {
    if (['wmsu_users', 'wmsu_schedule', 'wmsu_attendance'].includes(e.key)) {
        updateLiveClassDisplay();
        updateTerminalInfoGroup();
        updateScannerStats();
    }
});

function playTerminalSound(type) {
    const audio = new Audio();
    if (type === 'success') audio.src = 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3';
    else if (type === 'error') audio.src = 'https://assets.mixkit.co/active_storage/sfx/2573/2573-preview.mp3';
    audio.play().catch(() => {});
}

function focusScanner() {
    const input = document.getElementById('rfid-input');
    const isModalOpen = !!document.querySelector('.modal[style*="flex"]');
    if (input && document.activeElement !== input && !isProcessingScan && !isModalOpen) {
        input.focus();
    }
}

function renderScannedSubjectDisplay(html) {
    const liveDisplay = document.getElementById('scanned-subject-display');
    if (liveDisplay) {
        liveDisplay.innerHTML = html;
    }
}

/**
 * Core Logic: Matches a User to the Master Schedule
 */
function findUserScheduleMatch(user, schedule, day, time) {
    const isFaculty = user.role === 'Faculty' || user.role === 'Teacher';
    const isAdmin = user.role === 'Admin' || user.id.toLowerCase() === 'admin';

    return schedule.find(s => {
        const isTimeMatch = s.days.includes(day) && time >= s.startTime && time <= s.endTime;
        if (!isTimeMatch) return false;
        if (isAdmin || s.section === "ALL") return true;

        if (isFaculty) {
            const instructor = (s.instructor || '').toUpperCase();
            const lastName = (user.lastName || (user.name ? user.name.split(',')[0] : user.id)).toUpperCase().trim();
            return instructor.includes(lastName);
        }

        // Student Matching
        const userSec = (user.section || '').toString().toUpperCase().trim();
        const userCurr = (user.curriculum || '').toString().toUpperCase().replace(/[-\s]/g, '');
        const schedTarget = (s.section || '').toString().toUpperCase().replace(/[-\s]/g, '');

        const programMatch = userCurr !== "" && schedTarget.includes(userCurr);
        const sectionMatch = userSec !== "" && schedTarget.includes(userSec);
        return programMatch && sectionMatch;
    });
}

function updateScannedSubjectDisplayForUser(user, schedule, currentDay, currentTimeStr) {
    const activeEntry = findUserScheduleMatch(user, schedule, currentDay, currentTimeStr);
    
    if (!activeEntry) {
        renderScannedSubjectDisplay(<span style="color: rgba(255,255,255,0.6); font-weight: 700;">NO SCHEDULE FOUND</span><br><small>${(user.section || 'UNASSIGNED').toString().toUpperCase()}</small>);
        return;
    }

    const dayList = Array.isArray(activeEntry.days) ? activeEntry.days.join(', ') : activeEntry.days;
    renderScannedSubjectDisplay(`
        <span style="color: var(--wmsu-crimson); font-weight: 800;">ACTIVE SESSION: ${activeEntry.subject}</span><br>
        <small>${activeEntry.startTime} - ${activeEntry.endTime} | ${activeEntry.room} | ${activeEntry.section}</small><br>
        <small style="opacity: 0.75;">${dayList}</small>
    `);
}

function updateScannerStats(latestId = null) {
    const countEl = document.getElementById('session-scan-count');
    const idEl = document.getElementById('latest-scan-id');
    if (countEl) countEl.innerText = sessionScanCount;
    if (idEl && latestId) {
        idEl.innerText = latestId;
    }
}

window.onclick = function(event) {
    const logoutModal = document.getElementById('logoutModal');
    const detailsModal = document.getElementById('studentDetailsModal');
    
    if (event.target === logoutModal) {
        closeLogoutModal();
    }
    if (event.target === detailsModal) {
        closeStudentDetailsModal();
    }
}

function updateLiveClassDisplay() {
    const schedule = JSON.parse(localStorage.getItem('wmsu_schedule')) || [];
    const now = new Date();
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const currentDay = dayNames[now.getDay()];
    const currentTimeStr = now.getHours().toString().padStart(2, '0') + ":" + now.getMinutes().toString().padStart(2, '0');

    // Show any active class in the terminal by default
    const activeClass = schedule.find(s => 
        (s.days && s.days.includes(currentDay)) && 
        (currentTimeStr >= s.startTime && currentTimeStr <= s.endTime)
    );
    const liveDisplay = document.getElementById('scanned-subject-display');
    
    if (liveDisplay && !isProcessingScan) {
        const oldContent = liveDisplay.innerHTML;
        let newContent = '';

        if (activeClass) {
            const threshold = activeClass.lateMinutes || 15;
            newContent = <span style="color: var(--wmsu-crimson); font-weight: 800;">ACTIVE SESSION: ${activeClass.subject}</span><br><small>${activeClass.startTime} - ${activeClass.endTime} | ${activeClass.room} | ${activeClass.section}</small>;
            
            const protocolList = document.getElementById('timing-protocol-list');
            if (protocolList) {
                protocolList.innerHTML = `
                    <li><span>ON-TIME:</span> <strong>0-${threshold}m</strong></li>
                    <li><span>LATE:</span> <strong>${threshold + 1}m+</strong></li>
                `;
            }
        } else {
            newContent = <div class="no-schedule-alert" style="color: rgba(255,255,255,0.4); font-weight: 700; font-size: 0.9rem; letter-spacing: 1px;">NO CLASSES AT THIS TIME</div>;
            const protocolList = document.getElementById('timing-protocol-list');
            if (protocolList) {
                protocolList.innerHTML = <li><span style="opacity: 0.5;">WAITING FOR SESSION...</span></li>;
            }
        }

        if (oldContent !== newContent) {
            liveDisplay.classList.remove('animate-up');
            void liveDisplay.offsetWidth; // Trigger reflow to restart animation
            liveDisplay.innerHTML = newContent;
            liveDisplay.classList.add('animate-up');
        }
    }
}

/**
 * Appends an entry to the Cyber Audit Log HUD
 */
function appendToEventLog(type, msg) {
    const logList = document.getElementById('log-list');
    if (!logList) return;
    const time = new Date().toLocaleTimeString();

    // Determine badge color based on status type
    let badgeColor = '#94a3b8'; // Default grey for unknown
    if (type === 'PRESENT') badgeColor = '#38a169'; // Green
    else if (type === 'LATE') badgeColor = '#d69e2e'; // Yellow/Gold
    else if (type === 'TIMED OUT') badgeColor = '#4299e1'; // Blue
    else if (type === 'NO SCHEDULE') badgeColor = '#dc143c'; // Crimson
    else if (type === 'EMAIL') badgeColor = '#3182ce'; // Blue for notifications
    else if (type === 'ADMIN ACCESS' || type === 'FACULTY ACCESS') badgeColor = '#4299e1'; // Blue for admin/faculty

    const line = document.createElement('div');
    line.style.padding = '12px 10px';
    line.style.borderBottom = '1px solid var(--panel-border)';
    line.style.fontSize = '0.9rem';
    line.style.display = 'flex';
    line.style.alignItems = 'center';
    line.style.gap = '12px';
    
    line.innerHTML = `
        <span style="color: var(--text-muted); font-family: monospace;">[${time}]</span>
        <span style="background: ${badgeColor}; color: white; padding: 3px 10px; border-radius: 4px; font-size: 0.7rem; font-weight: 800; min-width: 110px; text-align: center; letter-spacing: 0.5px; margin-right: 5px;">${type}</span>
        <span style="color: var(--text-main); font-weight: 600;">${msg}</span>
    `;
    logList.prepend(line);

    while (logList.children.length > 10) {
        logList.lastChild.remove();
    }
}

function addGlobalLog(type, message) {
    const logs = JSON.parse(localStorage.getItem('wmsu_logs')) || [];
    logs.unshift({ time: new Date().toLocaleTimeString(), type, message });
    localStorage.setItem('wmsu_logs', JSON.stringify(logs.slice(0, 50)));
    // Trigger storage event for other windows
    localStorage.setItem('wmsu_log_trigger', Date.now());
}

function clearSessionLog() {
    const logList = document.getElementById('log-list');
    if (logList && confirm("Clear current session logs?")) {
        logList.innerHTML = '';
    }
}

function sendAttendanceEmailNotification(user, status, subject) {
    // Only send emails for students
    if (!user.email || user.email === 'N/A' || user.email === '') return;
    
    if (typeof emailjs === 'undefined') {
        console.error("EmailJS SDK not found. Ensure the script tag is in your HTML.");
        return;
    }

    const templateParams = {
        to_email: user.email,
        student_name: user.name || ${user.firstName} ${user.lastName},
        status: status.toUpperCase(),
        subject: subject,
        timestamp: new Date().toLocaleString(),
        excusal_link: "https://your-domain.com/ReviewExcuses.html"
    };

    emailjs.send('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', templateParams)
        .then(() => {
            appendToEventLog('EMAIL', Real-time alert sent to ${user.firstName});

            const logs = JSON.parse(localStorage.getItem('wmsu_logs')) || [];
            logs.unshift({
                time: new Date().toLocaleTimeString(),
                type: 'INFO',
                message: MAILER SUCCESS: [${user.id}] Email sent to ${user.email} (Status: ${status})
            });
            localStorage.setItem('wmsu_logs', JSON.stringify(logs.slice(0, 50)));
            
            console.log(%c[MAILER] Success: Sent to ${user.email}, 'color: #38a169; font-weight: bold;');
        }, (error) => {
            console.error('EmailJS ERROR:', error);
            appendToEventLog('ERROR', Mail Dispatch Failed: ${error.text});
        });
}

function showErrorFeedback(message) {
    isProcessingScan = false;
    playTerminalSound('error');
    const statusLabel = document.getElementById('scanner-status-label');
    const errorMsg = document.getElementById('error-msg');
    const scannerBox = document.getElementById('scanner-box');
    const loadingOverlay = document.getElementById('scanner-loading-overlay');
    const mainApp = document.querySelector('.main-container') || document.body;
    const input = document.getElementById('rfid-input');

    if (loadingOverlay) loadingOverlay.style.display = 'none';
    
    if (statusLabel) {
        statusLabel.innerText = "INVALID ID";
        statusLabel.style.color = "#ff4d4d";
    }
    if (scannerBox) {
        scannerBox.style.boxShadow = "0 0 30px rgba(220, 20, 60, 0.5)";
        scannerBox.classList.remove('shake');
        void scannerBox.offsetWidth;
        scannerBox.classList.add('shake');
    }
    if (errorMsg) {
        errorMsg.innerText = message;
        errorMsg.style.display = 'block';
    }

    mainApp.classList.add('access-denied-flash');

    setTimeout(() => {
        if (statusLabel) statusLabel.innerText = "AWAITING ID TAG";
        if (statusLabel) statusLabel.style.color = ""; 
        if (scannerBox) {
            scannerBox.style.boxShadow = "";
            scannerBox.classList.remove('shake');
        }
        if (errorMsg) errorMsg.style.display = 'none';
        if (input) {
            mainApp.classList.remove('access-denied-flash');
            input.value = '';
            input.focus();
        }
    }, 2000);
}

function processScan(val) {
    if (isProcessingScan || !val || val.trim() === "") {
        focusScanner();
        return;
    }

    const statusLabel = document.getElementById('scanner-status-label');
    const inputField = document.getElementById('rfid-input');
    const scannerBox = document.getElementById('scanner-box');
    const successCard = document.getElementById('success-card');
    const loadingOverlay = document.getElementById('scanner-loading-overlay');
    const liveLog = document.getElementById('live-log');

    let scanVal = val.trim();
    const digitsOnly = scanVal.replace(/\D/g, '');
    if (digitsOnly.length === 9) scanVal = digitsOnly.substring(0, 4) + '-' + digitsOnly.substring(4);
    if (digitsOnly.length >= 7 && !scanVal.includes('-')) scanVal = digitsOnly.substring(0, 4) + '-' + digitsOnly.substring(4);
    scanVal = scanVal.replace(/[^\w-]/g, '');

    if (inputField) inputField.value = '';
    if (statusLabel) statusLabel.innerText = IDENTIFYING: ${scanVal};
    if (loadingOverlay) loadingOverlay.style.display = 'flex';
    isProcessingScan = true;

    setTimeout(() => {
    try {
        const users = JSON.parse(localStorage.getItem('wmsu_users')) || [];
        const schedule = JSON.parse(localStorage.getItem('wmsu_schedule')) || [];

        // Robust format-agnostic search: Strips hyphens/spaces for comparison
        const normalize = (id) => (id || '').toString().toLowerCase().replace(/[^a-z0-9]/g, '');
        const normalizedScan = normalize(scanVal);
        const user = users.find(u => normalize(u.id) === normalizedScan);
        
        const attendance = JSON.parse(localStorage.getItem('wmsu_attendance')) || [];

        if (!user) {
            showErrorFeedback(NOT RECOGNIZED: ID "${scanVal}" was not found in the local registry.);
            if (loadingOverlay) loadingOverlay.style.display = 'none';
            return;
        }

        const now = new Date();
        const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        const currentDay = dayNames[now.getDay()];
        const currentTimeStr = now.getHours().toString().padStart(2, '0') + ":" + now.getMinutes().toString().padStart(2, '0');
        const isAdmin = user.role === 'Admin' || user.id.toLowerCase() === 'admin';
        const isFaculty = user.role === 'Faculty' || user.role === 'Teacher';

        let activeClass = null;
        let subjectId = 'N/A';
        let subjectName = 'NO SCHEDULED CLASS';
        let status = "Present";
        let statusColor = "#38a169";

        if (isAdmin) {
            subjectId = 'ADMIN ACCESS';
            subjectName = 'ADMIN ACCESS';
            status = 'Authorized';
            statusColor = '#3182ce';
        } else if (isFaculty) {
            subjectId = 'FACULTY ACCESS';
            subjectName = 'FACULTY ACCESS';
            status = 'Authorized';
            statusColor = '#4299e1';
        } else {
            activeClass = findUserScheduleMatch(user, schedule, currentDay, currentTimeStr);
            subjectId = activeClass ? activeClass.subject : 'N/A';
            if (activeClass) {
                subjectName = activeClass.subject;
                const threshold = activeClass.lateMinutes || 15;
                const [sHours, sMinutes] = activeClass.startTime.split(':').map(Number);
                const startTimeDate = new Date(now);
                startTimeDate.setHours(sHours, sMinutes, 0, 0);
                const diffInMinutes = (now - startTimeDate) / (1000 * 60);
    
                if (diffInMinutes > threshold) {
                    status = "Late";
                    statusColor = "#d69e2e";
                }
            } else {
                status = "No Schedule";
                statusColor = "#dc143c";
                subjectName = "NO SCHEDULED CLASS";
            }
        }

        // Time In/Out Logic: Toggle based on existing record for the same day
        const todayStr = now.toDateString();
        const existingIdx = attendance.findIndex(a => a.id === user.id && a.subject === (subjectName || subjectId) && new Date(a.timestamp).toDateString() === todayStr);
        
        let isTimeOut = false;
        if (existingIdx !== -1) {
            const record = attendance[existingIdx];
            if (record.timeOut) {
                showToast("SESSION ALREADY COMPLETED");
                isProcessingScan = false;
                if (loadingOverlay) loadingOverlay.style.display = 'none';
                focusScanner();
                return;
            }
            // 60-second buffer to prevent accidental double-tap
            if ((now.getTime() - record.timestamp) < 60000) {
                showToast("ALREADY TIMED IN (WAIT 1M TO OUT)");
                isProcessingScan = false;
                if (loadingOverlay) loadingOverlay.style.display = 'none';
                focusScanner();
                return;
            }
            isTimeOut = true;
        }

        if (isMaintenanceMode) {
            statusLabel.innerText = "";
        }

        if (loadingOverlay) loadingOverlay.style.display = 'none';

        const studentDisplayName = user.name || ${user.lastName || ''}, ${user.firstName || ''}.trim() || user.id;

        if (successCard) {
            const subjDisplay = document.getElementById('success-subject-display');
            const nameEl = successCard.querySelector('.student-name');
            const idEl = successCard.querySelector('.student-id-display');
            const badge = successCard.querySelector('.status-badge-reveal');
            const photoEl = document.getElementById('student-photo');
            const cardLabel = document.getElementById('card-label');

            if (subjDisplay) subjDisplay.innerText = subjectName.toUpperCase();
            if (nameEl) nameEl.innerText = studentDisplayName;
            if (cardLabel) cardLabel.innerText = "AUTHENTICATION SUCCESS";
            
            if (idEl) {
                idEl.innerText = ID: ${user.id};
            }

            const yrSecEl = document.getElementById('student-year-section');
            if (yrSecEl) {
                const yrLabel = (user.year || '').includes('ACT') || (user.year || '').includes('IT') ? user.year : YEAR ${user.year};
                yrSecEl.innerText = user.role === 'Student' ? ${yrLabel} | SECTION ${user.section || 'N/A'} : DEPT: ${user.section || 'N/A'};
            }
            
            if (badge) {
                badge.innerText = isTimeOut ? "TIMED OUT" : status.toUpperCase();
                badge.style.background = isTimeOut ? "#4299e1" : statusColor;
            }

            if (photoEl) {
                photoEl.src = user.profilePic || https://ui-avatars.com/api/?name=${encodeURIComponent(studentDisplayName)}&background=dc143c&color=fff&size=130&bold=true;
            }

            if (scannerBox) scannerBox.style.display = 'none';
            successCard.style.display = 'flex';
            playTerminalSound('success');
        }
        
        if (liveLog) liveLog.style.display = 'block';

        if (!isMaintenanceMode) {
            if (isTimeOut) {
                attendance[existingIdx].timeOut = now.getTime();
                status = "Timed Out";
            } else {
                attendance.unshift({
                    id: user.id,
                    name: studentDisplayName,
                    status: status.toUpperCase(),
                    subject: subjectName || subjectId,
                    instructor: activeClass ? activeClass.instructor : 'N/A',
                    code: activeClass ? activeClass.code : 'N/A',
                    timestamp: now.getTime(),
                    timeIn: now.getTime(),
                    timeOut: null
                });
            }
            
            // Save to localStorage immediately
            localStorage.setItem('wmsu_attendance', JSON.stringify(attendance));

            // Send email if student is Late or Present (only for students)
            sendAttendanceEmailNotification(user, isTimeOut ? "TIMED OUT" : status, subjectName);

            const logMessage = ${studentDisplayName} - ${isTimeOut ? 'Time Out recorded' : 'Scan Recorded'} for ${subjectName};
            appendToEventLog(status.toUpperCase(), logMessage);
            showToast(RECORDED: ${status.toUpperCase()} - ${subjectName});
            addGlobalLog(status === 'Late' ? 'WARN' : 'INFO', TERMINAL SCAN: ${studentDisplayName} (${status}) for ${subjectName});

            lastScans[scanVal] = { timestamp: now, subject: subjectId };
            sessionScanCount = attendance.filter(a => new Date(a.timestamp).toDateString() === now.toDateString()).length;
            updateScannerStats(user.id);
        } else {
            appendToEventLog("TEST SCAN", Maintenance Check: [${user.id}]);
        }

        // Release the lock immediately after data is written so the scanner stays responsive
        isProcessingScan = false;
        if (loadingOverlay) loadingOverlay.style.display = 'none';
        focusScanner();

        // Reset UI visuals after a short delay
        const resetDelay = 2500; 
        setTimeout(() => {
            // Only hide the success card if another scan hasn't started already
            if (!isProcessingScan && successCard.style.display === 'flex') {
                successCard.style.display = 'none';
                if (scannerBox) scannerBox.style.display = 'block';
                if (statusLabel) statusLabel.innerText = "AWAITING ID TAG";
                updateLiveClassDisplay();
            }
        }, resetDelay);

    } catch (error) {
        console.error("Critical Scanner Error:", error);
        isProcessingScan = false; 
        if (loadingOverlay) loadingOverlay.style.display = 'none';
        showErrorFeedback("System Error. Please try again.");
    }
    }, 450); // Snappy verification sequence
}

function updateTerminalInfoGroup() {
    const termInfo = document.getElementById('terminal-info-group');
    if (termInfo) {
        termInfo.innerHTML = `
            <p><strong>NODE:</strong> WMSU-CCS-T1</p>
            <p><strong>LOCATION:</strong> GROUND FLOOR</p>
            <p><strong>CLOCK:</strong> ${new Date().toLocaleDateString()}</p>
            <p><strong>MODE:</strong> <span style="color: ${isMaintenanceMode ? 'var(--warning)' : 'var(--success)'}; font-weight: bold;">${isMaintenanceMode ? 'MAINTENANCE' : 'OPERATIONAL'}</span></p>
        `;
    }
}

window.onload = function() {
    console.log('--- WMSU RFID Terminal Operational ---');

    if (typeof emailjs !== 'undefined') emailjs.init("YOUR_SERVICE_ID"); // Use YOUR_SERVICE_ID here

    ensureUserRegistry();
    applySidebarState();
    
    if (!localStorage.getItem('wmsu_schedule')) {
        // Sync with the Admin panel master schedule — proper time-boxed entries only
        const defaultSched = [
            { subject: "Readings in Philippine History", code: "RIPH-101", days: ["Tue", "Fri"], startTime: "07:00", endTime: "08:30", room: "LR1", section: "ACT AD 1B", lateMinutes: 15, units: 3, instructor: "REIN RAIN REIGN", semester: "1st Semester" },
            { subject: "Understanding the Self",         code: "GEC-101",  days: ["Mon"],          startTime: "08:00", endTime: "09:00", room: "LR5", section: "ACT AD 1B", lateMinutes: 15, units: 3, instructor: "DR. ANNA CRUZ",   semester: "1st Semester" },
            { subject: "Human Computer Interaction",     code: "HCI-102",  days: ["Mon", "Thu"],   startTime: "14:30", endTime: "16:00", room: "LR2", section: "ACT AD 1B", lateMinutes: 15, units: 3, instructor: "MARJORIE ROJAS",  semester: "1st Semester" }
        ];
        localStorage.setItem('wmsu_schedule', JSON.stringify(defaultSched));
    }
    
    updateTerminalInfoGroup();
    updateLiveClassDisplay();
    setInterval(updateLiveClassDisplay, 60000);

    rfidInput = document.getElementById('rfid-input');

    if (rfidInput) {
        rfidInput.addEventListener('keydown', function(e) {
            // Scanners usually send an 'Enter' key at the end of the string
            if (e.key === 'Enter') {
                processScan(this.value);
                this.value = ''; // Clear immediately for next scan
            }
        });

        // Handle Enter Button Click
        document.getElementById('enterIdButton')?.addEventListener('click', function() {
            if (rfidInput.value.trim()) {
                processScan(rfidInput.value);
                rfidInput.value = '';
            }
            focusScanner();
        });

        // Handle Manual Authentication Button Click
        document.getElementById('manual-scan-btn')?.addEventListener('click', function() {
            if (rfidInput.value.trim()) {
                processScan(rfidInput.value);
                rfidInput.value = '';
            }
            focusScanner();
        });
    }
    setInterval(focusScanner, 2000);
    document.body.addEventListener('click', focusScanner);
};

function showToast(msg) {
    const t = document.getElementById('toast');
    if (t) {
        t.innerText = msg;
        t.style.display = 'block';
        setTimeout(() => t.style.display = 'none', 3000);
    }
}
ui-avatars.com
