/**
 * SyncCal — Shared Group Calendar
 * Modern Vanilla JS Implementation
 */

// ==========================================================================
// Storage Keys & Constants
// ==========================================================================
const STORAGE_KEY_CALENDARS = 'synccal_calendars_data_v1';
const STORAGE_KEY_DEFAULT_CAL = 'synccal_default_calendar_id';
const STORAGE_KEY_ACTIVE_USER = 'synccal_active_user_id';
const STORAGE_KEY_THEME = 'synccal_color_theme';
const MAX_CALENDARS = 5;
const MAX_MEMBERS_PER_CALENDAR = 8;

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
        { id: 'mem-alex', name: 'Alex (You)', color: '#FF5A6E', isYou: true },
        { id: 'mem-maya', name: 'Maya S.', color: '#3B82F6', isYou: false },
        { id: 'mem-leo', name: 'Leo K.', color: '#10B981', isYou: false },
        { id: 'mem-zoe', name: 'Zoe R.', color: '#8B5CF6', isYou: false }
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
        { id: 'mem-alex', name: 'Alex (You)', color: '#FF5A6E', isYou: true },
        { id: 'mem-jordan', name: 'Jordan W.', color: '#F59E0B', isYou: false },
        { id: 'mem-sam', name: 'Sam M.', color: '#3B82F6', isYou: false }
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
        { id: 'mem-alex', name: 'Alex (You)', color: '#FF5A6E', isYou: true },
        { id: 'mem-chloe', name: 'Chloe T.', color: '#10B981', isYou: false },
        { id: 'mem-ryan', name: 'Ryan B.', color: '#8B5CF6', isYou: false },
        { id: 'mem-elena', name: 'Elena V.', color: '#EC4899', isYou: false },
        { id: 'mem-daniel', name: 'Daniel H.', color: '#3B82F6', isYou: false }
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
  currentViewTab: 'matrix', // 'matrix' or 'month'
  searchQuery: '',
  selectedNewMemberColor: '#FF5A6E',
  viewingNotePlan: null
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

  // Active user id
  const savedUser = localStorage.getItem(STORAGE_KEY_ACTIVE_USER);
  if (savedUser) {
    state.activeUserId = savedUser;
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

  if (savedTheme) {
    root.setAttribute('data-theme', savedTheme);
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', savedTheme === 'dark' ? '#0D0E11' : '#F0EDE6');
    }
  } else {
    // Follow OS preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    root.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', prefersDark ? '#0D0E11' : '#F0EDE6');
    }
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
  localStorage.setItem(STORAGE_KEY_THEME, next);

  const metaThemeColor = document.getElementById('metaThemeColor');
  if (metaThemeColor) {
    metaThemeColor.setAttribute('content', next === 'dark' ? '#0D0E11' : '#F0EDE6');
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
  document.getElementById('calendarCountNumber').textContent = count;
  document.getElementById('calendarCountLabel').textContent = `${count} / ${MAX_CALENDARS} Groups`;

  // Disable create buttons if 5 is reached
  const btnHeader = document.getElementById('btnHeaderNewCalendar');
  const btnHero = document.getElementById('btnHeroCreateGroup');
  if (count >= MAX_CALENDARS) {
    btnHeader.disabled = true;
    btnHeader.style.opacity = '0.5';
    btnHeader.title = 'Maximum 5 group calendars reached';
    btnHero.disabled = true;
    btnHero.style.opacity = '0.5';
    btnHero.title = 'Maximum 5 group calendars reached';
  } else {
    btnHeader.disabled = false;
    btnHeader.style.opacity = '1';
    btnHeader.title = '';
    btnHero.disabled = false;
    btnHero.style.opacity = '1';
    btnHero.title = '';
  }
}

function renderHomeDigest() {
  const todayStr = toDateString(new Date());
  
  // Update today label
  const options = { weekday: 'long', month: 'short', day: 'numeric' };
  document.getElementById('homeTodayDateLabel').textContent = new Date().toLocaleDateString('en-US', options);

  // Today friends list
  const digestContainer = document.getElementById('todayFriendsDigest');
  digestContainer.innerHTML = '';

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

  // Period title (e.g. October 2026 or Week range)
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

  // Render the Matrix (Image 1)
  renderMatrixTable(cal);

  // Render Sidebar Shared Notes & Availability
  renderSidebarNotes(cal);
  renderSidebarMembers(cal);
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

    // Left Sticky Friend Cell
    const friendTd = document.createElement('td');
    friendTd.className = 'friend-col-cell';
    friendTd.innerHTML = `
      <div class="friend-row-label">
        <div class="friend-row-avatar" style="background: ${member.color};">
          ${member.name.charAt(0)}
        </div>
        <div class="friend-row-text">
          <div class="friend-row-name" title="${member.name}">${member.name}</div>
          <div class="friend-row-sub">Friend ${index + 1}</div>
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
      cellWrap.className = 'matrix-cell-content';
      cellWrap.title = `Click to add or view plans for ${member.name} on ${dStr}`;

      if (matchedPlans.length === 0) {
        cellWrap.innerHTML = `<div class="empty-cell-hint">+</div>`;
      } else {
        matchedPlans.forEach(plan => {
          const planChip = document.createElement('div');
          planChip.className = `plan-item-chip ${plan.status}`;
          planChip.innerHTML = `
            <div class="plan-chip-header">
              <span class="plan-chip-title">${escapeHtml(plan.title)}</span>
              ${plan.notes ? `<span class="plan-note-icon" title="Has shared notes">📝</span>` : ''}
            </div>
            <div class="plan-chip-time">
              ${plan.isAllDay ? 'All Day' : `${plan.startTime} - ${plan.endTime}`}
            </div>
          `;

          // Clicking a plan chip opens Note & Plan details modal
          planChip.addEventListener('click', (e) => {
            e.stopPropagation();
            openNoteDetailsModal(plan, member, cal);
          });

          cellWrap.appendChild(planChip);
        });
      }

      // Clicking cell opens Add Plan dialog pre-filled with this member and date!
      cellWrap.addEventListener('click', () => {
        openAddPlanModal(member.id, dStr);
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
      const author = cal.members.find(m => m.id === note.authorId) || { name: 'Member', color: '#888' };
      const item = document.createElement('div');
      item.className = 'shared-note-item';
      item.innerHTML = `
        <div class="note-item-header">
          <div class="note-author-tag">
            <span class="tiny-avatar" style="background: ${author.color}; width: 18px; height: 18px; font-size: 0.6rem;">${author.name.charAt(0)}</span>
            <span>${author.name}</span>
          </div>
          <span class="note-cat-badge">${note.category}</span>
        </div>
        <div class="note-item-body">${escapeHtml(note.content)}</div>
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
  container.innerHTML = '';
  document.getElementById('footerMemberCount').textContent = cal.members.length;

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

// ==========================================================================
// User Identity Selector (Allows switching active user)
// ==========================================================================
function renderUserIdentitySelector() {
  const cal = state.currentCalendarId ? state.calendars.find(c => c.id === state.currentCalendarId) : state.calendars[0];
  const members = cal ? cal.members : [
    { id: 'mem-alex', name: 'Alex (You)', color: '#FF5A6E' }
  ];

  let currentMem = members.find(m => m.id === state.activeUserId);
  if (!currentMem) {
    currentMem = members[0];
    state.activeUserId = currentMem.id;
  }

  document.getElementById('activeUserAvatar').textContent = currentMem.name.charAt(0);
  document.getElementById('activeUserAvatar').style.backgroundColor = currentMem.color;
  document.getElementById('activeUserName').textContent = currentMem.name;

  const list = document.getElementById('identityList');
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
      document.getElementById('identityDropdown').style.display = 'none';
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

  const modal = document.getElementById('planModal');
  const form = document.getElementById('planForm');
  form.reset();

  document.getElementById('planEditId').value = '';
  document.getElementById('planModalTitle').textContent = 'Add Plan & Note';
  document.getElementById('btnDeletePlan').style.display = 'none';

  // Populate Member select
  const select = document.getElementById('planMemberSelect');
  select.innerHTML = '';
  cal.members.forEach(m => {
    const opt = document.createElement('option');
    opt.value = m.id;
    opt.textContent = m.name;
    if (memberId ? m.id === memberId : m.id === state.activeUserId) {
      opt.selected = true;
    }
    select.appendChild(opt);
  });

  // Default date
  document.getElementById('planDateInput').value = dateStr || toDateString(new Date());

  modal.showModal();
}

function openEditPlanModal(plan) {
  const cal = state.calendars.find(c => c.id === state.currentCalendarId);
  if (!cal) return;

  const modal = document.getElementById('planModal');
  document.getElementById('planModalTitle').textContent = 'Edit Plan & Note';
  document.getElementById('planEditId').value = plan.id;
  document.getElementById('btnDeletePlan').style.display = 'block';

  // Populate Member select
  const select = document.getElementById('planMemberSelect');
  select.innerHTML = '';
  cal.members.forEach(m => {
    const opt = document.createElement('option');
    opt.value = m.id;
    opt.textContent = m.name;
    if (m.id === plan.memberId) opt.selected = true;
    select.appendChild(opt);
  });

  document.getElementById('planDateInput').value = plan.date;
  document.getElementById('planTitleInput').value = plan.title;
  document.getElementById('planStartTime').value = plan.startTime || '10:00';
  document.getElementById('planEndTime').value = plan.endTime || '12:00';
  document.getElementById('planAllDayCheck').checked = !!plan.isAllDay;
  document.getElementById('planNotesInput').value = plan.notes || '';

  // Select status radio
  const radios = document.getElementsByName('planStatus');
  radios.forEach(r => {
    r.checked = (r.value === plan.status);
  });

  modal.showModal();
}

function handlePlanFormSubmit(e) {
  e.preventDefault();
  const cal = state.calendars.find(c => c.id === state.currentCalendarId);
  if (!cal) return;

  const editId = document.getElementById('planEditId').value;
  const memberId = document.getElementById('planMemberSelect').value;
  const date = document.getElementById('planDateInput').value;
  const title = document.getElementById('planTitleInput').value.trim();
  const startTime = document.getElementById('planStartTime').value;
  const endTime = document.getElementById('planEndTime').value;
  const isAllDay = document.getElementById('planAllDayCheck').checked;
  const notes = document.getElementById('planNotesInput').value.trim();

  let status = 'busy';
  const radios = document.getElementsByName('planStatus');
  radios.forEach(r => { if (r.checked) status = r.value; });

  if (editId) {
    // Update existing plan
    const planIndex = cal.plans.findIndex(p => p.id === editId);
    if (planIndex !== -1) {
      cal.plans[planIndex] = {
        ...cal.plans[planIndex],
        memberId,
        date,
        title,
        status,
        startTime,
        endTime,
        isAllDay,
        notes
      };
    }
  } else {
    // Create new plan
    const newPlan = {
      id: 'p-' + Date.now(),
      memberId,
      date,
      title,
      status,
      startTime,
      endTime,
      isAllDay,
      notes,
      createdAt: new Date().toISOString()
    };
    if (!cal.plans) cal.plans = [];
    cal.plans.push(newPlan);
  }

  saveData();
  document.getElementById('planModal').close();
  renderCalendarView(cal.id);
}

function handleDeletePlan() {
  const cal = state.calendars.find(c => c.id === state.currentCalendarId);
  if (!cal) return;
  const editId = document.getElementById('planEditId').value;
  if (!editId) return;

  cal.plans = cal.plans.filter(p => p.id !== editId);
  saveData();
  document.getElementById('planModal').close();
  renderCalendarView(cal.id);
}

// 2. Note & Plan Details Viewer Modal
function openNoteDetailsModal(plan, member, cal) {
  state.viewingNotePlan = plan;
  const modal = document.getElementById('noteDetailsModal');
  const body = document.getElementById('noteDetailsBody');

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

  const newMember = {
    id: 'mem-' + Date.now(),
    name: name,
    color: state.selectedNewMemberColor || '#FF5A6E',
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
      { id: 'mem-alex', name: 'Alex (You)', color: '#FF5A6E', isYou: true },
      { id: 'mem-' + (Date.now() + 1), name: 'Friend 2', color: '#3B82F6', isYou: false }
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
// Setup Event Listeners
// ==========================================================================
function setupEventListeners() {
  // Brand logo / Home Link
  document.getElementById('brandHomeLink').addEventListener('click', (e) => {
    e.preventDefault();
    goHome();
  });

  document.getElementById('btnBackToHome').addEventListener('click', goHome);

  // New Calendar Buttons (Header & Hero)
  document.getElementById('btnHeaderNewCalendar').addEventListener('click', openNewCalendarModal);
  document.getElementById('btnHeroCreateGroup').addEventListener('click', openNewCalendarModal);

  // Quick primary enter
  document.getElementById('btnQuickEnterPrimary').addEventListener('click', () => {
    if (state.calendars.length > 0) openCalendar(state.calendars[0].id);
  });

  // Floating Action Button "+" (Image 1)
  document.getElementById('btnFloatingAdd').addEventListener('click', () => {
    openAddPlanModal();
  });

  // Period Navigation (Photo 2)
  document.getElementById('btnPrevPeriod').addEventListener('click', () => {
    const d = new Date(state.selectedWeekStart);
    d.setDate(d.getDate() - 7);
    state.selectedWeekStart = d;
    renderCalendarView(state.currentCalendarId);
  });

  document.getElementById('btnNextPeriod').addEventListener('click', () => {
    const d = new Date(state.selectedWeekStart);
    d.setDate(d.getDate() + 7);
    state.selectedWeekStart = d;
    renderCalendarView(state.currentCalendarId);
  });

  document.getElementById('btnJumpToday').addEventListener('click', () => {
    state.selectedWeekStart = getMonday(new Date());
    renderCalendarView(state.currentCalendarId);
  });

  // Auto-Open Switch Toggle (Requested by user)
  const autoOpenCheckbox = document.getElementById('autoOpenCheckbox');
  autoOpenCheckbox.addEventListener('change', () => {
    if (autoOpenCheckbox.checked) {
      localStorage.setItem(STORAGE_KEY_DEFAULT_CAL, state.currentCalendarId);
      showNotification('⚡ This calendar will now open automatically when you start the app.');
    } else {
      localStorage.removeItem(STORAGE_KEY_DEFAULT_CAL);
      showNotification('Auto-open disabled. SyncCal will now start on the group overview.');
    }
  });

  // Auto-Open Toast Actions
  document.getElementById('toastGoHomeBtn').addEventListener('click', goHome);
  document.getElementById('toastDisableAutoOpenBtn').addEventListener('click', () => {
    localStorage.removeItem(STORAGE_KEY_DEFAULT_CAL);
    document.getElementById('autoOpenToast').style.display = 'none';
    if (autoOpenCheckbox) autoOpenCheckbox.checked = false;
  });
  document.getElementById('toastCloseBtn').addEventListener('click', () => {
    document.getElementById('autoOpenToast').style.display = 'none';
  });

  // Plan Form
  document.getElementById('planForm').addEventListener('submit', handlePlanFormSubmit);
  document.getElementById('btnCancelPlan').addEventListener('click', () => document.getElementById('planModal').close());
  document.getElementById('btnClosePlanModal').addEventListener('click', () => document.getElementById('planModal').close());
  document.getElementById('btnDeletePlan').addEventListener('click', handleDeletePlan);

  // Edit Note Details
  document.getElementById('btnEditNoteDetails').addEventListener('click', () => {
    document.getElementById('noteDetailsModal').close();
    if (state.viewingNotePlan) {
      openEditPlanModal(state.viewingNotePlan);
    }
  });
  document.getElementById('btnCloseNoteDetails').addEventListener('click', () => document.getElementById('noteDetailsModal').close());
  document.getElementById('btnCloseNoteDetailsModal').addEventListener('click', () => document.getElementById('noteDetailsModal').close());

  // Invite Modal
  document.getElementById('btnOpenInviteModal').addEventListener('click', openInviteModal);
  document.getElementById('btnCalInviteHeader').addEventListener('click', openInviteModal);
  document.getElementById('btnManageMembers').addEventListener('click', openInviteModal);
  document.getElementById('btnCloseInviteModal').addEventListener('click', () => document.getElementById('inviteModal').close());
  document.getElementById('btnDoneInvite').addEventListener('click', () => document.getElementById('inviteModal').close());
  document.getElementById('btnAddMemberBtn').addEventListener('click', handleAddMemberDirect);

  // Copy Code & Link
  document.getElementById('btnCopyInviteCode').addEventListener('click', () => {
    const code = document.getElementById('inviteCodeInput').value;
    navigator.clipboard.writeText(code).then(() => {
      showNotification('Group invite code copied to clipboard! 📋');
    });
  });

  document.getElementById('btnCopyInviteLink').addEventListener('click', () => {
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
  document.getElementById('newCalendarForm').addEventListener('submit', handleNewCalendarSubmit);
  document.getElementById('btnCancelNewCal').addEventListener('click', () => document.getElementById('newCalendarModal').close());
  document.getElementById('btnCloseNewCalModal').addEventListener('click', () => document.getElementById('newCalendarModal').close());

  // Quick Shared Note
  document.getElementById('btnAddQuickNote').addEventListener('click', openQuickNoteModal);
  document.getElementById('quickNoteForm').addEventListener('submit', handleQuickNoteSubmit);
  document.getElementById('btnCancelQuickNote').addEventListener('click', () => document.getElementById('quickNoteModal').close());
  document.getElementById('btnCloseQuickNoteModal').addEventListener('click', () => document.getElementById('quickNoteModal').close());

  // Search
  const searchInput = document.getElementById('globalSearchInput');
  const clearBtn = document.getElementById('searchClearBtn');

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

  // User Identity Dropdown Toggle
  const identityBtn = document.getElementById('userIdentityBtn');
  const identityDropdown = document.getElementById('identityDropdown');
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

  // APK Guide Modal
  document.getElementById('btnOpenApkGuide').addEventListener('click', () => {
    document.getElementById('apkGuideModal').showModal();
  });
  document.getElementById('btnDoneApkGuide').addEventListener('click', () => {
    document.getElementById('apkGuideModal').close();
  });
  document.getElementById('btnCloseApkGuideModal').addEventListener('click', () => {
    document.getElementById('apkGuideModal').close();
  });

  // Data Backup / Reset
  document.getElementById('btnExportData').addEventListener('click', () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state.calendars, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute("href", dataStr);
    dlAnchor.setAttribute("download", `synccal_backup_${toDateString(new Date())}.json`);
    dlAnchor.click();
  });

  document.getElementById('btnResetDemoData').addEventListener('click', () => {
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
