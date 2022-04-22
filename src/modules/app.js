// import style assets
import '../styles/app.scss'

// import image assets
import Logo from '../assets/logo.png'
import Banner from '../assets/banner-bg.png'
import Information from '../assets/information-image.png'

// import additional modules
import Team from './team'

export default function App() {
  // attach image assets
  // LOGO IMAGE ASSETS
  const logoTag = document.getElementsByClassName('brand-logo')
  logoTag[0].src = Logo
  // BANNER IMAGE ASSETS
  const bannerTag = document.getElementsByClassName('banner-image')
  bannerTag[0].src = Banner
  // INFORMATION IMAGE ASSETS
  const informationTag = document.getElementsByClassName('information-image')
  const informationImageTag = informationTag[0].getElementsByTagName('img')
  informationImageTag[0].src = Information

  // attach click event to team load button
  const loadMembersButton = document.getElementById('load-members')
  loadMembersButton.onclick = function () {
    Team(loadMembersButton.dataset.filter, parseInt(loadMembersButton.dataset.page) + 1, loadMembersButton.dataset.limit)
    loadMembersButton.dataset.page = parseInt(loadMembersButton.dataset.page) + 1
  }

  // attach click event to team filters
  const teamFilterTag = document.getElementsByClassName('team-filter')[0]
  teamFilterTag.querySelectorAll("li").forEach(e => {
    e.onclick = function () {
      // remove current active filter
      teamFilterTag.getElementsByClassName("active")[0].classList.remove('active')

      // show current active filter and team members
      if (e.dataset.tag === "all") {
        e.classList.add('active')
        const loadMembersButton = document.getElementById('load-members')
        Team(null, 1, loadMembersButton.dataset.limit)
        loadMembersButton.dataset.page = 1
        // DEPRECATED: logic below
        // manupulation dom to hide and show dom elements
        // document.querySelectorAll('.team-box').forEach(function(el) {
        //   el.style.display = 'block';
        // });
      } else {
        e.classList.add('active')
        const loadMembersButton = document.getElementById('load-members')
        Team(e.dataset.tag, 1, loadMembersButton.dataset.limit)
        loadMembersButton.dataset.page = 1
        loadMembersButton.dataset.filter = e.dataset.tag
        // DEPRECATED: logic below
        // manupulation dom to hide and show dom elements
        // document.querySelectorAll('.team-box').forEach(function(el) {
        //   el.style.display = 'none';
        // });
        // document.querySelectorAll(".tag-" + e.dataset.tag).forEach(function(el) {
        //   el.style.display = 'block';
        // });
      }
    }
  })

  // initialize teams with min 5 members during start
  Team()
  console.log("Inizialising App...")
}