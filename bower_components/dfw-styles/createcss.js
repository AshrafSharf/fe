var fs = require('fs');
var text = fs.readFileSync("icons.json", "utf8");
var iconArr = JSON.parse(text);
var cssOut = buildIconCss(iconArr);

var polyOut = buildPolymerStyles(cssOut);
fs.writeFileSync("dfw-icons.css", cssOut, 'utf8');
fs.writeFileSync("dfw-icon-styles.html",polyOut, 'utf8');

function buildPolymerStyles(css) {
  var icons = _fileTop();
  icons += css;
  icons += _fileBottom();
  return icons;
}

function buildIconCss(iconArr) {
  var icons = _forSizing();

  iconArr.forEach(function(obj) {
    icons += _forSvg(obj.name);
    if (obj.hover) {
      icons += _forHoverSvg(obj.name);
    }
    if (obj.disable) {
      icons += _forDisableSvg(obj.name);
    }
    for (var size = 16; size < 65; size+=16) {
      if (size != 48) {
        icons += _forPng(obj.name,size);
        if (obj.hover) {
          icons += _forHoverPng(obj.name,size);
        }
        if (obj.disable) {
          icons += _forDisablePng(obj.name, size);
        }
      }
    }
  });
  return icons;
}

function _fileBottom() {
  return "\t\t</style>\n\t</template>\n</dom-module>";
}
function _fileTop() {
  return '<link rel="import" href="../polymer/polymer.html">\n<dom-module id="dfw-icon-styles">\n\t<template>\n\t\t<style is="custom-style">\n';


}
function _aSize(size) {
  var out = ".dfw-" + size + " {\n";
  out += "\twidth: " + size + "px;\n";
  out += "\theight: " + size + "px;\n";
  out += "}\n";
  return out;
}
function _forSizing () {
  var out = _aSize(16);
  out += _aSize(24);
  out += _aSize(32);
  out += _aSize(64);
  return out;
}
function _forHoverPng (name, size) {
  var preCss = ".dfw-";
  var postCss = "-hover-icon-";
  var image = "\tbackground: url(images/icon-" + name + "-hover-" + size + "x" + size + ".png) no-repeat 0 0;\n";
  var className = preCss + name + postCss + size;
  var otherClassName = preCss + name + "-icon-" + size;
  var out = className + ", " + otherClassName + ":hover {\n";
  out += "\theight: " + size + "px;\n";
  out += "\twidth: " + size + "px;\n";
  out += "\tdisplay: inline-block;\n";
  out += "\tmargin: 3px;\n";
  out += image;
  out += "}\n";
  return out;
}
function _forPng (name, size) {
  var preCss = ".dfw-";
  var postCss = "-icon-";
  var image = "\tbackground: url(images/icon-" + name + "-" + size + "x" + size + ".png) no-repeat 0 0;\n";
  var out = preCss + name + postCss + size + " {\n";
  out += "\theight: " + size + "px;\n";
  out += "\twidth: " + size + "px;\n";
  out += "\tdisplay: inline-block;\n";
  out += "\tmargin: 3px;\n";
  out += image;
  out += "}\n";
  return out;
}
function _forDisablePng (name, size) {
  var preCss = ".dfw-";
  var postCss = "-disable-icon-";
  var image = "\tbackground: url(images/icon-" + name + "-disable-" + size + "x" + size + ".png) no-repeat 0 0;\n";
  var out = preCss + name + postCss + size + " {\n";
  out += "\theight: " + size + "px;\n";
  out += "\twidth: " + size + "px;\n";
  out += "\tdisplay: inline-block;\n";
  out += "\tmargin: 3px;\n";
  out += image;
  out += "}\n";
  return out;
}
function _forSvg(name) {
  var preCss = ".dfw-";

  var image1 = "\tbackground: url(images/icon-" + name + "-" + "32x32.png) no-repeat 0 0;\n";
  var image2 = "\tbackground: url(images/icon-" + name + ".svg) no-repeat 0 0;\n";
  var out = preCss + name + "-icon {\n";
  out += "\tdisplay: inline-block;\n";
  out += "\tmargin: 3px;\n";
  out += image1;
  out += image2;
  out += "}\n";
  return out;
}
function _forDisableSvg (name) {
  var preCss = ".dfw-";

  var image1 = "\tbackground: url(images/icon-" + name + "-disable-" + "32x32.png) no-repeat 0 0;\n";
  var image2 = "\tbackground: url(images/icon-" + name + "-disable.svg) no-repeat 0 0;\n";
  var out = preCss + name + "-disable-icon {\n";
  out += "\tdisplay: inline-block;\n";
  out += "\tmargin: 3px;\n";
  out += image1;
  out += image2;
  out += "}\n";
  return out;
}
function _forHoverSvg (name) {
  var preCss = ".dfw-";
  var className = preCss + name + "-hover-icon";
  var otherClassName = preCss + name + "-icon";
  var out = className + ", " + otherClassName + ":hover {\n";
  var image1 = "\tbackground: url(images/icon-" + name + "-hover-" + "32x32.png) no-repeat 0 0;\n";
  var image2 = "\tbackground: url(images/icon-" + name + "-hover.svg) no-repeat 0 0;\n";
  //var out = preCss + name + "-hover-icon {\n";
  out += "\tdisplay: inline-block;\n";
  out += "\tmargin: 3px;\n";
  out += image1;
  out += image2;
  out += "}\n";
  return out;
}
