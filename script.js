const form = document.getElementById('claim-helper');
const input = document.getElementById('incident-description');
const resultsSection = document.getElementById('results');
const resultsList = resultsSection.querySelector('.results__list');
const placeholder = resultsSection.querySelector('.placeholder');

const coverageMatchers = [
  { key: 'liability', matcher: /liability|third-?party/i },
  { key: 'collision', matcher: /collision/i },
  { key: 'comprehensive', matcher: /comprehensive|theft|weather|animal/i },
  { key: 'pip', matcher: /personal injury protection|pip|medical payments|med-?pay/i },
  { key: 'uninsured', matcher: /uninsured|underinsured/i },
  { key: 'rideshare', matcher: /rideshare|uber|lyft/i }
];

const accidentMatchers = [
  { key: 'injury', matcher: /injur|hurt|hospital|ambulance|medical/i },
  { key: 'property', matcher: /damage|dent|bumper|fender|totaled|totalled/i },
  { key: 'multiVehicle', matcher: /other driver|another car|rear[- ]?end|intersection|t-bone|multi|pileup|two car|three car/i },
  { key: 'singleVehicle', matcher: /single|slid|deer|animal|tree|pole|black ice|ran off|rollover/i },
  { key: 'theft', matcher: /stolen|break[- ]?in|vandalism/i },
  { key: 'bike', matcher: /bike|bicycle|cyclist/i },
  { key: 'pedestrian', matcher: /pedestrian|walker|crosswalk/i }
];

const guidance = {
  base: [
    {
      title: 'Document the accident',
      detail:
        'Take clear photos of vehicles, property, road conditions, and any visible injuries. Collect names, contact information, and insurance details from all parties involved.'
    },
    {
      title: 'File an official report',
      detail:
        'If law enforcement arrived, request the report number. Otherwise, file one with local authorities or the DMV if required in your state.'
    },
    {
      title: 'Contact your insurance provider',
      detail:
        'Notify your insurer as soon as possible. Share the incident details, other party information, and any documentation you gathered.'
    }
  ],
  liability: [
    {
      title: 'Clarify coverage scope',
      detail:
        'Liability coverage generally pays for damage or injuries you cause to others. Ask your insurer what is covered and what out-of-pocket costs to expect.'
    },
    {
      title: 'Coordinate with the other driver',
      detail:
        'Share your claim number with the other party so their repairs or medical bills can be processed promptly.'
    }
  ],
  collision: [
    {
      title: 'Schedule a vehicle inspection',
      detail:
        'Collision coverage can pay for damage to your vehicle. Ask about preferred repair shops or whether you can choose your own.'
    },
    {
      title: 'Review your deductible',
      detail:
        'Confirm the deductible amount you must pay before insurance covers the remaining repair costs.'
    }
  ],
  comprehensive: [
    {
      title: 'Provide evidence of non-collision damage',
      detail:
        'Share photos or police reports that show theft, vandalism, weather damage, or animal strikes to support your comprehensive claim.'
    }
  ],
  pip: [
    {
      title: 'Track medical treatment',
      detail:
        'Personal injury protection or medical payments coverage can reimburse medical bills and lost wages. Save receipts and doctor statements.'
    }
  ],
  uninsured: [
    {
      title: 'Ask about uninsured motorist benefits',
      detail:
        'If the other driver lacks insurance, your uninsured/underinsured coverage may handle repairs and medical expenses. Provide any evidence you have that the other driver was uninsured.'
    }
  ],
  rideshare: [
    {
      title: 'Confirm rideshare status',
      detail:
        'If you were driving for a rideshare company, confirm whether you were logged into the app and whether a trip was active. Coverage levels change based on your status.'
    }
  ],
  injury: [
    {
      title: 'Seek medical evaluation',
      detail:
        'Even minor symptoms can worsen later. Visit a doctor promptly and keep records of diagnoses, treatment plans, and expenses.'
    },
    {
      title: 'Consider legal advice',
      detail:
        'If injuries are serious or liability is disputed, consult a personal injury attorney to understand your rights.'
    }
  ],
  property: [
    {
      title: 'Get repair estimates',
      detail:
        'Collect quotes from repair shops or contractors for damaged property to support your claim amount.'
    }
  ],
  multiVehicle: [
    {
      title: 'Exchange detailed information',
      detail:
        'Multiple vehicles increase complexity. Confirm contact and insurance information for each driver and provide a clear incident narrative to your insurer.'
    }
  ],
  singleVehicle: [
    {
      title: 'Explain contributing factors',
      detail:
        'If weather, animals, or road conditions caused the crash, document it thoroughly to show the damage was unavoidable.'
    }
  ],
  theft: [
    {
      title: 'Submit supporting documents',
      detail:
        'Provide police reports, surveillance footage, or witness statements to prove theft or vandalism.'
    }
  ],
  bike: [
    {
      title: 'Check personal coverage options',
      detail:
        'Cyclists may file under auto PIP, health insurance, or the driver’s liability policy. Ask each insurer how to coordinate benefits.'
    }
  ],
  pedestrian: [
    {
      title: 'Identify available liability coverage',
      detail:
        'Pedestrians injured by vehicles can typically claim against the driver’s liability policy and may also use PIP or medical payments coverage if available.'
    }
  ]
};

function findMatches(description, matchers) {
  return matchers.filter(({ matcher }) => matcher.test(description)).map(({ key }) => key);
}

function buildResults(description) {
  const normalized = description.trim();
  if (!normalized) {
    return [];
  }

  const matches = new Set([
    ...findMatches(normalized, coverageMatchers),
    ...findMatches(normalized, accidentMatchers)
  ]);

  const items = [...guidance.base];
  matches.forEach((key) => {
    guidance[key]?.forEach((step) => items.push(step));
  });

  return items;
}

function renderResults(results) {
  if (!results.length) {
    resultsList.hidden = true;
    placeholder.hidden = false;
    resultsList.replaceChildren();
    return;
  }

  placeholder.hidden = true;
  resultsList.hidden = false;
  resultsList.replaceChildren(
    ...results.map(({ title, detail }) => {
      const article = document.createElement('article');
      article.className = 'results__item';
      article.innerHTML = `<h3>${title}</h3><p>${detail}</p>`;
      return article;
    })
  );
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const description = input.value;
  const steps = buildResults(description);
  renderResults(steps);
});

input.addEventListener('input', () => {
  if (!input.value.trim()) {
    renderResults([]);
  }
});
