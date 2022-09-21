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
      position: absolute;
      right: 0;
      top: 50%;
      transform: translateY(-50%);
    }
    .milestones-timeline-milestone {
      background: white;
      border-radius: 50%;
      border: 2px solid #afb8c1;
      height: 10px;
      position: absolute;
      top: 50%;
      transform: translateY(-50%) translateX(-7px);
      width: 10px;
    }
    .milestones-timeline-milestone-now {
      background: #1a7f37;
      border: transparent;
      height: 7px;
      width: 7px;
      z-index: 1;
    }
    .milestones-timeline-milestone-date {
      font-size: 12px;
      left: 50%;
      position: absolute;
      top: 8px;
      transform: translateX(-50%);
      white-space: nowrap;
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
  milestones.push({
    date: new Date(),
    title: 'Now',
    type: 'now',
  });

  return milestones.sort((a, b) => a.date - b.date);
}

function getShortDate(date) {
  return !date
    ? date
    : new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
      }).format(date);
}

function getISODate(date) {
  return !date
    ? date
    : date.toISOString().substring(0, date.toISOString().indexOf('T'));
}

function onHistoryUpdated(callback) {
  let previousUrl = '';
  const observer = new MutationObserver(function (mutations) {
    if (location.href !== previousUrl) {
      if (previousUrl) callback(location);
      previousUrl = location.href;
    }
  });
  observer.observe(document, { subtree: true, childList: true });
}
onHistoryUpdated(() => setTimeout((location) => addMilestonesTimeline(), 10));

function addMilestonesTimeline() {
  const milestones = getMilestones();
  if (milestones.length < 2) return;
  if (document.querySelector('.milestones-timeline')) {
    document.querySelector('.milestones-timeline').remove();
  }

  const tableHeaderElement = document.querySelector('.table-list-header');
  const timelineElement = document.createElement('div');
  timelineElement.classList.add('milestones-timeline');

  const lineElement = document.createElement('div');
  lineElement.classList.add('milestones-timeline-line');
  timelineElement.appendChild(lineElement);

  milestones.forEach((milestone, i) => {
    const isDuplicateDate =
      getShortDate(milestones[i - 1]?.date) === getShortDate(milestone.date);
    let milestoneElement;

    if (isDuplicateDate) {
      milestoneElement = timelineElement.querySelector(
        `.milestones-timeline-milestone[datetime="${getISODate(
          milestone.date
        )}"]`
      );
    } else {
      // Add dot for milestone
      milestoneElement = document.createElement('div');
      milestoneElement.classList.add('milestones-timeline-milestone');
      milestoneElement.setAttribute('datetime', getISODate(milestone.date));
      milestoneElement.style.left = `${
        ((milestone.date - milestones[0].date) /
          (milestones[milestones.length - 1].date - milestones[0].date)) *
        100
      }%`;
      timelineElement.appendChild(milestoneElement);

      if (milestone.type === 'now') {
        milestoneElement.classList.add('milestones-timeline-milestone-now');
      } else {
        // Add milestone date
        dateElement = document.createElement('span');
        dateElement.classList.add('milestones-timeline-milestone-date');
        dateElement.textContent = getShortDate(milestone.date);
        milestoneElement.appendChild(dateElement);
      }
    }
  });

  tableHeaderElement.parentElement.insertBefore(
    timelineElement,
    tableHeaderElement
  );
}

addMilestonesStyles();
addMilestonesTimeline();
