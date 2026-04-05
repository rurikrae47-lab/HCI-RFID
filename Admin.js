// Load students from localStorage
let students = JSON.parse(localStorage.getItem("students")) || [];

// Render table
function renderTable() {
    const table = document.querySelector("#studentTable tbody");
    table.innerHTML = "";

    students.forEach((student, index) => {
        table.innerHTML += `
            <tr>
                <td>${student.id}</td>
                <td>${student.name}</td>
                <td>
                    <button onclick="deleteStudent(${index})">Delete</button>
                </td>
            </tr>
        `;
    });
}

// Add student
function addStudent() {
    const id = document.getElementById("studentId").value;
    const name = document.getElementById("studentName").value;

    if (!id || !name) {
        alert("Please fill all fields");
        return;
    }

    students.push({ id, name });
    localStorage.setItem("students", JSON.stringify(students));

    renderTable();

    document.getElementById("studentId").value = "";
    document.getElementById("studentName").value = "";
}

// Delete student
function deleteStudent(index) {
    students.splice(index, 1);
    localStorage.setItem("students", JSON.stringify(students));
    renderTable();
}

// Clear all
function clearAll() {
    if (confirm("Are you sure?")) {
        localStorage.removeItem("students");
        students = [];
        renderTable();
    }
}

// Initialize
renderTable();
