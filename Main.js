
const togglebtn = document.getElementsByClassName('toggle-button')[0]
const closeNavListener=document.body


const navlinks = document.getElementsByClassName('nav')[0]

const navbar = document.getElementById("outer-nav");


var typingEffect = new Typed(".typer", {//typing effect
    strings: ["Computer Science Major ", "C++ Programmer", "Java Developer", "Web Developer", "Database Manager"],

    loop: true,
    typeSpeed: 50,
    backSpeed: 80,
    backDelay: 2000
})


// Click event to redirect to GitHub
document.querySelectorAll('.logo-item').forEach(logo => {
    logo.addEventListener('click', () => {
        window.open('https://github.com/Sptailor', '_blank');
    });
});

// Hide logos when scrolling away from landing page
window.addEventListener('scroll', () => {
    const landingSection = document.getElementById('landing');
    const floatingLogos = document.querySelector('.floating-logos');
    const landingRect = landingSection.getBoundingClientRect();
    
    // Hide logos when only 30% of landing section is still visible
    if (landingRect.bottom <= window.innerHeight * 0.3) {
        floatingLogos.style.opacity = '0';
        floatingLogos.style.pointerEvents = 'none';
    } else {
        floatingLogos.style.opacity = '1';
        floatingLogos.style.pointerEvents = 'auto';
    }
});

function toggleOpenClose(){
    event.stopPropagation();
    togglebtn.classList.toggle('rotate')
    if (navbar.classList.contains('slide-in')) {
        navbar.classList.remove('slide-in')
        navbar.classList.add('slide-out')
        // Delay hiding the nav until animation completes (0.3s)
        setTimeout(() => {
            navlinks.classList.remove('active');
        }, 300);
    } else if (navbar.classList.contains('slide-out')) {
        navbar.classList.remove('slide-out')
        navbar.classList.add('slide-in')
        navlinks.classList.add('active')
    } 
};


togglebtn.addEventListener('click', toggleOpenClose);


navlinks.addEventListener('click',toggleOpenClose);


closeNavListener.addEventListener('click',()=>{

    if (navbar.classList.contains('slide-in')) {
        navbar.classList.remove('slide-in');
        navbar.classList.add('slide-out');
        togglebtn.classList.remove('rotate');
        
        // Delay hiding the nav until animation completes (0.3s)
        setTimeout(() => {
            navlinks.classList.remove('active');
        }, 300);
    }
})


// Select all elements with the "hidden" class
const hiddenElements = document.querySelectorAll('.hidden');

// Create an Intersection Observer
const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            // Add the "visible" class when the element is in view
            entry.target.classList.add('visible');
            observer.unobserve(entry.target); // Stop observing once visible
        }
    });
});


hiddenElements.forEach(element => {
    observer.observe(element);
});


const jiggleElements = document.querySelectorAll('.jiggle-random');

// Function to trigger the jiggle animation
function triggerJiggle(element) {
    element.classList.add('jiggle');
    setTimeout(() => {
        element.classList.remove('jiggle');
    }, 500);
}


function startJiggleAnimation() {
    jiggleElements.forEach(element => {
        function jiggleWithRandomInterval() {
            triggerJiggle(element);

            const randomInterval = Math.random() * 1000 + 2000;
            setTimeout(jiggleWithRandomInterval, randomInterval);
        }
        jiggleWithRandomInterval();
    });
}

startJiggleAnimation();


// Scroll indicator functionality
const scrollIndicator = document.querySelector('.scroll-indicator');
if (scrollIndicator) {
    scrollIndicator.addEventListener('click', () => {
        document.querySelector('#intro-container').scrollIntoView({
            behavior: 'smooth'
        });
    });
    
    // Hide scroll indicator on scroll
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const rate = scrolled * -0.01;
        scrollIndicator.style.opacity = Math.max(0, 1 + rate);
    });
}

// Header color transition functionality
const splitInnerElements = document.querySelectorAll('.split-inner');

const headerObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        } else {
            entry.target.classList.remove('visible');
        }
    });
}, {
    threshold: 0.5
});

splitInnerElements.forEach(element => {
    headerObserver.observe(element);
});

