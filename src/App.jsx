import { useState, useMemo, useEffect, useRef } from "react";
import QRCode from "qrcode";
import {
  Search, MapPin, Instagram, Clock, Eye, Plus, X, Lock, ArrowLeft,
  ChevronDown, MessageCircle, Grid3x3, Star, Pencil, Trash2, Power,
  RefreshCw, ImageIcon, LogOut, UtensilsCrossed, Wrench, Shirt, Sparkles,
  Home, Laptop, GraduationCap, Dog, Car, Tractor, PartyPopper, Building2,
  Palmtree, Dumbbell, Pill, Truck, Check, Hammer, ShoppingCart, Beef, Apple,
  Croissant, Droplet, Printer, KeyRound, Scissors, Package, Gift, HardHat,
  Baby, Church, Tag, Navigation, User, LocateFixed, Briefcase,
  QrCode, CreditCard, Receipt, Minus, ShoppingBag, LogIn,
} from "lucide-react";

const ADMIN_PASSWORD = "padre";

// URL del backend (servidor Express + MongoDB). En desarrollo local usa localhost;
// en producción se configura con la variable de entorno VITE_API_URL (ver LEEME.md).
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Número de WhatsApp del dueño de Mi Zona (recibe los pedidos de "Agregar mi local")
// TODO: reemplazar por el número real, formato: código de país + área + número, sin espacios ni signos.
// Ejemplo Argentina/Tucumán: "5493865551234"
const OWNER_WHATSAPP = "5493816265332"; // +54 381 6265332

const CATEGORIES = [
  { id: "comida", label: "Gastronomía", icon: UtensilsCrossed, color: "#C1443A", quick: true },
  { id: "salud", label: "Salud", icon: Pill, color: "#2C6E8A", quick: true },
  { id: "servicios", label: "Servicios", icon: Wrench, color: "#0B2A54", quick: true },
  { id: "hogar", label: "Hogar", icon: Home, color: "#3C8558", quick: true },
  { id: "moda", label: "Moda y retail", icon: Shirt, color: "#7A4F9E", quick: true },
  { id: "automotor", label: "Automotor", icon: Car, color: "#4A5568", quick: false },
  { id: "belleza", label: "Belleza y estética", icon: Sparkles, color: "#B8703F", quick: false },
  { id: "mascotas", label: "Mascotas y veterinaria", icon: Dog, color: "#B0793A", quick: false },
  { id: "tecnologia", label: "Tecnología", icon: Laptop, color: "#2C6E8A", quick: false },
  { id: "educacion", label: "Educación", icon: GraduationCap, color: "#8A7A2E", quick: false },
  { id: "agro", label: "Agro e insumos rurales", icon: Tractor, color: "#5A7A3C", quick: false },
  { id: "eventos", label: "Eventos y fiestas", icon: PartyPopper, color: "#A6437A", quick: false },
  { id: "inmobiliaria", label: "Inmobiliaria", icon: Building2, color: "#3B5266", quick: false },
  { id: "turismo", label: "Turismo y alojamiento", icon: Palmtree, color: "#2F6FED", quick: false },
  { id: "deportes", label: "Deportes y recreación", icon: Dumbbell, color: "#C1443A", quick: false },
  { id: "talleres", label: "Talleres y reparaciones", icon: Hammer, color: "#4A5568", quick: false },
  { id: "almacenes", label: "Almacenes y supermercados", icon: ShoppingCart, color: "#3C8558", quick: false },
  { id: "carnicerias", label: "Carnicerías y pollerías", icon: Beef, color: "#B23A2E", quick: false },
  { id: "verduleria", label: "Frutas y verduras", icon: Apple, color: "#5A8A3C", quick: false },
  { id: "farmacia", label: "Farmacias y perfumerías", icon: Pill, color: "#3B7A9E", quick: false },
  { id: "panaderia", label: "Panaderías y repostería", icon: Croissant, color: "#B8763A", quick: false },
  { id: "limpieza", label: "Limpieza y lavandería", icon: Droplet, color: "#2C8AA6", quick: false },
  { id: "imprenta", label: "Imprenta y gráfica", icon: Printer, color: "#5B5F6B", quick: false },
  { id: "cerrajeria", label: "Cerrajería", icon: KeyRound, color: "#8A7A2E", quick: false },
  { id: "barberias", label: "Barberías", icon: Scissors, color: "#0B2A54", quick: false },
  { id: "mayoristas", label: "Mayoristas y distribuidores", icon: Package, color: "#4A5568", quick: false },
  { id: "florerias", label: "Florerías y regalos", icon: Gift, color: "#A6437A", quick: false },
  { id: "ferreterias", label: "Ferreterías y materiales", icon: HardHat, color: "#B8703F", quick: false },
  { id: "bebes", label: "Bebés y niños", icon: Baby, color: "#7A9EB8", quick: false },
  { id: "religion", label: "Religión y artículos religiosos", icon: Church, color: "#6E5A8A", quick: false },
];
const QUICK_CATEGORIES = CATEGORIES.filter((c) => c.quick);

const ZONES = [
  "Burruyacú", "Capital (San Miguel de Tucumán)", "Chicligasta (Concepción)",
  "Cruz Alta (Banda del Río Salí)", "Famaillá", "Graneros", "Juan Bautista Alberdi",
  "La Cocha", "Leales", "Lules", "Monteros", "Río Chico (Aguilares)", "Simoca",
  "Tafí del Valle", "Tafí Viejo", "Trancas", "Yerba Buena",
];

const PAYMENT_METHODS = ["Efectivo", "Tarjeta de débito", "Tarjeta de crédito", "Transferencia", "Mercado Pago"];
const DAYS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

const WHATSAPP_MESSAGE = "Hola. Te encontré en Mi Zona y quisiera consultar por sus servicios. ¿Podrían brindarme más información?";
const ADD_BUSINESS_MESSAGE = "Hola, encontré Mi Zona y quiero agregar mi local al directorio. Me gustaría recibir información para registrar mi negocio.";

/* ---------- utilidades ---------- */

function catInfo(id) {
  return CATEGORIES.find((c) => c.id === id);
}
function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}
function todayISO() {
  return new Date().toISOString().slice(0, 10);
}
function addDays(iso, days) {
  const d = new Date(iso + "T00:00:00");
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}
function daysUntil(iso) {
  if (!iso) return null;
  const target = new Date(iso + "T00:00:00");
  const now = new Date(todayISO() + "T00:00:00");
  return Math.round((target - now) / 86400000);
}
function fmtDate(iso) {
  if (!iso) return "—";
  return new Date(iso + "T00:00:00").toLocaleDateString("es-AR");
}
function fmtNum(n) {
  return (n || 0).toLocaleString("es-AR");
}
function isOpenNow(weekHours) {
  const now = new Date();
  const today = weekHours?.[now.getDay()];
  if (!today || today[0] === null || today[0] === undefined) return false;
  const [open, close] = today;
  const h = now.getHours();
  if (close === 0) return h >= open || h < 2;
  if (close > open) return h >= open && h < close;
  return h >= open || h < close;
}
function fmtHours(range) {
  if (!range || range[0] === null || range[0] === undefined) return "Cerrado";
  const [o, c] = range;
  return `${o}:00–${c === 0 ? "00" : c}:00`;
}
function avgRating(reviews) {
  if (!reviews || reviews.length === 0) return null;
  return (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1);
}
function waLink(phone) {
  return `https://wa.me/${phone}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;
}
function addBusinessWaLink() {
  return `https://wa.me/${OWNER_WHATSAPP}?text=${encodeURIComponent(ADD_BUSINESS_MESSAGE)}`;
}
function mapsLink(loc, zone) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(loc + ", " + zone)}`;
}

/* ---------- ubicación: geocodificar direcciones y calcular distancia ---------- */

async function geocodeAddress(loc, zone) {
  try {
    const query = encodeURIComponent(`${loc}, ${zone}, Tucumán, Argentina`);
    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${query}`);
    if (!res.ok) return null;
    const data = await res.json();
    if (!data?.[0]) return null;
    return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
  } catch {
    return null;
  }
}

function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function fmtDistance(km) {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1).replace(".", ",")} km`;
}

/* ---------- descuentos ---------- */

function isDiscountActive(d) {
  if (!d.active) return false;
  const today = todayISO();
  return d.startDate <= today && today <= d.endDate;
}
function activeDiscounts(biz) {
  return (biz.discounts || []).filter(isDiscountActive);
}

function emptyBusiness() {
  return {
    id: uid(), kind: "business",
    name: "", desc: "", cat: "comida", zone: ZONES[0],
    services: [], specialties: [], paymentMethods: [], delivery: false, acceptsWhatsapp: true,
    phone: "", ig: "", logo: "", photos: [], loc: "",
    lat: null, lng: null,
    weekHours: DAYS.map(() => [9, 20]),
    featured: false, status: "active",
    createdAt: todayISO(), expiresAt: addDays(todayISO(), 30), lastRenewal: todayISO(),
    views: 0, reviews: [], discounts: [],
    ownerCode: uid().slice(0, 8).toUpperCase(),
    products: [], // [{id, name, price}]
    bankAlias: "", bankCBU: "", bankHolder: "",
    aiEnabled: false,
  };
}

function emptyJob() {
  return {
    id: uid(), kind: "job",
    name: "", desc: "", phone: "", zone: ZONES[0],
    status: "active",
    createdAt: todayISO(), expiresAt: addDays(todayISO(), 30), lastRenewal: todayISO(),
    views: 0,
    ownerCode: uid().slice(0, 8).toUpperCase(),
  };
}

/* ---------- almacenamiento persistente (backend Express + MongoDB) ---------- */

function normalizeBusiness(b) {
  return {
    kind: "business",
    lat: null, lng: null, discounts: [],
    ownerCode: uid().slice(0, 8).toUpperCase(),
    products: [], bankAlias: "", bankCBU: "", bankHolder: "", aiEnabled: false,
    ...b,
  };
}

async function loadBusinesses() {
  const res = await fetch(`${API_URL}/businesses`);
  if (!res.ok) throw new Error("No se pudieron cargar los negocios");
  const list = await res.json();
  return list.map(normalizeBusiness);
}

async function createBusinessOnServer(biz) {
  const res = await fetch(`${API_URL}/businesses`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(biz),
  });
  if (!res.ok) throw new Error("No se pudo crear el negocio");
  return res.json();
}

async function updateBusinessOnServer(id, biz) {
  const res = await fetch(`${API_URL}/businesses/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(biz),
  });
  if (!res.ok) throw new Error("No se pudo guardar el negocio");
  return res.json();
}

async function deleteBusinessOnServer(id) {
  const res = await fetch(`${API_URL}/businesses/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("No se pudo eliminar el negocio");
}

/* ---------- pedidos ---------- */

async function fetchOrders({ businessId, customerEmail }) {
  const params = new URLSearchParams();
  if (businessId) params.set("businessId", businessId);
  if (customerEmail) params.set("customerEmail", customerEmail);
  const res = await fetch(`${API_URL}/orders?${params}`);
  if (!res.ok) throw new Error("No se pudieron cargar los pedidos");
  return res.json();
}
async function createOrder(order) {
  const res = await fetch(`${API_URL}/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(order),
  });
  if (!res.ok) throw new Error("No se pudo crear el pedido");
  return res.json();
}
async function updateOrder(id, patch) {
  const res = await fetch(`${API_URL}/orders/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });
  if (!res.ok) throw new Error("No se pudo actualizar el pedido");
  return res.json();
}

/* ---------- chat ---------- */

async function fetchMessages({ businessId, customerEmail }) {
  const params = new URLSearchParams({ businessId, customerEmail });
  const res = await fetch(`${API_URL}/messages?${params}`);
  if (!res.ok) throw new Error("No se pudo cargar la conversación");
  return res.json();
}
async function sendMessage({ businessId, customerEmail, text, businessContext }) {
  const res = await fetch(`${API_URL}/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ businessId, customerEmail, text, businessContext }),
  });
  if (!res.ok) throw new Error("No se pudo enviar el mensaje");
  return res.json();
}

const ORDER_STATUSES = [
  { id: "confirmado", label: "Pedido confirmado" },
  { id: "esperando_comprobante", label: "Esperando comprobante" },
  { id: "comprobante_recibido", label: "Comprobante recibido" },
  { id: "pago_pendiente", label: "Pago pendiente de verificación" },
  { id: "pago_verificado", label: "Pago verificado" },
  { id: "pago_rechazado", label: "Pago rechazado" },
];
function orderStatusLabel(id) {
  return ORDER_STATUSES.find((s) => s.id === id)?.label || id;
}

const CLOUDINARY_CLOUD_NAME = "PEGA_ACA_TU_CLOUD_NAME";
const CLOUDINARY_UPLOAD_PRESET = "PEGA_ACA_TU_UPLOAD_PRESET";
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

async function uploadImage(file) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) throw new Error("Error al subir la imagen a Cloudinary");
  const data = await res.json();
  return data.secure_url;
}

/* ---------- piezas visuales chicas ---------- */

function Photo({ cat, src, height = 128, radius = "10px 10px 0 0", iconSize = 34, onOpen, clickable = true }) {
  const c = catInfo(cat);
  const Icon = c?.icon || Home;
  const [failed, setFailed] = useState(false);

  if (src && !failed) {
    const img = <img src={src} alt="" className="w-full h-full object-cover" onError={() => setFailed(true)} />;
    if (!clickable) {
      return (
        <div className="relative overflow-hidden shrink-0 w-full" style={{ height, borderRadius: radius }}>
          {img}
        </div>
      );
    }
    return (
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onOpen && onOpen(src); }}
        className="relative overflow-hidden shrink-0 w-full"
        style={{ height, borderRadius: radius }}
      >
        {img}
      </button>
    );
  }

  return (
    <div
      className="flex flex-col items-center justify-center relative overflow-hidden shrink-0 gap-1 px-2 text-center"
      style={{ height, background: failed ? "#F7E7E5" : `linear-gradient(135deg, ${c?.color}22, ${c?.color}08)`, borderRadius: radius }}
    >
      {failed ? (
        <>
          <ImageIcon size={Math.min(iconSize, 22)} color="#9A3B34" strokeWidth={1.5} />
          <span className="text-[10px] leading-tight" style={{ color: "#9A3B34" }}>El link de esta foto no funciona</span>
        </>
      ) : (
        <Icon size={iconSize} color={c?.color} strokeWidth={1.5} />
      )}
    </div>
  );
}

function OpenBadge({ weekHours }) {
  const open = isOpenNow(weekHours);
  return (
    <span
      className="inline-flex items-center gap-1.5 text-xs font-medium px-2 py-1"
      style={{ borderRadius: 20, color: open ? "#1E6B44" : "#9A3B34", background: open ? "#E4F3EA" : "#F7E7E5" }}
    >
      <span className="rounded-full" style={{ width: 6, height: 6, backgroundColor: open ? "#2C9A5F" : "#C1443A" }} />
      {open ? "Abierto ahora" : "Cerrado"}
    </span>
  );
}

function StatusBadge({ status }) {
  const active = status === "active";
  return (
    <span
      className="text-xs font-medium px-2 py-0.5"
      style={{ borderRadius: 12, color: active ? "#1E6B44" : "#7A7D87", background: active ? "#E4F3EA" : "#EEEDE7" }}
    >
      {active ? "Activo" : "Inactivo"}
    </span>
  );
}

function StarPicker({ value, onChange }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} type="button" onClick={() => onChange(n)}>
          <Star size={22} color={n <= value ? "#2F6FED" : "#D1D5DB"} fill={n <= value ? "#2F6FED" : "none"} />
        </button>
      ))}
    </div>
  );
}

function TagInput({ values, onChange, placeholder }) {
  const [text, setText] = useState("");
  const add = () => {
    const v = text.trim();
    if (v && !values.includes(v)) onChange([...values, v]);
    setText("");
  };
  return (
    <div>
      {values.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-1.5">
          {values.map((v) => (
            <span key={v} className="text-xs px-2 py-1 flex items-center gap-1" style={{ background: "#EEF2F7", borderRadius: 20 }}>
              {v}
              <button type="button" onClick={() => onChange(values.filter((x) => x !== v))}><X size={10} /></button>
            </span>
          ))}
        </div>
      )}
      <div className="flex gap-1">
        <input
          value={text} onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }}
          placeholder={placeholder}
          className="border px-2 py-1.5 text-xs flex-1" style={{ borderRadius: 6, borderColor: "#E2E8F0" }}
        />
        <button type="button" onClick={add} className="text-xs px-3 py-1.5 font-medium" style={{ background: "#0B2A54", color: "#fff", borderRadius: 6 }}>
          Agregar
        </button>
      </div>
    </div>
  );
}

function ConfirmModal({ title, message, confirmLabel = "Confirmar", danger, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4" style={{ background: "#0B1220cc" }} onClick={onCancel}>
      <div className="bg-white w-full max-w-sm p-5" style={{ borderRadius: 12 }} onClick={(e) => e.stopPropagation()}>
        <h3 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 600, fontSize: 17 }}>{title}</h3>
        <p className="text-sm mt-2 mb-5" style={{ color: "#4B5563" }}>{message}</p>
        <div className="flex gap-2 justify-end">
          <button onClick={onCancel} className="text-sm px-3 py-1.5" style={{ borderRadius: 8, border: "1px solid #E2E8F0" }}>Cancelar</button>
          <button
            onClick={onConfirm}
            className="text-sm font-medium px-3 py-1.5"
            style={{ borderRadius: 8, backgroundColor: danger ? "#C1443A" : "#0B2A54", color: "#fff" }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

function Lightbox({ src, onClose }) {
  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4" style={{ background: "#0A0C12ee" }} onClick={onClose}>
      <button onClick={onClose} className="absolute top-4 right-4 text-white"><X size={26} /></button>
      <img src={src} alt="" className="max-w-full max-h-full object-contain" style={{ borderRadius: 8 }} onClick={(e) => e.stopPropagation()} />
    </div>
  );
}

function AllPhotosModal({ photos, cat, onOpenPhoto, onClose }) {
  return (
    <div className="fixed inset-0 z-[65] flex items-end sm:items-center justify-center" style={{ background: "#0B1220cc" }} onClick={onClose}>
      <div className="bg-white w-full sm:max-w-2xl max-h-[85vh] overflow-y-auto p-5" style={{ borderRadius: "16px 16px 0 0" }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 600, fontSize: 18 }}>{photos.length} fotos</h2>
          <button onClick={onClose}><X size={20} /></button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {photos.map((src, i) => (
            <Photo key={i} cat={cat} src={src} height={120} radius="10px" iconSize={20} onOpen={onOpenPhoto} />
          ))}
        </div>
      </div>
    </div>
  );
}

function CategoryModal({ activeCat, onSelect, onClose }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center" style={{ background: "#0B1220cc" }} onClick={onClose}>
      <div className="bg-white
