const Joi = require("joi");

const registerSchema = Joi.object({
    name: Joi.string().min(2).max(50).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    phoneNumber: Joi.string().allow("").optional(),
    telegramUsername: Joi.string().allow("").optional()
});

const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
});

const itemSchema = Joi.object({
    type: Joi.string().valid("lost", "found").required(),
    category: Joi.string().required(),
    title: Joi.string().min(3).max(100).required(),
    description: Joi.string().required(),
    date: Joi.date().iso().required(),
    locationContext: Joi.string().required(),
    specificLocation: Joi.string().allow("").optional()
});

const validateRequest = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.body, { abortEarly: false });
        if (error) {
            const errorMessage = error.details.map((detail) => detail.message).join(", ");
            return res.status(400).json({ message: errorMessage });
        }
        next();
    };
};

module.exports = {
    registerSchema,
    loginSchema,
    itemSchema,
    validateRequest
};
