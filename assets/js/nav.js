// ===== COURSE NAVIGATION =====
// This reads the course structure from a JSON file and builds sidebar

const COURSE_BASE = '/courses/';

async function loadNav() {
    // Fetch course manifest
    const manifestPath = window.location.pathname.split('/courses/')[0] + '/courses/manifest.json';

    try {
        const res = await fetch(manifestPath);
        const manifest = await res.json();
        buildSidebar(manifest);
        highlightCurrent(manifest);
        updateProgress(manifest);
    } catch(e) {
        console.error('Failed to load course manifest:', e);
    }
}

function buildSidebar(manifest) {
    const container = document.getElementById('nav-container');
    if (!container) return;

    let html = '';

    for (const [courseId, course] of Object.entries(manifest.courses)) {
        html += `<div class="course-name">${course.title}</div>`;

        for (const [moduleId, module] of Object.entries(course.modules)) {
            html += `<div class="module-name">${module.title}</div>`;

            module.lessons.forEach((lesson, idx) => {
                const path = `${COURSE_BASE}${courseId}/${moduleId}/${lesson.file}`;
                const isActive = window.location.pathname.includes(path);
                const cls = isActive ? 'active' : '';
                html += `<a href="${path}" class="nav-link ${cls}">${idx+1}. ${lesson.title}</a>`;
            });
        }
    }

    container.innerHTML = html;
}

function highlightCurrent(manifest) {
    // Already handled in buildSidebar via active class
}

function updateProgress(manifest) {
    // Simple: count how many lessons exist vs how many marked complete (localStorage)
    let total = 0;
    let completed = 0;

    for (const course of Object.values(manifest.courses)) {
        for (const module of Object.values(course.modules)) {
            total += module.lessons.length;
            module.lessons.forEach(l => {
                if (localStorage.getItem('done_' + l.file)) completed++;
            });
        }
    }

    const pct = total ? Math.round((completed / total) * 100) : 0;
    const fill = document.getElementById('progress-fill');
    const text = document.getElementById('progress-text');
    if (fill) fill.style.width = pct + '%';
    if (text) text.textContent = pct + '%';
}

function markComplete() {
    const path = window.location.pathname;
    const file = path.split('/').pop() || 'index.html';
    localStorage.setItem('done_' + file, '1');
}

// Keyboard nav
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') {
        const next = document.getElementById('btn-next');
        if (next && !next.classList.contains('disabled')) next.click();
    }
    if (e.key === 'ArrowLeft') {
        const prev = document.getElementById('btn-prev');
        if (prev && !prev.classList.contains('disabled')) prev.click();
    }
});

// Init
document.addEventListener('DOMContentLoaded', loadNav);
