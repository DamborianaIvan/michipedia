import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { accuracyArea } from '../domain/accuracy';
import { mapStyle, type MapProps } from './EncounterMap.types';
export default function EncounterMap(props: MapProps) {
  const container = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const current = useRef(props); current.current = props;
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  useEffect(() => {
    if (!container.current) return;
    try {
      const instance = new maplibregl.Map({ container: container.current, style: mapStyle, center: [-58.3816, -34.6037], zoom: 12 }); map.current = instance;
      instance.addControl(new maplibregl.NavigationControl(), 'top-right');
      instance.addControl(new maplibregl.FullscreenControl(), 'top-right');
      instance.on('load', () => setLoaded(true)); instance.on('error', () => setError(true));
      instance.on('dragstart', () => current.current.onPan());
      instance.on('click', event => current.current.onPick?.({ latitude: event.lngLat.lat, longitude: event.lngLat.lng, accuracy: null, source: 'manual', timestamp: Date.now() }));
      const observer = new ResizeObserver(() => instance.resize()); observer.observe(container.current);
      return () => { observer.disconnect(); instance.remove(); map.current = null; };
    } catch { setError(true); }
  }, []);
  useEffect(() => { if (loaded && props.follow && props.point) map.current?.easeTo({ center: [props.point.longitude, props.point.latitude], zoom: 16, duration: 500 }); }, [props.point, props.follow, loaded]);
  useEffect(() => {
    if (!map.current || !loaded) return;
    const markers: maplibregl.Marker[] = [];
    const add = (longitude: number, latitude: number, text: string, action?: () => void) => {
      const el = document.createElement(action ? 'button' : 'span'); el.textContent = text; el.style.cssText = 'font-size:25px;background:white;border:0;border-radius:20px;padding:5px;';
      if (action) { el.setAttribute('aria-label', 'Ver encuentro de michi'); el.onclick = event => { event.stopPropagation(); action(); }; }
      markers.push(new maplibregl.Marker({ element: el }).setLngLat([longitude, latitude]).addTo(map.current!));
    };
    props.encounters.forEach(e => add(e.point.longitude, e.point.latitude, '🐈', () => props.onEncounter(e.catId)));
    if (props.point) add(props.point.longitude, props.point.latitude, '🔵');
    if (props.selected) add(props.selected.longitude, props.selected.latitude, '📍');
    return () => markers.forEach(marker => marker.remove());
  }, [props.encounters, props.point, props.selected, loaded]);
  useEffect(() => {
    const instance = map.current;
    if (!loaded || !instance) return;
    const data = props.point ? accuracyArea(props.point) : { type: 'FeatureCollection' as const, features: [] };
    const source = instance.getSource('accuracy') as maplibregl.GeoJSONSource | undefined;
    if (source) source.setData(data);
    else {
      instance.addSource('accuracy', { type: 'geojson', data });
      instance.addLayer({ id: 'accuracy-fill', type: 'fill', source: 'accuracy', paint: { 'fill-color': '#4285ef', 'fill-opacity': 0.15 } });
      instance.addLayer({ id: 'accuracy-line', type: 'line', source: 'accuracy', paint: { 'line-color': '#4285ef', 'line-opacity': 0.35, 'line-width': 1 } });
    }
  }, [props.point, loaded]);
  return <div style={{ flex: 1, position: 'relative', minHeight: 300 }}><div ref={container} style={{ position: 'absolute', inset: 0 }} />{error && <p role="alert" style={{ position: 'absolute', top: 10, left: 10, right: 10, background: '#fff5d8', padding: 12 }}>No pudimos cargar el mapa. Revisá tu conexión.</p>}</div>;
}
