export const addonConfig = {
  ADDON_AUTH: import.meta.env.VITE_ADDON_AUTH !== 'false',
  ADDON_EMPHASIS: import.meta.env.VITE_ADDON_EMPHASIS !== 'false',
  ADDON_ALERTS: import.meta.env.VITE_ADDON_ALERTS !== 'false',
  API_BASE: '/api/addons'
};
