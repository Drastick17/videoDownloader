const baseURL = window.location.origin;
var socket = io(baseURL);
const thisSessionId = Math.random().toString(36).substr(2, 9);
const $ = (selector) => document.querySelector(selector);

const inputURL = $(".URL");
const content = $(".details");
let progressBar = "";

const templateForm = ({ iframe, url, title, duration, qualities }) => `
<form class="form" id="download">
      <div class="video">
        <input type="text" value="${url}" name="url" class="hidden"/>
        <iframe src="${iframe}" ></iframe>
      </div>
      <div>
        <p class="title">${title}</p>
        <p class="duration"><i class="fas fa-clock"></i> ${duration}minutos</p>
        <div class="options">
          <select class="qualities" name="qualities">
            ${qualities.map(
              ({ quality, format, itag, contentLenght }) =>
                `<option value="${itag}">${quality}/ ${(
                  contentLenght /
                  1024 ** 2
                )?.toFixed(2)}  ${format}</option>`
            )}
          </select>
          <button type="submit" class="download">
          Descargar 
          </button>
        </div>
      </div>
      </form>
`;

function download(blob) {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.style.display = "none";
  a.href = url;
  a.download = $(".title").innerHTML + ".mp4";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}

async function downloadVideo(e) {
  e.preventDefault();
  const { url, qualities } = e.target;
  //window.location.replace(`${baseURL}/download?url=${url.value}&&itag=${qualities.value}`)
  content.innerHTML += `  
  <div class="modal">
    <label class="relative">
    <label class="progress__value">Descargando...</label>
    <progress class="progress" value="0" max="100"></progress>
    </label>
  </div>
  `;

  const res = await fetch(
    `${baseURL}/download?url=${url.value}&&itag=${qualities.value}`
  );
  const video = await res.blob();
  await download(video);
  window.location.reload()
}

inputURL.addEventListener("keyup", (e) => {
  if (e.keyCode == 13) {
    $(".send").click();
  }
});

$(".send").addEventListener("click", async function () {
  const url = inputURL.value;
  content.innerHTML = "<div class='loader'></div>";
  try {
    const res = await fetch(`${baseURL}/video`, {
      headers: { "Content-Type": "application/json" },
      method: "POST",
      body: JSON.stringify({ url }),
    });

    const data = await res.json();

    if (data.status === 500)
      content.innerHTML = `<h3 style="color:#ffffff">Error del servidor</h3>`;
    if (data.status === 404)
      content.innerHTML = `<h3 style="color:#ffffff">Error: Video no encontrado o borrado</h3>`;
    if (data.status === 200) content.innerHTML = templateForm(data);
    $("#download").addEventListener("submit", downloadVideo);
  } catch (error) {
    content.innerHTML = `<h3 style="color:#ffffff">Video no encontrado</h3>`;
  }
});

socket.emit("connectInit", thisSessionId);

socket.on("uploadProgress", (progress) => {
  $('.progress').value = progress?.toFixed(2)
  $('.progress__value').innerHTML = `${progress?.toFixed(2)} %` 

});
