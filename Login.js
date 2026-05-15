window.onload = function() {
    let users = JSON.parse(localStorage.getItem('wmsu_users')) || [];
    
    const defaultFaculty = [
        { id: "2025-001", name: "ROJAS, MARJORIE", role: "Faculty", status: "Active", lastName: "ROJAS" },
        { id: "2025-002", name: "LINES, MARVIC", role: "Faculty", status: "Active", lastName: "LINES" },
        { id: "2025-003", name: "BALLAHO, JAYDEE", role: "Faculty", status: "Active", lastName: "BALLAHO" },
        { id: "2025-004", name: "BALAN, JOJEN", role: "Faculty", status: "Active", lastName: "BALAN" },
        { id: "2025-005", name: "RHAMIR, JAAFAR", role: "Faculty", status: "Active", lastName: "RHAMIR" },
        { id: "2025-006", name: "MARTIN, BILLY JEAN", role: "Faculty", status: "Active", lastName: "MARTIN" },
        { id: "2025-007", name: "REIGN RAIN, REIN", role: "Faculty", status: "Active", lastName: "REIGN" }
    ];

    const defaultStudents = [
        { id: "2025-02697", name: "AGEAS, ROVHIC CHAWEE A.", role: "Student", status: "Active", curriculum: "ACT-AD", section: "1B", semester: "1st Semester", academicYear: "2024-2025" },
        { id: "2025-01218", name: "AHAMAD, AINEE HANA TAN.", role: "Student", status: "Active", curriculum: "ACT-AD", section: "1B", semester: "1st Semester", academicYear: "2024-2025" },
        { id: "2025-02972", name: "BAGARINAO, ONYX FERRER.", role: "Student", status: "Active", curriculum: "ACT-AD", section: "1B", semester: "1st Semester", academicYear: "2024-2025" },
        { id: "2025-02601", name: "VILLALOBOS, RURIK RAE RELLON.", role: "Student", status: "Active", curriculum: "ACT-AD", section: "1B", semester: "1st Semester", academicYear: "2024-2025" }
    ];

    [...defaultFaculty, ...defaultStudents].forEach(defUser => {
        const existingIndex = users.findIndex(u => u.id === defUser.id);
        if (existingIndex !== -1) {
            // Merge data to preserve admin edits while ensuring defaults exist
            users[existingIndex] = { ...defUser, ...users[existingIndex] };
        } else {
            users.push(defUser);
        }
    });
    localStorage.setItem('wmsu_users', JSON.stringify(users));

    const togglePassword = document.getElementById('togglePassword');
    const passwordField = document.getElementById('loginPassword');
    if (togglePassword && passwordField) {
        togglePassword.addEventListener('click', function() {
            const type = passwordField.type === 'password' ? 'text' : 'password';
            passwordField.type = type;
            
        });
    }

    const forgotLink = document.getElementById('forgotPasswordLink');
    if (forgotLink) {
        forgotLink.addEventListener('click', function(e) {
            e.preventDefault();
            alert("WMSU SUPPORT: For security reasons, password resets must be requested through the ICT Office. Please present your Student/Employee ID at the help desk or contact us at support@wmsu.edu.ph.");
        });
    }
};

function clearErrors() {
    const idError = document.getElementById('idError');
    const passwordError = document.getElementById('passwordError');
    if (idError) {
        idError.textContent = '';
        idError.classList.remove('show');
    }
    if (passwordError) {
        passwordError.textContent = '';
        passwordError.classList.remove('show');
    }
}

function displayError(fieldId, message) {
    const errorElement = document.getElementById(fieldId);
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.classList.add('show');
    }
}

document.getElementById('unifiedPortalLogin').onsubmit = function(e) {
    e.preventDefault();
    clearErrors();
    
    let identity = document.getElementById('loginIdentity').value.trim();
    const password = document.getElementById('loginPassword').value;
    
    if (!identity) {
        displayError('idError', 'ID number or username is required');
        return;
    }
    if (!password) {
        displayError('passwordError', 'Password is required');
        return;
    }
    
    // Format ID if numeric
    if (/^[0-9]{9}$/.test(identity)) identity = identity.substring(0, 4) + '-' + identity.substring(4);
    
    const identityLower = identity.toLowerCase();
    const users = JSON.parse(localStorage.getItem('wmsu_users')) || [];

    if (identityLower === 'admin' && password === 'admin123') {
        window.location.href = 'RFID_Admin.html';
        return;
    }

    const foundUser = users.find(u => u.id?.toLowerCase() === identityLower);
    if (foundUser) {
        const isFaculty = foundUser.role === 'Faculty' || foundUser.role === 'Teacher';
        const correctPassword = isFaculty ? '12345' : 'password123';
        
        if (password === correctPassword) {
            localStorage.setItem(isFaculty ? 'wmsu_current_faculty' : 'wmsu_current_student', foundUser.id);
            window.location.href = isFaculty ? 'onyx.html' : 'studentdashboard.html';
        } else {
            displayError('passwordError', 'Invalid password');
        }
    } else {
        displayError('idError', 'User ID not found');
    }
};

document.getElementById('loginIdentity').addEventListener('input', function() {
    clearErrors();
    let val = this.value.trim();
    if (/^[0-9]{9}$/.test(val)) this.value = val.substring(0, 4) + '-' + val.substring(4);
});
u.id
