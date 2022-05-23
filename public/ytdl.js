const $ = (selector) => document.querySelector(selector)

const baseURL = window.location.href
const videoQualities = {
  low:"highest",
  high:'lowest'
}

$('.send').addEventListener('click', function(){
  const url = $('.URL').value
  const content = $('.details')
  content.innerHTML = "<div class='loader'></div>"
  fetch(`${baseURL}video?url=${url}`,{
    headers:{'Content-Type':'application/json'},
    method:'POST'
  })
  .then(res => res.json())
  .then(data => {
    const {url, title, iframe, duration} = data
    content.innerHTML =`
    <form action="/video" method="GET" class="form">
      <div class="video">
        <input type="text" value="${url}" name="url" class="hidden"/>
        <iframe src="${iframe}" ></iframe>
      </div>
      <div>
        <p class="title">${title}</p>
        <p class="duration"><i class="fas fa-clock"></i> ${duration} minutos</p>
        <div class="options">
          <select class="qualities" name="quality">
            <option value="${videoQualities.low}" selected>Low</option>
            <option value="${videoQualities.high}">High</option>
          </select>
          <button class="download">Download <i class="fas fa-download"></i></button>
        </div>
      </div>
    </form>
    `
  })
})
