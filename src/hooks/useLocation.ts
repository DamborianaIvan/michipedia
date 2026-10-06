import { useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import * as Location from 'expo-location';
import type { Point } from '../domain/model';
export function useLocation() {
  const [point, setPoint] = useState<Point | null>(null);
  const [enabled, setEnabled] = useState(false);
  const [status, setStatus] = useState('Ubicación desactivada');
  const subscription = useRef<Location.LocationSubscription | null>(null);
  const generation = useRef(0);
  const mounted = useRef(true);
  const stop = () => { generation.current++; subscription.current?.remove(); subscription.current = null; };
  const start = async () => {
    stop(); const current = generation.current;
    try {
      setStatus('Buscando tu ubicación…');
      const permission = await Location.requestForegroundPermissionsAsync();
      if (!mounted.current || current !== generation.current) return;
      if (!permission.granted) { setEnabled(false); setStatus('GPS sin permiso · podés elegir un punto manual'); return; }
      setEnabled(true);
      const watch = await Location.watchPositionAsync({ accuracy: Location.Accuracy.High, distanceInterval: 3, timeInterval: 2000 }, position => {
        if (current !== generation.current || !mounted.current) return;
        setPoint({ latitude: position.coords.latitude, longitude: position.coords.longitude, accuracy: position.coords.accuracy, source: 'gps', timestamp: position.timestamp });
        setStatus(`GPS activo · precisión ±${Math.round(position.coords.accuracy ?? 0)} m`);
      }, () => { if (mounted.current && current === generation.current) setStatus('GPS no disponible · revisá los permisos'); });
      if (!mounted.current || current !== generation.current) watch.remove(); else subscription.current = watch;
    } catch { if (mounted.current && current === generation.current) { setEnabled(false); setStatus('No pudimos obtener GPS · usá un punto manual'); } }
  };
  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; stop(); };
  }, []);
  useEffect(() => {
    const listener = AppState.addEventListener('change', state => {
      if (state !== 'active') { stop(); setStatus('GPS pausado con la app en segundo plano'); }
      else if (enabled) void start();
    });
    return () => listener.remove();
  }, [enabled]);
  return { point, status, start };
}
