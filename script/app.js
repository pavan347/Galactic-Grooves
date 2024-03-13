// const openMenu = ;
const left = document.getElementById("left");
// const closeMenu = ;
const libraryArrow = document.getElementById("go-up");
// const home = ;
// const library = 
// const play = document.getElementById("play");

let currentSong = new Audio();
let songs;
let currentFolder;

document.getElementById("open").addEventListener("click", () => {
    left.classList.add("active");
});

document.getElementById("close").addEventListener("click", () => {
    left.classList.remove("active");
});

libraryArrow.addEventListener("click", () => {
    document.getElementById("home-ul").classList.toggle("active");
    document.getElementById("library").classList.toggle("active");
    libraryArrow.classList.toggle("active");
});

// search.addEventListener("click", () => {
//     searchbox.focus();
// });

searchbox.addEventListener('input', async function (event) {
    const searchTerm = event.target.value.toLowerCase();
    // console.log(searchTerm);
    let items = await getAlbums();

    for (const item of items) {
        if (item.toLowerCase() == searchTerm) {
            await displayAlbum(item, true);
        }
    }
});

Array.from(document.getElementById("home-ul").querySelectorAll("li")).forEach(li => {
    let target = li.dataset.target;
    li.addEventListener("click", () => {
        Array.from(document.querySelectorAll(".container>div")).forEach(container => {
            let id = container.getAttribute("id");
            container.classList.remove("active");
            if (id == target) {
                if (left.classList.contains("active")) {
                    left.classList.remove("active");
                }


                if (id === "searchContainer") {
                    document.querySelector(".search-box").classList.add("active");
                    searchbox.focus();
                } else {
                    if (document.querySelector(".search-box").classList.contains("active")) {
                        document.querySelector(".search-box").classList.remove("active");
                    }
                }

                if (id === "aboutContainer") {
                    document.querySelector(".menu .title").innerText = "About";
                } else {
                    document.querySelector(".menu .title").innerText = "Albums";

                }


                container.classList.add("active");
            }
        });
    });
});

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
    document.getElementsByClassName("library-content")[0].querySelector("p").innerText = `${folder}`;
    currentFolder = folder;
    let response = await fetch(`/songs/${folder}/`);
    let data = await response.text();
    let div = document.createElement("div");
    div.innerHTML = data;

    let aelements = div.getElementsByTagName("a");
    let songs = [];
    for (const ele of aelements) {
        if (ele.href.endsWith(".mp3")) {
            // console.log(ele.href.split("songs/")[1].replaceAll("%20", " "));
            songs.push(ele.href.split(`songs/${folder}/`)[1].replaceAll("%20", " "));
        }
    }

    let songUL = document.querySelector(".songslist").getElementsByTagName("ul")[0];
    songUL.innerHTML = "";
    for (const song of songs) {
        // console.log(song);
        songUL.innerHTML = songUL.innerHTML + `<li>
        <div class="song-image">
            <i class="fa-solid fa-music"></i>
        </div>
        <div class="info">
            <div title="${song.slice(0, song.length - 4)}">${song.slice(0, song.length - 4)}</div>
            <div>pavan kumar</div>
        </div>
        <div class="playnow">
            <img class="playbtns" src="img/play.svg" alt="play/pause">
        </div>
    </li>`;
    }

    Array.from(document.querySelector(".songslist").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            // console.log(e.querySelector(".info").firstElementChild.innerHTML.trim());
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
        })
    })

    return songs;
}

const playMusic = (track, pause = false) => {
    console.log(track);
    currentSong.src = `/songs/${currentFolder}/` + track + ".mp3";

    if (!pause) {
        currentSong.play()
        play.src = "img/pause.svg"
    }

    document.querySelector(".songinfo marquee").innerHTML = track;
    document.querySelector(".songtime").innerHTML = "00:00";
    document.querySelector(".songtime-duration").innerHTML = "00:00";
}


async function displayAlbum(fol, flag = false) {
    let cardContainer = document.querySelector(".card-container");
    let info = await fetch(`/songs/${fol}/info.json`);
    let mdata = await info.json();
    let searchContainer = document.getElementById("searchContainer");
    if (flag) {
        searchContainer.innerHTML = `
                <div data-folder="${fol}" class="card">
                            <div class="image">
                                <div class="play"><i class="fa-solid fa-play"></i></div>
                                <img aria-hidden="false" draggable="false"
                                    src="songs/${fol}/cover.jpeg" alt="${fol}">
                            </div>
                            <div class="title">
                                ${mdata.title}
                            </div>
                            <div class="desc">
                                ${mdata.description}
                            </div>
                            <div class="indicate-playing" hidden>Playing...</div>
                        </div>
                `
    } else {
        cardContainer.innerHTML = cardContainer.innerHTML + `
                <div data-folder="${fol}" class="card">
                            <div class="image">
                                <div class="play"><i class="fa-solid fa-play"></i></div>
                                <img aria-hidden="false" draggable="false"
                                    src="songs/${fol}/cover.jpeg" alt="${fol}">
                            </div>
                            <div class="title">
                                ${mdata.title}
                            </div>
                            <div class="desc">
                                ${mdata.description}
                            </div>
                            <div class="indicate-playing" hidden>Playing...</div>
                        </div>
                `
    }

    Array.from(document.getElementsByClassName("card")).forEach(card => {
        card.addEventListener("click", async (e) => {

            Array.from(document.getElementsByClassName("card")).forEach(c => {
                c.classList.remove("active");
                c.querySelector(".indicate-playing").hidden = true;
            });
            // console.log(e.currentTarget);
            e.currentTarget.querySelector(".indicate-playing").hidden = false;
            e.currentTarget.classList.add("active");
            songs = await getSongs(`${e.currentTarget.dataset.folder}`);
            playMusic(songs[0].slice(0, songs[0].length - 4), true);


        });
    });
}

async function getAlbums() {
    let response = await fetch(`/songs/`);
    let data = await response.text();
    let div = document.createElement("div");
    div.innerHTML = data;
    let anchors = div.querySelectorAll("li a");

    let albums = [];
    for (const ele of anchors) {
        if (ele.href.includes("/songs/")) {
            albums.push(ele.title);
        }
    }

    return albums;
}

async function displayAllAlbums() {

    let albums = await getAlbums();

    for (const album of albums) {
        await displayAlbum(album);
    }
}

async function main() {


    songs = await getSongs("love");
    playMusic(songs[0].slice(0, songs[0].length - 4), true);

    await displayAllAlbums();

    // await displayAlbums();

    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "img/pause.svg";
        } else {
            currentSong.pause();
            play.src = "img/play.svg";
        }
    });

    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)}`;
        document.querySelector(".songtime-duration").innerHTML = `${secondsToMinutesSeconds(currentSong.duration)}`;
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
        // Array.from(document.querySelector(".songslist").getElementsByTagName("li")).forEach(e => {
        //         let lisong = e.querySelector(".info").firstElementChild.innerHTML.trim(); 
        //         let csongs = currentSong.src.split("/");
        //         let csong = csongs[csongs.length - 1];
        //         // console.log(csong.slice(0,csong.length-4)); 
        //         if(csong.slice(0,csong.length-4) == lisong){
        //             e.querySelector("img").src = "img/pause.svg";
        //         }else{
        //             e.querySelector("img").src = "img/play.svg";
        //         }

        // })
    });

    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100;
    })

    previous.addEventListener("click", () => {
        currentSong.pause();
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0].replaceAll("%20", " "));
        // console.log(currentSong.src.split("/").slice(-1)[0].replaceAll("%20"," "), index) ;
        if (index - 1 >= 0) {
            playMusic(songs[index - 1].replaceAll(".mp3", ""));
        }
    });

    next.addEventListener("click", () => {
        currentSong.pause();
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0].replaceAll("%20", " "));
        // console.log(currentSong.src.split("/").slice(-1)[0].replaceAll("%20"," ") , index) ;
        if (index + 1 < songs.length) {
            playMusic(songs[index + 1].replaceAll(".mp3", ""));
        }
    });



}

main();