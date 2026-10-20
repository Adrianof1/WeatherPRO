import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1 },
  scroll: { paddingHorizontal: 16, paddingBottom: 100 },

  // Loading
  loadingScreen: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingBrand: { color: '#fff', fontSize: 28, fontWeight: '800', marginTop: 16, letterSpacing: -1 },
  loadingSub: { color: 'rgba(255,255,255,0.4)', fontSize: 14, marginTop: 8 },

  // Header
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 8 },
  brand: { fontSize: 22, fontWeight: '800', color: '#fff', letterSpacing: -0.5 },
  brandSub: { fontSize: 10, color: 'rgba(255,255,255,0.3)' },
  refreshBtn: { padding: 8, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.08)' },

  // Tabs
  tabRow: { flexDirection: 'row', paddingHorizontal: 16, marginBottom: 8, gap: 4 },
  tab: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingVertical: 7, paddingHorizontal: 9, borderRadius: 10 },
  tabLabel: { fontSize: 12, color: 'rgba(255,255,255,0.45)', fontWeight: '500' },

  // Alert Banner
  alertBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(220,38,38,0.25)', marginHorizontal: 16, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 12, marginBottom: 6, gap: 8, borderWidth: 1, borderColor: 'rgba(220,38,38,0.3)' },
  alertBannerText: { flex: 1, color: '#fbbf24', fontSize: 12, fontWeight: '600' },

  // Mock
  mockBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(251,191,36,0.1)', marginHorizontal: 16, padding: 8, borderRadius: 10, marginBottom: 6, gap: 6 },
  mockText: { color: '#fbbf24', fontSize: 11, flex: 1 },

  // Search
  searchRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.15)', borderRadius: 14, padding: 11, marginBottom: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  searchInput: { flex: 1, color: '#fff', fontSize: 14, marginLeft: 8, paddingVertical: 0 },
  searchGo: { width: 28, height: 28, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },

  // Hero
  hero: { alignItems: 'center', paddingBottom: 20 },
  locRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 6 },
  locText: { color: 'rgba(255,255,255,0.5)', fontSize: 13, fontWeight: '500' },
  heroIcon: { marginVertical: 2 },
  heroTemp: { fontSize: 76, fontWeight: '800', color: '#fff', letterSpacing: -4, lineHeight: 82 },
  heroDesc: { fontSize: 17, color: 'rgba(255,255,255,0.75)', textTransform: 'capitalize', fontWeight: '500' },
  heroMeta: { flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 8 },
  heroMetaItem: { color: 'rgba(255,255,255,0.5)', fontSize: 13 },
  heroDot: { width: 3, height: 3, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.2)' },
  rainNow: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(56,189,248,0.15)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, marginTop: 10, gap: 6 },
  rainNowText: { color: '#38bdf8', fontSize: 12, fontWeight: '600' },

  // Glass Card
  glass: { backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 18, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },

  // Section Label
  sectionLabel: { fontSize: 11, color: 'rgba(255,255,255,0.35)', fontWeight: '700', letterSpacing: 1.2, marginBottom: 12 },

  // Hourly
  hourCard: { alignItems: 'center', paddingVertical: 10, paddingHorizontal: 12, borderRadius: 14, marginRight: 8, backgroundColor: 'rgba(255,255,255,0.05)', minWidth: 62 },
  hourTime: { color: 'rgba(255,255,255,0.45)', fontSize: 11, fontWeight: '500' },
  hourTemp: { color: '#fff', fontWeight: '700', fontSize: 14 },
  popRow: { flexDirection: 'row', alignItems: 'center', gap: 2, marginTop: 3 },
  popText: { fontSize: 10, color: '#38bdf8', fontWeight: '600' },

  // Detail Grid
  detailGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  detailCard: { width: '48.5%', alignItems: 'center', padding: 14 },
  detailIconBg: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginBottom: 7 },
  detailValue: { color: '#fff', fontSize: 16, fontWeight: '700' },
  detailLabel: { color: 'rgba(255,255,255,0.35)', fontSize: 11, marginTop: 2 },

  // Sun
  sunRow: { flexDirection: 'row', alignItems: 'center' },
  sunItem: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  sunLabel: { color: 'rgba(255,255,255,0.35)', fontSize: 11 },
  sunVal: { color: '#fff', fontSize: 16, fontWeight: '700' },
  sunDiv: { width: 1, height: 32, backgroundColor: 'rgba(255,255,255,0.08)', marginHorizontal: 14 },

  // Daily Forecast
  dayRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 11 },
  dayBorder: { borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  dayName: { color: '#fff', width: 42, fontWeight: '700', fontSize: 13 },
  dayCondWrap: { flex: 1, marginLeft: 8 },
  dayCond: { color: 'rgba(255,255,255,0.5)', fontSize: 12, textTransform: 'capitalize' },
  dayMax: { color: '#fff', fontWeight: '700', fontSize: 14, marginRight: 6 },
  dayMin: { color: 'rgba(255,255,255,0.35)', fontSize: 14, width: 30 },

  // Alerts
  alertSubhead: { color: 'rgba(255,255,255,0.4)', fontSize: 12, lineHeight: 18 },
  alertCard: { borderRadius: 16, padding: 14 },
  alertCardHeader: { flexDirection: 'row', alignItems: 'center' },
  alertCardTitle: { color: '#fff', fontSize: 14, fontWeight: '700' },
  alertMeta: { flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 8 },
  severityBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  severityText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  alertTime: { color: 'rgba(255,255,255,0.35)', fontSize: 11 },
  alertExpanded: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.06)' },
  alertMsg: { color: 'rgba(255,255,255,0.7)', fontSize: 13, lineHeight: 20 },
  alertSource: { color: 'rgba(255,255,255,0.3)', fontSize: 11, marginTop: 8 },
  floodBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 8, paddingHorizontal: 14, borderRadius: 10, marginTop: 12, alignSelf: 'flex-start' },
  floodBtnText: { fontSize: 12, fontWeight: '600' },

  // Flood Points
  riskOverall: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, marginTop: 10, alignSelf: 'flex-start' },
  riskOverallText: { fontSize: 12, fontWeight: '800', letterSpacing: 0.5 },
  floodCard: { borderRadius: 16, padding: 14 },
  floodCardHeader: { flexDirection: 'row', alignItems: 'center' },
  floodName: { color: '#fff', fontSize: 14, fontWeight: '700' },
  riskBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, marginTop: 4, alignSelf: 'flex-start' },
  riskBadgeText: { fontSize: 10, fontWeight: '800' },
  floodDesc: { color: 'rgba(255,255,255,0.5)', fontSize: 12, marginTop: 10, lineHeight: 18 },
  floodMapBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12, paddingVertical: 8, paddingHorizontal: 14, backgroundColor: 'rgba(56,189,248,0.12)', borderRadius: 10, alignSelf: 'flex-start' },
  floodMapText: { color: '#38bdf8', fontSize: 12, fontWeight: '600' },

  // Ad Banner
  adBannerWrap: { alignItems: 'center', marginVertical: 14 },
  adPlaceholder: { width: 320, height: 50, backgroundColor: '#fff', flexDirection: 'row', borderRadius: 4, overflow: 'hidden' },
  adPlaceholderStrip: { backgroundColor: '#facc15', width: 16, justifyContent: 'center', alignItems: 'center' },
  adPlaceholderLabel: { fontSize: 8, fontWeight: '800', color: '#78350f', transform: [{ rotate: '-90deg' }] },
  adPlaceholderContent: { flex: 1, paddingLeft: 10, justifyContent: 'center' },
  adPlaceholderTitle: { fontSize: 10, fontWeight: '700', color: '#333' },
  adPlaceholderSub: { fontSize: 8, color: '#999' },

  // Footer
  footer: { alignItems: 'center', paddingVertical: 20, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)', marginTop: 8 },
  footerName: { color: 'rgba(255,255,255,0.4)', fontSize: 11, fontWeight: '600' },
  footerRow: { flexDirection: 'row', gap: 12, marginTop: 8 },
  footerLink: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingVertical: 5, paddingHorizontal: 10, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 8 },
  footerLinkTxt: { color: 'rgba(255,255,255,0.4)', fontSize: 11 },
  // Estados vazios / erro
  emptyState: { alignItems: 'center', paddingVertical: 48, paddingHorizontal: 24 },
  emptyTitle: { color: '#fff', fontSize: 18, fontWeight: '700', marginTop: 14, textAlign: 'center' },
  emptyText: { color: 'rgba(255,255,255,0.55)', fontSize: 13, marginTop: 8, textAlign: 'center', lineHeight: 19 },
  primaryBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 11, paddingHorizontal: 20, borderRadius: 12, marginTop: 18, backgroundColor: 'rgba(255,255,255,0.18)' },
  primaryBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  offlineBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.25)', marginHorizontal: 16, padding: 8, borderRadius: 10, marginBottom: 6, gap: 6 },
  offlineText: { color: '#fde68a', fontSize: 11, flex: 1 },

  // Favoritos
  favRow: { flexDirection: 'row', marginBottom: 14 },
  favChip: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingVertical: 6, paddingHorizontal: 12, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.1)', marginRight: 8 },
  favChipText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  favStar: { position: 'absolute', right: 0, top: 0, padding: 6 },

  // Premium lock
  lockCard: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: 'rgba(251,191,36,0.12)', borderRadius: 14, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(251,191,36,0.25)' },
  lockText: { color: '#fde68a', fontSize: 12, flex: 1, lineHeight: 17 },
  proBadge: { backgroundColor: '#fbbf24', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 1, marginLeft: 6 },
  proBadgeText: { color: '#422006', fontSize: 9, fontWeight: '800' },

  // Tela de apoio / premium
  perkRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 5 },
  perkText: { color: 'rgba(255,255,255,0.85)', fontSize: 13, flex: 1 },
  coffeeCard: { alignItems: 'center', paddingVertical: 22 },
  coffeeTitle: { color: '#fff', fontSize: 20, fontWeight: '800', marginTop: 8 },
  coffeeSub: { color: 'rgba(255,255,255,0.6)', fontSize: 13, marginTop: 6, textAlign: 'center', lineHeight: 19 },
  buyBtn: { backgroundColor: '#fbbf24', borderRadius: 14, paddingVertical: 13, paddingHorizontal: 28, marginTop: 16, minWidth: 220, alignItems: 'center' },
  buyBtnText: { color: '#422006', fontSize: 15, fontWeight: '800' },
  buyBtnDisabled: { opacity: 0.5 },
  donateGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  donateBtn: { width: '31.5%', alignItems: 'center', paddingVertical: 14, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.1)', marginBottom: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)' },
  donateAmount: { color: '#fff', fontSize: 15, fontWeight: '800' },
  donateLabel: { color: 'rgba(255,255,255,0.45)', fontSize: 10, marginTop: 2 },
  linkText: { color: 'rgba(255,255,255,0.55)', fontSize: 12, textDecorationLine: 'underline', textAlign: 'center', paddingVertical: 10 },
  premiumActive: { alignItems: 'center', paddingVertical: 20, backgroundColor: 'rgba(251,191,36,0.12)', borderColor: 'rgba(251,191,36,0.3)' },
  smallNote: { color: 'rgba(255,255,255,0.4)', fontSize: 11, lineHeight: 16, textAlign: 'center', marginTop: 6 },
});
