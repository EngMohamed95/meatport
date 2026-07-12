import React, { useState, useEffect, useMemo } from 'react';
import { 
  ChefHat, Clock, Check, Volume2, VolumeX, Sparkles, 
  RotateCcw, Search, Filter, Play, CheckSquare, Flame, 
  MapPin, User, AlertCircle, ShoppingBag, Phone
} from 'lucide-react';
import { Tenant, Order, OrderItem } from '../types';

interface KitchenKdsProps {
  tenant: Tenant;
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  orderItems: OrderItem[];
  lang: 'en' | 'ar';
  darkMode: boolean;
}

// Sub-component for individual card live timers
function TicketTimer({ createdAt, limitMins, lang }: { createdAt: string; limitMins: number; lang: 'en' | 'ar' }) {
  const [secondsElapsed, setSecondsElapsed] = useState(0);

  useEffect(() => {
    const start = new Date(createdAt).getTime();
    setSecondsElapsed(Math.floor((Date.now() - start) / 1000));

    const interval = setInterval(() => {
      setSecondsElapsed(Math.floor((Date.now() - start) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [createdAt]);

  const mins = Math.floor(secondsElapsed / 60);
  const secs = secondsElapsed % 60;
  const timeStr = `${mins}:${secs.toString().padStart(2, '0')}`;

  const isOvertime = mins >= limitMins;
  const isCritical = mins >= limitMins + 3;

  let colorClass = 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
  if (isCritical) {
    colorClass = 'bg-rose-500/20 text-rose-600 dark:text-rose-400 border-rose-500/30 animate-pulse';
  } else if (isOvertime) {
    colorClass = 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30';
  }

  return (
    <div className={`flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold rounded-lg border font-mono ${colorClass}`}>
      <Clock className="w-3 h-3" />
      <span>{timeStr}</span>
      <span className="opacity-65">/ {limitMins}m</span>
      {isOvertime && (
        <span className="text-[9px] font-extrabold uppercase tracking-wider ml-1 bg-red-600 text-white px-1 rounded">
          {lang === 'ar' ? 'متأخر' : 'LATE'}
        </span>
      )}
    </div>
  );
}

export default function KitchenKds({
  tenant,
  orders,
  setOrders,
  orderItems,
  lang,
  darkMode
}: KitchenKdsProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'dine_in' | 'takeaway' | 'delivery'>('all');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [prevCount, setPrevCount] = useState(orders.length);
  const [lastCompletedOrderId, setLastCompletedOrderId] = useState<string | null>(null);
  const [audioUnlocked, setAudioUnlocked] = useState(false);

  // Attempt to unlock AudioContext on user interaction
  const handleUnlockAudio = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        gain.gain.setValueAtTime(0.01, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.1);
        osc.start();
        osc.stop(ctx.currentTime + 0.15);
      }
      setAudioUnlocked(true);
    } catch (e) {
      console.warn("Unlocking failed:", e);
    }
  };

  // Automatically unlock audio on first document interaction
  useEffect(() => {
    const unlock = () => {
      handleUnlockAudio();
      window.removeEventListener('click', unlock);
      window.removeEventListener('keydown', unlock);
    };
    window.addEventListener('click', unlock);
    window.addEventListener('keydown', unlock);
    return () => {
      window.removeEventListener('click', unlock);
      window.removeEventListener('keydown', unlock);
    };
  }, []);

  // Play synthesized dual-tone chime
  const playChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      // Warm retro chime notes: E5 and G5 -> C6
      osc1.frequency.setValueAtTime(659.25, ctx.currentTime); // E5
      osc1.frequency.exponentialRampToValueAtTime(1046.50, ctx.currentTime + 0.15); // C6

      osc2.frequency.setValueAtTime(783.99, ctx.currentTime); // G5
      osc2.frequency.exponentialRampToValueAtTime(1318.51, ctx.currentTime + 0.15); // E6

      osc1.type = 'triangle';
      osc2.type = 'sine';

      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.9);

      osc1.start(ctx.currentTime);
      osc2.start(ctx.currentTime);
      osc1.stop(ctx.currentTime + 0.95);
      osc2.stop(ctx.currentTime + 0.95);
    } catch (e) {
      console.warn("Chime blocked by browser interaction guidelines:", e);
    }
  };

  // Listen to new incoming orders for sound trigger
  useEffect(() => {
    if (orders.length > prevCount) {
      const newOrders = orders.slice(0, orders.length - prevCount);
      const hasMatch = newOrders.some(o => o.tenantId === tenant.id);
      if (hasMatch && soundEnabled) {
        playChime();
      }
    }
    setPrevCount(orders.length);
  }, [orders, prevCount, soundEnabled, tenant.id]);

  // Update order status
  const updateStatus = (orderId: string, nextStatus: Order['status']) => {
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        if (nextStatus === 'completed') {
          setLastCompletedOrderId(orderId);
        }
        return { ...o, status: nextStatus };
      }
      return o;
    }));
  };

  // Undo last completed order (Recall function)
  const handleRecallLastCompleted = () => {
    if (!lastCompletedOrderId) return;
    setOrders(prev => prev.map(o => {
      if (o.id === lastCompletedOrderId) {
        return { ...o, status: 'ready' };
      }
      return o;
    }));
    setLastCompletedOrderId(null);
  };

  // Join orders with items and filter by search and type
  const activeOrdersForTenant = useMemo(() => {
    return orders
      .filter(o => o.tenantId === tenant.id)
      .filter(o => o.status !== 'completed' && o.status !== 'cancelled')
      .filter(o => {
        const matchesSearch = o.receiptNumber.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              (o.customerName && o.customerName.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesType = typeFilter === 'all' || o.customerType === typeFilter;
        return matchesSearch && matchesType;
      });
  }, [orders, tenant.id, searchQuery, typeFilter]);

  // Split into boards
  const pendingBoard = useMemo(() => activeOrdersForTenant.filter(o => o.status === 'pending'), [activeOrdersForTenant]);
  const preparingBoard = useMemo(() => activeOrdersForTenant.filter(o => o.status === 'preparing'), [activeOrdersForTenant]);
  const readyBoard = useMemo(() => activeOrdersForTenant.filter(o => o.status === 'ready'), [activeOrdersForTenant]);

  // Key stats
  const averagePrepTime = 9.5; // minutes simulated
  const queueCount = activeOrdersForTenant.length;

  return (
    <div className={`space-y-6 text-gray-800 font-sans ${darkMode ? 'dark text-gray-100' : ''}`} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      
      {!audioUnlocked && (
        <div className="bg-amber-600 text-white px-4 py-2.5 rounded-xl flex items-center justify-between text-xs font-bold shadow-md animate-pulse">
          <div className="flex items-center gap-2">
            <VolumeX className="w-4 h-4 animate-bounce" />
            <span>
              {lang === 'ar' 
                ? 'تنبيه: التنبيهات الصوتية للمطبخ بانتظار تفعيلك. اضغط هنا أو في أي مكان بالصفحة لتنشيطها!' 
                : 'Autoplay Blocked: Click here or anywhere to unlock the kitchen sound alerts!'}
            </span>
          </div>
          <button 
            onClick={handleUnlockAudio}
            className="px-3 py-1 bg-white text-amber-700 rounded-lg hover:bg-amber-50 transition"
          >
            {lang === 'ar' ? 'تنشيط الصوت 🔊' : 'Activate 🔊'}
          </button>
        </div>
      )}
      
      {/* Header Panel */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3.5 bg-rose-600/10 text-rose-500 rounded-2xl border border-rose-500/20">
            <ChefHat className="w-7 h-7 animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              {lang === 'ar' ? 'شاشة المطبخ الذكية (KDS)' : 'Interactive Kitchen Display System'}
              <span className="text-[10px] font-extrabold bg-rose-500/20 text-rose-400 px-2 py-0.5 rounded border border-rose-500/30 font-mono">LIVE FEED</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              {lang === 'ar' ? `استقبال وتحديث طلبات العملاء لعلامة: ${tenant.nameAr}` : `Active workstation dispatcher for: ${tenant.nameEn}`}
            </p>
          </div>
        </div>

        {/* Toolbar Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Sound Toggle */}
          <button 
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2.5 rounded-xl border flex items-center gap-2 text-xs font-bold transition ${
              soundEnabled 
                ? 'bg-rose-600/10 text-rose-400 border-rose-600/30' 
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
            title={soundEnabled ? "Disable Chime" : "Enable Chime"}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span>{lang === 'ar' ? 'جرس التنبيه' : 'Order Chime'}</span>
          </button>

          {/* Test Sound Button */}
          <button 
            onClick={playChime}
            className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition text-xs font-bold"
          >
            {lang === 'ar' ? 'تجربة الصوت' : 'Test Sound'}
          </button>

          {/* Recall Button */}
          {lastCompletedOrderId && (
            <button 
              onClick={handleRecallLastCompleted}
              className="p-2.5 rounded-xl bg-emerald-600/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-600/20 transition text-xs font-bold flex items-center gap-1"
            >
              <RotateCcw className="w-4 h-4" />
              <span>{lang === 'ar' ? 'استرجاع آخر طلب' : 'Recall Last'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Stats Counters */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 dark:bg-gray-900 dark:border-gray-800 shadow-xs">
          <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase block">{lang === 'ar' ? 'طلبات قيد الانتظار' : 'Queue Backlog'}</span>
          <span className="text-2xl font-black text-gray-900 dark:text-white mt-1 block">{pendingBoard.length}</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 dark:bg-gray-900 dark:border-gray-800 shadow-xs">
          <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase block">{lang === 'ar' ? 'قيد التحضير' : 'In Preparation'}</span>
          <span className="text-2xl font-black text-amber-600 mt-1 block">{preparingBoard.length}</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 dark:bg-gray-900 dark:border-gray-800 shadow-xs">
          <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase block">{lang === 'ar' ? 'جاهز للتسليم' : 'Ready tickets'}</span>
          <span className="text-2xl font-black text-emerald-600 mt-1 block">{readyBoard.length}</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 dark:bg-gray-900 dark:border-gray-800 shadow-xs">
          <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase block">{lang === 'ar' ? 'متوسط سرعة التحضير' : 'Avg Prep Speed'}</span>
          <span className="text-2xl font-black text-indigo-500 mt-1 block flex items-center gap-1">
            <Flame className="w-5 h-5 text-amber-500" />
            {averagePrepTime} {lang === 'ar' ? 'دقائق' : 'mins'}
          </span>
        </div>
      </div>

      {/* Filter Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
          <input 
            type="text"
            placeholder={lang === 'ar' ? 'البحث بالرقم أو العميل...' : 'Search by receipt or customer...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-rose-600 dark:bg-gray-900 dark:border-gray-800 dark:text-white"
          />
        </div>

        {/* Type Select */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 font-bold">{lang === 'ar' ? 'نوع الطلب:' : 'Order Type:'}</span>
          <div className="flex bg-white dark:bg-gray-900 p-1 rounded-xl border border-gray-100 dark:border-gray-800">
            {(['all', 'dine_in', 'takeaway', 'delivery'] as const).map(type => (
              <button
                key={type}
                onClick={() => setTypeFilter(type)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition capitalize ${
                  typeFilter === type
                    ? 'bg-rose-600 text-white'
                    : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                }`}
              >
                {type === 'all' ? (lang === 'ar' ? 'الكل' : 'All') : type.replace('_', '-')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* KDS Kanban Board Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* COLUMN 1: PENDING */}
        <div className="bg-slate-50 dark:bg-gray-900/40 rounded-3xl p-5 border border-gray-100 dark:border-gray-900 flex flex-col space-y-4 min-h-[500px]">
          <div className="flex items-center justify-between border-b border-gray-100/10 pb-3">
            <h3 className="font-extrabold text-sm flex items-center gap-2 text-gray-900 dark:text-white">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-ping" />
              {lang === 'ar' ? 'الطلبات الواردة (انتظار)' : 'Incoming Queue'}
            </h3>
            <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full dark:bg-blue-900/30 dark:text-blue-400">
              {pendingBoard.length}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-4 max-h-[600px] no-scrollbar">
            {pendingBoard.length === 0 ? (
              <div className="h-48 flex flex-col items-center justify-center text-center text-gray-400 space-y-2">
                <ShoppingBag className="w-8 h-8 stroke-1" />
                <p className="text-[11px] font-bold">{lang === 'ar' ? 'لا توجد طلبات معلقة حالياً' : 'No incoming tickets'}</p>
              </div>
            ) : (
              pendingBoard.map(order => (
                <KitchenTicketCard 
                  key={order.id}
                  order={order}
                  orderItems={orderItems}
                  lang={lang}
                  onNext={() => updateStatus(order.id, 'preparing')}
                  nextText={lang === 'ar' ? 'بدء التحضير' : 'Start Prep'}
                  nextIcon={<Play className="w-3.5 h-3.5" />}
                  buttonColor="bg-amber-600 hover:bg-amber-700 text-white"
                />
              ))
            )}
          </div>
        </div>

        {/* COLUMN 2: PREPARING */}
        <div className="bg-amber-50/10 dark:bg-amber-950/5 rounded-3xl p-5 border border-amber-100/10 flex flex-col space-y-4 min-h-[500px]">
          <div className="flex items-center justify-between border-b border-gray-100/10 pb-3">
            <h3 className="font-extrabold text-sm flex items-center gap-2 text-amber-600">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
              {lang === 'ar' ? 'تحت التحضير' : 'Preparing Board'}
            </h3>
            <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full dark:bg-amber-900/30 dark:text-amber-400">
              {preparingBoard.length}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-4 max-h-[600px] no-scrollbar">
            {preparingBoard.length === 0 ? (
              <div className="h-48 flex flex-col items-center justify-center text-center text-gray-400 space-y-2">
                <ChefHat className="w-8 h-8 stroke-1" />
                <p className="text-[11px] font-bold">{lang === 'ar' ? 'لا يوجد شيء تحت التحضير' : 'Kitchen is idle'}</p>
              </div>
            ) : (
              preparingBoard.map(order => (
                <KitchenTicketCard 
                  key={order.id}
                  order={order}
                  orderItems={orderItems}
                  lang={lang}
                  onNext={() => updateStatus(order.id, 'ready')}
                  nextText={lang === 'ar' ? 'جاهز للتسليم' : 'Mark Ready'}
                  nextIcon={<CheckSquare className="w-3.5 h-3.5" />}
                  buttonColor="bg-emerald-600 hover:bg-emerald-700 text-white"
                />
              ))
            )}
          </div>
        </div>

        {/* COLUMN 3: READY */}
        <div className="bg-emerald-50/10 dark:bg-emerald-950/5 rounded-3xl p-5 border border-emerald-100/10 flex flex-col space-y-4 min-h-[500px]">
          <div className="flex items-center justify-between border-b border-gray-100/10 pb-3">
            <h3 className="font-extrabold text-sm flex items-center gap-2 text-emerald-600">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              {lang === 'ar' ? 'جاهز للتسليم' : 'Ready / Pass'}
            </h3>
            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full dark:bg-emerald-900/30 dark:text-emerald-400">
              {readyBoard.length}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-4 max-h-[600px] no-scrollbar">
            {readyBoard.length === 0 ? (
              <div className="h-48 flex flex-col items-center justify-center text-center text-gray-400 space-y-2">
                <Check className="w-8 h-8 stroke-1" />
                <p className="text-[11px] font-bold">{lang === 'ar' ? 'لا توجد طلبات جاهزة للتسليم' : 'No tickets in window'}</p>
              </div>
            ) : (
              readyBoard.map(order => (
                <KitchenTicketCard 
                  key={order.id}
                  order={order}
                  orderItems={orderItems}
                  lang={lang}
                  onNext={() => updateStatus(order.id, 'completed')}
                  nextText={lang === 'ar' ? 'تسليم وإنهاء 🚀' : 'Deliver Order 🚀'}
                  nextIcon={<Check className="w-3.5 h-3.5" />}
                  buttonColor="bg-slate-900 hover:bg-black text-white dark:bg-white dark:text-slate-900 dark:hover:bg-gray-100"
                />
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
}

// Single ticket card renderer
function KitchenTicketCard({
  order,
  orderItems,
  lang,
  onNext,
  nextText,
  nextIcon,
  buttonColor
}: {
  key?: string;
  order: Order;
  orderItems: OrderItem[];
  lang: 'en' | 'ar';
  onNext: () => void;
  nextText: string;
  nextIcon: React.ReactNode;
  buttonColor: string;
}) {
  const items = useMemo(() => {
    return orderItems.filter(oi => oi.orderId === order.id);
  }, [orderItems, order.id]);

  return (
    <div className="bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm p-4 space-y-3.5 hover:shadow-md transition">
      
      {/* Header Info */}
      <div className="flex items-start justify-between border-b border-gray-100/10 pb-2.5">
        <div>
          <h4 className="font-mono font-bold text-xs text-gray-900 dark:text-white flex items-center gap-1.5">
            <span>{order.receiptNumber}</span>
            <span className={`text-[8px] px-1.5 py-0.5 rounded font-sans uppercase font-extrabold ${
              order.source === 'POS' ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400' : 'bg-rose-50 text-rose-600 dark:bg-rose-950 dark:text-rose-400'
            }`}>
              {order.source}
            </span>
          </h4>
          <p className="text-[10px] text-gray-400 mt-0.5 flex items-center gap-1 flex-wrap">
            <User className="w-3 h-3 text-slate-400" />
            <span>{order.customerName || (lang === 'ar' ? 'زبون محلي' : 'Table Guest')}</span>
            <span>•</span>
            <span className="capitalize">{order.customerType.replace('_', ' ')}</span>
          </p>

          {/* Table Number & Delivery Info Badge */}
          {(order.tableNumber || order.customerPhone || order.deliveryAddress) && (
            <div className="mt-2 space-y-1 text-[9px] font-bold text-gray-500 bg-gray-55/60 dark:bg-gray-900/60 p-2 rounded-xl border dark:border-gray-800 text-right" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
              {order.tableNumber && (
                <div className="flex items-center gap-1 text-[10px] text-rose-600 dark:text-rose-400">
                  <span>🍽️</span>
                  <span>{lang === 'ar' ? `رقم الطاولة: ${order.tableNumber}` : `Table No: ${order.tableNumber}`}</span>
                </div>
              )}
              {order.customerPhone && (
                <div className="flex items-center gap-1 text-slate-650 dark:text-gray-300">
                  <Phone className="w-3 h-3 text-emerald-500" />
                  <span>{order.customerPhone}</span>
                </div>
              )}
              {order.deliveryAddress && (
                <div className="flex items-start gap-1 text-slate-650 dark:text-gray-300 leading-tight">
                  <MapPin className="w-3 h-3 text-red-500 mt-0.5 flex-shrink-0" />
                  <span>{order.deliveryAddress}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Live Timer */}
        <TicketTimer 
          createdAt={order.createdAt} 
          limitMins={order.preparationTimeEstimate || 10} 
          lang={lang} 
        />
      </div>

      {/* Item List */}
      <div className="space-y-2.5">
        {items.map(item => (
          <div key={item.id} className="text-xs">
            <div className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-md bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center font-bold text-[10px] flex-shrink-0 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900">
                {item.quantity}
              </span>
              <div className="flex-1">
                <span className="font-bold text-gray-900 dark:text-gray-200">
                  {lang === 'ar' ? item.productNameAr : item.productNameEn}
                </span>
                {item.sizeNameEn && (
                  <span className="text-[9px] text-gray-400 dark:text-gray-500 block">
                    {lang === 'ar' ? `الحجم: ${item.sizeNameAr}` : `Size: ${item.sizeNameEn}`}
                  </span>
                )}
              </div>
            </div>

            {/* Modifiers List */}
            {item.modifiers.length > 0 && (
              <div className="pl-7 pr-3 space-y-0.5 mt-1 border-l-2 border-dashed border-gray-100 dark:border-gray-800" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
                {item.modifiers.map((mod, idx) => (
                  <div key={idx} className="text-[9px] text-slate-400 flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-slate-400" />
                    <span>{lang === 'ar' ? mod.nameAr : mod.nameEn}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Action Footer */}
      <div className="border-t border-gray-100/10 pt-3">
        <button
          onClick={onNext}
          className={`w-full py-2 rounded-xl text-[10px] font-bold flex items-center justify-center gap-1.5 transition ${buttonColor}`}
        >
          {nextIcon}
          <span>{nextText}</span>
        </button>
      </div>

    </div>
  );
}
