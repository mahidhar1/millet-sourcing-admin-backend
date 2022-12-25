const asyncHandler = require("express-async-handler");

const contactUs = asyncHandler(async (req, res) => {
  res.send(`Contact us with message: ${req.body.message}`);
});

module.exports = { contactUs };
