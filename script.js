
let currentsong = new Audio();
let songs;
let currFolder;

let play = document.getElementById("play");
function convertSecondsToMinutes(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');
    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
    currFolder = folder;

    let response = await fetch(`/${folder}/songs.json`);
    songs = await response.json();

    let element = document.querySelector('.songlist');
    if (!element) return [];

    let songUL = element.querySelector('ul');
    if (!songUL) return [];

    songUL.innerHTML = "";

    for (const song of songs) {
        if (!song.startsWith(' ')) {
            songUL.innerHTML += `
                <li>
                    <img src="Assets/music.svg" class="invert" alt="music">
                    <div class="info">
                        <div>${song}</div>
                        <div>Artist</div>
                    </div>
                    <img src="Assets/play.svg" class="listplay invert" alt="play">
                </li>`;
        }
    }

    Array.from(songUL.getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", () => {
            let songName = e.querySelector(".info").firstElementChild.innerHTML.trim();
            playmusic(songName);
        });
    });

    return songs;
}



// async function getSongs(folder) {
//     currFolder = folder;
//     let response = await fetch(`/${folder}/`);
//     let text = await response.text();

//     // Parse the HTML response into a DOM object
//     const parser = new DOMParser();
//     const doc = parser.parseFromString(text, 'text/html');

//     let as = doc.getElementsByTagName("a"); // Use 'doc' to refer to the parsed HTML
//   songs = [];

//     // Iterate through all <a> elements and collect .mp3 links
//     for (let index = 0; index < as.length; index++) {
//         const element = as[index];
//         if (element.href.endsWith(".mp3")) {
//             songs.push(element.href.split(`/${folder}/`)[1]);
//         }
//     }

//     // Update the DOM with the song list
//     let element = document.querySelector('.songlist');
    
//     if (!element) return []; // Ensure element exists

//     let songUL = element.getElementsByTagName('ul')[0];
    
//     if (!songUL) return []; // Ensure <ul> exists

//     // Clear the existing list
//     songUL.innerHTML = "";

//     // Populate the list with songs
//     for (const song of songs) {
//         // Skip songs that start with a space (if that's your requirement)
//         if (!song.startsWith(' ')) {
//             songUL.innerHTML += `
//                 <li>
//                     <img src="Assets/music.svg" class="invert" alt="music">
//                     <div class="info">
//                         <div>${song}</div>
//                         <div>Artist</div>
//                     </div>
//                     <img src="Assets/play.svg" class="listplay invert" alt="play">
//                 </li>`;
//         }
//     }

//     // Add click event listeners to each <li> element in the list
//     Array.from(songUL.getElementsByTagName("li")).forEach(e => {
//         e.addEventListener("click", () => {
//             let songName = e.querySelector(".info").firstElementChild.innerHTML.trim();
//             playmusic(songName); // Assuming 'playmusic' is a defined function
//         });
//     });

//     return songs; // Return the list of songs
// }



const playmusic = (track, pause = false) => {
    currentsong.src = `/${currFolder}/` + track
    if (!pause) {
        currentsong.play();
        play.src = "Assets/pause.svg"
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track)
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00"

}

async function displayAlbums(){
    let a = await fetch(`/songs/`)
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a")  
    let cardContainer = document.querySelector(".cardContainer");
    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        if (e.href.includes("/songs") && !e.href.includes(".htaccess")) {
            let folder = e.href.split("/").slice(-2)[0]
           
            
           // get the metadata of the folder
           let a = await fetch(`/songs/${folder}/info.json`)
           let response = await a.json();
            cardContainer.innerHTML = cardContainer.innerHTML +`<div data-folder="${folder}" class="card">
           <div class="play1">
               <img src="Assets/play1.svg" alt="play">
           </div>
           <img src="/songs/${folder}/cover.jpg" alt="img">
           <h2>${response.title}</h2>
           <p>${response.description}</p>
         </div> `
  }
 }

       //load the playlists when card is clicked
       Array.from(document.getElementsByClassName("card")).forEach(
        e => {
            
            e.addEventListener("click", async item => {

                songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)
                playmusic(songs[0])
            })
        }
    )
}


async function main() {

    // get the list of songs
    await getSongs("songs/Romantic");
    playmusic(songs[0], true);

    //display all the albums on the page
     displayAlbums()
    //attach an event listeners for play, previous and next buttons
    // Assuming this is your audio element

    play.addEventListener("click", () => {
        if (currentsong.paused) {
            currentsong.play();
            play.src = "Assets/pause.svg";
        }
        else {
            currentsong.pause();
            play.src = "Assets/play.svg";
        }
    })

    currentsong.addEventListener("timeupdate", () => {
       
        document.querySelector(".songtime").innerHTML = `${convertSecondsToMinutes(currentsong.currentTime)}/${convertSecondsToMinutes(currentsong.duration)}`;
        document.querySelector(".circle").style.left = (currentsong.currentTime / currentsong.duration) * 100 + "%";
    })

    //add an event listener to seekbar
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentsong.currentTime = ((currentsong.duration) * percent) / 100
    });

    //add an event listener to hamburger
    document.querySelector(".hamburger").addEventListener("click", e => {
        document.querySelector(".left").style.left = "0"
    })

    //add an event listener to close button
    document.querySelector(".close").addEventListener("click", e => {
        document.querySelector(".left").style.left = "-110%"
    })

    //add an event listener to previous button
    previous.addEventListener("click", e => {
        console.log(currentsong);
        let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0]);
        if ((index - 1) >= 0) {
            playmusic(songs[index - 1])
        }
    })
    //add an event listener to next button
    next.addEventListener("click", e => {
        console.log(currentsong);
        let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0]);
        if ((index + 1) < songs.length) {
            playmusic(songs[index + 1])
        }
    })

    //add an event listener to volume slider
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        console.log("setting volume to", e.target.value, "/100");
        currentsong.volume = parseInt(e.target.value) / 100;

    })
    
    //add an event listener to mute the track
    document.querySelector(".volume>img").addEventListener("click", e => {
       if (e.target.src.includes("Assets/volume-up.svg")) {
         e.target.src = e.target.src.replace("Assets/volume-up.svg", "Assets/volume-mute.svg");
         currentsong.volume =0;
         document.querySelector(".range").getElementsByTagName("input")[0].value = "0";
         
        } else {
            e.target.src = e.target.src.replace("Assets/volume-mute.svg", "Assets/volume-up.svg");
            currentsong.volume =.25;
            document.querySelector(".range").getElementsByTagName("input")[0].value = "25";
       }
    })
}
main();

