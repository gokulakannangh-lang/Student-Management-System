// ==========================================
// DASHBOARD SUMMARY
// ==========================================

function loadDashboardSummary() {

    fetch("https://student-management-system-5xwr.onrender.com/dashboard/summary")

        .then(res => {
            if (!res.ok) {
                throw new Error("Summary API Error");
            }
            return res.json();
        })

        .then(data => {

            console.log("Dashboard Summary:", data);

            // Total Students
            document.getElementById("totalStudents").textContent =
                data.students || 0;

            // Departments
            document.getElementById("totalDepartments").textContent =
                data.departments || 0;

            // Marks
            document.getElementById("totalMarks").textContent =
                data.pass || 0;

        })

        .catch(err => {

            console.error("Dashboard Summary Error:", err);

        });
}



// ==========================================
// ATTENDANCE PERCENTAGE
// ==========================================

function loadAttendancePercentage() {

    fetch("https://student-management-system-5xwr.onrender.com/dashboard/attendance-chart")

        .then(res => {
            if (!res.ok) {
                throw new Error("Attendance API Error");
            }

            return res.json();
        })

        .then(attendance => {

            console.log("Attendance Data:", attendance);

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

            const total = present + absent;

            const percentage = total > 0
                ? Math.round((present / total) * 100)
                : 0;

            document.getElementById(
                "attendancePercentage"
            ).textContent = percentage + "%";

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

    fetch("https://student-management-system-5xwr.onrender.com/students")

        .then(res => res.json())

        .then(students => {

            console.log("Students for Year:", students);

            let firstYear = 0;
            let secondYear = 0;
            let thirdYear = 0;
            let fourthYear = 0;

            students.forEach(student => {

                if (student.year === "1st Year") {
                    firstYear++;
                }

                else if (student.year === "2nd Year") {
                    secondYear++;
                }

                else if (student.year === "3rd Year") {
                    thirdYear++;
                }

                else if (student.year === "4th Year") {
                    fourthYear++;
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

    fetch("https://student-management-system-5xwr.onrender.com/dashboard-stats")

        .then(res => {

            if (!res.ok) {
                throw new Error("Dashboard Stats API Error");
            }

            return res.json();

        })

        .then(result => {

            console.log(
                "Department Chart Data:",
                result
            );

            if (!result.success) {
                return;
            }

            const rows = result.data;

            // Combine same departments
            const departmentData = {};

            rows.forEach(row => {

                const department = row.department;
                const total = Number(row.total);

                if (departmentData[department]) {

                    departmentData[department] += total;

                } else {

                    departmentData[department] = total;

                }

            });


            const labels = Object.keys(departmentData);

            const values = Object.values(departmentData);


            const canvas =
                document.getElementById("departmentChart");

            if (!canvas) {
                console.error(
                    "departmentChart canvas not found"
                );
                return;
            }


            // Destroy old chart
            if (departmentChart) {
                departmentChart.destroy();
            }


            departmentChart = new Chart(
                canvas,
                {
                    type: "bar",

                    data: {

                        labels: labels,

                        datasets: [

                            {
                                label: "Students",

                                data: values

                            }

                        ]

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

        loadDashboardSummary();

        loadAttendancePercentage();

        loadYearWiseStudents();

        loadDepartmentChart();

    }
);