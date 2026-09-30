/* ===================================== typing animation ======================================== */
var typed = new Typed(".typing",{
    strings:["","Video Editor","Frontend Web Developer", "Graphic Designer"],
    typeSpeed:100,
    BackSpeed:60,
    loop:true
})
/* ===================================== Aside ======================================== */
const nav = document.querySelector(".nav"),
      navList = nav.querySelectorAll("li"),
      totalNavList = navList.length,
      allSection = document.querySelectorAll(".section"),
      totalSection = allSection.length;
      for(let i=0; i<totalNavList; i++)
      {
          const a = navList[i].querySelector("a");
          a.addEventListener("click", function()
          {
            removeBackSection();
            for(let j=0; j<totalNavList; j++)
            {
                if(navList[j].querySelector("a").classList.contains("active"))
                {
                    addBackSection(j);
                    // allSection[j].classList.add("back-section");
                }
                navList[j].querySelector("a").classList.remove("active");
            }
            this.classList.add("active")
            showSection(this);
            if(window.innerWidth < 1200)
            {
                asideSectionTogglerBtn();
            }
          })
      }
function removeBackSection()
{
  for(let i=0; i<totalSection; i++)
  {
      allSection[i].classList.remove("back-section");
  }
}
function addBackSection(num)
{
  allSection[num].classList.add("back-section");
}
function showSection(element)
{
    for(let i=0; i<totalSection; i++)
    {
        allSection[i].classList.remove("active");
    }
          const target = element.getAttribute("href").split("#")[1];
          document.querySelector("#" + target).classList.add("active")
      }
      function updateNav(element)
      {
          for(let i=0; i<totalNavList; i++)
          {
              navList[i].querySelector("a").classList.remove("active");
              const target = element.getAttribute("href").split("#")[1];
              if(target === navList[i].querySelector("a").getAttribute("href").split("#")[1])
              {
                navList[i].querySelector("a").classList.add("active");
              }
          }
      }
const hireMeBtn = document.querySelector(".hire-me");
if (hireMeBtn) {
  hireMeBtn.addEventListener("click", function()
  {
    const sectionIndex = parseInt(this.getAttribute("data-section-index"));
    // console.log(sectionIndex);
    showSection(this);
    updateNav(this);
    removeBackSection();
    addBackSection(sectionIndex);
  })
}
      const navTogglerBtn = document.querySelector(".nav-toggler"),
            aside = document.querySelector(".aside");
            navTogglerBtn.addEventListener("click", () => 
            {
                asideSectionTogglerBtn();
            })
function asideSectionTogglerBtn()
{
    aside.classList.toggle("open");
    navTogglerBtn.classList.toggle("open");
    for(let i=0; i<totalSection; i++ )
    {
        allSection[i].classList.toggle("open")
    }
}

function ensureAsideClosed() {
    if (window.innerWidth <= 1199) {
        aside.classList.remove("open");
        navTogglerBtn.classList.remove("open");
        for(let i=0; i<totalSection; i++) {
            allSection[i].classList.remove("open");
        }
    }
}

document.addEventListener('DOMContentLoaded', function() {
    ensureAsideClosed();
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