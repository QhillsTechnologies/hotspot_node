const express = require("express");
const router = express.Router();
const users = require("../models").user;
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { authToken, authRole } = require("../middlewares/authMiddlewares");
const Joi = require("joi");
const {
  validateResetPassword,
  validateSignup,
} = require("../middlewares/validationMiddlewares");

const jwtSecretKey = process.env.JWT_SECRET_KEY;

router.post("/registerAdmin", async (req, res) => {
    try {
      const { role, password, username } = req.body;
      const hashedPassword = bcrypt.hashSync(password, 10);

      const createdUser = await users.create({
         role,
         username,
         password: hashedPassword
      });

      if(!createdUser) {
          return res.status(500).send("Failed to create the user.");
      }

      return res.status(201).send("User created successfully");
   } catch(error) {
      console.error(error);
      return res.status(500).send(error);
   }
});

router.post(
  "/registerByAdmin",
  authRole("Admin"),
  validateSignup,
  authToken,
  async (req, res) => {
    try {
      const { role, password, username } = req.body;

      const hashedPassword = bcrypt.hashSync(password, 10);

      const existingUser = await users.findOne({
        where: {
          username,
        },
      });

      if (existingUser) {
        return res.status(500).json("User with same username exists");
      }

      const createdUser = await users.create({
        role,
        username,
        password: hashedPassword,
      });

      if (!createdUser) {
        return res.status(500).json("Failed to create the user.");
      }

      return res.status(201).json({
        createdUser,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json(error);
    }
  }
);

router.post("/login", async (req, res) => {
  try {
    const { password, username } = req.body;

    const createdUser = await users.findOne({
      where: {
        username,
      },
    });

    if (!createdUser) {
      return res.status(500).json("User does not exist");
    }

    if (!bcrypt.compareSync(password, createdUser.password)) {
      return res.status(500).json("Incorrect Password or username");
    }

    const payload = {
      userId: createdUser.id,
      username: createdUser.username,
      role: createdUser.role,
    };

    const token = jwt.sign(payload, jwtSecretKey, { expiresIn: "8h" });

    return res.status(201).json({
      token,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send(error);
  }
});

router.post(
  "/reset-password",
  authToken,
  validateResetPassword,
  async (req, res) => {
    try {
      const { username, newpassword } = req.body;

      const existingUser = await users.findOne({
        where: {
          username,
        },
      });

      if (!existingUser) {
        return res.status(500).json("User does not exist");
      }

      if (username != req.user.username && existingUser.role === "Admin") {
        return res
          .status(500)
          .json("You do not the permission to change other admin credentials");
      }

      const hashedPassword = bcrypt.hashSync(newpassword, 10);

      await users.update(
        {
          password: hashedPassword,
        },
        {
          where: {
            username,
          },
        }
      );

      return res.status(201).json({ message: "Password reset successful" });
    } catch (error) {
      console.error(error);
      res.status(500).json(error);
    }
  }
);

module.exports = router;
