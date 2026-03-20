/* ══════════════════════════════════════════════════════════════
   HomeBase — script.js
   All app logic. localStorage-backed. Supabase-ready hooks marked.
══════════════════════════════════════════════════════════════ */
'use strict';

// ─────────────────────────────────────────────
//  CONSTANTS
// ─────────────────────────────────────────────
const COLORS = [
  '#ff6b6b','#4ecdc4','#ffd93d','#6c63ff',
  '#ff9f43','#a29bfe','#55efc4','#fd79a8',
  '#74b9ff','#e17055','#00cec9','#fdcb6e',
];

const DAYS_S = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const DAYS_L = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

// ─────────────────────────────────────────────
//  CHORE TEMPLATE LIBRARY
//  Each template has a base list + optional add-on packs
// ─────────────────────────────────────────────
const CHORE_TEMPLATES = {

  blank: {
    label: 'Start Fresh',
    icon: '✨',
    desc: 'Blank slate. You build it from scratch.',
    chores: [],
  },

  standard: {
    label: 'Standard Home',
    icon: '🏠',
    desc: 'Dishes, floors, trash, laundry — the essentials.',
    chores: [
      { name:'Unload Dishwasher',  icon:'🍽️', effort:1, recurring:'daily',    time:'morning',  type:'dishes'  },
      { name:'Load Dishwasher',    icon:'🍽️', effort:1, recurring:'daily',    time:'night',    type:'dishes'  },
      { name:'Take Out Trash',     icon:'🗑️', effort:2, recurring:'weekly',   time:'morning',  type:'trash'   },
      { name:'Recycling',          icon:'♻️', effort:2, recurring:'biweekly', time:'morning',  type:'trash'   },
      { name:'Sweep House',        icon:'🧹', effort:3, recurring:'weekly',   time:'flexible', type:'sweep'   },
      { name:'Vacuum',             icon:'🔌', effort:3, recurring:'weekly',   time:'flexible', type:'vacuum'  },
      { name:'Mop Floors',         icon:'🧹', effort:4, recurring:'biweekly', time:'flexible', type:'mop'     },
      { name:'Clean Bathroom',     icon:'🚿', effort:4, recurring:'monthly',  time:'flexible', type:'bathroom'},
      { name:'Wipe Counters',      icon:'🧽', effort:1, recurring:'daily',    time:'evening',  type:'kitchen' },
      { name:'Clean Mirrors',      icon:'🪟', effort:2, recurring:'biweekly', time:'flexible', type:'mirrors' },
      { name:'Dust Surfaces',      icon:'🪣', effort:2, recurring:'monthly',  time:'flexible', type:'dusting' },
      { name:'Grocery Run',        icon:'🛒', effort:3, recurring:'weekly',   time:'afternoon',type:'groceries'},
    ],
  },

  roommates: {
    label: 'Roommates',
    icon: '🏢',
    desc: 'Shared apartment — common areas, kitchen duty rotation.',
    chores: [
      { name:'Kitchen Cleanup',    icon:'🍳', effort:2, recurring:'daily',    time:'evening',  type:'kitchen' },
      { name:'Wipe Counters',      icon:'🧽', effort:1, recurring:'daily',    time:'evening',  type:'kitchen' },
      { name:'Take Out Trash',     icon:'🗑️', effort:2, recurring:'weekly',   time:'morning',  type:'trash'   },
      { name:'Vacuum Common Area', icon:'🔌', effort:3, recurring:'weekly',   time:'flexible', type:'vacuum'  },
      { name:'Mop Kitchen',        icon:'🧹', effort:3, recurring:'biweekly', time:'flexible', type:'mop'     },
      { name:'Clean Shared Bathroom',icon:'🚿',effort:4,recurring:'weekly',   time:'flexible', type:'bathroom'},
      { name:'Restock Toilet Paper',icon:'🧻', effort:1, recurring:'weekly',  time:'flexible', type:'supplies'},
      { name:'Unload Dishwasher',  icon:'🍽️', effort:1, recurring:'daily',   time:'morning',  type:'dishes'  },
      { name:'Clean Fridge',       icon:'❄️', effort:3, recurring:'monthly',  time:'flexible', type:'kitchen' },
    ],
  },

  family: {
    label: 'Family Home',
    icon: '👨‍👩‍👧',
    desc: 'Kids, school days, heavier load — with age-aware rules.',
    chores: [
      { name:'Unload Dishwasher',  icon:'🍽️', effort:1, recurring:'daily',    time:'morning',  type:'dishes'  },
      { name:'Load Dishwasher',    icon:'🍽️', effort:1, recurring:'daily',    time:'night',    type:'dishes'  },
      { name:'Make Beds',          icon:'🛏️', effort:1, recurring:'daily',    time:'morning',  type:'bedroom' },
      { name:'Take Out Trash',     icon:'🗑️', effort:2, recurring:'weekly',   time:'morning',  type:'trash'   },
      { name:'Recycling',          icon:'♻️', effort:2, recurring:'biweekly', time:'morning',  type:'trash'   },
      { name:'Sweep House',        icon:'🧹', effort:3, recurring:'weekly',   time:'flexible', type:'sweep'   },
      { name:'Vacuum',             icon:'🔌', effort:3, recurring:'weekly',   time:'flexible', type:'vacuum'  },
      { name:'Mop Floors',         icon:'🧹', effort:4, recurring:'biweekly', time:'flexible', type:'mop'     },
      { name:'Fold Laundry',       icon:'👕', effort:2, recurring:'weekly',   time:'flexible', type:'laundry' },
      { name:'Wipe Counters',      icon:'🧽', effort:1, recurring:'daily',    time:'evening',  type:'kitchen' },
      { name:'Clean Bathroom',     icon:'🚿', effort:4, recurring:'monthly',  time:'flexible', type:'bathroom'},
      { name:'Grocery Run',        icon:'🛒', effort:3, recurring:'weekly',   time:'afternoon',type:'groceries'},
    ],
  },
};

// ── ADD-ON PACKS (appended on top of any base template) ──
const ADDON_PACKS = {
  dog: {
    label: 'Dog',
    icon: '🐕',
    chores: [
      { name:'Morning Dog Walk',   icon:'🐕', effort:2, recurring:'daily',    time:'morning',  type:'dog-walk'},
      { name:'Evening Dog Walk',   icon:'🐕', effort:2, recurring:'daily',    time:'evening',  type:'dog-walk'},
      { name:'Feed Dog',           icon:'🦴', effort:1, recurring:'daily',    time:'morning',  type:'pet-care'},
      { name:'Yard Poop Cleanup',  icon:'💩', effort:2, recurring:'biweekly', time:'flexible', type:'poop'   },
      { name:'Dog Bath',           icon:'🛁', effort:3, recurring:'monthly',  time:'flexible', type:'pet-care'},
    ],
  },
  cat: {
    label: 'Cat',
    icon: '🐈',
    chores: [
      { name:'Clean Litter Box',   icon:'🐈', effort:2, recurring:'daily',    time:'morning',  type:'pet-care'},
      { name:'Feed Cat',           icon:'🐟', effort:1, recurring:'daily',    time:'morning',  type:'pet-care'},
      { name:'Refill Water Bowl',  icon:'💧', effort:1, recurring:'daily',    time:'evening',  type:'pet-care'},
    ],
  },
  otherpet: {
    label: 'Other Pet',
    icon: '🐾',
    chores: [
      { name:'Feed Pet',           icon:'🐾', effort:1, recurring:'daily',    time:'morning',  type:'pet-care'},
      { name:'Clean Enclosure',    icon:'🧹', effort:3, recurring:'weekly',   time:'flexible', type:'pet-care'},
      { name:'Vet/Supply Errand',  icon:'🏥', effort:2, recurring:'monthly',  time:'flexible', type:'pet-care'},
    ],
  },
  backyard: {
    label: 'Backyard',
    icon: '🌿',
    chores: [
      { name:'Mow Lawn',           icon:'🌿', effort:4, recurring:'weekly',   time:'morning',  type:'outdoor'},
      { name:'Water Plants',       icon:'🪴', effort:1, recurring:'daily',    time:'morning',  type:'outdoor'},
      { name:'Weed Garden',        icon:'🌱', effort:3, recurring:'weekly',   time:'morning',  type:'outdoor'},
      { name:'Rake Leaves',        icon:'🍂', effort:3, recurring:'monthly',  time:'morning',  type:'outdoor'},
      { name:'Clean Outdoor Furniture',icon:'🪑',effort:2,recurring:'monthly',time:'flexible',type:'outdoor'},
    ],
  },
  car: {
    label: 'Car',
    icon: '🚗',
    chores: [
      { name:'Wash Car',           icon:'🚗', effort:3, recurring:'monthly',  time:'flexible', type:'car'},
      { name:'Vacuum Car Interior',icon:'🔌', effort:2, recurring:'monthly',  time:'flexible', type:'car'},
      { name:'Check Tyre Pressure',icon:'🔧', effort:1, recurring:'monthly',  time:'flexible', type:'car'},
    ],
  },
  cooking: {
    label: 'Cooking',
    icon: '🍳',
    chores: [
      { name:'Cook Dinner',        icon:'🍳', effort:3, recurring:'daily',    time:'evening',  type:'cooking'},
      { name:'Meal Prep',          icon:'🥘', effort:4, recurring:'weekly',   time:'flexible', type:'cooking'},
      { name:'Grocery Run',        icon:'🛒', effort:3, recurring:'weekly',   time:'afternoon',type:'groceries'},
      { name:'Clean Oven/Stovetop',icon:'🔥', effort:3, recurring:'monthly',  time:'flexible', type:'kitchen'},
    ],
  },
  laundry: {
    label: 'Laundry',
    icon: '👕',
    chores: [
      { name:'Do Laundry',         icon:'🫧', effort:2, recurring:'weekly',   time:'flexible', type:'laundry'},
      { name:'Fold & Put Away',    icon:'👕', effort:2, recurring:'weekly',   time:'flexible', type:'laundry'},
      { name:'Change Bed Sheets',  icon:'🛏️', effort:3, recurring:'biweekly',time:'flexible', type:'laundry'},
    ],
  },
};

// Default rules baked into every new circle
const DEFAULT_RULES = [
  { id:'r1', label:'Reduce minors on school days', desc:'Max 1 chore/day on Mon–Fri for members aged ≤17',    on:true  },
  { id:'r2', label:'Heavy tasks on weekends',       desc:'Effort 4+ chores auto-schedule Sat/Sun',             on:true  },
  { id:'r3', label:'Rotate undesirable chores',     desc:'No one gets same disliked chore >2 weeks running',   on:true  },
  { id:'r4', label:'Balance over 4-week window',    desc:'Allow short-term imbalance, optimise monthly',       on:true  },
  { id:'r5', label:'Exam/busy override',            desc:'Drop to 50% capacity when member marks busy week',   on:false },
];

// ─────────────────────────────────────────────
//  APP STATE  (all data lives here; synced to localStorage)
// ─────────────────────────────────────────────
let APP = {
  currentUser:  null,   // { id, name, email, color, circleId, capacity }
  circle:       null,   // { id, name, code, ownerId }
  members:      [],     // [{ id, name, color, capacity, dislikes, prefers, age, points, streak, totalDone }]
  chores:       [],     // task templates
  assignments:  {},     // { dayIndex: [{ id, choreId, memberId, done, day }] }
  swaps:        [],
  rules:        [],
  weekOffset:   0,
  memberFilter: 'all',
  choreFilter:  'all',
};

// ─────────────────────────────────────────────
//  ONBOARDING STATE (temporary, not persisted)
// ─────────────────────────────────────────────
let OB = {
  step:          0,
  totalSteps:    5,
  color:         COLORS[0],
  capacity:      25,
  dislikes:      [],
  prefers:       [],
  circleChoice:  'create',
  circleName:    '',
  inviteCode:    '',
  templateKey:   'standard',
  selectedAddons: new Set(),
};


// ══════════════════════════════════════════════
//  AUTH
// ══════════════════════════════════════════════

function authTab(which) {
  document.querySelectorAll('.auth-tab').forEach(el =>
    el.classList.toggle('active', el.dataset.tab === which)
  );
  document.getElementById('auth-login').style.display  = which === 'login'  ? '' : 'none';
  document.getElementById('auth-signup').style.display = which === 'signup' ? '' : 'none';
  document.getElementById('login-error').textContent   = '';
  document.getElementById('signup-error').textContent  = '';
}

function doLogin(e) {
  e.preventDefault();
  const email = document.getElementById('login-email').value.trim();
  const pwd   = document.getElementById('login-pwd').value;
  const errEl = document.getElementById('login-error');

  if (!email || !pwd) { errEl.textContent = 'Please fill in all fields.'; return; }

  // ── SUPABASE HOOK ──────────────────────────────────────
  // const { data, error } = await supabase.auth.signInWithPassword({ email, password: pwd })
  // if (error) { errEl.textContent = error.message; return; }
  // then load user's circle from DB and call launchApp()
  // ───────────────────────────────────────────────────────

  const saved = ls('hb_user');
  if (saved && saved.email === email) {
    APP.currentUser  = saved;
    APP.circle       = ls('hb_circle');
    APP.members      = ls('hb_members')     || [];
    APP.chores       = ls('hb_chores')      || [];
    APP.rules        = ls('hb_rules')       || DEFAULT_RULES;
    APP.swaps        = ls('hb_swaps')       || [];
    APP.assignments  = ls('hb_assignments') || {};
    if (APP.circle) launchApp();
    else            startOnboarding();
  } else {
    errEl.textContent = 'Account not found — please create one first.';
  }
}

function doSignup(e) {
  e.preventDefault();
  const name  = document.getElementById('signup-name').value.trim();
  const email = document.getElementById('signup-email').value.trim();
  const pwd   = document.getElementById('signup-pwd').value;
  const errEl = document.getElementById('signup-error');

  if (!name || !email || !pwd)   { errEl.textContent = 'Fill in all fields.';             return; }
  if (pwd.length < 6)            { errEl.textContent = 'Password must be 6+ characters.'; return; }
  if (!email.includes('@'))      { errEl.textContent = 'Enter a valid email.';            return; }

  // ── SUPABASE HOOK ──────────────────────────────────────
  // const { data, error } = await supabase.auth.signUp({ email, password: pwd })
  // if (error) { errEl.textContent = error.message; return; }
  // await supabase.from('profiles').insert({ id: data.user.id, name, email })
  // ───────────────────────────────────────────────────────

  APP.currentUser = {
    id: 'u_' + Date.now(),
    name, email,
    color: OB.color,
    capacity: 25,
    circleId: null,
  };
  ls('hb_user', APP.currentUser);
  startOnboarding();
}

function doLogout() {
  // ── SUPABASE HOOK: await supabase.auth.signOut() ──
  APP = { currentUser:null, circle:null, members:[], chores:[], assignments:{}, swaps:[], rules:[], weekOffset:0, memberFilter:'all', choreFilter:'all' };
  showScreen('auth');
  toast('Signed out', 'info');
}


// ══════════════════════════════════════════════
//  ONBOARDING  (5 steps)
// ══════════════════════════════════════════════

function startOnboarding() {
  OB.step = 0;
  showScreen('onboard');
  renderObStep();
}

function renderObStep() {
  // Progress bar fill
  const pct = ((OB.step) / OB.totalSteps) * 100;
  document.getElementById('ob-progress-fill').style.width = pct + '%';

  // Step dots
  const dots = document.getElementById('ob-steps');
  dots.innerHTML = Array.from({ length: OB.totalSteps }, (_,i) =>
    `<div class="onboard-step ${i < OB.step ? 'done' : i === OB.step ? 'active' : ''}"></div>`
  ).join('');

  // Step content
  const content = document.getElementById('ob-content');
  if      (OB.step === 0) content.innerHTML = obStep0();
  else if (OB.step === 1) content.innerHTML = obStep1();
  else if (OB.step === 2) content.innerHTML = obStep2();
  else if (OB.step === 3) content.innerHTML = obStep3();
  else if (OB.step === 4) content.innerHTML = obStep4();
}

/* Step 0 — Choose template */
function obStep0() {
  const cards = Object.entries(CHORE_TEMPLATES).map(([key, tmpl]) => `
    <div class="template-card ${OB.templateKey === key ? 'selected' : ''}"
         onclick="selectTemplate('${key}')">
      <div class="tc-icon">${tmpl.icon}</div>
      <div class="tc-name">${tmpl.label}</div>
      <div class="tc-desc">${tmpl.desc}</div>
    </div>`).join('');

  const addonCards = Object.entries(ADDON_PACKS).map(([key, pack]) => `
    <div class="addon-chip ${OB.selectedAddons.has(key) ? 'selected' : ''}"
         onclick="toggleAddon('${key}')">
      <span class="chip-icon">${pack.icon}</span>${pack.label}
    </div>`).join('');

  return `
    <div class="onboard-title">What kind of household? 🏠</div>
    <div class="onboard-sub">Pick a starting point. You can edit everything afterwards — this just saves you from adding chores from scratch.</div>
    <div class="template-grid">${cards}</div>

    <div class="form-group" style="margin-top:20px">
      <label class="form-label">Add-ons — any of these apply?</label>
      <div class="addon-grid">${addonCards}</div>
    </div>

    <div class="ob-nav">
      <span style="font-size:12px;color:var(--muted)">Step 1 of ${OB.totalSteps}</span>
      <button class="btn btn-primary" onclick="obNext()">Next →</button>
    </div>`;
}

/* Step 1 — Pick colour + capacity */
function obStep1() {
  const swatches = COLORS.map((c,i) =>
    `<div class="color-swatch ${OB.color === c ? 'selected' : ''}"
          style="background:${c}"
          onclick="obPickColor('${c}',this)"></div>`
  ).join('');

  return `
    <div class="onboard-title">Make it yours 🎨</div>
    <div class="onboard-sub">Pick your colour and set how much you can handle per week. You can always adjust this later.</div>

    <div class="form-group">
      <label class="form-label">Your colour</label>
      <div class="color-grid" id="ob-color-grid">${swatches}</div>
    </div>

    <div class="form-group" style="margin-top:20px">
      <label class="form-label">Weekly capacity</label>
      <div class="cap-labels"><span>Light (10)</span><span>Medium (30)</span><span>Heavy (55)</span></div>
      <input type="range" id="ob-cap" min="10" max="55" step="5" value="${OB.capacity}"
             oninput="OB.capacity=+this.value;document.getElementById('ob-cap-val').textContent=this.value">
      <p style="text-align:center;margin-top:8px;font-size:13px;color:var(--muted)">
        Capacity: <strong id="ob-cap-val" style="color:var(--text)">${OB.capacity}</strong> pts / week
      </p>
    </div>

    <div class="ob-nav">
      <button class="btn btn-ghost" onclick="obBack()">← Back</button>
      <button class="btn btn-primary" onclick="obNext()">Next →</button>
    </div>`;
}

/* Step 2 — Dislikes + preferences */
function obStep2() {
  const all = ['dishes','trash','mop','sweep','vacuum','dog-walk','dusting','mirrors','bathroom','cooking','laundry','groceries','outdoor','pet-care'];

  const dislikeChips = all.map(t =>
    `<div class="pref-chip ${OB.dislikes.includes(t) ? 'selected' : ''}"
          onclick="obTogglePref('dislike','${t}',this)">${t}</div>`
  ).join('');

  const preferChips = all.map(t =>
    `<div class="pref-chip ${OB.prefers.includes(t) ? 'selected' : ''}"
          onclick="obTogglePref('prefer','${t}',this)">${t}</div>`
  ).join('');

  return `
    <div class="onboard-title">Your preferences 🚫✅</div>
    <div class="onboard-sub">We use this to avoid assigning chores you hate when someone else can do them. Be honest — it only works if you are.</div>

    <div class="form-group">
      <label class="form-label">I dislike…</label>
      <div class="pref-grid">${dislikeChips}</div>
    </div>

    <div class="form-group" style="margin-top:16px">
      <label class="form-label">I don't mind…</label>
      <div class="pref-grid">${preferChips}</div>
    </div>

    <div class="ob-nav">
      <button class="btn btn-ghost" onclick="obBack()">← Back</button>
      <button class="btn btn-primary" onclick="obNext()">Next →</button>
    </div>`;
}

/* Step 3 — Create or join circle */
function obStep3() {
  return `
    <div class="onboard-title">Your circle 🏡</div>
    <div class="onboard-sub">A circle is your household group. Create one and share the invite code with housemates, or join an existing one.</div>

    <div class="tabs" style="width:100%;margin-bottom:20px">
      <button class="tab ${OB.circleChoice==='create'?'active':''}" style="flex:1"
              onclick="OB.circleChoice='create';renderObStep()">Create Circle</button>
      <button class="tab ${OB.circleChoice==='join'?'active':''}" style="flex:1"
              onclick="OB.circleChoice='join';renderObStep()">Join a Circle</button>
    </div>

    ${OB.circleChoice === 'create' ? `
      <div class="form-group">
        <label class="form-label">Circle Name</label>
        <input class="form-input" id="ob-circle-name" placeholder="e.g. The Johnson House"
               value="${OB.circleName}">
      </div>` : `
      <div class="form-group">
        <label class="form-label">Invite Code</label>
        <input class="form-input" id="ob-invite-code"
               placeholder="e.g. HX92KP"
               style="letter-spacing:4px;font-size:18px;text-transform:uppercase"
               value="${OB.inviteCode}" maxlength="6">
        <p class="form-hint">Ask your housemate to share their 6-character circle code.</p>
      </div>`}

    <div class="ob-nav">
      <button class="btn btn-ghost" onclick="obBack()">← Back</button>
      <button class="btn btn-primary" onclick="obNext()">Next →</button>
    </div>`;
}

/* Step 4 — Done! Show invite code */
function obStep4() {
  const code = APP.circle?.code || '??????';
  const choreCount = APP.chores.length;
  return `
    <div class="onboard-title">You're all set! 🎉</div>
    <div class="onboard-sub">
      ${choreCount > 0
        ? `Added <strong>${choreCount} chores</strong> to get you started. You can edit them any time from the Chores page.`
        : `Your blank circle is ready. Head to <strong>Chores</strong> to start building your list.`}
    </div>

    <div class="invite-box">
      <p style="font-size:12px;color:var(--muted);margin-bottom:4px">Your circle invite code</p>
      <div class="invite-code">${code}</div>
      <p class="invite-hint">Share this with housemates so they can join your circle</p>
    </div>

    <button class="btn btn-ghost btn-block" style="margin-top:12px" onclick="copyCode('${code}')">📋 Copy Code</button>

    <div class="alert alert-info" style="margin-top:14px">
      <span class="alert-icon">💡</span>
      <div class="alert-body">
        <strong>Tip:</strong> After you enter, go to <em>Members</em> to edit your profile and
        <em>Rules Engine</em> to customise assignment logic.
      </div>
    </div>

    <div class="ob-nav">
      <button class="btn btn-ghost" onclick="obBack()">← Back</button>
      <button class="btn btn-primary" onclick="finishOnboarding()">Enter HomeBase →</button>
    </div>`;
}

/* Onboarding nav helpers */
function obNext() {
  // Validate + collect current step's data
  if (OB.step === 0) {
    // template + addons already set by click handlers
  }
  if (OB.step === 1) {
    APP.currentUser.color    = OB.color;
    APP.currentUser.capacity = OB.capacity;
    ls('hb_user', APP.currentUser);
  }
  if (OB.step === 2) {
    // preferences stored in OB
  }
  if (OB.step === 3) {
    if (OB.circleChoice === 'create') {
      const nameEl = document.getElementById('ob-circle-name');
      OB.circleName = nameEl ? nameEl.value.trim() : 'My Circle';
      if (!OB.circleName) OB.circleName = 'My Circle';
      const code = makeCode();
      APP.circle = { id:'circle_'+Date.now(), name:OB.circleName, code, ownerId:APP.currentUser.id };
      // SUPABASE HOOK: await supabase.from('circles').insert(APP.circle)
    } else {
      const codeEl = document.getElementById('ob-invite-code');
      const code   = codeEl ? codeEl.value.trim().toUpperCase() : '';
      if (!code || code.length !== 6) { toast('Enter a valid 6-character code','warn'); return; }
      OB.inviteCode = code;
      // SUPABASE HOOK: const { data } = await supabase.from('circles').select('*').eq('code',code).single()
      APP.circle = { id:'circle_demo', name:'Joined Circle', code, ownerId:'other' };
    }
    APP.currentUser.circleId = APP.circle.id;
    ls('hb_user', APP.currentUser);

    // Build the chore list from chosen template + addons
    buildChoreList();
  }
  OB.step++;
  renderObStep();
}

function obBack() {
  if (OB.step > 0) { OB.step--; renderObStep(); }
}

function obPickColor(c, el) {
  OB.color = c;
  document.querySelectorAll('#ob-color-grid .color-swatch').forEach(s => s.classList.remove('selected'));
  el.classList.add('selected');
}

function obTogglePref(type, val, el) {
  el.classList.toggle('selected');
  const arr = type === 'dislike' ? OB.dislikes : OB.prefers;
  const idx = arr.indexOf(val);
  if (idx === -1) arr.push(val); else arr.splice(idx, 1);
}

function selectTemplate(key) {
  OB.templateKey = key;
  document.querySelectorAll('.template-card').forEach(c =>
    c.classList.toggle('selected', c.getAttribute('onclick').includes(`'${key}'`))
  );
}

function toggleAddon(key) {
  if (OB.selectedAddons.has(key)) OB.selectedAddons.delete(key);
  else OB.selectedAddons.add(key);
  document.querySelectorAll('.addon-chip').forEach(c => {
    if (c.getAttribute('onclick').includes(`'${key}'`))
      c.classList.toggle('selected', OB.selectedAddons.has(key));
  });
}

function buildChoreList() {
  const base = CHORE_TEMPLATES[OB.templateKey]?.chores || [];
  const addons = [...OB.selectedAddons].flatMap(k => ADDON_PACKS[k]?.chores || []);
  APP.chores = [...base, ...addons].map((c,i) => ({
    ...c,
    id: 'c_' + Date.now() + '_' + i,
    category: c.recurring === 'daily' ? 'daily'
             : c.recurring === 'monthly' || c.recurring === 'quarterly' ? c.recurring
             : c.recurring === 'flexible' ? 'flexible' : 'weekly',
  }));
}

function finishOnboarding() {
  // Build the current user as a circle member
  const member = {
    id:       APP.currentUser.id,
    name:     APP.currentUser.name,
    email:    APP.currentUser.email,
    color:    OB.color,
    capacity: OB.capacity,
    dislikes: [...OB.dislikes],
    prefers:  [...OB.prefers],
    age:      null,
    points:   0,
    streak:   0,
    totalDone:0,
  };
  APP.members = [member];
  APP.rules   = DEFAULT_RULES.map(r => ({ ...r }));

  // SUPABASE HOOK:
  // await supabase.from('circle_members').insert({ ...member, circle_id: APP.circle.id })
  // await supabase.from('chores').insert(APP.chores.map(c => ({ ...c, circle_id: APP.circle.id })))

  saveAll();
  launchApp();
  toast(`Welcome to ${APP.circle.name}! 🎉`, 'success');
}


// ══════════════════════════════════════════════
//  LAUNCH APP
// ══════════════════════════════════════════════

function launchApp() {
  if (!APP.circle) { startOnboarding(); return; }

  showScreen('app');

  // Populate sidebar current-user row
  const cu = APP.currentUser;
  document.getElementById('cu-name').textContent = cu.name;
  const av = document.getElementById('cu-avatar');
  av.textContent = cu.name[0].toUpperCase();
  av.style.background = cu.color + '30';
  av.style.color = cu.color;

  document.getElementById('sb-circle-name').textContent = APP.circle.name;
  document.getElementById('sb-circle-code').textContent = APP.circle.code;

  renderMemberFilterChips();

  // Auto-generate week if no assignments yet
  if (!APP.assignments || Object.keys(APP.assignments).length === 0) {
    if (APP.chores.length > 0) generateWeek(true);
  }

  renderDashboard();
  showPage('dashboard');
}


// ══════════════════════════════════════════════
//  SMART ASSIGNMENT ENGINE
// ══════════════════════════════════════════════

function generateWeek(silent = false) {
  if (!APP.members.length) { toast('Add members first','warn'); return; }

  const effortMap = {};
  APP.members.forEach(m => effortMap[m.id] = 0);

  const newAssignments = {};
  const today     = new Date();
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay() + APP.weekOffset * 7);
  const weekNum = getWeekNum(weekStart);
  const isEven  = weekNum % 2 === 0;

  for (let d = 0; d < 7; d++) {
    newAssignments[d] = [];
    const isWeekend = d === 0 || d === 6;

    APP.chores.forEach(chore => {
      let include = false;

      switch (chore.recurring) {
        case 'daily':      include = true; break;
        case 'weekly':     include = d === 1; break;       // Monday
        case 'biweekly':   include = d === 4; break;       // Thursday
        case 'monthly':    include = d === 6 && isEven; break;
        case 'quarterly':  include = d === 6 && weekNum % 13 < 2; break;
      }

      // Rule: heavy tasks on weekends
      const heavyRule = APP.rules.find(r => r.id === 'r2' && r.on);
      if (heavyRule && chore.effort >= 4 && !isWeekend && chore.recurring === 'weekly') {
        include = false;
        if (d === 6) include = true;
      }

      if (!include) return;

      const memberId = smartAssign(chore, d, effortMap, newAssignments[d]);
      effortMap[memberId] = (effortMap[memberId] || 0) + chore.effort;

      newAssignments[d].push({
        id:       `a_${d}_${chore.id}_${Date.now()}`,
        choreId:  chore.id,
        memberId,
        done:     false,
        day:      d,
      });
    });
  }

  APP.assignments = newAssignments;

  // Sync points to members
  APP.members.forEach(m => { m.points = effortMap[m.id] || 0; });

  saveAll();
  if (!silent) toast('Week auto-assigned! 🗓️', 'success');
  updateSanityCheck();
  renderDashboard();
  if (document.getElementById('page-schedule').classList.contains('active')) renderSchedulePage();
}

function smartAssign(chore, dayOfWeek, effortMap, dayEntries) {
  if (!APP.members.length) return 'unknown';

  let pool = [...APP.members];

  // School-day rule
  const schoolRule = APP.rules.find(r => r.id === 'r1' && r.on);
  if (schoolRule && dayOfWeek >= 1 && dayOfWeek <= 5) {
    pool = pool.filter(m => {
      if (m.age && m.age <= 17) {
        return dayEntries.filter(a => a.memberId === m.id).length < 1;
      }
      return true;
    });
    if (!pool.length) pool = [...APP.members];
  }

  // Capacity check
  const underCap = pool.filter(m => (effortMap[m.id] || 0) < m.capacity * 1.3);
  if (underCap.length) pool = underCap;

  // Dislike filter (soft — only exclude if alternatives exist)
  const nonDislikers = pool.filter(m => !m.dislikes.includes(chore.type));
  if (nonDislikers.length) pool = nonDislikers;

  // Prefer filter (bonus — prioritise those who like it)
  const preferrers = pool.filter(m => m.prefers.includes(chore.type));
  if (preferrers.length) pool = preferrers;

  // Sort by lowest effort so far (fairness)
  pool.sort((a, b) => (effortMap[a.id] || 0) - (effortMap[b.id] || 0));
  return pool[0].id;
}

function getWeekNum(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}


// ══════════════════════════════════════════════
//  SANITY CHECK
// ══════════════════════════════════════════════

function updateSanityCheck() {
  const effortMap = {};
  Object.values(APP.assignments).flat().forEach(e => {
    const c = APP.chores.find(ch => ch.id === e.choreId);
    if (c) effortMap[e.memberId] = (effortMap[e.memberId] || 0) + c.effort;
  });

  const warnings = [];
  APP.members.forEach(m => {
    const pts = effortMap[m.id] || 0;
    if (pts > m.capacity * 1.25)
      warnings.push(`⚠️ ${m.name} is over capacity (${pts}/${m.capacity}pts)`);
  });

  const vals = Object.values(effortMap);
  if (vals.length > 1) {
    const gap = Math.max(...vals) - Math.min(...vals);
    if (gap > 20) warnings.push(`Large effort gap: ${gap}pts — consider rebalancing`);
  }

  const alert = document.getElementById('sanity-alert');
  const msg   = document.getElementById('sanity-msg');
  if (!alert || !msg) return;

  if (warnings.length) {
    msg.textContent   = warnings.join(' · ');
    alert.className   = 'alert alert-warn';
  } else {
    msg.textContent   = 'Looking good — workload is balanced this week.';
    alert.className   = 'alert alert-success';
  }
}


// ══════════════════════════════════════════════
//  DASHBOARD
// ══════════════════════════════════════════════

function renderDashboard() {
  const now  = new Date();
  const h    = now.getHours();
  const name = APP.currentUser?.name?.split(' ')[0] || 'there';
  const greeting = h < 12 ? `Good morning, ${name}! 🌅`
                 : h < 17 ? `Good afternoon, ${name}! ☀️`
                 :           `Good evening, ${name}! 🌙`;

  document.getElementById('dash-greeting').textContent = greeting;
  document.getElementById('dash-date').textContent =
    now.toLocaleDateString('en-US', { weekday:'long', year:'numeric', month:'long', day:'numeric' });

  const todayDow    = now.getDay();
  const todayEntries = getFiltered(APP.assignments[todayDow] || []);
  const allEntries   = getFiltered(Object.values(APP.assignments).flat());
  const done         = todayEntries.filter(e => e.done).length;
  const doneWeek     = allEntries.filter(e => e.done).length;

  // ── Stats row ──
  let statsHtml = '';
  APP.members.slice(0,3).forEach(m => {
    statsHtml += `
      <div class="stat-card" style="--c:${m.color}">
        <div class="stat-val" style="color:${m.color}">${m.points}</div>
        <div class="stat-lbl">${m.name} · pts this week</div>
        <div class="stat-sub">🔥 ${m.streak}-day streak</div>
      </div>`;
  });
  statsHtml += `
    <div class="stat-card" style="--c:var(--accent)">
      <div class="stat-val">${done}/${todayEntries.length}</div>
      <div class="stat-lbl">Done today</div>
      <div class="stat-sub">${doneWeek}/${allEntries.length} this week</div>
    </div>`;
  document.getElementById('dash-stats').innerHTML = statsHtml;

  // ── Today's chores ──
  let todayHtml = '';
  if (!todayEntries.length) {
    todayHtml = APP.chores.length === 0
      ? `<div class="empty">
           <div class="empty-icon">📋</div>
           <div class="empty-title">No chores yet</div>
           <div>Go to <a href="#" onclick="showPage('chores')">All Chores</a> to add your first one.</div>
         </div>`
      : `<div class="empty">
           <div class="empty-icon">🎉</div>
           <div class="empty-title">Nothing today!</div>
           <div><a href="#" onclick="generateWeek()">Generate a week</a> to see assignments.</div>
         </div>`;
  } else {
    todayEntries.forEach(e => { todayHtml += choreItemHTML(e, true); });
  }
  document.getElementById('today-list').innerHTML = todayHtml;

  // ── Effort bars ──
  const effortMap = {};
  Object.values(APP.assignments).flat().forEach(e => {
    const c = APP.chores.find(ch => ch.id === e.choreId);
    if (c) effortMap[e.memberId] = (effortMap[e.memberId] || 0) + c.effort;
  });
  let ebHtml = '';
  APP.members.forEach(m => {
    const pts = effortMap[m.id] || 0;
    const pct = Math.min(100, (pts / m.capacity) * 100);
    const col = pct > 90 ? 'var(--danger)' : pct > 72 ? 'var(--warning)' : m.color;
    ebHtml += `
      <div class="ebar-row">
        <div class="ebar-label">
          <span class="ebar-name" style="color:${m.color}">${m.name}</span>
          <span class="ebar-pts">${pts} / ${m.capacity} pts</span>
        </div>
        <div class="ebar">
          <div class="ebar-fill" style="width:${pct}%;background:${col}"></div>
        </div>
      </div>`;
  });
  document.getElementById('effort-bars').innerHTML = ebHtml ||
    `<p style="color:var(--muted);font-size:13px">No assignments yet.</p>`;

  // ── Streak cards ──
  let streakHtml = '';
  APP.members.forEach(m => {
    streakHtml += `
      <div class="card card-sm" style="text-align:center;border-top:2px solid ${m.color}">
        <div style="font-size:10px;font-weight:600;color:${m.color};text-transform:uppercase;letter-spacing:.5px;margin-bottom:8px">${m.name}</div>
        <div class="points-big" style="color:${m.color}">${m.points}</div>
        <div style="font-size:10px;color:var(--muted);margin:4px 0 8px">pts this week</div>
        <div class="streak-badge" style="background:${m.color}20;color:${m.color}">🔥 ${m.streak}-day streak</div>
      </div>`;
  });
  document.getElementById('streak-cards').innerHTML = streakHtml ||
    `<div style="color:var(--muted);font-size:13px;grid-column:span 3;padding:8px 0">No members yet. <a href="#" onclick="showPage('members')">Invite someone →</a></div>`;

  // ── Upcoming ──
  let upHtml = '';
  for (let d = 1; d <= 3; d++) {
    const dow     = (todayDow + d) % 7;
    const entries = getFiltered(APP.assignments[dow] || []);
    if (!entries.length) continue;
    upHtml += `<p style="font-size:12px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:.8px;padding:8px 0;border-bottom:1px solid var(--border);margin-bottom:8px">${DAYS_L[dow]} · ${entries.length} task${entries.length !== 1 ? 's' : ''}</p>`;
    entries.slice(0,3).forEach(e => { upHtml += choreItemHTML(e, false); });
    if (entries.length > 3)
      upHtml += `<p style="font-size:12px;color:var(--muted);padding:3px 12px;margin-bottom:6px">+${entries.length-3} more</p>`;
  }
  document.getElementById('upcoming-list').innerHTML = upHtml ||
    `<p style="color:var(--muted);font-size:13px;padding:12px 0">No upcoming tasks. <a href="#" onclick="generateWeek()">Generate this week →</a></p>`;
}

// Shared chore list item HTML
function choreItemHTML(entry, withCheck) {
  const chore  = APP.chores.find(c => c.id === entry.choreId);
  const member = APP.members.find(m => m.id === entry.memberId);
  if (!chore || !member) return '';
  return `
    <div class="chore-item" style="border-left:3px solid ${member.color}">
      ${withCheck ? `<div class="chore-check ${entry.done ? 'done' : ''}"
                         onclick="toggleDone('${entry.id}','${entry.day}')"
                         role="checkbox" aria-checked="${entry.done}"
                         tabindex="0"></div>` : ''}
      <div style="font-size:18px;width:26px;text-align:center" aria-hidden="true">${chore.icon}</div>
      <div class="chore-info">
        <div class="chore-name ${entry.done ? 'done' : ''}">${chore.name}</div>
        <div class="chore-meta">${chore.time} · ${chore.effort}pt effort</div>
      </div>
      <span class="m-tag" style="background:${member.color}20;color:${member.color}">${member.name}</span>
      <div class="chore-actions">
        <button class="icon-btn" onclick="showReassignModal('${entry.id}','${entry.day}')" title="Reassign" aria-label="Reassign chore">✏️</button>
        <button class="icon-btn" onclick="showSwapModal('${entry.id}','${entry.day}')" title="Swap" aria-label="Request swap">🔄</button>
      </div>
    </div>`;
}

function getFiltered(entries) {
  if (APP.memberFilter === 'all') return entries;
  return entries.filter(e => e.memberId === APP.memberFilter);
}


// ══════════════════════════════════════════════
//  SCHEDULE PAGE
// ══════════════════════════════════════════════

function renderSchedulePage() {
  const today     = new Date();
  const wStart    = new Date(today);
  wStart.setDate(today.getDate() - today.getDay() + APP.weekOffset * 7);
  const wEnd = new Date(wStart);
  wEnd.setDate(wStart.getDate() + 6);

  document.getElementById('week-label').textContent =
    wStart.toLocaleDateString('en-US', { month:'short', day:'numeric' }) + ' – ' +
    wEnd.toLocaleDateString('en-US',   { month:'short', day:'numeric', year:'numeric' });

  const slots = ['Morning','Afternoon','Evening','Night'];

  // ── Calendar grid ──
  let calHtml = `<div class="sch-grid">
    <div class="sch-head" style="text-align:right;padding-right:10px;font-size:10px"></div>`;
  for (let d = 0; d < 7; d++) {
    const dt = new Date(wStart);
    dt.setDate(wStart.getDate() + d);
    const isToday = dt.toDateString() === today.toDateString();
    calHtml += `<div class="sch-head">
      ${DAYS_S[d]}<span class="sch-day-num ${isToday ? 'today' : ''}">${dt.getDate()}</span>
    </div>`;
  }

  slots.forEach((slot, si) => {
    calHtml += `<div class="sch-time">${slot}</div>`;
    for (let d = 0; d < 7; d++) {
      const entries = (APP.assignments[d] || []).filter(e => {
        const ch = APP.chores.find(c => c.id === e.choreId);
        if (!ch) return false;
        const t = ch.time.toLowerCase();
        const match = t === slot.toLowerCase()
          || (t === 'flexible'   && si === 1)
          || (t === 'morning'    && slot === 'Morning')
          || (t === 'evening'    && slot === 'Evening')
          || (t === 'night'      && slot === 'Night');
        return match && (APP.memberFilter === 'all' || e.memberId === APP.memberFilter);
      });

      calHtml += `<div class="sch-cell">`;
      entries.forEach(e => {
        const ch = APP.chores.find(c => c.id === e.choreId);
        const m  = APP.members.find(mb => mb.id === e.memberId);
        if (!ch || !m) return;
        const textCol = isDark(m.color) ? '#fff' : '#111';
        calHtml += `
          <div class="sch-block ${e.done ? 'done' : ''}"
               style="background:${m.color};color:${textCol}"
               onclick="toggleDone('${e.id}','${d}')"
               title="${ch.name} — ${m.name}">
            ${ch.icon} ${ch.name.length > 13 ? ch.name.slice(0,11)+'…' : ch.name}
          </div>`;
      });
      calHtml += `</div>`;
    }
  });
  calHtml += `</div>`;
  document.getElementById('schedule-cal').innerHTML = calHtml;

  // ── List view ──
  let listHtml = '';
  for (let d = 0; d < 7; d++) {
    const entries = getFiltered(APP.assignments[d] || []);
    if (!entries.length) continue;
    const dt = new Date(wStart); dt.setDate(wStart.getDate() + d);
    listHtml += `<p style="font-size:12px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:.8px;padding:10px 0 7px;border-bottom:1px solid var(--border);margin-bottom:8px">
      ${DAYS_L[d]} ${dt.toLocaleDateString('en-US',{month:'short',day:'numeric'})}</p>`;
    entries.forEach(e => { listHtml += choreItemHTML(e, true); });
  }
  document.getElementById('schedule-list').innerHTML = listHtml ||
    `<div class="empty"><div class="empty-icon">📅</div><div class="empty-title">No assignments yet</div>
     <div>Click <strong>Auto-assign week</strong> to generate.</div></div>`;
}

function prevWeek() { APP.weekOffset--; generateWeek(true); renderSchedulePage(); }
function nextWeek() { APP.weekOffset++; generateWeek(true); renderSchedulePage(); }

function isDark(hex) {
  if (!hex || hex.length < 7) return false;
  const r = parseInt(hex.slice(1,3),16);
  const g = parseInt(hex.slice(3,5),16);
  const b = parseInt(hex.slice(5,7),16);
  return (r*299 + g*587 + b*114) / 1000 < 128;
}


// ══════════════════════════════════════════════
//  CHORES PAGE  (meaningful filtering interaction)
// ══════════════════════════════════════════════

function renderChoresPage() {
  const filtered = APP.choreFilter === 'all'
    ? APP.chores
    : APP.chores.filter(c =>
        c.category  === APP.choreFilter ||
        c.recurring === APP.choreFilter
      );

  if (!filtered.length) {
    document.getElementById('chores-list').innerHTML = `
      <div class="empty">
        <div class="empty-icon">📋</div>
        <div class="empty-title">No chores in this category</div>
        <div><button class="btn btn-primary btn-sm" onclick="showAddChoreModal()">+ Add Chore</button></div>
      </div>`;
    return;
  }

  const html = filtered.map(chore => `
    <div class="chore-item">
      <div style="font-size:20px;width:28px;text-align:center" aria-hidden="true">${chore.icon}</div>
      <div class="chore-info">
        <div class="chore-name">${chore.name}</div>
        <div class="chore-meta">${chore.recurring} · ${chore.time} · ${chore.category}</div>
      </div>
      <span class="effort-pill">${chore.effort}pt</span>
      <div class="chore-actions">
        <button class="icon-btn" onclick="editChoreModal('${chore.id}')" aria-label="Edit ${chore.name}">✏️</button>
        <button class="icon-btn" style="color:var(--danger)" onclick="deleteChore('${chore.id}')" aria-label="Delete ${chore.name}">🗑️</button>
      </div>
    </div>`).join('');

  document.getElementById('chores-list').innerHTML = html;
}

function choreFilterFn(f, el) {
  APP.choreFilter = f;
  document.querySelectorAll('#page-chores .tab').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  renderChoresPage();
}


// ══════════════════════════════════════════════
//  MEMBERS PAGE
// ══════════════════════════════════════════════

function renderMembersPage() {
  if (!APP.members.length) {
    document.getElementById('members-grid').innerHTML = `
      <div class="empty span2">
        <div class="empty-icon">👥</div>
        <div class="empty-title">Just you so far</div>
        <div>Share your circle code <strong>${APP.circle?.code || ''}</strong> so others can join.</div>
      </div>`;
    return;
  }

  const effortMap = {};
  Object.values(APP.assignments).flat().forEach(e => {
    const c = APP.chores.find(ch => ch.id === e.choreId);
    if (c) effortMap[e.memberId] = (effortMap[e.memberId] || 0) + c.effort;
  });

  const html = APP.members.map(m => {
    const pts = effortMap[m.id] || 0;
    const pct = Math.min(100, (pts / m.capacity) * 100);
    return `
      <div class="profile-card" style="--c:${m.color}">
        <div style="display:flex;align-items:center;gap:11px;margin-bottom:16px">
          <div class="profile-avatar" style="background:${m.color}25;color:${m.color}">${m.name[0]}</div>
          <div>
            <div style="font-family:var(--font-display);font-size:16px;font-weight:700">${m.name}</div>
            <div style="font-size:12px;color:var(--muted)">${m.email||''} · ${m.capacity}pts/wk capacity</div>
          </div>
          <button class="btn btn-ghost btn-sm" style="margin-left:auto" onclick="editMemberModal('${m.id}')">Edit</button>
        </div>
        <div style="margin-bottom:12px">
          <div style="display:flex;justify-content:space-between;margin-bottom:5px">
            <span style="font-size:12px;color:var(--muted)">This week</span>
            <span style="font-size:12px;font-weight:600">${pts}/${m.capacity} pts</span>
          </div>
          <div class="ebar"><div class="ebar-fill" style="width:${pct}%;background:${m.color}"></div></div>
        </div>
        <div class="g2" style="gap:8px;margin-bottom:12px">
          <div style="background:var(--surface2);border-radius:8px;padding:10px;text-align:center">
            <div style="font-family:var(--font-display);font-size:22px;font-weight:800;color:${m.color}">${m.streak}</div>
            <div style="font-size:11px;color:var(--muted)">Day streak 🔥</div>
          </div>
          <div style="background:var(--surface2);border-radius:8px;padding:10px;text-align:center">
            <div style="font-family:var(--font-display);font-size:22px;font-weight:800">${m.totalDone}</div>
            <div style="font-size:11px;color:var(--muted)">Total done</div>
          </div>
        </div>
        <div style="margin-bottom:10px">
          <label class="form-label">Dislikes</label>
          <div style="display:flex;flex-wrap:wrap;gap:5px">
            ${m.dislikes.length
              ? m.dislikes.map(d => `<span style="background:rgba(255,95,95,.12);color:var(--danger);border-radius:20px;padding:2px 9px;font-size:11px">🚫 ${d}</span>`).join('')
              : `<span style="color:var(--muted);font-size:12px">None set</span>`}
          </div>
        </div>
        <div>
          <label class="form-label">Prefers</label>
          <div style="display:flex;flex-wrap:wrap;gap:5px">
            ${m.prefers.length
              ? m.prefers.map(p => `<span style="background:rgba(62,207,122,.12);color:var(--success);border-radius:20px;padding:2px 9px;font-size:11px">✓ ${p}</span>`).join('')
              : `<span style="color:var(--muted);font-size:12px">None set</span>`}
          </div>
        </div>
      </div>`;
  }).join('');

  document.getElementById('members-grid').innerHTML = html;
}

function renderMemberFilterChips() {
  let html = `
    <button class="member-chip active-f" onclick="setMemberFilter('all',this)">
      <div class="m-dot" style="background:#888"></div>
      <span class="m-name">Everyone</span>
    </button>`;
  APP.members.forEach(m => {
    html += `
      <button class="member-chip" onclick="setMemberFilter('${m.id}',this)">
        <div class="m-dot" style="background:${m.color}"></div>
        <span class="m-name">${m.name}</span>
        <span class="m-pts">${m.points}pt</span>
      </button>`;
  });
  const el = document.getElementById('member-filter-chips');
  if (el) el.innerHTML = html;
}

function setMemberFilter(id, el) {
  APP.memberFilter = id;
  document.querySelectorAll('.member-chip').forEach(c => c.classList.remove('active-f'));
  el.classList.add('active-f');
  renderDashboard();
  if (document.getElementById('page-schedule').classList.contains('active')) renderSchedulePage();
}


// ══════════════════════════════════════════════
//  RULES PAGE
// ══════════════════════════════════════════════

function renderRulesPage() {
  const html = APP.rules.map(r => `
    <div class="rule-item">
      <button class="toggle ${r.on ? 'on' : ''}" onclick="toggleRule('${r.id}')"
              aria-pressed="${r.on}" aria-label="Toggle ${r.label}"></button>
      <div style="flex:1">
        <div style="font-size:13.5px;font-weight:500">${r.label}</div>
        <div style="font-size:12px;color:var(--muted);margin-top:2px">${r.desc}</div>
      </div>
      <button class="icon-btn" style="color:var(--danger)" onclick="deleteRule('${r.id}')"
              aria-label="Delete rule">🗑️</button>
    </div>`).join('');

  document.getElementById('rules-list').innerHTML = html ||
    `<div class="empty"><div class="empty-icon">⚙️</div><div class="empty-title">No rules yet</div></div>`;
}

function toggleRule(id) {
  const r = APP.rules.find(x => x.id === id);
  if (r) { r.on = !r.on; saveAll(); renderRulesPage(); }
}
function deleteRule(id) {
  APP.rules = APP.rules.filter(r => r.id !== id);
  saveAll(); renderRulesPage(); toast('Rule deleted','warn');
}


// ══════════════════════════════════════════════
//  SWAPS PAGE
// ══════════════════════════════════════════════

function renderSwapsPage() {
  const pending = APP.swaps.filter(s => s.status === 'pending');
  const badge   = document.getElementById('swap-badge-nav');
  badge.textContent = pending.length;
  badge.classList.toggle('visible', pending.length > 0);

  if (!APP.swaps.length) {
    document.getElementById('swaps-list').innerHTML = `
      <div class="empty">
        <div class="empty-icon">✌️</div>
        <div class="empty-title">No swap requests</div>
        <div>Requests you or others send will appear here.</div>
      </div>`;
    return;
  }

  const html = APP.swaps.map(s => {
    const from = APP.members.find(m => m.id === s.fromId);
    const to   = APP.members.find(m => m.id === s.toId);
    const statusColor = s.status === 'pending'  ? 'var(--warning)'
                      : s.status === 'accepted' ? 'var(--success)' : 'var(--danger)';
    return `
      <div class="swap-card">
        <div style="font-size:20px" aria-hidden="true">🔄</div>
        <div style="flex:1">
          <div style="font-size:13.5px;font-weight:500">${s.choreName}</div>
          <div style="font-size:12px;color:var(--muted);margin-top:2px">
            <span style="color:${from?.color||'var(--text)'}">${from?.name||'?'}</span>
            asks <span style="color:${to?.color||'var(--text)'}">${to?.name||'?'}</span>
            · ${s.day}
          </div>
        </div>
        <span style="font-size:11px;color:${statusColor};font-weight:600">${s.status.toUpperCase()}</span>
        ${s.status === 'pending' ? `
          <button class="btn btn-success btn-sm" onclick="resolveSwap('${s.id}','accepted')">Accept</button>
          <button class="btn btn-danger btn-sm"  onclick="resolveSwap('${s.id}','declined')">Decline</button>` : ''}
      </div>`;
  }).join('');

  document.getElementById('swaps-list').innerHTML = html;
}

function resolveSwap(id, status) {
  const s = APP.swaps.find(x => x.id === id);
  if (!s) return;
  s.status = status;
  if (status === 'accepted') {
    Object.values(APP.assignments).flat().forEach(e => {
      if (e.id === s.assignmentId) e.memberId = s.toId;
    });
  }
  saveAll(); renderSwapsPage(); renderDashboard();
  toast(`Swap ${status}!`, status === 'accepted' ? 'success' : 'warn');
  // SUPABASE HOOK: await supabase.from('swap_requests').update({ status }).eq('id', id)
}


// ══════════════════════════════════════════════
//  ANALYTICS PAGE
// ══════════════════════════════════════════════

function renderAnalytics() {
  const effortMap = {}, countMap = {}, doneMap = {};
  APP.members.forEach(m => { effortMap[m.id] = 0; countMap[m.id] = 0; doneMap[m.id] = 0; });
  Object.values(APP.assignments).flat().forEach(e => {
    const c = APP.chores.find(ch => ch.id === e.choreId);
    if (!c) return;
    effortMap[e.memberId] = (effortMap[e.memberId] || 0) + c.effort;
    countMap[e.memberId]  = (countMap[e.memberId]  || 0) + 1;
    if (e.done) doneMap[e.memberId] = (doneMap[e.memberId] || 0) + 1;
  });
  const total = Object.values(effortMap).reduce((a,b) => a+b, 0);

  document.getElementById('analytics-content').innerHTML = `
    <div class="g2" style="margin-bottom:18px">
      <div class="card">
        <h2 class="sec-title">Effort Distribution</h2>
        ${APP.members.map(m => {
          const pts = effortMap[m.id] || 0;
          const pct = total > 0 ? Math.round((pts/total)*100) : 0;
          return `<div class="ebar-row">
            <div class="ebar-label">
              <span class="ebar-name" style="color:${m.color}">${m.name}</span>
              <span class="ebar-pts">${pts}pts (${pct}%)</span>
            </div>
            <div class="ebar"><div class="ebar-fill" style="width:${pct}%;background:${m.color}"></div></div>
          </div>`;
        }).join('')}
      </div>
      <div class="card">
        <h2 class="sec-title">Completion Rate</h2>
        ${APP.members.map(m => {
          const rate = countMap[m.id] > 0 ? Math.round((doneMap[m.id]/countMap[m.id])*100) : 0;
          const col  = rate > 75 ? 'var(--success)' : rate > 40 ? 'var(--warning)' : 'var(--danger)';
          return `<div class="ebar-row">
            <div class="ebar-label">
              <span class="ebar-name" style="color:${m.color}">${m.name}</span>
              <span class="ebar-pts">${doneMap[m.id]}/${countMap[m.id]} (${rate}%)</span>
            </div>
            <div class="ebar"><div class="ebar-fill" style="width:${rate}%;background:${col}"></div></div>
          </div>`;
        }).join('')}
      </div>
    </div>

    <div class="card" style="margin-bottom:18px">
      <h2 class="sec-title">🏆 Leaderboard</h2>
      ${[...APP.members].sort((a,b) => b.points - a.points).map((m,i) => `
        <div class="lb-row" ${i===0 ? 'style="border:1px solid rgba(255,217,61,.25);background:rgba(255,217,61,.04)"' : ''}>
          <div class="lb-rank">${['🥇','🥈','🥉'][i] || (i+1)}</div>
          <div class="profile-avatar" style="width:32px;height:32px;font-size:13px;background:${m.color}25;color:${m.color}">${m.name[0]}</div>
          <div style="flex:1">
            <div style="font-weight:500">${m.name}</div>
            <div style="font-size:11px;color:var(--muted)">🔥 ${m.streak}-day streak · ${m.totalDone} total done</div>
          </div>
          <div class="lb-pts" style="color:${m.color}">${m.points}</div>
        </div>`).join('')}
    </div>

    <div class="alert alert-info">
      <span class="alert-icon">💡</span>
      <div class="alert-body">
        <strong>Sanity check:</strong>
        Dusting monthly &gt; weekly (aspirational, let's be real).
        Deep bathroom clean quarterly is plenty.
        Focus on sustainable consistency — not perfect fairness every single day.
      </div>
    </div>`;
}


// ══════════════════════════════════════════════
//  ACTIONS
// ══════════════════════════════════════════════

function toggleDone(entryId, day) {
  const entries = APP.assignments[day] || [];
  const entry   = entries.find(x => x.id === entryId);
  if (!entry) return;

  entry.done = !entry.done;
  if (entry.done) {
    const m = APP.members.find(mb => mb.id === entry.memberId);
    const c = APP.chores.find(ch => ch.id === entry.choreId);
    if (m) { m.streak++; m.totalDone++; m.points += (c?.effort || 1); }
    toast(`✓ ${c?.name || 'Task'} done! +${c?.effort || 1} pts`, 'success');
  }

  saveAll();
  renderDashboard();
  if (document.getElementById('page-schedule').classList.contains('active')) renderSchedulePage();
  // SUPABASE HOOK:
  // await supabase.from('assignments').update({ status: entry.done ? 'done' : 'pending' }).eq('id', entryId)
}


// ══════════════════════════════════════════════
//  MODALS — Add/Edit Chore
// ══════════════════════════════════════════════

function showAddChoreModal(prefill = {}) {
  const isEdit  = !!prefill.id;
  const options = (arr, cur) => arr.map(v =>
    `<option value="${v}" ${cur===v?'selected':''}>${v}</option>`).join('');

  openModal(`
    <h2 class="modal-title">${isEdit ? 'Edit' : 'Add'} Chore</h2>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label" for="nc-name">Chore Name</label>
        <input class="form-input" id="nc-name" placeholder="e.g. Clean kitchen" value="${prefill.name||''}" required>
      </div>
      <div class="form-group">
        <label class="form-label" for="nc-icon">Icon</label>
        <input class="form-input" id="nc-icon" placeholder="🧹" style="font-size:18px" value="${prefill.icon||''}">
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label" for="nc-cat">Category</label>
        <select class="form-input" id="nc-cat">
          ${options(['daily','weekly','monthly','quarterly','flexible'], prefill.category)}
        </select>
      </div>
      <div class="form-group">
        <label class="form-label" for="nc-effort">Effort (1–5)</label>
        <input class="form-input" id="nc-effort" type="number" min="1" max="5" value="${prefill.effort||2}">
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label" for="nc-rec">Recurrence</label>
        <select class="form-input" id="nc-rec">
          ${options(['daily','weekly','biweekly','monthly','quarterly','once'], prefill.recurring)}
        </select>
      </div>
      <div class="form-group">
        <label class="form-label" for="nc-time">Time of Day</label>
        <select class="form-input" id="nc-time">
          ${options(['morning','afternoon','evening','night','flexible'], prefill.time)}
        </select>
      </div>
    </div>
    <div class="form-group">
      <label class="form-label" for="nc-assign">Assign to</label>
      <select class="form-input" id="nc-assign">
        <option value="auto">Auto (smart assign)</option>
        ${APP.members.map(m => `<option value="${m.id}">${m.name}</option>`).join('')}
      </select>
    </div>
    <div class="modal-actions">
      <button class="btn btn-ghost" onclick="closeModal()">Cancel</button>
      <button class="btn btn-primary" onclick="saveChore('${prefill.id||''}')">Save Chore</button>
    </div>`);
}

function editChoreModal(id) {
  const c = APP.chores.find(x => x.id === id);
  if (c) showAddChoreModal(c);
}

function saveChore(existingId) {
  const name = document.getElementById('nc-name').value.trim();
  if (!name) { toast('Enter a chore name','warn'); return; }

  const chore = {
    id:        existingId || 'c_' + Date.now(),
    name,
    icon:      document.getElementById('nc-icon').value || '📋',
    category:  document.getElementById('nc-cat').value,
    effort:    parseInt(document.getElementById('nc-effort').value) || 2,
    recurring: document.getElementById('nc-rec').value,
    time:      document.getElementById('nc-time').value,
    type:      name.toLowerCase().replace(/\s+/g,'-'),
  };

  if (existingId) {
    const i = APP.chores.findIndex(c => c.id === existingId);
    if (i !== -1) APP.chores[i] = chore;
  } else {
    APP.chores.push(chore);
  }

  saveAll(); closeModal(); renderChoresPage();
  toast(`"${chore.name}" saved!`, 'success');
  // SUPABASE HOOK:
  // existingId ? await supabase.from('chores').update(chore).eq('id', existingId)
  //            : await supabase.from('chores').insert({ ...chore, circle_id: APP.circle.id })
}

function deleteChore(id) {
  if (!confirm('Delete this chore?')) return;
  APP.chores = APP.chores.filter(c => c.id !== id);
  saveAll(); renderChoresPage(); toast('Chore deleted','warn');
  // SUPABASE HOOK: await supabase.from('chores').delete().eq('id', id)
}


// ══════════════════════════════════════════════
//  MODALS — Member
// ══════════════════════════════════════════════

function editMemberModal(id) {
  const m = APP.members.find(x => x.id === id);
  if (!m) return;

  const allTypes = ['dishes','trash','mop','sweep','vacuum','dog-walk','dusting','mirrors','bathroom','cooking','laundry','groceries','outdoor','pet-care'];

  const swatches = COLORS.map(c => `
    <div class="color-swatch ${m.color===c ? 'selected' : ''}"
         style="background:${c}"
         onclick="document.querySelectorAll('#em-colors .color-swatch').forEach(s=>s.classList.remove('selected'));
                  this.classList.add('selected');
                  document.getElementById('em-color-val').value='${c}'"></div>`).join('');

  const dislikeChips = allTypes.map(t =>
    `<div class="pref-chip em-dislike ${m.dislikes.includes(t)?'selected':''}"
          onclick="this.classList.toggle('selected')" data-t="${t}">${t}</div>`).join('');

  const preferChips = allTypes.map(t =>
    `<div class="pref-chip em-prefer ${m.prefers.includes(t)?'selected':''}"
          onclick="this.classList.toggle('selected')" data-t="${t}">${t}</div>`).join('');

  openModal(`
    <h2 class="modal-title" style="color:${m.color}">Edit ${m.name}</h2>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Name</label>
        <input class="form-input" id="em-name" value="${m.name}">
      </div>
      <div class="form-group">
        <label class="form-label">Age (optional)</label>
        <input class="form-input" id="em-age" type="number" value="${m.age||''}" placeholder="e.g. 21">
      </div>
    </div>
    <div class="form-group">
      <label class="form-label">Colour</label>
      <div class="color-grid" id="em-colors">${swatches}</div>
      <input type="hidden" id="em-color-val" value="${m.color}">
    </div>
    <div class="form-group">
      <label class="form-label">Weekly Capacity (pts)</label>
      <input class="form-input" id="em-cap" type="number" value="${m.capacity}" min="5" max="100">
    </div>
    <div class="form-group">
      <label class="form-label">Dislikes</label>
      <div class="pref-grid">${dislikeChips}</div>
    </div>
    <div class="form-group">
      <label class="form-label">Prefers</label>
      <div class="pref-grid">${preferChips}</div>
    </div>
    <div class="modal-actions">
      <button class="btn btn-ghost" onclick="closeModal()">Cancel</button>
      <button class="btn btn-primary" onclick="saveMember('${id}')">Save</button>
    </div>`);
}

function saveMember(id) {
  const m = APP.members.find(x => x.id === id);
  if (!m) return;

  m.name     = document.getElementById('em-name').value.trim()  || m.name;
  m.age      = parseInt(document.getElementById('em-age').value) || null;
  m.color    = document.getElementById('em-color-val').value;
  m.capacity = parseInt(document.getElementById('em-cap').value) || m.capacity;
  m.dislikes = [...document.querySelectorAll('.em-dislike.selected')].map(el => el.dataset.t);
  m.prefers  = [...document.querySelectorAll('.em-prefer.selected')].map(el => el.dataset.t);

  saveAll(); closeModal(); renderMembersPage(); renderMemberFilterChips();
  toast('Profile updated!', 'success');
  // SUPABASE HOOK: await supabase.from('profiles').update(m).eq('id', id)
}

function showInviteModal() {
  const code = APP.circle?.code || '??????';
  openModal(`
    <h2 class="modal-title">Invite to Circle</h2>
    <div class="invite-box">
      <p style="font-size:12px;color:var(--muted);margin-bottom:4px">Share this code</p>
      <div class="invite-code">${code}</div>
      <p class="invite-hint">Anyone who signs up and enters this code joins your circle</p>
    </div>
    <button class="btn btn-ghost btn-block" style="margin-top:14px" onclick="copyCode('${code}')">📋 Copy Code</button>
    <div class="alert alert-info" style="margin-top:14px">
      <span class="alert-icon">ℹ️</span>
      <div class="alert-body">When they sign up and enter this code, they'll set their preferences and appear in your Members page.</div>
    </div>
    <div class="modal-actions">
      <button class="btn btn-primary" onclick="closeModal()">Done</button>
    </div>`);
}

function showCircleInfo() {
  const code = APP.circle?.code || '??????';
  openModal(`
    <h2 class="modal-title">Circle Settings</h2>
    <div class="form-group">
      <label class="form-label">Circle Name</label>
      <input class="form-input" id="ci-name" value="${APP.circle?.name||''}">
    </div>
    <div class="invite-box" style="margin-top:4px">
      <p style="font-size:12px;color:var(--muted)">Invite Code</p>
      <div class="invite-code" style="font-size:28px">${code}</div>
      <button class="btn btn-ghost btn-sm" onclick="copyCode('${code}')">Copy</button>
    </div>
    <div class="modal-actions">
      <button class="btn btn-ghost" onclick="closeModal()">Cancel</button>
      <button class="btn btn-primary" onclick="saveCircleName()">Save</button>
    </div>`);
}

function saveCircleName() {
  const n = document.getElementById('ci-name').value.trim();
  if (n && APP.circle) {
    APP.circle.name = n;
    document.getElementById('sb-circle-name').textContent = n;
    saveAll();
  }
  closeModal(); toast('Circle updated!', 'success');
}

// ── Reassign modal ──
function showReassignModal(entryId, day) {
  openModal(`
    <h2 class="modal-title">Reassign Chore</h2>
    <div class="form-group">
      <label class="form-label">Assign to</label>
      <select class="form-input" id="ra-select">
        ${APP.members.map(m => `<option value="${m.id}">${m.name}</option>`).join('')}
      </select>
    </div>
    <div class="modal-actions">
      <button class="btn btn-ghost" onclick="closeModal()">Cancel</button>
      <button class="btn btn-primary" onclick="doReassign('${entryId}','${day}')">Reassign</button>
    </div>`);
}

function doReassign(entryId, day) {
  const newId = document.getElementById('ra-select').value;
  const entry = (APP.assignments[day] || []).find(x => x.id === entryId);
  if (entry) { entry.memberId = newId; saveAll(); renderDashboard(); }
  if (document.getElementById('page-schedule').classList.contains('active')) renderSchedulePage();
  closeModal(); toast('Reassigned!', 'success');
}

// ── Swap modal ──
function showSwapModal(entryId, day) {
  const entry  = (APP.assignments[day] || []).find(x => x.id === entryId);
  if (!entry) return;
  const chore  = APP.chores.find(c => c.id === entry.choreId);
  const others = APP.members.filter(m => m.id !== entry.memberId);
  if (!others.length) { toast('No other members to swap with','warn'); return; }

  openModal(`
    <h2 class="modal-title">Request Swap</h2>
    <p style="font-size:13px;color:var(--muted);margin-bottom:16px">
      Chore: <strong style="color:var(--text)">${chore?.name}</strong>
    </p>
    <div class="form-group">
      <label class="form-label">Swap with</label>
      <select class="form-input" id="swap-select">
        ${others.map(m => `<option value="${m.id}">${m.name}</option>`).join('')}
      </select>
    </div>
    <div class="modal-actions">
      <button class="btn btn-ghost" onclick="closeModal()">Cancel</button>
      <button class="btn btn-primary" onclick="doSwap('${entryId}','${day}')">Send Request</button>
    </div>`);
}

function doSwap(entryId, day) {
  const toId   = document.getElementById('swap-select').value;
  const entry  = (APP.assignments[day] || []).find(x => x.id === entryId);
  if (!entry) return;
  const chore  = APP.chores.find(c => c.id === entry.choreId);

  APP.swaps.push({
    id:           'sw_' + Date.now(),
    assignmentId: entryId,
    fromId:       entry.memberId,
    toId,
    choreName:    chore?.name || 'Task',
    day:          DAYS_L[day],
    status:       'pending',
  });

  saveAll(); closeModal(); renderSwapsPage();
  toast('Swap request sent!', 'info');
  // SUPABASE HOOK: await supabase.from('swap_requests').insert(...)
}

// ── Add Rule modal ──
function showAddRuleModal() {
  openModal(`
    <h2 class="modal-title">Add Custom Rule</h2>
    <div class="form-group">
      <label class="form-label">Rule Name</label>
      <input class="form-input" id="nr-name" placeholder="e.g. No chores before 9am">
    </div>
    <div class="form-group">
      <label class="form-label">Description</label>
      <input class="form-input" id="nr-desc" placeholder="What does this rule do?">
    </div>
    <div class="modal-actions">
      <button class="btn btn-ghost" onclick="closeModal()">Cancel</button>
      <button class="btn btn-primary" onclick="saveRule()">Add Rule</button>
    </div>`);
}

function saveRule() {
  const label = document.getElementById('nr-name').value.trim();
  if (!label) { toast('Enter a rule name','warn'); return; }
  APP.rules.push({
    id:    'r_' + Date.now(),
    label,
    desc:  document.getElementById('nr-desc').value,
    on:    true,
  });
  saveAll(); closeModal(); renderRulesPage(); toast('Rule added!', 'success');
}


// ══════════════════════════════════════════════
//  AI SUGGESTIONS
// ══════════════════════════════════════════════

async function showAISuggestions() {
  openModal(`
    <h2 class="modal-title">✨ AI Chore Suggestions</h2>
    <div class="ai-loading">
      <div class="ai-dot"></div>
      <div class="ai-dot"></div>
      <div class="ai-dot"></div>
      <span>Asking AI for suggestions…</span>
    </div>`);

  const currentNames = APP.chores.map(c => c.name).join(', ') || 'none yet';
  const memberInfo   = APP.members.map(m =>
    `${m.name} (cap:${m.capacity}pts, dislikes:${m.dislikes.join(',')||'none'})`
  ).join('; ') || 'one member';

  const prompt = `You are a helpful household chore assistant.
Members: ${memberInfo}
Current chores: ${currentNames}

Suggest 6 chores this household might be missing. Return ONLY a JSON array, no markdown, no explanation. Each item: { "name":"...", "icon":"(single emoji)", "effort":(1-5), "recurring":"daily|weekly|monthly|quarterly", "time":"morning|afternoon|evening|night|flexible", "reason":"one short sentence" }`;

  const suggestions = await callAI(prompt);
  let items = [];

  try {
    items = JSON.parse(suggestions.replace(/```json|```/g,'').trim());
  } catch {
    // Fallback if API unavailable
    items = [
      { name:'Wipe Kitchen Counters', icon:'🧽', effort:1, recurring:'daily',    time:'evening',  reason:'Quick win — keeps the kitchen looking lived-in, not dirty.' },
      { name:'Empty Small Bins',      icon:'🗑️', effort:1, recurring:'weekly',  time:'flexible', reason:'Multiple small bins add up and are easy to forget.' },
      { name:'Clean Microwave',       icon:'📦', effort:2, recurring:'monthly',  time:'flexible', reason:'Gets gross fast but only takes 5 minutes with steam.' },
      { name:'Water Indoor Plants',   icon:'🪴', effort:1, recurring:'weekly',   time:'morning',  reason:'Easy rotating task great for lighter weeks.' },
      { name:'Sanitise Door Handles', icon:'🚪', effort:1, recurring:'weekly',   time:'flexible', reason:'Takes 2 minutes, huge hygiene impact.' },
      { name:'Clear Junk Mail',       icon:'📬', effort:1, recurring:'weekly',   time:'flexible', reason:'Surprisingly cathartic to keep on top of.' },
    ];
  }

  window._aiItems = items;

  const html = `
    <h2 class="modal-title">✨ AI Chore Suggestions</h2>
    <p style="font-size:13px;color:var(--muted);margin-bottom:16px">Based on your household. Click + to add any.</p>
    ${items.map((s, i) => `
      <div class="ai-suggestion">
        <div style="font-size:22px" aria-hidden="true">${s.icon}</div>
        <div style="flex:1">
          <div style="font-weight:500;font-size:13.5px">${s.name}</div>
          <div style="font-size:11px;color:var(--muted);margin-top:2px">${s.recurring} · ${s.effort}pt · ${s.reason}</div>
        </div>
        <span class="ai-badge">AI</span>
        <button class="btn btn-primary btn-xs" id="ai-btn-${i}" onclick="addAISuggestion(${i})">+ Add</button>
      </div>`).join('')}
    <div class="modal-actions">
      <button class="btn btn-ghost" onclick="closeModal()">Done</button>
    </div>`;

  document.getElementById('modal-box').innerHTML = html;
}

async function callAI(prompt) {
  // ── PRODUCTION: call a Supabase Edge Function instead ──
  // const { data } = await supabase.functions.invoke('ai-suggest', { body: { prompt } })
  // return data.text
  // ───────────────────────────────────────────────────────
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 800,
        messages: [{ role:'user', content: prompt }],
      }),
    });
    if (!res.ok) throw new Error('API error');
    const data = await res.json();
    return data.content?.[0]?.text || '';
  } catch { return ''; }
}

function addAISuggestion(i) {
  const s = window._aiItems?.[i];
  if (!s) return;
  const chore = {
    id:        'c_' + Date.now(),
    name:      s.name,
    icon:      s.icon,
    category:  s.recurring === 'daily' ? 'daily' : s.recurring,
    effort:    s.effort,
    recurring: s.recurring,
    time:      s.time,
    type:      s.name.toLowerCase().replace(/\s+/g,'-'),
  };
  APP.chores.push(chore);
  saveAll();
  const btn = document.getElementById(`ai-btn-${i}`);
  if (btn) { btn.textContent = '✓ Added'; btn.disabled = true; btn.className = 'btn btn-success btn-xs'; }
  toast(`"${chore.name}" added!`, 'success');
}


// ══════════════════════════════════════════════
//  NAVIGATION
// ══════════════════════════════════════════════

function showPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById('page-' + id).classList.add('active');
  // Activate matching nav item
  document.querySelectorAll('.nav-item').forEach(n => {
    if (n.getAttribute('onclick')?.includes(`'${id}'`)) n.classList.add('active');
  });

  if (id === 'schedule')  renderSchedulePage();
  if (id === 'chores')    renderChoresPage();
  if (id === 'members')   renderMembersPage();
  if (id === 'rules')     renderRulesPage();
  if (id === 'swaps')     renderSwapsPage();
  if (id === 'analytics') renderAnalytics();
  if (id === 'dashboard') renderDashboard();

  // Close mobile menu
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('mob-overlay').classList.remove('open');
}

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById('screen-' + id).classList.add('active');
}

function toggleMobileMenu() {
  document.getElementById('sidebar').classList.toggle('open');
  document.getElementById('mob-overlay').classList.toggle('open');
}


// ══════════════════════════════════════════════
//  MODAL
// ══════════════════════════════════════════════

function openModal(html) {
  document.getElementById('modal-box').innerHTML = html;
  document.getElementById('modal-overlay').classList.add('open');
  // Focus first input
  setTimeout(() => {
    const first = document.querySelector('#modal-box input, #modal-box select');
    if (first) first.focus();
  }, 220);
}

function closeModal() {
  document.getElementById('modal-overlay').classList.remove('open');
}

function closeModalCheck(e) {
  if (e.target === document.getElementById('modal-overlay')) closeModal();
}

// Escape key closes modal
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeModal();
});


// ══════════════════════════════════════════════
//  TOAST NOTIFICATIONS
// ══════════════════════════════════════════════

function toast(msg, type = 'info') {
  const wrap = document.getElementById('toast-wrap');
  const el   = document.createElement('div');
  el.className = `toast ${type}`;
  el.innerHTML = `<span aria-hidden="true">${type==='success'?'✅':type==='warn'?'⚠️':'ℹ️'}</span><span>${msg}</span>`;
  wrap.appendChild(el);
  setTimeout(() => el.remove(), 3500);
}


// ══════════════════════════════════════════════
//  HELPERS
// ══════════════════════════════════════════════

function makeCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

function copyCode(code) {
  navigator.clipboard.writeText(code)
    .then(()  => toast('Code copied to clipboard!', 'success'))
    .catch(()  => toast(`Your code: ${code}`, 'info'));
}


// ══════════════════════════════════════════════
//  LOCALSTORAGE  (replace each with Supabase calls for production)
// ══════════════════════════════════════════════

function ls(key, val) {
  if (val === undefined) {
    try { return JSON.parse(localStorage.getItem(key)); } catch { return null; }
  }
  try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
}

function saveAll() {
  ls('hb_user',        APP.currentUser);
  ls('hb_circle',      APP.circle);
  ls('hb_members',     APP.members);
  ls('hb_chores',      APP.chores);
  ls('hb_rules',       APP.rules);
  ls('hb_swaps',       APP.swaps);
  ls('hb_assignments', APP.assignments);
}


// ══════════════════════════════════════════════
//  INIT  — check for existing localStorage session
// ══════════════════════════════════════════════

(function init() {
  // ── SUPABASE HOOK ─────────────────────────────────────────────────────────
  // Replace this entire block with:
  // const { data: { session } } = await supabase.auth.getSession()
  // if (session) {
  //   // load user profile + circle from DB
  //   const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single()
  //   const { data: membership } = await supabase.from('circle_members')
  //     .select('circles(*), user_id').eq('user_id', session.user.id).single()
  //   // ... populate APP state, then launchApp()
  // }
  // ─────────────────────────────────────────────────────────────────────────

  const savedUser = ls('hb_user');
  if (!savedUser) return; // Show auth screen (default)

  APP.currentUser  = savedUser;
  APP.circle       = ls('hb_circle');
  APP.members      = ls('hb_members')     || [];
  APP.chores       = ls('hb_chores')      || [];
  APP.rules        = ls('hb_rules')       || DEFAULT_RULES;
  APP.swaps        = ls('hb_swaps')       || [];
  APP.assignments  = ls('hb_assignments') || {};

  if (APP.circle) {
    launchApp();
  } else {
    // Account exists but onboarding wasn't finished
    startOnboarding();
  }
})();
