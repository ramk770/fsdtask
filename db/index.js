const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcryptjs");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(cookieParser());

// Create DB connection
const db = mysql.createConnection({
    host: "sql5.freesqldatabase.com",
    user: "sql5752521",
    password: "GLhAedf8DD",
    database: "sql5752521"
});

db.connect((err) => {
    if (err) {
        console.log("Error:", err);
    }
    console.log("Database is connected");
});

// Create Database Route
app.get("/createdb", (req, res) => {
    let sql = "CREATE DATABASE IF NOT EXISTS FORM";
    db.query(sql, (err, result) => {
        if (err) throw err;
        console.log("Database created");
        res.send("Database created");
    });
});

// Create Table Route
app.get("/createtable", (req, res) => {
    let dropSql = "DROP TABLE IF EXISTS Emp";
    db.query(dropSql, (err, result) => {
        if (err) {
            console.error("Error dropping table:", err);
            return res.status(500).send("Error dropping table");
        }

        let createSql = `CREATE TABLE Emp(
            EMP_id INT AUTO_INCREMENT PRIMARY KEY,
            employId VARCHAR(8) UNIQUE,
            name VARCHAR(20),
            email VARCHAR(20) UNIQUE,
            password VARCHAR(255),
            phone VARCHAR(15),
            dept VARCHAR(20),
            empDate DATE,
            role VARCHAR(20)
        )`;
        db.query(createSql, (err, result) => {
            if (err) {
                console.error("Error creating table:", err);
                return res.status(500).send("Error creating table");
            }
            console.log("Table created successfully");
            res.send("Table created successfully");
        });
    });
});

// Fetch all employees
app.get("/api/v1/employs", (req, res) => {
    let sql = "SELECT * FROM Emp";
    db.query(sql, (err, result) => {
        if (err) throw err;
        res.status(200).json({
            result,
            message: "Successful"
        });
    });
});

// Register employee
app.post("/api/v1/register", async (req, res) => {
    console.log('Request body:', req.body);

    const { name, employId, email, password, phone, dept, empDate, role } = req.body;

    // Phone number validation
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(phone)) {
        return res.status(401).json({
            message: "Invalid phone number format"
        });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(401).json({
            message: "Invalid email format"
        });
    }

    if (employId.length > 8) {
        return res.status(400).json({
            message: "EmployId must be 1 to 10 characters"
        });
    }

    if (password.length < 8) {
        return res.status(400).json({
            message: "Password must be at least 8 characters"
        });
    }

    const currentDate = new Date();
    const providedDate = new Date(empDate);
    if (providedDate > currentDate) {
        return res.status(400).json({
            message: "Date cannot be in the future"
        });
    }

    try {
        // Check if email already exists
        const check = "SELECT * FROM Emp WHERE email = ?";
        db.query(check, [email], (err, result) => {
            if (err) {
                console.error('Database query error:', err);
                return res.status(500).json({
                    message: "Error checking email",
                    error: err
                });
            }

            if (result.length > 0) {
                return res.status(400).json({
                    message: "Email already available"
                });
            }

            // Hash the password
            bcrypt.hash(password, 10, (err, hashedPassword) => {
                if (err) {
                    console.error('Error hashing password:', err);
                    return res.status(500).json({
                        message: "Error hashing password",
                        error: err
                    });
                }

                const sql = "INSERT INTO Emp (name, employId, email, password, phone, dept, empDate, role) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
                db.query(sql, [name, employId, email, hashedPassword, phone, dept, empDate, role], (err, result) => {
                    if (err) {
                        console.error('Database query error:', err);
                        return res.status(500).json({
                            message: "Error creating employee",
                            error: err
                        });
                    }
                    console.log('Database insertion result:', result);
                    return res.status(201).json({
                        message: "Employee created successfully",
                        EMP_id: result.insertId
                    });
                });
            });
        });
    } catch (err) {
        console.error('Network error register:', err);
        return res.status(400).json({
            message: "Network error register",
            error: err
        });
    }
});

// Login Route
app.post("/api/v1/login", async (req, res) => {
    const { email, password } = req.body;
    try {
        const sql = "SELECT * FROM Emp WHERE email = ?";
        db.query(sql, [email], (err, rows) => {
            if (err) {
                console.error("Error fetching user:", err);
                return res.status(500).json({ message: "Server error" });
            }
            if (rows.length === 0) {
                return res.status(401).json({ message: "User not available" });
            }

            const user = rows[0];
            bcrypt.compare(password, user.password, (err, isMatch) => {
                if (err) {
                    return res.status(500).json({ message: "Server error" });
                }
                if (!isMatch) {
                    return res.status(401).json({ message: "Invalid credentials" });
                }

                const token = jwt.sign({ id: user.EMP_id }, "RAMKHELLO", { expiresIn: '3h' });
                return res.status(200).json({ token, message: "Success" });
            });
        });
    } catch (error) {
        console.error('Server error:', error);
        return res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
});

// Middleware for role verification
const verifyRole = (requiredRole) => {
    return async (req, res, next) => {
        const token = req.cookies.token;

        if (!token) {
            return res.status(403).json({ message: 'Token not provided' });
        }

        try {
            const decoded = jwt.verify(token, "RAMKHELLO");
            req.user = decoded;

            const sql = "SELECT role FROM Emp WHERE EMP_id = ?";
            db.query(sql, [req.user.id], (err, rows) => {
                if (err || rows.length === 0) {
                    return res.status(403).json({ message: "Unauthorized access" });
                }

                const userRole = rows[0].role;
                if (userRole !== requiredRole) {
                    return res.status(403).json({ message: "Permission denied" });
                }

                next(); // Proceed to the next middleware or route handler
            });
        } catch (err) {
            return res.status(403).json({ message: "Invalid token" });
        }
    };
};

//currently added
app.get("/api/v1/employees/:id", (req, res) => {
    const sql = "SELECT * FROM Emp WHERE employId = ?";
    db.query(sql, [req.params.id], (err, result) => {
        if (err) {
            console.error('Database query error:', err);
            return res.status(500).json({ message: "Error retrieving employee", error: err });
        }
        if (result.length === 0) {
            return res.status(404).json({ message: "Employee not found" });
        }
        return res.status(200).json(result[0]);
    });
});

// Update an employee
app.put("/api/v1/employees/:id", (req, res) => {
    const { name, email, phone, dept, empDate, role } = req.body;
    const sql = "UPDATE Emp SET name = ?, email = ?, phone = ?, dept = ?, empDate = ?, role = ? WHERE employId = ?";
    db.query(sql, [name, email, phone, dept, empDate, role, req.params.id], (err, result) => {
        if (err) {
            console.error('Database query error:', err);
            return res.status(500).json({ message: "Error updating employee", error: err });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Employee not found" });
        }
        return res.status(200).json({ message: "Employee updated successfully" });
    });
});

// Delete an employee
app.delete("/api/v1/employees/:id", (req, res) => {
    const sql = "DELETE FROM Emp WHERE employId = ?";
    db.query(sql, [req.params.id], (err, result) => {
        if (err) {
            console.error('Database query error:', err);
            return res.status(500).json({ message: "Error deleting employee", error: err });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Employee not found" });
        }
        return res.status(200).json({ message: "Employee deleted successfully" });
    });
}); 


// Start the server
app.listen(5000, () => {
    console.log("Server is running on port 6000");
});
