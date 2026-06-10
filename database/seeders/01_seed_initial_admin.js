import bcrypt from "bcrypt";
import pool from "../../config/db.js";

async function seedAdmin() {
  try {
    const email = "admin@wayfinder.com";
    const plainTextPassword = "Admin@123";

    // Check if admin already exists
    const [existing] = await pool.query("SELECT * FROM admins WHERE email = ?", [email]);
    if (existing.length > 0) {
      console.log(`Admin with email ${email} already exists. Skipping seeder.`);
      process.exit(0);
    }

    // Hash password with bcrypt (12 salt rounds)
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(plainTextPassword, saltRounds);

    // Insert admin
    await pool.query(
      "INSERT INTO admins (email, password_hash, full_name) VALUES (?, ?, ?)",
      [email, passwordHash, "Super Admin"]
    );

    console.log("Successfully seeded initial administrator account.");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding initial admin:", error);
    process.exit(1);
  }
}

seedAdmin();
