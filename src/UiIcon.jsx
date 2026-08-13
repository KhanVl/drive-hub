export function HeartIcon({ filled = false }) {
  return <svg className="ui-icon heart-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M20.8 4.7a5.5 5.5 0 0 0-7.8 0L12 5.8l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.5a5.5 5.5 0 0 0 0-7.8Z" fill={filled ? 'currentColor' : 'none'} /></svg>
}

export function ArrowIcon({ direction = 'right' }) {
  return <svg className={`ui-icon arrow-icon ${direction}`} viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M14 7l5 5-5 5" /></svg>
}

export function ChevronIcon({ direction = 'right' }) {
  return <svg className={`ui-icon chevron-icon ${direction}`} viewBox="0 0 24 24" aria-hidden="true"><path d="m9 5 7 7-7 7" /></svg>
}

export function SearchIcon() {
  return <svg className="ui-icon search-icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="m16 16 4 4"/></svg>
}
