// import plugins [needed]
const axios = require('axios')

export default function Team(duty, page = 1, limit = 5) {
  // api call to fetch team members
  axios.get("https://challenge-api.view.agentur-loop.com/api.php", {
    params: {
      page,
      limit,
      duty: duty !== "" ? duty : null
    }
  }).then(function (response) {
    // handle success
    console.log(response.data.data.data);
    const records = response.data.data.data
    const teamTag = document.getElementById('team-members')
    if (page == 1) teamTag.innerHTML = ''
    // read and append each team member to parent element
    records.forEach(e => {
      const teamMemberTag = TeamTemplate(e)
      teamTag.appendChild(teamMemberTag)
    })
  })
  .catch(function (error) {
    // handle error
    console.log(error);
  })
}

function TeamTemplate(params) {
  // create one team member's parent element
  const Root = document.createElement("div")
  Root.classList.add("team-box")
  params.duty_slugs.forEach(e => {
    Root.classList.add("tag-" + e)
  })
  Root.dataset.tags = params.duty_slugs.toString()

  // create one team member's image
  const Image = document.createElement("img")
  Image.src = params.image

  // create one team member's name and description
  const Caption = document.createElement("div")
  Caption.classList.add("team-caption")

  const CaptionName = document.createElement("h2")
  CaptionName.classList.add("name")
  CaptionName.textContent = params.name

  const CaptionDescription = document.createElement("p")
  CaptionDescription.classList.add("description")
  CaptionDescription.textContent = "A smooth sea never made a skilled sailor."

  Caption.appendChild(CaptionName);
  Caption.appendChild(CaptionDescription);

  // append image and caption to team member's parent element
  Root.appendChild(Image);
  Root.appendChild(Caption);

  // returning DOM element with one team member
  return Root
}