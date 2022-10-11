const router = require('express').Router();

router.use('/appointment', require('./appointment'));
router.use('/availability', require('./availability'));
router.use('/doctors', require('./doctors'));
router.use('/offices', require('./offices'));
router.use('/admin', require('./admin'));

module.exports = router;
