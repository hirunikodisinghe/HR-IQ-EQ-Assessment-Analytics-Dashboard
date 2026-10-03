const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { sql, poolPromise } = require("../config/db");

// SIGN UP
exports.signup = async (req, res) => {
  try {
    const { fullName, email, password, role } = req.body;

    if (!fullName || !email || !password || !role) {
      return res.status(400).json({
        message: "Full name, email, role, and password are required",
      });
    }

    const pool = await poolPromise;

    const existingUser = await pool
      .request()
      .input("Email", sql.NVarChar, email)
      .query(`
        SELECT UserID
        FROM CommonData.dbo.HRDeptUsers
        WHERE Email = @Email
      `);

    if (existingUser.recordset.length > 0) {
      return res.status(400).json({
        message: "Email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await pool
      .request()
      .input("FullName", sql.NVarChar, fullName)
      .input("Email", sql.NVarChar, email)
      .input("PasswordHash", sql.NVarChar, hashedPassword)
      .input("Role", sql.NVarChar, role)
      .input("IsActive", sql.Bit, 1)
      .query(`
        INSERT INTO CommonData.dbo.HRDeptUsers
        (FullName, Email, PasswordHash, Role, IsActive)
        VALUES
        (@FullName, @Email, @PasswordHash, @Role, @IsActive)
      `);

    res.status(201).json({
      message: "User registered successfully",
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({
      message: "Server error",
    });
  }
};

// LOGIN
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const pool = await poolPromise;

    const result = await pool
      .request()
      .input("Email", sql.NVarChar, email)
      .query(`
        SELECT TOP 1 *
        FROM CommonData.dbo.HRDeptUsers
        WHERE Email = @Email AND IsActive = 1
      `);

    if (result.recordset.length === 0) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const user = result.recordset[0];

    let isMatch = false;

    if (user.PasswordHash === password) {
      isMatch = true;
    } else {
      isMatch = await bcrypt.compare(password, user.PasswordHash);
    }

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign(
      {
        id: user.UserID,
        email: user.Email,
        role: user.Role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.UserID,
        fullName: user.FullName,
        email: user.Email,
        role: user.Role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      message: "Server error",
    });
  }
};