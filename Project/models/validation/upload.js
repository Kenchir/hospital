 
const Joi = require('joi')

module.exports = Joi.object().keys({
 name: Joi.string().trim().required().error(new Error('House name must be given')), 
 description: Joi.string().trim().required().error(new Error('description must be given')), 
 location: Joi.string().trim().required().error(new Error('You must turn on your location')), 
// image: Joi.string().email().lowercase().error(new Error('Images required')),
 internet: Joi.string().trim().required().error(new Error('Internet availabilty not specified')), 
  water: Joi.string().trim().required().error(new Error('Water availabilty not specified')), 
 // room_types: Joi.string().trim().required().error(new Error('Location not set')), 
 room_cost:Joi.number().integer().required().error(new Error(' Room type selected must have rent cost')),

});