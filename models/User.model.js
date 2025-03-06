const { Schema, model } = require("mongoose");

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required."],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required."],
    },
    name: {
      type: String,
      required: [true, "Name is required."],
    },
    createdAt: {
      type: Date,
      default: Date.now,
      immutable: true
    },
    // Referencias a las publicaciones del usuario
    publicaciones: [{
      type: Schema.Types.ObjectId,
      ref: "Publicacion"
    }]
  },
  {
    timestamps: false,
  }
);

const User = model("User", userSchema);

module.exports = User;