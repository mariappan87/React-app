var express = require('express');
var router = express.Router();
const auth = require('../../middleware/auth');
const Profile = require('../../models/Profile');
const User = require('../../models/User');
const { check, validationResult } = require('express-validator');
//@route GET api/profile/me
//@desc Get current user's profile
//@access Private
router.get('/me', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({
            user: req.user.id
        }).populate('user', ['name', 'avatar']);
        if (!profile) {
            return res.status(400).json({
                msg: 'There is no profile found for this user'
            });
        }
        return res.json(profile);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('server error');
    }
});
//@route POST api/profile/me
//@desc Create or update user's profile
//@access Private
router.post(
    '/',
    [
        auth,
        check('status', 'Status is required')
            .not()
            .isEmpty(),
        check('skills', 'Skills is required')
            .not()
            .isEmpty()
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const {
            company,
            website,
            location,
            bio,
            status,
            githubusername,
            skills,
            youtube,
            facebook,
            twitter,
            instagram,
            linkedin
        } = req.body;
        const profileFields = {};
        profileFields.user = req.user.id;
        if (company) profileFields.company = company;
        if (website) profileFields.website = website;
        if (location) profileFields.location = location;
        if (bio) profileFields.bio = bio;
        if (status) profileFields.status = status;
        if (githubusername) profileFields.githubusername = githubusername;
        if (skills) {
            profileFields.skills = skills.split(',').map(skill => skill.trim());
        }
        profileFields.social = {};
        if (youtube) profileFields.social.youtube = youtube;
        if (facebook) profileFields.social.facebook = facebook;
        if (twitter) profileFields.social.twitter = twitter;
        if (instagram) profileFields.social.instagram = instagram;
        if (linkedin) profileFields.social.linkedin = linkedin;

        try {
            let profile = await Profile.findOne({ user: req.user.id });
            if (profile) {
                //Update
                profile = await Profile.findOneAndUpdate(
                    { user: req.user.id },
                    { $set: profileFields },
                    { new: true }
                );
                return res.json(profile);
            }

            //Create
            profile = new Profile(profileFields);
            await profile.save();
            res.json(profile);
        } catch (err) {
            console.error(err.message);
            res.status(500).send('server error');
        }
    }
);
//@route GET api/profile/
//@desc Get all profiles
//@access Public
router.get('/', async (req, res) => {
    try {
        const profiles = await Profile.find().populate('user', [
            'name',
            'avatar'
        ]);
        res.json(profiles);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('server error');
    }
});
//@route GET api/profile/user/:user_id
//@desc Get profile by user id
//@access Public
router.get('/user/:user_id', async (req, res) => {
    try {
        const profile = await Profile.findOne({
            user: req.params.user_id
        }).populate('user', ['name', 'avatar']);
        if (!profile) {
            req.status(500).json({ msg: 'No profiles found' });
        }
        res.json(profile);
    } catch (error) {
        console.error(error.message);
        // Invalid object Id scenario
        if (error.kind == 'ObjectId') {
            req.status(500).json({ msg: 'No profiles found' });
        }
        res.status(500).send('server error');
    }
});

//@route DELETE api/profile/
//@desc Delete profile, user & posts
//@access Private
router.delete('/', auth, async (req, res) => {
    try {
        //Remove profile
        const profile = await Profile.findOneAndRemove({ user: req.user.id });

        //Remove User
        const user = await User.findOneAndRemove({ _id: req.user.id });

        res.json({ msg: 'user removed' });
    } catch (error) {
        console.error(error.message);
        res.status(500).send('server error');
    }
});

//@route PUT api/profile/experience
//@desc Add profile experience
//@access Private
router.put(
    '/experience',
    [
        auth,
        check('title', 'Title is required')
            .not()
            .isEmpty(),
        check('company', 'Company is required')
            .not()
            .isEmpty(),
        check('from', 'from date is required')
            .not()
            .isEmpty()
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const {
            company,
            from,
            title,
            location,
            to,
            current,
            description
        } = req.body;
        const newExp = {
            title,
            company,
            from,
            location,
            to,
            current,
            description
        };
        try {
            const profile = await Profile.findOne({ user: req.user.id });

            //Add experiences
            profile.experience.unshift(newExp);
            await profile.save();
            return res.json(profile);
        } catch (err) {
            console.error(err.message);
            res.status(500).send('server error');
        }
    }
);
//@route DELETE api/profile/experience/:exp_id
//@desc delete profile experience
//@access Private

router.delete('/experience/:exp_id', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.user.id });

        //Add experiences
        const index = profile.experience
            .map(item => item.id)
            .indexOf(req.params.exp_id);
        profile.experience.splice(index, 1);
        await profile.save();
        return res.json(profile);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('server error');
    }
});
module.exports = router;
