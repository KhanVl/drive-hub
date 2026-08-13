const icons = {
  leather: <><path d="M7 3v8c0 2 1.5 3 3.5 3H17v7"/><path d="M7 10h7l2 4v3H9a4 4 0 0 1-4-4V7"/></>,
  'rear-camera': <><rect x="3" y="6" width="18" height="12" rx="2"/><circle cx="12" cy="12" r="3.5"/><path d="m8 6 1.5-2h5L16 6"/></>,
  climate: <><path d="M12 2v20M4.2 6.5l15.6 11M4.2 17.5l15.6-11"/><path d="m12 2-2 2m2-2 2 2M4 6.5l3-.5m-3 .5.5 3M20 6.5 17 6m3 .5-.5 3M4 17.5l3 .5m-3-.5.5-3m15.5 3-3 .5m3-.5-.5-3M12 22l-2-2m2 2 2-2"/></>,
  'parking-sensors': <><path d="M4 15h12l2-4-2-4H7L4 10z"/><circle cx="7" cy="16.5" r="1.5"/><circle cx="15" cy="16.5" r="1.5"/><path d="M19 8c2 1 2 7 0 8m2-10c3 2 3 10 0 12"/></>,
  'heated-seats': <><path d="M7 4v7c0 2 1.5 3 3.5 3H17v7M5 10v3a4 4 0 0 0 4 4h8"/><path d="M11 3c-2 2 2 3 0 5m4-5c-2 2 2 3 0 5"/></>,
  cruise: <><path d="M5 18a9 9 0 1 1 14 0M8 18h8"/><path d="m12 12 5-3"/><circle cx="12" cy="12" r="1"/></>,
  'led-headlights': <><path d="M4 7c6 0 9 2 9 5s-3 5-9 5z"/><path d="m16 7 4-2m-4 7h5m-5 5 4 2"/></>,
  'smart-key': <><circle cx="8" cy="10" r="4"/><path d="m11 13 8 8m-3-3 2-2m-5-1 2-2"/></>,
  navigation: <><path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></>,
  'ventilated-seats': <><path d="M6 4v7c0 2 1.5 3 3.5 3H17v7M4 11v2a4 4 0 0 0 4 4h9"/><path d="M11 3v6m0 0-2-2m2 2 2-2m4-4v6m0 0-2-2m2 2 2-2"/></>,
  'memory-seats': <><path d="M6 4v7c0 2 1.5 3 3.5 3H17v7M4 11v2a4 4 0 0 0 4 4h9"/><circle cx="17" cy="6" r="1"/><circle cx="20" cy="9" r="1"/></>,
  'heated-steering': <><circle cx="12" cy="13" r="8"/><circle cx="12" cy="13" r="2"/><path d="M4.5 11h15M12 15v6M9 2c-2 2 2 3 0 5m6-5c-2 2 2 3 0 5"/></>,
  panorama: <><path d="M3 17 6 7h12l3 10z"/><path d="M7 9h10l1.5 6h-13zM12 9v6"/></>,
  'blind-spot': <><path d="M3 15c3-5 7-7 13-6l4 3-4 4H7z"/><circle cx="19" cy="7" r="3"/><path d="M19 5.5v2m0 1.5v.1"/></>,
  'lane-assist': <><path d="m6 2-3 20m15-20 3 20M9 17h6l1-5-2-2h-4l-2 2z"/><circle cx="10" cy="17" r="1"/><circle cx="14" cy="17" r="1"/></>,
  'adaptive-cruise': <><path d="M4 13a8 8 0 0 1 16 0m-12 6h8l1-4-2-2H9l-2 2z"/><path d="m12 10 4-3"/></>,
  'electric-trunk': <><path d="M4 17h13l2-7H8L4 13z"/><circle cx="7" cy="18" r="1.5"/><circle cx="16" cy="18" r="1.5"/><path d="M8 10V5h8m0 0-2-2m2 2-2 2"/></>,
  'around-view': <><rect x="8" y="5" width="8" height="14" rx="2"/><path d="M5 8C1 11 2 17 7 20m12-12c4 3 3 9-2 12M5 8V4h4m10 4V4h-4"/></>,
  'wireless-charge': <><rect x="7" y="2" width="10" height="20" rx="2"/><path d="M10 16c1-1 3-1 4 0m-5-3c2-2 4-2 6 0m-8-3c3-3 7-3 10 0"/></>,
  'premium-audio': <><path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M16 9c2 2 2 4 0 6m3-9c4 4 4 8 0 12"/></>,
  'apple-carplay': <><rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8 8h8M8 12h3m2 0h3M8 16h8"/></>,
  'head-up-display': <><path d="M3 17 6 6h12l3 11z"/><path d="M8 14h8m-6-3h4"/></>,
  'auto-parking': <><path d="M5 19V5h6a4 4 0 0 1 0 8H5m3-5h3a1 1 0 0 1 0 2H8"/><path d="M17 7c3 2 3 8 0 10"/></>,
  'rain-sensor': <><path d="M4 16h16L17 6H7z"/><path d="M8 2 7 4m5-2-1 2m5-2-1 2M9 11l2 2 4-4"/></>,
}

export default function EquipmentIcon({ name }) {
  return <svg className="equipment-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">{icons[name] || <circle cx="12" cy="12" r="8"/>}</svg>
}
