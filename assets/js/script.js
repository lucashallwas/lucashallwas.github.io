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

    // an item can belong to more than one category, separated by "|"
    const categories = (filterItems[i].dataset.category || "").split("|");

    if (selectedValue === "all") {
      filterItems[i].classList.add("active");
    } else if (categories.indexOf(selectedValue) !== -1) {
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



// project modal variables
const projectTriggers = document.querySelectorAll("[data-project-trigger]");
const projectModal = document.querySelector("[data-project-modal]");
const projectModalCloseElems = document.querySelectorAll("[data-project-modal-close]");
const projectModalImg = document.querySelector("[data-project-modal-img]");
const projectModalCategory = document.querySelector("[data-project-modal-category]");
const projectModalTitle = document.querySelector("[data-project-modal-title]");
const projectModalDesc = document.querySelector("[data-project-modal-desc]");

if (projectModal) {

  const openProjectModal = function (trigger) {
    projectModalImg.src = trigger.dataset.projectImg;
    projectModalImg.alt = trigger.dataset.projectTitle;
    projectModalCategory.textContent = trigger.dataset.projectCategory;
    projectModalTitle.textContent = trigger.dataset.projectTitle;

    projectModalDesc.innerHTML = "";

    const templateName = trigger.dataset.projectTemplate;
    const template = templateName
      ? document.querySelector('template[data-project-template="' + templateName + '"]')
      : null;

    if (template) {
      projectModalDesc.appendChild(template.content.cloneNode(true));
    } else {
      projectModalDesc.textContent = trigger.dataset.projectDesc || "";
    }

    projectModal.classList.add("active");
    document.body.style.overflow = "hidden";
  };

  const closeProjectModal = function () {
    projectModal.classList.remove("active");
    document.body.style.overflow = "";
  };

  for (let i = 0; i < projectTriggers.length; i++) {
    projectTriggers[i].addEventListener("click", function (event) {
      event.preventDefault();
      openProjectModal(this);
    });
  }

  for (let i = 0; i < projectModalCloseElems.length; i++) {
    projectModalCloseElems[i].addEventListener("click", closeProjectModal);
  }

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && projectModal.classList.contains("active")) closeProjectModal();
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



// "what i'm doing" carousel dots (mobile only — the track is a plain stack above 768px)
const serviceList = document.querySelector(".service-list");

if (serviceList) {

  const serviceItems = [...serviceList.querySelectorAll(".service-item")];
  const dotsWrapper = document.createElement("div");
  dotsWrapper.className = "service-dots";

  const dots = serviceItems.map(function (item, i) {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.className = "service-dot" + (i === 0 ? " active" : "");
    dot.setAttribute("aria-label", "Go to card " + (i + 1));
    dot.addEventListener("click", function () {
      serviceList.scrollTo({ left: item.offsetLeft - serviceList.offsetLeft, behavior: "smooth" });
    });
    dotsWrapper.appendChild(dot);
    return dot;
  });

  serviceList.after(dotsWrapper);

  // highlight the dot for whichever card sits closest to the track's center
  let scrollTick;
  serviceList.addEventListener("scroll", function () {
    window.cancelAnimationFrame(scrollTick);
    scrollTick = window.requestAnimationFrame(function () {
      const center = serviceList.scrollLeft + serviceList.clientWidth / 2;
      let closest = 0;
      let closestDist = Infinity;

      serviceItems.forEach(function (item, i) {
        const dist = Math.abs(item.offsetLeft - serviceList.offsetLeft + item.offsetWidth / 2 - center);
        if (dist < closestDist) { closestDist = dist; closest = i; }
      });

      dots.forEach(function (dot, i) { dot.classList.toggle("active", i === closest); });
    });
  }, { passive: true });

}



// gradual reveal of components on scroll
const revealSelectors = [
  ".sidebar",
  ".github-card",
  "article > header",
  ".about-text > *",
  ".service-item",
  ".tools-item",
  ".clients",
  ".filter-list",
  ".filter-select-box",
  ".project-item",
  ".timeline-item",
  ".skills-item",
  ".blog-post-item",
  ".mapbox",
  ".contact-form",
  ".contact-list-item"
];

const revealElems = document.querySelectorAll(revealSelectors.join(", "));

if (revealElems.length && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {

  // stagger siblings so each group flows in instead of landing all at once
  const groupIndex = new Map();

  revealElems.forEach(function (elem) {
    const parent = elem.parentElement;
    const index = groupIndex.get(parent) || 0;
    groupIndex.set(parent, index + 1);

    elem.style.setProperty("--reveal-delay", Math.min(index, 6) * 70 + "ms");
    elem.setAttribute("data-reveal", "");
  });

  const revealObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;

      entry.target.classList.add("revealed");
      revealObserver.unobserve(entry.target);

      entry.target.addEventListener("transitionend", function handler(event) {
        if (event.propertyName !== "opacity") return;
        entry.target.classList.add("reveal-done");
        entry.target.style.removeProperty("--reveal-delay");
        entry.target.removeEventListener("transitionend", handler);
      });
    });
  }, { rootMargin: "0px 0px -40px 0px", threshold: 0.05 });

  revealElems.forEach(function (elem) {

    // the browser may restore a scroll position: anything already scrolled past
    // never intersects again, so show it right away instead of animating it in
    const rect = elem.getBoundingClientRect();

    if (rect.height && rect.bottom <= 0) {
      elem.style.removeProperty("--reveal-delay");
      elem.classList.add("revealed", "reveal-done");
      return;
    }

    revealObserver.observe(elem);
  });

}