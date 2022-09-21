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

function addMilestonesStyles() {
  addGlobalStyle(`
    .milestone-description-html {
      font-size: 12px;
    }
    .milestone-description-html :empty {
      display: none;
    }
    .milestone-description-plaintext p,
    .milestone-description-html p {
      margin: 0;
    }
    .milestone-description-html ul {
      margin: 0;
    }
  `);
}

function getMilestones() {
  const milestonesElement = document.querySelector('.table-list-milestones');
  const milestones = [...milestonesElement.children].map((milestoneElement) => {
    const title = milestoneElement
      .querySelector('.milestone-title-link')
      .textContent.trim();
    const dateElement = milestoneElement.querySelector(
      '.milestone-meta :first-child'
    );
    const dateText = dateElement.children[0]?.hasAttribute('title')
      ? dateElement.children[0].title
      : dateElement.textContent.trim().replace('Due by ', '');
    return { title, date: new Date(dateText) };
  });
  return milestones;
}

function addMilestonesTimeline() {
  const milestones = getMilestones();
  console.log(JSON.stringify(milestones));
}

addMilestonesStyles();
addMilestonesTimeline();
