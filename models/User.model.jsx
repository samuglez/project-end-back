
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  profilePicture: { type: String, default: "" },
  bio: { type: String, maxlength: 300 },
  platforms: {
    playstation: { type: String, default: "" },
    xbox: { type: String, default: "" },
    steam: { type: String, default: "" }
  },
  trophies: [{ type: mongoose.Schema.Types.ObjectId, ref: "Trophy" }],
  createdAt: { type: Date, default: Date.now }
});

// Middleware para hashear contraseña antes de guardar
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Método para comparar contraseñas
userSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
