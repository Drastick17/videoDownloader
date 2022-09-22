const ytdl = require("ytdl-core");
const ffmpeg = require("fluent-ffmpeg")
const { rmEmoji, rmEspecialsCharacters } = require("../utils.js");

const downloadVideo = async (req, res) => {
  const { url, itag } = req.query;

  const info = await ytdl.getInfo(url);

  let title = rmEspecialsCharacters(rmEmoji(info.videoDetails.title));

  videoInfo = info.formats.filter((format) => format.itag === Number(itag));

  const download = ytdl(url, {
    filter: (format) => format.itag === Number(itag),
    format: "mp4",
  });

  const io = req.app.get("io");
  const sockets = req.app.get("sockets");
  const thisSocketId = sockets[req.app.get("socketSessionId")];
  const socketInstance = io.to(thisSocketId);

  socketInstance.emit("videoInfo", {
    total: Number(videoInfo[0].contentLength),
    downloaded: 0,
  });

  let contentLenght = 0;
  let video = [];
  let total = Number(videoInfo[0].contentLength);
  let progress = 0;

  download.on("data", (chunk) => {
    contentLenght += chunk.length;
    video.push(chunk);
    progress = (contentLenght / total) * 100;
    socketInstance.emit("uploadProgress", progress);
  });

  download.on("end", function () {
    let buffer = Buffer.concat(video);
    console.log(title);
    res.setHeader("Content-Length", contentLenght);
    res.setHeader("Content-Type", videoInfo[0].mimeType);
    res.send(buffer);
  });
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

const getAudio = async (req, res) => {
  const { url } = req.body;
  let formats = {};

  try {
    if (!ytdl.validateURL(url)) {
      return;
    }

    const { formats: videoFormats, videoDetails } = await ytdl.getInfo(url);
    const formatsMp3 = await ytdl.filterFormats(videoFormats, "audioonly");

    formatsMp3.map(({ audioQuality, container, itag, contentLength }) => {
      let qualitySplit = audioQuality.split("_");
      let quality = qualitySplit[qualitySplit.length - 1];

      formats[quality] = {
        audioQuality,
        format: container,
        itag: itag,
        contentLenght: contentLength || "no found",
      };
    });

    formats = Object.keys(formats).map((format) => formats[format]);

    res.json({
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

const downloadAudio = async (req, res) => {
  const { url, itag } = req.query;

  const info = await ytdl.getInfo(url);

  let title = rmEspecialsCharacters(rmEmoji(info.videoDetails.title));

  videoInfo = info.formats.filter((format) => format.itag === Number(itag));

  const download = ytdl(url, {
    filter: (format) => format.itag === Number(itag),
  });

  const io = req.app.get("io");
  const sockets = req.app.get("sockets");
  const thisSocketId = sockets[req.app.get("socketSessionId")];
  const socketInstance = io.to(thisSocketId);

  let total = Number(videoInfo[0].contentLength);

  socketInstance.emit("audioInfo", {
    total,
    downloaded: 0,
  });

  let contentLenght = 0;
  let video = [];
  let progress = 0;

  download.on("data", (chunk) => {
    contentLenght += chunk.length;
    video.push(chunk);
    progress = (contentLenght / total) * 100;
    socketInstance.emit("downloadProgress", progress);
  });

  download.on("end", function () {
    let buffer = Buffer.concat(video);
    console.log(title);
    res.setHeader("Content-Length", contentLenght);
    res.setHeader("Content-Type", 'audio/mpeg');
    res.send(buffer);
  });

};

module.exports = {
  downloadVideo,
  getVideo,
  downloadAudio,
  getAudio,
};


/*app.get('/api/downloadYoutubeVideo', function (req, res) {  
   var videoUrl = req.query.videoUrl;   
   var destDir = req.query.destDir; 

   var videoReadableStream = ytdl(videoUrl, { filter: 'audioonly'});

   ytdl.getInfo(videoUrl, function(err, info){
       var videoName = info.title.replace('|','').toString('ascii');

       var videoWritableStream = fs.createWriteStream(destDir + '\\' + videoName + '.mp3'); 

       var stream = videoReadableStream.pipe(videoWritableStream);

       stream.on('finish', function() {
           res.writeHead(204);
           res.end();
       });              
   });              
}); */