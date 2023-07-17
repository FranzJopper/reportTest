function createPW(passphrase) {
  var specialList = "`~!@#$%^&*-_=+\\|;:,./?";
  var list = ""
  for (let i = 0; i < passphrase.length; i++) {
    if (passphrase[i] == 'a' || passphrase[i] == 'à' || passphrase[i] == 'â') {
      list = "aaaaaa44A";
      password = password + list[Math.floor(Math.random() * list.length)];
    }
    else if (passphrase[i] == 'e' || passphrase[i] == 'é' || passphrase[i] == 'è' || passphrase[i] == 'ê') {
      list = "eeeeee33E";
      password = password + list[Math.floor(Math.random() * list.length)];
    }
    else if (passphrase[i] == 's') {
      list = "ssssss55S";
      password = password + list[Math.floor(Math.random() * list.length)];
    }
    else if (passphrase[i] == 'l') {
      list = "llllll11L";
      password = password + list[Math.floor(Math.random() * list.length)];
    }
    else if (passphrase[i] == 'o' || passphrase[i] == 'ô') {
      list = "oooooo00O";
      password = password + list[Math.floor(Math.random() * list.length)];
    }
    else if (passphrase[i] == ' ') {
      password = password + specialList[Math.floor(Math.random() * specialList.length)];
    }
    else if (passphrase[i] == 'ù' || passphrase[i] == 'û') {
      list = "uuuuuuU";
      password = password + list[Math.floor(Math.random() * list.length)];
    }
    else if (passphrase[i] == 'î' || passphrase[i] == 'ï') {
      list = "iiiiiiI";
      password = password + list[Math.floor(Math.random() * list.length)];
    }
    else {
      let n = Math.floor(Math.random() * 8);
      if (n == 0) {
        password = password + passphrase[i].toUpperCase();
      }
      else {
        password = password + passphrase[i];
      }
      
    }
  }
  return password;
}
export {createPW};