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

    const role = localStorage.getItem("role");
    const teacherId = localStorage.getItem("teacherId");

    let apiUrl =
        "https://student-management-system-5xwr.onrender.com/students";


    // ==========================================
    // TEACHER → ASSIGNED STUDENTS
    // ==========================================

    if (role === "teacher") {

        if (!teacherId) {

            console.error("Teacher ID not found");

            return;

        }

        apiUrl =
            "https://student-management-system-5xwr.onrender.com/teacher-students/"
            + teacherId;

    }


    fetch(apiUrl)

        .then(res => {

            if (!res.ok) {

                throw new Error("Students API Error");

            }

            return res.json();

        })

        .then(result => {

            console.log("Teacher Students API:", result);


            // ==========================================
            // HANDLE ARRAY OR OBJECT RESPONSE
            // ==========================================

            const students =
                Array.isArray(result)
                    ? result
                    : (result.students || result.data || []);


            console.log("Students used for Year Wise:",students);
             console.log("First Student:", students[0]);
            console.log("First Student Year:", students[0]?.year);

            let firstYear = 0;
            let secondYear = 0;
            let thirdYear = 0;
            let fourthYear = 0;


            students.forEach(student => {

                const year =
                    String(student.year || "")
                        .trim();


                if (year === "1st Year") {

                    firstYear++;

                }

                else if (year === "2nd Year") {

                    secondYear++;

                }

                else if (year === "3rd Year") {

                    thirdYear++;

                }

                else if (year === "4th Year") {

                    fourthYear++;

                }

            });


            // ==========================================
            // UPDATE DASHBOARD
            // ==========================================

            const firstYearCount =
                document.getElementById("firstYearCount");

            if (firstYearCount) {

                firstYearCount.textContent =
                    firstYear;

            }


            const secondYearCount =
                document.getElementById("secondYearCount");

            if (secondYearCount) {

                secondYearCount.textContent =
                    secondYear;

            }


            const thirdYearCount =
                document.getElementById("thirdYearCount");

            if (thirdYearCount) {

                thirdYearCount.textContent =
                    thirdYear;

            }


            const fourthYearCount =
                document.getElementById("fourthYearCount");

            if (fourthYearCount) {

                fourthYearCount.textContent =
                    fourthYear;

            }


            console.log(
                "Year Wise:",
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


    // ADMIN API
    let apiUrl =
        "https://student-management-system-5xwr.onrender.com/dashboard/chart";


    // TEACHER API
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
            + teacherId;

    }


    fetch(apiUrl)

        .then(res => {

            if (!res.ok) {

                throw new Error(
                    "Department Chart API Error"
                );

            }

            return res.json();

        })

        .then(data => {

            console.log(
                "Department Chart Data:",
                data
            );


            let labels = [];
            let totals = [];


            data.forEach(item => {

                labels.push(
                    item.department
                );

                totals.push(
                    Number(item.total)
                );

            });


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


            // DESTROY OLD CHART
            if (departmentChart) {

                departmentChart.destroy();

            }


            // CREATE CHART
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

                                    borderWidth: 1

                                }

                            ]

                        },


                        options: {

                            responsive: true,

                            maintainAspectRatio:
                                false,

                            plugins: {

                                legend: {

                                    display: true

                                }

                            },


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