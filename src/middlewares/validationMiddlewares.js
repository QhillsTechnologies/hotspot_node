const Joi = require("joi"); // Import Joi for validation
const bcrypt = require("bcrypt");

const validateResetPassword = (req, res, next) => {
  const schema = Joi.object({
    username: Joi.string().required(),
    newpassword: Joi.string().min(6).required(),
    confirmpassword: Joi.string()
      .valid(Joi.ref("newpassword"))
      .error(new Error("Passwords don't match"))
      .required(),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(500).json(error.message);
  }
  next();
};

const validateAddProduct = (req, res, next) => {
  const schema = Joi.object({
    price: Joi.number().required(),
    name: Joi.string().required(),
    category: Joi.string().required(),
    bar_code: Joi.string().required().allow(null),
  });

  const { error } = schema.validate(req.body);

  if (error) {
    return res.status(500).json(error.message);
  }
  next();
};

const validateSignup = (req, res, next) => {
  const schema = Joi.object({
    username: Joi.string().min(4).required(),
    password: Joi.string().min(6).required(),
    confirmPassword: Joi.string()
      .valid(Joi.ref("password"))
      .error(new Error("Passwords don't match"))
      .required(),
    role: Joi.string().required(),
  });

  const { error } = schema.validate(req.body);

  if (error) {
    return res.status(500).json(error.message);
  }
  next();
};

const validateLogin = (req, res, next) => {
  const schema = Joi.object({
    username: Joi.string().required(),
    password: Joi.string().required(),
  });

  const { error } = schema.validate(req.body);

  if (error) {
    return res.status(500).json(error.message);
  }
  next();
};

module.exports = {
  validateResetPassword,
  validateAddProduct,
  validateSignup,
  validateLogin,
};
