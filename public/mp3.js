const baseURL = window.location.origin;
var socket = io(baseURL);
const thisSessionId = Math.random().toString(36).substr(2, 9);
const $ = (selector) => document.querySelector(selector);

const inputURL = $(".URL");
const content = $(".details");
let progressBar = "";

const templateForm = ({duration, url, title, qualities}) => {
  let str = ""
  str += qualities.map((quality,i) =>`
  <form class="audioContainer" id ="audioContainer${i}">
    <p class="audioInfo">
    ${title}<br/>
    <strong>Duracion:</strong> ${duration} minutos<br/>
    <strong>Peso:</strong> ${( quality.contentLenght / 1024 ** 2 )?.toFixed(2)} MB
    </p>
    <input class="title" type="hidden" value="${title}"/>
    <input name="itag" type="hidden" value="${quality.itag}"/>
    <input name="url" type="hidden" value="${url}"/>
    <button id="download${i}">
    <i class="fa fa-download"></i>
    </button>
    </form>`)

    return str.replace(",","")

}
    

function download(blob) {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.style.display = "none";
  a.href = url;
  a.download = $(".title").value + ".mp3";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}

async function downloadAudio(e) {
e.preventDefault()
console.log(e.target.url,e.target.itag)
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
    `${baseURL}/download-audio?url=${e.target.url.value}&&itag=${e.target.itag.value}`
  );
  const audio = await res.blob();
  await download(audio);
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
    const res = await fetch(`${baseURL}/audio`, {
      headers: { "Content-Type": "application/json" },
      method: "POST",
      body: JSON.stringify({ url }),
    });

    const data = await res.json();

    if (data.status === 500)
      content.innerHTML = `<h3 style="color:#ffffff">Error del servidor</h3>`;
    if (data.status === 404)
      content.innerHTML = `<h3 style="color:#ffffff">Error: Video no encontrado o borrado</h3>`;
    if (data.status === 200) content.innerHTML = templateForm(data)
    data.qualities.forEach((q, i) => {
      $(`#audioContainer${i}`).addEventListener('submit', downloadAudio)
    });
  } catch (error) {
    content.innerHTML = `<h3 style="color:#ffffff">Audio no encontrado</h3>`;
  }
});

socket.emit("connectInit", thisSessionId);

socket.on("downloadProgress", (progress) => {
  $('.progress').value = progress?.toFixed(2)
  $('.progress__value').innerHTML = `${progress?.toFixed(2)} %` 

});
