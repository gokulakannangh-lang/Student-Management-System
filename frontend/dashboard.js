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