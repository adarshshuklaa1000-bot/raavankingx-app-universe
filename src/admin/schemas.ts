import type { FieldDef } from "./fields";
import { UPCOMING_STATUS } from "@/services/types";
import type { Category } from "@/services/types";

export const appFields = (categories: Category[]): FieldDef[] => [
  { key: "kind", label: "Type", type: "select", required: true, options: [
    { value: "app", label: "App" },
    { value: "website", label: "Website" },
  ] },
  { key: "name", label: "Name", type: "text", required: true },
  { key: "website_url", label: "Website link", type: "url", required: true, help: "Opens inside RaavanKingX." },
  { key: "logo_url", label: "Logo", type: "image", folder: "logos" },
  { key: "description", label: "Short description", type: "textarea", notNull: true },
  { key: "category_id", label: "Category", type: "select", options: categories.map((c) => ({ value: c.id, label: `${c.icon} ${c.name}` })) },
  { key: "version", label: "Version", type: "text", placeholder: "e.g. 2.1" },
  { key: "update_notes", label: "Update notes", type: "textarea" },
  { key: "webview_mode", label: "Opening mode", type: "select", required: true, options: [
    { value: "compatible", label: "Open directly" },
    { value: "restricted", label: "Show a note first (site may block in-app view)" },
  ] },
  { key: "is_vip", label: "VIP badge", type: "bool" },
  { key: "is_new", label: "NEW tag", type: "bool" },
  { key: "is_popular", label: "Popular", type: "bool" },
  { key: "is_updated", label: "Updated tag", type: "bool" },
  { key: "is_featured", label: "Featured", type: "bool" },
  { key: "is_published", label: "Visible to users", type: "bool" },
];

export const upcomingFields: FieldDef[] = [
  { key: "name", label: "Name", type: "text", required: true },
  { key: "logo_url", label: "Logo", type: "image", folder: "upcoming" },
  { key: "description", label: "Description", type: "textarea", notNull: true },
  { key: "status", label: "Status", type: "select", required: true, options: Object.entries(UPCOMING_STATUS).map(([value, label]) => ({ value, label })) },
  { key: "release_date", label: "Release date", type: "date" },
  { key: "progress", label: "Progress %", type: "number", min: 0, max: 100 },
  { key: "website_url", label: "Website link (for launch)", type: "url" },
  { key: "notify_enabled", label: "Notify Me button", type: "bool" },
  { key: "notify_url", label: "Notify Me link", type: "url", help: "Optional, e.g. your Telegram channel." },
  { key: "is_published", label: "Visible to users", type: "bool" },
];

export const bannerFields: FieldDef[] = [
  { key: "image_url", label: "Banner image", type: "image", required: true, folder: "banners", help: "Wide image, about 16:7." },
  { key: "title", label: "Title", type: "text" },
  { key: "subtitle", label: "Subtitle", type: "text" },
  { key: "action_label", label: "Button text", type: "text", placeholder: "OPEN" },
  { key: "action_url", label: "Button link", type: "url" },
  { key: "is_published", label: "Visible to users", type: "bool" },
];

export const noticeFields: FieldDef[] = [
  { key: "title", label: "Title", type: "text", required: true },
  { key: "body", label: "Message", type: "textarea", notNull: true },
  { key: "priority", label: "Priority", type: "select", required: true, options: [
    { value: "normal", label: "Normal" },
    { value: "urgent", label: "Urgent (red)" },
  ] },
  { key: "is_blinking", label: "Blinking dot", type: "bool" },
  { key: "action_url", label: "Link (optional)", type: "url" },
  { key: "starts_at", label: "Show from", type: "datetime", help: "Leave empty to show now." },
  { key: "expires_at", label: "Hide after", type: "datetime", help: "Leave empty to never expire." },
  { key: "is_published", label: "Visible to users", type: "bool" },
];

export const categoryFields: FieldDef[] = [
  { key: "name", label: "Name", type: "text", required: true },
  { key: "icon", label: "Icon (emoji)", type: "text", required: true, placeholder: "📚" },
  { key: "is_published", label: "Visible to users", type: "bool" },
];

export const settingsSections: { title: string; fields: FieldDef[] }[] = [
  { title: "Branding", fields: [
    { key: "app_name", label: "App name", type: "text", required: true },
    { key: "app_tagline", label: "Tagline", type: "text", required: true },
    { key: "app_logo", label: "Logo", type: "image", folder: "branding" },
    { key: "theme_primary", label: "Main color", type: "color" },
    { key: "theme_vip", label: "VIP color", type: "color" },
    { key: "splash_enabled", label: "Splash screen", type: "bool" },
    { key: "splash_image", label: "Splash image", type: "image", folder: "branding" },
  ] },
  { title: "Home page", fields: [
    { key: "banner_enabled", label: "Banner slider", type: "bool" },
    { key: "banner_interval_ms", label: "Slide time (milliseconds)", type: "number", required: true, min: 2000, max: 20000 },
  ] },
  { title: "Telegram", fields: [
    { key: "telegram_enabled", label: "Show Telegram strip", type: "bool" },
    { key: "telegram_url", label: "Telegram link", type: "url", required: true },
    { key: "telegram_icon", label: "Telegram icon", type: "image", folder: "branding" },
    { key: "telegram_label", label: "Label", type: "text", required: true },
    { key: "telegram_join_text", label: "Button text", type: "text", required: true },
    { key: "telegram_message", label: "Message", type: "textarea", required: true },
  ] },
  { title: "Android app & install", fields: [
    { key: "pwa_install_enabled", label: "Show 'Install web app' button", type: "bool" },
    { key: "apk_url", label: "APK download link", type: "url" },
    { key: "app_version", label: "APK version", type: "text" },
    { key: "apk_release_date", label: "APK release date", type: "date" },
    { key: "apk_whats_new", label: "What's new", type: "textarea" },
  ] },
  { title: "In-app browser", fields: [
    { key: "allowed_domains", label: "Extra allowed domains", type: "tags", placeholder: "one per line, e.g. youtube.com", help: "Links to these sites stay inside the app. Each app's own site is always allowed." },
  ] },
  { title: "Maintenance", fields: [
    { key: "maintenance_enabled", label: "Maintenance mode", type: "bool", help: "Visitors see a maintenance screen; admins still see the app." },
    { key: "maintenance_message", label: "Maintenance message", type: "textarea", required: true },
  ] },
];

export const ownerSections: { title: string; fields: FieldDef[] }[] = [
  { title: "Profile", fields: [
    { key: "name", label: "Name", type: "text", required: true },
    { key: "photo_url", label: "Photo", type: "image", folder: "owner" },
    { key: "tagline", label: "Tagline", type: "text" },
    { key: "about", label: "About", type: "textarea", notNull: true },
  ] },
  { title: "Links", fields: [
    { key: "contact_links", label: "Contact", type: "links" },
    { key: "social_links", label: "Social & official", type: "links" },
  ] },
];
