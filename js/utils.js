const doc = document.documentElement;
var left = document.querySelector("#menu_list");
var container = document.querySelector(".container");
// var resize_left = document.querySelector("#resize_left");
// var resize_right = document.querySelector("#resize_right");
// var zoom_in = document.querySelector("#zoom_in");
// var zoom_out = document.querySelector("#zoom_out");
// var fs = document.querySelector("#fs");

function convertRemToPixels(rem) {return rem * parseFloat(getComputedStyle(document.documentElement).fontSize)}
function storageGet (key) {return window.localStorage.getItem(key)}
function storageSet (key, value) {return window.localStorage.setItem(key, value)}

function setResize (x) {
  const size = x + 'px';
  // resize_left.style.left = size;
  // resize_right.style.left = size;
  // zoom_in.style.left = size;
  // zoom_out.style.left = size;
  // fs.style.left = size;
  storageSet('resize', x);
}
function setZoom (x) {
  doc.style.fontSize = `${x}px`;
  const target = document.getElementById('menu_target');
  if (target) {
    target.contentWindow.document.querySelector('body').style.fontSize = `${x}px`;
  }
  storageSet('zoom', x);
}

function runAppSetting () {
  const resize = storageGet('resize');
  // console.log(left.getBoundingClientRect().width)
  if (resize) {
    left&&(left.style.width = resize + "px");
    setResize(resize);
  }
  const zoom = storageGet('zoom');
  if (zoom) {
    setZoom(zoom);
  }
}

function checkedRadioByName(rName) {
  var radioButtons = document.getElementsByName(rName);
  for (var i = 0; i < radioButtons.length; i++) {
    if (radioButtons[i].checked) return radioButtons[i].value;
  }
  return '';
}

function camelCaseToDash(str) {
  return str
            .replace(/[^a-zA-Z0-9]+/g, '-')
            .replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2')
            .replace(/([a-z])([A-Z])/g, '$1-$2')
            .replace(/([0-9])([^0-9])/g, '$1-$2')
            .replace(/([^0-9])([0-9])/g, '$1-$2')
            .replace(/-+/g, '-')
            .toLowerCase();
}

function utils_randomInt( max = 1000 ){
    return Math.floor(Math.random() * max) + 1;
}

function utils_show_obj(obj, output_target) {
  Object.entries(obj).forEach(([key, value]) => {
    output_target.innerHTML+=key+" : "+value+"<br>";
    if(typeof value == "object") {
      Object.entries(value).forEach(([k, v]) => {
        output_target.innerHTML+=k+" : "+v+"<br>";
        if(typeof v == "object") {
          Object.entries(v).forEach(([kk, vv]) => {
            output_target.innerHTML+=kk+" : "+vv+"<br>";
          });
        }
      });
    }
  });
}

window.onload = function () {
  runAppSetting()

  const el = document.getElementById('main_page_link');
  if (el) {
    if ( window.location !== window.parent.location ) {
      // The page is in an iFrames
    }
    else {
      // The page is not in an iFrame
      el.style.display = 'inline-block';
    }
  }
}


