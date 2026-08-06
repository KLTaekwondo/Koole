const makeIcon = path => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${path}</svg>`

export const HOME_SUBJECT_ICONS = {
    chinese: makeIcon('<path d="M4 5h16M4 12h16M4 19h10"/><path d="M8 3v4m8-4v4"/>'),
    math: makeIcon('<path d="M4 19 10 5l4 14 3-8 3 8"/><path d="M3 19h18"/>'),
    english: makeIcon('<path d="M5 19 10 5l5 14M7 14h6"/><path d="M15 9h5m-2.5-2.5V12"/>'),
    physics: makeIcon('<circle cx="12" cy="12" r="2"/><ellipse cx="12" cy="12" rx="9" ry="4"/><ellipse cx="12" cy="12" rx="4" ry="9" transform="rotate(45 12 12)"/>'),
    chemistry: makeIcon('<path d="M9 3h6m-5 0v6l-5 9a2 2 0 0 0 2 3h10a2 2 0 0 0 2-3l-5-9V3"/><path d="M8 15h8"/>'),
    biology: makeIcon('<path d="M12 3c4 3 6 6 6 10a6 6 0 0 1-12 0c0-4 2-7 6-10Z"/><path d="M8 14c2-1 4-3 5-6m-1 4c2 0 3 1 4 2"/>'),
    politics: makeIcon('<path d="m3 10 9-6 9 6M5 10h14M7 10v8m5-8v8m5-8v8M4 20h16"/>'),
    history: makeIcon('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2M3 12h2m14 0h2"/>'),
    geography: makeIcon('<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 4 6 4 9s-1 6-4 9c-3-3-4-6-4-9s1-6 4-9Z"/>'),
}
