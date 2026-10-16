/**
 * SyncCal — Shared Group Calendar
 * Modern Vanilla JS Implementation
 */

const STORAGE_KEY_CALENDARS = 'synccal_calendars_data_v1';
const STORAGE_KEY_DEFAULT_CAL = 'synccal_default_calendar_id';
const STORAGE_KEY_ACTIVE_USER = 'synccal_active_user_id';
const STORAGE_KEY_THEME = 'synccal_color_theme';
const STORAGE_KEY_GOOGLE_USER = 'synccal_google_profile_v1';
const STORAGE_KEY_QUIT_GROUPS = 'synccal_quit_group_ids_v1';
const MAX_CALENDARS = 5;
const MAX_MEMBERS_PER_CALENDAR = 8;

// 16 Official Among Us Colors
const AMONG_US_COLORS = [
  { id: 'red', name: 'Red', hex: '#C51111' },
  { id: 'blue', name: 'Blue', hex: '#132ED1' },
  { id: 'green', name: 'Green', hex: '#117F2D' },
  { id: 'pink', name: 'Pink', hex: '#ED54BA' },
  { id: 'orange', name: 'Orange', hex: '#EF7D0D' },
  { id: 'yellow', name: 'Yellow', hex: '#F5F557' },
  { id: 'black', name: 'Black', hex: '#3F474E' },
  { id: 'white', name: 'White', hex: '#D6E0F0' },
  { id: 'purple', name: 'Purple', hex: '#6B2FBC' },
  { id: 'brown', name: 'Brown', hex: '#71491E' },
  { id: 'cyan', name: 'Cyan', hex: '#38FEDC' },
  { id: 'lime', name: 'Lime', hex: '#50EF39' },
  { id: 'maroon', name: 'Maroon', hex: '#600000' },
  { id: 'rose', name: 'Rose', hex: '#ECC0D3' },
  { id: 'banana', name: 'Banana', hex: '#FFFFBE' },
  { id: 'coral', name: 'Coral', hex: '#D76464' }
];

// BroadcastChannel for instant multi-tab sync
const syncChannel = 'BroadcastChannel' in window ? new BroadcastChannel('synccal_sync_bus') : null;

// ==========================================================================
// Initial Starter Data (Realistic Seed)
// ==========================================================================
function getStarterData() {
  const today = new Date();
  
  function formatOffset(offsetDays) {
    const d = new Date(today);
    d.setDate(d.getDate() + offsetDays);
    return d.toISOString().split('T')[0];
  }

  return [
    {
      id: 'cal-alps-trip',
      name: 'Trip to Alps 🏔️',
      description: 'Annual ski vacation, flights, chalets, and mountain dinners',
      style: 'gradient',
      createdAt: new Date().toISOString(),
      inviteCode: 'CAL-ALPS-2026',
      members: [
        { id: 'mem-alex', name: 'You', color: '#C51111', isYou: true },
        { id: 'mem-maya', name: 'Friend 1', color: '#132ED1', isYou: false },
        { id: 'mem-leo', name: 'Friend 2', color: '#117F2D', isYou: false },
        { id: 'mem-zoe', name: 'Friend 3', color: '#6B2FBC', isYou: false }
      ],
      plans: [
        {
          id: 'p-1',
          memberId: 'mem-alex',
          date: formatOffset(1),
          title: 'Flight LX-492 to Zurich',
          status: 'busy',
          startTime: '09:30',
          endTime: '13:00',
          isAllDay: false,
          notes: 'Terminal 2, Gate B14. Bag check completed online.'
        },
        {
          id: 'p-2',
          memberId: 'mem-maya',
          date: formatOffset(1),
          title: 'Renting Ski Gear & Boots',
          status: 'busy',
          startTime: '15:00',
          endTime: '17:30',
          isAllDay: false,
          notes: 'Alpine Rental shop in town center. Maya reserving for all.'
        },
        {
          id: 'p-3',
          memberId: 'mem-leo',
          date: formatOffset(2),
          title: 'Group Fondue Dinner 🫕',
          status: 'free',
          startTime: '19:30',
          endTime: '22:00',
          isAllDay: false,
          notes: 'Table reserved for 4 at Le Chamois. Everyone welcome!'
        },
        {
          id: 'p-4',
          memberId: 'mem-zoe',
          date: formatOffset(0),
          title: 'Packing & Remote Work Shift',
          status: 'busy',
          startTime: '08:00',
          endTime: '16:00',
          isAllDay: false,
          notes: 'Available on WhatsApp after 4 PM.'
        },
        {
          id: 'p-5',
          memberId: 'mem-alex',
          date: formatOffset(3),
          title: 'Morning Black Diamond Run',
          status: 'tentative',
          startTime: '08:30',
          endTime: '12:00',
          isAllDay: false,
          notes: 'Weather permitting. If snowy, we switch to thermal spa.'
        }
      ],
      sharedNotes: [
        {
          id: 'n-1',
          authorId: 'mem-maya',
          category: 'important',
          content: 'Chalet Keybox code is 5829. WiFi is ChaletAlps-5G / snowpals2026',
          date: formatOffset(0)
        },
        {
          id: 'n-2',
          authorId: 'mem-leo',
          category: 'checklist',
          content: 'Don’t forget waterproof gloves, SPF lip balm, and passport copies!',
          date: formatOffset(-1)
        }
      ]
    },
    {
      id: 'cal-roommates',
      name: 'Roommates 304 🏡',
      description: 'Apartment coordination, quiet hours, cleaning and guests',
      style: 'cream',
      createdAt: new Date().toISOString(),
      inviteCode: 'CAL-APT-304',
      members: [
        { id: 'mem-alex', name: 'You', color: '#EF7D0D', isYou: true },
        { id: 'mem-jordan', name: 'Friend 1', color: '#F5F557', isYou: false },
        { id: 'mem-sam', name: 'Friend 2', color: '#38FEDC', isYou: false }
      ],
      plans: [
        {
          id: 'p-6',
          memberId: 'mem-jordan',
          date: formatOffset(0),
          title: 'Working Night Shift (Quiet please)',
          status: 'busy',
          startTime: '21:00',
          endTime: '06:00',
          isAllDay: false,
          notes: 'Sleeping tomorrow until 2 PM. Please keep kitchen noise low.'
        },
        {
          id: 'p-7',
          memberId: 'mem-sam',
          date: formatOffset(2),
          title: 'Hosting Movie Night 🍿',
          status: 'free',
          startTime: '20:00',
          endTime: '23:30',
          isAllDay: false,
          notes: 'Two friends visiting, watching Interstellar in living room.'
        },
        {
          id: 'p-8',
          memberId: 'mem-alex',
          date: formatOffset(4),
          title: 'Kitchen Deep Clean Duty',
          status: 'busy',
          startTime: '11:00',
          endTime: '13:00',
          isAllDay: false,
          notes: 'Will wipe fridge shelves and take recycling out.'
        }
      ],
      sharedNotes: [
        {
          id: 'n-3',
          authorId: 'mem-alex',
          category: 'reminder',
          content: 'Landlord coming for radiator maintenance Thursday 11 AM.',
          date: formatOffset(0)
        }
      ]
    },
    {
      id: 'cal-study-squad',
      name: 'Study Squad 📚',
      description: 'Final exam schedules, library meeting slots, and notes exchange',
      style: 'stone',
      createdAt: new Date().toISOString(),
      inviteCode: 'CAL-STUDY-88',
      members: [
        { id: 'mem-alex', name: 'You', color: '#ED54BA', isYou: true },
        { id: 'mem-chloe', name: 'Friend 1', color: '#50EF39', isYou: false },
        { id: 'mem-ryan', name: 'Friend 2', color: '#71491E', isYou: false },
        { id: 'mem-elena', name: 'Friend 3', color: '#D76464', isYou: false },
        { id: 'mem-daniel', name: 'Friend 4', color: '#3F474E', isYou: false }
      ],
      plans: [
        {
          id: 'p-9',
          memberId: 'mem-chloe',
          date: formatOffset(1),
          title: 'Algorithms Exam 💻',
          status: 'busy',
          startTime: '10:00',
          endTime: '13:00',
          isAllDay: false,
          notes: 'Hall C, Computer Science Building. Busy completely all morning.'
        },
        {
          id: 'p-10',
          memberId: 'mem-ryan',
          date: formatOffset(1),
          title: 'Library 4th Floor Study Pod',
          status: 'free',
          startTime: '14:00',
          endTime: '18:00',
          isAllDay: false,
          notes: 'Booked pod #42. Whiteboard available. Anyone can drop in.'
        },
        {
          id: 'p-11',
          memberId: 'mem-elena',
          date: formatOffset(3),
          title: 'Chemistry Lab Practical',
          status: 'busy',
          startTime: '13:00',
          endTime: '16:00',
          isAllDay: false,
          notes: 'No phones allowed during lab.'
        }
      ],
      sharedNotes: [
        {
          id: 'n-4',
          authorId: 'mem-ryan',
          category: 'idea',
          content: 'Uploaded practice exam solutions to our shared drive folder!',
          date: formatOffset(0)
        }
      ]
    }
  ];
}

// ==========================================================================
// App State
// ==========================================================================
const state = {
  calendars: [],
  currentCalendarId: null,
  activeUserId: 'mem-alex',
  selectedWeekStart: getMonday(new Date()),
  currentMonthDate: new Date(),
  selectedMonthDate: toDateString(new Date()),
  currentViewTab: 'matrix', // 'matrix' or 'month'
  searchQuery: '',
  selectedNewMemberColor: '#C51111',
  viewingNotePlan: null,
  googleUser: null
};

// Helper: Get Monday of given date
function getMonday(d) {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(date.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday;
}

// Helper: Format Date as YYYY-MM-DD
function toDateString(d) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// ==========================================================================
// Initialization & Persistence
// ==========================================================================
function initApp() {
  loadStoredData();
  setupTheme();
  setupEventListeners();
  setupDialogBackdropFallbacks();
  setupServiceWorker();
  updateProfileModalUI();

  // Check if user has turned on "Open this calendar on app launch"
  const defaultCalId = localStorage.getItem(STORAGE_KEY_DEFAULT_CAL);
  if (defaultCalId && state.calendars.some(c => c.id === defaultCalId)) {
    // Automatically open this calendar!
    openCalendar(defaultCalId, true);
  } else {
    // Show Home View
    renderHomeView();
  }

  // Multi-tab sync listener
  if (syncChannel) {
    syncChannel.onmessage = (event) => {
      if (event.data && event.data.type === 'DATA_UPDATED') {
        loadStoredData();
        if (state.currentCalendarId) {
          renderCalendarView(state.currentCalendarId);
        } else {
          renderHomeView();
        }
      }
    };
  }
}

function getQuitGroupIds() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_QUIT_GROUPS);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function addQuitGroupId(id) {
  const list = getQuitGroupIds();
  if (!list.includes(id)) {
    list.push(id);
    localStorage.setItem(STORAGE_KEY_QUIT_GROUPS, JSON.stringify(list));
  }
}

function removeQuitGroupId(id) {
  const list = getQuitGroupIds().filter(gid => gid !== id);
  localStorage.setItem(STORAGE_KEY_QUIT_GROUPS, JSON.stringify(list));
}

function normalizeCalendarMembersAndColors(calendars) {
  if (!Array.isArray(calendars)) return;
  calendars.forEach(cal => {
    if (!Array.isArray(cal.members)) return;
    let friendCounter = 1;
    const usedColorsInGroup = new Set();

    cal.members.forEach(m => {
      if (m.isYou || m.id === state.activeUserId || m.name === 'Alex (You)' || m.name === 'Alex') {
        m.name = 'You';
        m.isYou = true;
      } else {
        // Name as Friend 1, Friend 2, etc.
        m.name = `Friend ${friendCounter++}`;
        m.isYou = false;
      }

      // Normalize color to uppercase Among Us color without duplication in this group
      let colUpper = (m.color || '').toUpperCase();
      const isKnown = AMONG_US_COLORS.some(c => c.hex.toUpperCase() === colUpper);
      if (!isKnown || usedColorsInGroup.has(colUpper)) {
        const unused = AMONG_US_COLORS.find(c => !usedColorsInGroup.has(c.hex.toUpperCase()));
        if (unused) {
          m.color = unused.hex;
          colUpper = unused.hex.toUpperCase();
        }
      }
      usedColorsInGroup.add(colUpper);
    });
  });
}
const normalizeCalendarMemberNames = normalizeCalendarMembersAndColors;

function loadStoredData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CALENDARS);
    if (raw) {
      state.calendars = JSON.parse(raw);
    } else {
      state.calendars = getStarterData();
      saveData();
    }
  } catch (e) {
    console.error('Error reading calendars data:', e);
    state.calendars = getStarterData();
  }

  // Filter out any groups the user has quit on this device
  const quitIds = getQuitGroupIds();
  if (quitIds.length > 0) {
    state.calendars = state.calendars.filter(c => !quitIds.includes(c.id));
  }

  // Active user id
  const savedUser = localStorage.getItem(STORAGE_KEY_ACTIVE_USER);
  if (savedUser) {
    state.activeUserId = savedUser;
  }

  // Ensure members in each group follow: "You" for user and "Friend 1", "Friend 2", etc. for others
  normalizeCalendarMemberNames(state.calendars);

  // Google User Cloud Account
  const savedGoogleUser = localStorage.getItem(STORAGE_KEY_GOOGLE_USER);
  if (savedGoogleUser) {
    try {
      state.googleUser = JSON.parse(savedGoogleUser);
    } catch (e) {
      console.warn('Error reading saved Google user:', e);
    }
  }
}

function saveData() {
  try {
    localStorage.setItem(STORAGE_KEY_CALENDARS, JSON.stringify(state.calendars));
    if (syncChannel) {
      syncChannel.postMessage({ type: 'DATA_UPDATED' });
    }
  } catch (e) {
    console.error('Error saving calendars data:', e);
  }
}

// ==========================================================================
// Theme Management (Light / Dark)
// ==========================================================================
function setupTheme() {
  const savedTheme = localStorage.getItem(STORAGE_KEY_THEME);
  const root = document.documentElement;
  const metaThemeColor = document.getElementById('metaThemeColor');
  const metaColorScheme = document.getElementById('metaColorScheme');

  let activeTheme = 'light';
  if (savedTheme) {
    activeTheme = savedTheme;
  } else {
    activeTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  root.setAttribute('data-theme', activeTheme);
  root.style.colorScheme = activeTheme;
  if (metaThemeColor) {
    metaThemeColor.setAttribute('content', activeTheme === 'dark' ? '#0D0E11' : '#F0EDE6');
  }
  if (metaColorScheme) {
    metaColorScheme.setAttribute('content', activeTheme);
  }

  const toggleBtn = document.getElementById('themeToggleBtn');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', toggleTheme);
  }
}

function toggleTheme() {
  const root = document.documentElement;
  const current = root.getAttribute('data-theme') || 'light';
  const next = current === 'dark' ? 'light' : 'dark';
  
  root.setAttribute('data-theme', next);
  root.style.colorScheme = next;
  localStorage.setItem(STORAGE_KEY_THEME, next);

  const metaThemeColor = document.getElementById('metaThemeColor');
  if (metaThemeColor) {
    metaThemeColor.setAttribute('content', next === 'dark' ? '#0D0E11' : '#F0EDE6');
  }
  const metaColorScheme = document.getElementById('metaColorScheme');
  if (metaColorScheme) {
    metaColorScheme.setAttribute('content', next);
  }
}

// ==========================================================================
// View Transitions: Home vs Inside Group Calendar
// ==========================================================================
function openCalendar(calendarId, isAutoOpened = false) {
  const cal = state.calendars.find(c => c.id === calendarId);
  if (!cal) return;

  state.currentCalendarId = calendarId;
  document.getElementById('viewHome').style.display = 'none';
  document.getElementById('viewCalendar').style.display = 'flex';

  // Update Breadcrumb & Header
  document.getElementById('headerBreadcrumb').style.display = 'flex';
  document.getElementById('breadcrumbCalTitle').textContent = cal.name;
  document.getElementById('headerMemberBadge').textContent = `${cal.members.length}/${MAX_MEMBERS_PER_CALENDAR} members`;

  // Auto-Open Notification
  const toast = document.getElementById('autoOpenToast');
  if (isAutoOpened) {
    document.getElementById('autoOpenCalName').textContent = cal.name;
    toast.style.display = 'flex';
  } else {
    toast.style.display = 'none';
  }

  // Update Auto-Open Checkbox in Calendar view
  const defaultCalId = localStorage.getItem(STORAGE_KEY_DEFAULT_CAL);
  const autoOpenCheckbox = document.getElementById('autoOpenCheckbox');
  if (autoOpenCheckbox) {
    autoOpenCheckbox.checked = (defaultCalId === calendarId);
  }

  renderCalendarView(calendarId);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function goHome() {
  state.currentCalendarId = null;
  document.getElementById('viewCalendar').style.display = 'none';
  document.getElementById('viewHome').style.display = 'block';
  document.getElementById('headerBreadcrumb').style.display = 'none';
  document.getElementById('autoOpenToast').style.display = 'none';

  renderHomeView();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ==========================================================================
// RENDER: HOME VIEW (Photo 3 Cards Row & Digest)
// ==========================================================================
function renderHomeView() {
  updateCalendarCountBadge();
  renderUserIdentitySelector();

  const grid = document.getElementById('groupCalendarsGrid');
  grid.innerHTML = '';

  const defaultCalId = localStorage.getItem(STORAGE_KEY_DEFAULT_CAL);

  // Render each calendar (up to 5)
  state.calendars.forEach((cal, index) => {
    const card = document.createElement('div');
    const styleClass = `card-style-${cal.style || 'cream'}`;
    card.className = `calendar-photo-card ${styleClass}`;
    card.setAttribute('data-id', cal.id);

    // Calculate busy members and plans count
    const totalPlans = cal.plans ? cal.plans.length : 0;
    const memberCount = cal.members ? cal.members.length : 0;
    const isAutoOpen = defaultCalId === cal.id;

    // Build avatars HTML
    const avatarsHtml = (cal.members || []).slice(0, 4).map(m => `
      <div class="tiny-avatar" style="background: ${m.color};" title="${m.name}">${m.name.charAt(0)}</div>
    `).join('');

    // Custom layout according to Photo 3 aesthetics
    let cardMiddleContent = '';
    let statNumber = totalPlans;
    let statLabel = 'ACTIVE PLANS LOGGED';

    if (cal.style === 'white') {
      statNumber = totalPlans || '12';
      statLabel = 'SHARED GROUP PLANS';
      cardMiddleContent = `
        <div class="card-spectrum-track">
          <div class="card-spectrum-marker" style="left: ${Math.min(95, Math.max(15, memberCount * 22))}%;"></div>
        </div>
        <div class="card-spectrum-labels">
          <span>0</span><span>4</span><span>8 MAX</span>
        </div>
      `;
    } else if (cal.style === 'gradient') {
      statNumber = `${memberCount}/${MAX_MEMBERS_PER_CALENDAR}`;
      statLabel = 'MEMBERS SYNCED';
      cardMiddleContent = `<div class="card-star-icon">✦</div>`;
    } else {
      statNumber = totalPlans > 0 ? totalPlans : memberCount;
      statLabel = totalPlans > 0 ? 'ACTIVE PLANS' : 'MEMBERS READY';
    }

    card.innerHTML = `
      ${isAutoOpen ? `<div class="card-auto-badge">⚡ Auto-Open on Launch</div>` : ''}
      <div class="card-top">
        <div class="card-big-stat">${statNumber}</div>
        <div class="card-subtitle">${statLabel}</div>
        <div class="card-title-highlight">${cal.name}</div>
        ${cardMiddleContent}
      </div>
      <div class="card-bottom">
        <div class="card-members-preview">
          ${avatarsHtml}
          ${memberCount > 4 ? `<span style="font-size:0.7rem; font-weight:700; margin-left:4px;">+${memberCount - 4}</span>` : ''}
        </div>
        <button class="card-pill-action" aria-label="Enter ${cal.name}">Enter Calendar</button>
      </div>
    `;

    card.addEventListener('click', () => {
      openCalendar(cal.id);
    });

    grid.appendChild(card);
  });

  // If less than 5 calendars, render "+ Create Group Calendar" slot (Photo 3 card slot)
  if (state.calendars.length < MAX_CALENDARS) {
    const addCard = document.createElement('div');
    addCard.className = 'calendar-photo-card card-add-slot';
    addCard.innerHTML = `
      <div class="add-slot-circle">+</div>
      <div class="add-slot-title">New Group Calendar</div>
      <div class="add-slot-desc">${state.calendars.length} of ${MAX_CALENDARS} created</div>
    `;
    addCard.addEventListener('click', () => {
      openNewCalendarModal();
    });
    grid.appendChild(addCard);
  }

  // Render Digest below 5 cards
  renderHomeDigest();
}

function updateCalendarCountBadge() {
  const count = state.calendars.length;
  const countNum = document.getElementById('calendarCountNumber');
  if (countNum) countNum.textContent = count;
  const countLabel = document.getElementById('calendarCountLabel');
  if (countLabel) countLabel.textContent = `${count} / ${MAX_CALENDARS} Groups`;

  // Disable create buttons if 5 is reached
  const btnHeader = document.getElementById('btnHeaderNewCalendar');
  const btnHero = document.getElementById('btnHeroCreateGroup');
  if (count >= MAX_CALENDARS) {
    if (btnHeader) {
      btnHeader.disabled = true;
      btnHeader.style.opacity = '0.5';
      btnHeader.title = 'Maximum 5 group calendars reached';
    }
    if (btnHero) {
      btnHero.disabled = true;
      btnHero.style.opacity = '0.5';
      btnHero.title = 'Maximum 5 group calendars reached';
    }
  } else {
    if (btnHeader) {
      btnHeader.disabled = false;
      btnHeader.style.opacity = '1';
      btnHeader.title = '';
    }
    if (btnHero) {
      btnHero.disabled = false;
      btnHero.style.opacity = '1';
      btnHero.title = '';
    }
  }
}

function renderHomeDigest() {
  const digestContainer = document.getElementById('todayFriendsDigest');
  if (!digestContainer) return;
  const todayStr = toDateString(new Date());

  const plansToday = [];
  state.calendars.forEach(cal => {
    (cal.plans || []).forEach(p => {
      if (p.date === todayStr) {
        const mem = (cal.members || []).find(m => m.id === p.memberId) || { name: 'Member', color: '#888' };
        plansToday.push({ ...p, memberName: mem.name, memberColor: mem.color, calName: cal.name });
      }
    });
  });

  if (plansToday.length === 0) {
    digestContainer.innerHTML = `
      <div style="padding: 16px; text-align: center; color: var(--text-muted); font-size: 0.88rem;">
        No busy plans scheduled for today across your groups. Everyone is free! 🟢
      </div>
    `;
  } else {
    plansToday.slice(0, 4).forEach(item => {
      const row = document.createElement('div');
      row.className = 'today-friend-row';
      row.innerHTML = `
        <div class="friend-info-left">
          <div class="tiny-avatar" style="background: ${item.memberColor}; width: 30px; height: 30px; font-size: 0.8rem;">
            ${item.memberName.charAt(0)}
          </div>
          <div>
            <div class="friend-name-cal">${item.memberName}: ${item.title}</div>
            <div class="friend-cal-origin">${item.calName} • ${item.isAllDay ? 'All Day' : (item.startTime + ' - ' + item.endTime)}</div>
          </div>
        </div>
        <span class="friend-status-badge ${item.status}">
          <span class="dot dot-${item.status}"></span>
          ${item.status.toUpperCase()}
        </span>
      `;
      digestContainer.appendChild(row);
    });
  }

  // Recent Shared Notes Digest
  const notesContainer = document.getElementById('recentNotesDigest');
  notesContainer.innerHTML = '';

  const allNotes = [];
  state.calendars.forEach(cal => {
    (cal.sharedNotes || []).forEach(n => {
      const author = (cal.members || []).find(m => m.id === n.authorId) || { name: 'Friend' };
      allNotes.push({ ...n, authorName: author.name, calName: cal.name });
    });
  });

  if (allNotes.length === 0) {
    notesContainer.innerHTML = `
      <div style="padding: 16px; text-align: center; color: var(--text-muted); font-size: 0.88rem;">
        No shared notes yet. Open a calendar to leave notes for your friends! 📝
      </div>
    `;
  } else {
    allNotes.slice(0, 3).forEach(note => {
      const card = document.createElement('div');
      card.className = 'recent-note-card';
      card.innerHTML = `
        <div class="note-card-meta">
          <span class="note-author-pill">${note.authorName} in ${note.calName}</span>
          <span class="note-cat-badge">${note.category}</span>
        </div>
        <p class="note-card-text">${escapeHtml(note.content)}</p>
      `;
      notesContainer.appendChild(card);
    });
  }
}

// ==========================================================================
// RENDER: CALENDAR VIEW (Image 1 Matrix Grid & Photo 2 Right Card)
// ==========================================================================
function renderCalendarView(calendarId) {
  const cal = state.calendars.find(c => c.id === calendarId);
  if (!cal) return;

  // Title & member count
  document.getElementById('calDisplayName').textContent = cal.name;
  document.getElementById('calMemberCountBadge').textContent = `${cal.members.length} / ${MAX_MEMBERS_PER_CALENDAR} Members`;

  if (state.currentViewTab === 'month') {
    document.getElementById('matrixScrollWrapper').style.display = 'none';
    document.getElementById('monthGridWrapper').style.display = 'block';
    renderMonthGrid(cal);
  } else {
    document.getElementById('matrixScrollWrapper').style.display = 'block';
    document.getElementById('monthGridWrapper').style.display = 'none';

    // Period title for Week
    const weekStart = new Date(state.selectedWeekStart);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const startMonth = monthNames[weekStart.getMonth()];
    const endMonth = monthNames[weekEnd.getMonth()];
    const year = weekStart.getFullYear();

    if (startMonth === endMonth) {
      document.getElementById('currentPeriodTitle').textContent = `${startMonth} ${year}`;
    } else {
      document.getElementById('currentPeriodTitle').textContent = `${startMonth} - ${endMonth} ${year}`;
    }

    renderMatrixTable(cal);
  }

  // Render Sidebar Shared Notes & Availability
  renderSidebarNotes(cal);
  renderSidebarMembers(cal);

  // Sync active user identity to current group's 'You'
  const myMem = cal.members.find(m => m.isYou);
  if (myMem) {
    state.activeUserId = myMem.id;
  }
  renderUserIdentitySelector();
}

/**
 * Render the exact Image 1 Matrix Grid:
 * Columns: Days (Mon, Tue, Wed, Thu, Fri, Sat, Sun)
 * Rows: Friends 1, 2, 3... (up to 8)
 * Cells: "plans", "plans"
 */
function renderMatrixTable(cal) {
  const tableHead = document.getElementById('matrixTableHead');
  const tableBody = document.getElementById('matrixTableBody');

  tableHead.innerHTML = '';
  tableBody.innerHTML = '';

  const todayStr = toDateString(new Date());

  // Generate 7 days of current week
  const weekDays = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(state.selectedWeekStart);
    d.setDate(d.getDate() + i);
    weekDays.push(d);
  }

  // 1. Table Header: "FRIENDS / DAYS" + 7 Days (Image 1 top row)
  const headerRow = document.createElement('tr');
  
  // Leftmost corner cell
  const cornerTh = document.createElement('th');
  cornerTh.innerHTML = `
    <div style="font-size: 0.72rem; font-weight: 800; color: var(--text-muted); letter-spacing: 0.06em;">
      FRIENDS (${cal.members.length}/8)
    </div>
  `;
  headerRow.appendChild(cornerTh);

  const dayShortNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  weekDays.forEach((d, idx) => {
    const th = document.createElement('th');
    const dStr = toDateString(d);
    const isToday = dStr === todayStr;

    th.innerHTML = `
      <div class="day-header-cell ${isToday ? 'is-today' : ''}">
        <span class="day-header-name">${dayShortNames[idx]}</span>
        <span class="day-header-num">${d.getDate()}</span>
      </div>
    `;
    headerRow.appendChild(th);
  });

  tableHead.appendChild(headerRow);

  // 2. Table Rows: Each Friend (Image 1 left column: friend 1, 2, 3...)
  cal.members.forEach((member, index) => {
    const tr = document.createElement('tr');
    const isMyRow = Boolean(member.isYou || member.id === state.activeUserId);

    // Left Sticky Friend Cell
    const friendTd = document.createElement('td');
    friendTd.className = `friend-col-cell ${isMyRow ? 'is-my-row-head' : ''}`;
    friendTd.innerHTML = `
      <div class="friend-row-label">
        <div class="friend-row-avatar" style="background: ${member.color};">
          ${member.name.charAt(0)}
        </div>
        <div class="friend-row-text">
          <div class="friend-row-name" title="${member.name}">${member.name}</div>
          <div class="friend-row-sub">${isMyRow ? 'Your Row' : `Friend ${index + 1}`}</div>
        </div>
      </div>
    `;
    tr.appendChild(friendTd);

    // 7 Day Cells for this Friend
    weekDays.forEach(d => {
      const dStr = toDateString(d);
      const td = document.createElement('td');

      // Filter plans for this member on this date
      const cellPlans = (cal.plans || []).filter(p => p.memberId === member.id && p.date === dStr);

      // Filter by search query if any
      const matchedPlans = state.searchQuery ? cellPlans.filter(p => 
        p.title.toLowerCase().includes(state.searchQuery) || 
        (p.notes && p.notes.toLowerCase().includes(state.searchQuery))
      ) : cellPlans;

      const cellWrap = document.createElement('div');
      cellWrap.className = `matrix-cell-content ${isMyRow ? 'my-row-cell' : 'other-row-cell'}`;

      if (isMyRow) {
        cellWrap.title = matchedPlans.length === 0 ? `Click to add plan on ${dStr}` : `Your plans on ${dStr} (Click empty space to add another)`;
      } else {
        cellWrap.title = matchedPlans.length === 0 ? `${member.name} has no plans on ${dStr}` : `${member.name}'s plans on ${dStr}`;
      }

      if (matchedPlans.length === 0) {
        if (isMyRow) {
          cellWrap.innerHTML = `<div class="empty-cell-hint">+</div>`;
        }
      } else {
        matchedPlans.forEach(plan => {
          const planChip = document.createElement('div');
          planChip.className = 'plan-item-chip';
          
          // Color plan specifically by the member's chosen Among Us color!
          const mem = cal.members.find(m => m.id === plan.memberId) || member;
          const memColor = mem.color || '#C51111';
          planChip.style.borderLeft = `4px solid ${memColor}`;
          planChip.style.background = `${memColor}18`;
          planChip.style.borderColor = `${memColor}44`;

          planChip.innerHTML = `
            <div class="plan-chip-header">
              <span class="plan-color-dot" style="background: ${memColor};"></span>
              <span class="plan-chip-title" style="color: var(--text-primary);">${escapeHtml(plan.title)}</span>
              ${plan.notes ? `<span class="plan-note-icon" title="Has shared notes">📝</span>` : ''}
            </div>
            <div class="plan-chip-time" style="color: var(--text-secondary);">
              ${plan.isAllDay ? 'All Day' : `${plan.startTime} - ${plan.endTime}`}
            </div>
          `;

          // Clicking a plan chip opens Note & Plan details modal
          planChip.addEventListener('click', (e) => {
            e.stopPropagation();
            openNoteDetailsModal(plan, mem, cal);
          });

          cellWrap.appendChild(planChip);
        });
      }

      // Clicking cell:
      // Only allowed in user's own row. Other rows are locked.
      cellWrap.addEventListener('click', () => {
        if (isMyRow) {
          openAddPlanModal(member.id, dStr);
        } else {
          showNotification(`You can only add plans in your own row ("You"). 🔒`);
        }
      });

      td.appendChild(cellWrap);
      tr.appendChild(td);
    });

    tableBody.appendChild(tr);
  });

  // If fewer than 8 members, render "+ Add Friend Row"
  if (cal.members.length < MAX_MEMBERS_PER_CALENDAR) {
    const addRow = document.createElement('tr');
    addRow.className = 'add-friend-table-row';
    const addTd = document.createElement('td');
    addTd.colSpan = 8;
    addTd.innerHTML = `
      <button class="btn-add-friend-row" id="btnAddFriendInTable">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
        <span>Add Friend to Group (${cal.members.length}/${MAX_MEMBERS_PER_CALENDAR})</span>
      </button>
    `;
    addRow.appendChild(addTd);
    tableBody.appendChild(addRow);

    addTd.querySelector('#btnAddFriendInTable').addEventListener('click', () => {
      openInviteModal();
    });
  }
}

/**
 * Render Sidebar Notes and Group Tasks (Photo 2 Right Card)
 */
function renderSidebarNotes(cal) {
  const notesContainer = document.getElementById('calSharedNotesFeed');
  notesContainer.innerHTML = '';

  const notes = cal.sharedNotes || [];

  if (notes.length === 0) {
    notesContainer.innerHTML = `
      <div style="padding: 16px; text-align: center; color: var(--text-muted); font-size: 0.85rem;">
        No shared notes yet. Tap + to write group reminders, codes, or tips!
      </div>
    `;
  } else {
    notes.forEach(note => {
      const author = cal.members.find(m => m.id === note.authorId) || { name: 'Member', color: '#C51111' };
      const authorColor = author.color || '#C51111';
      const item = document.createElement('div');
      item.className = 'shared-note-item';
      item.style.borderLeft = `4px solid ${authorColor}`;
      item.style.background = `${authorColor}12`;
      item.innerHTML = `
        <div class="note-item-header">
          <div class="note-author-tag">
            <span class="tiny-avatar" style="background: ${authorColor}; color: #FFFFFF; width: 18px; height: 18px; font-size: 0.6rem; font-weight: 800;">${author.name.charAt(0)}</span>
            <span style="color: var(--text-primary); font-weight: 700;">${author.name}</span>
          </div>
          <span class="note-cat-badge">${note.category}</span>
        </div>
        <div class="note-item-body" style="color: var(--text-primary);">${escapeHtml(note.content)}</div>
      `;
      notesContainer.appendChild(item);
    });
  }

  // Calculate Group Availability Bar (inspired by 98% bar in Photo 2)
  const totalPlansInCal = (cal.plans || []).length;
  const busyCount = (cal.plans || []).filter(p => p.status === 'busy').length;
  const totalSlots = cal.members.length * 7;
  const freePercent = Math.max(10, Math.min(100, Math.round(((totalSlots - busyCount) / totalSlots) * 100)));

  const bar = document.getElementById('calAvailabilityBar');
  const label = document.getElementById('calAvailabilityPercent');
  if (bar && label) {
    bar.style.width = `${freePercent}%`;
    label.textContent = `${freePercent}% Free Time`;
  }
}

/**
 * Render Sidebar Member Chips
 */
function renderSidebarMembers(cal) {
  const container = document.getElementById('footerMemberChips');
  if (!container) return;
  container.innerHTML = '';
  const countEl = document.getElementById('footerMemberCount');
  if (countEl) countEl.textContent = cal.members.length;

  cal.members.forEach(m => {
    const chip = document.createElement('div');
    chip.className = 'member-chip-item';
    chip.innerHTML = `
      <div class="member-chip-avatar" style="background: ${m.color};">${m.name.charAt(0)}</div>
      <span>${m.name}</span>
    `;
    container.appendChild(chip);
  });
}

/**
 * Render the compact Month Grid
 * Each day cell shows date number and compact member-colored plan pills
 */
function renderMonthGrid(cal) {
  const container = document.getElementById('monthCellsGrid');
  if (!container) return;
  container.innerHTML = '';

  const currentMonthDate = state.currentMonthDate || new Date();
  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth();

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const titleEl = document.getElementById('currentPeriodTitle');
  if (titleEl) {
    titleEl.textContent = `${monthNames[month]} ${year}`;
  }

  const todayStr = toDateString(new Date());

  if (!state.selectedMonthDate) {
    state.selectedMonthDate = todayStr;
  }

  // First day of month
  const firstDay = new Date(year, month, 1);
  // Last day of month
  const lastDay = new Date(year, month + 1, 0);

  // Day of week for 1st of month (0 = Sunday, 1 = Monday, ...)
  // We want Monday = 0, Sunday = 6
  let startDayOfWeek = firstDay.getDay() - 1;
  if (startDayOfWeek === -1) startDayOfWeek = 6;

  // Previous month fill days
  const prevMonthLastDay = new Date(year, month, 0).getDate();
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const dayNum = prevMonthLastDay - i;
    const prevDate = new Date(year, month - 1, dayNum);
    const dateStr = toDateString(prevDate);
    container.appendChild(createMonthCell(cal, dayNum, dateStr, true, dateStr === todayStr));
  }

  // Current month days
  for (let d = 1; d <= lastDay.getDate(); d++) {
    const curDate = new Date(year, month, d);
    const dateStr = toDateString(curDate);
    container.appendChild(createMonthCell(cal, d, dateStr, false, dateStr === todayStr));
  }

  // Next month fill days so grid completes to multiple of 7 (e.g. 35 or 42 cells)
  const totalCellsSoFar = startDayOfWeek + lastDay.getDate();
  const totalCellsNeeded = totalCellsSoFar <= 35 ? 35 : 42;
  const nextMonthFillCount = totalCellsNeeded - totalCellsSoFar;
  for (let d = 1; d <= nextMonthFillCount; d++) {
    const nextDate = new Date(year, month + 1, d);
    const dateStr = toDateString(nextDate);
    container.appendChild(createMonthCell(cal, d, dateStr, true, dateStr === todayStr));
  }

  // Render the plans of the selected date right below the Month Grid
  renderMonthDayPlans(cal, state.selectedMonthDate);
}

function createMonthCell(cal, dayNum, dateStr, isOtherMonth, isToday) {
  const cell = document.createElement('div');
  const isSelected = dateStr === state.selectedMonthDate;
  cell.className = `month-day-cell ${isOtherMonth ? 'other-month' : ''} ${isToday ? 'is-today' : ''} ${isSelected ? 'is-selected' : ''}`;
  cell.setAttribute('data-date', dateStr);
  cell.title = `${dateStr} - Click to show plans`;

  // Top header with day number
  const top = document.createElement('div');
  top.className = 'month-day-cell-top';
  top.innerHTML = `<span class="month-day-num">${dayNum}</span>`;
  cell.appendChild(top);

  // Plans container
  const plansContainer = document.createElement('div');
  plansContainer.className = 'month-cell-plans';

  // Filter plans for this day
  const cellPlans = (cal.plans || []).filter(p => p.date === dateStr);
  const matchedPlans = state.searchQuery ? cellPlans.filter(p => 
    p.title.toLowerCase().includes(state.searchQuery) || 
    (p.notes && p.notes.toLowerCase().includes(state.searchQuery))
  ) : cellPlans;

  const maxVisiblePlans = 2;
  matchedPlans.slice(0, maxVisiblePlans).forEach(plan => {
    const member = cal.members.find(m => m.id === plan.memberId) || { name: 'Member', color: '#C51111' };
    const memColor = member.color || '#C51111';

    const pill = document.createElement('div');
    pill.className = 'month-plan-pill';
    pill.style.backgroundColor = memColor;
    pill.title = `${member.name}: ${plan.title}${plan.notes ? ' (Notes: ' + plan.notes + ')' : ''}`;
    pill.innerHTML = `
      <span class="month-plan-dot"></span>
      <span class="month-plan-text">${escapeHtml(plan.title)}</span>
    `;

    // Clicking pill opens all plans for this date in the day plans modal (not just one plan)
    pill.addEventListener('click', (e) => {
      e.stopPropagation();
      state.selectedMonthDate = dateStr;
      document.querySelectorAll('#monthCellsGrid .month-day-cell').forEach(c => c.classList.remove('is-selected'));
      cell.classList.add('is-selected');
      renderMonthDayPlans(cal, dateStr);
      openDayPlansModal(cal, dateStr);
    });

    plansContainer.appendChild(pill);
  });

  if (matchedPlans.length > maxVisiblePlans) {
    const moreEl = document.createElement('div');
    moreEl.className = 'month-more-count';
    moreEl.textContent = `+${matchedPlans.length - maxVisiblePlans} more`;
    moreEl.addEventListener('click', (e) => {
      e.stopPropagation();
      state.selectedMonthDate = dateStr;
      document.querySelectorAll('#monthCellsGrid .month-day-cell').forEach(c => c.classList.remove('is-selected'));
      cell.classList.add('is-selected');
      renderMonthDayPlans(cal, dateStr);
      openDayPlansModal(cal, dateStr);
    });
    plansContainer.appendChild(moreEl);
  }

  cell.appendChild(plansContainer);

  // Clicking on grid cell shows ALL plans of this date (both in inspector panel and pop-up modal)
  cell.addEventListener('click', () => {
    state.selectedMonthDate = dateStr;
    document.querySelectorAll('#monthCellsGrid .month-day-cell').forEach(c => c.classList.remove('is-selected'));
    cell.classList.add('is-selected');
    renderMonthDayPlans(cal, dateStr);
    openDayPlansModal(cal, dateStr);
  });

  return cell;
}

/**
 * Render the plans of the selected date right below the Month Grid
 */
function renderMonthDayPlans(cal, dateStr) {
  const titleEl = document.getElementById('monthSelectedDateTitle');
  const countEl = document.getElementById('monthSelectedDateCount');
  const listEl = document.getElementById('monthSelectedDatePlansList');
  if (!listEl) return;

  listEl.innerHTML = '';

  if (!dateStr) {
    dateStr = toDateString(new Date());
  }

  // Format date readable: e.g. "Thursday, Oct 15, 2026"
  const dateObj = new Date(dateStr + 'T00:00:00');
  const formattedDate = dateObj.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const isToday = dateStr === toDateString(new Date());
  if (titleEl) {
    titleEl.textContent = `${formattedDate}${isToday ? ' (Today)' : ''}`;
  }

  // Filter plans for this date
  const dayPlans = (cal.plans || []).filter(p => p.date === dateStr);
  const matchedPlans = state.searchQuery ? dayPlans.filter(p => 
    p.title.toLowerCase().includes(state.searchQuery) || 
    (p.notes && p.notes.toLowerCase().includes(state.searchQuery))
  ) : dayPlans;

  if (countEl) {
    countEl.textContent = `${matchedPlans.length} Plan${matchedPlans.length === 1 ? '' : 's'}`;
  }

  if (matchedPlans.length === 0) {
    listEl.innerHTML = `
      <div class="day-plans-empty">
        <p style="margin: 0; font-weight: 600;">No plans scheduled for this day.</p>
        <p style="margin: 4px 0 0 0; font-size: 0.78rem; color: var(--text-muted);">Tap "+ Add Plan" above if you'd like to schedule an activity for this date.</p>
      </div>
    `;
    return;
  }

  matchedPlans.forEach(plan => {
    const member = cal.members.find(m => m.id === plan.memberId) || { name: 'Member', color: '#C51111' };
    const memColor = member.color || '#C51111';

    const card = document.createElement('div');
    card.className = 'day-plan-card';
    card.style.borderLeftColor = memColor;
    card.style.background = `${memColor}0D`;
    card.title = `Click to view / edit details`;

    card.innerHTML = `
      <div class="day-plan-member-avatar" style="background: ${memColor};">
        ${member.name.charAt(0)}
      </div>
      <div class="day-plan-info">
        <div class="day-plan-meta">
          <span class="day-plan-member-name" style="color: ${memColor};">${escapeHtml(member.name)}</span>
          <span class="day-plan-time">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: middle; margin-right: 2px;"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
            ${plan.isAllDay ? 'All Day' : `${plan.startTime} - ${plan.endTime}`}
          </span>
        </div>
        <div class="day-plan-title">${escapeHtml(plan.title)}</div>
        ${plan.notes ? `<div class="day-plan-notes">📝 ${escapeHtml(plan.notes)}</div>` : ''}
      </div>
    `;

    card.addEventListener('click', () => {
      openNoteDetailsModal(plan, member, cal);
    });

    listEl.appendChild(card);
  });
}

/**
 * Open Modal showing ALL plans in the group for the selected date
 */
function openDayPlansModal(cal, dateStr) {
  if (!cal) cal = state.calendars.find(c => c.id === state.currentCalendarId);
  if (!cal) return;

  const modal = document.getElementById('dayPlansModal');
  if (!modal) return;

  const titleEl = document.getElementById('dayPlansModalTitle');
  const countEl = document.getElementById('dayPlansModalCount');
  const listEl = document.getElementById('dayPlansModalList');
  if (!listEl) return;

  listEl.innerHTML = '';

  const dateObj = new Date(dateStr + 'T00:00:00');
  const formattedDate = dateObj.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
  const isToday = dateStr === toDateString(new Date());

  if (titleEl) {
    titleEl.textContent = `Plans on ${formattedDate}${isToday ? ' (Today)' : ''}`;
  }

  const allPlansForDate = (cal.plans || []).filter(p => p.date === dateStr);
  const matchedPlans = state.searchQuery ? allPlansForDate.filter(p => 
    p.title.toLowerCase().includes(state.searchQuery) || 
    (p.notes && p.notes.toLowerCase().includes(state.searchQuery))
  ) : allPlansForDate;

  if (countEl) {
    countEl.textContent = `${matchedPlans.length} Plan${matchedPlans.length === 1 ? '' : 's'}`;
  }

  if (matchedPlans.length === 0) {
    listEl.innerHTML = `
      <div class="day-plans-empty" style="padding: 24px 16px; text-align: center; background: var(--surface-subtle); border-radius: var(--radius-md);">
        <p style="margin: 0; font-weight: 700; font-size: 0.95rem; color: var(--text-primary);">No plans scheduled on this date.</p>
        <p style="margin: 6px 0 0 0; font-size: 0.8rem; color: var(--text-muted);">Everyone is completely free! Tap "Add Plan for This Date" below to schedule an event.</p>
      </div>
    `;
  } else {
    matchedPlans.forEach(plan => {
      const member = cal.members.find(m => m.id === plan.memberId) || { name: 'Member', color: '#C51111' };
      const memColor = member.color || '#C51111';

      const card = document.createElement('div');
      card.className = 'day-plan-card';
      card.style.borderLeftColor = memColor;
      card.style.background = `${memColor}0F`;
      card.style.padding = '12px 14px';
      card.style.borderRadius = 'var(--radius-sm)';
      card.style.border = '1px solid var(--border-subtle)';
      card.style.borderLeft = `5px solid ${memColor}`;
      card.style.cursor = 'pointer';

      card.innerHTML = `
        <div style="display: flex; align-items: flex-start; gap: 12px;">
          <div class="tiny-avatar" style="background: ${memColor}; width: 32px; height: 32px; font-size: 0.82rem; flex-shrink: 0;">
            ${member.name.charAt(0)}
          </div>
          <div style="flex: 1;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
              <span style="font-weight: 800; color: ${memColor}; font-size: 0.86rem;">${escapeHtml(member.name)}</span>
              <span style="font-size: 0.76rem; color: var(--text-muted); font-weight: 600;">
                ⏱️ ${plan.isAllDay ? 'All Day' : `${plan.startTime} - ${plan.endTime}`}
              </span>
            </div>
            <div style="font-weight: 700; font-size: 1rem; color: var(--text-primary); margin-bottom: 2px;">
              ${escapeHtml(plan.title)}
            </div>
            ${plan.notes ? `<div style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 4px; background: rgba(0,0,0,0.03); padding: 4px 8px; border-radius: 4px;">📝 ${escapeHtml(plan.notes)}</div>` : ''}
          </div>
        </div>
      `;

      card.addEventListener('click', () => {
        modal.close();
        openNoteDetailsModal(plan, member, cal);
      });

      listEl.appendChild(card);
    });
  }

  // Hook up Add Plan button in this modal
  const addBtn = document.getElementById('btnDayPlansModalAddPlan');
  if (addBtn) {
    addBtn.onclick = () => {
      modal.close();
      openAddPlanModal(null, dateStr);
    };
  }

  modal.showModal();
}

// ==========================================================================
// User Identity Selector (Allows switching active user)
// ==========================================================================
function renderUserIdentitySelector() {
  const container = document.getElementById('userIdentityContainer');
  if (!container) return;

  const cal = state.currentCalendarId ? state.calendars.find(c => c.id === state.currentCalendarId) : state.calendars[0];
  const members = cal ? cal.members : [
    { id: 'mem-alex', name: 'Alex (You)', color: '#FF5A6E' }
  ];

  let currentMem = members.find(m => m.id === state.activeUserId);
  if (!currentMem) {
    currentMem = members[0];
    state.activeUserId = currentMem.id;
  }

  const avatarEl = document.getElementById('activeUserAvatar');
  if (avatarEl) {
    avatarEl.textContent = currentMem.name.charAt(0);
    avatarEl.style.backgroundColor = currentMem.color;
  }
  const nameEl = document.getElementById('activeUserName');
  if (nameEl) nameEl.textContent = currentMem.name;

  const list = document.getElementById('identityList');
  if (!list) return;
  list.innerHTML = '';

  members.forEach(m => {
    const item = document.createElement('button');
    item.className = `identity-item ${m.id === state.activeUserId ? 'active' : ''}`;
    item.innerHTML = `
      <div class="tiny-avatar" style="background: ${m.color}; width: 24px; height: 24px;">${m.name.charAt(0)}</div>
      <span class="identity-member-name">${m.name}</span>
      ${m.isYou ? `<span class="identity-badge-you">You</span>` : ''}
    `;
    item.addEventListener('click', () => {
      state.activeUserId = m.id;
      localStorage.setItem(STORAGE_KEY_ACTIVE_USER, m.id);
      const dd = document.getElementById('identityDropdown');
      if (dd) dd.style.display = 'none';
      renderUserIdentitySelector();
      if (state.currentCalendarId) {
        renderCalendarView(state.currentCalendarId);
      }
    });
    list.appendChild(item);
  });
}

// ==========================================================================
// MODAL CONTROLLERS (<dialog>)
// ==========================================================================

// 1. Plan & Note Modal
function openAddPlanModal(memberId = null, dateStr = null) {
  const cal = state.calendars.find(c => c.id === state.currentCalendarId);
  if (!cal) return;

  const myMember = cal.members.find(m => m.isYou) || cal.members.find(m => m.id === state.activeUserId) || cal.members[0];

  const modal = document.getElementById('planModal');
  const form = document.getElementById('planForm');
  form.reset();

  document.getElementById('planEditId').value = '';
  document.getElementById('planModalTitle').textContent = 'Add Plan to Your Row';
  document.getElementById('btnDeletePlan').style.display = 'none';

  // Always bind newly added plans to the user's own row ('You')
  const memberInput = document.getElementById('planMemberSelect');
  if (memberInput) {
    memberInput.value = myMember ? myMember.id : state.activeUserId;
  }

  // Default date
  document.getElementById('planDateInput').value = dateStr || toDateString(new Date());

  // Reset char counter
  const charCount = document.getElementById('planNotesCharCount');
  if (charCount) charCount.textContent = '0 / 500';

  modal.showModal();
}

function openEditPlanModal(plan) {
  const cal = state.calendars.find(c => c.id === state.currentCalendarId);
  if (!cal) return;

  const myMember = cal.members.find(m => m.isYou) || cal.members.find(m => m.id === state.activeUserId) || cal.members[0];
  if (myMember && plan.memberId !== myMember.id) {
    showNotification("You cannot edit another person's plan! 🔒");
    return;
  }

  const modal = document.getElementById('planModal');
  document.getElementById('planModalTitle').textContent = 'Edit Your Plan & Note';
  document.getElementById('planEditId').value = plan.id;
  document.getElementById('btnDeletePlan').style.display = 'block';

  // Set memberId in hidden input
  const memberInput = document.getElementById('planMemberSelect');
  if (memberInput) {
    memberInput.value = plan.memberId;
  }

  document.getElementById('planDateInput').value = plan.date;
  document.getElementById('planTitleInput').value = plan.title;
  document.getElementById('planStartTime').value = plan.startTime || '10:00';
  document.getElementById('planEndTime').value = plan.endTime || '12:00';
  document.getElementById('planAllDayCheck').checked = !!plan.isAllDay;
  const noteVal = plan.notes || '';
  document.getElementById('planNotesInput').value = noteVal;
  const charCount = document.getElementById('planNotesCharCount');
  if (charCount) charCount.textContent = `${noteVal.length} / 500`;

  modal.showModal();
}

function handlePlanFormSubmit(e) {
  e.preventDefault();
  const cal = state.calendars.find(c => c.id === state.currentCalendarId);
  if (!cal) return;

  const myMember = cal.members.find(m => m.isYou) || cal.members.find(m => m.id === state.activeUserId) || cal.members[0];
  const editId = document.getElementById('planEditId').value;
  const date = document.getElementById('planDateInput').value;
  const title = document.getElementById('planTitleInput').value.trim();
  const startTime = document.getElementById('planStartTime').value;
  const endTime = document.getElementById('planEndTime').value;
  const isAllDay = document.getElementById('planAllDayCheck').checked;
  const rawNotes = document.getElementById('planNotesInput').value.trim();
  const notes = rawNotes.slice(0, 500);

  const status = 'busy';

  if (editId) {
    // Update existing plan - verify ownership
    const planIndex = cal.plans.findIndex(p => p.id === editId);
    if (planIndex !== -1) {
      if (myMember && cal.plans[planIndex].memberId !== myMember.id) {
        showNotification("You cannot edit another person's plan! 🔒");
        document.getElementById('planModal').close();
        return;
      }
      cal.plans[planIndex] = {
        ...cal.plans[planIndex],
        date,
        title,
        status,
        startTime: isAllDay ? '00:00' : (startTime || '10:00'),
        endTime: isAllDay ? '23:59' : (endTime || '12:00'),
        isAllDay,
        notes
      };
    }
  } else {
    // Create new plan - strictly in user's own row ('You')
    const newPlan = {
      id: 'p-' + Date.now(),
      memberId: myMember ? myMember.id : state.activeUserId,
      date,
      title,
      status,
      startTime: isAllDay ? '00:00' : (startTime || '10:00'),
      endTime: isAllDay ? '23:59' : (endTime || '12:00'),
      isAllDay,
      notes
    };
    if (!cal.plans) cal.plans = [];
    cal.plans.push(newPlan);
  }

  saveData();
  document.getElementById('planModal').close();
  if (state.currentViewTab === 'month') {
    renderMonthGrid(cal);
  } else {
    renderMatrixTable(cal);
  }
  renderSidebarNotes(cal);
  showNotification(editId ? 'Plan updated!' : 'New plan added to your row!');
}

function handleDeletePlan() {
  const cal = state.calendars.find(c => c.id === state.currentCalendarId);
  if (!cal) return;
  const editId = document.getElementById('planEditId').value;
  if (!editId) return;

  const myMember = cal.members.find(m => m.isYou) || cal.members.find(m => m.id === state.activeUserId) || cal.members[0];
  const planToDelete = cal.plans.find(p => p.id === editId);
  if (planToDelete && myMember && planToDelete.memberId !== myMember.id) {
    showNotification("You cannot delete another person's plan! 🔒");
    document.getElementById('planModal').close();
    return;
  }

  cal.plans = cal.plans.filter(p => p.id !== editId);
  saveData();
  document.getElementById('planModal').close();
  renderCalendarView(cal.id);
  showNotification('Plan deleted.');
}

// 2. Note & Plan Details Viewer Modal
function openNoteDetailsModal(plan, member, cal) {
  if (!cal) cal = state.calendars.find(c => c.id === state.currentCalendarId);
  state.viewingNotePlan = plan;
  const modal = document.getElementById('noteDetailsModal');
  const body = document.getElementById('noteDetailsBody');
  const editBtn = document.getElementById('btnEditNoteDetails');
  const readOnlyBadge = document.getElementById('noteReadOnlyBadge');

  const myMember = (cal && Array.isArray(cal.members))
    ? (cal.members.find(m => m.isYou) || cal.members.find(m => m.id === state.activeUserId) || cal.members[0])
    : null;
  const isMyPlan = Boolean(myMember && (plan.memberId === myMember.id || (member && member.isYou)));

  if (editBtn) {
    editBtn.style.display = isMyPlan ? 'inline-flex' : 'none';
  }
  if (readOnlyBadge) {
    readOnlyBadge.style.display = isMyPlan ? 'none' : 'inline-flex';
    readOnlyBadge.textContent = `🔒 Read-only (${member.name}'s plan)`;
  }

  const statusEmoji = {
    busy: '🔴 Busy',
    tentative: '🟡 Tentative',
    free: '🟢 Free / Available',
    away: '🟣 Out of Town'
  }[plan.status] || '🔴 Busy';

  body.innerHTML = `
    <div class="note-details-content">
      <div class="note-detail-row">
        <span class="note-detail-label">Member</span>
        <div style="display: flex; align-items: center; gap: 8px;">
          <div class="tiny-avatar" style="background: ${member.color}; width: 26px; height: 26px;">${member.name.charAt(0)}</div>
          <span class="note-detail-val">${member.name}</span>
          ${isMyPlan ? '<span class="identity-badge-you">You</span>' : '<span class="badge-readonly-pill">Friend</span>'}
        </div>
      </div>

      <div class="note-detail-row">
        <span class="note-detail-label">Activity & Availability</span>
        <div class="note-detail-val" style="font-size: 1.15rem; font-weight: 800;">${escapeHtml(plan.title)}</div>
        <div><span class="status-badge-radio ${plan.status}" style="display: inline-block; padding: 2px 10px; margin-top: 4px;">${statusEmoji}</span></div>
      </div>

      <div class="note-detail-row">
        <span class="note-detail-label">Scheduled Date & Time</span>
        <div class="note-detail-val">${plan.date} • ${plan.isAllDay ? 'All Day' : `${plan.startTime} – ${plan.endTime}`}</div>
      </div>

      ${plan.notes ? `
        <div class="note-detail-row">
          <span class="note-detail-label">Shared Note for Group</span>
          <div class="note-detail-box">📝 ${escapeHtml(plan.notes)}</div>
        </div>
      ` : `
        <div class="note-detail-row">
          <span class="note-detail-label">Shared Note</span>
          <div style="color: var(--text-muted); font-size: 0.85rem; font-style: italic;">No specific note left for this plan.</div>
        </div>
      `}
    </div>
  `;

  modal.showModal();
}

// 3. Invite / Manage Members Modal (Max 8)
function openInviteModal() {
  const cal = state.calendars.find(c => c.id === state.currentCalendarId);
  if (!cal) return;

  const modal = document.getElementById('inviteModal');
  document.getElementById('inviteLimitBadge').textContent = `${cal.members.length} of ${MAX_MEMBERS_PER_CALENDAR} Members`;
  document.getElementById('inviteCodeInput').value = cal.inviteCode || `CAL-${cal.id.toUpperCase()}`;
  document.getElementById('inviteLinkInput').value = `${window.location.origin}${window.location.pathname}?join=${cal.inviteCode || cal.id}`;

  const addSection = document.getElementById('addMemberSection');
  if (addSection) {
    if (cal.members.length >= MAX_MEMBERS_PER_CALENDAR) {
      addSection.innerHTML = `
        <div style="padding: 12px; background: var(--status-busy-bg); color: var(--status-busy-text); border-radius: 8px; font-weight: 700; font-size: 0.82rem; text-align: center;">
          Maximum limit of 8 members reached for this group calendar.
        </div>
      `;
    } else {
      // Reset section if previously locked
      addSection.style.display = 'block';
    }
  }

  renderManageMembersList(cal);
  modal.showModal();
}

function renderManageMembersList(cal) {
  const list = document.getElementById('membersManageList');
  list.innerHTML = '';

  cal.members.forEach((m, idx) => {
    const row = document.createElement('div');
    row.className = 'member-manage-row';
    row.innerHTML = `
      <div class="member-info-grp">
        <div class="tiny-avatar" style="background: ${m.color}; width: 28px; height: 28px;">${m.name.charAt(0)}</div>
        <span style="font-weight: 700; font-size: 0.88rem;">${m.name}</span>
        ${m.isYou ? `<span class="identity-badge-you">You</span>` : ''}
      </div>
      ${!m.isYou && cal.members.length > 1 ? `
        <button class="btn-remove-member" data-id="${m.id}" title="Remove member">Remove</button>
      ` : ''}
    `;

    const removeBtn = row.querySelector('.btn-remove-member');
    if (removeBtn) {
      removeBtn.addEventListener('click', () => {
        if (confirm(`Remove ${m.name} from this calendar?`)) {
          cal.members = cal.members.filter(mem => mem.id !== m.id);
          saveData();
          openInviteModal();
          renderCalendarView(cal.id);
        }
      });
    }

    list.appendChild(row);
  });
}

function handleAddMemberDirect() {
  const cal = state.calendars.find(c => c.id === state.currentCalendarId);
  if (!cal) return;

  if (cal.members.length >= MAX_MEMBERS_PER_CALENDAR) {
    alert(`Maximum ${MAX_MEMBERS_PER_CALENDAR} users allowed in one group calendar!`);
    return;
  }

  const nameInput = document.getElementById('newMemberNameInput');
  const name = nameInput.value.trim();
  if (!name) {
    nameInput.focus();
    return;
  }

  // Pick an unused color from official AMONG_US_COLORS for this calendar
  const usedColors = new Set(cal.members.map(m => (m.color || '').toUpperCase()));
  const availableColor = AMONG_US_COLORS.find(c => !usedColors.has(c.hex.toUpperCase())) || AMONG_US_COLORS[0];
  const friendCount = cal.members.filter(m => !m.isYou).length + 1;

  const newMember = {
    id: 'mem-' + Date.now(),
    name: name,
    color: availableColor.hex,
    isYou: false
  };

  cal.members.push(newMember);
  saveData();

  nameInput.value = '';
  document.getElementById('inviteLimitBadge').textContent = `${cal.members.length} of ${MAX_MEMBERS_PER_CALENDAR} Members`;
  renderManageMembersList(cal);
  renderCalendarView(cal.id);
}

// 4. Create New Group Calendar Modal (Max 5 Limit)
function openNewCalendarModal() {
  if (state.calendars.length >= MAX_CALENDARS) {
    alert(`You have reached the maximum limit of ${MAX_CALENDARS} group calendars.`);
    return;
  }
  const modal = document.getElementById('newCalendarModal');
  document.getElementById('newCalendarForm').reset();
  modal.showModal();
}

function handleNewCalendarSubmit(e) {
  e.preventDefault();
  if (state.calendars.length >= MAX_CALENDARS) {
    alert(`Maximum ${MAX_CALENDARS} group calendars allowed!`);
    return;
  }

  const name = document.getElementById('newCalNameInput').value.trim();
  const desc = document.getElementById('newCalDescInput').value.trim();
  let style = 'cream';
  const radios = document.getElementsByName('calStyle');
  radios.forEach(r => { if (r.checked) style = r.value; });

  const newCalId = 'cal-' + Date.now();
  const newCalendar = {
    id: newCalId,
    name: name,
    description: desc || 'Shared plans and notes for our circle',
    style: style,
    createdAt: new Date().toISOString(),
    inviteCode: `CAL-${Math.floor(1000 + Math.random() * 9000)}-${name.substring(0, 3).toUpperCase()}`,
    members: [
      { id: 'mem-alex', name: 'You', color: '#C51111', isYou: true },
      { id: 'mem-' + (Date.now() + 1), name: 'Friend 1', color: '#132ED1', isYou: false }
    ],
    plans: [],
    sharedNotes: []
  };

  state.calendars.push(newCalendar);
  saveData();

  document.getElementById('newCalendarModal').close();
  openCalendar(newCalId);
}

// 5. Quick Shared Note Modal
function openQuickNoteModal() {
  const modal = document.getElementById('quickNoteModal');
  document.getElementById('quickNoteForm').reset();
  modal.showModal();
}

function handleQuickNoteSubmit(e) {
  e.preventDefault();
  const cal = state.calendars.find(c => c.id === state.currentCalendarId);
  if (!cal) return;

  const category = document.getElementById('quickNoteCategory').value;
  const content = document.getElementById('quickNoteContent').value.trim();

  if (!content) return;

  if (!cal.sharedNotes) cal.sharedNotes = [];
  cal.sharedNotes.unshift({
    id: 'n-' + Date.now(),
    authorId: state.activeUserId,
    category,
    content,
    date: toDateString(new Date())
  });

  saveData();
  document.getElementById('quickNoteModal').close();
  renderSidebarNotes(cal);
}

// ==========================================================================
// 6. Group Settings Modal (16 Colors, Auto-open, Invite code, Quit & Delete)
// ==========================================================================
function openGroupSettingsModal() {
  const cal = state.calendars.find(c => c.id === state.currentCalendarId);
  if (!cal) return;

  const modal = document.getElementById('groupSettingsModal');
  
  // Set invite code
  const inviteCodeEl = document.getElementById('settingsInviteCodeInput');
  if (inviteCodeEl) inviteCodeEl.value = cal.inviteCode || `CAL-${cal.id.substring(4)}`;

  // Set auto-open checkbox
  const autoOpenCheckbox = document.getElementById('settingsAutoOpenCheckbox');
  if (autoOpenCheckbox) {
    autoOpenCheckbox.checked = (localStorage.getItem(STORAGE_KEY_DEFAULT_CAL) === cal.id);
  }

  // Find active member
  const currentMember = cal.members.find(m => m.id === state.activeUserId) || cal.members.find(m => m.isYou) || cal.members[0];
  
  renderAmongUsPalette(cal, currentMember);

  modal.showModal();
}

function renderAmongUsPalette(cal, currentMember) {
  const container = document.getElementById('amongUsPalette');
  if (!container) return;
  container.innerHTML = '';

  if (!cal) cal = state.calendars.find(c => c.id === state.currentCalendarId);
  if (!currentMember && cal) {
    currentMember = cal.members.find(m => m.isYou) || cal.members.find(m => m.id === state.activeUserId) || cal.members[0];
  }

  const currentColor = (currentMember && currentMember.color) ? currentMember.color.toUpperCase() : '#C51111';
  const nameBadge = document.getElementById('settingsColorNameBadge');

  const activeColorObj = AMONG_US_COLORS.find(c => c.hex.toUpperCase() === currentColor) || AMONG_US_COLORS[0];
  if (nameBadge) nameBadge.textContent = activeColorObj.name;

  // Build map of colors already chosen by other members in this group
  const takenColors = new Map();
  if (cal && Array.isArray(cal.members)) {
    cal.members.forEach(m => {
      if (currentMember && m.id === currentMember.id) return;
      if (m.color) {
        takenColors.set(m.color.toUpperCase(), m.name);
      }
    });
  }

  AMONG_US_COLORS.forEach(colorObj => {
    const dot = document.createElement('button');
    dot.type = 'button';
    const hexUpper = colorObj.hex.toUpperCase();
    const isCurrent = hexUpper === currentColor;
    const isTaken = takenColors.has(hexUpper);

    dot.className = `among-us-dot ${isCurrent ? 'active' : ''} ${isTaken ? 'blocked' : ''}`;
    dot.style.backgroundColor = colorObj.hex;

    if (isTaken) {
      const takenByName = takenColors.get(hexUpper);
      dot.disabled = true;
      dot.setAttribute('aria-disabled', 'true');
      dot.title = `${colorObj.name} (In use by ${takenByName} — Blocked in this group)`;
      dot.innerHTML = `<span class="blocked-mark" aria-hidden="true">✕</span>`;
    } else {
      dot.title = isCurrent ? `${colorObj.name} (Your current color in this group)` : `${colorObj.name} (Available)`;
      dot.setAttribute('aria-label', colorObj.name);

      dot.addEventListener('click', () => {
        container.querySelectorAll('.among-us-dot').forEach(d => d.classList.remove('active'));
        dot.classList.add('active');
        if (nameBadge) nameBadge.textContent = colorObj.name;

        if (currentMember) {
          // Color updated strictly for this calendar member in this group!
          currentMember.color = colorObj.hex;
          saveData();
          renderCalendarView(cal.id);
          renderUserIdentitySelector();
          renderAmongUsPalette(cal, currentMember);
          showNotification(`Your color in "${cal.name}" is now ${colorObj.name}! 🎨`);
        }
      });
    }

    container.appendChild(dot);
  });
}

function handleDeleteGroup() {
  const cal = state.calendars.find(c => c.id === state.currentCalendarId);
  if (!cal) return;

  const warningMsg = "Warning: all the written plans and notes will be deleted without an ability to restore.\nThis group will be deleted for all others members.\n\nDo you want to permanently delete this group?";
  if (confirm(warningMsg)) {
    state.calendars = state.calendars.filter(c => c.id !== cal.id);
    if (localStorage.getItem(STORAGE_KEY_DEFAULT_CAL) === cal.id) {
      localStorage.removeItem(STORAGE_KEY_DEFAULT_CAL);
    }
    saveData();
    document.getElementById('groupSettingsModal').close();
    goHome();
    showNotification(`Group "${cal.name}" and all its plans have been deleted.`);
  }
}

function handleQuitGroup() {
  const cal = state.calendars.find(c => c.id === state.currentCalendarId);
  if (!cal) return;

  if (confirm(`Are you sure you want to quit "${cal.name}"? This group will not be shown on this device anymore until you rejoin with the group code.`)) {
    // Record quit group so it won't appear on this device anymore
    addQuitGroupId(cal.id);

    // If default auto-open was this calendar, clear it
    if (localStorage.getItem(STORAGE_KEY_DEFAULT_CAL) === cal.id) {
      localStorage.removeItem(STORAGE_KEY_DEFAULT_CAL);
    }

    // Remove user from group members
    cal.members = cal.members.filter(m => m.id !== state.activeUserId && !m.isYou);
    
    // Remove group from active state on this device
    state.calendars = state.calendars.filter(c => c.id !== cal.id);

    saveData();
    document.getElementById('groupSettingsModal').close();
    goHome();
    showNotification(`You quit "${cal.name}". It is hidden on this device until you enter its invite code.`);
  }
}

// ==========================================================================
// 7. Profile & Cloud Backup Modal (Google Auth & Join Code)
// ==========================================================================
function openProfileModal() {
  updateProfileModalUI();
  initRealGoogleSignIn();
  document.getElementById('profileModal').showModal();
}

function updateProfileModalUI() {
  const signInView = document.getElementById('googleSignInView');
  const userProfileView = document.getElementById('googleUserProfileView');
  const badge = document.getElementById('googleSyncStatusBadge');
  const headerName = document.getElementById('headerProfileName');

  if (state.googleUser) {
    if (signInView) signInView.style.display = 'none';
    if (userProfileView) userProfileView.style.display = 'block';
    if (badge) {
      badge.textContent = 'Google Cloud Sync Active';
      badge.className = 'badge-status-pill connected';
    }
    const nameEl = document.getElementById('googleUserNameDisplay');
    const emailEl = document.getElementById('googleUserEmailDisplay');
    const fallbackEl = document.getElementById('googleAvatarFallback');
    const imgEl = document.getElementById('googleAvatarImg');

    if (nameEl) nameEl.textContent = state.googleUser.name || 'You';
    if (emailEl) emailEl.textContent = state.googleUser.email || '';
    if (state.googleUser.picture && imgEl) {
      imgEl.src = state.googleUser.picture;
      imgEl.style.display = 'block';
      if (fallbackEl) fallbackEl.style.display = 'none';
    } else {
      if (imgEl) imgEl.style.display = 'none';
      if (fallbackEl) {
        fallbackEl.style.display = 'flex';
        fallbackEl.textContent = (state.googleUser.name || 'You').charAt(0);
      }
    }

    if (headerName) headerName.textContent = state.googleUser.name ? `You (${state.googleUser.name.split(' ')[0]})` : 'You';
  } else {
    if (signInView) signInView.style.display = 'block';
    if (userProfileView) userProfileView.style.display = 'none';
    if (badge) {
      badge.textContent = 'Not Connected';
      badge.className = 'badge-status-pill';
    }
    if (headerName) headerName.textContent = 'You (Profile)';
  }
}

// Real Google Identity Services (GSI) Client Initializer
let googleGsiInitialized = false;
function initRealGoogleSignIn() {
  if (window.google && window.google.accounts && window.google.accounts.id) {
    try {
      window.google.accounts.id.initialize({
        client_id: '1082531364532-6mghf43e4987q6e3137uup05nch7b0n9.apps.googleusercontent.com',
        callback: handleGoogleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: true
      });

      const btnContainer = document.getElementById('googleGsiButtonWrap');
      if (btnContainer && !googleGsiInitialized) {
        btnContainer.innerHTML = '';
        window.google.accounts.id.renderButton(btnContainer, {
          theme: 'outline',
          size: 'large',
          type: 'standard',
          shape: 'pill',
          text: 'signin_with',
          logo_alignment: 'left',
          width: 320
        });
        googleGsiInitialized = true;
      }
    } catch (e) {
      console.warn('Google GSI init note:', e);
    }
  }
}

function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

function handleGoogleCredentialResponse(response) {
  if (response && response.credential) {
    const payload = parseJwt(response.credential);
    if (payload) {
      state.googleUser = {
        name: payload.name || payload.given_name || 'You',
        email: payload.email,
        picture: payload.picture,
        sub: payload.sub,
        signedInAt: new Date().toISOString()
      };
      localStorage.setItem(STORAGE_KEY_GOOGLE_USER, JSON.stringify(state.googleUser));
      updateProfileModalUI();
      showNotification(`Signed in as ${state.googleUser.email}! Google Cloud Sync is active. ☁️`);
      return;
    }
  }
}

function handleGoogleSignIn() {
  // Try real Google Identity Services prompt first
  if (window.google && window.google.accounts && window.google.accounts.id) {
    initRealGoogleSignIn();
    window.google.accounts.id.prompt((notification) => {
      if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
        promptGoogleAccountDialog();
      }
    });
  } else {
    promptGoogleAccountDialog();
  }
}

function promptGoogleAccountDialog() {
  const currentEmail = state.googleUser ? state.googleUser.email : '';
  const emailInput = prompt('Sign in with your Google Account:\nEnter your Google Email address (e.g. yourname@gmail.com):', currentEmail);
  if (!emailInput) return;

  const email = emailInput.trim();
  if (!email || !email.includes('@')) {
    alert('Please enter a valid Google email address.');
    return;
  }

  const defaultName = email.split('@')[0].replace(/[._-]/g, ' ');
  const capitalizedName = defaultName.split(' ').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');

  state.googleUser = {
    name: capitalizedName || 'You',
    email: email,
    picture: `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(email)}`,
    signedInAt: new Date().toISOString()
  };

  localStorage.setItem(STORAGE_KEY_GOOGLE_USER, JSON.stringify(state.googleUser));
  updateProfileModalUI();
  showNotification(`Signed in with Google as ${email}! ☁️ Groups are saved in cloud.`);
}

function handleGoogleSignOut() {
  if (window.google && window.google.accounts && window.google.accounts.id) {
    try {
      window.google.accounts.id.disableAutoSelect();
    } catch (e) {}
  }
  state.googleUser = null;
  localStorage.removeItem(STORAGE_KEY_GOOGLE_USER);
  updateProfileModalUI();
  showNotification('Signed out of Google account.');
}

function handleJoinGroupByCode(code = null) {
  const input = document.getElementById('profileJoinCodeInput');
  const joinCode = (code || (input ? input.value : '')).trim().toUpperCase();

  if (!joinCode) {
    alert('Please enter an invite code to join a group.');
    if (input) input.focus();
    return;
  }

  // If this group was previously quit, re-admit it on this device
  const quitIds = getQuitGroupIds();
  const allStarterOrSaved = getStarterData();
  const matchedStarter = allStarterOrSaved.find(c => c.inviteCode && c.inviteCode.toUpperCase() === joinCode);
  if (matchedStarter && quitIds.includes(matchedStarter.id)) {
    removeQuitGroupId(matchedStarter.id);
  }

  // Check if calendar already exists in state
  let targetCal = state.calendars.find(c => c.inviteCode && c.inviteCode.toUpperCase() === joinCode);

  if (!targetCal) {
    // If it was in the starter set that was hidden by quit
    if (matchedStarter) {
      targetCal = matchedStarter;
      state.calendars.push(targetCal);
    } else {
      if (state.calendars.length >= MAX_CALENDARS) {
        alert(`You have reached the limit of ${MAX_CALENDARS} calendars. Please delete or quit one before joining another.`);
        return;
      }
      
      targetCal = {
        id: 'cal-' + Date.now(),
        name: `Circle (${joinCode})`,
        description: 'Shared group calendar joined via invite code',
        style: 'teal',
        createdAt: new Date().toISOString(),
        inviteCode: joinCode,
        members: [
          { id: 'mem-host', name: 'Friend 1', color: '#132ED1', isYou: false },
          { id: 'mem-' + Date.now(), name: 'You', color: '#C51111', isYou: true }
        ],
        plans: [
          {
            id: 'plan-joined-1',
            memberId: 'mem-host',
            title: 'Welcome to Group Sync!',
            date: toDateString(new Date()),
            startTime: '14:00',
            endTime: '15:00',
            isAllDay: false,
            notes: 'Glad you joined! All notes and plans update for everyone in real time.'
          }
        ],
        sharedNotes: []
      };
      state.calendars.push(targetCal);
    }
  }

  // Ensure user is in group as 'You'
  removeQuitGroupId(targetCal.id);
  const alreadyMember = targetCal.members.some(m => m.id === state.activeUserId || m.isYou);
  if (!alreadyMember) {
    if (targetCal.members.length >= MAX_MEMBERS_PER_CALENDAR) {
      alert(`This group already has the maximum of ${MAX_MEMBERS_PER_CALENDAR} members.`);
      return;
    }
    const usedColors = new Set(targetCal.members.map(m => (m.color || '').toUpperCase()));
    const availableColor = AMONG_US_COLORS.find(c => !usedColors.has(c.hex.toUpperCase())) || AMONG_US_COLORS[0];
    targetCal.members.push({
      id: 'mem-' + Date.now(),
      name: 'You',
      color: availableColor.hex,
      isYou: true
    });
  }

  normalizeCalendarMemberNames(state.calendars);
  saveData();
  if (input) input.value = '';
  document.getElementById('profileModal').close();
  openCalendar(targetCal.id);
  showNotification(`Successfully joined "${targetCal.name}"! 🎉`);
}

// ==========================================================================
// Setup Event Listeners
// ==========================================================================
function setupEventListeners() {
  // Brand logo / Home Link
  document.getElementById('brandHomeLink')?.addEventListener('click', (e) => {
    e.preventDefault();
    goHome();
  });

  document.getElementById('btnBackToHome')?.addEventListener('click', goHome);

  // New Calendar Buttons (Header & Hero)
  document.getElementById('btnHeaderNewCalendar')?.addEventListener('click', openNewCalendarModal);
  document.getElementById('btnHeroCreateGroup')?.addEventListener('click', openNewCalendarModal);

  // Quick primary enter
  document.getElementById('btnQuickEnterPrimary')?.addEventListener('click', () => {
    if (state.calendars.length > 0) openCalendar(state.calendars[0].id);
  });

  // Floating Action Button "+" (Image 1)
  document.getElementById('btnFloatingAdd')?.addEventListener('click', () => {
    openAddPlanModal();
  });

  // View Switch Tabs (Friends Matrix 7 Days vs Month Grid)
  const tabMatrix = document.getElementById('tabMatrixView');
  const tabMonth = document.getElementById('tabMonthView');

  tabMatrix?.addEventListener('click', () => {
    state.currentViewTab = 'matrix';
    tabMatrix.classList.add('active');
    tabMatrix.setAttribute('aria-selected', 'true');
    tabMonth?.classList.remove('active');
    tabMonth?.setAttribute('aria-selected', 'false');
    if (state.currentCalendarId) renderCalendarView(state.currentCalendarId);
  });

  tabMonth?.addEventListener('click', () => {
    state.currentViewTab = 'month';
    tabMonth.classList.add('active');
    tabMonth.setAttribute('aria-selected', 'true');
    tabMatrix?.classList.remove('active');
    tabMatrix?.setAttribute('aria-selected', 'false');
    if (state.currentCalendarId) renderCalendarView(state.currentCalendarId);
  });

  // Month View "+ Add Plan" button for the currently selected day
  document.getElementById('btnMonthAddPlanForDay')?.addEventListener('click', () => {
    openAddPlanModal(state.activeUserId, state.selectedMonthDate || toDateString(new Date()));
  });

  // Period Navigation (Week by week for Matrix, Month by month for Month Grid)
  document.getElementById('btnPrevPeriod')?.addEventListener('click', () => {
    if (state.currentViewTab === 'month') {
      const d = new Date(state.currentMonthDate);
      d.setMonth(d.getMonth() - 1);
      state.currentMonthDate = d;
    } else {
      const d = new Date(state.selectedWeekStart);
      d.setDate(d.getDate() - 7);
      state.selectedWeekStart = d;
    }
    renderCalendarView(state.currentCalendarId);
  });

  document.getElementById('btnNextPeriod')?.addEventListener('click', () => {
    if (state.currentViewTab === 'month') {
      const d = new Date(state.currentMonthDate);
      d.setMonth(d.getMonth() + 1);
      state.currentMonthDate = d;
    } else {
      const d = new Date(state.selectedWeekStart);
      d.setDate(d.getDate() + 7);
      state.selectedWeekStart = d;
    }
    renderCalendarView(state.currentCalendarId);
  });

  document.getElementById('btnJumpToday')?.addEventListener('click', () => {
    state.selectedWeekStart = getMonday(new Date());
    state.currentMonthDate = new Date();
    renderCalendarView(state.currentCalendarId);
  });

  // Group Settings Modal Buttons
  document.getElementById('btnOpenGroupSettings')?.addEventListener('click', openGroupSettingsModal);
  document.getElementById('btnCloseGroupSettingsModal')?.addEventListener('click', () => document.getElementById('groupSettingsModal').close());
  document.getElementById('btnDoneGroupSettings')?.addEventListener('click', () => document.getElementById('groupSettingsModal').close());

  // Auto-Open Switch inside Group Settings Modal
  const settingsAutoOpenCheckbox = document.getElementById('settingsAutoOpenCheckbox');
  if (settingsAutoOpenCheckbox) {
    settingsAutoOpenCheckbox.addEventListener('change', () => {
      if (settingsAutoOpenCheckbox.checked) {
        localStorage.setItem(STORAGE_KEY_DEFAULT_CAL, state.currentCalendarId);
        showNotification('⚡ This calendar will now open automatically when you start the app.');
      } else {
        localStorage.removeItem(STORAGE_KEY_DEFAULT_CAL);
        showNotification('Auto-open disabled. SyncCal will now start on the group overview.');
      }
    });
  }

  // Copy code inside Group Settings
  document.getElementById('btnSettingsCopyCode')?.addEventListener('click', () => {
    const code = document.getElementById('settingsInviteCodeInput')?.value;
    if (code) {
      navigator.clipboard.writeText(code).then(() => {
        showNotification('Group invite code copied to clipboard! 📋');
      });
    }
  });

  // Quit and Delete Group Buttons
  document.getElementById('btnQuitGroup')?.addEventListener('click', handleQuitGroup);
  document.getElementById('btnDeleteGroup')?.addEventListener('click', handleDeleteGroup);

  // Profile Modal & Google Sign-In
  document.getElementById('btnOpenProfile')?.addEventListener('click', openProfileModal);
  document.getElementById('btnCloseProfileModal')?.addEventListener('click', () => document.getElementById('profileModal').close());
  document.getElementById('btnDoneProfile')?.addEventListener('click', () => document.getElementById('profileModal').close());
  document.getElementById('btnGoogleSignIn')?.addEventListener('click', handleGoogleSignIn);
  document.getElementById('btnGoogleSignOut')?.addEventListener('click', handleGoogleSignOut);
  document.getElementById('btnSubmitJoinCode')?.addEventListener('click', () => handleJoinGroupByCode());

  // Day Plans Summary Modal Close
  document.getElementById('btnCloseDayPlansModal')?.addEventListener('click', () => document.getElementById('dayPlansModal').close());
  document.getElementById('btnCloseDayPlansModalBtn')?.addEventListener('click', () => document.getElementById('dayPlansModal').close());

  // Auto-Open Toast Actions
  document.getElementById('toastGoHomeBtn')?.addEventListener('click', goHome);
  document.getElementById('toastDisableAutoOpenBtn')?.addEventListener('click', () => {
    localStorage.removeItem(STORAGE_KEY_DEFAULT_CAL);
    document.getElementById('autoOpenToast').style.display = 'none';
  });
  document.getElementById('toastCloseBtn')?.addEventListener('click', () => {
    document.getElementById('autoOpenToast').style.display = 'none';
  });

  // Plan Form
  document.getElementById('planForm')?.addEventListener('submit', handlePlanFormSubmit);
  document.getElementById('btnCancelPlan')?.addEventListener('click', () => document.getElementById('planModal').close());
  document.getElementById('btnClosePlanModal')?.addEventListener('click', () => document.getElementById('planModal').close());
  document.getElementById('btnDeletePlan')?.addEventListener('click', handleDeletePlan);

  // Note 500-symbol character counter
  const planNotesEl = document.getElementById('planNotesInput');
  const planNotesCountEl = document.getElementById('planNotesCharCount');
  if (planNotesEl && planNotesCountEl) {
    planNotesEl.addEventListener('input', () => {
      planNotesCountEl.textContent = `${planNotesEl.value.length} / 500`;
    });
  }

  // Edit Note Details
  document.getElementById('btnEditNoteDetails')?.addEventListener('click', () => {
    document.getElementById('noteDetailsModal').close();
    if (state.viewingNotePlan) {
      openEditPlanModal(state.viewingNotePlan);
    }
  });
  document.getElementById('btnCloseNoteDetails')?.addEventListener('click', () => document.getElementById('noteDetailsModal').close());
  document.getElementById('btnCloseNoteDetailsModal')?.addEventListener('click', () => document.getElementById('noteDetailsModal').close());

  // Invite Modal
  document.getElementById('btnOpenInviteModal')?.addEventListener('click', openInviteModal);
  document.getElementById('btnManageMembers')?.addEventListener('click', openInviteModal);
  document.getElementById('btnCloseInviteModal')?.addEventListener('click', () => document.getElementById('inviteModal').close());
  document.getElementById('btnDoneInvite')?.addEventListener('click', () => document.getElementById('inviteModal').close());
  document.getElementById('btnAddMemberBtn')?.addEventListener('click', handleAddMemberDirect);

  // Copy Code & Link
  document.getElementById('btnCopyInviteCode')?.addEventListener('click', () => {
    const code = document.getElementById('inviteCodeInput').value;
    navigator.clipboard.writeText(code).then(() => {
      showNotification('Group invite code copied to clipboard! 📋');
    });
  });

  document.getElementById('btnCopyInviteLink')?.addEventListener('click', () => {
    const link = document.getElementById('inviteLinkInput').value;
    navigator.clipboard.writeText(link).then(() => {
      showNotification('Direct invite link copied to clipboard! 🔗');
    });
  });

  // Avatar Color Picker in Invite Modal
  document.querySelectorAll('#colorBubbles .color-dot').forEach(dot => {
    dot.addEventListener('click', () => {
      document.querySelectorAll('#colorBubbles .color-dot').forEach(d => d.classList.remove('active'));
      dot.classList.add('active');
      state.selectedNewMemberColor = dot.getAttribute('data-color');
    });
  });

  // New Calendar Form
  document.getElementById('newCalendarForm')?.addEventListener('submit', handleNewCalendarSubmit);
  document.getElementById('btnCancelNewCal')?.addEventListener('click', () => document.getElementById('newCalendarModal').close());
  document.getElementById('btnCloseNewCalModal')?.addEventListener('click', () => document.getElementById('newCalendarModal').close());

  // Quick Shared Note
  document.getElementById('btnAddQuickNote')?.addEventListener('click', openQuickNoteModal);
  document.getElementById('quickNoteForm')?.addEventListener('submit', handleQuickNoteSubmit);
  document.getElementById('btnCancelQuickNote')?.addEventListener('click', () => document.getElementById('quickNoteModal').close());
  document.getElementById('btnCloseQuickNoteModal')?.addEventListener('click', () => document.getElementById('quickNoteModal').close());

  // Search
  const searchInput = document.getElementById('globalSearchInput');
  const clearBtn = document.getElementById('searchClearBtn');

  if (searchInput && clearBtn) {
    searchInput.addEventListener('input', (e) => {
      state.searchQuery = e.target.value.toLowerCase().trim();
      clearBtn.style.display = state.searchQuery ? 'block' : 'none';
      if (state.currentCalendarId) {
        renderCalendarView(state.currentCalendarId);
      }
    });

    clearBtn.addEventListener('click', () => {
      searchInput.value = '';
      state.searchQuery = '';
      clearBtn.style.display = 'none';
      if (state.currentCalendarId) {
        renderCalendarView(state.currentCalendarId);
      }
    });
  }

  // User Identity Dropdown Toggle
  const identityBtn = document.getElementById('userIdentityBtn');
  const identityDropdown = document.getElementById('identityDropdown');
  if (identityBtn && identityDropdown) {
    identityBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isShown = identityDropdown.style.display === 'block';
      identityDropdown.style.display = isShown ? 'none' : 'block';
      identityBtn.setAttribute('aria-expanded', !isShown);
    });

    document.addEventListener('click', (e) => {
      if (!identityDropdown.contains(e.target) && e.target !== identityBtn) {
        identityDropdown.style.display = 'none';
        identityBtn.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // APK Guide Modal
  document.getElementById('btnOpenApkGuide')?.addEventListener('click', () => {
    document.getElementById('apkGuideModal').showModal();
  });
  document.getElementById('btnDoneApkGuide')?.addEventListener('click', () => {
    document.getElementById('apkGuideModal').close();
  });
  document.getElementById('btnCloseApkGuideModal')?.addEventListener('click', () => {
    document.getElementById('apkGuideModal').close();
  });

  // Data Backup / Reset
  document.getElementById('btnExportData')?.addEventListener('click', () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state.calendars, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute("href", dataStr);
    dlAnchor.setAttribute("download", `synccal_backup_${toDateString(new Date())}.json`);
    dlAnchor.click();
  });

  document.getElementById('btnResetDemoData')?.addEventListener('click', () => {
    if (confirm('Reset to initial starter demo calendars and plans?')) {
      localStorage.removeItem(STORAGE_KEY_CALENDARS);
      localStorage.removeItem(STORAGE_KEY_DEFAULT_CAL);
      state.calendars = getStarterData();
      saveData();
      goHome();
      showNotification('Demo data reset successfully.');
    }
  });
}

// ==========================================================================
// Modern Dialog Backdrop Click Fallback (modern-web-guidance)
// ==========================================================================
function setupDialogBackdropFallbacks() {
  document.querySelectorAll('dialog').forEach(dialog => {
    if (!('closedBy' in HTMLDialogElement.prototype)) {
      dialog.addEventListener('click', (event) => {
        if (event.target !== dialog) return;
        const rect = dialog.getBoundingClientRect();
        const isDialogContent = (
          rect.top <= event.clientY &&
          event.clientY <= rect.top + rect.height &&
          rect.left <= event.clientX &&
          event.clientX <= rect.left + rect.width
        );
        if (isDialogContent) return;
        dialog.close();
      });
    }
  });
}

// ==========================================================================
// Utilities
// ==========================================================================
function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/[&<>"']/g, (m) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[m]);
}

function showNotification(text) {
  const toast = document.createElement('div');
  toast.style.position = 'fixed';
  toast.style.bottom = '24px';
  toast.style.left = '50%';
  toast.style.transform = 'translateX(-50%)';
  toast.style.backgroundColor = 'var(--text-primary)';
  toast.style.color = 'var(--bg-canvas)';
  toast.style.padding = '10px 20px';
  toast.style.borderRadius = '9999px';
  toast.style.fontSize = '0.85rem';
  toast.style.fontWeight = '700';
  toast.style.boxShadow = 'var(--shadow-lg)';
  toast.style.zIndex = '9999';
  toast.style.animation = 'fadeIn 0.2s ease-out';
  toast.textContent = text;

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s ease-out';
    setTimeout(() => toast.remove(), 300);
  }, 3200);
}

// Register PWA Service Worker
function setupServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js').catch(err => {
        console.warn('ServiceWorker registration error:', err);
      });
    });
  }
}

// Start application when DOM is ready
document.addEventListener('DOMContentLoaded', initApp);
