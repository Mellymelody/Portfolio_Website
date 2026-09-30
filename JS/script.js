/* ===================================== typing animation ======================================== */
var typed = new Typed(".typing",{
    strings:["","Video Editor","Frontend Web Developer", "Graphic Designer"],
    typeSpeed:100,
    BackSpeed:60,
    loop:true
})

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

const hireMeBtn = document.querySelector(".hire-me");
if (hireMeBtn) {
    hireMeBtn.addEventListener("click", function() {
        const sectionIndex = parseInt(this.getAttribute("data-section-index"));
        showSectionByIndex(sectionIndex);
        updateNavByIndex(sectionIndex);
    });
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

windows.addEventListener("beforeunload", ()=> {
    sessionStorage.setItem("scrollPosition", window.scrollY);
});

windows.addEventListener("load", ()=> {
    const position = sessionStorage.getItem("scrollPosition");

    if (position !== null) {
        window.scrollTo(0, Number(position));
        sessionStorage.removeItem("scrollPosition");
    }
});

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

function ensureAsideClosed() {
    if (window.innerWidth <= 1199) {
        const asideEl = document.querySelector(".aside");
        const toggler = document.querySelector(".nav-toggler");
        const sections = document.querySelectorAll(".section");
        if (asideEl) asideEl.classList.remove("open");
        if (toggler) toggler.classList.remove("open");
        for(let i=0; i<sections.length; i++) {
            sections[i].classList.remove("open");
        }
    }
}

function handleHashOnLoad() {
    const hash = window.location.hash;
    if (hash) {
        const targetId = hash.slice(1);
        showSectionById(targetId);
        updateNavByHref(hash);
    }
}

document.addEventListener('DOMContentLoaded', function() {
    ensureAsideClosed();
    handleHashOnLoad();

    const form = document.getElementById('contact-form');
    const messageDiv = document.getElementById('form-message');

    if (form) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();

            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.textContent = 'Sending...';

            messageDiv.style.display = 'none';
            messageDiv.className = 'form-message';

            const formData = new FormData(form);
            const data = Object.fromEntries(formData);

            try {
                const response = await fetch('/.netlify/functions/contact', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });

                const result = await response.json();

                if (response.ok && result.success) {
                    messageDiv.textContent = result.message || 'Message sent successfully!';
                    messageDiv.style.background = '#d4edda';
                    messageDiv.style.color = '#155724';
                    messageDiv.style.border = '1px solid #c3e6cb';
                    messageDiv.style.padding = '12px';
                    messageDiv.style.borderRadius = '5px';
                    form.reset();
                } else {
                    messageDiv.textContent = result.errors ? result.errors.join(', ') : 'Something went wrong. Please try again.';
                    messageDiv.style.background = '#f8d7da';
                    messageDiv.style.color = '#721c24';
                    messageDiv.style.border = '1px solid #f5c6cb';
                    messageDiv.style.padding = '12px';
                    messageDiv.style.borderRadius = '5px';
                }
            } catch (err) {
                messageDiv.textContent = 'Network error. Please check your connection and try again.';
                messageDiv.style.background = '#f8d7da';
                messageDiv.style.color = '#721c24';
                messageDiv.style.border = '1px solid #f5c6cb';
                messageDiv.style.padding = '12px';
                messageDiv.style.borderRadius = '5px';
            }

            messageDiv.style.display = 'block';
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        });
    }
});