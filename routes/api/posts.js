var express = require('express');
var router = express.Router();

//@route GET api/post
//@desc Test Post
//@access Public
router.get('/', (req, res) => {
    res.send('Post Route');
});

module.exports = router;
