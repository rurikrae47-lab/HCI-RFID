let activeRegType = 'Student';
let users = [];
let editingUserId = null;
let searchHistory = JSON.parse(localStorage.getItem('wmsu_search_history')) || [];
let searchTimeout;

const SUBJECT_CATALOG = [
    { name: "Readings in Philippine History", code: "RIPH-101" },
    { name: "Understanding the Self", code: "GEC-101" },
    { name: "Human Computer Interaction", code: "HCI-102" },
    { name: "Introduction to Computing", code: "CC-101" },
    { name: "Computer Programming", code: "CC-102" },
    { name: "Discrete Structures", code: "DS-118" },
    { name: "Movement Competency Training", code: "PATHFIT-1" }
];

function switchRegType(type) {
    activeRegType = type;
    document.querySelectorAll('.reg-btn').forEach(b => b.classList.remove('active'));
    const btn = document.getElementById(`btn-reg-${type.toLowerCase()}`);
    if (btn) btn.classList.add('active');
    
    const studentFields = document.getElementById('student-only-fields');
    const facultyFields = document.getElementById('faculty-only-fields');
    if (studentFields) studentFields.style.display = type === 'Student' ? 'block' : 'none';
    if (facultyFields) facultyFields.style.display = type === 'Faculty' ? 'block' : 'none';
    updateSubjectPreview();
}

function initSystem() {
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
    
    if (!localStorage.getItem('wmsu_devices')) {
        localStorage.setItem('wmsu_devices', JSON.stringify([
            { id: "HW-772-B", name: "Main Entrance Node", status: "Online", type: "Master", ip: "192.168.1.55", uptime: "14d 2h", signal: "Strong", version: "v2.4.1" },
            { id: "HW-104-A", name: "Admin Office Scanner", status: "Offline", type: "Slave", ip: "192.168.1.104", uptime: "0s", signal: "None", version: "v2.4.0" }
        ]));
    }

    if (!localStorage.getItem('wmsu_logs')) {
        localStorage.setItem('wmsu_logs', JSON.stringify([
            { time: new Date().toLocaleTimeString(), type: 'INFO', message: 'System Administration Portal Initialized' }
        ]));
    }

    const existingSched = JSON.parse(localStorage.getItem('wmsu_schedule')) || [];
    if (existingSched.length === 0) {
        const masterSchedule = [
            { subject: "Readings in Philippine History", code: "RIPH-101", days: ["Tue", "Fri"], startTime: "07:00", endTime: "08:30", room: "LR1", section: "ACT AD 1B", lateMinutes: 15, units: 3, instructor: "REIN RAIN REIGN", semester: "1st Semester" },
            { subject: "Understanding the Self", code: "GEC-101", days: ["Mon"], startTime: "08:00", endTime: "09:00", room: "LR5", section: "ACT AD 1B", lateMinutes: 15, units: 3, instructor: "DR. ANNA CRUZ", semester: "1st Semester" },
            { subject: "Human Computer Interaction", code: "HCI-102", days: ["Mon", "Thu"], startTime: "14:30", endTime: "16:00", room: "LR2", section: "ACT AD 1B", lateMinutes: 15, units: 3, instructor: "MARJORIE ROJAS", semester: "1st Semester" }
        ];
        localStorage.setItem('wmsu_schedule', JSON.stringify(masterSchedule));
    }

    users = JSON.parse(localStorage.getItem('wmsu_users')) || [];
    
    renderUserTable();
    renderLogs();
    renderDevices();
    renderAttendanceTable();
    renderScheduleTable();
    updateStats();
    renderSearchHistory();
    updateAnalytics();
    renderAnnouncementsTable();
    const form = document.getElementById("addUserForm");
    if (form) form.onsubmit = handleAddUser;

    const annForm = document.getElementById("addAnnouncementForm");
    if (annForm) annForm.onsubmit = handleAddAnnouncement;

    window.addEventListener('storage', (e) => {
        if (['wmsu_attendance', 'wmsu_users', 'wmsu_logs', 'wmsu_devices', 'wmsu_schedule'].includes(e.key)) {
            users = JSON.parse(localStorage.getItem('wmsu_users')) || [];
            renderUserTable();
            renderAttendanceTable();
            renderScheduleTable();
            renderLogs();
            updateStats();
            updateAnalytics();
            renderDevices();

            if (e.key === 'wmsu_attendance' && e.newValue) {
                try {
                    const attendance = JSON.parse(e.newValue);
                    if (attendance.length > 0) {
                        const latest = attendance[0];
                        showAdminToast(`<strong style="color: var(--wmsu-red);">NEW SCAN DETECTED</strong><br><b>${latest.name}</b><br><small>${latest.subject} | ${latest.status}</small>`, latest.timestamp, latest.id);
                    }
                } catch (err) { console.error("Toast notification failed:", err); }
            }
        }
    });
}

function showAdminToast(msg, timestamp, userId) {
    const toast = document.getElementById('admin-toast');
    const content = document.getElementById('admin-toast-content');
    if (toast && content) {
        const btnHtml = `<button onclick="event.stopPropagation(); showUserDetails('${userId}'); document.getElementById('admin-toast').style.display='none';" style="margin-top: 10px; display: block; background: var(--wmsu-red); color: white; border: none; padding: 6px 14px; border-radius: 6px; font-size: 0.7rem; font-weight: 800; cursor: pointer; border: 1px solid rgba(255,255,255,0.2);">VIEW PROFILE</button>`;
        content.innerHTML = msg + btnHtml;
        toast.style.display = 'flex';
        toast.style.cursor = 'pointer';

        toast.onclick = () => {
            const navBtn = document.getElementById('nav-attendance');
            if (navBtn) navBtn.checked = true;
            const dateFilter = document.getElementById('attendanceDateFilter');
            if (dateFilter && dateFilter.value) {
                dateFilter.value = '';
                renderAttendanceTable();
            }
            setTimeout(() => {
                const row = document.getElementById(`attendance-row-${timestamp}`);
                if (row) {
                    row.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    row.style.transition = 'background 0.5s ease';
                    row.style.background = 'rgba(158, 27, 50, 0.2)';
                    setTimeout(() => { row.style.background = ''; }, 3000);
                }
            }, 150);

            toast.style.display = 'none';
        };
        setTimeout(() => {
            if (toast.style.display === 'flex') toast.style.display = 'none';
        }, 5000);
    }
}

function openAnnouncementModal() {
    document.getElementById('announcementModal').style.display = 'flex';
}

function closeAnnouncementModal() {
    document.getElementById('announcementModal').style.display = 'none';
}

function handleAddAnnouncement(e) {
    e.preventDefault();
    const title = document.getElementById('annTitle').value.trim();
    const content = document.getElementById('annContent').value.trim();
    const expiry = document.getElementById('annExpiry').value;
    
    const announcements = JSON.parse(localStorage.getItem('wmsu_announcements')) || [];
    announcements.unshift({
        title,
        content,
        expiry,
        pinned: false,
        date: new Date().toISOString()
    });
    
    localStorage.setItem('wmsu_announcements', JSON.stringify(announcements));
    closeAnnouncementModal();
    renderAnnouncementsTable();
    addAdminLog('INFO', `Broadcast Sent: ${title}`);
    this.reset();
}

function renderAnnouncementsTable() {
    const announcements = JSON.parse(localStorage.getItem('wmsu_announcements')) || [];
    const tbody = document.getElementById('adminAnnouncementsTable');
    if (!tbody) return;

    tbody.innerHTML = announcements.map((ann, idx) => `
        <tr>
            <td>${new Date(ann.date).toLocaleDateString()}</td>
            <td><strong>${ann.title}</strong></td>
            <td>${ann.content.substring(0, 60)}${ann.content.length > 60 ? '...' : ''}</td>
            <td>
                <button onclick="deleteAnnouncement(${idx})" style="background:none; border:none; color:#e53e3e; cursor:pointer; font-weight:bold;">Delete</button>
            </td>
        </tr>
    `).join('') || '<tr><td colspan="4" style="text-align:center; padding:20px; color:var(--text-muted);">No broadcast history found.</td></tr>';
}

function deleteAnnouncement(index) {
    if (confirm("Permanently delete this announcement broadcast?")) {
        const announcements = JSON.parse(localStorage.getItem('wmsu_announcements')) || [];
        announcements.splice(index, 1);
        localStorage.setItem('wmsu_announcements', JSON.stringify(announcements));
        renderAnnouncementsTable();
        addAdminLog('WARN', 'Announcement Broadcast Revoked');
    }
}

function openModal() { 
    const modal = document.getElementById("userModal");
    const form = document.getElementById("addUserForm");
    const title = document.querySelector('#userModal h2');
    const submitBtn = document.querySelector('#userModal .btn-primary');

    if (modal && form) {
        form.reset();
        editingUserId = null;
        if (title) title.innerText = "Register New User";
        if (submitBtn) submitBtn.innerText = "Confirm & Save User";
        switchRegType('Student');
        modal.style.display = "flex"; 
    }
}

function editUser(id) {
    const user = users.find(u => u.id === id);
    if (!user) return;

    editingUserId = id;
    const modal = document.getElementById("userModal");
    const form = document.getElementById("addUserForm");
    const title = document.querySelector('#userModal h2');
    const submitBtn = document.querySelector('#userModal .btn-primary');

    if (modal && form) {
        if (title) title.innerText = "Edit User Profile";
        if (submitBtn) submitBtn.innerText = "Save Changes";
        
        switchRegType(user.role || 'Student');

        document.getElementById("rfid").value = user.id;
        const nameParts = user.name ? user.name.split(', ') : ["", ""];
        const last = user.lastName || nameParts[0] || "";
        const first = user.firstName || nameParts[1]?.split(' ')[0] || "";
        const middle = user.middleName || (nameParts[1]?.split(' ').length > 1 ? nameParts[1].split(' ').slice(1).join(' ') : "");

        document.getElementById("firstName").value = first;
        document.getElementById("lastName").value = last;
        document.getElementById("middleName").value = middle;
        document.getElementById("gender").value = user.gender || "Male";
        document.getElementById("dob").value = user.dob || "";
        
        if (user.role === 'Student') {
            document.getElementById("yearLevel").value = user.year || "";
            document.getElementById("section").value = user.section || "";
        } else {
            document.getElementById("department").value = user.section || "";
        }

        document.getElementById("email").value = user.email || "";
        document.getElementById("mobile").value = user.mobile || "";
        document.getElementById("emergencyName").value = user.emergencyName || "";
        document.getElementById("emergencyNo").value = user.emergencyNo || "";
        document.getElementById("address").value = user.address || "";
        
        updateSubjectPreview();
        modal.style.display = "flex";
    }
}

function closeModal() { 
    const modal = document.getElementById("userModal");
    if (modal) modal.style.display = "none"; 
}

function restoreSystemData() {
    if(confirm("SYSTEM OVERRIDE: This will purge all users, logs, and current schedules, resetting the infrastructure to default factory state. Proceed?")) {
        localStorage.clear(); 
        initSystem(); 
        location.reload(); 
    }
}

function handleAddUser(e) {
    if (e) e.preventDefault();
    const rfidValue = document.getElementById("rfid")?.value.trim();
    if (!rfidValue) return;

    const newUser = {
        id: rfidValue,
        firstName: document.getElementById("firstName").value.trim().toUpperCase(),
        lastName: document.getElementById("lastName").value.trim().toUpperCase(),
        middleName: (document.getElementById("middleName").value || "").trim().toUpperCase(),
        role: activeRegType,
        gender: document.getElementById("gender").value,
        dob: document.getElementById("dob").value,
        year: activeRegType === 'Student' ? (document.getElementById("yearLevel").value.toUpperCase() || "N/A") : "N/A",
        section: activeRegType === 'Student' ? (document.getElementById("section").value.toUpperCase() || "N/A") : (document.getElementById("department").value.toUpperCase() || "N/A"),
        curriculum: activeRegType === 'Student' ? document.getElementById("curriculum").value : "N/A",
        semester: activeRegType === 'Student' ? document.getElementById("semester").value : "N/A",
        academicYear: activeRegType === 'Student' ? (document.getElementById("academicYear").value || "2024-2025") : "N/A",
        email: document.getElementById("email").value.trim(),
        mobile: document.getElementById("mobile").value.trim() || "N/A",
        emergencyName: document.getElementById("emergencyName").value.trim() || "N/A",
        emergencyNo: document.getElementById("emergencyNo").value.trim() || "N/A",
        address: document.getElementById("address").value.trim() || "N/A",
        enrollDate: new Date().toLocaleDateString(),
        status: "Active",
        history: []
    };

    newUser.name = `${newUser.lastName}, ${newUser.firstName} ${newUser.middleName}`.trim();

    let currentUsers = JSON.parse(localStorage.getItem('wmsu_users')) || [];
    
    if (editingUserId && editingUserId !== newUser.id) {
        currentUsers = currentUsers.filter(u => u.id !== editingUserId);
    }

    const existingIdx = currentUsers.findIndex(u => u.id === newUser.id);
    if (existingIdx > -1) currentUsers[existingIdx] = newUser; 
    else currentUsers.push(newUser); 
    localStorage.setItem('wmsu_users', JSON.stringify(currentUsers));
    
    users = currentUsers; 
    editingUserId = null;
    initSystem(); 
    closeModal(); 
}

function renderUserTable() {
    const tbody = document.getElementById("adminUserTable");
    if (!tbody) return;
    
    const attendance = JSON.parse(localStorage.getItem('wmsu_attendance')) || [];
    const schedule = JSON.parse(localStorage.getItem('wmsu_schedule')) || [];

    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    weekStart.setHours(0, 0, 0, 0);

    tbody.innerHTML = users.map(u => {
        const fullName = u.name || `${u.lastName}, ${u.firstName} ${u.middleName || ''}`.trim();
        const classInfo = u.role === 'Student' ? `${u.year || 'N/A'}-${u.section || 'N/A'}` : (u.section || 'N/A');
        const academicYear = u.academicYear || 'N/A';

        let weeklyPercent = "0%";
        if (u.role === 'Student') {
            const userSection = (u.section || "").toUpperCase();
            const expectedSessions = schedule
                .filter(s => {
                    const schedSec = s.section.toUpperCase();
                    return schedSec === userSection || schedSec.includes(` ${userSection}`) || schedSec.startsWith(`${userSection} `) || s.section === "ALL";
                })
                .reduce((acc, s) => acc + (s.days ? s.days.length : 0), 0);

            const userWeekLogs = attendance.filter(a => a.id === u.id && a.timestamp >= weekStart.getTime());
            const uniqueAttended = new Set(userWeekLogs.map(l => l.subject + new Date(l.timestamp).toDateString())).size;

            if (expectedSessions > 0) {
                const calc = Math.min(100, Math.round((uniqueAttended / expectedSessions) * 100));
                const color = calc >= 80 ? '#38a169' : (calc >= 50 ? '#d69e2e' : '#e53e3e');
                weeklyPercent = `<span style="color: ${color}; font-weight: 800;">${calc}%</span>`;
            }
        }

        return `
        <tr onclick="showUserDetails('${u.id}')">
            <td>${u.id}</td>
            <td>${fullName}</td>
            <td>${u.role || 'Student'}</td>
            <td>${u.gender || 'N/A'}</td>
            <td>${classInfo} <br> <small>Weekly: ${weeklyPercent}</small></td>
            <td>${academicYear}</td>
            <td>${u.enrollDate || 'Jan 12, 2024'}</td>
            <td>${u.status || 'Active'}</td>
            <td>
                <button onclick="event.stopPropagation(); editUser('${u.id}')" style="background:none; border:none; color:#4a5568; cursor:pointer; font-weight:bold; margin-right:8px;">Edit</button>
                <button onclick="event.stopPropagation(); deleteUser('${u.id}')" style="background:none; border:none; color:#e53e3e; cursor:pointer; font-weight:bold;">Delete</button>
            </td>
        </tr>
    `}).join('');
}

function deleteUser(id) {
    if (confirm(`Permanently remove ID Number: ${id} from registry?`)) {
        let updatedUsers = users.filter(u => u.id !== id);
        localStorage.setItem('wmsu_users', JSON.stringify(updatedUsers));
        
        addAdminLog('WARN', `User Removed: ${id}`); // Log the action
        users = updatedUsers; // Update local state
        renderUserTable(); // Re-render table
        updateStats(); // Update dashboard stats
    }
}

function updateStats() {
    const total = users.length;
    const students = users.filter(u => !u.role || u.role === 'Student').length;
    const faculty = users.filter(u => u.role === 'Faculty' || u.role === 'Teacher').length;
    
    const countEl = document.getElementById('active-users-count');
    const subEl = document.getElementById('active-users-sub');
    
    if (countEl) countEl.innerText = total.toLocaleString();
    if (subEl) {
        subEl.innerHTML = `<span onclick="navigateToUsers('Student')" style="cursor:pointer; text-decoration:underline; color: var(--wmsu-red); font-weight: 700;">${students.toLocaleString()} Students</span> | <span onclick="navigateToUsers('Faculty')" style="cursor:pointer; text-decoration:underline; color: #4338ca; font-weight: 700;">${faculty.toLocaleString()} Faculty</span>`;
    }
}

function addAdminLog(type, message) {
    const logs = JSON.parse(localStorage.getItem('wmsu_logs')) || [];
    logs.unshift({
        time: new Date().toLocaleTimeString(),
        type: type,
        message: message
    });
    localStorage.setItem('wmsu_logs', JSON.stringify(logs.slice(0, 50)));
    renderLogs(); // Always re-render logs after adding one
}

function navigateToUsers(role) {
    document.getElementById('nav-users').checked = true;
    document.getElementById('userSearch').value = role;
    saveSearchTerm(role);
    filterUsers();
}

let activeLogFilter = 'All';

function filterLogs(type, btn) {
    activeLogFilter = type;
    renderLogs(type, btn);
}

function renderLogs(filter = activeLogFilter, btn = null) {
    if (btn) {
        document.querySelectorAll('.log-filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
    }
    const logs = JSON.parse(localStorage.getItem('wmsu_logs')) || [];
    const container = document.getElementById('system-log-container');
    if (!container) return;

    const searchInput = document.getElementById('logSearch');
    const keyword = searchInput ? searchInput.value.trim().toUpperCase() : '';

    let filtered = filter === 'All' ? logs : logs.filter(l => l.type === filter);
    
    if (keyword) {
        filtered = filtered.filter(l => 
            l.message.toUpperCase().includes(keyword) || 
            l.type.toUpperCase().includes(keyword) || 
            l.time.toUpperCase().includes(keyword)
        );
    }
    
    container.innerHTML = filtered.map(l => {
        const cls = l.type === 'ERROR' ? 'error' : (l.type === 'WARN' ? 'warn' : 'info');
        
        let msg = l.message;
        let typeText = l.type;
        let timeText = l.time;

        if (keyword) {
            msg = highlightResult(msg, keyword);
            typeText = highlightResult(typeText, keyword);
            timeText = highlightResult(timeText, keyword);
        }

        return `<div class="log-entry ${cls}"><span class="log-time">[${timeText}]</span> <span style="color: ${l.type==='ERROR'?'#e53e3e':(l.type==='WARN'?'#f6ad55':'#48bb78')}">${typeText}:</span> ${msg}</div>`;
    }).join('') || '<div style="padding: 20px; color: #718096;">No logs matching criteria.</div>';
}

function openInfraModal(type) {
    if (type === 'user') {
        document.getElementById('active-users-sub-modal').innerText = document.getElementById('active-users-sub').innerText;
        document.getElementById('infraUserModal').style.display = 'flex';
    } else if (type === 'hardware') {
        renderDevices('device-grid-container-modal');
        document.getElementById('infraHardwareModal').style.display = 'flex';
    } else if (type === 'network') {
        document.getElementById('infraNetworkModal').style.display = 'flex';
    }
}

function closeInfraModal(type) {
    const id = 'infra' + type.charAt(0).toUpperCase() + type.slice(1) + 'Modal';
    document.getElementById(id).style.display = 'none';
}

function renderDevices(targetId = 'device-grid-container') {
    const devices = JSON.parse(localStorage.getItem('wmsu_devices')) || [];
    const container = document.getElementById(targetId);
    if (!container) return;

    container.innerHTML = devices.map(d => `
        <div class="device-card">
            <div style="display: flex; justify-content: space-between;">
                <h3 style="font-size: 1rem;">${d.name}</h3>
                <span class="badge ${d.type === 'Master' ? 'present' : 'late'}">${d.type}</span>
            </div>
            <p style="font-size: 0.8rem; color: #718096; margin-top: 5px;">UID: ${d.id} | Model: WMSU-R2</p>
            <div class="device-status">
                <div class="status-dot ${d.status === 'Online' ? 'dot-online' : 'dot-offline'}"></div>
                <span style="color: ${d.status === 'Online' ? '#38a169' : '#e53e3e'}; font-weight: bold;">${d.status.toUpperCase()}</span>
                <span style="margin-left: auto; color: #a0aec0;">${d.status === 'Online' ? 'Last ping: 2s ago' : 'Connection Lost'}</span>
            </div>
            <div class="device-meta">
                <div class="meta-item">IP: <b>${d.ip}</b></div>
                <div class="meta-item">Uptime: <b>${d.uptime}</b></div>
                <div class="meta-item">Signal: <b>${d.signal}</b></div>
                <div class="meta-item">Version: <b>${d.version}</b></div>
            </div>
            ${d.status === 'Offline' ? `<button class="btn btn-primary" style="width: 100%; margin-top: 15px; font-size: 0.8rem;" onclick="rebootDevice('${d.id}')">Reboot Hardware</button>` : ''}
        </div>
    `).join('');
}

function rebootDevice(id) {
    const devices = JSON.parse(localStorage.getItem('wmsu_devices')) || [];
    const idx = devices.findIndex(d => d.id === id);
    if(idx > -1) {
        devices[idx].status = 'Online';
        devices[idx].uptime = '0s';
        localStorage.setItem('wmsu_devices', JSON.stringify(devices));
        addAdminLog('INFO', `Hardware Node Rebooted: ${id}`);
        renderDevices();
        updateStats();
    }
}

function exportLogsCSV() {
    const logs = JSON.parse(localStorage.getItem('wmsu_logs')) || [];
    const csvContent = "data:text/csv;charset=utf-8," + "Time,Type,Message\n" + logs.map(l => `${l.time},${l.type},"${l.message}"`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "system_audit_logs.csv");
    document.body.appendChild(link);
    link.click();
}

function renderAttendanceTable() {
    const tbody = document.getElementById("attendanceTableBody");
    if (!tbody) return;
    
    const attendance = JSON.parse(localStorage.getItem('wmsu_attendance')) || [];
    const dateFilter = document.getElementById("attendanceDateFilter").value;
    
    const filtered = attendance.filter(a => {
        if (!dateFilter) return true;
        return new Date(a.timestamp).toISOString().split('T')[0] === dateFilter;
    });

    tbody.innerHTML = filtered.map(a => `
        <tr id="attendance-row-${a.timestamp}">
            <td>
                <div style="font-weight:700;">IN: ${new Date(a.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</div>
                ${a.timeOut ? `<div style="color:var(--wmsu-red); font-size:0.75rem;">OUT: ${new Date(a.timeOut).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</div>` : '<div style="color:#718096; font-size:0.7rem;">(Active)</div>'}
            </td>
            <td>${a.name}</td>
            <td>${a.id}</td>
            <td>${a.subject}</td>
            <td>
                <span class="badge ${a.status.toLowerCase()}">${a.status}</span>
                ${a.timeOut ? '<br><small style="color:#38a169; font-weight:800;">Completed</small>' : ''}
            </td>
        </tr>
    `).join('') || '<tr><td colspan="5" style="text-align:center; padding: 20px;">No attendance records found for this date.</td></tr>';
    
    // Update Dashboard Stat
    const today = new Date().toISOString().split('T')[0];
    const todayCount = attendance.filter(a => new Date(a.timestamp).toISOString().split('T')[0] === today).length;
    const statEl = document.getElementById('today-attendance-stat');
    if(statEl) statEl.innerText = todayCount;
}

function exportAttendanceCSV() {
    const attendance = JSON.parse(localStorage.getItem('wmsu_attendance')) || [];
    if (attendance.length === 0) { alert("No attendance records found."); return; }

    const headers = "Timestamp,Name,ID,Subject,Status\n";
    const csvContent = attendance.map(a => 
        `"${new Date(a.timestamp).toLocaleString()}", "${a.name}", "${a.id}", "${a.subject}", "${a.status}"`
    ).join("\n");

    const blob = new Blob([headers + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Attendance_Report_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
}

/**
 * FEATURE: Export Weekly Detailed Report
 */
function exportWeeklyReportCSV() {
    const schedule = JSON.parse(localStorage.getItem('wmsu_schedule')) || [];
    const attendance = JSON.parse(localStorage.getItem('wmsu_attendance')) || [];
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    
    const headers = "Student ID,Name,Section,Expected Sessions,Actual Attended,Attendance Rate\n";
    const csvData = users.filter(u => u.role === 'Student').map(u => {
        const userSection = (u.section || "").toUpperCase();
        const expected = schedule
            .filter(s => s.section.toUpperCase().includes(userSection) || s.section === "ALL")
            .reduce((acc, s) => acc + (s.days ? s.days.length : 0), 0);
        
        const userWeekLogs = attendance.filter(a => a.id === u.id && a.timestamp >= weekStart.getTime());
        const attended = new Set(userWeekLogs.map(l => l.subject + new Date(l.timestamp).toDateString())).size;
        const rate = expected > 0 ? Math.round((attended / expected) * 100) : 0;
        
        return `"${u.id}","${u.name}","${userSection}",${expected},${attended},"${rate}%"`;
    }).join("\n");

    const blob = new Blob([headers + csvData], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Weekly_Attendance_Analysis_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    addAdminLog('INFO', 'Weekly Analytical Report generated.');
}

function exportScheduleCSV() {
    const schedule = JSON.parse(localStorage.getItem('wmsu_schedule')) || [];
    if (schedule.length === 0) { alert("No schedule records found to export."); return; }

    const headers = "Subject,Code,Days,StartTime,EndTime,Room,Section,LateMinutes,Units,Instructor\n";
    const csvContent = schedule.map(s => 
        `"${s.subject}",${s.code},"${s.days.join('; ')}",${s.startTime},${s.endTime},${s.room},"${s.section}",${s.lateMinutes},${s.units},"${s.instructor || 'TBD'}"`
    ).join("\n");

    const blob = new Blob([headers + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `WMSU_Master_Schedule_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    addAdminLog('INFO', 'Master Schedule exported to CSV file.');
}

function openBulkModal() { document.getElementById('bulkUserModal').style.display = 'flex'; }
function closeBulkModal() { document.getElementById('bulkUserModal').style.display = 'none'; }
function processBulkUpload() {
    const fileInput = document.getElementById('bulkCsvFile');
    if (!fileInput.files.length) { alert("Please select a CSV file first."); return; }
    
   
    const metadata = {
        curriculum: document.getElementById('bulkCurriculum').value,
        section: document.getElementById('bulkSection').value.trim().toUpperCase(),
        semester: document.getElementById('bulkSemester').value,
        academicYear: document.getElementById('bulkAY').value.trim()
    };

    const reader = new FileReader();
    reader.onload = function(e) {
        const text = e.target.result;
        const lines = text.split('\n');
        let currentUsers = JSON.parse(localStorage.getItem('wmsu_users')) || [];
        let addedCount = 0;

        lines.forEach((line, index) => {
            if (index === 0 || !line.trim()) return; 
            const cols = line.split(',').map(c => c.trim());
            
            if (cols.length >= 3) {
                let rawId = cols[0].replace(/[^\w-]/g, '');
                if (/^[0-9]{9}$/.test(rawId)) rawId = rawId.substring(0, 4) + '-' + rawId.substring(4);

                const newUser = {
                    id: rawId,
                    lastName: cols[1].replace(/[^a-zA-Z\s.]/g, ''),
                    firstName: cols[2].replace(/[^a-zA-Z\s.]/g, ''),
                    middleName: (cols[3] || "").replace(/[^a-zA-Z\s.]/g, ''),
                    gender: cols[4] || "N/A",
                    dob: cols[5] || "N/A",
                    email: cols[6] || "N/A",
                    mobile: cols[7] || "N/A",
                    role: "Student",
                    status: "Active",
                    enrollDate: new Date().toLocaleDateString(),
                    ...metadata,
                    history: []
                };
                newUser.name = `${newUser.lastName}, ${newUser.firstName} ${newUser.middleName}`.trim();

                const existingIdx = currentUsers.findIndex(u => u.id === newUser.id);
                if (existingIdx > -1) currentUsers[existingIdx] = newUser;
                else currentUsers.push(newUser);
                addedCount++;
            }
        });

        localStorage.setItem('wmsu_users', JSON.stringify(currentUsers));
        users = currentUsers;
        renderUserTable();
        updateStats();
        addAdminLog('INFO', `Bulk Enrollment Complete: ${addedCount} students registered to ${metadata.curriculum} ${metadata.section}`);
        closeBulkModal();
        alert(`Successfully enrolled ${addedCount} students.`);
    };
    reader.readAsText(fileInput.files[0]);
}

function filterUsers() {
    const input = document.getElementById('userSearch');
    const filter = (input.value || "").trim().toUpperCase();
    const table = document.getElementById('adminUserTable');
    if (!table) return;
    const tr = table.getElementsByTagName('tr');

    for (let i = 0; i < tr.length; i++) {
        const cellId = tr[i].getElementsByTagName('td')[0];
        const cellName = tr[i].getElementsByTagName('td')[1];
        const cellRole = tr[i].getElementsByTagName('td')[2];
        if (!cellId || !cellName || !cellRole) continue;

        const rawId = cellId.textContent;
        const rawName = cellName.textContent;
        const rawRole = cellRole.textContent;
        cellId.innerHTML = rawId;
        cellName.innerHTML = rawName;
        cellRole.innerHTML = rawRole;

        if (filter === "") {
            tr[i].style.display = "";
            continue;
        }

        const idText = rawId.toUpperCase();
        const nameText = rawName.toUpperCase();
        const roleText = rawRole.toUpperCase();

        const exactMatch = (idText + " " + nameText + " " + roleText).includes(filter);
        let fuzzyMatch = false;

        
        if (!exactMatch && filter.length >= 3) {
            const nameWords = nameText.split(/[\s,.]+/).filter(w => w.length >= 3);
            for (const word of nameWords) {
                const prefix = word.substring(0, filter.length);
                if (levenshteinDistance(prefix, filter) <= 1) {
                    fuzzyMatch = true;
                    break;
                }
            }
        }
        
        if (exactMatch || fuzzyMatch) {
            tr[i].style.display = "";
            cellId.innerHTML = highlightResult(rawId, filter);
            cellName.innerHTML = highlightResult(rawName, filter);
            cellRole.innerHTML = highlightResult(rawRole, filter);
        } else {
            tr[i].style.display = "none";
        }
    }

    // Debounced search history saving
    clearTimeout(searchTimeout);
    const term = input.value.trim();
    if (term.length > 2) {
        searchTimeout = setTimeout(() => saveSearchTerm(term), 1500);
    }
}

function highlightResult(text, term) {
    if (!term || term.trim() === "") return text;
    const termUpper = term.toUpperCase();
    const textUpper = text.toUpperCase();

    if (textUpper.includes(termUpper)) {
        const escapedTerm = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`(${escapedTerm})`, 'gi');
        return text.replace(regex, '<span class="highlight">$1</span>');
    }

    if (term.length >= 3) {
        const words = text.split(/([\s,.]+)/);
        return words.map(word => {
            const wordUpper = word.toUpperCase();
            if (word.length >= 3 && levenshteinDistance(wordUpper.substring(0, term.length), termUpper) <= 1) {
                return `<span class="highlight">${word}</span>`;
            }
            return word;
        }).join('');
    }
    return text;
}

function levenshteinDistance(s1, s2) {
    const len1 = s1.length;
    const len2 = s2.length;
    const matrix = Array.from({ length: len1 + 1 }, () => Array(len2 + 1).fill(0));
    for (let i = 0; i <= len1; i++) matrix[i][0] = i;
    for (let j = 0; j <= len2; j++) matrix[0][j] = j;
    for (let i = 1; i <= len1; i++) {
        for (let j = 1; j <= len2; j++) {
            const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
            matrix[i][j] = Math.min(matrix[i - 1][j] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j - 1] + cost);
        }
    }
    return matrix[len1][len2];
}

function updateSubjectPreview() {
    const curriculum = document.getElementById("curriculum").value;
    const academicYear = document.getElementById("academicYear").value || "2024-2025";
    const semester = document.getElementById("semester").value;
    const previewArea = document.getElementById("subject-list-preview");
    if(!previewArea) return;
    
    const programMapping = {
        "ACT-AD": {
            "2024-2025": {
                "1st Semester": ["Life and Works of Rizal", "PATHFIT-1","PURCOM-1", "Introduction to Computing Lec", "Introduction to Computing Lab", "CC-101 Lec", "CC-101 Lab","DS-118"],
                "2nd Semester": ["STS-101", "HCI-102", "WD-101", "OOP-101","RIPH-101","PATHFIT-2", "CC-102","DS-119"],
                "Summer": []
            },
            "2025-2026": {
                "1st Semester": ["RIPH-101", "GEC-101", "PATHFIT-1", "CC-101", "CC-102", "DS-118"],
                "2nd Semester": ["GEC-102", "PURCOM-1", "STS-101", "HCI-102", "WD-101", "OOP-101"],
                "Summer": []
            }
        },
        "ACT-NT": {
            "2024-2025": {
                "1st Semester": ["RIPH-101", "GEC-101", "PATHFIT-1", "CC-101", "CC-102", "DS-118"],
                "2nd Semester": ["GEC-102", "PURCOM-1", "STS-101", "HCI-102", "NET-101", "SYS-ADM", "CYBER-1"],
                "Summer": []
            },
            "2025-2026": {
                "1st Semester": ["RIPH-101", "GEC-101", "PATHFIT-1", "CC-101", "CC-102", "DS-118"],
                "2nd Semester": ["GEC-102", "PURCOM-1", "STS-101", "HCI-102", "NET-101", "SYS-ADM", "CYBER-1"],
                "Summer": []
            }
        },
        "CS": {
            "2024-2025": {
                "1st Semester": ["Life and Works of Rizal", "PATHFIT-1","PURCOM-1", "Introduction to Computing Lec", "Introduction to Computing Lab", "CC-101 Lec", "CC-101 Lab","DS-118"],
                "2nd Semester": ["STS-101", "HCI-102", "WD-101", "OOP-101","RIPH-101","PATHFIT-2", "CC-102","DS-119"],
                "Summer": []
            },
            "2025-2026": {
                "1st Semester": ["RIPH-101", "GEC-101", "PATHFIT-1", "CS-101", "CC-102", "DS-118", "CS-111"],
                "2nd Semester": ["GEC-102", "PURCOM-1", "STS-101", "HCI-102", "ALGO-1", "DBMS-1", "CS-102", "SOFT-ENG"],
                "Summer": []
            }
        },
        "IT": {
            "2024-2025": {
                "1st Semester": ["RIPH-101", "GEC-101", "PATHFIT-1", "IT-101", "CC-102", "DS-118"],
                "2nd Semester": ["GEC-102", "PURCOM-1", "STS-101", "HCI-102", "NET-1", "SYS-INT", "MOBILE-DEV", "WEB-SEC"],
                "Summer": []
            },
            "2025-2026": {
                "1st Semester": ["RIPH-101", "GEC-101", "PATHFIT-1", "IT-101", "CC-102", "DS-118"],
                "2nd Semester": ["GEC-102", "PURCOM-1", "STS-101", "HCI-102", "NET-1", "SYS-INT", "MOBILE-DEV", "WEB-SEC"],
                "Summer": []
            }
        }
    };

    let subjects = [];
    const yearMap = programMapping[curriculum] ? (programMapping[curriculum][academicYear] || programMapping[curriculum]["2024-2025"]) : null;
    if (yearMap) {
        subjects = yearMap[semester] || [];
    }
    
    const schedule = JSON.parse(localStorage.getItem('wmsu_schedule')) || [];
    const subjectLookup = new Map(schedule.map(s => [s.code, s.subject]));

    previewArea.innerHTML = subjects.map(code => {
        const displayTitle = subjectLookup.get(code) || code;
        return `<span style="background: white; border: 1px solid #e2e8f0; padding: 4px 10px; border-radius: 6px; font-size: 0.75rem; font-weight: 700; color: var(--wmsu-red); white-space: nowrap;">
            ${displayTitle}
        </span>`;
    }).join('') || `<span style="font-size:0.7rem; color:var(--text-muted);">Enter section (e.g. 1B) to preview subjects...</span>`;
}

function updateAnalytics() {
    const attendance = JSON.parse(localStorage.getItem('wmsu_attendance')) || [];
    const usersList = JSON.parse(localStorage.getItem('wmsu_users')) || [];
    const total = usersList.length;
    if (total === 0) return;

    const today = new Date().toDateString();
    const presentToday = new Set(attendance.filter(a => new Date(a.timestamp).toDateString() === today).map(a => a.id)).size;
    const lateToday = attendance.filter(a => new Date(a.timestamp).toDateString() === today && a.status === 'LATE').length;
    const absentToday = Math.max(0, total - presentToday);

    const p = Math.round((presentToday/total)*100);
    const l = Math.round((lateToday/total)*100);
    const a = 100 - p - l;

    const pie = document.querySelector('.pie-graph');
    if(pie) {
        pie.style.setProperty('--present', p + '%');
        pie.style.setProperty('--late', l + '%');
        pie.style.setProperty('--absent', Math.max(0, a) + '%');
    }
    
    // Update Terminal Health bar
    const devCount = (JSON.parse(localStorage.getItem('wmsu_devices')) || []).length;
    const onlineDev = (JSON.parse(localStorage.getItem('wmsu_devices')) || []).filter(d => d.status === 'Online').length;
    const health = devCount > 0 ? (onlineDev / devCount) * 100 : 0;
    const healthBar = document.querySelector('.stat-card:nth-child(2) .health-meter div');
    if (healthBar) healthBar.style.width = health + '%';
}

function getFacultySchedule(facultyId) {
    const usersList = JSON.parse(localStorage.getItem('wmsu_users')) || [];
    const schedule = JSON.parse(localStorage.getItem('wmsu_schedule')) || [];
    
    const faculty = usersList.find(u => u.id === facultyId);
    if (!faculty) return [];

    // Align by matching the Instructor field in schedule to the Faculty's Last Name or Full Name
    return schedule.filter(s => {
        const instructorMatch = s.instructor.toUpperCase().includes(faculty.lastName.toUpperCase()) || 
                                s.instructor.toUpperCase() === (faculty.name || '').toUpperCase();
        return instructorMatch;
    });
}

// ─────────────────────────────────────────────────────────
// SCHEDULE MANAGER
// ─────────────────────────────────────────────────────────
let editingScheduleIdx = null;

function renderScheduleTable() {
    const tbody = document.getElementById('scheduleTableBody');
    if (!tbody) return;
    const schedule = JSON.parse(localStorage.getItem('wmsu_schedule')) || [];

    if (schedule.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:20px;color:var(--text-muted);">No schedules found. Click "+ Add Schedule" to create one.</td></tr>';
        return;
    }

    tbody.innerHTML = schedule.map((s, idx) => {
        const days = Array.isArray(s.days) ? s.days.join(', ') : s.days;
        return `
        <tr onclick="editSchedule(${idx})" style="cursor: pointer;">
            <td><strong>${s.subject}</strong><br><small style="color:var(--text-muted);">${s.code || ''}</small></td>
            <td>${s.section}</td>
            <td>${days}</td>
            <td>${s.startTime} – ${s.endTime}<br><small style="color:var(--text-muted);">Late: ${s.lateMinutes || 15}min</small></td>
            <td>${s.room || '—'}</td>
            <td>${s.instructor || 'TBD'}</td>
            <td>${s.semester || '—'}</td>
            <td>
                <button onclick="event.stopPropagation(); editSchedule(${idx})" style="background:none;border:none;color:#4a5568;cursor:pointer;font-weight:bold;margin-right:8px;">Edit</button>
                <button onclick="event.stopPropagation(); deleteSchedule(${idx})" style="background:none;border:none;color:#e53e3e;cursor:pointer;font-weight:bold;">Delete</button>
            </td>
        </tr>`;
    }).join('');
}

function handleSubjectSelect(val) {
    const codeInput = document.getElementById('sched-code');
    if (val === 'custom') {
        const customName = prompt("Enter Custom Subject Name:");
        if (customName) {
            const opt = document.createElement('option');
            opt.value = customName;
            opt.text = customName;
            document.getElementById('sched-subject').add(opt, 1);
            document.getElementById('sched-subject').value = customName;
            codeInut.value = '';
            codeInput.focus();
        }
        return;
    }
    const match = SUBJECT_CATALOG.find(s => s.name === val);
    if (match) codeInput.value = match.code;
}

function openScheduleModal(idx = null) {
    editingScheduleIdx = idx;
    const modal = document.getElementById('scheduleModal');
    const title = document.getElementById('schedModalTitle');
    if (!modal) return;

    const subSelect = document.getElementById('sched-subject');
    subSelect.innerHTML = '<option value="">-- Pick Subject --</option>' + 
        SUBJECT_CATALOG.map(s => `<option value="${s.name}">${s.name}</option>`).join('') +
        '<option value="custom">Other / Custom Subject...</option>';

    document.getElementById('sched-code').value = '';
    document.getElementById('sched-instructor').value = '';
    document.getElementById('sched-section').value = '';
    document.getElementById('sched-start').value = '';
    document.getElementById('sched-end').value = '';
    document.getElementById('sched-room').value = '';
    document.getElementById('sched-late').value = '15';
    document.getElementById('sched-semester').value = '1st Semester';
    document.querySelectorAll('.sched-day-cb').forEach(cb => cb.checked = false);

    if (idx !== null) {
        const schedule = JSON.parse(localStorage.getItem('wmsu_schedule')) || [];
        const s = schedule[idx];
        if (!s) return;
        if (title) title.innerText = 'Edit Schedule';
        document.getElementById('sched-subject').value = s.subject || '';
        document.getElementById('sched-code').value = s.code || '';
        document.getElementById('sched-instructor').value = s.instructor || '';
        document.getElementById('sched-section').value = s.section || '';
        document.getElementById('sched-start').value = s.startTime || '';
        document.getElementById('sched-end').value = s.endTime || '';
        document.getElementById('sched-room').value = s.room || '';
        document.getElementById('sched-late').value = s.lateMinutes || 15;
        document.getElementById('sched-semester').value = s.semester || '1st Semester';
        const days = Array.isArray(s.days) ? s.days : [];
        document.querySelectorAll('.sched-day-cb').forEach(cb => {
            cb.checked = days.includes(cb.value);
        });
    } else {
        if (title) title.innerText = 'Add New Schedule';
    }
    modal.style.display = 'flex';
}

function closeScheduleModal() {
    const modal = document.getElementById('scheduleModal');
    if (modal) modal.style.display = 'none';
    editingScheduleIdx = null;
}

function handleSaveSchedule() {
    const subject = document.getElementById('sched-subject').value.trim();
    const section = document.getElementById('sched-section').value.trim();
    const startTime = document.getElementById('sched-start').value;
    const endTime = document.getElementById('sched-end').value;
    const days = Array.from(document.querySelectorAll('.sched-day-cb:checked')).map(cb => cb.value);

    if (!subject) { alert('Subject name is required.'); return; }
    if (!section) { alert('Section is required (e.g. ACT AD 1B).'); return; }
    if (!startTime || !endTime) { alert('Start and End times are required.'); return; }
    if (days.length === 0) { alert('Please select at least one class day.'); return; }

    const entry = {
        subject,
        code:        document.getElementById('sched-code').value.trim(),
        instructor:  document.getElementById('sched-instructor').value.trim(),
        section,
        days,
        startTime,
        endTime,
        room:        document.getElementById('sched-room').value.trim(),
        lateMinutes: parseInt(document.getElementById('sched-late').value) || 15,
        semester:    document.getElementById('sched-semester').value,
        units: 3
    };

    const schedule = JSON.parse(localStorage.getItem('wmsu_schedule')) || [];
    if (editingScheduleIdx !== null) {
        schedule[editingScheduleIdx] = entry;
        addAdminLog('INFO', `Schedule updated: ${subject} (${section})`);
    } else {
        schedule.push(entry);
        addAdminLog('INFO', `Schedule added: ${subject} (${section})`);
    }

    localStorage.setItem('wmsu_schedule', JSON.stringify(schedule));
    renderScheduleTable();
    closeScheduleModal();
}

function deleteSchedule(idx) {
    const schedule = JSON.parse(localStorage.getItem('wmsu_schedule')) || [];
    const entry = schedule[idx];
    if (!entry) return;
    if (confirm(`Delete schedule for "${entry.subject}" (${entry.section})?`)) {
        schedule.splice(idx, 1);
        localStorage.setItem('wmsu_schedule', JSON.stringify(schedule));
        addAdminLog('WARN', `Schedule deleted: ${entry.subject} (${entry.section})`);
        renderScheduleTable();
    }
}

function editSchedule(idx) {
    openScheduleModal(idx);
}

window.onload = initSystem;
