//login
function login() {

    let username = document.getElementById("username").value.trim();
    let password = document.getElementById("password").value.trim();

    if (username === "") {
        alert("Enter Username");
        return;
    }

    if (password === "") {
        alert("Enter Password");
        return;
    }

    console.log("Username:", username);
    console.log("Login request sending...");

    fetch("https://student-management-system-5xwr.onrender.com/login", {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            username: username,
            password: password
        })

    })

    .then(res => {

        console.log("Server Status:", res.status);

        return res.json();

    })

    .then(data => {

        console.log("Login Response:", data);

        if (data.success) {

            localStorage.setItem("login", "true");

            localStorage.setItem("role", data.role);

            if (data.studentId) {
                localStorage.setItem("studentId", data.studentId);
            }

         if (data.role === "teacher") {

            localStorage.setItem("teacherId", data.teacherId);
            localStorage.setItem("teacherName", data.teacherName);
            localStorage.setItem("teacherDepartment", data.department);
            localStorage.setItem("teacherYear", data.year);
            localStorage.setItem("teacherShift", data.college_shift);
            

            }

            alert(data.message);

            window.location.href = "dashboard.html";

        } else {

            alert(data.message);

        }

    })

    .catch(err => {

        console.error("Login Error:", err);

        alert("Cannot connect to backend server");

    });
}
// Logout
function logout() {
    localStorage.removeItem("login");

    window.location.href = "login.html";
}

// Add Student
function addStudent() {

    let formData = new FormData();

    formData.append("name", document.getElementById("name").value);
    formData.append("regno", document.getElementById("regno").value);
    formData.append("gender", document.getElementById("gender").value);
    formData.append("dob", document.getElementById("dob").value);
    formData.append("bloodgroup", document.getElementById("bloodgroup").value);
    formData.append("department", document.getElementById("department").value);
    formData.append("year", document.getElementById("year").value);
    formData.append("phone", document.getElementById("phone").value);
    formData.append("email", document.getElementById("email").value);
    formData.append("address", document.getElementById("address").value);
    formData.append("parentname", document.getElementById("parentname").value);
    formData.append("parentphone", document.getElementById("parentphone").value);
    formData.append("batch", document.getElementById("batch").value);
    formData.append("college_shift",document.getElementById("college_shift").value);
    formData.append("admission_date", document.getElementById("admission_date").value);
    let photo = document.getElementById("photo").files[0];

    if (photo) {
        formData.append("photo", photo);
    }

    fetch("https://student-management-system-5xwr.onrender.com/students", {
        method: "POST",
        body: formData
    })
    
      .then(response => response.json())
.then(data => {

    console.log("ADD STUDENT RESPONSE:", data);

    if (!data.success) {
        alert("Error: " + data.message);
        return;
    }

    alert(data.message);  
    // Database 
    document.getElementById("id").value = data.id;

    loadStudents();

   
    document.getElementById("name").value = "";
    document.getElementById("regno").value = "";
    document.getElementById("gender").selectedIndex = 0;
    document.getElementById("dob").value = "";
    document.getElementById("bloodgroup").selectedIndex = 0;
    document.getElementById("department").selectedIndex = 0;
    document.getElementById("year").selectedIndex = 0;
    document.getElementById("phone").value = "";
    document.getElementById("email").value = "";
    document.getElementById("address").value = "";
    document.getElementById("parentname").value = "";
    document.getElementById("parentphone").value = "";
    document.getElementById("batch").value = "";
    document.getElementById("admission_date").value = "";
    document.getElementById("college_shift").value = "";
    document.getElementById("photo").value = "";
})
    
    .catch(error => console.log(error));

}

// Search Student
   function searchStudent() {

    let input = document.getElementById("search").value.toUpperCase();

    let table = document.getElementById("studentTable");
    let tr = table.getElementsByTagName("tr");

    for (let i = 0; i < tr.length; i++) {

        let td = tr[i].getElementsByTagName("td")[1];

        if (td) {

            let value = td.textContent || td.innerText;

            if (value.toUpperCase().indexOf(input) > -1) {
                tr[i].style.display = "";
            } else {
                tr[i].style.display = "none";
            }

        }
    }
}
  
// LOAD STUDENts
 function loadStudents(){

  const role = localStorage.getItem("role");

    let apiUrl = "https://student-management-system-5xwr.onrender.com/students";
    // TEACHER
    // Teacher department + year

 if (role === "teacher") {

    const teacherId =
        localStorage.getItem("teacherId");

    console.log("Teacher ID:", teacherId);

    if (!teacherId) {
        alert("Teacher ID not found");
        return;
    }

    apiUrl =
        "https://student-management-system-5xwr.onrender.com/teacher-students/"
        + encodeURIComponent(teacherId);
}
    // =========================================
    // LOAD DATA
    // =========================================

    fetch(apiUrl)

    .then(response => response.json())

    .then(result => {

        // Teacher API returns {success:true,data:[]}
        // Admin API returns array

        const data =
            role === "teacher"
                ? result.data
                : result;


        if (!Array.isArray(data)) {

            console.error("Invalid student data:", result);

            return;
        }


        // =========================================
        // DASHBOARD COUNTS
        // =========================================

        if (document.getElementById("totalStudents")) {

            document.getElementById("totalStudents").innerText =
                data.length;


            let departments =
                [...new Set(
                    data.map(student => student.department)
                )];


            document.getElementById("totalDepartments").innerText =
                departments.length;


            document.getElementById("firstYear").innerText =
                data.filter(
                    student => student.year === "1st Year"
                ).length;


            document.getElementById("secondYear").innerText =
                data.filter(
                    student => student.year === "2nd Year"
                ).length;


            document.getElementById("thirdYear").innerText =
                data.filter(
                    student => student.year === "3rd Year"
                ).length;

        }


        // =========================================
        // STUDENT TABLE
        // =========================================

        let table =
            document.getElementById("studentTable");


        if (!table) {
            return;
        }


        table.innerHTML = "";


        data.forEach(student => {

            let row = table.insertRow();


            row.insertCell(0).innerHTML =
                student.id;

            row.insertCell(1).innerHTML =
                student.name;

            row.insertCell(2).innerHTML =
                student.reg_no;

            row.insertCell(3).innerHTML =
                student.gender;

            row.insertCell(4).innerHTML =
                student.dob;

            row.insertCell(5).innerHTML =
                student.blood_group;

            row.insertCell(6).innerHTML =
                student.department;

            row.insertCell(7).innerHTML =
                student.year;

            row.insertCell(8).innerHTML =
                student.phone;

            row.insertCell(9).innerHTML =
                student.email;

            row.insertCell(10).innerHTML =
                student.address;

            row.insertCell(11).innerHTML =
               student.parent_name;

            row.insertCell(12).innerHTML =
                student.parent_phone;

            row.insertCell(13).innerHTML =
                student.batch || "";

            row.insertCell(14).innerHTML =
                 student.college_shift || "";

            row.insertCell(15).innerHTML =
                 student.admission_date
                ? student.admission_date.split("T")[0]
                : "";


            let profileCell = row.insertCell(16);


            profileCell.innerHTML =

                `<button onclick="viewProfile(${student.id})">
                    👁 View
                </button>

                <button onclick="viewIDCard(${student.id})">
                    🪪 ID Card
                </button>`;

            // PHOTO
           let photoCell = row.insertCell(17);

const photoUrl = student.photo
    ? `https://student-management-system-5xwr.onrender.com/uploads/${student.photo}`
    : "";

if (student.photo) {

    photoCell.innerHTML = `
        <img
            src="${photoUrl}"
            width="60"
            height="60"
            style="border-radius:5px;cursor:pointer;"
            onclick="showPhoto('${photoUrl}')"
            oncontextmenu="changePhoto(event, ${student.id})"
        >
        <br>

        ${
            (role === "admin" || role === "teacher")
            ? `<span
                style="color:#007bff;cursor:pointer;font-weight:bold;"
                onclick="changePhoto(event, ${student.id})">
                ✏️ Change
              </span>`
            : ""
        }
    `;

} else {

    photoCell.innerHTML = `
        ${
            (role === "admin" || role === "teacher")
            ? `<span
                style="color:#007bff;cursor:pointer;font-weight:bold;"
                onclick="changePhoto(event, ${student.id})">
                ➕ Add Photo
              </span>`
            : `<span>No Photo</span>`
        }
    `;
}


           
            // DOUBLE CLICK EDIT
row.ondblclick = function () {

    // Teacher should NOT edit students
    if (role === "teacher") {
        return;
    }

    // Edit only student information
    // 1 to 15 = Name → Admission Date
   for (let i = 1; i <= 15; i++) {

        let text = row.cells[i].innerText.trim();

        // DOB = cell 4
        if (i === 4) {

            if (text.includes("T")) {
                text = text.split("T")[0];
            }

            row.cells[i].innerHTML =
                `<input
                    type="date"
                    value="${text}"
                >`;

        } else {

            row.cells[i].innerHTML =
                `<input
                    type="text"
                    value="${text}"
                >`;
        }
    }

    row.cells[1]
        .querySelector("input")
        .focus();
};

            // SAVE EDIT
           

            row.addEventListener(
                "keydown",
                function(e) {

                    if (
                        e.key === "Enter" &&
                        role !== "teacher"
                    ) {

                        saveRow(
                            student.id,
                            row
                        );

                    }

                }
            );


           
            // INDEX PAGE FORM
              if (
                document.getElementById("name") &&
                role !== "teacher"
            ) {

                row.onclick = function () {

                    document.getElementById("id").value =
                        student.id;

                    document.getElementById("name").value =
                        student.name;

                    document.getElementById("regno").value =
                        student.reg_no;

                    document.getElementById("gender").value =
                        student.gender;

                    document.getElementById("dob").value =
                        student.dob
                            ? student.dob.split("T")[0]
                            : "";

                    document.getElementById("bloodgroup").value =
                        student.blood_group;

                    document.getElementById("department").value =
                        student.department;

                    document.getElementById("year").value =
                        student.year;

                    document.getElementById("phone").value =
                        student.phone;

                    document.getElementById("email").value =
                        student.email;

                    document.getElementById("address").value =
                        student.address;

                    document.getElementById("parentname").value =
                        student.parent_name;

                    document.getElementById("parentphone").value =
                        student.parent_phone;

                    document.getElementById("batch").value =
                        student.batch || "";

                    document.getElementById("college_shift").value =
                         student.college_shift || "";

                    document.getElementById("admission_date").value =
                        student.admission_date
                        
                        ? student.admission_date.split("T")[0]
                             : "";

                    document.getElementById("photo").value =
                        "";

                };

            }

        });

    })

    .catch(error => {

        console.error(
            "Load Students Error:",
            error
        );

    });

}


// Delete Student
function deleteStudent() {


    let id = document.getElementById("id").value;

    if (id === "") {
        alert("Enter Student ID");
        return;
    }

    fetch("student-management-system-5xwr.onrender.com/" + id, {
        method: "DELETE"
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message);
        loadStudents();
        cancelForm();
    })
    .catch(error => console.log(error));

}



//cancelForm
function cancelForm() {

    document.getElementById("id").value = "";
    document.getElementById("name").value = "";
    document.getElementById("regno").value = "";
    document.getElementById("gender").selectedIndex = 0;
    document.getElementById("dob").value = "";
    document.getElementById("bloodgroup").selectedIndex = 0;
    document.getElementById("department").selectedIndex = 0;
    document.getElementById("college_shift").selectedIndex = 0;
    document.getElementById("year").selectedIndex = 0;
    document.getElementById("phone").value = "";
    document.getElementById("email").value = "";
    document.getElementById("address").value = "";
    document.getElementById("parentname").value = "";
    document.getElementById("parentphone").value = "";
    document.getElementById("batch").value = "";
    document.getElementById("admission_date").value = "";
    document.getElementById("photo").value = "";

}

fetch("https://student-management-system-5xwr.onrender.com")
.then(res => res.text())
.then(data => console.log(data))
.catch(err => console.log(err));

   if(document.getElementById("studentTable") || document.getElementById("totalStudents")){
    loadStudents();
}

   
// Photo Popup
function showPhoto(photo) {
    document.getElementById("photoModal").style.display = "block";
    document.getElementById("popupPhoto").src = photo;
}

function closePhoto() {
    document.getElementById("photoModal").style.display = "none";
}

//saveRow
function saveRow(id, row) {

    console.log("saveRow called:", id);
    console.log("Sending PUT request...");

    console.log(
        "DOB =",
        row.cells[4].querySelector("input").value
    );

    console.log(
        "College Shift =",
        row.cells[14].querySelector("input").value
    );

    console.log(
        "Admission Date =",
        row.cells[15].querySelector("input").value
    );

    fetch("https://student-management-system-5xwr.onrender.com/students/" + id, {

        method: "PUT",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({

            name: row.cells[1].querySelector("input").value,
            regno: row.cells[2].querySelector("input").value,
            gender: row.cells[3].querySelector("input").value,
            dob: row.cells[4].querySelector("input").value,
            bloodgroup: row.cells[5].querySelector("input").value,
            department: row.cells[6].querySelector("input").value,
            year: row.cells[7].querySelector("input").value,
            phone: row.cells[8].querySelector("input").value,
            email: row.cells[9].querySelector("input").value,
            address: row.cells[10].querySelector("input").value,
            parentname: row.cells[11].querySelector("input").value,
            parentphone: row.cells[12].querySelector("input").value,
            batch: row.cells[13].querySelector("input").value,
            college_shift: row.cells[14].querySelector("input").value,
            admission_date: row.cells[15].querySelector("input").value

        })

    })

    .then(res => res.json())

    .then(data => {

        console.log("UPDATE RESPONSE:", data);

        alert(data.message);

        loadStudents();

    })

    .catch(err => {

        console.error("Update Error:", err);

    });

}

//changePhoto
function changePhoto(event, studentId) {

    event.preventDefault();
    event.stopPropagation();

    const role = localStorage.getItem("role");

    
    if (role !== "admin" && role !== "teacher") {
        alert("You don't have permission to change photo");
        return;
    }

    const input = document.createElement("input");

    input.type = "file";
    input.accept = "image/*";

    input.onchange = function () {

        const file = input.files[0];

        if (!file) {
            return;
        }

        const formData = new FormData();
        formData.append("photo", file);

        fetch(
            "https://student-management-system-5xwr.onrender.com/students/" +
            studentId +
            "/photo",
            {
                method: "PUT",
                body: formData
            }
        )
        .then(response => response.json())
        .then(data => {

            console.log("Photo Update:", data);

            if (data.success) {

                alert("Photo Updated Successfully ✅");

                loadStudents();

            } else {

                alert(data.message || "Photo update failed");

            }

        })
        .catch(error => {

            console.error("Photo Update Error:", error);

            alert("Server error while updating photo");

        });

    };

    input.click();
}

//loadProfile
function loadProfile() {

    let id = localStorage.getItem("studentId");

    console.log("Loading Profile ID =", id);

    if (!id) return;

    fetch("https://student-management-system-5xwr.onrender.com/students/" + id)
    .then(res => res.json())
    .then(student => {

        document.getElementById("profilePhoto").src =
            "https://student-management-system-5xwr.onrender.com/uploads/" + student.photo;

        document.getElementById("profileName").innerText = student.name;
        document.getElementById("profileRegno").innerText = student.reg_no;
        document.getElementById("profileGender").innerText = student.gender;
        document.getElementById("profileDob").innerHTML =
        new Date(student.dob).toLocaleDateString("en-GB");
        document.getElementById("profileBlood").innerText = student.blood_group;
        document.getElementById("profileDepartment").innerText = student.department;
        document.getElementById("profileYear").innerText = student.year;
        document.getElementById("profilePhone").innerText = student.phone;
        document.getElementById("profileEmail").innerText = student.email;
        document.getElementById("profileAddress").innerText = student.address;
        document.getElementById("profileParentName").innerText = student.parent_name;
        document.getElementById("profileParentPhone").innerText = student.parent_phone;
        document.getElementById("profileBatch").innerText = student.batch;
        document.getElementById("profileCollegeshift").innerText = student.college_shift;
        document.getElementById("profileAdmissionDate").innerText = student.admission_date
        ? new Date(student.admission_date).toLocaleDateString("en-GB"):"";

    })
    .catch(err => console.log(err));

}

if (document.getElementById("profileName")) {
    loadProfile();
}

//viewProfile
function viewProfile(id) {

    console.log("Student ID =", id);

    localStorage.setItem("studentId", id);

    window.location.href = "profile.html";

}

// Attendance Load
function loadAttendance() {

    fetch("https://student-management-system-5xwr.onrender.com/students") 
    .then(res => res.json()) 
    .then(data => { 
      
        let table = document.getElementById("attendanceBody"); 
        table.innerHTML = ""; 
 
        data.forEach(student => { 
 
            let row = table.insertRow(); 
 
            row.insertCell(0).innerHTML = student.id; 
            row.insertCell(1).innerHTML = student.name; 
            row.insertCell(2).innerHTML = student.reg_no; 
            row.insertCell(3).innerHTML = student.department; 
            row.insertCell(4).innerHTML = student.year; 
 
            row.insertCell(5).innerHTML = ` 
                <select id="status${student.id}"> 
                    <option value="Present">Present</option> 
                    <option value="Absent">Absent</option> 
                </select> 
            `; 
 
            row.insertCell(6).innerHTML = ` 
                <button onclick="saveAttendance(${student.id})"> 
                    Save 
                </button> 
            `; 
        }); 
 
    }) 
    .catch(err => console.log(err)); 
 
}  
// searchAttendance
function searchAttendance() {

    let input = document.getElementById("searchAttendance").value.toUpperCase();

    let table = document.getElementById("attendanceBody");
    let rows = table.getElementsByTagName("tr");

    for(let i = 0; i < rows.length; i++){

        let td = rows[i].getElementsByTagName("td")[1];

        if(td){

            let value = td.innerText.toUpperCase();

            rows[i].style.display =
                value.indexOf(input) > -1 ? "" : "none";
        }
    }
}

if(document.getElementById("attendanceBody")){
    loadAttendance();
}

//saveAttendance
function saveAttendance(id) {

    let attendanceDate = document.getElementById("attendanceDate").value;

    if (attendanceDate === "") {
        alert("Select Attendance Date");
        return;
    }

    let status = document.getElementById("status" + id).value;

    fetch("https://student-management-system-5xwr.onrender.com/attendance", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            student_id: id,
            attendance_date: attendanceDate,
            status: status
        })
    })
    .then(res => res.json())
    .then(data => {
        alert(data.message);
    })
    .catch(err => console.log(err));

}

 //loadAttendanceRecords
function loadAttendanceRecords() {

    fetch("https://student-management-system-5xwr.onrender.com/attendance")
    .then(res => res.json())
    .then(data => {

        let table = document.getElementById("attendanceRecordTable");

        table.innerHTML = "";

        let searchDate = document.getElementById("searchDate").value;

        if(searchDate !== ""){
            data = data.filter(record =>
                record.attendance_date.split("T")[0] === searchDate
            );
        }

        data.forEach(record => {

            let row = table.insertRow();

            row.insertCell(0).innerHTML = record.attendance_id;
            row.insertCell(1).innerHTML = record.name;
            row.insertCell(2).innerHTML = record.reg_no;
            row.insertCell(3).innerHTML =
                record.attendance_date.split("T")[0];
            row.insertCell(4).innerHTML = record.status;

            row.insertCell(5).innerHTML = `
                <button onclick="editAttendance(${record.attendance_id},'${record.status}')">
                    Edit
                </button>

                <button onclick="deleteAttendance(${record.attendance_id})">
                    Delete
                </button>
            `;
        });

    })
    .catch(err => console.log(err));

}
//searchAttendanceRecords
function searchAttendanceRecords() {

    let input =
    document.getElementById("searchStudent").value.toUpperCase();

    let table =
    document.getElementById("attendanceRecordTable");

    let rows = table.getElementsByTagName("tr");

    for(let i=0;i<rows.length;i++){

        let td = rows[i].getElementsByTagName("td")[1];

        if(td){

            let value = td.innerText.toUpperCase();

            rows[i].style.display =
            value.indexOf(input)>-1 ? "" : "none";
        }

    }

}
//page lode
if(document.getElementById("attendanceRecordTable")){
    loadAttendanceRecords();
}
// editAttendance
function editAttendance(id,currentStatus){

    let status = prompt(
        "Enter Status (Present/Absent)",
        currentStatus
    );

    if(status == null) return;

    fetch("https://student-management-system-5xwr.onrender.com/attendance/"+id,{
        method:"PUT",
        headers:{
            "Content-Type":"application/json"
        },
        body:JSON.stringify({
            status:status
        })
    })
    .then(res=>res.json())
    .then(data=>{
        alert(data.message);
        loadAttendanceRecords();
    });

}
//deleteAttendance
function deleteAttendance(id){

    if(!confirm("Delete Attendance?")) return;

    fetch("https://student-management-system-5xwr.onrender.com/attendance/"+id,{
        method:"DELETE"
    })
    .then(res=>res.json())
    .then(data=>{
        alert(data.message);
        loadAttendanceRecords();
    });

}

//loadStudentDropdown
function loadStudentDropdown() {

    let studentSelect = document.getElementById("student");

    if (!studentSelect) return;

    fetch("https://student-management-system-5xwr.onrender.com/students")
    .then(res => res.json())
    .then(data => {

        studentSelect.innerHTML =
        '<option value="">Select Student</option>';

        data.forEach(student => {

            studentSelect.innerHTML += `
            <option value="${student.id}">
                ${student.reg_no} - ${student.name}
            </option>
            `;

        });

    })
    .catch(err => console.log(err));

}
// Page Load
if (document.getElementById("student")) {
    loadStudentDropdown();
}
//saveMarks
function saveMarks(){

    let student_id = document.getElementById("student").value;

     console.log("SELECTED STUDENT ID =", student_id);

    let paper_code = document.getElementById("paper_code").value;
    let subject = document.getElementById("subject").value;
    let internal = document.getElementById("internal").value;
    let external = document.getElementById("external").value;
    let semester = document.getElementById("semester").value;

    if(student_id==""){
        alert("Select Student");
        return;
    }

    if (subject == "") {
    alert("Enter Subject");
    return;
     }

    if(internal=="" || external==""){
    alert("Enter Marks");
    return;
    }

    console.log("MARK DATA:", {
    student_id: student_id,
    paper_code: paper_code,
    subject: subject,
    internal_marks: internal,
    external_marks: external,
    semester: semester
});

    fetch("https://student-management-system-5xwr.onrender.com/marks",{

        method:"POST",

        headers:{
            "Content-Type":"application/json"
        },

        body:JSON.stringify({

            student_id:student_id,
            paper_code:paper_code,
            subject:subject,
            internal_marks:internal,
            external_marks:external,
            semester:semester

        })

    })

    .then(res=>res.json())
    .then(data=>{

        alert(data.message);

        loadMarks();
         
        document.getElementById("student").selectedIndex = 0;
        document.getElementById("subject").value="";
        document.getElementById("internal").value="";
        document.getElementById("external").value="";
        

    })

    .catch(err=>console.log(err));

   
}
//loadMarks
function loadMarks(){

   document.getElementById("semester").selectedIndex = 0;
  fetch("https://student-management-system-5xwr.onrender.com/marks")

    .then(res=>res.json())

    .then(data=>{

        let table=document.getElementById("marksTable");

        table.innerHTML="";
         
        data.forEach(mark => {

    let row = table.insertRow();

    row.insertCell(0).innerHTML = mark.mark_id;
    row.insertCell(1).innerHTML = mark.reg_no;
    row.insertCell(2).innerHTML = mark.name;
    row.insertCell(3).innerHTML = mark.department;
    row.insertCell(4).innerHTML = mark.paper_code;
    row.insertCell(5).innerHTML = mark.semester;
    row.insertCell(6).innerHTML = mark.subject;
    row.insertCell(7).innerHTML = mark.internal_marks;
    row.insertCell(8).innerHTML = mark.external_marks;
    row.insertCell(9).innerHTML = mark.total;
    row.insertCell(10).innerHTML = mark.grade;

    row.insertCell(11).innerHTML = `
        <button onclick="editMarks(${mark.mark_id})">✏ Edit</button>

        <button onclick="deleteMarks(${mark.mark_id})">🗑 Delete</button>
    `;

});
        

    })

    .catch(err=>console.log(err));

}

if(document.getElementById("marksTable")){
    loadMarks();
}
// Edit Marks
function editMarks(id) {

    let internal = prompt("Enter Internal Marks");

    internal = Number(internal);

    if (internal  < 0 || internal > 40){ 
         alert("Internal Marks must be 0-30");
        return;
    }
    if (internal == null) return;

    let external = prompt("Enter External Marks");

    external = Number(external);

    if (external < 0 || external > 75){ 
        alert("External Marks must be 0-75");
        return;
    }
    if (external == null) return;

    let paper_code = prompt("Enter Paper Code");
    if (paper_code == null) return;

    let semester = prompt("Enter Semester");

    if (semester == null) return;

    fetch("https://student-management-system-5xwr.onrender.com/marks/" + id, {

        method: "PUT",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            paper_code: paper_code,
            internal_marks: internal,
            external_marks: external,
            semester: semester

        })

    })

    .then(res => res.json())
    .then(data => {

        alert(data.message);

        loadMarks();

    })

    .catch(err => console.log(err));

}
// Delete Marks
function deleteMarks(id) {

    if (!confirm("Delete this mark record?")) return;

    fetch("https://student-management-system-5xwr.onrender.com/marks/" + id, {

        method: "DELETE"

    })

    .then(res => res.json())
    .then(data => {

        alert(data.message);

        loadMarks();

    })

    .catch(err => console.log(err));

}
//loadFeeStudents
function loadFeeStudents() {

    let select = document.getElementById("feeStudent");

    if (!select) return;

    fetch("https://student-management-system-5xwr.onrender.com/students")
    .then(res => res.json())
    .then(data => {

        select.innerHTML =
        '<option value="">Select Student</option>';

        data.forEach(student => {

            select.innerHTML += `
            <option value="${student.id}">
                ${student.reg_no} - ${student.name}
            </option>
            `;

        });

    });

}

if(document.getElementById("feeStudent")){
    loadFeeStudents();
}
//savefees
function saveFees() {

    let student_id = document.getElementById("feeStudent").value;
    let semester = document.getElementById("feeSemester").value;
    let total_fees = document.getElementById("totalFees").value;
    let paid_amount = document.getElementById("paidAmount").value;
    let payment_date = document.getElementById("paymentDate").value;

    if (student_id == "") {
        alert("Select Student");
        return;
    }

    if (semester == "") {
        alert("Select Semester");
        return;
    }

    if (total_fees == "" || paid_amount == "") {
        alert("Enter Fees Details");
        return;
    }

    fetch("https://student-management-system-5xwr.onrender.com/fees", {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({

            student_id,
            semester,
            total_fees,
            paid_amount,
            payment_date

        })

    })

    .then(res => res.json())
    .then(data => {

        alert(data.message);

        loadFees();

        document.getElementById("feeStudent").selectedIndex = 0;
        document.getElementById("feeSemester").selectedIndex = 0;
        document.getElementById("totalFees").value = "";
        document.getElementById("paidAmount").value = "";
        document.getElementById("paymentDate").value = "";

    })

    .catch(err => console.log(err));

}
//lodefees
function loadFees() {

    fetch("https://student-management-system-5xwr.onrender.com/fees")

    .then(res => res.json())

    .then(data => {

        let table = document.getElementById("feesTable");

        table.innerHTML = "";

        data.forEach(fee => {

            let row = table.insertRow();

            row.insertCell(0).innerHTML = fee.fee_id;
            row.insertCell(1).innerHTML = fee.name;
            row.insertCell(2).innerHTML = fee.reg_no;
            row.insertCell(3).innerHTML = fee.semester;
            row.insertCell(4).innerHTML = fee.total_fees;
            row.insertCell(5).innerHTML = fee.paid_amount;
            row.insertCell(6).innerHTML = fee.balance_amount;
            row.insertCell(7).innerHTML =
                fee.payment_date ? fee.payment_date.split("T")[0] : "";
            row.insertCell(8).innerHTML = fee.status;

            row.insertCell(9).innerHTML = `
                <button onclick="editFees(${fee.fee_id})">Edit</button>
                <button onclick="deleteFees(${fee.fee_id})">Delete</button>
            `;

        });

    })

    .catch(err => console.log(err));

}

if (document.getElementById("feesTable")) {
    loadFees();
}
//editfees
function editFees(id) {

    let total = prompt("Enter Total Fees");
    if (total == null) return;

    let paid = prompt("Enter Paid Amount");
    if (paid == null) return;

    let semester = prompt("Enter Semester");
    if (semester == null) return;

    let payment_date = prompt("Enter Payment Date (YYYY-MM-DD)");
    if (payment_date == null) return;

    fetch("https://student-management-system-5xwr.onrender.com/fees/" + id, {

        method: "PUT",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({

            total_fees: total,
            paid_amount: paid,
            semester: semester,
            payment_date: payment_date

        })

    })

    .then(res => res.json())
    .then(data => {

        alert(data.message);

        loadFees();

    })

    .catch(err => console.log(err));

}
//deletefees
function deleteFees(id) {

    if (!confirm("Delete Fee Record?")) return;

    fetch("https://student-management-system-5xwr.onrender.com/fees/" + id, {

        method: "DELETE"

    })

    .then(res => res.json())

    .then(data => {

        alert(data.message);

        loadFees();

    })

    .catch(err => console.log(err));

}
//searchfees
function searchFees() {

    let input =
        document.getElementById("searchFees").value.toUpperCase();

    let table =
        document.getElementById("feesTable");

    let rows = table.getElementsByTagName("tr");

    for (let i = 0; i < rows.length; i++) {

        let td = rows[i].getElementsByTagName("td")[1];

        if (td) {

            let value = td.innerText.toUpperCase();

            rows[i].style.display =
                value.indexOf(input) > -1 ? "" : "none";

        }

    }

}
//exportpdf
function exportPDF() {

    window.open(
        "https://student-management-system-5xwr.onrender.com/students/pdf",
        "_blank"
    );

}
//exportpdf 2
function exportPDF() {

    const { jsPDF } = window.jspdf;

    let doc = new jsPDF();

    doc.text("Student Management System Report", 14, 15);

    doc.autoTable({

        html: "#reportTable",

        startY: 25,

        theme: "grid",

        headStyles: {
            fillColor: [41, 128, 185]
        }

    });

    doc.save("Report.pdf");

}
//exportExcel
function exportExcel() {

    let table = document.getElementById("reportTable");

    let workbook = XLSX.utils.table_to_book(table, {
        sheet: "Report"
    });

    XLSX.writeFile(workbook, "Report.xlsx");

}

//studentReport
function studentReport() {

    fetch("https://student-management-system-5xwr.onrender.com/students")
    .then(res => res.json())
    .then(data => {

        document.getElementById("reportHead").innerHTML = `
        <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Reg No</th>
            <th>Department</th>
            <th>Year</th>
        </tr>
        `;

        let body = document.getElementById("reportBody");

        body.innerHTML = "";

        data.forEach(student => {

            body.innerHTML += `
            <tr>
                <td>${student.id}</td>
                <td>${student.name}</td>
                <td>${student.reg_no}</td>
                <td>${student.department}</td>
                <td>${student.year}</td>
            </tr>
            `;

        });

    });

}
//attendancereport
function attendanceReport() {

    fetch("https://student-management-system-5xwr.onrender.com/reports/attendance")
    .then(res => res.json())
    .then(data => {

        document.getElementById("reportHead").innerHTML = `
        <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Reg No</th>
            <th>Date</th>
            <th>Status</th>
        </tr>
        `;

        let body = document.getElementById("reportBody");

        body.innerHTML = "";

        data.forEach(record => {

            body.innerHTML += `
            <tr>
                <td>${record.attendance_id}</td>
                <td>${record.name}</td>
                <td>${record.reg_no}</td>
                <td>${record.attendance_date.split("T")[0]}</td>
                <td>${record.status}</td>
            </tr>
            `;

        });

    })
    .catch(err => console.log(err));

}
//marksreport
function marksReport() {

    fetch("https://student-management-system-5xwr.onrender.com/reports/marks")
    .then(res => res.json())
    .then(data => {

        document.getElementById("reportHead").innerHTML = `
        <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Reg No</th>
            <th>Subject</th>
            <th>Internal</th>
            <th>External</th>
            <th>Total</th>
            <th>Grade</th>
            <th>Semester</th>
        </tr>
        `;

        let body = document.getElementById("reportBody");

        body.innerHTML = "";

        data.forEach(mark => {

            body.innerHTML += `
            <tr>
                <td>${mark.mark_id}</td>
                <td>${mark.name}</td>
                <td>${mark.reg_no}</td>
                <td>${mark.subject}</td>
                <td>${mark.internal_marks}</td>
                <td>${mark.external_marks}</td>
                <td>${mark.total}</td>
                <td>${mark.grade}</td>
                <td>${mark.semester}</td>
            </tr>
            `;

        });

    })
    .catch(err => console.log(err));

}
// Reports Page Load
if (document.getElementById("reportTable")) {
    studentReport();
}
//feesreport
function feesReport() {

    fetch("https://student-management-system-5xwr.onrender.com/reports/fees")
    .then(res => res.json())
    .then(data => {

        document.getElementById("reportHead").innerHTML = `
        <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Reg No</th>
            <th>Semester</th>
            <th>Total Fee</th>
            <th>Paid Fee</th>
            <th>Balance</th>
            <th>Payment Mode</th>
            <th>Status</th>
        </tr>
        `;

        let body = document.getElementById("reportBody");

        body.innerHTML = "";

        data.forEach(fee => {

            body.innerHTML += `
            <tr>
                <td>${fee.fee_id}</td>
                <td>${fee.name}</td>
                <td>${fee.reg_no}</td>
                <td>${fee.semester}</td>
                <td>₹${fee.total_fee}</td>
                <td>₹${fee.paid_fee}</td>
                <td>₹${fee.balance_fee}</td>
                <td>${fee.payment_mode}</td>
                <td>${fee.status}</td>
            </tr>
            `;

        });

    })
    .catch(err => console.log(err));

}
//loadeyearchart
function loadYearChart() {

    fetch("https://student-management-system-5xwr.onrender.com/students")
    .then(res => res.json())
    .then(data => {

        let first =
            data.filter(s => s.year === "1st Year").length;

        let second =
            data.filter(s => s.year === "2nd Year").length;

        let third =
            data.filter(s => s.year === "3rd Year").length;

        new Chart(document.getElementById("yearChart"), {

            type: "bar",

            data: {

                labels: [
                    "1st Year",
                    "2nd Year",
                    "3rd Year"
                ],

                datasets: [{

                    label: "Students",

                    data: [
                        first,
                        second,
                        third
                    ]

                }]

            }

        });

    });

}
if(document.getElementById("yearChart")){
    loadYearChart();
}
//viewIDcard
function viewIDCard(id){

    localStorage.setItem("studentId", id);
    localStorage.setItem("studentId",id);
    window.location.href="idcard.html";

}
//function viewIDCard() 
function viewIDCard(id){

    localStorage.setItem("studentId", id);

    window.location.href = "idcard.html";

}
function loadIDCard() {

    let id = localStorage.getItem("studentId");

    if (!id) return;

    fetch("/students/" + id)
    .then(res => res.json())
    .then(student => {

        console.log(student);
        console.log(student.photo);


        document.getElementById("studentPhoto").src =
            "https://student-management-system-5xwr.onrender.com/uploads/" + student.photo;

        document.getElementById("name").innerText = student.name;
        document.getElementById("regno").innerText = student.reg_no;
        document.getElementById("department").innerText = student.department;
        document.getElementById("year").innerText = student.year;
        document.getElementById("blood").innerText = student.blood_group;
        document.getElementById("phone").innerText = student.phone;

    });

}

if(document.getElementById("studentPhoto")){
    loadIDCard();
}
    

//printreport
function printReport() {

    window.print();

}

// ==========================================
// STUDENT RESULT
// ==========================================
function loadResult() {

    const studentId =
        localStorage.getItem("studentId");

    const semester =
        document.getElementById("semester").value;

    console.log("Student ID:", studentId);
    console.log("Semester:", semester);

    if (!studentId) {

        alert("Please register first");

        window.location.href =
            "student-register.html";

        return;
    }

    if (semester === "") {

        alert("Select Semester");

        return;
    }

    const url =
        "https://student-management-system-5xwr.onrender.com/student-result/"
        + studentId
        + "/"
        + encodeURIComponent(semester);

    console.log("Result URL:", url);

    fetch(url)

        .then(res => {

            if (!res.ok) {
                throw new Error(
                    "Server Error: " + res.status
                );
            }

            return res.json();

        })

        .then(data => {

            console.log("Result Data:", data);

            const table =
                document.getElementById("resultTable");

            table.innerHTML = "";

            if (!Array.isArray(data) ||
                data.length === 0) {

                alert("No Result Found");

                return;
            }
              
            document.getElementById("resultStudent").innerText =
            "Student Name : " + data[0].name;

            document.getElementById("resultRegNo").innerText =
            "Register No : " + data[0].reg_no;

            document.getElementById("resultDepartment").innerText =
             "Department : " + data[0].department;

            let grandTotal = 0;
            let pass = true;
            let serialNo = 1;


            data.forEach(mark => {

                const row =
                    table.insertRow();

                row.insertCell(0).innerText =
                    serialNo++;

               row.insertCell(1).innerText =
                    mark.paper_code;

                row.insertCell(2).innerText =
                    mark.subject;

                row.insertCell(3).innerText =
                    mark.internal_marks;

                row.insertCell(4).innerText =
                    mark.external_marks;

                row.insertCell(5).innerText =
                    mark.total;

                row.insertCell(6).innerText =
                    mark.grade;

                grandTotal +=
                    Number(mark.total);

                if (
                    String(mark.grade)
                        .toUpperCase() === "F"
                ) {
                    pass = false;
                }

            });


            const average =
                (grandTotal / data.length)
                    .toFixed(2);

            document.getElementById(
                "grandTotal"
            ).innerText =
                "Grand Total : " + grandTotal;

            document.getElementById(
                "average"
            ).innerText =
                "Average : " + average;

            document.getElementById(
                "resultStatus"
            ).innerText =
                pass
                    ? "Result : PASS ✅"
                    : "Result : FAIL ❌";

        })

        .catch(err => {

            console.error(
                "Result Loading Error:",
                err
            );

            alert("Unable to load result");

        });

}

//lodesitting
function loadSettings() {

    fetch("https://student-management-system-5xwr.onrender.com/settings")
    .then(res => res.json())
    .then(data => {

        document.getElementById("college_name").value = data.college_name;
        document.getElementById("college_address").value = data.college_address;
        document.getElementById("college_phone").value = data.college_phone;
        document.getElementById("college_email").value = data.college_email;
        document.getElementById("principal_name").value = data.principal_name;

    });

}

if (document.getElementById("college_name")) {
    loadSettings();
}
//savesetting
function saveSettings() {

    fetch("https://student-management-system-5xwr.onrender.com/settings", {

        method: "PUT",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({

            college_name: document.getElementById("college_name").value,
            college_address: document.getElementById("college_address").value,
            college_phone: document.getElementById("college_phone").value,
            college_email: document.getElementById("college_email").value,
            principal_name: document.getElementById("principal_name").value

        })

    })

    .then(res => res.json())
    .then(data => {

        alert(data.message);

    })

    .catch(err => console.log(err));

}
//uploadLogo
function uploadLogo(){

    let file = document.getElementById("logo").files[0];

    if(!file){
        alert("Select Logo");
        return;
    }

    let formData = new FormData();

    formData.append("logo", file);

    fetch("https://student-management-system-5xwr.onrender.com/settings/logo",{

        method:"PUT",

        body:formData

    })

    .then(res=>res.json())

    .then(data=>{

        alert(data.message);

        loadSettings();

    })

    .catch(err=>console.log(err));

}

//loadDepartmentChart
function loadDepartmentChart() {

    const role = localStorage.getItem("role");

    let apiUrl = "https://student-management-system-5xwr.onrender.com/dashboard/chart";

    // Teacher → அவருடைய department மட்டும்
    if (role === "teacher") {

        const teacherId =
            localStorage.getItem("teacherId");

        if (!teacherId) {
            console.log("Teacher ID not found");
            return;
        }

        apiUrl =
            "https://student-management-system-5xwr.onrender.com/dashboard/teacher-chart/"
            + teacherId;
    }

    fetch(apiUrl)

    .then(res => res.json())

    .then(data => {

        console.log("Department Chart Data:", data);

        let labels = [];
        let totals = [];

        data.forEach(item => {

            labels.push(item.department);
            totals.push(item.total);

        });

        new Chart(
            document.getElementById("departmentChart"),
            {
                type: "bar",

                data: {
                    labels: labels,

                    datasets: [{
                        label: "Students",
                        data: totals,
                        borderWidth: 1
                    }]
                },

                options: {
                    responsive: true,

                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            }
        );

    })

    .catch(err =>
        console.log("Department Chart Error:", err)
    );
}

if (document.getElementById("departmentChart")) {
    loadDepartmentChart();
}

//loadYearChart
function loadYearChart() {

    fetch("https://student-management-system-5xwr.onrender.com/dashboard/year-chart")

    .then(res => res.json())

    .then(data => {

        let labels = [];
        let totals = [];

        data.forEach(item => {

            labels.push(item.year);
            totals.push(item.total);

        });

        new Chart(document.getElementById("yearChart"), {

            type: "pie",

            data: {

                labels: labels,

                datasets: [{

                    data: totals

                }]

            },

            options: {

                responsive: true

            }

        });

    })

    .catch(err => console.log(err));

}

//loadYearChart
if (document.getElementById("yearChart")) {
    loadYearChart();
}

//loadAttendanceChart
function loadAttendanceChart() {

    fetch("https://student-management-system-5xwr.onrender.com/dashboard/attendance-chart")

    .then(res => res.json())

    .then(data => {

        let labels = [];
        let totals = [];

        data.forEach(item => {

            labels.push(item.status);
            totals.push(item.total);

        });

        new Chart(document.getElementById("attendanceChart"), {

            type: "pie",

            data: {

                labels: labels,

                datasets: [{

                    data: totals

                }]

            },

            options: {

                responsive: true

            }

        });

    })

    .catch(err => console.log(err));

}

//attendanceChart
if (document.getElementById("attendanceChart")) {
    loadAttendanceChart();
}

//loadDashboardSummary
function loadDashboardSummary(){
    fetch("https://student-management-system-5xwr.onrender.com/dashboard/summary")

    .then(res=>res.json())

    .then(data=>{

        document.getElementById("totalStudents").innerText=data.students;
        document.getElementById("totalDepartments").innerText=data.departments;
        document.getElementById("feesPaid").innerText=data.paid;
        document.getElementById("feesDue").innerText=data.pending;
        document.getElementById("presentToday").innerText=data.present;
        document.getElementById("passStudents").innerText=data.pass;

    });

}

if(document.getElementById("feesPaid")){
    loadDashboardSummary();
}

//exportstudents
function exportStudents() {
    window.open("https://student-management-system-5xwr.onrender.com/export/students");
}

//Notifications
function loadNotifications(){

    fetch("https://student-management-system-5xwr.onrender.com/dashboard/notifications")

    .then(res=>res.json())

    .then(data=>{

        document.getElementById("notificationBox").innerHTML=`

        <p>🎓 Total Students : ${data.students}</p>

        <p>💰 Pending Fees : ${data.feesDue}</p>

        <p>❌ Absent Students : ${data.absent}</p>

        `;

    });

}
if(document.getElementById("notificationBox")){
    loadNotifications();
}

//loadActivity
function loadActivity() {

    fetch("https://student-management-system-5xwr.onrender.com/activity")
    .then(res => res.json())
    .then(data => {

        let table = document.getElementById("activityTable");

        table.innerHTML = "";

        data.forEach(log => {

            table.innerHTML += `
            <tr>
                <td>${log.username}</td>
                <td>${log.action}</td>
                <td>${log.log_time}</td>
            </tr>
            `;

        });

    });

}

if (document.getElementById("activityTable")) {
    loadActivity();
}

//savesubject
function saveSubject() {

    let department = document.getElementById("department").value;
    let semester = document.getElementById("semester").value;
    let subject_code = document.getElementById("subjectCode").value;
    let subject_name = document.getElementById("subjectName").value;

    if (
        department == "" ||
        semester == "" ||
        subject_code == "" ||
        subject_name == ""
    ) {
        alert("Fill all fields");
        return;
    }

    fetch("https://student-management-system-5xwr.onrender.com/subjects", {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({

            department,
            semester,
            subject_code,
            subject_name

        })

    })

    .then(res => res.json())

    .then(data => {

        alert(data.message);

        loadSubjects();

        document.getElementById("department").selectedIndex = 0;
        document.getElementById("semester").selectedIndex = 0;
        document.getElementById("subjectCode").value = "";
        document.getElementById("subjectName").value = "";

    })

    .catch(err => console.log(err));

}
//lodesubject
function loadSubjects() {

    fetch("https://student-management-system-5xwr.onrender.com/subjects")

    .then(res => res.json())

    .then(data => {

        let table = document.getElementById("subjectTable");

        table.innerHTML = "";

        data.forEach(subject => {

            let row = table.insertRow();

            row.insertCell(0).innerHTML = subject.subject_id;
            row.insertCell(1).innerHTML = subject.department;
            row.insertCell(2).innerHTML = subject.semester;
            row.insertCell(3).innerHTML = subject.subject_code;
            row.insertCell(4).innerHTML = subject.subject_name;

            row.insertCell(5).innerHTML = `
    <button onclick="editSubject(
        ${subject.subject_id},
        '${subject.department}',
        '${subject.semester}',
        '${subject.subject_code}',
        '${subject.subject_name}'
    )">
        Edit
    </button>

    <button onclick="deleteSubject(${subject.subject_id})">
        Delete
    </button>
    `;

        });

    })

    .catch(err => console.log(err));

}

//deletesubject
function deleteSubject(id) {

    if (!confirm("Delete Subject?")) return;

    fetch("https://student-management-system-5xwr.onrender.com/subjects/" + id, {

        method: "DELETE"

    })

    .then(res => res.json())

    .then(data => {

        alert(data.message);

        loadSubjects();

    })

    .catch(err => console.log(err));

}
if (document.getElementById("subjectTable")) {
    loadSubjects();
}

//editsubject
function editSubject(id, department, semester, code, name) {

    let newDepartment = prompt("Department", department);
    if (newDepartment == null) return;

    let newSemester = prompt("Semester", semester);
    if (newSemester == null) return;

    let newCode = prompt("Subject Code", code);
    if (newCode == null) return;

    let newName = prompt("Subject Name", name);
    if (newName == null) return;

    fetch("https://student-management-system-5xwr.onrender.com/subjects/" + id, {

        method: "PUT",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({

            department: newDepartment,
            semester: newSemester,
            subject_code: newCode,
            subject_name: newName

        })

    })

    .then(res => res.json())

    .then(data => {

        alert(data.message);

        loadSubjects();

    })

    .catch(err => console.log(err));

}

// Department Filter
function filterStudentsByDepartment() {

    const department =
        document.getElementById("departmentFilter").value;

    fetch("https://student-management-system-5xwr.onrender.com/students")
        .then(response => response.json())
        .then(data => {

            // Department filter
            if (department !== "") {
                data = data.filter(student =>
                    student.department === department
                );
            }

            const table =
                document.getElementById("studentTable");

            if (!table) return;

            table.innerHTML = "";

            // Load students
            data.forEach(student => {

                let row = table.insertRow();

                row.insertCell(0).innerHTML = student.id;
                row.insertCell(1).innerHTML = student.name;
                row.insertCell(2).innerHTML = student.reg_no;
                row.insertCell(3).innerHTML = student.gender;
                row.insertCell(4).innerHTML = student.dob;
                row.insertCell(5).innerHTML = student.blood_group;
                row.insertCell(6).innerHTML = student.department;
                row.insertCell(7).innerHTML = student.year;
                row.insertCell(8).innerHTML = student.phone;
                row.insertCell(9).innerHTML = student.email;
                row.insertCell(10).innerHTML = student.address || "";
                row.insertCell(11).innerHTML = student.parent_name || "";
                row.insertCell(12).innerHTML = student.parent_phone || "";
                row.insertCell(13).innerHTML = student.batch || "";
                row.insertCell(14).innerHTML = student.college_shift || "";
                row.insertCell(15).innerHTML = student.admission_date || "";

                // =========================
                // PROFILE + ID CARD
                // =========================

                row.insertCell(16).innerHTML = `
                    <button onclick="viewProfile(${student.id})">
                        👁 View
                    </button>

                    <button onclick="viewIDCard(${student.id})">
                        🪪 ID Card
                    </button>
                `;

                // =========================
                // PHOTO
                // =========================

                let photoCell = row.insertCell(17);

                if (student.photo) {

                    photoCell.innerHTML = `
                        <img
                            src="https://student-management-system-5xwr.onrender.com/uploads/${student.photo}"
                            width="60"
                            height="60"
                            style="border-radius:5px;cursor:pointer;"
                            onclick="showPhoto('https://student-management-system-5xwr.onrender.com/uploads/${student.photo}')"
                        >

                        <br>

                        <button
                            onclick="changePhoto(event, ${student.id})">
                            ✏️ Change
                        </button>
                    `;

                } else {

                    photoCell.innerHTML = `
                        <button
                            onclick="changePhoto(event, ${student.id})">
                            ➕ Add Photo
                        </button>
                    `;
                }

            });

        })
        .catch(error => {

            console.log(
                "Department Filter Error:",
                error
            );

        });

}
               
// Attendance Department Filter
function filterAttendanceByDepartment() {

    const department =
        document.getElementById("attendanceDepartmentFilter").value;

    const rows =
        document.querySelectorAll("#attendanceBody tr");

    rows.forEach(row => {

        // Department column = 4th column
        const rowDepartment =
            row.cells[3]?.innerText.trim();

        if (department === "" || rowDepartment === department) {
            row.style.display = "";
        } else {
            row.style.display = "none";
        }

    });
}
// Marks Department Filter
function filterMarksByDepartment() {

    const department =
        document.getElementById("marksDepartmentFilter").value;

    const rows =
        document.querySelectorAll("#marksTable tr");

    rows.forEach(row => {

        const rowDepartment =
            row.cells[3]?.innerText.trim();

        if (department === "" || rowDepartment === department) {
            row.style.display = "";
        } else {
            row.style.display = "none";
        }

    });
}


// ==========================================
// LOAD SELECTED STUDENT PROFILE
// ==========================================

function loadSelectedStudentProfile() {

    const id =
        localStorage.getItem("studentId");


    if (!id) {

        alert("Student not selected");

        window.location.href =
            "profile.html";

        return;
    }


    fetch(
        "https://student-management-system-5xwr.onrender.com/students/" + id
    )

    .then(response => response.json())

    .then(student => {

        console.log(
            "Selected Student:",
            student
        );


        // PHOTO

        const photo =
            document.getElementById("profilePhoto");


        if (photo) {

            if (student.photo) {

                photo.src =
                    "https://student-management-system-5xwr.onrender.com/uploads/"
                    + student.photo;

            } else {

                photo.style.display =
                    "none";
            }
        }


        // DETAILS

        document.getElementById("profileName").innerText =
            student.name || "";

        document.getElementById("profileRegno").innerText =
            student.reg_no || "";

        document.getElementById("profileGender").innerText =
            student.gender || "";

        document.getElementById("profileDob").innerText =
            student.dob
                ? new Date(student.dob).toLocaleDateString("en-GB")
                : "";

        document.getElementById("profileBlood").innerText =
            student.blood_group || "";

        document.getElementById("profileDepartment").innerText =
            student.department || "";

        document.getElementById("profileYear").innerText =
            student.year || "";

        document.getElementById("profilePhone").innerText =
            student.phone || "";

        document.getElementById("profileEmail").innerText =
            student.email || "";

        document.getElementById("profileAddress").innerText =
            student.address || "";

        document.getElementById("profileParentName").innerText =
            student.parent_name || "";

        document.getElementById("profileParentPhone").innerText =
            student.parent_phone || "";

        document.getElementById("profileBatch").innerText =
            student.batch || "";

        document.getElementById("profileAdmissionDate").innerText =
            student.admission_date
                ? new Date(student.admission_date)
                    .toLocaleDateString("en-GB")
                : "";

    })

    .catch(error => {

        console.error(
            "Student Profile Error:",
            error
        );

    });

}


// ==========================================
// OPEN SELECTED ID CARD
// ==========================================

function openSelectedIDCard() {

    window.location.href =
        "idcard.html";
}



// AUTO LOAD INDIVIDUAL PROFILE

if (
    document.getElementById("profileName")
) {

    loadSelectedStudentProfile();

}
if (document.getElementById("profileStudentTable")) {
    loadProfileStudents();
}
//view Student Profile id
function viewStudentProfile(id) {

    console.log(
        "Selected Student ID:",
        id
    );

    localStorage.setItem(
        "studentId",
        id
    );

    window.location.href =
        "profile.html";

}

// ==========================================
// ADD TEACHER
// ==========================================

function addTeacher() {

    const username =
        document.getElementById(
            "teacherUsername"
        ).value.trim();


    const password =
        document.getElementById(
            "teacherPassword"
        ).value.trim();


    const name =
        document.getElementById(
            "teacherName"
        ).value.trim();


    const department =
        document.getElementById(
            "teacherDepartment"
        ).value;


    const year =
        document.getElementById(
            "teacherYear"
        ).value;


    const college_shift =
        document.getElementById(
            "teacherShift"
        ).value;


    // ======================================
    // Validation
    // ======================================

    if (username === "") {

        alert("Enter Username");
        return;

    }


    if (password === "") {

        alert("Enter Password");
        return;

    }


    if (password.length > 8) {

        alert("Password maximum 8 characters");
        return;

    }


    if (name === "") {

        alert("Enter Teacher Name");
        return;

    }


    if (department === "") {

        alert("Select Department");
        return;

    }


    if (year === "") {

        alert("Select Year");
        return;

    }


    if (college_shift === "") {

        alert("Select College Shift");
        return;

    }


    // ======================================
    // Send to Backend
    // ======================================

    fetch(
        "https://student-management-system-5xwr.onrender.com/teachers",
        {

            method: "POST",

            headers: {
                "Content-Type":
                    "application/json"
            },

            body: JSON.stringify({

                username: username,
                password: password,
                name: name,
                department: department,
                year: year,
                college_shift: college_shift

            })

        }
    )


    .then(res => res.json())


    .then(data => {

        console.log(
            "Teacher:",
            data
        );


        alert(data.message);


        if (data.success) {

            document.getElementById(
                "teacherUsername"
            ).value = "";

            document.getElementById(
                "teacherPassword"
            ).value = "";

            document.getElementById(
                "teacherName"
            ).value = "";

            document.getElementById(
                "teacherDepartment"
            ).selectedIndex = 0;

            document.getElementById(
                "teacherYear"
            ).selectedIndex = 0;

            document.getElementById(
                "teacherShift"
            ).selectedIndex = 0;

        }

    })


    .catch(err => {

        console.error(
            "Add Teacher Error:",
            err
        );

        alert(
            "Unable to connect to backend"
        );

    });

}
