import React from 'react';

// Vista RouteModesView; conserva los IDs y el marcado que utiliza el motor original.
const markup = `<div id="route-modes">
        <button class="route-mode active" data-mode="driving">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M5 17h14M5 17l1.5-6L8 5h8l1.5 6L19 17M7 17v2M17 17v2"/>
                <circle cx="7.5" cy="14" r="0.5" fill="currentColor"/>
                <circle cx="16.5" cy="14" r="0.5" fill="currentColor"/>
            </svg>
            Auto
        </button>
        <button class="route-mode" data-mode="walking">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="13" cy="4" r="2"/>
                <path d="M11 8l-2 5 3 3 2-6 3 4"/>
                <path d="M9 21l2-5M15 21l-2-5"/>
            </svg>
            A pie
        </button>
        <button class="route-mode" data-mode="cycling">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="5.5" cy="17.5" r="3.5"/>
                <circle cx="18.5" cy="17.5" r="3.5"/>
                <path d="M15 6l3 5M12 17.5l3-8 3 3M9 17.5l-3-3 3-3"/>
            </svg>
            Bici
        </button>
    </div>`;

export default function RouteModesView() {
  return <div className="view-slot" dangerouslySetInnerHTML={{ __html: markup }} />;
}
