const form = document.getElementById('claim-helper');
const input = document.getElementById('incident-description');
const resultsSection = document.getElementById('results');
const resultsList = resultsSection.querySelector('.results__list');
const contactsPanel = resultsSection.querySelector('.results__contacts');
const resourcesPanel = resultsSection.querySelector('.results__resources');
const placeholder = resultsSection.querySelector('.placeholder');
const statusMessage = resultsSection.querySelector('.status-message');

const dataUrl = 'data/guidance.json';
let guidanceDataPromise = null;

const coverageMatchers = [
  { key: 'liability', matcher: /liability|third-?party/i },
  { key: 'collision', matcher: /collision/i },
  { key: 'comprehensive', matcher: /comprehensive|theft|weather|animal/i },
  { key: 'pip', matcher: /personal injury protection|pip|no[- ]?fault/i },
  { key: 'medpay', matcher: /medical payments|med-?pay/i },
  { key: 'uninsured', matcher: /uninsured|underinsured/i },
  { key: 'rideshare', matcher: /rideshare|uber|lyft/i }
];

const incidentMatchers = [
  { key: 'injury', matcher: /injur|hurt|hospital|ambulance|medical/i },
  { key: 'property', matcher: /damage|dent|bumper|fender|totaled|totalled/i },
  { key: 'multiVehicle', matcher: /other driver|another car|rear[- ]?end|intersection|t-bone|multi|pileup|two car|three car/i },
  { key: 'singleVehicle', matcher: /single|slid|deer|animal|tree|pole|black ice|ran off|rollover/i },
  { key: 'theft', matcher: /stolen|break[- ]?in|vandalism/i },
  { key: 'bike', matcher: /bike|bicycle|cyclist/i },
  { key: 'pedestrian', matcher: /pedestrian|walker|crosswalk/i }
];

function loadGuidanceData() {
  if (!guidanceDataPromise) {
    guidanceDataPromise = fetch(dataUrl)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Unable to load guidance data: ${response.status}`);
        }
        return response.json();
      })
      .catch((error) => {
        guidanceDataPromise = null;
        throw error;
      });
  }
  return guidanceDataPromise;
}

function findMatches(description, matchers) {
  return matchers
    .filter(({ matcher }) => matcher.test(description))
    .map(({ key }) => key);
}

function buildSteps(description, data) {
  const normalized = description.trim();
  if (!normalized) {
    return [];
  }

  const matches = new Set([
    ...findMatches(normalized, coverageMatchers),
    ...findMatches(normalized, incidentMatchers)
  ]);

  const items = [...(data.baseSteps ?? [])];

  matches.forEach((key) => {
    if (data.coverageGuidance?.[key]) {
      data.coverageGuidance[key].forEach((step) => items.push(step));
    }
    if (data.incidentGuidance?.[key]) {
      data.incidentGuidance[key].forEach((step) => items.push(step));
    }
  });

  return items;
}

function detectInsurers(description, insurers = []) {
  const normalized = description.toLowerCase();
  return insurers.filter((insurer) =>
    insurer.keywords?.some((keyword) => normalized.includes(keyword.toLowerCase()))
  );
}

function renderSteps(steps) {
  if (!steps.length) {
    resultsList.hidden = true;
    resultsList.replaceChildren();
    return;
  }

  resultsList.hidden = false;
  resultsList.replaceChildren(
    ...steps.map(({ title, detail }) => {
      const article = document.createElement('article');
      article.className = 'results__item';
      article.innerHTML = `<h3>${title}</h3><p>${detail}</p>`;
      return article;
    })
  );
}

function renderInsurers(insurers) {
  if (!insurers.length) {
    contactsPanel.hidden = true;
    contactsPanel.replaceChildren();
    return;
  }

  contactsPanel.hidden = false;
  const heading = document.createElement('h3');
  heading.textContent = 'Insurer contacts mentioned in your description';

  const cards = insurers.map((insurer) => {
    const card = document.createElement('article');
    card.className = 'contact-card';
    card.innerHTML = `
      <h4>${insurer.name}</h4>
      <dl>
        <div><dt>Claims phone</dt><dd><a href="tel:${insurer.phone.replace(/[^+\d]/g, '')}">${insurer.phone}</a></dd></div>
        <div><dt>File online</dt><dd><a href="${insurer.claimsUrl}" target="_blank" rel="noopener">${insurer.claimsUrl}</a></dd></div>
        <div><dt>Availability</dt><dd>${insurer.hours}</dd></div>
      </dl>
      <p>${insurer.notes}</p>
    `;
    return card;
  });

  contactsPanel.replaceChildren(heading, ...cards);
}

function renderResources(checklist) {
  if (!checklist?.items?.length) {
    resourcesPanel.hidden = true;
    resourcesPanel.replaceChildren();
    return;
  }

  resourcesPanel.hidden = false;
  const heading = document.createElement('h3');
  heading.textContent = checklist.title ?? 'Helpful documents';

  const list = document.createElement('ul');
  list.className = 'resource-list';
  checklist.items.forEach((item) => {
    const li = document.createElement('li');
    li.textContent = item;
    list.appendChild(li);
  });

  resourcesPanel.replaceChildren(heading, list);
}

function showStatus(message, isError = false) {
  if (!statusMessage) return;
  statusMessage.hidden = !message;
  statusMessage.textContent = message ?? '';
  statusMessage.classList.toggle('status-message--error', Boolean(isError));
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const description = input.value.trim();

  if (!description) {
    placeholder.hidden = false;
    renderSteps([]);
    renderInsurers([]);
    renderResources(null);
    showStatus('Please describe the accident to receive guidance.', false);
    return;
  }

  showStatus('Looking up guidance…');

  try {
    const data = await loadGuidanceData();
    const steps = buildSteps(description, data);
    const insurers = detectInsurers(description, data.insurers);

    placeholder.hidden = true;
    renderSteps(steps);
    renderInsurers(insurers);
    renderResources(data.documentChecklist);

    if (!insurers.length) {
      showStatus('No insurer names detected. Include your carrier for contact details.', false);
    } else {
      showStatus('', false);
    }
  } catch (error) {
    console.error(error);
    renderSteps([]);
    renderInsurers([]);
    renderResources(null);
    placeholder.hidden = false;
    showStatus('We could not load guidance data. Please refresh and try again.', true);
  }
});

loadGuidanceData().catch((error) => {
  console.error(error);
  showStatus('Guidance data failed to load. Try again in a moment.', true);
});
