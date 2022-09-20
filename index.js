require("dotenv").config();

const ytdl = require("ytdl-core");
const path = require("path");
const express = require("express");
const cors = require("cors");
const {
  createWriteStream,
  statSync,
  createReadStream,
  unlinkSync,
} = require("fs");

const PORT = process.env.PORT || 3002;
const app = express();
app.use(cors());

app.use(express.static("../public"));
app.use(express.json());

const PATH = (file) => path.join(`${__dirname}/${file}`);
rmEmoji = (str) => str.replace(/\p{EPres}|\p{ExtPict}/gu, "");
rmEspecialsC = (str) => str.replace(/[^a-zA-Z ]/g, "");

app.get("/", (req, res) => {
  res.sendFile(PATH("index.html"));
});

//Download
app.get("/download", async (req, res) => {
  const { url, itag } = req.query;

  const info = await ytdl.getInfo(url);

  let title = rmEspecialsC(rmEmoji(info.videoDetails.title));

  videoInfo = info.formats.filter((format) => format.itag === Number(itag));

  const download = ytdl(url, {
    filter: (format) => format.itag === Number(itag),
  });

  download
    .pipe(createWriteStream(path.resolve(__dirname, `./videos/${title}.mp4`)))
 
    // .on("finish", () => {
    //   const { size } = statSync(
    //     path.resolve(__dirname, `./videos/${title}.mp4`)
    //   );
    //   res.writeHead(200, {
    //     "Content-Length": size,
    //     "Content-Type": videoInfo[0].mimeType,
    //     //"Content-Disposition": `attachment;  filename="${title}.mp4"`,
    //   });
    //   createReadStream(path.resolve(__dirname, `./videos/${title}.mp4`))
    //     .pipe(res)
    //     .on("finish", () => {
    //       unlinkSync(path.resolve(__dirname, `./videos/${title}.mp4`));
    //       res.end();
    //     });
    // });

  // ytdl.getInfo(url,{format: 'mp4'}).then(info =>{
  //   let title = rmEspecialsC(rmEmoji(info.videoDetails.title))
  //   ytdl(url,{ quality })
  //   .on('response',function(res){
  //     let ProgressBar = require('progress');
  //     bar = new ProgressBar('downloading [:bar] :percent :etas', {
  //       complete : String.fromCharCode(0x2588),
  //       total    : parseInt(res.headers['content-length'], 10)
  //     })
  //   })

  //   .on( 'data', function(data){
  //     bar.tick(data.length);
  //   })
  //   .on( 'finish', function(){ console.log('Download finished...'); } )
  //   .pipe(createWriteStream(`${title}.mp4`));

  //   // ytdl(url,{ quality }).pipe(createWriteStream(`./videos/${title}.mp4`))
  //   // res.header("Content-Disposition", `attachment;  filename="${title}.mp4"`)
  //   // ytdl(url,{ quality }).pipe()

  //   // videoReadable.on('end', () =>{
  //   //   videoReadable.pipe(fs.createReadStream(title))
  //   //   res.header("Content-Disposition", `attachment;  filename="${title}.mp4"`)
  //   //   res.header("Content-Length",title.length)
  //   // })
  // })
  // ytdl.getInfo(url,{format: 'mp4', quality:quality}, (err,info)=>{
  //   let video = ytdl.downloadFromInfo(info, {
  //     quality: quality
  //    })
  //    const videoStream = fs.createReadStream(video)
  //    videoStream.on(;da)
  //    videoStream.on('end', () =>{
  //     videoStream.pipe
  //    })

  // })
  // ytdl.getInfo(url).then(res => {
  //   title = rmEspecialsC(rmEmoji(res.videoDetails.title))
  // }).then(() =>{
  //   console.log(res)
  //   res.header("Content-Disposition", `attachment;  filename="${title}.mp4"`)
  //   ytdl.
  //   // const videoStream = ytdln(url, {format: 'mp4', quality:quality}).pipe(fs.createReadStream(title))

  //   console.log(videoStream)
  // })
});

app.post("/video", async (req, res) => {
  const { url } = req.body;
  let formats = {};

  try {
    if (!ytdl.validateURL(url)) {
      res.json({ status: 404, message: "Error video no encontrado" });
      res.end();
    }

    const { formats: videoFormats, videoDetails } = await ytdl.getInfo(url);

    videoFormats.map(
      ({ quality, qualityLabel, container, itag, contentLength }) => {
        formats[quality] = {
          quality: qualityLabel,
          format: container,
          itag: itag,
          contentLenght: contentLength || "no found",
        };
      }
    );

    formats = Object.keys(formats)
      .map((format) => formats[format])
      .filter((format) => format.format === "mp4");

    res.json({
      iframe: videoDetails.embed.iframeUrl,
      url: videoDetails.video_url,
      title: videoDetails.title,
      duration: (videoDetails.lengthSeconds / 60).toFixed(2),
      qualities: formats,
      status: 200,
    });
  } catch (e) {
    console.error(e);
    res.json({ status: 500, message: "Error en el servidor" });
  }
});

app.listen(PORT, () => console.log(`http://localhost:${PORT}`));
