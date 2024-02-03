
const togglebtn=document.getElementsByClassName('toggle-button')[0]

const navlinks=document.getElementsByClassName('nav')[0]

const navbar=document.getElementById("outer-nav");


var typingEffect = new Typed(".typer",{//typing effect
    strings : ["Computer Science Major ","C++ Programmer","Java Developer","Web Developer","Database Manager"],

    loop : true,
    typeSpeed : 50, 
    backSpeed : 80,
    backDelay : 2000
 })
togglebtn.addEventListener('click',()=>{//toggle navbar
    navlinks.classList.toggle('active')
    togglebtn.classList.toggle('rotate')
    if(navbar.classList.contains('slide-in')){
        navbar.classList.remove('slide-in')
        navbar.classList.add('slide-out')
    }else if(navbar.classList.contains('slide-out')){
        navbar.classList.remove('slide-out')
        navbar.classList.add('slide-in')
    }

 


    

 
})
