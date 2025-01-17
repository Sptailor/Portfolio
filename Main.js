
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

function toggleOpenClose(){
    event.stopPropagation();
    navlinks.classList.toggle('active')
    togglebtn.classList.toggle('rotate')
    if (navbar.classList.contains('slide-in')) {
        navbar.classList.remove('slide-in')
        navbar.classList.add('slide-out')
    } else if (navbar.classList.contains('slide-out')) {
        navbar.classList.remove('slide-out')
        navbar.classList.add('slide-in')
    } 
};


togglebtn.addEventListener('click', toggleOpenClose);


navlinks.addEventListener('click',toggleOpenClose);


closeNavListener.addEventListener('click',()=>{

    if (navbar.classList.contains('slide-in')) {
        navbar.classList.remove('slide-in');
        navbar.classList.add('slide-out');
        navlinks.classList.remove('active');
        togglebtn.classList.remove('rotate');
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

