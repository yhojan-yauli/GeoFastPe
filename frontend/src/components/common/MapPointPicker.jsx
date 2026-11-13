import { useState } from 'react';
import { MapPin } from 'lucide-react';
import { usePreferences } from '../../preferences/PreferencesContext.jsx';
import './MapPointPicker.css';

// Botón que pide al mapa un punto. Al hacer clic en el mapa, el punto se envía al formulario como { lat, lng }.
export default function MapPointPicker({ value, onPick, onChange, label }) {
  const { tr } = usePreferences();
  const [picking, setPicking] = useState(false);
  const [message, setMessage] = useState('');
  const buttonLabel = label || tr('Elegir punto en el mapa');

  const choose = async () => {
    if (!onPick || picking) return;
    setPicking(true);
    setMessage('');
    try {
      const point = await onPick();
      onChange?.(point);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setPicking(false);
    }
  };

  return (
    <div className="map-point-picker">
      <button type="button" className="map-point-picker-btn" onClick={choose} disabled={picking}>
        <MapPin size={17} />
        {picking ? tr('Haz clic en el mapa...') : value ? tr('Cambiar punto en el mapa') : buttonLabel}
      </button>
      <small className={value ? 'map-point-picker-ok' : 'map-point-picker-empty'}>
        {value
          ? `${tr('Punto seleccionado:')} ${value.lat.toFixed(5)}, ${value.lng.toFixed(5)}`
          : tr('Todavía no has elegido un punto en el mapa.')}
      </small>
      {message && <small className="map-point-picker-error" role="alert">{message}</small>}
    </div>
  );
}
