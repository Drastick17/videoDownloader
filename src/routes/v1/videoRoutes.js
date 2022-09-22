const router = require('express').Router();
const {getVideo, downloadVideo, downloadAudio, getAudio} = require("../../controllers/videoController")

router.post('/video', getVideo)
router.get('/download', downloadVideo)
router.post('/audio',getAudio)
router.get('/download-audio', downloadAudio)

module.exports = router