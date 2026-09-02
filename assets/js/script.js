'use strict';



// element toggle function
const elementToggleFunc = function (elem) { elem.classList.toggle("active"); }



// sidebar variables
const sidebar = document.querySelector("[data-sidebar]");
const sidebarBtn = document.querySelector("[data-sidebar-btn]");

// sidebar toggle functionality for mobile
sidebarBtn.addEventListener("click", function () {
  elementToggleFunc(sidebar);
  this.querySelector("span").textContent =
    sidebar.classList.contains("active") ? "Hide Contacts" : "Show Contacts";
});



// custom select variables
const select = document.querySelector("[data-select]");
const selectItems = document.querySelectorAll("[data-select-item]");
const selectValue = document.querySelector("[data-selecct-value]");
const filterBtn = document.querySelectorAll("[data-filter-btn]");

select.addEventListener("click", function () { elementToggleFunc(this); });

// add event in all select items
for (let i = 0; i < selectItems.length; i++) {
  selectItems[i].addEventListener("click", function () {

    let selectedValue = this.innerText.toLowerCase();
    selectValue.innerText = this.innerText;
    elementToggleFunc(select);
    filterFunc(selectedValue);

  });
}

// filter variables
const filterItems = document.querySelectorAll("[data-filter-item]");

const filterFunc = function (selectedValue) {

  for (let i = 0; i < filterItems.length; i++) {

    if (selectedValue === "all") {
      filterItems[i].classList.add("active");
    } else if (selectedValue === filterItems[i].dataset.category) {
      filterItems[i].classList.add("active");
    } else {
      filterItems[i].classList.remove("active");
    }

  }

}

// add event in all filter button items for large screen
let lastClickedBtn = filterBtn[0];

for (let i = 0; i < filterBtn.length; i++) {

  filterBtn[i].addEventListener("click", function () {

    let selectedValue = this.innerText.toLowerCase();
    selectValue.innerText = this.innerText;
    filterFunc(selectedValue);

    lastClickedBtn.classList.remove("active");
    this.classList.add("active");
    lastClickedBtn = this;

  });

}



// page navigation variables
const navigationLinks = document.querySelectorAll("[data-nav-link]");
const pages = document.querySelectorAll("[data-page]");

// add event to all nav link
for (let i = 0; i < navigationLinks.length; i++) {
  navigationLinks[i].addEventListener("click", function () {

    for (let i = 0; i < pages.length; i++) {
      if (this.innerHTML.toLowerCase() === pages[i].dataset.page) {
        pages[i].classList.add("active");
        navigationLinks[i].classList.add("active");
        window.scrollTo(0, 0);
      } else {
        pages[i].classList.remove("active");
        navigationLinks[i].classList.remove("active");
      }
    }

  });
}



// github card expand/collapse toggle for mobile
const githubToggle = document.querySelector("[data-github-btn]");
const githubCard = document.querySelector(".github-card");

if (githubToggle && githubCard) {
  githubToggle.addEventListener("click", function () {
    githubCard.classList.toggle("collapsed");
    this.querySelector("span").textContent =
      githubCard.classList.contains("collapsed") ? "Expand" : "Collapse";
  });
}



// github contribution graph
const githubGraph = document.querySelector(".github-graph");

if (githubGraph) {

  const user = githubGraph.dataset.githubUser;
  const startDate = new Date(githubGraph.dataset.githubStart + "T00:00:00");
  const today = new Date();

  // github contribution colors
  const levelColors = ["var(--segmented-track)", "#9be9a8", "#40c463", "#30a14e", "#216e39"];

  // fetch every year from the start year to the current year
  const years = [];
  for (let y = startDate.getFullYear(); y <= today.getFullYear(); y++) years.push(y);

  Promise.all(
    years.map(function (y) {
      return fetch("https://github-contributions-api.jogruber.de/v4/" + user + "?y=" + y)
        .then(function (res) { return res.json(); });
    })
  ).then(function (results) {

    // merge and keep only days from the start date up to today
    const days = results
      .flatMap(function (r) { return r.contributions || []; })
      .map(function (d) { return { date: new Date(d.date + "T00:00:00"), level: d.level }; })
      .filter(function (d) { return d.date >= startDate && d.date <= today; })
      .sort(function (a, b) { return a.date - b.date; });

    if (!days.length) return;

    // align the grid to the sunday on/before the start date
    const gridStart = new Date(startDate);
    gridStart.setDate(gridStart.getDate() - gridStart.getDay());

    const oneDay = 86400000;

    days.forEach(function (d) {
      const cell = document.createElement("div");
      cell.className = "github-day";
      cell.style.backgroundColor = levelColors[d.level] || levelColors[0];
      cell.style.gridRow = (d.date.getDay() + 1);
      cell.style.gridColumn = Math.floor((d.date - gridStart) / oneDay / 7) + 1;
      cell.title = d.date.toISOString().slice(0, 10);
      githubGraph.appendChild(cell);
    });

  }).catch(function () {
    // fallback: static full-year image if the api is unavailable
    githubGraph.outerHTML =
      '<img src="https://ghchart.rshah.org/' + user + '" alt="' + user +
      ' GitHub contributions" style="width:100%;display:block;">';
  });

}