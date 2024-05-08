document.addEventListener('DOMContentLoaded', function() {
    const db = firebase.firestore();

    function searchEmployees() {
        const input = document.getElementById('search-bar').value.toUpperCase();
        const employeeList = document.getElementById('employee-list');
        const employees = employeeList.getElementsByClassName('employee-item');

        for (let i = 0; i < employees.length; i++) {
            let name = employees[i].getElementsByClassName('name')[0].innerText;
            if (name.toUpperCase().indexOf(input) > -1) {
                employees[i].style.display = "";
            } else {
                employees[i].style.display = "none";
            }
        }
    }

    function loadEmployees() {
        db.collection('users').get().then(querySnapshot => {
            const employeeList = document.getElementById('employee-list');
            employeeList.innerHTML = '';  // Clear existing entries
            querySnapshot.forEach(doc => {
                const user = doc.data();
                const div = document.createElement('div');
                div.className = 'employee-item';
                div.setAttribute('data-id', doc.id);
                div.innerHTML = `<div>
                                    <strong class='name'>Name: ${user.firstName} ${user.lastName}</strong><br>
                                    Phone: ${user.phoneNumber}<br>
                                    Birth Date: ${user.birthDate}<br>
                                    Gender: ${user.gender}<br>
                                    Job Role: ${user.jobRole}<br>
                                    Email: ${user.email}<br>
                                 </div>`
                employeeList.appendChild(div);
            });
        }).catch(error => {
            console.error("Error loading employees:", error);
        });
    }

    document.getElementById('employee-form').addEventListener('submit', function(event) {
        if (event.target.classList.contains('delete-button')) {
            const docId = event.target.getAttribute('data-id');
            deleteEmployee(docId);
        }
    }); 

    window.editEmployee = function(docId) {
        console.log("Edit Employee: ", docId);
        // Implement functionality or redirect to a form for editing employee details
    };

    loadEmployees();
    document.getElementById('search-bar').addEventListener('keyup', searchEmployees);
});
