let sidebar = document.querySelector('.sidebar')
let main = document.querySelector('.main')
let icons = document.querySelectorAll('#icon')
let overlay = document.querySelector('.overlay')
let share = document.getElementById('share')
let section = document.querySelector('.section')

function openSidebar(){
sidebar.classList.toggle("open")
main.classList.toggle("open")
icons[0].classList.toggle("hide")
overlay.classList.toggle("open")
}



function handleWindowResize() {
const windowWidth = window.innerWidth;
if (windowWidth > 600) {
openWindow()
}else{
closeWindow()
sidebar.addEventListener('click', closeWindow)
}
}

function openWindow(){
    sidebar.classList.add("open")
    main.classList.add("open")
    icons[0].classList.add("hide")
    overlay.classList.add("open")
}
function closeWindow(){
    sidebar.classList.remove("open")
    main.classList.remove("open")
    icons[0].classList.remove("hide")
    overlay.classList.remove("open")
    
}


overlay.addEventListener('click', openSidebar)




window.addEventListener('resize', handleWindowResize);
handleWindowResize();

function getHost() {
    const currentURL = window.location.href;
    const urlObj = new URL(currentURL);
    const mainLink = `${urlObj.protocol}//${urlObj.host}`;
    return mainLink + "/referral?id=";
  }
  

  