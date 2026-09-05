// ==========================================
// DASHBOARD SUMMARY
// ==========================================

function loadDashboardSummary() {

    const role = localStorage.getItem("role");
    const teacherId = localStorage.getItem("teacherId");

    fetch(
        "https://student-management-system-5xwr.onrender.com/dashboard/summary",
        {
            headers: {
                "user-role": role || "",
                "teacher-id": teacherId || ""
            }
        }
    )

        .then(res => {

            if (!res.ok) {
                throw new Error("Summary API Error");
            }

            return res.json();

        })

        .then(data => {

            console.log("Dashboard Summary:", data);


            // TOTAL STUDENTS
            const totalStudents =
                document.getElementById("totalStudents");

            if (totalStudents) {
                totalStudents.textContent =
                    data.students || 0;
            }


            // TOTAL DEPARTMENTS
            const totalDepartments =
                document.getElementById("totalDepartments");

            if (totalDepartments) {
                totalDepartments.textContent =
                    data.departments || 0;
            }


            // FEES PAID
            const feesPaid =
                document.getElementById("feesPaid");

            if (feesPaid) {
                feesPaid.textContent =
                    data.paid || 0;
            }


            // FEES PENDING
            const feesDue =
                document.getElementById("feesDue");

            if (feesDue) {
                feesDue.textContent =
                    data.pending || 0;
            }


            // PRESENT TODAY
            const presentToday =
                document.getElementById("presentToday");

            if (presentToday) {
                presentToday.textContent =
                    data.present || 0;
            }


            // PASS STUDENTS
            const passStudents =
                document.getElementById("passStudents");

            if (passStudents) {
                passStudents.textContent =
                    data.pass || 0;
            }


            // TOTAL MARKS
            const totalMarks =
                document.getElementById("totalMarks");

            if (totalMarks) {
                totalMarks.textContent =
                    data.marks || 0;
            }

        })

        .catch(err => {

            console.error(
                "Dashboard Summary Error:",
                err
            );

        });

}



// ==========================================
// ATTENDANCE PERCENTAGE
// ==========================================

function loadAttendancePercentage() {

    const role = localStorage.getItem("role");
    const teacherId = localStorage.getItem("teacherId");

    fetch(
        "https://student-management-system-5xwr.onrender.com/dashboard/attendance-chart",
        {
            headers: {
                "user-role": role || "",
                "teacher-id": teacherId || ""
            }
        }
    )

        .then(res => {

            if (!res.ok) {
                throw new Error(
                    "Attendance API Error"
                );
            }

            return res.json();

        })

        .then(attendance => {

            console.log(
                "Attendance Data:",
                attendance
            );

            let present = 0;
            let absent = 0;


            attendance.forEach(row => {

                if (row.status === "Present") {

                    present =
                        Number(row.total);

                }

                if (row.status === "Absent") {

                    absent =
                        Number(row.total);

                }

            });


            const total =
                present + absent;


            const percentage =
                total > 0
                    ? Math.round(
                        (present / total) * 100
                    )
                    : 0;


            const attendancePercentage =
                document.getElementById(
                    "attendancePercentage"
                );


            if (attendancePercentage) {

                attendancePercentage.textContent =
                    percentage + "%";

            }

        })

        .catch(err => {

            console.error(
                "Attendance Error:",
                err
            );

        });

}

// ==========================================
// YEAR WISE STUDENTS
// ==========================================

function loadYearWiseStudents() {

    const role =
        localStorage.getItem("role");

    let apiUrl =
        "https://student-management-system-5xwr.onrender.com/dashboard/year-chart";


    // TEACHER
    if (role === "teacher") {

        const teacherId =
            localStorage.getItem("teacherId");

        if (!teacherId) {

            console.error("Teacher ID not found");

            return;
        }

        apiUrl =
            "https://student-management-system-5xwr.onrender.com/dashboard/teacher-year-chart/"
            + encodeURIComponent(teacherId);
    }


    fetch(apiUrl)

        .then(res => {

            if (!res.ok) {
                throw new Error(
                    "Year Chart API Error: " + res.status
                );
            }

            return res.json();

        })

        .then(data => {

            console.log(
                "Year Wise API Data:",
                data
            );


            let firstYear = 0;
            let secondYear = 0;
            let thirdYear = 0;
            let fourthYear = 0;


            if (!Array.isArray(data)) {

                console.error(
                    "Invalid Year Chart Data:",
                    data
                );

                return;
            }


            data.forEach(item => {

                const year =
                    String(item.year || "")
                        .trim();

                const total =
                    Number(item.total || 0);


                if (year === "1st Year") {

                    firstYear = total;

                }

                else if (year === "2nd Year") {

                    secondYear = total;

                }

                else if (year === "3rd Year") {

                    thirdYear = total;

                }

                else if (year === "4th Year") {

                    fourthYear = total;

                }

            });


            document.getElementById(
                "firstYearCount"
            ).textContent = firstYear;


            document.getElementById(
                "secondYearCount"
            ).textContent = secondYear;


            document.getElementById(
                "thirdYearCount"
            ).textContent = thirdYear;


            document.getElementById(
                "fourthYearCount"
            ).textContent = fourthYear;


            console.log(
                "Final Year Wise:",
                {
                    firstYear,
                    secondYear,
                    thirdYear,
                    fourthYear
                }
            );

        })

        .catch(err => {

            console.error(
                "Year Wise Error:",
                err
            );

        });

}

// ==========================================
// DEPARTMENT WISE CHART
// ==========================================

let departmentChart = null;


function loadDepartmentChart() {

    const role =
        localStorage.getItem("role");


    let apiUrl =
        "https://student-management-system-5xwr.onrender.com/dashboard/chart";


    // TEACHER
    if (role === "teacher") {

        const teacherId =
            localStorage.getItem("teacherId");


        if (!teacherId) {

            console.error(
                "Teacher ID not found"
            );

            return;
        }


        apiUrl =
            "https://student-management-system-5xwr.onrender.com/dashboard/teacher-chart/"
            + encodeURIComponent(teacherId);
    }


    fetch(apiUrl)

        .then(res => {

            if (!res.ok) {

                throw new Error(
                    "Department Chart API Error: "
                    + res.status
                );
            }

            return res.json();

        })

        .then(data => {

            console.log(
                "Department Chart Data:",
                data
            );


            const canvas =
                document.getElementById(
                    "departmentChart"
                );


            if (!canvas) {

                console.error(
                    "departmentChart canvas not found"
                );

                return;
            }


            if (!Array.isArray(data)) {

                console.error(
                    "Invalid Department Chart Data:",
                    data
                );

                return;
            }


            const labels =
                data.map(
                    item => item.department
                );


            const totals =
                data.map(
                    item => Number(item.total || 0)
                );


            if (departmentChart) {

                departmentChart.destroy();

            }


            departmentChart =
                new Chart(
                    canvas,
                    {

                        type: "bar",

                        data: {

                            labels: labels,

                            datasets: [

                                {

                                    label:
                                        "Students",

                                    data:
                                        totals,

                                    borderWidth:
                                        1

                                }

                            ]

                        },

                        options: {

                            responsive: true,

                            maintainAspectRatio:
                                false,

                            scales: {

                                y: {

                                    beginAtZero:
                                        true,

                                    ticks: {

                                        precision: 0

                                    }

                                }

                            }

                        }

                    }
                );

        })

        .catch(err => {

            console.error(
                "Department Chart Error:",
                err
            );

        });

}

// ==========================================
// LOAD DASHBOARD
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        console.log(
            "Dashboard Loaded Successfully"
        );


        // SUMMARY
        loadDashboardSummary();


        // ATTENDANCE
        loadAttendancePercentage();


        // YEAR WISE
        loadYearWiseStudents();


        // DEPARTMENT CHART
        loadDepartmentChart();

    }
);