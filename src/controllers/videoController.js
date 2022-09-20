const ytdl = require("ytdl-core");
const { rmEmoji, rmEspecialsCharacters } = require("../utils.js");
//const MemoryStream = require('memorystream')

//const ms = new MemoryStream(null,);

const downloadVideo = async (req, res) => {
  const { url, itag } = req.query;

  const info = await ytdl.getInfo(url);

  let title = rmEspecialsCharacters(rmEmoji(info.videoDetails.title));

  videoInfo = info.formats.filter((format) => format.itag === Number(itag));

  const download = ytdl(url, {
    filter: (format) => format.itag === Number(itag),
    format: "mp4",
  });

  let contentLenght = 0;
  let video = [];

  download.on("data", (chunk) => {
    contentLenght += chunk.length;
    video.push(chunk);
  });

  download.on("end", function () {
    let buffer = Buffer.concat(video);
    console.log(title);
    res.setHeader("Content-Length", contentLenght);
    res.setHeader("Content-Type", videoInfo[0].mimeType);
    res.send(buffer);
  });
  // .on('end', () =>{
  //   res.setHeader("Content-Length", contentLenght)
  //   res.setHeader("Content-Type", videoInfo[0].mimeType)
  //   console.log("finish")
  //   stream.pipe(res)
  // })

  // stream.on('data', (chunk) =>{
  //   console.log(chunk)
  //   contentLenght += chunk.length
  // })

  // stream.on('end', () =>{
  //   console.log("finish")
  // })
  // // stream.on('end', () =>{
  // //   res.setHeader("Content-Length", contentLenght)
  // //   res.setHeader("Content-Type", videoInfo[0].mimeType)
  // //   stream.pipe(res)
  // // })

  // ms.on('data', (chunk) =>{
  //   console.log(chunk)
  //   contentLenght += chunk.length
  //   videoStream += chunk
  // })

  // //"Content-Disposition": `attachment;  filename="${title}.mp4"`,
  // ms.on('end', () =>{
  //   res.setHeader("Content-Length", contentLenght)
  //   res.setHeader("Content-Type", videoInfo[0].mimeType)
  //   fs.createReadStream()
  // })

  // // res.writeHead(200, {
  // //       //"Content-Length": size,
  // //       "Content-Type": videoInfo[0].mimeType,
  // //       //"Content-Disposition": `attachment;  filename="${title}.mp4"`,
  // //     });

  // // download.pipe(createWriteStream(`${title}.mp4`))
};

const getVideo = async (req, res) => {
  const { url } = req.body;
  let formats = {};

  try {
    if (!ytdl.validateURL(url)) {
      return;
    }

    const { formats: videoFormats, videoDetails } = await ytdl.getInfo(url);
    const formatsMp4 = await ytdl.filterFormats(videoFormats, "videoandaudio");

    formatsMp4.map(
      ({ quality, qualityLabel, container, itag, contentLength }) => {
        formats[quality] = {
          quality: qualityLabel,
          format: container,
          itag: itag,
          contentLenght: contentLength || "no found",
        };
      }
    );

    formats = Object.keys(formats).map((format) => formats[format]);

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
};

module.exports = {
  downloadVideo,
  getVideo,
};
