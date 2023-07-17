import {createPW} from "./pw.js";
document.getElementById("genPwButton").onclick = function() {getPassword()};
function getPassword() {
  fetch("https://trouve-mot.fr/api/sizemax/6/3")
    .then((response) => response.json())
    .then((words) => {
      let str = words;
      let passphrase = str[0]["name"] + " " + str[1]["name"];
      if (passphrase.length < 8) {
        passphrase = passphrase + " " + str[2]["name"];
      }
      let password = createPW(passphrase);
      document.getElementById("password").value = password;
    })
}

document.getElementById("genPwButton2").onclick = function() {getPasswordfromUser()};
function getPasswordfromUser() {
  let w1 = document.getElementById("word1").value;
  let w2 = document.getElementById("word2").value;
  let w3 = document.getElementById("word3").value;
  let word1 = w1.toString();
  let word2 = w2.toString();
  let word3 = w3.toString();
  let passphrase = word1 + " " + word2 + " " + word3;
  let password = createPW(passphrase);
  document.getElementById("password2").value = password;

}
document.getElementById("copyButton").onclick = function() {copy(1)};
document.getElementById("copyButton2").onclick = function() {copy(2)};
let pwAttr = "";
let copyAttr = "";
function copy(n) {
  if (n == 1) {
    pwAttr = "password";
    copyAttr = "copyimg";
  }
  else {
    pwAttr = "password2";
    copyAttr = "copyimg2";
  }
  var pw = document.getElementById(pwAttr);
  pw.select();
  navigator.clipboard.writeText(pw.value);
  pw.blur();
  document.getElementById(copyAttr).setAttribute("src","https://beastin24.github.io/Test/Taskpane/assets/checkimg.png");  
  setTimeout(function(){ 
    document.getElementById(copyAttr).setAttribute("src","https://beastin24.github.io/Test/Taskpane/assets/copyimg.png"); 
  }, 1000);
}