var prevScrollpos = window.pageYOffset;
window.onscroll = function() {
var currentScrollPos = window.pageYOffset;
  if (prevScrollpos > currentScrollPos) {
    document.getElementById("header").style.top = "0";
  } else {
    document.getElementById("header").style.top = "-50px";
  }
  prevScrollpos = currentScrollPos;
}



function Opennav() {
    document.getElementById("mobile_navbar").style.height = "100vh";
    

}

function Closenav() {
    document.getElementById("mobile_navbar").style.height = "0vh";

}