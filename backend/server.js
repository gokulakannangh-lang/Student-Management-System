const express = require("express");
const cors = require("cors");
const db = require("./database");
const multer = require("multer");
const path = require("path");
const app = express();
const PDFDocument = require("pdfkit");
const ExcelJS = require("exceljs");
const frontendPath = path.join(__dirname, "../frontend");

app.use(express.static(frontendPath));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Middleware
app.use(cors());
app.use(express.json());

const storage = multer.diskStorage({
    destination: "./uploads/",
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

app.use("/uploads", express.static("uploads"));

// Home Route
app.get("/", (req, res) => {
    res.send("Student Management System Backend Running...");
});

app.get("/", (req, res) => {
    res.sendFile(path.join(frontendPath, "login.html"));
});

app.get("/login.html", (req, res) => {
    res.sendFile(path.join(frontendPath, "login.html"));
});

// ADMIN + TEACHER LOGIN
app.post("/login", (req, res) => {

    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({
            success: false,
            message: "Username and Password are required"
        });
    }

      const adminSql = `
        SELECT *
        FROM admin
        WHERE username = ?
        AND password = ?
        LIMIT 1
    `;

    db.query(
        adminSql,
        [username, password],
        (adminErr, adminResult) => {

            if (adminErr) {

                console.error("Admin Login Error:", adminErr);

                return res.status(500).json({
                    success: false,
                    message: adminErr.sqlMessage
                });

            }

          
            if (adminResult.length > 0) {

                const admin = adminResult[0];

                console.log("Admin Login:", admin.username);

                return res.json({

                    success: true,

                    message: "Admin Login Successful",

                    role: "admin"

                });

            }

            const teacherSql = `
                SELECT
                    id,
                    username,
                    password,
                    name,
                    department,
                    year,
                    college_shift
                FROM teachers
                WHERE username = ?
                AND password = ?
                LIMIT 1
            `;

            db.query(
                teacherSql,
                [username, password],
                (teacherErr, teacherResult) => {

                    if (teacherErr) {

                        console.error(
                            "Teacher Login Error:",
                            teacherErr
                        );

                        return res.status(500).json({
                            success: false,
                            message: teacherErr.sqlMessage
                        });

                    }

                    if (teacherResult.length > 0) {

                        const teacher = teacherResult[0];

                        console.log(
                            "Teacher Login:",
                            teacher.username
                        );

                        return res.json({

                            success: true,

                            message: "Teacher Login Successful",

                            role: "teacher",

                            teacherId: teacher.id,

                            teacherName: teacher.name,

                            department: teacher.department,

                            year: teacher.year,

                            college_shift: teacher.college_shift

                        });

                    }

                    return res.json({

                        success: false,

                        message: "Invalid Username or Password"

                    });

                }
            );

        }
    );

});

// ADD STUDENT
app.post("/students", upload.single("photo"), (req, res) => {

    const {
        name,
        regno,
        gender,
        dob,
        bloodgroup,
        department,
        year,
        phone,
        email,
        address,
        parentname,
        parentphone,
        batch,
        college_shift,
        admission_date
    } = req.body;

    const photo = req.file ? req.file.filename : "";

    const sql = `
        INSERT INTO students
        (
            name,
            reg_no,
            gender,
            dob,
            blood_group,
            department,
            year,
            phone,
            email,
            address,
            parent_name,
            parent_phone,
            batch,
            college_shift,
            admission_date,
            photo
        )
          VALUES
        (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
        sql,
        [
            name,
            regno,
            gender,
            dob,
            bloodgroup,
            department,
            year,
            phone,
            email,
            address,
            parentname,
            parentphone,
            batch,
            college_shift,
            admission_date,
            photo
        ],
        (err, result) => {

            if (err) {
                console.log("Add Student Error:", err);

                return res.status(500).json({
                    success: false,
                    message: err.sqlMessage
                });
            }

            saveLog("Admin", "Added Student : " + name);

            res.json({
                success: true,
                message: "Student Saved Successfully",
                id: result.insertId
            });

        }
    );

});


// Get Students API
app.get("/students", (req, res) => {

    db.query(`
        SELECT
            id,
            name,
            reg_no,
            gender,
            DATE_FORMAT(dob,'%Y-%m-%d') AS dob,
            blood_group,
            department,
            year,
            phone,
            email,
            address,
            parent_name,
            parent_phone,
            batch,
            college_shift,
            DATE_FORMAT(admission_date,'%Y-%m-%d') AS admission_date,
            photo
        FROM students
    `, (err, results) => {

        if (err) {
            console.log(err);
            return res.status(500).json({
                message: err.sqlMessage
            });
        }

        res.json(results);

    });

});

//student ID
app.get("/students/:id", (req, res) => {

    const id = req.params.id;

    db.query(
        "SELECT * FROM students WHERE id = ?",
        [id],
        (err, result) => {

            if (err) {
                return res.status(500).json({ message: "Database Error" });
            }

            if (result.length === 0) {
                return res.status(404).json({ message: "Student Not Found" });
            }

            res.json(result[0]);
        }
    );

});

// TEACHER STUDENTS
app.get("/teacher-students/:teacherId", (req, res) => {

    const teacherId = req.params.teacherId;

    const sql = `
        SELECT DISTINCT
            s.id,
            s.name,
            s.reg_no,
            s.gender,
            DATE_FORMAT(s.dob,'%Y-%m-%d') AS dob,
            s.blood_group,
            s.department,
            s.year,
            s.phone,
            s.email,
            s.address,
            s.parent_name,
            s.parent_phone,
            s.batch,
            s.college_shift,
            DATE_FORMAT(s.admission_date,'%Y-%m-%d') AS admission_date,
            s.photo
            
              FROM students s
    INNER JOIN teacher_classes tc
        ON s.department = tc.department
        AND s.year = tc.year
        AND s.college_shift = tc.college_shift
    WHERE tc.teacher_id = ?
    ORDER BY s.department, s.year, s.college_shift, s.name
      
    `;

    db.query(sql, [teacherId], (err, rows) => {

        if (err) {
            console.log("Teacher Students Error:", err);

            return res.status(500).json({
                success: false,
                message: "Database Error"
            });
        }

        console.log("Teacher ID:", teacherId);
        console.log("Teacher Students:", rows);

        res.json({
            success: true,
            data: rows
        });
    });
});


// Update Student API
app.put("/students/:id", upload.single("photo"), (req, res) => {
    
     
    const { name,regno,gender,dob,bloodgroup,department,year,phone,email,address,parentname,parentphone,batch,college_shift,admission_date} = req.body;
    const id = req.params.id;

    const sql = `
UPDATE students
SET
    name=?,
    reg_no=?,
    gender=?,
    dob=?,
    blood_group=?,
    department=?,
    year=?,
    phone=?,
    email=?,          
    address=?,
    parent_name=?,
    parent_phone=?,
    batch=?,
    college_shift=?,
    admission_date=?

WHERE id=?
`;
    console.log("DOB received:", dob);
    console.log(req.body);
    

    db.query(
    sql,
    [name, regno, gender, dob, bloodgroup,
     department, year, phone, email,
     address, parentname, parentphone, batch, college_shift, admission_date, id],
    (err, result) => {

        if (err) {
            console.log(err);
            return res.status(500).json({
                message: err.sqlMessage
            });
        }

saveLog("Admin", "Updated Student ID : " + id);
     console.log(result); 

        res.json({
            message: "Student Updated Successfully"
        });

    }
);

});

// ==========================================
// UPDATE STUDENT PHOTO
// ==========================================
app.put("/students/:id/photo", upload.single("photo"), (req, res) => {

    const id = req.params.id;

    if (!req.file) {
        return res.status(400).json({
            success: false,
            message: "Photo not selected"
        });
    }

    const photo = req.file.filename;

    const sql = `
        UPDATE students
        SET photo = ?
        WHERE id = ?
    `;

    db.query(
        sql,
        [photo, id],
        (err, result) => {

            if (err) {
                console.log("Photo Update Error:", err);

                return res.status(500).json({
                    success: false,
                    message: err.sqlMessage
                });
            }

            saveLog(
                "Admin/Teacher",
                "Updated Student Photo ID : " + id
            );

            res.json({
                success: true,
                message: "Photo Updated Successfully",
                photo: photo
            });

        }
    );

});

// Save Attendance API
app.post("/attendance", (req, res) => {

    const {
        student_id,
        attendance_date,
        status
    } = req.body;

    const sql = `
        INSERT INTO attendance
        (student_id, attendance_date, status)
        VALUES (?, ?, ?)
    `;

    db.query(
        sql,
        [student_id, attendance_date, status],
        (err, result) => {

            if (err) {

                console.log(
                    "Attendance Save Error:",
                    err
                );

                return res.status(500).json({
                    success: false,
                    message: "Attendance Save Failed"
                });
            }

            console.log(
                "Attendance Saved:",
                result.insertId
            );

            res.json({
                success: true,
                message: "Attendance Saved Successfully"
            });

        }
    );

});
// Update Attendance
app.put("/attendance/:id", (req, res) => {

    const id = req.params.id;
    const { status } = req.body;

    const sql = `
        UPDATE attendance
        SET status = ?
        WHERE attendance_id = ?
    `;

    db.query(sql, [status, id], (err, result) => {

        if (err) {
            console.log(err);
            return res.status(500).json({
                message: err.sqlMessage
            });
        }

        res.json({
            message: "Attendance Updated Successfully"
        });

    });

});

// Delete Attendance
app.delete("/attendance/:id", (req, res) => {

    const id = req.params.id;

    const sql = `
        DELETE FROM attendance
        WHERE attendance_id = ?
    `;

    db.query(sql, [id], (err, result) => {

        if (err) {
            console.log(err);
            return res.status(500).json({
                message: err.sqlMessage
            });
        }

        res.json({
            message: "Attendance Deleted Successfully"
        });

    });

});
// TEACHER ATTENDANCE RECORDS

app.get("/teacher-attendance/:teacherId", (req, res) => {

    const teacherId = req.params.teacherId;

    const sql = `
        SELECT
            a.id AS attendance_id,
            s.name,
            s.reg_no,
            a.attendance_date,
            a.status

        FROM attendance a

        INNER JOIN students s
            ON a.student_id = s.id

        INNER JOIN teacher_classes tc
            ON s.department = tc.department
            AND s.year = tc.year
            AND s.college_shift = tc.college_shift

        WHERE tc.teacher_id = ?

        ORDER BY a.attendance_date DESC, s.name
    `;

    db.query(sql, [teacherId], (err, rows) => {

        if (err) {

            console.log(
                "Teacher Attendance Error:",
                err
            );

            return res.status(500).json({
                success: false,
                message: "Database Error"
            });

        }

        console.log(
            "Teacher ID:",
            teacherId
        );

        console.log(
            "Teacher Attendance:",
            rows
        );

        res.json({
            success: true,
            data: rows
        });

    });

});

//subjects semester department get api
app.get("/subjects/:semester/:department", (req, res) => {

    const { semester, department } = req.params;

    const sql = `
        SELECT *
        FROM subjects
        WHERE semester = ?
        AND department = ?
    `;

    db.query(sql, [semester, department], (err, result) => {

        if (err) {
            return res.status(500).json(err);
        }

        res.json(result);

    });

});

//subject get api
app.get("/subjects", (req, res) => {

    db.query("SELECT * FROM subjects",
    (err, result) => {

        if (err)
            return res.status(500).json(err);

        res.json(result);

    });

});

//subject post api
app.post("/subjects", (req, res) => {

    const {
        department,
        semester,
        subject_code,
        subject_name
    } = req.body;

    const sql =
    "INSERT INTO subjects(department,semester,subject_code,subject_name) VALUES (?,?,?,?)";

    db.query(sql,
    [department, semester, subject_code, subject_name],
    (err) => {

        if (err)
            return res.status(500).json(err);

        res.json({
            success: true,
            message: "Subject Added Successfully"
        });

    });

});

//subject delete
app.delete("/subjects/:id", (req, res) => {

    db.query(
        "DELETE FROM subjects WHERE subject_id=?",
        [req.params.id],
        (err) => {

            if (err)
                return res.status(500).json(err);

            res.json({
                success: true,
                message: "Subject Deleted"
            });

        });

});

// Update Subject
app.put("/subjects/:id", (req, res) => {

    const {
        department,
        semester,
        subject_code,
        subject_name
    } = req.body;

    const sql = `
        UPDATE subjects
        SET
            department = ?,
            semester = ?,
            subject_code = ?,
            subject_name = ?
        WHERE subject_id = ?
    `;

    db.query(
        sql,
        [
            department,
            semester,
            subject_code,
            subject_name,
            req.params.id
        ],
        (err) => {

            if (err) {
                return res.status(500).json(err);
            }

            res.json({
                success: true,
                message: "Subject Updated Successfully"
            });

        }
    );

});

//Marks
app.post("/marks",(req,res)=>{

const {
student_id,
paper_code,
subject,
internal_marks,
external_marks,
semester
}=req.body;

const total=
Number(internal_marks)+Number(external_marks);

let grade="F";

if(total>=90) grade="O";
else if(total>=80) grade="A+";
else if(total>=70) grade="A";
else if(total>=60) grade="B+";
else if(total>=50) grade="B";
else if(total>=40) grade="C";

const sql=`
INSERT INTO marks
(student_id, paper_code, subject, internal_marks,
external_marks, total, grade, semester)
VALUES (?,?,?,?,?,?,?,?)
`;

db.query(sql,
[
student_id,
paper_code,
subject,
internal_marks,
external_marks,
total,
grade,
semester
],
(err)=>{

if(err){
return res.status(500).json({
message:err.sqlMessage
});
}
 saveLog("Admin", "Marks Added");
res.json({
message:"Marks Saved Successfully"
});

});

});
// Update Marks
app.put("/marks/:id", (req, res) => {

    const id = req.params.id;

    const {
        paper_code,
        internal_marks,
        external_marks,
        semester
    } = req.body;

    const total =
        Number(internal_marks) + Number(external_marks);

    let grade = "F";

    if (total >= 90) grade = "O";
    else if (total >= 80) grade = "A+";
    else if (total >= 70) grade = "A";
    else if (total >= 60) grade = "B+";
    else if (total >= 50) grade = "B";
    else if (total >= 40) grade = "C";

    const sql = `
        UPDATE marks
        SET
            paper_code=?,
            internal_marks=?,
            external_marks=?,
            total=?,
            grade=?,
            semester=?
        WHERE mark_id=?
    `;

    db.query(
        sql,
        [
            paper_code,
            internal_marks,
            external_marks,
            total,
            grade,
            semester,
            id
        ],
        (err) => {

            if (err) {
                return res.status(500).json({
                    message: err.sqlMessage
                });
            }

            res.json({
                message: "Marks Updated Successfully"
            });

        }
    );

});
//markes get
app.get("/marks", (req, res) => {

    const sql = `
        SELECT
            m.mark_id,
            s.name,
            s.reg_no,
            s.department,
            m.paper_code,
            m.semester,
            m.subject,
            m.internal_marks,
            m.external_marks,
            m.total,
            m.grade
        FROM students s
        JOIN marks m
        ON s.id = m.student_id
        ORDER BY s.name, m.semester;
    `;

    db.query(sql, (err, result) => {

        if (err) {
            return res.status(500).json({
                message: err.sqlMessage
            });
        }

        res.json(result);

    });

});
// Delete Marks
app.delete("/marks/:id", (req, res) => {

    const id = req.params.id;

    db.query(
        "DELETE FROM marks WHERE mark_id=?",
        [id],
        (err) => {

            if (err) {
                return res.status(500).json({
                    message: err.sqlMessage
                });
            }

            res.json({
                message: "Marks Deleted Successfully"
            });

        }
    );

});

// Delete Student API
app.delete("/students/:id", (req, res) => {

    const id = req.params.id;

    const sql = "DELETE FROM students WHERE id = ?";

    db.query(sql, [id], (err, result) => {

        if (err) {
            console.log(err);
            res.status(500).json({ message: "Database Error" });
        } 
        
        else 
        {
            saveLog("Admin", "Deleted Student ID : " + id);
            res.json({ message: "Student Deleted Successfully" });
        }

    });

});

// Test Route
app.get("/students/photo/:id", (req, res) => {
    res.send("Photo Route Working");
});

// Photo Update
app.put("/students/photo/:id", upload.single("photo"), (req, res) => {
     
    const id = req.params.id;
    const photo = req.file.filename;

    db.query(
        "UPDATE students SET photo=? WHERE id=?",
        [photo, id],
        (err) => {
            if (err) {
                return res.status(500).json({ message: "Database Error" });
            }

            res.json({ message: "Photo Updated Successfully" });
        }
    );

});

// Add Fees
app.post("/fees", (req, res) => {

    const {
        student_id,
        semester,
        total_fees,
        paid_amount,
        payment_date
    } = req.body;

    let balance_amount = total_fees - paid_amount;

    let status = balance_amount <= 0 ? "Paid" : "Pending";

    const sql = `
        INSERT INTO fees
        (student_id, semester, total_fees, paid_amount, balance_amount, payment_date, status)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
        sql,
        [
            student_id,
            semester,
            total_fees,
            paid_amount,
            balance_amount,
            payment_date,
            status
        ],
        (err, result) => {

            if (err) {
                console.log(err);
                return res.json({
                    success: false,
                    message: "Error Adding Fees"
                });
            }
              saveLog("Admin", "Fees Added");
            res.json({
                success: true,
                message: "Fees Added Successfully"
            });

        }
    );

});

// Get All Fees
app.get("/fees", (req, res) => {

    const sql = `
        SELECT
            f.fee_id,
            s.name,
            s.reg_no,
            f.semester,
            f.total_fees,
            f.paid_amount,
            f.balance_amount,
            f.payment_date,
            f.status
        FROM fees f
        JOIN students s
        ON f.student_id = s.id
        ORDER BY f.fee_id DESC
    `;

    db.query(sql, (err, result) => {

        if (err) {
            console.log(err);
            return res.json({
                success: false,
                message: "Error Loading Fees"
            });
        }

        res.json(result);

    });

});

// Update Fees
app.put("/fees/:id", (req, res) => {

    const id = req.params.id;

    const {
        total_fees,
        paid_amount,
        semester,
        payment_date
    } = req.body;

    let balance_amount = total_fees - paid_amount;

    let status = balance_amount <= 0 ? "Paid" : "Pending";

    const sql = `
        UPDATE fees
        SET
            semester = ?,
            total_fees = ?,
            paid_amount = ?,
            balance_amount = ?,
            payment_date = ?,
            status = ?
        WHERE fee_id = ?
    `;

    db.query(
        sql,
        [
            semester,
            total_fees,
            paid_amount,
            balance_amount,
            payment_date,
            status,
            id
        ],
        (err, result) => {

            if (err) {
                console.log(err);
                return res.json({
                    success: false,
                    message: "Error Updating Fees"
                });
            }

            res.json({
                success: true,
                message: "Fees Updated Successfully"
            });

        }
    );

});

// Delete Fees
app.delete("/fees/:id", (req, res) => {

    const id = req.params.id;

    db.query(
        "DELETE FROM fees WHERE fee_id = ?",
        [id],
        (err, result) => {

            if (err) {
                console.log(err);
                return res.json({
                    success: false,
                    message: "Error Deleting Fees"
                });
            }

            res.json({
                success: true,
                message: "Fees Deleted Successfully"
            });

        }
    );

});

//studentpdf
app.get("/students/pdf", (req, res) => {

    db.query("SELECT * FROM students", (err, students) => {

        if (err) {
            return res.status(500).send("Database Error");
        }

        const PDFDocument = require("pdfkit");
        const path = require("path");

        const doc = new PDFDocument({
            margin: 40,
            size: "A4"
        });

        res.setHeader(
            "Content-Type",
            "application/pdf"
        );

        res.setHeader(
            "Content-Disposition",
            "attachment; filename=Students_Report.pdf"
        );

        doc.pipe(res);

// Logo
        const logoPath = path.join(__dirname, "logo.png");

        doc.image(logoPath, 40, 20, {
            width: 60
        });

// College Name
        doc
            .fontSize(20)
            .text("GOVERNMENT ARTS AND SCIENCE COLLEGE", 120, 25);

        doc
            .fontSize(12)
            .text("Student Management System", 120, 55);

        doc.moveDown(3);

        doc
            .fontSize(16)
            .text("Students Report", {
                align: "center"
            });

        doc.moveDown();

// Table Header
        doc.fontSize(11);

        doc.text("ID", 40);
        doc.text("Name", 80);
        doc.text("Reg No", 220);
        doc.text("Department", 320);
        doc.text("Year", 470);

        doc.moveTo(40, doc.y + 5)
           .lineTo(560, doc.y + 5)
           .stroke();

        doc.moveDown();

        students.forEach(student => {

            doc.text(student.id, 40);
            doc.text(student.name, 80);
            doc.text(student.reg_no, 220);
            doc.text(student.department, 320);
            doc.text(student.year, 470);

            doc.moveDown();

        });

        doc.moveDown(2);

        doc.text(
            "Generated On : " +
            new Date().toLocaleString(),
            {
                align: "right"
            }
        );

        doc.end();

    });

});

//report students API
app.get("/reports/students", (req, res) => {

    const sql = `
    SELECT
        id,
        name,
        reg_no,
        department,
        year
    FROM students
    ORDER BY id ASC
    `;

    db.query(sql, (err, result) => {

        if (err) {
            return res.status(500).json(err);
        }

        res.json(result);

    });

});
//REPORT ATTENDANCE API
app.get("/reports/attendance", (req, res) => {

    const sql = `
    SELECT
        a.attendance_id,
        s.name,
        s.reg_no,
        a.attendance_date,
        a.status
    FROM attendance a
    JOIN students s
    ON a.student_id = s.id
    ORDER BY a.attendance_date DESC
    `;

    db.query(sql, (err, result) => {

        if (err) return res.json(err);

        res.json(result);

    });

});
//repormarks
app.get("/reports/marks", (req, res) => {

    const sql = `
    SELECT
        m.mark_id,
        s.name,
        s.reg_no,
        m.subject,
        m.internal_marks,
        m.external_marks,
        m.total,
        m.grade,
        m.semester
    FROM marks m
    JOIN students s
    ON m.student_id = s.id
    ORDER BY m.mark_id DESC
    `;

    db.query(sql, (err, result) => {

        if (err) return res.json(err);

        res.json(result);

    });

});
//reportfees
app.get("/reports/fees", (req, res) => {

    const sql = `
    SELECT
        f.fee_id,
        s.name,
        s.reg_no,
        f.semester,
        f.total_fee,
        f.paid_fee,
        f.balance_fee,
        f.payment_mode,
        f.status
    FROM fees f
    JOIN students s
    ON f.student_id = s.id
    ORDER BY f.fee_id DESC
    `;

    db.query(sql, (err, result) => {

        if (err) {
            return res.json(err);
        }

        res.json(result);

    });

});
// ==========================================
// STUDENT RESULT
// Registered Student Only
// ==========================================

app.get(
    "/student-result/:studentId/:semester",
    (req, res) => {

        const studentId =
            req.params.studentId;

        const semester =
            req.params.semester;


        const sql = `

            SELECT

                students.id,
                students.name,
                students.reg_no,
                students.department,

                marks.paper_code,
                marks.subject,
                marks.internal_marks,
                marks.external_marks,
                marks.total,
                marks.grade,
                marks.semester

            FROM students

            JOIN marks
                ON students.id = marks.student_id

            WHERE students.id = ?

            AND marks.semester = ?

            ORDER BY marks.paper_code ASC

        `;


        db.query(
            sql,
            [
                studentId,
                semester
            ],
            (err, result) => {

                if (err) {

                    console.error(
                        "Student Result Error:",
                        err
                    );

                    return res
                        .status(500)
                        .json({
                            message:
                                err.sqlMessage
                        });

                }


                console.log(
                    "Student ID:",
                    studentId
                );

                console.log(
                    "Semester:",
                    semester
                );

                console.log(
                    "Result:",
                    result
                );


                res.json(result);

            }
        );

    }
);
// ==========================================
// ALL STUDENTS RESULT BY SEMESTER
// ==========================================

app.get("/student-results/:semester", (req, res) => {

    const semester = req.params.semester;

    console.log("Selected Semester:", semester);

    const sql = `
        SELECT
            students.id,
            students.name,
            students.reg_no,
            students.department,
            marks.paper_code,
            marks.subject,
            marks.internal_marks,
            marks.external_marks,
            marks.total,
            marks.grade,
            marks.semester

        FROM marks

        JOIN students
            ON students.id = marks.student_id

        WHERE marks.semester = ?

        ORDER BY
            students.name ASC,
            marks.paper_code ASC
    `;

    db.query(sql, [semester], (err, result) => {

        if (err) {

            console.error(
                "All Student Result Error:",
                err
            );

            return res.status(500).json({
                message: err.sqlMessage
            });
        }

        console.log(
            "ALL STUDENT RESULT:",
            result
        );

        res.json(result);

    });

});
//get setting
app.get("/settings", (req, res) => {

    db.query("SELECT * FROM settings LIMIT 1", (err, result) => {

        if (err) return res.json(err);

        res.json(result[0]);

    });

});
//put setting
app.put("/settings", (req, res) => {

    const {
        college_name,
        college_address,
        college_phone,
        college_email,
        principal_name
    } = req.body;

    const sql = `
    UPDATE settings
    SET
    college_name=?,
    college_address=?,
    college_phone=?,
    college_email=?,
    principal_name=?
    WHERE id=1`;

    db.query(sql, [
        college_name,
        college_address,
        college_phone,
        college_email,
        principal_name
    ], (err) => {

        if (err) return res.json(err);

        res.json({
            message: "Settings Updated Successfully"
        });

    });

});
//dashboardchart
app.get("/dashboard/teacher-chart/:teacherId", (req, res) => {

    const teacherId = req.params.teacherId;

    const sql = `
        SELECT
            s.department,
            COUNT(*) AS total
        FROM students s

        INNER JOIN teacher_classes tc
            ON s.department = tc.department
            AND s.year = tc.year
            AND s.college_shift = tc.college_shift

        WHERE tc.teacher_id = ?

        GROUP BY s.department
    `;

    db.query(sql, [teacherId], (err, rows) => {

        if (err) {

            console.log("Teacher Chart Error:", err);

            return res.status(500).json({
                success: false,
                message: "Database Error"
            });
        }

        res.json(rows);
    });
});

//dashboard/attendance-chart
app.get("/dashboard/attendance-chart", (req, res) => {

    const sql = `
    SELECT status, COUNT(*) AS total
    FROM attendance
    GROUP BY status
    `;

    db.query(sql, (err, result) => {

        if (err) return res.json(err);

        res.json(result);

    });

});

//dashboard summary
app.get("/dashboard/summary",(req,res)=>{

    let summary={};

    db.query("SELECT COUNT(*) total FROM students",(err,r1)=>{

        summary.students=r1[0].total;

        db.query("SELECT COUNT(DISTINCT department) total FROM students",(err,r2)=>{

            summary.departments=r2[0].total;

            db.query("SELECT COUNT(*) total FROM fees WHERE status='Paid'",(err,r3)=>{

                summary.paid=r3[0].total;

                db.query("SELECT COUNT(*) total FROM fees WHERE status='Pending'",(err,r4)=>{

                    summary.pending=r4[0].total;

                    db.query("SELECT COUNT(*) total FROM attendance WHERE status='Present'",(err,r5)=>{

                        summary.present=r5[0].total;

                        db.query("SELECT COUNT(*) total FROM marks WHERE grade<>'F'",(err,r6)=>{

                            summary.pass=r6[0].total;

                            res.json(summary);

                        });

                    });

                });

            });

        });

    });

});

///exportstudents gets API
app.get("/export/students", async (req, res) => {

    db.query("SELECT * FROM students", async (err, result) => {

        if (err) {
            return res.status(500).send(err);
        }

        let workbook = new ExcelJS.Workbook();
        let worksheet = workbook.addWorksheet("Students");

        worksheet.columns = [
            { header: "ID", key: "id", width: 10 },
            { header: "Name", key: "name", width: 25 },
            { header: "Register No", key: "reg_no", width: 20 },
            { header: "Department", key: "department", width: 25 },
            { header: "Year", key: "year", width: 15 },
            { header: "Phone", key: "phone", width: 20 },
            { header: "Email", key: "email", width: 30 }
        ];

        result.forEach(student => {
            worksheet.addRow(student);
        });

        res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );

        res.setHeader(
            "Content-Disposition",
            "attachment; filename=Students.xlsx"
        );

        await workbook.xlsx.write(res);

        res.end();

    });

});

//notifications
app.get("/dashboard/notifications",(req,res)=>{

    let notification={};

    db.query("SELECT COUNT(*) total FROM fees WHERE status='Pending'",(err,r1)=>{

        notification.feesDue=r1[0].total;

        db.query("SELECT COUNT(*) total FROM attendance WHERE status='Absent'",(err,r2)=>{

            notification.absent=r2[0].total;

            db.query("SELECT COUNT(*) total FROM students",(err,r3)=>{

                notification.students=r3[0].total;

                res.json(notification);

            });

        });

    });

});

   
// register post
app.post("/student-register", (req, res) => {

    const { reg_no, dob } = req.body;

    const sql = `
        SELECT id, name, reg_no, dob, department
        FROM students
        WHERE reg_no = ?
        AND DATE(dob) = ?
        LIMIT 1
    `;

    db.query(sql, [reg_no, dob], (err, result) => {

        if (err) {
            console.error(err);

            return res.status(500).json({
                success: false,
                message: err.sqlMessage
            });
        }

        if (result.length === 0) {

            return res.json({
                success: false,
                message: "Register Number or Date of Birth is incorrect"
            });

        }

        const student = result[0];

        console.log(
            "Student Registered:",
            student.id,
            student.name
        );

        res.json({
            success: true,
            studentId: student.id,
            name: student.name
        });

    });

});
// ==========================================
// DASHBOARD STATISTICS
// ==========================================

app.get("/dashboard-stats", (req, res) => {

    const sql = `
        SELECT
            year,
            department,
            COUNT(*) AS total
        FROM students
        GROUP BY year, department
        ORDER BY year ASC, department ASC
    `;

    db.query(sql, (err, rows) => {

        if (err) {

            console.log("Dashboard Stats Error:", err);

            return res.status(500).json({
                success: false,
                message: "Database Error"
            });

        }

        res.json({
            success: true,
            data: rows
        });

    });

});
//seprate teacher
app.get("/teacher-students/:department/:year", (req, res) => {

    const department = req.params.department;
    const year = req.params.year;

    const sql = `
        SELECT *
        FROM students
        WHERE department = ?
        AND year = ?
        ORDER BY id ASC
    `;

    db.query(
        sql,
        [department, year],
        (err, rows) => {

            if (err) {
                console.log("Teacher Students Error:", err);

                return res.status(500).json({
                    success: false,
                    message: "Database Error"
                });
            }

            res.json({
                success: true,
                data: rows
            });
        }
    );
});

// ==========================================
// STUDENT RESULT
// Register Number + Date of Birth + Semester
// ==========================================

app.get("/student-result", (req, res) => {

    const regNo = req.query.reg_no;
    const dob = req.query.dob;
    const semester = req.query.semester;


    console.log("Register Number:", regNo);
    console.log("Date of Birth:", dob);
    console.log("Semester:", semester);


    const sql = `
        SELECT
            students.id,
            students.name,
            students.reg_no,
            students.department,
            marks.paper_code,
            marks.subject,
            marks.internal_marks,
            marks.external_marks,
            marks.total,
            marks.grade,
            marks.semester

        FROM students

        JOIN marks
            ON students.id = marks.student_id

        WHERE students.reg_no = ?
          AND students.dob = ?
          AND marks.semester = ?

        ORDER BY marks.paper_code ASC
    `;


    db.query(
        sql,
        [
            regNo,
            dob,
            semester
        ],
        (err, result) => {

            if (err) {

                console.error(
                    "Student Result Error:",
                    err
                );

                return res.status(500).json({
                    message: err.sqlMessage
                });

            }


            console.log(
                "Student Result:",
                result
            );


            res.json(result);

        }
    );

});

// ==========================================
// ADD TEACHER
// ==========================================

app.post("/teachers", (req, res) => {

    const {
        username,
        password,
        name,
        department,
        year,
        college_shift
    } = req.body;


    if (
        !username ||
        !password ||
        !name ||
        !department ||
        !year ||
        !college_shift
    ) {

        return res.status(400).json({

            success: false,

            message: "All fields are required"

        });

    }


    const sql = `

        INSERT INTO teachers
        (
            username,
            password,
            name,
            department,
            year,
            college_shift
        )

        VALUES (?, ?, ?, ?, ?, ?)

    `;


    db.query(

        sql,

        [
            username,
            password,
            name,
            department,
            year,
            college_shift
        ],

        (err, result) => {

            if (err) {

                console.error(
                    "Teacher Insert Error:",
                    err
                );


                return res.status(500).json({

                    success: false,

                    message: err.sqlMessage

                });

            }


            saveLog(
                "Admin",
                "Teacher Added"
            );


            res.json({

                success: true,

                message:
                    "Teacher Added Successfully ✅",

                teacherId:
                    result.insertId

            });

        }

    );

});

// Server
const PORT = process.env.PORT || 5000;

app.get("/test-frontend", (req, res) => {
    res.json({
        dirname: __dirname,
        frontendPath: frontendPath
    });
});


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});