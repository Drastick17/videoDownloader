const express = require('express')
const ytdl = require('ytdl-core')
const path = require('path')
const cors = require('cors')
const fs = require('fs')

const PORT = process.env.PORT || 3005
const app = express()
app.use(cors())
app.use(express.static("public"));

const PATH = (file) => path.join(`${__dirname}/${file}`)
rmEmoji = (str) => str.replace(/\p{EPres}|\p{ExtPict}/gu,'');

app.get('/', (req, res) =>{
  res.sendFile(PATH('index.html'))
})
//Download 
app.get('/video', (req, res) => {
  const {url, quality} = req.query
  let title = "";
  ytdl.getInfo(url).then(res => {
    title = rmEmoji(res.videoDetails.title)
  }).then(() =>{
    res.header("Content-Disposition", `attachment;\  filename="${title}.mp4`)    
    ytdl(url, {format: 'mp4', quality:quality}).pipe(res)
  }) 
});
//Get video INFO
app.post('/video', (req, res) => {
  const {url} = req.query
  let VideoData = {}
  try{
    if(ytdl.validateURL(url)){
      ytdl.getInfo(url).then(info => {
        let formats = {}
        info.formats.map(format => {formats[format.quality] = {
          quality : format.qualityLabel,
          format  : format.container,
          itag : format.itag
        }} )
  
        formats = Object.keys(formats).map(format =>formats[format])
        formats = formats.filter(format => format.format === 'mp4')
        VideoData = {
          iframe   : info.videoDetails.embed.iframeUrl,
          url      : info.videoDetails.video_url,
          title    : info.videoDetails.title,
          duration : (info.videoDetails.lengthSeconds/60).toFixed(2),
          qualities: formats
        }
        res.status(200).send(JSON.stringify(VideoData))})
    }
  }catch(e){
    res.send({error:'Error video no econtrado'})
  }
  
})


app.listen(PORT,() => console.log(`http://localhost:${PORT}`))