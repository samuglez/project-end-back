const express = require("express");
const router = express.Router();
const User = require("../models/User.model");
const bcrypt = require("bcrypt");
const { isAdmin, isAuthenticated } = require("../middleware/jwt.middleware");
const saltRounds = 10;

router.get("/", (req, res, next) => {
  User.find({})
    .then((users) => {
      console.log("All user retieved ->", users);
      
      res.status(200).json(users);
    })
    .catch((err) => {
      console.log(err,"Error to show users");
      res.status(500).json({ message: "Error to show users" });
    });
});
router.post("/", async (req, res, next) => {
    try {
        // Check if password is provided
        if (!req.body.password) {
          return res.status(400).json({ message: "Password is required" });
        }
        // Hash the password
        const salt = await bcrypt.genSalt(saltRounds);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);
        // Replace plaintext password with hashed one
        const userData = {
          ...req.body,
          password: hashedPassword
        };
        const createdUser = await User.create(userData);
        console.log("Created new user ->", createdUser);
        res.status(201).json(createdUser);
      } catch (err) {
        console.error("Error creating user:", err);
        res.status(500).json({ error: "Failed to create new user: " + err.message });
      }
});
router.delete("/:userId", isAuthenticated,isAdmin, (req, res, next) => {
  const {userId} = req.params
  User.findByIdAndDelete(userId)
  .then((deletedUser) => {
    if(!deletedUser){
      return res.status(404).json({ message: "User not found" });
    }
    console.log("User deleted");
    res.status(204).send();
  })
  .catch((err) => {
    console.log(err,"Error to delete user");
    res.status(500).json({ message: "Error to delete user" });
  })

});
router.put("/:userId", isAuthenticated, isAdmin, (req, res, next) => {
  const {userId} = req.params
  User.findByIdAndUpdate(userId, req.body, {new: true})
  .then((updatedUser) => {
    if(!updatedUser){
      return res.status(404).json({ message: "User not found" });
    }
    console.log("User updated", updatedUser);
    res.status(204).json(updatedUser);
  })
  .catch((err) => {
    console.log(err,"Error to update user");
    res.status(500).json({ message: "Error to update user" });
  })
});

module.exports = router;
