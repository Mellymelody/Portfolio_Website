/* ===================================== Aside ======================================== */
const nav = document.querySelector(".nav");
const navTogglerBtn = document.querySelector(".nav-toggler");
const aside = document.querySelector(".aside");
const allSections = document.querySelectorAll(".section");

if (nav) {
    const navList = nav.querySelectorAll("li");
    const totalNavList = navList.length;
    for(let i=0; i<totalNavList; i++) {
        const a = navList[i].querySelector("a");
        a.addEventListener("click", function(e) {
            const href = this.getAttribute("href");
            if (href && href.startsWith("#")) {
                e.preventDefault();
                const targetId = href.slice(1);
                showSectionById(targetId);
                updateNavByHref(href);
                if (window.innerWidth < 1200 && aside && navTogglerBtn) {
                    asideSectionTogglerBtn();
                }
            }
        });
    }
}

function showSectionById(id) {
    const sections = document.querySelectorAll(".section");
    for(let i=0; i<sections.length; i++) {
        sections[i].classList.remove("active");
    }
    const target = document.getElementById(id);
    if (target) {
        target.classList.add("active");
    }
}

function updateNavByHref(href) {
    const nav = document.querySelector(".nav");
    if (!nav) return;
    const navList = nav.querySelectorAll("li");
    for(let i=0; i<navList.length; i++) {
        const link = navList[i].querySelector("a");
        link.classList.remove("active");
        if (link.getAttribute("href") === href) {
            link.classList.add("active");
        }
    }
}

if (navTogglerBtn && aside) {
    navTogglerBtn.addEventListener("click", () => {
        asideSectionTogglerBtn();
    });
}

function asideSectionTogglerBtn() {
    if (!aside || !navTogglerBtn) return;
    aside.classList.toggle("open");
    navTogglerBtn.classList.toggle("open");
    const sections = document.querySelectorAll(".section");
    for(let i=0; i<sections.length; i++) {
        sections[i].classList.toggle("open");
    }
}

function showSectionByIndex(index) {
    const sections = document.querySelectorAll(".section");
    for(let i=0; i<sections.length; i++) {
        sections[i].classList.remove("active");
    }
    if (sections[index]) {
        sections[index].classList.add("active");
    }
}

function updateNavByIndex(index) {
    const nav = document.querySelector(".nav");
    if (!nav) return;
    const navList = nav.querySelectorAll("li");
    for(let i=0; i<navList.length; i++) {
        navList[i].querySelector("a").classList.remove("active");
    }
    if (navList[index]) {
        navList[index].querySelector("a").classList.add("active");
    }
}

// if (sessionStorage.getItem("refreshing") === "true") {
//     sessionStorage.removeItem("refreshing");
//     window.location.href = "index.html";
// }