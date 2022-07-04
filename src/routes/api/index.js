const router = require('express').Router();

router.use('/appointment', require('./appointment'));
// router.use('/whatever...);

module.exports = router;
