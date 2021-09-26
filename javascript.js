const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const PLAYER_STORAGE_KEY ='TTP_player'

const heading = $("header h2");
const cdThumb = $(".cd-thumb");
const audio = $("#audio");
const cd = $(".cd");
const playBtn = $(".btn-toggle-play");
const player = $(".player");
const progress = $('#progress')
const nextBtn = $('.btn-next');
const prevBtn = $('.btn-prev');
const randomBtn = $('.btn-random');
const repeatBtn = $('.btn-repeat')
const playList =  $(".playlist")

const app = {
  currentIndex: 0,
  isPlaying: false,
  isRandom: false,
  isRepeat: false,
  config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
  setConfig: function(key,value) {
    this.config[key] = value
    localStorage.setItem(PLAYER_STORAGE_KEY , JSON.stringify(this.config))
  },
  song: [
    {
      name: "Phút Ban Đầu",
      singer: "Vũ",
      path: "./assets/music/PhutBanDau-ThaiVu-4133158.mp3",
      img: "./assets/img/Phutbandau.jpg",
    },
    {
      name: "3 1 0 7 - 3",
      singer: "W/n x ( Nâu,Duongg,Titie )",
      path: "./assets/music/31073-WNDuonggNautitie-7059323.mp3",
      img: "./assets/img/31073-3.jpg",
    },
    {
      name: "Bản Tình Ca Không Tựa",
      singer: "Bon",
      path: "./assets/music/BanTinhCaKhongTua-Bon-5473746.mp3",
      img: "./assets/img/ban-tinh-ca-khong-tua.jpg",
    },
    {
      name: "Tôi và Em",
      singer: "Pink Frog",
      path: "./assets/music/ToiVaEm1-PinkFrog-5047874.mp3",
      img: "./assets/img/toi-va-em.jpg",
    },
    {
      name: "Chẳng Nói Nên Lời",
      singer: "Hoàng Dũng",
      path: "./assets/music/ChangNoiNenLoi-HoangDung-5754828.mp3",
      img: "./assets/img/chang-noi-nen-loi.jpg",
    },
    {
      name: "Vài Giây Nữa Thôi",
      singer: "Reddy",
      path: "./assets/music/VaiGiayNuaThoi-ReddyHuuDuy-5404370.mp3",
      img: "./assets/img/vai-giay-nua-thoi.jpg",
    },
    {
      name: "Just A Kid",
      singer: "Boyzed",
      path: "./assets/music/JustAKid-Boyzed-6281669.mp3",
      img: "./assets/img/just-a-kid.jpg",
    },
  ],

  render: function () {
    const htmls = this.song.map((song,index) => {
      return `
      <div class="song ${index === this.currentIndex ? 'active' : ''}" data-index="${index}">
            <div class="thumb"
                style="background-image: url('${song.img}')">
            </div>
            <div class="body">
                <h3 class="title">${song.name}</h3>
                <p class="author">${song.singer}</p>
            </div>
            <div class="option">
                <i class="fas fa-ellipsis-h"></i>
            </div>
        </div>`;
    });
    playList.innerHTML = htmls.join("");
  },
  defineProperties: function () {
    Object.defineProperty(this, "currentSong", {
      get: function () {
        return this.song[this.currentIndex];
      },
    });
  },
  handleEvents: function () {
    //Xử lí CD xoay / dừng
    const cdThumbAnimated = cdThumb.animate([
      {
        transform: 'rotate(360deg)'
      }
    ],{
      duration: 10000, // 10s
      iterations: Infinity
    }
    )
    cdThumbAnimated.pause()

    const cdWidth = cd.offsetWidth;
    //Xử lí phóng to thu nhỏ CD
    document.onscroll = function () {
      const scrollTop = window.screenY || document.documentElement.scrollTop;
      const newCdWidth = cdWidth - scrollTop;
      cd.style.width = newCdWidth > 0 ? newCdWidth + "px" : 0;
      cd.style.opacity = newCdWidth / cdWidth;
    };
    //Xử lí phát nhạc / tạm dừng
    playBtn.onclick = function () {
      if (app.isPlaying) {
        audio.pause();
      } else {
        audio.play();
      }
    };
    // Khi Song dc play
    audio.onplay = function () {
      app.isPlaying = true;
      player.classList.add("playing");
      cdThumbAnimated.play()
    };
    // Khi Song bị dừng
    audio.onpause = function () {
      app.isPlaying = false;
      player.classList.remove("playing");
      cdThumbAnimated.pause()
    };
    // Khi tiến độ bài hát thay đổi
    audio.ontimeupdate = function(){
      if(audio.duration) {
        const progressPercent = Math.floor(audio.currentTime / audio.duration * 100)
        progress.value = progressPercent
      }
    }
    // Xử lí tua nhạc
    progress.onchange = function(e){
      const seekTime = e.target.value * audio.duration / 100
      audio.currentTime = seekTime
    }

    // Next nhạc
    nextBtn.onclick = function(){
      if(app.isRandom){
        app.randomSong()
      }else{
        app.nextSong()
      }
      
      audio.play()
      app.render()
      app.scrollToActiveSong()
    }
    // Prev nhạc
    prevBtn.onclick = function(){
      if(app.isRandom){
        app.randomSong()
      }else{
        app.prevSong()
      }
      app.render()
      audio.play()
      app.scrollToActiveSong()
    }
    // Random nhạc
    randomBtn.onclick = function(e){
      app.isRandom = !app.isRandom
      randomBtn.classList.toggle('active',app.isRandom)
      app.setConfig('isRandom',app.isRandom)
      
    }

    //Repeat Song
    repeatBtn.onclick = function(e){
      app.isRepeat =! app.isRepeat
      repeatBtn.classList.toggle('active',app.isRepeat)
      app.setConfig('isRepeat',app.isRepeat)
    }

    // Next song khi end
    audio.onended = function(){
      if(app.isRepeat){
          audio.play()
      }else{
        nextBtn.click()
      }
    }

    //Lắng nghe sự kiện click vào playlist
    playList.onclick = function(e){
      const songNode = e.target.closest('.song:not(.active)')
      if( songNode || e.target.closest('.option')){
        // Xử lí khi click vào song
        if(songNode){
          app.currentIndex = Number(songNode.dataset.index)
          app.loadCurrentSong()
          
          app.render();
          audio.play()
        }
        // Xử lí khi click vào option
        if(e.target.closest('.option')){

        }
      }
    }

  },
  scrollToActiveSong: function(){
    setTimeout(() => {
      $('.song.active').scrollIntoView({
        behavior:'smooth',
        block: 'nearest',
      })
    },200)

  
  },
  loadConfig: function(){
    this.isRandom = this.config.isRandom
    this.isRepeat = this.config.isRepeat
  },
  loadCurrentSong: function () {
    heading.textContent = this.currentSong.name;
    cdThumb.style.backgroundImage = `url(${this.currentSong.img})`;
    audio.src = this.currentSong.path;
  },
  nextSong: function(){
    this.currentIndex++
    if(this.currentIndex >= this.song.length){
      this.currentIndex = 0 
    }
    this.loadCurrentSong()
  },
  prevSong: function(){
    this.currentIndex--
    if(this.currentIndex < 0){
      this.currentIndex = this.song.length
    }
    this.loadCurrentSong()
  },
  randomSong:function(){
    let newIndex 
    do{
      newIndex = Math.floor(Math.random() * this.song.length)
    }while(newIndex === this.currentIndex)
    this.currentIndex = newIndex
    this.loadCurrentSong();
  },

  start: function () {
    // Gán cấu hình từ Config vào Ứng dụng
    this.loadConfig()

    //Lắng nghe / xử lí các sự kiện(Dom Events)
    this.handleEvents();

    //Định nghĩa các thuộc tính cho Object
    this.defineProperties();

    //Tải thông tin bài hát đầu tiên khi chạy ứng dụng
    this.loadCurrentSong();

    //Render Playlist
    this.render();

    // Hiển thị trạng thái ban đầu của Btn
    randomBtn.classList.toggle('active',this.isRandom)
    repeatBtn.classList.toggle('active',this.isRepeat)
  },
};

app.start();
