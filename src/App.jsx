import { useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { LogIn, Plus, X, MapPin, Save, LogOut, Search, Navigation, Bell, Eye, EyeOff, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import { locationsData } from './data/locations';
import L from 'leaflet';

// --- LIMITES DA CÂMERA ---
const brasilBounds = [
  [-55.0, -90.0], 
  [15.0, -30.0]   
];

// --- CONTROLADOR DA CÂMERA ---
function MapController({ coords, zoom, resetTrigger }) {
  const map = useMap();
  
  useEffect(() => {
    if (coords) {
      map.closePopup();
      map.flyTo(coords, zoom || 16, { duration: 1.8 });
    }
  }, [coords, zoom, map]);

  useEffect(() => {
    if (resetTrigger > 0) {
      map.closePopup();
      map.flyTo([-15.79, -47.88], 5, { duration: 2 });
    }
  }, [resetTrigger, map]);

  return null;
}

// --- PINOS OTIMIZADOS ---
const createPin = (color) => {
  const htmlStr = `
    <div class="relative flex items-center justify-center w-8 h-8 xl:w-10 xl:h-10 group cursor-pointer">
      <div class="relative w-7 h-7 xl:w-8 xl:h-8 rounded-full border-[3px] border-white z-10 flex items-center justify-center" style="background-color: ${color}; box-shadow: 0 4px 10px rgba(0,0,0,0.4);">
        <div class="w-2 h-2 xl:w-2.5 xl:h-2.5 bg-white rounded-full"></div>
      </div>
    </div>
  `;
  return L.divIcon({
    className: 'custom-pin',
    html: htmlStr,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20]
  });
};

const pinIcons = {
  'Alta Prioridade': createPin('#E84393'), 
  'Em Negociação': createPin('#E8B84B'),   
  'Disponível': createPin('#2ecc71')       
};

const getImageForType = (tipo) => {
  if (tipo === 'Shopping Center') return 'https://images.unsplash.com/photo-1519567241046-7f4f0fee3b95?q=80&w=600&auto=format&fit=crop';
  if (tipo === 'Loja de Rua') return 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=600&auto=format&fit=crop';
  return 'https://images.unsplash.com/photo-1582719478250-c89400bb1536?q=80&w=600&auto=format&fit=crop'; 
};

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [locais, setLocais] = useState(locationsData);
  const [busca, setBusca] = useState('');
  const [mapCenter, setMapCenter] = useState(null);
  const [mapZoom, setMapZoom] = useState(5);
  const [toast, setToast] = useState({ show: false, title: '', message: '' });
  const [resetTrigger, setResetTrigger] = useState(0);

  // Controle da Gaveta (True = Aberta | False = Fechada)
  const [isListExpanded, setIsListExpanded] = useState(true);

  // Estados Login
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');

  const [novoPonto, setNovoPonto] = useState({
    nome: '', cidade: '', regiao: 'Sudeste', tipo: 'Shopping Center', status: 'Disponível', lat: '', lng: ''
  });

  const resetTotem = useCallback(() => {
    setBusca('');
    setMapCenter(null);
    setShowLogin(false);
    setShowModal(false);
    setIsListExpanded(true); 
    setResetTrigger(prev => prev + 1); 
  }, []);

  useEffect(() => {
    let timeoutId;
    const resetTimer = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(resetTotem, 120000); 
    };

    window.addEventListener('touchstart', resetTimer);
    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('click', resetTimer);
    
    resetTimer();

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('touchstart', resetTimer);
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('click', resetTimer);
    };
  }, [resetTotem]);

  const handleLogin = (e) => { 
    e.preventDefault(); 
    if (email === 'expansao@biscoite.com' && password === '123456') {
      setIsLoggedIn(true); setShowLogin(false); setLoginError(''); setEmail(''); setPassword('');
      showNotification("Acesso Liberado", "Painel de expansão destravado.");
    } else {
      setLoginError('E-mail ou senha incorretos.');
    }
  };

  const handleAddPonto = (e) => {
    e.preventDefault();
    const pontoFinal = { ...novoPonto, id: locais.length + 1, lat: parseFloat(novoPonto.lat), lng: parseFloat(novoPonto.lng) };
    setLocais([pontoFinal, ...locais]);
    setShowModal(false);
    setNovoPonto({ nome: '', cidade: '', regiao: 'Sudeste', tipo: 'Shopping Center', status: 'Disponível', lat: '', lng: '' });
    showNotification("Sucesso", `${pontoFinal.nome} adicionado.`);
    setMapCenter([pontoFinal.lat, pontoFinal.lng]);
    setMapZoom(16);
    setIsListExpanded(false); 
  };

  const handleLocationClick = (local) => {
    setMapCenter([local.lat, local.lng]);
    setMapZoom(16);
    setIsListExpanded(false); 
  };

  const showNotification = (title, message) => {
    setToast({ show: true, title, message });
    setTimeout(() => setToast({ show: false, title: '', message: '' }), 4000);
  };

  const LogoBiscoite = () => (
    <svg width="140" height="50" viewBox="0 0 202 75" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-lg xl:w-[160px] xl:h-[60px]">
      <g clipPath="url(#clip0_165_3209)"><path d="M73.79 39.76C73.68 39.3 73.66 38.88 73.72 38.51C73.77 38.23 73.88 38.02 74.05 37.86C74.21 37.71 74.38 37.64 74.6 37.64C74.82 37.64 74.89 37.72 74.94 37.8C75.03 37.95 75.06 38.15 75.01 38.42C74.93 38.86 74.79 39.31 74.59 39.75C74.46 40.03 74.32 40.31 74.15 40.6C73.97 40.32 73.84 40.04 73.78 39.77M73.13 35.45C72.59 35.68 72.09 36.01 71.64 36.41C71.19 36.81 70.81 37.3 70.49 37.86C70.17 38.42 69.95 39.02 69.84 39.64C69.64 40.77 69.7 41.77 70.01 42.6C70.28 43.32 70.75 44.08 71.4 44.86L66.86 52.02L66.48 52.56C64.97 54.78 63.65 56.63 62.58 58.06C61.5 59.48 60.56 60.63 59.78 61.47C59.02 62.29 58.37 62.86 57.87 63.17C57.3 63.53 56.94 63.6 56.74 63.6C56.52 63.6 56.32 63.55 56.13 63.46C56 63.4 55.87 63.2 55.76 62.91C55.63 62.53 55.57 61.93 55.57 61.11C55.58 60.26 55.72 59.09 55.98 57.61C56.34 55.54 56.75 53.51 57.2 51.59C57.66 49.63 58.09 47.86 58.49 46.32C58.9 44.76 59.25 43.45 59.54 42.41C59.84 41.35 60.01 40.7 60.06 40.41C60.18 39.72 60.14 39.25 59.92 38.92C59.68 38.56 59.23 38.39 58.53 38.39C58.39 38.39 58.17 38.42 57.85 38.47C57.54 38.53 57.2 38.62 56.86 38.74C56.51 38.87 56.18 39.03 55.85 39.22C55.48 39.43 55.18 39.72 54.94 40.07C54.69 40.46 54.41 41.06 54.08 41.92C53.77 42.73 53.4 43.67 52.96 44.75C52.53 45.81 52 46.96 51.39 48.18C50.79 49.38 50.08 50.61 49.28 51.81L48.57 52.91L50.56 54.65L50.98 54C50.95 54.17 50.92 54.35 50.89 54.52L50.54 56.48C50.15 58.7 49.93 60.58 49.89 62.1C49.85 63.64 50 64.91 50.32 65.87C50.66 66.88 51.2 67.62 51.93 68.08C52.64 68.52 53.54 68.74 54.6 68.74C55.66 68.74 56.75 68.29 57.91 67.41C59.01 66.57 60.16 65.45 61.34 64.09C62.51 62.74 63.71 61.18 64.91 59.46C66.02 57.87 67.13 56.27 68.26 54.63L68.3 54.67L69.3 53.11H69.28L73.25 46.76C73.69 47.22 74.2 47.69 74.76 48.15C75.49 48.75 76.24 49.36 77 50C77.74 50.62 78.49 51.28 79.21 51.97C79.91 52.64 80.52 53.36 81.03 54.12C81.53 54.86 81.9 55.66 82.14 56.5C82.37 57.31 82.4 58.21 82.24 59.16C82.06 60.19 81.75 61.15 81.31 62.01C80.88 62.87 80.34 63.62 79.69 64.24C79.06 64.86 78.33 65.35 77.53 65.69C76.74 66.03 75.88 66.21 74.99 66.21C73.24 66.21 71.93 65.78 71.11 64.93C70.29 64.09 70.02 62.99 70.27 61.55C70.41 60.75 70.7 59.99 71.14 59.29C71.58 58.58 72.11 57.97 72.73 57.47C73.34 56.96 74.03 56.56 74.77 56.27C75.49 55.98 76.22 55.84 76.92 55.84H77.31L77.64 53.97L77.21 53.87C75.57 53.48 74.01 53.6 72.5 54.18C71.59 54.53 70.74 55.02 69.96 55.63C69.18 56.25 68.52 57 67.97 57.87C67.42 58.74 67.06 59.7 66.88 60.71C66.7 61.73 66.73 62.74 66.97 63.69C67.21 64.65 67.66 65.53 68.29 66.28C68.93 67.04 69.76 67.65 70.77 68.09C71.77 68.53 72.96 68.76 74.31 68.76C76.17 68.76 77.9 68.4 79.48 67.68C81.05 66.97 82.44 66 83.63 64.8C84.81 63.61 85.8 62.23 86.58 60.7C87.35 59.16 87.89 57.55 88.18 55.88C88.42 54.54 88.35 53.31 87.97 52.23C87.6 51.17 87.04 50.21 86.29 49.38C85.55 48.56 84.68 47.81 83.69 47.15C82.72 46.5 81.72 45.89 80.72 45.33C79.73 44.78 78.78 44.25 77.86 43.73C77.11 43.31 76.45 42.87 75.91 42.42C75.99 42.26 76.07 42.08 76.17 41.89C76.34 41.55 76.51 41.18 76.7 40.78C76.88 40.37 77.05 39.97 77.19 39.56C77.34 39.14 77.45 38.74 77.52 38.35C77.68 37.46 77.53 36.7 77.1 36.08C76.64 35.44 75.87 35.11 74.81 35.11C74.24 35.11 73.68 35.23 73.13 35.47M57.53 29.06C56.77 29.7 56.31 30.5 56.14 31.42C55.97 32.4 56.17 33.24 56.74 33.9C57.31 34.57 58.08 34.91 59.03 34.91C59.98 34.91 60.84 34.59 61.59 33.95C62.33 33.32 62.79 32.52 62.96 31.57C63.13 30.62 62.94 29.79 62.39 29.11C61.84 28.42 61.06 28.07 60.08 28.07C59.16 28.07 58.3 28.4 57.54 29.04M150.75 29.06C149.99 29.7 149.53 30.5 149.37 31.42C149.19 32.4 149.4 33.23 149.96 33.91C150.53 34.58 151.3 34.92 152.25 34.92C153.2 34.92 154.06 34.6 154.81 33.96C155.55 33.33 156.02 32.53 156.18 31.58C156.35 30.63 156.15 29.8 155.61 29.12C155.06 28.43 154.28 28.08 153.3 28.08C152.37 28.08 151.52 28.41 150.76 29.05M180.71 32.82L182 35.05L191.39 30.55L199.2 35.03L201.12 32.92L192.16 25.38L180.71 32.81V32.82ZM129.08 55.9C128.36 55.35 127.75 54.64 127.27 53.79C126.79 52.95 126.45 51.95 126.28 50.83C126.1 49.7 126.13 48.45 126.37 47.09C126.63 45.6 127.11 44.44 127.78 43.63C128.42 42.86 129.06 42.49 129.73 42.49C130.19 42.49 130.61 42.7 131 43.13C131.43 43.6 131.76 44.29 132.01 45.18C132.26 46.11 132.39 47.25 132.41 48.59C132.43 49.92 132.29 51.45 132 53.12C131.87 53.88 131.72 54.62 131.56 55.34C131.43 55.9 131.28 56.45 131.11 56.97C130.38 56.74 129.69 56.38 129.08 55.91M182.68 47.95C183.31 46.48 183.99 45.27 184.71 44.33C185.41 43.41 186.14 42.74 186.85 42.33C187.55 41.93 188.17 41.73 188.71 41.73C189.3 41.73 189.75 41.94 190.08 42.37C190.41 42.81 190.51 43.45 190.36 44.27C190.2 45.17 189.76 46.08 189.06 46.99C188.32 47.93 187.45 48.83 186.47 49.67C185.48 50.51 184.42 51.29 183.33 51.98C182.57 52.46 181.85 52.88 181.2 53.24C181.57 51.18 182.07 49.4 182.69 47.95M168.36 23.67L168.26 24.01C167.55 26.45 166.79 28.93 166.01 31.38C165.27 33.73 164.53 36.06 163.8 38.4H160.66L159.54 41.53H162.85C162.14 43.96 161.49 46.38 160.89 48.74C160.62 49.83 160.36 50.91 160.12 52L159.71 52.58C158.21 54.78 156.9 56.62 155.81 58.08C154.73 59.5 153.79 60.65 153.01 61.49C152.25 62.31 151.6 62.88 151.1 63.19C150.31 63.68 149.79 63.69 149.35 63.48C149.22 63.42 149.09 63.22 148.99 62.92C148.86 62.54 148.79 61.94 148.8 61.12C148.8 60.28 148.95 59.1 149.21 57.62C149.57 55.55 149.99 53.52 150.43 51.6C150.88 49.64 151.32 47.87 151.72 46.33C152.13 44.77 152.48 43.46 152.77 42.42C153.07 41.36 153.24 40.7 153.29 40.42C153.41 39.73 153.37 39.26 153.15 38.93C152.91 38.57 152.46 38.4 151.75 38.4C151.61 38.4 151.39 38.43 151.07 38.48C150.76 38.54 150.42 38.63 150.08 38.75C149.73 38.88 149.39 39.04 149.07 39.23C148.7 39.45 148.4 39.73 148.16 40.08C147.91 40.47 147.63 41.07 147.3 41.93C146.99 42.74 146.62 43.68 146.17 44.76C145.74 45.81 145.22 46.96 144.6 48.19C144 49.39 143.29 50.61 142.49 51.81L141.96 52.56C141.16 53.73 140.23 54.68 139.21 55.39C138.46 55.9 137.67 56.32 136.86 56.63C137.04 56.14 137.21 55.65 137.35 55.15C137.59 54.32 137.79 53.47 137.94 52.62C138.34 50.35 138.42 48.34 138.18 46.62C137.94 44.9 137.48 43.43 136.81 42.27C136.13 41.09 135.28 40.19 134.29 39.59C132.44 38.47 130.42 38.43 128.52 39.24C127.66 39.61 126.84 40.16 126.11 40.88C125.38 41.6 124.73 42.5 124.19 43.55C123.64 44.61 123.25 45.84 123 47.22C122.71 48.9 122.7 50.48 122.98 51.92C123.26 53.36 123.76 54.65 124.46 55.76C125.17 56.87 126.05 57.82 127.09 58.57C127.99 59.21 128.97 59.69 130.02 59.98C129.24 61.79 128.3 63.24 127.25 64.3C126.12 65.43 124.9 65.98 123.51 65.98C122.52 65.98 121.73 65.67 121.06 65.03C120.37 64.37 119.84 63.47 119.48 62.35C119.11 61.2 118.9 59.86 118.87 58.35C118.83 56.84 118.96 55.25 119.24 53.63C119.71 50.98 120.37 48.73 121.21 46.96C122.05 45.18 122.9 43.73 123.74 42.66C124.7 41.42 125.72 40.44 126.78 39.75L127.05 39.57L126.67 37.62H126.28C125.9 37.62 125.37 37.77 124.64 38.07C123.96 38.35 123.18 38.78 122.32 39.35C121.47 39.91 120.56 40.63 119.62 41.5C118.69 42.36 117.79 43.39 116.95 44.55C116.11 45.71 115.35 47.04 114.67 48.51C114.1 49.75 113.65 51.13 113.34 52.6C112.01 54.56 110.73 56.28 109.54 57.7C108.35 59.12 107.22 60.3 106.19 61.18C105.17 62.06 104.19 62.71 103.29 63.12C101.19 64.07 99.38 63.83 98.1 62.99C97.35 62.5 96.74 61.81 96.31 60.93C95.86 60.03 95.59 58.93 95.49 57.66C95.4 56.37 95.49 54.91 95.77 53.32C96.12 51.3 96.63 49.53 97.26 48.03C97.9 46.54 98.6 45.3 99.36 44.33C100.11 43.37 100.87 42.65 101.63 42.18C102.35 41.73 103.03 41.5 103.63 41.5C104.48 41.5 105.03 41.72 105.24 42.14C105.49 42.65 105.56 43.26 105.43 43.97C105.32 44.6 105.11 45.23 104.81 45.86C104.51 46.49 104.18 47.03 103.83 47.46L103.69 47.63L104 49.33L104.48 49.22C105.27 49.04 106.01 48.75 106.69 48.36C107.36 47.97 107.96 47.53 108.49 47.04C109.02 46.54 109.46 46 109.79 45.42C110.13 44.84 110.35 44.26 110.45 43.7C110.55 43.15 110.55 42.56 110.45 41.96C110.34 41.33 110.08 40.75 109.66 40.21C109.24 39.67 108.65 39.23 107.9 38.88C107.15 38.54 106.19 38.37 105.02 38.37C103.51 38.37 101.93 38.81 100.3 39.68C98.7 40.54 97.17 41.76 95.75 43.29C94.33 44.82 93.06 46.69 91.97 48.84C90.87 50.99 90.08 53.41 89.62 56.03C89.33 57.69 89.27 59.31 89.46 60.82C89.65 62.35 90.09 63.72 90.76 64.87C91.44 66.05 92.38 67 93.55 67.68C94.72 68.37 96.15 68.71 97.78 68.71C98.94 68.71 100.2 68.43 101.53 67.89C102.84 67.35 104.25 66.48 105.73 65.31C107.2 64.15 108.75 62.63 110.37 60.8C111.18 59.88 112.01 58.87 112.85 57.76C112.87 58.29 112.92 58.81 112.98 59.31C113.22 61.15 113.77 62.78 114.59 64.16C115.42 65.55 116.56 66.67 117.95 67.48C119.35 68.3 121.03 68.71 122.95 68.71C124.27 68.71 125.55 68.48 126.76 68.03C127.96 67.59 129.1 66.96 130.14 66.17C131.18 65.38 132.15 64.45 133.03 63.39C133.86 62.39 134.61 61.29 135.24 60.11C136.85 59.8 138.42 59.16 139.92 58.2C141.36 57.29 142.62 56.07 143.7 54.59L143.74 54.62L144.17 53.97C144.14 54.15 144.1 54.32 144.07 54.49L143.73 56.45C143.34 58.66 143.12 60.55 143.08 62.07C143.04 63.61 143.19 64.88 143.51 65.84C143.85 66.85 144.39 67.59 145.12 68.05C145.83 68.49 146.73 68.71 147.79 68.71C148.85 68.71 149.94 68.26 151.1 67.38C152.2 66.54 153.35 65.42 154.53 64.06C155.69 62.71 156.89 61.15 158.1 59.43C158.38 59.03 158.65 58.64 158.93 58.24C158.75 59.61 158.65 60.83 158.66 61.89C158.66 63.42 158.84 64.7 159.19 65.69C159.56 66.73 160.12 67.5 160.86 67.99C162.31 68.95 164.44 69.06 166.82 67.66C167.97 66.99 169.2 66.01 170.5 64.76C171.78 63.52 173.14 61.99 174.55 60.21C174.63 60.11 174.7 60.02 174.78 59.92C174.8 60.22 174.83 60.52 174.86 60.82C175.05 62.35 175.49 63.72 176.16 64.88C176.84 66.06 177.78 67.01 178.95 67.69C180.12 68.38 181.55 68.72 183.18 68.72C184.34 68.72 185.6 68.44 186.95 67.9C188.27 67.36 189.69 66.49 191.15 65.32C192.6 64.16 194.15 62.64 195.77 60.81C197.38 58.99 199.08 56.76 200.83 54.19L201.55 53.09L199.56 51.36L198.78 52.56C197.44 54.54 196.16 56.27 194.95 57.71C193.77 59.13 192.64 60.3 191.6 61.19C190.58 62.07 189.6 62.72 188.7 63.13C186.75 64.01 185.04 63.85 183.81 63.2C183.13 62.84 182.58 62.34 182.12 61.66C181.66 60.98 181.32 60.16 181.11 59.2C180.91 58.3 180.82 57.29 180.85 56.19C182.68 55.18 184.42 54.2 186.09 53.24C187.83 52.24 189.41 51.21 190.78 50.19C192.17 49.15 193.33 48.08 194.23 46.99C195.16 45.87 195.75 44.64 195.97 43.34C196.22 41.93 195.93 40.74 195.11 39.79C194.3 38.85 192.98 38.37 191.19 38.37C189.5 38.37 187.77 38.81 186.06 39.68C184.36 40.54 182.75 41.75 181.27 43.29C179.79 44.83 178.49 46.69 177.39 48.84C176.46 50.67 175.74 52.7 175.27 54.87C174.77 55.57 174.26 56.25 173.76 56.91C172.71 58.27 171.7 59.47 170.74 60.48C169.79 61.48 168.9 62.29 168.09 62.88C166.84 63.79 165.95 63.93 165.43 63.39C165.28 63.23 165.07 62.87 164.97 62.07C164.88 61.37 164.88 60.41 164.99 59.23C165.1 58.03 165.31 56.51 165.63 54.71C165.76 54 165.92 53.14 166.12 52.15C166.32 51.16 166.55 50.08 166.82 48.9C167.09 47.72 167.38 46.47 167.68 45.15C167.95 43.95 168.25 42.73 168.55 41.49H175.27L176.34 38.36H169.31C169.64 36.96 169.97 35.57 170.29 34.22C170.66 32.68 171.01 31.26 171.35 29.96L172.25 26.51C172.51 25.52 172.71 24.76 172.85 24.24L173.01 23.65H168.38L168.36 23.67ZM22.58 52.36C23.3 48.84 24.94 42.09 25.61 38.51C36.71 41.03 30.25 52.83 24.47 52.83C23.82 52.83 23.18 52.68 22.57 52.35M32.17 37.21C46.06 36.48 45.66 50.97 40.35 56.14C35.11 61.84 25.6 64.51 19.68 63.14C19.98 62.29 20.5 59.81 20.91 58.13C21.5 58.28 22.12 58.36 22.75 58.36C30.64 58.36 41.29 47.08 32.17 37.22M4.41 45.22C5.66 39.29 11.56 36.06 19.87 37.31C19.24 41.06 17.54 47.06 16.97 50.75C14.44 50.03 11.48 47.41 12.19 43.64C7.38 50.67 13.35 54.24 15.35 56.52C15.06 57.43 14.33 59.14 13.8 60.54C9.47 59.97 3.5 54.69 4.41 45.21M30.46 15.55C37.87 14.75 41.4 18.26 41.67 21.17C41.69 28.11 31.99 31.23 27.74 31.92C27.97 27.61 29.48 19.1 30.47 15.55M25.96 2.67C24.97 3.88 24.71 8.59 23.36 8.74C19.15 9.45 12.78 12.62 10.18 15.23C10.35 16.3 10.35 17.16 10.79 18.46C14.2 18.17 19.26 16.62 22.77 16.44C21.99 19.41 21.03 28.59 20.09 31.41C8.92 29.46 0.929998 37.55 0.209998 44.99C-1.04 54.22 3.33 59.2 11.08 65.47C11.83 66.15 11.92 67.7 9.3 70.67C8.16 71.81 6.45 73.09 1.66 73.31C7.25 76.84 14.43 71.91 16.89 68.21C28.18 70.88 45.57 64.56 47.62 50.66C49.03 42.78 45.55 32.83 36.09 33.05C42.93 30.43 45.62 27.86 45.62 21.25C45.29 13.5 36.48 10.19 31.94 9.33C32.82 6.17 35.61 2.52 38.21 1.07C37.05 0.34 35.41 0 33.68 0C30.74 0 27.53 0.98 25.95 2.67" fill="#6385B7"/></g><defs><clipPath id="clip0_165_3209"><rect width="201.55" height="74.53" fill="white"/></clipPath></defs></svg>
  );

  return (
    <div className="flex flex-col w-full h-screen bg-b-dark overflow-hidden font-sans">
      
      {/* 1. HEADER SUPERIOR FIXO */}
      <header className="h-[80px] xl:h-[100px] shrink-0 w-full z-[2000] bg-b-dark/95 backdrop-blur-xl border-b border-b-primary/30 px-4 xl:px-8 flex justify-between items-center shadow-md relative">
        <div className="flex flex-col">
          <LogoBiscoite />
          <p className="text-b-secondary mt-1 xl:mt-2 font-bold text-[10px] xl:text-sm tracking-widest uppercase hidden sm:block">Plano de Expansão</p>
        </div>
        
        {isLoggedIn ? (
          <div className="flex gap-2 xl:gap-4">
            <button onClick={() => setShowModal(true)} className="bg-b-primary text-b-dark px-4 py-2 xl:px-6 xl:py-4 rounded-xl xl:rounded-2xl font-bold text-xs xl:text-sm flex items-center gap-2 shadow-lg shadow-b-primary/20 hover:bg-b-secondary transition-all">
              <Plus size={20} /> <span className="hidden sm:block">NOVO PONTO</span>
            </button>
            <button onClick={() => setIsLoggedIn(false)} className="bg-white/5 text-b-secondary p-2 xl:p-4 rounded-xl xl:rounded-2xl border border-b-primary/30 hover:bg-red-500/10 hover:text-red-400 transition-all">
              <LogOut size={20} />
            </button>
          </div>
        ) : (
          <button onClick={() => setShowLogin(true)} className="text-b-secondary border-2 border-b-primary/30 px-4 py-2 xl:px-6 xl:py-4 rounded-xl xl:rounded-2xl font-bold text-xs xl:text-sm flex items-center gap-2 hover:bg-b-primary/10 hover:text-b-light transition-all bg-b-dark/50">
            <LogIn size={20} /> <span className="hidden sm:block">ACESSO RESTRITO</span>
          </button>
        )}
      </header>

      {/* 2. ÁREA DE CONTEÚDO (SIDEBAR + MAPA) */}
      <div className="flex-1 relative flex w-full h-full overflow-hidden">
        
        {/* SIDEBAR DA LISTA DE LOJAS */}
        <aside 
          className={`
            z-[1000] flex flex-col bg-b-dark/95 backdrop-blur-2xl shadow-2xl transition-all duration-500 overflow-hidden
            
            /* MOBILE / TOTEM (< 1280px) */
            absolute left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:w-[85%] md:max-w-[800px] rounded-[2rem] border-2 border-b-primary/30 h-[55vh]
            ${isListExpanded ? 'bottom-4 opacity-100' : '-bottom-[100%] opacity-0 pointer-events-none'}
            
            /* DESKTOP (>= 1280px) */
            xl:static xl:bottom-auto xl:left-auto xl:right-auto xl:translate-x-0 xl:h-full xl:rounded-none xl:border-0 xl:border-r border-r-primary/30
            ${isListExpanded ? 'xl:w-[420px] xl:opacity-100' : 'xl:w-0 xl:opacity-0 xl:border-0'}
          `}
        >
          {/* BOTÃO DE FECHAR/OCULTAR */}
          <div 
            onClick={() => setIsListExpanded(false)}
            className="w-full flex justify-center items-center py-4 bg-white/5 cursor-pointer border-b border-b-primary/20 hover:bg-red-500/10 hover:text-red-400 transition-colors xl:py-5 shrink-0 group"
          >
            <ChevronDown size={24} className="text-b-secondary group-hover:text-red-400 xl:hidden" />
            <X size={24} className="text-b-secondary group-hover:text-red-400 hidden xl:block" />
            <span className="text-b-secondary group-hover:text-red-400 text-sm font-bold ml-2 uppercase tracking-widest">
              Ocultar Lista
            </span>
          </div>

          <div className="p-4 xl:p-6 bg-white/5 shrink-0">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-b-secondary/60" size={20} />
              <input 
                type="text" placeholder="Buscar shopping..." 
                className="w-full pl-12 p-3 xl:p-4 bg-b-dark border border-b-primary/40 rounded-xl xl:rounded-2xl text-sm xl:text-lg text-b-light focus:outline-none focus:border-b-secondary transition-all"
                value={busca} 
                onChange={(e) => setBusca(e.target.value)}
              />
            </div>
          </div>
          
          <div className="overflow-y-auto flex-1 p-4 xl:p-6 space-y-3 touch-pan-y custom-scrollbar border-t border-b-primary/20">
            {locais.filter(l => l.nome.toLowerCase().includes(busca.toLowerCase()) || l.cidade.toLowerCase().includes(busca.toLowerCase())).map(local => (
              <div 
                key={local.id} 
                onClick={() => handleLocationClick(local)}
                className="p-4 xl:p-5 border border-b-primary/20 rounded-xl cursor-pointer bg-white/5 hover:bg-white/10 active:bg-b-primary/20 transition-all flex flex-col gap-1 xl:gap-2 group"
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] xl:text-[12px] font-bold px-2 xl:px-3 py-1 bg-b-dark text-b-secondary rounded-lg border border-b-primary/30">
                    {local.regiao}
                  </span>
                  <span className="text-[9px] xl:text-[11px] font-bold px-2 xl:px-3 py-1 rounded-lg uppercase tracking-wider" style={{
                    backgroundColor: local.status === 'Alta Prioridade' ? '#E8439320' : local.status === 'Em Negociação' ? '#E8B84B20' : '#2ecc7120',
                    color: local.status === 'Alta Prioridade' ? '#E84393' : local.status === 'Em Negociação' ? '#E8B84B' : '#2ecc71',
                    border: `1px solid ${local.status === 'Alta Prioridade' ? '#E8439350' : local.status === 'Em Negociação' ? '#E8B84B50' : '#2ecc7150'}`
                  }}>
                    {local.status}
                  </span>
                </div>
                <h4 className="font-bold text-b-light text-base xl:text-xl group-hover:text-white transition-colors">{local.nome}</h4>
                <p className="text-xs xl:text-sm text-b-secondary flex items-center gap-1"><MapPin size={14}/> {local.cidade}</p>
              </div>
            ))}
          </div>
        </aside>

        {/* --- O BOTÃO FLUTUANTE (FAB) APARECE QUANDO A LISTA FECHA --- */}
        {!isListExpanded && (
          <button 
            onClick={() => setIsListExpanded(true)}
            className="absolute top-6 right-6 xl:top-8 xl:left-8 z-[1500] bg-b-primary text-b-dark px-6 py-4 rounded-full shadow-[0_10px_40px_rgba(0,0,0,0.6)] flex items-center gap-3 hover:scale-105 transition-all animate-in zoom-in duration-300"
          >
            <Search size={24} className="animate-pulse" />
            <span className="font-bold text-sm uppercase tracking-widest hidden sm:block">Buscar Lojas</span>
          </button>
        )}

        {/* MAPA PRINCIPAL */}
        <main className="flex-1 relative z-0 h-full w-full">
          <MapContainer 
            center={[-15.79, -47.88]} 
            zoom={5} 
            minZoom={4} 
            maxBounds={brasilBounds} 
            maxBoundsViscosity={1.0} 
            className="absolute inset-0 w-full h-full" 
            zoomControl={false}
          >
            <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
            <MapController coords={mapCenter} zoom={mapZoom} resetTrigger={resetTrigger} />

            {locais.map(local => (
              <Marker key={local.id} position={[local.lat, local.lng]} icon={pinIcons[local.status] || pinIcons['Disponível']}>
                <Popup autoPan={false}>
                  <div className="w-72 xl:w-80 bg-b-dark rounded-3xl overflow-hidden shadow-2xl border border-b-primary/40 font-sans flex flex-col">
                    <div className="h-32 xl:h-40 bg-gray-800 relative">
                      <img src={getImageForType(local.tipo)} alt={local.nome} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-b-dark to-transparent opacity-90"></div>
                      <div className="absolute bottom-3 left-4 right-4 flex justify-between items-end">
                         <span className="text-[10px] xl:text-[12px] font-bold px-3 py-1.5 rounded-lg uppercase shadow-lg text-white" style={{ backgroundColor: local.status === 'Alta Prioridade' ? '#E84393' : local.status === 'Em Negociação' ? '#E8B84B' : '#2ecc71' }}>
                           {local.status}
                         </span>
                      </div>
                    </div>
                    <div className="p-4 xl:p-5">
                      <h3 className="font-bold text-lg xl:text-xl text-b-light leading-tight mb-2">{local.nome}</h3>
                      <p className="text-xs xl:text-sm text-b-secondary flex items-center gap-2 mb-4 xl:mb-5"><MapPin size={16}/> {local.cidade}</p>
                      
                      {/* OS DOIS BOTÕES (GPS e STREET VIEW) */}
                      <div className="flex gap-2">
                        <button 
                          onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${local.lat},${local.lng}`, '_blank')} 
                          className="flex-1 py-3 bg-white/5 hover:bg-b-primary/20 text-b-secondary hover:text-white border border-b-primary/30 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 xl:gap-2"
                        >
                          <Navigation size={16} /> GPS
                        </button>
                        <button 
                          onClick={() => window.open(`https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${local.lat},${local.lng}`, '_blank')} 
                          className="flex-1 py-3 bg-white/5 hover:bg-b-primary/20 text-b-secondary hover:text-white border border-b-primary/30 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 xl:gap-2"
                        >
                          <Eye size={16} /> RUA (360º)
                        </button>
                      </div>

                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </main>

      </div>

      {/* --- MODAIS DE SOBREPOSIÇÃO --- */}
      
      {showLogin && !isLoggedIn && (
        <div className="fixed inset-0 flex items-center justify-center p-4 bg-b-dark/90 backdrop-blur-md z-[3000] overflow-hidden">
          <div className="bg-b-dark/90 p-6 xl:p-8 rounded-3xl shadow-2xl w-full max-w-lg border border-b-primary/30">
            <div className="flex flex-col items-center mb-6">
              <LogoBiscoite />
              <p className="text-b-secondary mt-4 font-medium tracking-wide uppercase text-xs xl:text-sm">Acesso Restrito</p>
            </div>
            <form onSubmit={handleLogin} className="space-y-4">
              {loginError && <div className="bg-red-500/10 border border-red-500/50 p-3 rounded-xl flex items-center gap-2 text-red-400 text-xs xl:text-sm"><AlertCircle size={16} /> {loginError}</div>}
              <div>
                <label className="text-xs xl:text-sm font-bold text-b-secondary ml-1 mb-1 block uppercase">E-mail</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ex: expansao@biscoite.com" className="w-full p-4 bg-white/5 border border-b-primary/30 text-b-light rounded-xl focus:outline-none focus:border-b-secondary transition-all" required />
              </div>
              <div className="relative">
                <label className="text-xs xl:text-sm font-bold text-b-secondary ml-1 mb-1 block uppercase">Senha</label>
                <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full p-4 pr-12 bg-white/5 border border-b-primary/30 text-b-light rounded-xl focus:outline-none focus:border-b-secondary transition-all" required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-[36px] text-b-secondary hover:text-white transition-colors">
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              <button type="submit" className="w-full bg-b-primary text-b-dark p-4 rounded-xl font-bold hover:bg-b-secondary transition-all shadow-lg mt-2">ENTRAR NO PAINEL</button>
              <button type="button" onClick={() => setShowLogin(false)} className="w-full text-b-secondary text-xs xl:text-sm font-medium hover:text-b-light transition-colors mt-2 p-2">Voltar ao mapa</button>
            </form>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-b-dark/90 backdrop-blur-md z-[3000] flex items-center justify-center p-4">
          <div className="bg-b-dark w-full max-w-2xl rounded-3xl shadow-2xl border border-b-primary/30 overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="bg-white/5 border-b border-b-primary/30 p-4 xl:p-6 text-b-light flex justify-between items-center sticky top-0 z-10 backdrop-blur-md">
              <h3 className="text-lg xl:text-xl font-bold flex items-center gap-2 text-b-secondary"><MapPin size={20} /> Nova Praça</h3>
              <button onClick={() => setShowModal(false)} className="text-b-secondary hover:text-white transition-all"><X size={24}/></button>
            </div>
            <form onSubmit={handleAddPonto} className="p-4 xl:p-8 grid grid-cols-1 xl:grid-cols-2 gap-4 xl:gap-6">
              <div className="col-span-1 xl:col-span-2">
                <label className="text-xs font-bold text-b-secondary uppercase mb-1 block">Nome do Local</label>
                <input required value={novoPonto.nome} onChange={e => setNovoPonto({...novoPonto, nome: e.target.value})} type="text" className="w-full p-3 bg-white/5 border border-b-primary/30 text-b-light rounded-xl focus:border-b-secondary" />
              </div>
              <div className="col-span-1 xl:col-span-2">
                <label className="text-xs font-bold text-b-secondary uppercase mb-1 block">Cidade e UF</label>
                <input required value={novoPonto.cidade} onChange={e => setNovoPonto({...novoPonto, cidade: e.target.value})} type="text" className="w-full p-3 bg-white/5 border border-b-primary/30 text-b-light rounded-xl focus:border-b-secondary" />
              </div>
              <div className="col-span-1 xl:col-span-2">
                <label className="text-xs font-bold text-b-secondary uppercase mb-1 block">Status Estratégico</label>
                <select value={novoPonto.status} onChange={e => setNovoPonto({...novoPonto, status: e.target.value})} className="w-full p-3 bg-b-dark border border-b-primary/30 text-b-light rounded-xl focus:border-b-secondary">
                  <option value="Disponível">Disponível</option>
                  <option value="Alta Prioridade">Alta Prioridade</option>
                  <option value="Em Negociação">Em Negociação</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-b-secondary uppercase mb-1 block">Latitude</label>
                <input required value={novoPonto.lat} onChange={e => setNovoPonto({...novoPonto, lat: e.target.value})} type="text" className="w-full p-3 bg-white/5 border border-b-primary/30 text-b-light rounded-xl focus:border-b-secondary" />
              </div>
              <div>
                <label className="text-xs font-bold text-b-secondary uppercase mb-1 block">Longitude</label>
                <input required value={novoPonto.lng} onChange={e => setNovoPonto({...novoPonto, lng: e.target.value})} type="text" className="w-full p-3 bg-white/5 border border-b-primary/30 text-b-light rounded-xl focus:border-b-secondary" />
              </div>
              <div className="col-span-1 xl:col-span-2 pt-2">
                <button type="submit" className="w-full bg-b-primary text-b-dark p-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-b-secondary transition-all shadow-lg">
                  <Save size={20} /> ADICIONAR
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* NOTIFICAÇÃO (TOAST) */}
      {toast.show && (
        <div className="fixed bottom-4 right-4 md:bottom-8 md:right-8 z-[9999] bg-b-dark/90 backdrop-blur-xl border border-b-primary/40 text-white p-4 pr-6 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] flex items-center gap-4 animate-in slide-in-from-right-8 fade-in duration-300">
          <div className="bg-b-primary/20 p-2.5 rounded-full text-b-secondary">
            <Bell size={20} className="animate-pulse" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-b-light tracking-wide">{toast.title}</h4>
            <p className="text-xs text-b-secondary/80 mt-0.5">{toast.message}</p>
          </div>
        </div>
      )}
    </div>
  );
}