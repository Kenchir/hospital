
const Joi = require('joi')

module.exports = Joi.object().keys({


    fname: Joi.string().trim().required().error(new Error('Invalid first name ')),
    lname: Joi.string().trim().required().error(new Error('Invalid last name')),
    email: Joi.string().email().lowercase().error(new Error('Invalid email')),

    uname: Joi.string().trim().required().lowercase().options({ convert: false }).error(new Error('Your username must be in lowercase !')),
    // birthyear: Joi.number().integer().min(1930).max(2013).error(new Error('Invalid year of birth')),
    password: Joi.string().trim().required().min(6).max(12).error(new Error('Password must be atleast 8 characters and max of 12')),
    // role: Joi.string().required().trim().error(new Error('role not selected'))
    phone: Joi.string().regex(/^[0-9]+$/).required().min(8).max(15).error(new Error('Invalid phone number entered ')),
});