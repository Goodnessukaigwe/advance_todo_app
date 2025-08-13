let students = [];
let currentEditId = null; 
const nameInput = document.getElementById('studentName');
const ageInput = document.getElementById('studentAge');
const studentClassInput = document.getElementById('studentClass');
const interestsInput = document.getElementById('studentInterests');

// Modal elements
const modal = document.getElementById('studentModal');
const modalTitle = document.getElementById('modalTitle');
const closeBtn = document.querySelector('.close');
const addStudentBtn = document.getElementById('addStudentBtn');
const cancelBtn = document.getElementById('cancelBtn');

// Start the app when page loads
window.addEventListener('load', function() {
    loadStudentsFromStorage();
    setupButtonClicks();
    setupModalEvents();
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
        closeModal();
        showMessage(`Student "${nameInput.value}" added successfully!`, 'success');
    }
}

// Update an existing student
function updateStudent() {
    const STUDENT = students.find(student => student.id === currentEditId);
    
    if (isValidStudent(nameInput.value, ageInput.value, studentClassInput.value, interestsInput.value)) {
        if (STUDENT) {
            STUDENT.name = nameInput.value;
            STUDENT.age = parseInt(ageInput.value);
            STUDENT.class = studentClassInput.value;
            STUDENT.interests = interestsInput.value;
            STUDENT.lastUpdated = new Date().toLocaleDateString();
        }
        
        saveStudentsToStorage();
        showAllStudents();
        clearForm();
        closeModal();
        
        currentEditId = null;
        document.querySelector('.btn-primary').textContent = 'Add Student';
        
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
    const SEARCHITEM = document.getElementById('searchInput').value.toLowerCase();
    const SORTBY = document.getElementById('sortBy').value;
    let filteredStudents = [];
    let FILTERED_STUDENTS = [];

    if (!SEARCHITEM) {
        FILTERED_STUDENTS = students;
    } else {
        FILTERED_STUDENTS = students.filter(student => 
            student.name.toLowerCase().includes(SEARCHITEM) ||
            student.class.toLowerCase().includes(SEARCHITEM) ||
            student.interests.toLowerCase().includes(SEARCHITEM)
        );
    }
    
  
    filteredStudents.length = 0;
    

    filteredStudents.push(...FILTERED_STUDENTS);

    if (SORTBY === 'name') {
        filteredStudents.sort((a, b) => a.name.localeCompare(b.name));
    } else if (SORTBY === 'age') {
        filteredStudents.sort((a, b) => a.age - b.age);
    } else if (SORTBY === 'class') {
        filteredStudents.sort((a, b) => a.class.localeCompare(b.class));
    }
    
    displayStudents(filteredStudents);
}

// Display students on the page
function displayStudents(studentsToShow) {
    const studentsList = document.getElementById('studentsList');
    const emptyState = document.getElementById('emptyState');
    const studentsTable = document.getElementById('studentsTable');
    
    if (studentsToShow.length === 0) {
        studentsTable.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }
    
    studentsTable.style.display = 'table';
    emptyState.style.display = 'none';
    
    let html = '';
    for (let i = 0; i < studentsToShow.length; i++) {
        const student = studentsToShow[i];
        html += createStudentTableRow(student);
    }
    
    studentsList.innerHTML = html;
}

// Create HTML for one student table row
function createStudentTableRow(student) {
    return `
        <tr class="fade-in">
            <td>${student.id}</td>
            <td>${escapeHTML(student.name)}</td>
            <td>${student.age}</td>
            <td>${escapeHTML(student.class)}</td>
            <td>${escapeHTML(student.interests)}</td>
            <td>${student.dateAdded}</td>
            <td>
                <div class="table-actions">
                    <button class="btn btn-edit" onclick="editStudent(${student.id})">
                        Edit
                    </button>
                    <button class="btn btn-delete" onclick="deleteStudent(${student.id})">
                        Delete
                    </button>
                </div>
            </td>
        </tr>
    `;
}

// Show all students
function showAllStudents() {
    displayStudents(students);
}

// Edit a student
function editStudent(id) {
    const STUDENT_NAME = students.find(student => student.id === id);
    
    if (STUDENT_NAME) {
        currentEditId = id;
        
        nameInput.value = STUDENT_NAME.name;
        ageInput.value = STUDENT_NAME.age;
        studentClassInput.value = STUDENT_NAME.class;
        interestsInput.value = STUDENT_NAME.interests;

        modalTitle.textContent = 'Edit Student';
        document.querySelector('.btn-primary').textContent = 'Update Student';
        openModal();
    }
}

// Modal functions
function openModal() {
    modal.style.display = 'block';
}

function closeModal() {
    modal.style.display = 'none';
    clearForm();
    currentEditId = null;
    modalTitle.textContent = 'Add New Student';
    document.querySelector('.btn-primary').textContent = 'Add Student';
}

function setupModalEvents() {
    // Open modal when Add Student button is clicked
    addStudentBtn.addEventListener('click', function() {
        openModal();
    });

    // Close modal when X button is clicked
    closeBtn.addEventListener('click', function() {
        closeModal();
    });

    // Close modal when Cancel button is clicked
    cancelBtn.addEventListener('click', function() {
        closeModal();
    });

    // Close modal when clicking outside of it
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            closeModal();
        }
    });
}

// Clear the form
function clearForm() {
    document.getElementById('studentForm').reset();
}

// Update the student count display
function updateStudentCount() {
    const COUNT = students.length;
    document.getElementById('studentsCount').textContent = `Total Students: ${COUNT}`;
}

// Make text safe for HTML
function escapeHTML(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Show messages to the user
function showMessage(message, type) {
    const MESSAGEBOX = document.createElement('div');
    MESSAGEBOX.className = `notification ${type}`;
    MESSAGEBOX.style.cssText = `
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
    MESSAGEBOX.textContent = message;

    document.body.appendChild(MESSAGEBOX);

    setTimeout(() => {
        MESSAGEBOX.style.transform = 'translateX(0)';
    }, 100);

    setTimeout(() => {
        MESSAGEBOX.style.transform = 'translateX(400px)';
        setTimeout(() => {
            if (MESSAGEBOX.parentNode) {
                MESSAGEBOX.parentNode.removeChild(MESSAGEBOX);
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
    const SAVEDDATA = JSON.parse(localStorage.getItem("studentsData"));
    
    if (SAVEDDATA) {
        students = SAVEDDATA;
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
    const DATASTRING = JSON.stringify(students, null, 2);
    const DATABLOB = new Blob([DATASTRING], { type: 'application/json' });

    const link = document.createElement('a');
    link.href = URL.createObjectURL(DATABLOB);
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
