const router = require('express').Router();
const {getVideo, downloadVideo} = require("../../controllers/videoController")

router.post('/video', getVideo)
router.get('/download', downloadVideo)

module.exports = router