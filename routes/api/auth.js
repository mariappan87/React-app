var express = require('express');
var router = express.Router();

//@route GET api/auth
//@desc Test Auth
//@access Public
router.get('/', (req, res) => {
    res.send('Auth Route');
});

module.exports = router;
