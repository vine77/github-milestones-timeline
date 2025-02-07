// ==UserScript==
// @name        GitHub Milestones Timeline
// @match       https://github.com/*
// @version     1.1.0
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
      margin: 200px 70px 20px 40px;
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
      transform: translateY(-50%) translateX(-50%);
      width: 10px;
    }
    .milestones-timeline-milestone-now {
      background: #1a7f37;
      border: transparent;
      height: 7px;
      width: 7px;
    }
    .milestones-timeline-milestone-date {
      font-size: 12px;
      left: 50%;
      position: absolute;
      top: 10px;
      transform: translateX(-50%);
      white-space: nowrap;
    }
    .milestones-timeline-milestone-description {
      font-size: 12px;
      left: 50%;
      position: absolute;
      bottom: 10px;
      transform-origin: bottom left;
      transform: rotate(-45deg);

    }
    .milestones-timeline-milestone-title {
      max-width: 260px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  `);
}

function getMilestones() {
  const milestonesElement = document.querySelector('.table-list-milestones');
  if (!milestonesElement) throw new Error('No milestones element found');
  const milestones = [...milestonesElement.children].map((milestoneElement) => {
    const title = milestoneElement
      .querySelector('.milestone-title-link')
      .textContent.trim();
    const dateElement = milestoneElement.querySelector(
      '.milestone-meta :first-child'
    );
    const dateText = dateElement.children[0]?.hasAttribute('title')
      // Past due
      ? dateElement.children[0].title
      // Due by
      : dateElement.textContent.trim().includes('Due by')
        ? dateElement.textContent.trim().replace('Due by ', '')
        // No date
        : null;
    return { title, date: dateText ? new Date(dateText) : null };
  });

  return milestones.filter((m) => m.date).sort((a, b) => a.date - b.date);
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

function addMilestonesTimeline() {
  const url = new URL(location.href);
  if (!url.pathname.endsWith('/milestones')) return;

  const milestones = getMilestones();
  const currentDate = new Date();
  const milestonesAndNow = [
    ...milestones,
    { date: currentDate, type: 'now' },
  ].sort((a, b) => a.date - b.date);
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
      milestoneElement.style.left = `${Math.round(
        ((milestone.date - milestonesAndNow[0].date) /
          (milestonesAndNow[milestonesAndNow.length - 1].date -
            milestonesAndNow[0].date)) *
          100
      )}%`;
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

    // Add milestone title
    let descriptionElement;
    if (isDuplicateDate) {
      descriptionElement = milestoneElement.querySelector(
        '.milestones-timeline-milestone-description'
      );
    } else {
      descriptionElement = document.createElement('div');
      descriptionElement.classList.add(
        'milestones-timeline-milestone-description'
      );
      milestoneElement.appendChild(descriptionElement);
    }
    const titleElement = document.createElement('div');
    titleElement.classList.add('milestones-timeline-milestone-title');
    titleElement.textContent = milestone.title;
    descriptionElement.appendChild(titleElement);
  });

  // Add dot for current date
  nowElement = document.createElement('div');
  nowElement.classList.add('milestones-timeline-milestone');
  nowElement.classList.add('milestones-timeline-milestone-now');
  nowElement.setAttribute('datetime', getISODate(currentDate));
  nowElement.style.left = `${
    ((currentDate - milestonesAndNow[0].date) /
      (milestonesAndNow[milestonesAndNow.length - 1].date -
        milestonesAndNow[0].date)) *
    100
  }%`;
  timelineElement.appendChild(nowElement);

  tableHeaderElement.parentElement.insertBefore(
    timelineElement,
    tableHeaderElement
  );
}

// Redirect to sort by due date ascending
function defaultToClosestDueDate() {
  const url = new URL(location.href);
  if (!url.pathname.endsWith('/milestones')) return false;
  if (!url.search) {
    url.search = '?direction=asc&sort=due_date&state=open';
    location.href = url.href;
    return true;
  } else {
    return false;
  }
}
defaultToClosestDueDate();

let previousUrl = '';
new MutationObserver(function (mutations) {
  // Monitor for URL changes
  if (location.href !== previousUrl) {
    if (previousUrl) {
      // Redirect to sort by due date ascending
      const willRedirect = defaultToClosestDueDate();
      // Don't add timeline if we're redirecting
      if (willRedirect) return;
    }
    previousUrl = location.href;
  }

  // Monitor for addition of milestones table
  mutations.forEach((mutation) => {
    if (mutation.type === 'childList') {
      mutation.addedNodes.forEach((node) => {
        if (node.classList?.contains('table-list-milestones')) {
          // Add milestones timeline (with milestones data from the table)
          addMilestonesTimeline();
        }
      });
    }
  });
}).observe(document, { subtree: true, childList: true });

addMilestonesStyles();
