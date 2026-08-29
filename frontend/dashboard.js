// ======================================
// DASHBOARD LOGIN PROTECTION
// ======================================

const loginStatus = localStorage.getItem("login");
const role = localStorage.getItem("role");

console.log("Dashboard Login:", loginStatus);
console.log("Dashboard Role:", role);


// ======================================
// LOGIN CHECK
// ======================================

if (loginStatus !== "true") {

    window.location.href = "login.html";

}


// ======================================
// PAGE LOAD
// ======================================

document.addEventListener("DOMContentLoaded", function () {

    // ==================================
    // HIDE ALL ROLE BASED ITEMS
    // ==================================

    document
        .querySelectorAll(".admin, .teacher")
        .forEach(item => {

            item.style.display = "none";

        });


    // ==================================
    // ADMIN
    // ==================================

    if (role === "admin") {

        document
            .querySelectorAll(".admin")
            .forEach(item => {

                item.style.display = "";

            });

        document.getElementById("userRole").textContent =
            "Admin";

        document.getElementById("welcomeText").textContent =
            "Welcome Admin 👋";

    }


    // ==================================
    // TEACHER
    // ==================================

    else if (role === "teacher") {

        document
            .querySelectorAll(".teacher")
            .forEach(item => {

                item.style.display = "";

            });

        document.getElementById("userRole").textContent =
            "Teacher";

        document.getElementById("welcomeText").textContent =
            "Welcome Teacher 👋";

    }


    // ==================================
    // INVALID ROLE
    // ==================================

    else {

        console.log("Invalid role");

        localStorage.clear();

        window.location.href = "login.html";

    }

});


// ======================================
// LOGOUT
// ======================================

function logout() {

    localStorage.removeItem("login");
    localStorage.removeItem("role");
    localStorage.removeItem("teacherId");
    localStorage.removeItem("teacherName");

    window.location.href = "login.html";

}

// ==========================================
// LOAD DASHBOARD STATISTICS
// ==========================================

 function loadDashboardStats() {

    fetch("http://student-management-system-5xwr.onrender.com/dashboard-stats")

        .then(res => res.json())

        .then(response => {

            console.log("Dashboard Stats:", response);

            if (!response.success) {
                return;
            }

            const data = response.data;


            // ==================================
            // YEAR COUNTS
            // ==================================

            let firstYear = 0;
            let secondYear = 0;
            let thirdYear = 0;
            let fourthYear = 0;


            // ==================================
            // DEPARTMENT COUNTS
            // ==================================

            const departmentCounts = {};


            data.forEach(row => {

                const year = String(row.year).trim();

                const department =
                    String(row.department).trim();

                const total =
                    Number(row.total);


                // Year count

                if (
                    year === "1st Year" ||
                    year === "1"
                ) {

                    firstYear += total;

                }

                else if (
                    year === "2nd Year" ||
                    year === "2"
                ) {

                    secondYear += total;

                }

                else if (
                    year === "3rd Year" ||
                    year === "3"
                ) {

                    thirdYear += total;

                }

                else if (
                    year === "4th Year" ||
                    year === "4"
                ) {

                    fourthYear += total;

                }


                // Department count

                if (!departmentCounts[department]) {

                    departmentCounts[department] = 0;

                }

                departmentCounts[department] += total;

            });


            // ==================================
            // DISPLAY YEAR COUNTS
            // ==================================

            document.getElementById("firstYearCount")
                .textContent = firstYear;

            document.getElementById("secondYearCount")
                .textContent = secondYear;

            document.getElementById("thirdYearCount")
                .textContent = thirdYear;

            document.getElementById("fourthYearCount")
                .textContent = fourthYear;


            // ==================================
            // DEPARTMENT CHART
            // ==================================

            const labels =
                Object.keys(departmentCounts);

            const values =
                Object.values(departmentCounts);


            const canvas =
                document.getElementById("departmentChart");


            if (!canvas) {
                return;
            }


            // Destroy old chart if already exists

            if (window.departmentChartInstance) {

                window.departmentChartInstance.destroy();

            }


            window.departmentChartInstance =
                new Chart(canvas, {

                    type: "bar",

                    data: {

                        labels: labels,

                        datasets: [{

                            label: "Students",

                            data: values

                        }]

                    },

                    options: {

                        responsive: true,

                        maintainAspectRatio: false,

                        plugins: {

                            legend: {
                                display: true
                            }

                        },

                        scales: {

                            y: {

                                beginAtZero: true,

                                ticks: {
                                    stepSize: 1
                                }

                            }

                        }

                    }

                });

        })

        .catch(err => {

            console.error(
                "Dashboard Stats Error:",
                err
            );

        });
}
// Load dashboard statistics
if (document.getElementById("departmentChart")) {
    loadDashboardStats();
}
//
function loadStudentSummary() {

    fetch("http://student-management-system-5xwr.onrender.com/dashboard/student-summary")
        .then(res => res.json())
        .then(result => {

            console.log("Student Summary:", result);

            if (!result.success) return;

            const data = result.data;

            // ==================================
            // 10 DEPARTMENTS
            // ==================================

            const departments = [
                "B.Sc Computer Science",
                "B.Sc Mathematics",
                "B.Sc Physics",
                "B.Sc Chemistry",
                "B.A English",
                "B.A Tamil",
                "B.Com",
                "B.B.A",
                "B.C.A",
                "B.Sc Botany"
            ];

            const container =
                document.getElementById("departmentStudents");

            container.innerHTML = "";


            // ==================================
            // CREATE DEPARTMENT CARDS
            // ==================================

            departments.forEach(department => {

                let totalStudents = 0;

                // Database data-ல் அந்த department-ஐ தேடுகிறது
                data.forEach(item => {

                    if (
                        String(item.department).trim().toLowerCase() ===
                        department.trim().toLowerCase()
                    ) {

                        totalStudents += Number(item.total);

                    }

                });


                const card =
                    document.createElement("div");

                card.className = "department-card";

                card.innerHTML = `
                    <h3>${department}</h3>

                    <strong>
                        ${totalStudents}
                    </strong>

                    <p>Students</p>
                `;

                container.appendChild(card);

            });

        })
        .catch(err => {

            console.error(
                "Student Summary Error:",
                err
            );

        });
}

function loadDashboardSummary() {

    fetch("https://student-management-system-5xwr.onrender.com/dashboard/summary")

        .then(res => res.json())

        .then(data => {

            console.log("Dashboard Summary:", data);

            document.getElementById("totalStudents").textContent =
                data.students || 0;

            document.getElementById("totalDepartments").textContent =
                data.departments || 0;

            document.getElementById("totalMarks").textContent =
                data.pass || 0;

            // Attendance percentage
            fetch("https://student-management-system-5xwr.onrender.com/dashboard/attendance-chart")

                .then(res => res.json())

                .then(attendance => {

                    let present = 0;
                    let absent = 0;

                    attendance.forEach(row => {

                        if (row.status === "Present") {
                            present = Number(row.total);
                        }

                        if (row.status === "Absent") {
                            absent = Number(row.total);
                        }

                    });

                    let total = present + absent;

                    let percentage = total > 0
                        ? Math.round((present / total) * 100)
                        : 0;

                    document.getElementById(
                        "attendancePercentage"
                    ).textContent = percentage + "%";

                });

        })

        .catch(err => {

            console.error(
                "Dashboard Summary Error:",
                err
            );

        });
}