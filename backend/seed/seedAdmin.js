import dotenv from "dotenv";
import mongoose from "mongoose";
import Admin from "../models/Admin.js";
import { connectDB } from "../config/db.js";

dotenv.config();

const seedAdmin = async () => {
  try {
    await connectDB();

    const name = process.env.ADMIN_NAME || "Bung Jack Admin";
    const email = process.env.ADMIN_EMAIL || "admin@bungjackofficial.com";
    const password = process.env.ADMIN_PASSWORD || "StrongPassword123!@#";

    let admin = await Admin.findOne({ email }).select("+password");

    if (admin) {
      admin.name = name;
      admin.password = password;
      admin.role = "superadmin";
      await admin.save();
    } else {
      admin = await Admin.create({
        name,
        email,
        password,
        role: "superadmin",
      });
    }

    console.log("Admin seeded successfully.");
    console.log("Admin ID:", admin._id.toString());
    console.log("Email:", email);
    console.log("Password: [hidden]");

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("Admin seed failed:", error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

seedAdmin();
