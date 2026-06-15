import mongoose from "mongoose";
import bcrypt from "bcrypt"; // ← move it here

const userSchema = new mongoose.Schema(
  {
    username: { type: String },
    email: { type: String, unique: true },
    password: { type: String, select: false },
  },
  { timestamps: true },
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12); // ← no require()
});

// Instance method to verify password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password); // ← no require()
};

export default mongoose.model("User", userSchema);
