const Joi = require('joi')

module.exports = Joi.object().keys({
 from: Joi.string().trim().required(), 
 to: Joi.string().trim().required(),
 conversationId:Joi.string().trim().required(),
 msg:Joi.string().trim().required()

})