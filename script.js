let students = [];
let currentEditId = null; 
const nameInput = document.getElementById('studentName');
const ageInput = document.getElementById('studentAge');
const studentClassInput = document.getElementById('studentClass');
const interestsInput = document.getElementById('studentInterests');

// Start the app when page loads
window.addEventListener('load', function() {
    loadStudentsFromStorage();
    setupButtonClicks();
    showAllStudents();
    updateStudentCount();
});

// Create a new student object
function createStudent(name, age, studentClass, interests) {
    return {
        id: students.length + 1,
        name: name,
        age: age,
        class: studentClass,
        interests: interests,
        dateAdded: new Date().toLocaleDateString(),
        lastUpdated: new Date().toLocaleDateString()
    };
}

// Add a new student
function addStudent() {
    if (isValidStudent(nameInput.value, ageInput.value, studentClassInput.value, interestsInput.value)) {
        const newStudent = createStudent(nameInput.value, ageInput.value, studentClassInput.value, interestsInput.value);
        students.push(newStudent);
        saveStudentsToStorage();
        showAllStudents();
        updateStudentCount();
        clearForm();
        showMessage(`Student "${nameInput.value}" added successfully!`, 'success');
    }
}

// Update an existing student
function updateStudent() {
    const studentIndex = students.findIndex(student => student.id === currentEditId);
    
    if (isValidStudent(nameInput.value, ageInput.value, studentClassInput.value, interestsInput.value)) {
        if (studentIndex !== -1) {
            students[studentIndex].name = nameInput.value;
            students[studentIndex].age = parseInt(ageInput.value);
            students[studentIndex].class = studentClassInput.value;
            students[studentIndex].interests = interestsInput.value;
            students[studentIndex].lastUpdated = new Date().toLocaleDateString();
        }
        
        saveStudentsToStorage();
        showAllStudents();
        clearForm();
        
        currentEditId = null;
        document.querySelector('.btn-primary').textContent = 'Add Student';
        document.getElementById('cancelEdit').style.display = 'none';
        
        showMessage(`Student "${nameInput.value}" updated successfully!`, 'success');
    }
}

// Delete a student
function deleteStudent(id) {
   const STUDENT_NAME = students.find(student => student.id === id)?.name || 'Unknown Student';

    if (confirm(`Are you sure you want to delete "${STUDENT_NAME}"?`)) {
        students = students.filter(student => student.id !== id);
        saveStudentsToStorage();
        showAllStudents();
        updateStudentCount();
        showMessage(`Student "${STUDENT_NAME}" deleted successfully!`, 'success');
    }
}

// Check if student data is valid
function isValidStudent(name, age, studentClass, interests) {
    if (!name || name.trim().length < 2) {
        showMessage('Student name must be at least 2 characters long!', 'error');
        return false;
    }
    
    if (!age || age < 5 || age > 100) {
        showMessage('Student age must be between 5 and 100!', 'error');
        return false;
    }
    
    if (!studentClass || studentClass.trim().length < 1) {
        showMessage('Student class is required!', 'error');
        return false;
    }
    
    if (!interests || interests.trim().length < 3) {
        showMessage('Student interests must be at least 3 characters long!', 'error');
        return false;
    }
    
    return true;
}

// Search for students
function searchStudents() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const sortBy = document.getElementById('sortBy').value;
    
    let filteredStudents = [];
    
    if (!searchTerm) {
        filteredStudents = students;
    } else {
        for (let i = 0; i < students.length; i++) {
            const student = students[i];
            if (student.name.toLowerCase().includes(searchTerm) ||
                student.class.toLowerCase().includes(searchTerm) ||
                student.interests.toLowerCase().includes(searchTerm)) {
                filteredStudents.push(student);
            }
        }
    }
    
    if (sortBy === 'name') {
        filteredStudents.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'age') {
        filteredStudents.sort((a, b) => a.age - b.age);
    } else if (sortBy === 'class') {
        filteredStudents.sort((a, b) => a.class.localeCompare(b.class));
    }
    
    displayStudents(filteredStudents);
}

// Display students on the page
function displayStudents(studentsToShow) {
    const studentsList = document.getElementById('studentsList');
    
    if (studentsToShow.length === 0) {
        studentsList.innerHTML = `
            <div class="empty-state">
                <h3>No students found</h3>
                <p>Add your first student to get started!</p>
            </div>
        `;
        return;
    }
    
    let html = '';
    for (let i = 0; i < studentsToShow.length; i++) {
        const student = studentsToShow[i];
        html += createStudentHTML(student);
    }
    
    studentsList.innerHTML = html;
}

// Create HTML for one student card
function createStudentHTML(student) {
    return `
        <div class="student-card fade-in" data-id="${student.id}">
            <div class="student-header">
                <h3 class="student-name">${escapeHTML(student.name)}</h3>
                <span class="student-id">ID: ${student.id}</span>
            </div>
            
            <div class="student-info">
                <p><strong>Age:</strong> ${student.age} years old</p>
                <p><strong>Class:</strong> ${escapeHTML(student.class)}</p>
                <div class="student-interests">
                    <p><strong>Interests:</strong> ${escapeHTML(student.interests)}</p>
                </div>
                <p><strong>Added:</strong> ${student.dateAdded}</p>
                ${student.lastUpdated !== student.dateAdded ? 
                    `<p><strong>Updated:</strong> ${student.lastUpdated}</p>` : ''}
            </div>
            
            <div class="student-actions">
                <button class="btn btn-edit" onclick="editStudent(${student.id})">
                    Edit
                </button>
                <button class="btn btn-delete" onclick="deleteStudent(${student.id})">
                    Delete
                </button>
            </div>
        </div>
    `;
}

// Show all students
function showAllStudents() {
    displayStudents(students);
}

// Edit a student
function editStudent(id) {
    const student = students.find(student => student.id === id);
    
    if (student) {
        currentEditId = id;
        
        nameInput.value = student.name;
        ageInput.value = student.age;
        studentClassInput.value = student.class;
        interestsInput.value = student.interests;
        
        document.querySelector('.btn-primary').textContent = 'Update Student';
        document.getElementById('cancelEdit').style.display = 'inline-block';
        
        document.querySelector('.add-student-section').scrollIntoView({ 
            behavior: 'smooth' 
        });
    }
}

// Cancel editing
function cancelEdit() {
    currentEditId = null;
    clearForm();
    document.querySelector('.btn-primary').textContent = 'Add Student';
    document.getElementById('cancelEdit').style.display = 'none';
}

// Clear the form
function clearForm() {
    document.getElementById('studentForm').reset();
}

// Update the student count display
function updateStudentCount() {
    const count = students.length;
    document.getElementById('studentsCount').textContent = `Total Students: ${count}`;
}

// Make text safe for HTML
function escapeHTML(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Show messages to the user
function showMessage(message, type) {
    const messageBox = document.createElement('div');
    messageBox.className = `notification ${type}`;
    messageBox.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 600;
        z-index: 1000;
        transform: translateX(400px);
        transition: transform 0.3s ease;
        ${type === 'success' ? 'background: #38a169;' : 'background: #e53e3e;'}
    `;
    messageBox.textContent = message;

    document.body.appendChild(messageBox);

    setTimeout(() => {
        messageBox.style.transform = 'translateX(0)';
    }, 100);

    setTimeout(() => {
        messageBox.style.transform = 'translateX(400px)';
        setTimeout(() => {
            if (messageBox.parentNode) {
                messageBox.parentNode.removeChild(messageBox);
            }
        }, 300);
    }, 3000);
}

// Save students to browser storage
function saveStudentsToStorage() {
    localStorage.setItem('studentsData', JSON.stringify(students));
}

// Load students from browser storage
function loadStudentsFromStorage() {
    const savedData = JSON.parse(localStorage.getItem("studentsData"));
    
    if (savedData) {
        students = savedData;
    }
}

// Set up button clicks and form submission
function setupButtonClicks() {
    document.getElementById('studentForm').addEventListener('submit', function(event) {
        event.preventDefault();
        
        if (currentEditId) {
            updateStudent();
        } else {
            addStudent();
        }
    });

    document.getElementById('cancelEdit').addEventListener('click', function() {
        cancelEdit();
    });

    document.getElementById('searchInput').addEventListener('input', function() {
        searchStudents();
    });

    document.getElementById('sortBy').addEventListener('change', function() {
        searchStudents();
    });

    document.getElementById('searchInput').addEventListener('keyup', function(event) {
        if (event.key === 'Escape') {
            event.target.value = '';
            searchStudents();
        }
    });
}

// Export student data
function exportData() {
    const dataString = JSON.stringify(students, null, 2);
    const dataBlob = new Blob([dataString], { type: 'application/json' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `students_backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    showMessage('Student data exported successfully!', 'success');
}

// Clear all data
function clearAllData() {
    if (confirm('Are you sure you want to delete ALL student data? This cannot be undone!')) {
        students = [];
        currentEditId = null;
        saveStudentsToStorage();
        showAllStudents();
        updateStudentCount();
        clearForm();
        showMessage('All student data cleared!', 'success');
    }
}
