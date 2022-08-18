const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);
const player = $('.player');
const nameSong = $('header h2');
const cd = $('.cd');
const cdThumb = $('.cd-thumb');
const audio = $('#audio');
const playBtn = $('.btn-toggle-play');
const progress = $('#progress');
const btnPrev = $('.btn-prev');
const btnNext = $('.btn-next');
const btnRandom = $('.btn-random');
const btnRepeat = $('.btn-repeat');
const playList = $('.playlist');

const PLAYER_STORAGE_KEY = 'MUSIC_PLAYER';

const app = {
    currentIndex: 0,
    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
    setConfig: function(key, value) {
        this.config[key] = value;
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config));
    },
    songs: [
        {
            name: "Không Trọn Vẹn Nữa",
            singer: "Châu Khải Phong, ACV",
            path: "./assets/music/Khong Tron Ven Nua - Chau Khai Phong_ AC.mp3",
            image: "./assets/img/KhongTronVenNua.jpg"
        },
        {
            name: "Chạy Về Khóc Với Anh",
            singer: "ERIK",
            path: "./assets/music/Yeu Duong Kho Qua Thi Chay Ve Khoc Voi A.mp3",
            image: "./assets/img/ChayVeKhocVoiAnh.jpg"
        },
        {
            name: "Rồi Nâng Cái Ly",
            singer: "Nal",
            path: "./assets/music/Roi Nang Cai Ly - Nal.mp3",
            image: "./assets/img/RoiNangCaiLy.jpg"
        },
        {
            name: "Thương Em Đến Già",
            singer: "Lê Bảo Bình",
            path: "./assets/music/Thuong Em Den Gia - Le Bao Binh.mp3",
            image: "./assets/img/ThuongEmDenGia.jpg"
        },
        {
            name: "Tết Là Đây Chứ Đâu",
            singer: "Orange, Seachains",
            path: "./assets/music/Tet La Day Chu Dau - Orange_ Seachains.mp3",
            image: "./assets/img/TetLaDayChuDau.jpg"
        },
        {
            name: "Em Ơi Đừng Sầu",
            singer: "NB3 Hoài Bảo",
            path: "./assets/music/Em Oi Dung Sau - NB3 Hoai Bao.mp3",
            image: "./assets/img/EmOiDungSau.jpg"
        },
        {
            name: "Vui Lắm Nha",
            singer: "Hương Ly, Jombie",
            path: "./assets/music/Vui Lam Nha - Huong Ly_ Jombie.mp3",
            image: "./assets/img/VuiLamNha.jpg"
        },
        {
            name: "Tết Đong Đầy 3",
            singer: "Khoa, Duck V",
            path: "./assets/music/Tet Dong Day 3 - Khoa_ Duck V.mp3",
            image: "./assets/img/TetDongDay3.jpg"
        },
        {
            name: "Lỡ Hẹn Với Dòng Lam",
            singer: "Thái Học",
            path: "./assets/music/Lo Hen Voi Dong Lam - Thai Hoc.mp3",
            image: "./assets/img/LoHenVoiDongLam.jpg"
        },
        {
            name: "Phản Bội Chính Mình",
            singer: "Quân A.P, Vương Anh Tú",
            path: "./assets/music/Phan Boi Chinh Minh - Quan A_P_ Vuong An.mp3",
            image: "./assets/img/PhanBoiChinhMinh.jpg"
        }
    ],
    render: function () {
        const htmls = this.songs.map((song, index) => {
            return `
                <div data-index = "${index}" class="song ${index === this.currentIndex ? 'active' : ''}">
                    <div class="thumb"
                        style="background-image: url('${song.image}')">
                    </div>
                    <div class="body">
                        <h3 class="title">${song.name}</h3>
                        <p class="author">${song.singer}</p>
                    </div>
                    <div class="option">
                        <i class="fas fa-ellipsis-h"></i>
                    </div>
                </div>
            `;
        });
        playList.innerHTML = htmls.join("");
    },
    handleEvents: function() {
        const _this = this;
        const cdWidth = cd.offsetWidth;

        // Xử lý quay / dừng cd
        const cdThumbAnimate = cdThumb.animate([
            {transform: 'rotate(360deg)'}
        ], {
            duration: 10000, // số giấy
            iterations: Infinity // lặp vô hạn
        })
        cdThumbAnimate.pause();

        // Xử lý sự kiện phóng to/ thu nhỏ cd khi scroll
        document.onscroll = function() {
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            const newCdWidth = cdWidth - scrollTop;

            cd.style.width = newCdWidth > 0 ? newCdWidth + 'px' : 0;
            cd.style.opacity = newCdWidth / cdWidth;
            
        }

        // Xử lý khi play/ pause bài hát
        playBtn.onclick = function() {
            if(_this.isPlaying) {
                audio.pause();
            } else {
                audio.play();
            }
        }
        // Khi play bài hát
        audio.onplay = function() {
            _this.isPlaying = true;
            player.classList.add('playing');
            cdThumbAnimate.play();
        }
        // Khi pause bài hát
        audio.onpause = function() {
            _this.isPlaying = false;
            player.classList.remove('playing');
            cdThumbAnimate.pause();
        }

        // Xử lý khi tiến độ bài hát thay đổi
        audio.ontimeupdate = function() {
            const progressPercent = Math.floor(audio.currentTime / audio.duration * 100);
            progress.value = progressPercent;
        }

        // Xử lý khi tua bài hát
        progress.onchange = function(e) {
            const seekTime = audio.duration / 100 * e.target.value;
            audio.currentTime = seekTime;
        }

        // Chuyển sang bài tiếp theo
        btnNext.onclick = function() {
            if(_this.isRandom) {
                _this.playRandomSong();
            } else {
                _this.nextSong();
            }
            audio.play();
            _this.render();
            _this.scrollToActiveSong();
        }

        // Chuyển tới bài trước
        btnPrev.onclick = function() {
            if(_this.isRandom) {
                _this.playRandomSong();
            } else {
                _this.prevSong();
            }
            audio.play();
            _this.render();
            _this.scrollToActiveSong();
        }

        // Bật/ tắt phát bài hát ngẫu nhiên
        btnRandom.onclick = function(e) {
            _this.isRandom = !_this.isRandom;
            _this.setConfig('isRandom', _this.isRandom);
            btnRandom.classList.toggle('active', _this.isRandom);
        }

        // Xử lý khi audio kết thúc
        audio.onended = function() {
            if(_this.isRepeat) {
                audio.play();
            } else {
                btnNext.click();
            }
        }

        // Xử lý khi repeat bài hát
        btnRepeat.onclick = function() {
            _this.isRepeat = !_this.isRepeat;
            _this.setConfig('isRepeat', _this.isRepeat);
            btnRepeat.classList.toggle('active', _this.isRepeat);
        }

        // Lắng nghe hành vi click vào playlist
        playList.onclick = function(e) {
            const songNode = e.target.closest('.song:not(.active)');
            const optionSong = e.target.closest('.option');
            if(songNode || optionSong) {
                _this.currentIndex = Number(songNode.dataset.index);
                _this.loadCurrentSong();
                _this.render();
                audio.play();
            }
        }

    },
    defineProperties: function() {
        Object.defineProperty(this, 'currentSong', {
            get: function() {
                return this.songs[this.currentIndex];
            }
        })
    },
    loadCurrentSong: function() {
        nameSong.textContent = this.currentSong.name;
        cdThumb.style.backgroundImage = `url(${this.currentSong.image})`;
        audio.src = this.currentSong.path;
    },
    loadConfig: function() {
        this.isRandom = this.config.isRandom;
        this.isRepeat = this.config.isRepeat;
    },
    nextSong: function () {
        this.currentIndex++;
        if(this.currentIndex >= this.songs.length) {
            this.currentIndex = 0;
        }
        this.loadCurrentSong();
    },
    prevSong: function() {
        this.currentIndex--;
        if(this.currentIndex < 0) {
            this.currentIndex = this.songs.length -1;
        }
        this.loadCurrentSong();
    },
    playRandomSong: function() {
        let newIndex;
        do {
            newIndex = Math.floor(Math.random() * this.songs.length);
        } while (newIndex === this.currentIndex);
        this.currentIndex = newIndex;
        this.loadCurrentSong();
    },
    scrollToActiveSong: function() {
        setTimeout(() => {
            $('.song.active').scrollIntoView({
                behavior: 'smooth',
                block: 'end'
            })
        }, 500)
    },
    start: function() {
        // Gán cấu hình từ config vào ứng dụng
        this.loadConfig();
        // Định nghĩa các thuộc tính cho object
        this.defineProperties();

        // Lắng nghe và Xử lý sự kiện
        this.handleEvents();

        // Tải thông tin bài hát đầu tiên
        this.loadCurrentSong();

        // Render playlist
        this.render();

        // Hiển thị trạng thái ban đầu của button Random và Repeat
        btnRandom.classList.toggle('active', this.isRandom);
        btnRepeat.classList.toggle('active', this.isRepeat);

    }
}
app.start();