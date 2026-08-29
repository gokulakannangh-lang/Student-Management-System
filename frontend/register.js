document
    .getElementById("studentRegisterForm")
    .addEventListener("submit", function (e) {

        e.preventDefault();

        const regNo =
            document.getElementById("reg_no").value.trim();

        const dob =
            document.getElementById("dob").value;

        if (regNo === "") {
            alert("Enter Register Number");
            return;
        }

        if (dob === "") {
            alert("Select Date of Birth");
            return;
        }

        fetch("http://student-management-system-5xwr.onrender.com/student-register", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                reg_no: regNo,
                dob: dob
            })

        })

        .then(res => res.json())

        .then(data => {

            console.log("Registration:", data);

            if (!data.success) {
                alert(data.message);
                return;
            }

            // IMPORTANT
            // Registered student's database ID
            localStorage.setItem(
                "studentId",
                data.studentId
            );

            localStorage.setItem(
                "studentRegistered",
                "true"
            );

            alert("Registration Successful ✅");

            window.location.href = "result.html";

        })

        .catch(err => {

            console.error(err);

            alert("Cannot connect to backend server");

        });

    });