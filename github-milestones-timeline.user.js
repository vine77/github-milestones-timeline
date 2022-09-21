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
    .milestones-timeline {
      height: 40px;
      margin: 20px 40px;
      position: relative;
    }
    .milestones-timeline-line {
      background: #afb8c1;
      height: 2px;
      left: 0;
      transform: translateY(-50%);
      position: absolute;
      right: 0;
      top: 50%;
    }
    .milestones-timeline-milestone {
      position: absolute;
      top: 50%;
      transform: translateY(-50%) translateX(-7px);
      background: white;
      height: 10px;
      width: 10px;
      border-radius: 50%;
      border: 2px solid #afb8c1;

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

  return milestones.sort((a, b) => a.date - b.date);
}

function addMilestonesTimeline() {
  const milestones = getMilestones();
  if (milestones.length < 2) return;

  const tableHeaderElement = document.querySelector('.table-list-header');
  const timelineElement = document.createElement('div');
  timelineElement.classList.add('milestones-timeline');
  const lineElement = document.createElement('div');
  lineElement.classList.add('milestones-timeline-line');
  timelineElement.appendChild(lineElement);
  milestones.forEach((milestone) => {
    const milestoneElement = document.createElement('div');
    milestoneElement.classList.add('milestones-timeline-milestone');
    milestoneElement.style.left = `${
      ((milestone.date - milestones[0].date) /
        (milestones[milestones.length - 1].date - milestones[0].date)) *
      100
    }%`;
    // milestoneElement.textContent = milestone.title;
    timelineElement.appendChild(milestoneElement);
  });

  tableHeaderElement.parentElement.insertBefore(
    timelineElement,
    tableHeaderElement
  );
}

addMilestonesStyles();
addMilestonesTimeline();
