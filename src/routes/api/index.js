const router = require('express').Router();

router.use('/appointment', require('./appointment'));
router.use('/availability', require('./availability'));

module.exports = router;
