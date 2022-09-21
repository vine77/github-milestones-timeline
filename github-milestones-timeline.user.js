// ==UserScript==
// @name        GitHub Milestones Timeline
// @match       https://github.com/*/*/milestones
// @version     1.0
// @description Adds a graphical timeline to GitHub Milestones
// @author      Nathan Ward
// @icon        https://www.google.com/s2/favicons?sz=64&domain=github.com
// ==/UserScript==

function addGlobalStyle(css) {
  var head, style;
  head = document.getElementsByTagName('head')[0];
  if (!head) {
    return;
  }
  style = document.createElement('style');
  style.type = 'text/css';
  style.innerHTML = css;
  head.appendChild(style);
}

function addMilestonesStyles() {}

function addMilestonesTimeline() {}

addMilestonesStyles();
addMilestonesTimeline();
