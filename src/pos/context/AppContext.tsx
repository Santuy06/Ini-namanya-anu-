import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  UserRole, StaffUser, TableItem, TableStatus, MenuItem, CartItem, BillItem,
  TransactionRecord, KitchenTicket, RawIngredient, OrderItemSummary,
} from '../types';
import { supabase, tableUrl } from '../../lib/supabase';
import { billOfOrders, itemsSubtotal, today } from '../../lib/domain';
import { placeholderImage, isPlaceholder } from '../../lib/placeholder';

export type AppView =
  | 'login' | 'meja-dan-pelanggan' | 'pesanan-baru' | 'checkout' | 'pembayaran'
  | 'pantau-pesanan' | 'dashboard' | 'kelola-menu' | 'kelola-meja' | 'akun-staf-dan-role' | 'laporan';

interface ToastNotification { id: string; message: string; type?: 'success' | 'info' | 'warning'; }
type PayMethod = 'Tunai' | 'QRIS' | 'Kartu Debit';

interface AppContextType {
  currentUser: StaffUser;
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  isLoggedIn: boolean;
  authLoading: boolean;
  /** true setelah data pertama selesai dimuat dari database. */
  dataReady: boolean;
  /** Mengembalikan pesan error, atau null bila berhasil. */
  login: (email: string, password: string) => Promise<string | null>;
  logout: () => void;

  activeView: AppView;
  setActiveView: (view: AppView) => void;
  viewportMode: 'auto' | 'mobile' | 'desktop';
  setViewportMode: (mode: 'auto' | 'mobile' | 'desktop') => void;
  outletName: string;
  setOutletName: (name: string) => void;

  tables: TableItem[];
  selectedTableId: string;
  setSelectedTableId: (id: string) => void;
  updateTable: (table: TableItem) => void;
  addTable: (tableNumber: number, capacity: number, area: string) => Promise<boolean>;

  cartItems: CartItem[];
  orderTableNumber: string;
  setOrderTableNumber: (tableNumber: string) => void;
  orderCustomerName: string;
  setOrderCustomerName: (name: string) => void;
  orderGuestCount: number;
  setOrderGuestCount: (count: number) => void;
  kitchenGeneralNote: string;
  setKitchenGeneralNote: (note: string) => void;
  addToCart: (item: MenuItem, quantity?: number, notes?: string) => void;
  removeFromCart: (menuItemId: string) => void;
  updateCartQuantity: (menuItemId: string, delta: number) => void;
  updateCartItemNotes: (menuItemId: string, notes: string) => void;
  clearCart: () => void;
  sendOrderToKitchen: () => void;
  saveDraftOrder: () => void;

  bills: BillItem[];
  selectedBillId: string;
  setSelectedBillId: (id: string) => void;
  selectedBill: BillItem | undefined;
  settlePayment: (billId: string, method: PayMethod, amountTendered?: number) => void;

  menuItems: MenuItem[];
  menuCategories: string[];
  updateMenuItem: (item: MenuItem) => void;
  addMenuItem: (item: MenuItem) => void;

  rawIngredients: RawIngredient[];
  lowStockIngredients: RawIngredient[];
  updateIngredientStock: (id: string, newStock: number) => void;
  restockIngredient: (id: string, addedStock: number) => void;
  updateIngredientMinimum: (id: string, newMin: number) => void;
  addRawIngredient: (ingredient: RawIngredient) => void;
  dismissStockWarning: boolean;
  setDismissStockWarning: (dismissed: boolean) => void;

  kitchenTickets: KitchenTicket[];
  advanceTicketStatus: (ticketId: string) => void;

  transactions: TransactionRecord[];

  toast: ToastNotification | null;
  showToast: (message: string, type?: 'success' | 'info' | 'warning') => void;
  receiptModalData: BillItem | null;
  openReceiptModal: (bill: BillItem) => void;
  closeReceiptModal: () => void;
  qrModalTable: TableItem | null;
  openQrModal: (table: TableItem) => void;
  closeQrModal: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// ---------- helper tampilan ----------
const pad = (n: number | string) => String(n).padStart(2, '0');
const WIB = 'Asia/Jakarta';
const hhmm = (iso?: string | null) => (iso ? new Date(iso).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', timeZone: WIB }).replace(':', '.') : '-');
const hhmmColon = (iso: string) => hhmm(iso).replace('.', ':');
const minsSince = (iso?: string | null) => (iso ? Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 60000)) : 0);
const idDate = (iso?: string | null) => (iso ? new Date(iso).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', timeZone: WIB }) : '-');
const rp = (n: number) => `Rp ${Math.round(n).toLocaleString('id-ID')}`;

const ROLE_FROM_DB: Record<string, UserRole> = { admin: 'admin', staff: 'kasir', kitchen: 'kitchen' };
const ROLE_TO_DB: Record<string, string> = { admin: 'admin', kasir: 'staff', kitchen: 'kitchen' };
const METHOD_TO_DB: Record<PayMethod, string> = { Tunai: 'cash', QRIS: 'qris', 'Kartu Debit': 'debit' };
const METHOD_FROM_DB: Record<string, TransactionRecord['method']> = { cash: 'Tunai', qris: 'QRIS', debit: 'Kartu Debit' };
const BAR_CATEGORIES = ['Teh', 'Kopi', 'Wedang', 'Lainnya'];

const STATUS_LABEL: Record<TableStatus, string> = {
  kosong: 'Kosong', terisi: 'Disajikan', checkout: 'Minta Checkout', diproses: 'Diproses',
  siap_diantar: 'Siap Diantar', draf: 'Draf Pesanan', terkirim: 'Terkirim',
};
const ORDER_TO_TABLE: Record<string, TableStatus> = { submitted: 'terkirim', preparing: 'diproses', ready: 'siap_diantar', served: 'terisi' };
const ORDER_TO_TICKET: Record<string, KitchenTicket['status']> = { submitted: 'new', preparing: 'preparing', ready: 'ready', served: 'served' };

const GUEST_USER: StaffUser = { id: '', name: '', email: '', role: 'kasir', avatar: '', shift: '', terminal: '' };
const toStaffUser = (p: any, email: string): StaffUser => ({
  id: p.id, name: p.full_name, email: p.email || email, role: ROLE_FROM_DB[p.role] ?? 'kasir',
  avatar: '', shift: p.shift || '', terminal: p.terminal || '',
});
const homeView = (r: UserRole): AppView => (r === 'kitchen' ? 'pantau-pesanan' : r === 'admin' ? 'dashboard' : 'meja-dan-pelanggan');

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<StaffUser>(GUEST_USER);
  const [currentRole, setCurrentRoleState] = useState<UserRole>('kasir');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [dataReady, setDataReady] = useState(false);
  const [activeView, setActiveView] = useState<AppView>('meja-dan-pelanggan');
  const [viewportMode, setViewportMode] = useState<'auto' | 'mobile' | 'desktop'>('auto');
  const [outletName, setOutletName] = useState('Rawon Gusti Surabaya');

  // data dari database
  const [rawTables, setRawTables] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [rawIngredients, setRawIngredients] = useState<RawIngredient[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [now, setNow] = useState(Date.now());

  // state UI
  const [selectedTableId, setSelectedTableId] = useState('');
  const [orderTableNumber, setOrderTableNumber] = useState('');
  const [orderCustomerName, setOrderCustomerName] = useState('');
  const [orderGuestCount, setOrderGuestCount] = useState(2);
  const [kitchenGeneralNote, setKitchenGeneralNote] = useState('');
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedBillId, setSelectedBillId] = useState('');
  const [dismissStockWarning, setDismissStockWarning] = useState(false);
  const [toast, setToast] = useState<ToastNotification | null>(null);
  const [receiptModalData, setReceiptModalData] = useState<BillItem | null>(null);
  const [qrModalTable, setQrModalTable] = useState<TableItem | null>(null);

  const seenRequests = useRef<Set<number> | null>(null);
  const roleRef = useRef<UserRole>('kasir');

  const showToast = useCallback((message: string, type: 'success' | 'info' | 'warning' = 'info') => {
    const id = Date.now().toString() + Math.random();
    setToast({ id, message, type });
    setTimeout(() => setToast((c) => (c?.id === id ? null : c)), 2800);
  }, []);

  // ---------- muat data ----------
  // ---------- muat data katalog statis (hanya sekali saat login atau ada perubahan master) ----------
  const loadMasterData = useCallback(async () => {
    try {
      const [cats, prods, tbls, ings] = await Promise.all([
        supabase.from('categories').select('*').order('category_id'),
        supabase.from('products').select('*, categories(name)').order('product_id'),
        supabase.from('tables').select('*').eq('is_active', true).order('table_number'),
        supabase.from('ingredients').select('*').order('ingredient_id'),
      ]);
      if (cats.data) setCategories(cats.data);
      if (prods.data) setProducts(prods.data);
      if (tbls.data) setRawTables(tbls.data);
      if (ings.data) {
        setRawIngredients(ings.data.map((i: any): RawIngredient => ({
          id: String(i.ingredient_id), code: i.code, name: i.name, category: i.category,
          currentStock: Number(i.current_stock), minimumStock: Number(i.minimum_stock), unit: i.unit,
          costPerUnit: Number(i.cost_per_unit), supplier: i.supplier || '-',
          lastRestocked: idDate(i.last_restocked), linkedMenuItems: i.linked_menu_items || [],
        })));
      }
    } catch (e) {
      console.warn('[supabase master load error]', e);
    }
  }, []);

  // ---------- muat data operasional dinamis (sesi meja, panggilan pelayan, pembayaran hari ini) ----------
  const refreshDynamic = useCallback(async () => {
    const role = roleRef.current;
    const canSeeMoney = role !== 'kitchen';
    try {
      const [ses, reqs, pays] = await Promise.all([
        supabase.from('table_sessions')
          .select('session_id,table_id,guest_count,customer_name,opened_at,orders(order_id,order_number,order_status,order_source,total,note,created_at,ready_at,served_at,profiles(full_name),order_items(order_item_id,product_id,product_name,unit_price,quantity,note))')
          .is('closed_at', null),
        supabase.from('service_requests').select('*').eq('status', 'pending'),
        canSeeMoney
          ? supabase.from('payments').select('payment_id,method,amount,paid_at,orders(order_number,order_source,table_sessions(tables(table_number)))')
              .eq('status', 'paid').gte('paid_at', today() + 'T00:00:00+07:00').order('paid_at', { ascending: false })
          : Promise.resolve({ data: [] }),
      ]);

      const reqData = reqs.data ?? [];
      const tblData = rawTables;

      if (ses.data) setSessions(ses.data);
      if (reqs.data) setRequests(reqData);
      if (pays.data) setPayments(pays.data);

      // Notifikasi suara & toast jika ada permintaan meja baru
      const prev = seenRequests.current;
      if (prev && role !== 'kitchen') {
        const newReqs = reqData.filter((r: any) => !prev.has(r.request_id));
        if (newReqs.length > 0) {
          try {
            const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
            if (AudioCtx) {
              const ctx = new AudioCtx();
              const osc = ctx.createOscillator();
              const gain = ctx.createGain();
              osc.connect(gain);
              gain.connect(ctx.destination);
              osc.type = 'triangle';
              osc.frequency.setValueAtTime(659.25, ctx.currentTime);
              osc.frequency.exponentialRampToValueAtTime(523.25, ctx.currentTime + 0.2);
              gain.gain.setValueAtTime(0.25, ctx.currentTime);
              gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
              osc.start();
              osc.stop(ctx.currentTime + 0.5);
            }
          } catch {
            // Browser policy ignore
          }
          newReqs.forEach((r: any) => {
            const t = tblData.find((x: any) => x.table_id === r.table_id);
            showToast(`Meja ${pad(t?.table_number ?? '?')} ${r.kind === 'checkout' ? 'minta tagihan' : 'memanggil pelayan'}`, 'warning');
          });
        }
      }
      seenRequests.current = new Set(reqData.map((r: any) => r.request_id));
      setDataReady(true);
    } catch (e) {
      console.warn('[supabase dynamic refresh error]', e);
    }
  }, [rawTables, showToast]);

  const refresh = useCallback(async () => {
    await Promise.all([loadMasterData(), refreshDynamic()]);
  }, [loadMasterData, refreshDynamic]);

  // ---------- auth ----------
  const loadProfile = async (uid: string, email: string) => {
    const { data } = await supabase.from('profiles').select('*').eq('id', uid).eq('is_active', true).maybeSingle();
    return data && ['admin', 'staff', 'kitchen'].includes(data.role) ? toStaffUser(data, email) : null;
  };
  const enter = (u: StaffUser) => {
    roleRef.current = u.role;
    setCurrentUser(u); setCurrentRoleState(u.role); setIsLoggedIn(true); setActiveView(homeView(u.role));
  };

  useEffect(() => {
    let alive = true;
    supabase.auth.getSession().then(async ({ data }) => {
      const s = data.session;
      const u = s ? await loadProfile(s.user.id, s.user.email || '') : null;
      if (!alive) return;
      if (u) enter(u); else if (s) await supabase.auth.signOut();
      setAuthLoading(false);
    });
    return () => { alive = false; };
  }, []);

  const login = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error || !data.user) return 'Email atau kata sandi tidak cocok.';
    const u = await loadProfile(data.user.id, data.user.email || '');
    if (!u) { await supabase.auth.signOut(); return 'Akun ini belum terdaftar sebagai staf aktif.'; }
    enter(u);
    showToast(`Berhasil masuk sebagai ${u.role.toUpperCase()}`, 'success');
    return null;
  };
  const logout = () => {
    supabase.auth.signOut();
    setIsLoggedIn(false); setDataReady(false); setCurrentUser(GUEST_USER); setActiveView('login');
    seenRequests.current = null; setSessions([]); setPayments([]);
    showToast('Sesi berakhir. Sampai jumpa!');
  };
  // hanya admin yang boleh "melihat sebagai" peran lain (pratinjau tampilan)
  const setCurrentRole = (r: UserRole) => { if (currentUser.role === 'admin') setCurrentRoleState(r); };

  // data awal + realtime cerdas (hemat koneksi Supabase & pgbouncer)
  useEffect(() => {
    if (!isLoggedIn) return;
    refresh();

    let debounceTimer: ReturnType<typeof setTimeout>;
    const handleRealtimeChange = (payload: any) => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        const table = payload?.table;
        if (['products', 'categories', 'tables', 'ingredients'].includes(table)) {
          loadMasterData();
        }
        refreshDynamic();
      }, 700);
    };

    const ch = supabase.channel('pos-live');
    ['orders', 'order_items', 'payments', 'table_sessions', 'service_requests', 'products', 'tables', 'ingredients'].forEach((t) =>
      ch.on('postgres_changes', { event: '*', schema: 'public', table: t }, handleRealtimeChange));
    ch.subscribe();

    // Polling cerdas: HANYA berjalan jika tab sedang aktif dilihat (tidak polling saat tab diminimalkan/di latar belakang)
    // Interval dinaikkan ke 60 detik sebagai fail-safe cadangan
    const pollInterval = setInterval(() => {
      if (!document.hidden) {
        refreshDynamic();
      }
    }, 60000);

    // Saat pengguna membuka kembali tab browser setelah diminimalkan, refresh sekali
    const onVisibilityChange = () => {
      if (!document.hidden) {
        refreshDynamic();
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('focus', onVisibilityChange);

    return () => {
      clearTimeout(debounceTimer);
      clearInterval(pollInterval);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('focus', onVisibilityChange);
      supabase.removeChannel(ch);
    };
  }, [isLoggedIn, refresh, loadMasterData, refreshDynamic]);

  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t); }, []);

  // ---------- turunan: menu ----------
  const productCategory = useMemo(() => new Map(products.map((p) => [p.product_id, p.categories?.name as string])), [products]);
  const menuItems: MenuItem[] = useMemo(() => products.map((p) => ({
    id: String(p.product_id), dbId: p.product_id, code: p.product_code, name: p.name,
    category: p.categories?.name ?? '-', price: Number(p.price), description: p.description || '',
    image: p.image_url || placeholderImage(p.name), isAvailable: p.is_available,
    isFavorite: p.is_favorite, isSignature: p.is_signature, portionsSold: 0,
  })), [products]);
  const menuCategories = useMemo(() => categories.map((c) => c.name as string), [categories]);

  // ---------- turunan: meja, tagihan, tiket dapur ----------
  const tables: TableItem[] = useMemo(() => rawTables.map((t) => {
    const s = sessions.find((x) => x.table_id === t.table_id);
    const base: TableItem = {
      id: `tbl-${pad(t.table_number)}`, dbId: t.table_id, qrToken: t.qr_token, number: pad(t.table_number),
      capacity: t.capacity, area: t.area, status: 'kosong', statusLabel: STATUS_LABEL.kosong,
      qrCodeId: `RG-M${pad(t.table_number)}`, qrUrl: tableUrl(t.qr_token),
    };
    if (!s) return base;
    const live = (s.orders || []).filter((o: any) => o.order_status !== 'draft');
    const drafts = (s.orders || []).filter((o: any) => o.order_status === 'draft');
    const shown = live.length ? live : drafts;
    const req = requests.find((r) => r.table_id === t.table_id && r.kind === 'checkout');
    const has = (st: string) => live.find((o: any) => o.order_status === st);
    let status: TableStatus; let info = `Sejak ${hhmm(s.opened_at)}`;
    if (!live.length && !drafts.length) status = 'terisi';
    else if (!live.length) { status = 'draf'; info = 'Belum dikirim'; }
    else if (req) { status = 'checkout'; info = `Diminta ${hhmm(req.created_at)}`; }
    else if (has('preparing')) { status = 'diproses'; info = `Kitchen ${minsSince(has('preparing').created_at)} min`; }
    else if (has('submitted')) { status = 'terkirim'; info = `Antrean ${minsSince(has('submitted').created_at)} min`; }
    else if (has('ready')) { status = 'siap_diantar'; info = `Siap ${hhmm(has('ready').ready_at)}`; }
    else status = ORDER_TO_TABLE.served;
    const items: OrderItemSummary[] = shown.flatMap((o: any) => o.order_items.map((i: any) => ({
      name: i.product_name, quantity: i.quantity, price: i.unit_price * i.quantity, notes: i.note || undefined })));
    const totalRaw = shown.reduce((a: number, o: any) => a + Number(o.total), 0);
    return { ...base, status, statusLabel: STATUS_LABEL[status], name: s.customer_name || undefined, guestCount: s.guest_count,
      totalRaw, totalFormatted: rp(totalRaw), billId: `${status === 'draf' ? 'D' : 'B'}-${s.session_id}`, infoSubtitle: info, sessionId: s.session_id, items };
  }), [rawTables, sessions, requests, now]); // eslint-disable-line react-hooks/exhaustive-deps

  const bills: BillItem[] = useMemo(() => sessions.flatMap((s) => {
    const live = (s.orders || []).filter((o: any) => o.order_status !== 'draft');
    if (!live.length) return [];
    const t = rawTables.find((x) => x.table_id === s.table_id);
    const b = billOfOrders(live.map((o: any) => itemsSubtotal(o.order_items)));
    const req = requests.find((r) => r.table_id === s.table_id && r.kind === 'checkout');
    const items: OrderItemSummary[] = live.flatMap((o: any) => o.order_items.map((i: any) => ({
      name: i.product_name, quantity: i.quantity, price: Number(i.unit_price), notes: i.note || undefined })));
    const staffOrder = live.find((o: any) => o.profiles?.full_name);
    return [{
      id: `bill-${s.session_id}`, sessionId: s.session_id, billNumber: `B-${s.session_id}`, tableNumber: pad(t?.table_number ?? '?'),
      customerName: s.customer_name || 'Tamu', guestCount: s.guest_count, itemCount: items.reduce((a, i) => a + i.quantity, 0), items,
      subtotal: b.subtotal, serviceFee: b.service, tax: b.tax, total: b.total,
      requestedAt: req ? hhmmColon(req.created_at) : '-', elapsedMinutesAgo: minsSince(req?.created_at ?? s.opened_at),
      waiterName: staffOrder?.profiles?.full_name || 'QR Meja', openedAtTime: `${hhmm(s.opened_at)} WIB`,
      status: req ? 'minta_checkout' : 'belum_dibayar',
    } as BillItem];
  }).sort((a, b) => (a.status === b.status ? 0 : a.status === 'minta_checkout' ? -1 : 1)), [sessions, rawTables, requests]);
  const selectedBill = bills.find((b) => b.id === selectedBillId) || bills[0];

  const kitchenTickets: KitchenTicket[] = useMemo(() => sessions.flatMap((s) => {
    const t = rawTables.find((x) => x.table_id === s.table_id);
    return (s.orders || []).filter((o: any) => o.order_status !== 'draft').map((o: any): KitchenTicket => {
      const cats = o.order_items.map((i: any) => productCategory.get(i.product_id) || '');
      const station = cats.length && cats.every((c: string) => BAR_CATEGORIES.includes(c)) ? 'Bar Minuman' : 'Stasiun Rawon & Dapur Panas';
      const elapsed = Math.max(0, Math.floor((now - new Date(o.created_at).getTime()) / 1000));
      const status = ORDER_TO_TICKET[o.order_status];
      const waiter = o.profiles?.full_name || (o.order_source === 'qr' ? 'QR Meja' : 'Staf');
      return {
        id: String(o.order_id), orderId: o.order_id, ticketNumber: `#${o.order_number}`, tableNumber: `Table ${pad(t?.table_number ?? '?')}`,
        type: 'Dine in', waiterName: waiter, elapsedSeconds: elapsed, status, station,
        isPriority: elapsed > 900 && (status === 'new' || status === 'preparing'),
        totalItems: o.order_items.reduce((a: number, i: any) => a + i.quantity, 0), totalAmount: Number(o.total),
        readySecondsAgo: o.ready_at ? Math.max(0, Math.floor((now - new Date(o.ready_at).getTime()) / 1000)) : undefined,
        notesBanner: o.note ? `Catatan: ${o.note}` : o.order_source === 'qr' ? 'Dipesan via QR meja' : `Dikirim oleh ${waiter}`,
        items: o.order_items.map((i: any) => ({ name: i.product_name, quantity: i.quantity, notes: i.note || undefined })),
      };
    });
  }).sort((a, b) => b.elapsedSeconds - a.elapsedSeconds), [sessions, rawTables, productCategory, now]);

  const transactions: TransactionRecord[] = useMemo(() => payments.map((p) => {
    const total = Number(p.amount); const subtotal = Math.round(total / 1.155);
    return {
      id: `trx-${p.payment_id}`, code: `#${p.orders.order_number}`, time: hhmmColon(p.paid_at),
      at: p.paid_at,
      typeMeja: `Meja ${pad(p.orders.table_sessions?.tables?.table_number ?? '?')}`,
      source: p.orders.order_source === 'qr' ? 'QR meja' : 'Manual', method: METHOD_FROM_DB[p.method] ?? 'Tunai',
      subtotal, tax: total - subtotal, total, status: 'Lunas',
    } as TransactionRecord;
  }), [payments]);

  const lowStockIngredients = rawIngredients.filter((i) => i.currentStock <= i.minimumStock);

  // nilai default pilihan meja setelah data masuk
  useEffect(() => {
    if (!tables.length) return;
    if (!tables.some((t) => t.number === selectedTableId)) setSelectedTableId(tables[0].number);
    if (!tables.some((t) => t.number === orderTableNumber)) setOrderTableNumber(tables[0].number);
  }, [tables]); // eslint-disable-line react-hooks/exhaustive-deps

  // ---------- aksi: meja ----------
  const run = async (p: PromiseLike<{ error: any }>, ok?: string) => {
    const { error } = await p;
    if (error) { showToast(error.message, 'warning'); return false; }
    if (ok) showToast(ok, 'success');
    await refresh();
    return true;
  };
  const updateTable = async (t: TableItem) => {
    await run(supabase.from('tables').update({ table_number: parseInt(t.number, 10), capacity: t.capacity, area: t.area }).eq('table_id', t.dbId),
      `Pengaturan Meja ${t.number} berhasil diperbarui`);
  };
  const addTable = async (tableNumber: number, capacity: number, area: string) => {
    return await run(
      supabase.from('tables').insert({ table_number: tableNumber, capacity, area, is_active: true }),
      `Meja ${tableNumber} berhasil ditambahkan`
    );
  };

  // ---------- aksi: keranjang & pesanan staf ----------
  const addToCart = (item: MenuItem, qty = 1, notes = '') => {
    setCartItems((prev) => {
      const i = prev.findIndex((c) => c.menuItem.id === item.id);
      if (i >= 0) return prev.map((c, k) => (k === i ? { ...c, quantity: c.quantity + qty, notes: notes || c.notes } : c));
      return [...prev, { menuItem: item, quantity: qty, notes }];
    });
    showToast(`${item.name} ditambahkan`);
  };
  const removeFromCart = (id: string) => setCartItems((p) => p.filter((c) => c.menuItem.id !== id));
  const updateCartQuantity = (id: string, d: number) =>
    setCartItems((p) => p.map((c) => (c.menuItem.id === id ? { ...c, quantity: c.quantity + d } : c)).filter((c) => c.quantity > 0));
  const updateCartItemNotes = (id: string, notes: string) => {
    setCartItems((p) => p.map((c) => (c.menuItem.id === id ? { ...c, notes } : c)));
    showToast('Catatan menu diperbarui');
  };
  const clearCart = () => setCartItems([]);

  const submitStaffOrder = async (draft: boolean) => {
    if (!cartItems.length) { showToast('Keranjang pesanan masih kosong', 'warning'); return; }
    const tbl = tables.find((t) => t.number === orderTableNumber);
    if (!tbl) { showToast('Pilih meja terlebih dahulu', 'warning'); return; }
    const { data, error } = await supabase.rpc('staff_place_order', {
      p_table_id: tbl.dbId, p_guests: orderGuestCount, p_customer: orderCustomerName, p_note: kitchenGeneralNote, p_draft: draft,
      p_items: cartItems.map((c) => ({ id: c.menuItem.dbId, qty: c.quantity, note: c.notes })),
    });
    if (error || data?.error) { showToast(error?.message || data.error, 'warning'); return; }
    if (!draft) setCartItems([]);
    showToast(draft ? `Draf pesanan Meja ${orderTableNumber} disimpan` : `Pesanan Meja ${orderTableNumber} sukses dikirim ke Kitchen!`, draft ? 'info' : 'success');
    await refresh();
  };
  const sendOrderToKitchen = () => { submitStaffOrder(false); };
  const saveDraftOrder = () => { submitStaffOrder(true); };

  // ---------- aksi: pembayaran ----------
  const settlePayment = async (billId: string, method: PayMethod, amountTendered?: number) => {
    const target = bills.find((b) => b.id === billId);
    if (!target) return;
    const tendered = amountTendered || target.total;
    const { data, error } = await supabase.rpc('pay_session', { p_session: target.sessionId, p_method: METHOD_TO_DB[method], p_received: tendered });
    if (error || data?.error) { showToast(error?.message || data.error, 'warning'); return; }
    setReceiptModalData({ ...target, status: 'lunas', paymentMethod: METHOD_TO_DB[method] === 'cash' ? 'tunai' : (METHOD_TO_DB[method] as any),
      cashTendered: tendered, changeAmount: Number(data.change) });
    setSelectedBillId('');
    showToast(`Pembayaran Meja ${target.tableNumber} LUNAS via ${method}!`, 'success');
    await refresh();
  };

  // ---------- aksi: dapur ----------
  const advanceTicketStatus = async (ticketId: string) => {
    const { data, error } = await supabase.rpc('advance_order', { p_order: Number(ticketId) });
    if (error || data?.error) { showToast(error?.message || data.error, 'warning'); return; }
    await refresh();
  };

  // ---------- aksi: menu ----------
  const categoryId = async (name: string) => {
    const found = categories.find((c) => c.name === name);
    if (found) return found.category_id as number;
    const { data } = await supabase.from('categories').insert({ name }).select('category_id').single();
    return data?.category_id as number;
  };
  const productPayload = async (i: MenuItem) => ({
    name: i.name, price: i.price, description: i.description || null, is_available: i.isAvailable,
    is_favorite: !!i.isFavorite, is_signature: !!i.isSignature, category_id: await categoryId(i.category),
    image_url: i.image && !isPlaceholder(i.image) ? i.image : null,
  });
  const updateMenuItem = async (item: MenuItem) => {
    await run(supabase.from('products').update({ ...(await productPayload(item)), updated_at: new Date().toISOString() }).eq('product_id', item.dbId),
      `Menu ${item.name} diperbarui`);
  };
  const addMenuItem = async (item: MenuItem) => {
    const code = item.code && !/^RG-\d+$/.test(item.code) ? item.code : 'P' + Date.now().toString().slice(-6);
    await run(supabase.from('products').insert({ ...(await productPayload(item)), product_code: code }), `Menu baru ${item.name} berhasil ditambahkan!`);
  };

  // ---------- aksi: bahan baku ----------
  const ingUpdate = (id: string, patch: any, ok?: string) => run(supabase.from('ingredients').update(patch).eq('ingredient_id', Number(id)), ok);
  const updateIngredientStock = (id: string, n: number) => { ingUpdate(id, { current_stock: Math.max(0, n), last_restocked: new Date().toISOString() }); };
  const restockIngredient = (id: string, add: number) => {
    const cur = rawIngredients.find((i) => i.id === id)?.currentStock ?? 0;
    ingUpdate(id, { current_stock: Math.round((cur + add) * 100) / 100, last_restocked: new Date().toISOString() }, `Restok ${add} unit berhasil ditambahkan!`);
  };
  const updateIngredientMinimum = (id: string, n: number) => { ingUpdate(id, { minimum_stock: Math.max(0, n) }, 'Batas minimum stok diperbarui'); };
  const addRawIngredient = (i: RawIngredient) => {
    run(supabase.from('ingredients').insert({
      code: 'BHN-' + Date.now().toString().slice(-6), name: i.name, category: i.category, current_stock: i.currentStock,
      minimum_stock: i.minimumStock, unit: i.unit, cost_per_unit: i.costPerUnit, supplier: i.supplier, linked_menu_items: i.linkedMenuItems,
    }), `Bahan baku ${i.name} berhasil ditambahkan!`);
  };

  return (
    <AppContext.Provider value={{
      currentUser, currentRole, setCurrentRole, isLoggedIn, authLoading, dataReady, login, logout,
      activeView, setActiveView, viewportMode, setViewportMode, outletName, setOutletName,
      tables, selectedTableId, setSelectedTableId, updateTable, addTable,
      cartItems, orderTableNumber, setOrderTableNumber, orderCustomerName, setOrderCustomerName, orderGuestCount, setOrderGuestCount,
      kitchenGeneralNote, setKitchenGeneralNote, addToCart, removeFromCart, updateCartQuantity, updateCartItemNotes, clearCart,
      sendOrderToKitchen, saveDraftOrder,
      bills, selectedBillId, setSelectedBillId, selectedBill, settlePayment,
      menuItems, menuCategories, updateMenuItem, addMenuItem,
      rawIngredients, lowStockIngredients, updateIngredientStock, restockIngredient, updateIngredientMinimum, addRawIngredient,
      dismissStockWarning, setDismissStockWarning,
      kitchenTickets, advanceTicketStatus, transactions,
      toast, showToast, receiptModalData, openReceiptModal: setReceiptModalData, closeReceiptModal: () => setReceiptModalData(null),
      qrModalTable, openQrModal: setQrModalTable, closeQrModal: () => setQrModalTable(null),
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within an AppProvider');
  return ctx;
};
