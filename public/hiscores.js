// send name and score to high score server, then reload page
function addBestScore(name, score) {
  let scoreUrl = 'https://addy.ml/tetris-host/hiscores.php?add&name='
        + name + '&score=' + score;
  let image = document.createElement('img');
  image.setAttribute('style', 'visibility:hidden;');
  image.src = scoreUrl;
  $('body').append(image);
  // setTimeout(function() {
  //   window.location.reload(true);
  // }, 2000);
}

// did they get the all-time high score?
function isBestScore() {
  let bestScore = getBestScore();
  return (player.board.score > bestScore);
}

// set a cookie (mainly high score)
function setCookie(cname, cvalue, exdays) {
  let d = new Date();
  d.setTime(d.getTime() + (exdays*24*60*60*1000));
  let expires = 'expires='+ d.toUTCString();
  document.cookie = cname + '=' + cvalue + ';' + expires;
}

// retrieve a cookie (mainly high score)
function getCookie(cname) {
  let name = cname + '=';
  let decodedCookie = decodeURIComponent(document.cookie);
  let ca = decodedCookie.split(';');
  for (let i = 0; i <ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  // cookie not found
  if (cname == 'personal_best') {
    return 0;
  }
  else {
    return null;
  }
}
