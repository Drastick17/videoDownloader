const $ = (selector) => document.querySelector(selector)

const baseURL = window.location.href

const inputURL = $('.URL')

inputURL.addEventListener('keyup', (e) => {
  if(e.keyCode == 13 ){
    $('.send').click()
  }
})

$('.send').addEventListener('click', function(){
  const url = inputURL.value
  const content = $('.details')
  content.innerHTML = "<div class='loader'></div>"
  
  fetch(`${baseURL}video?url=${url}`,{
    headers:{'Content-Type':'application/json'},
    method:'get'
  })
  .then(res => res.json())
  .then(data => {
    if(data.status === 404){
      content.innerHTML = `<h3 style="color:#ffffff">${data.error}</h3>`
    }else{
      const {url, title, iframe, duration, qualities} = data
      content.innerHTML =`
    <div class="form">
      <div class="video">
        <input type="text" value="${url}" name="url" class="hidden"/>
        <iframe src="${iframe}" ></iframe>
      </div>
      <div>
        <p class="title">${title}</p>
        <p class="duration"><i class="fas fa-clock"></i> ${duration} minutos</p>
        <div class="options">
          <select class="qualities" name="quality">
            ${qualities.map(quality => `<option value="${quality.itag}">${quality.quality} / ${quality.contentLenght?`${quality.contentLenght} MB`:'Not found'}</option>`)}
          </select>
          <button class="download"><a href="${baseURL}download?url=${url}&itag=${()=>{
              let selectedOption
              $('.qualities').addEventListener('change', function(){
                selectedOption = this.options[select.selectedIndex];
              })
              console.log(selectedOption)
              return selectedOption
            }
          }}">Download <i class="fas fa-download"></i></a>
          </button>
        </div>
      </div>
    </div>

    `
    }
  })
})




