import { useEffect, useRef, useState } from 'react';
import { Image, Pressable, Text, View, StyleSheet } from 'react-native';
import { Map, Camera, Marker, GeoJSONSource, Layer, type CameraRef } from '@maplibre/maplibre-react-native';
import { accuracyArea } from '../domain/accuracy';
import { mapStyle, type MapProps } from './EncounterMap.types';
export default function EncounterMap({ point, follow, cats, encounters, selected, onPan, onPick, onEncounter }: MapProps) {
  const camera = useRef<CameraRef>(null);
  const [loaded, setLoaded] = useState(false);
  const [zoom, setZoom] = useState(12);
  const [error, setError] = useState(false);
  useEffect(() => { if (loaded && follow && point) camera.current?.easeTo({ center: [point.longitude, point.latitude], zoom: 16, duration: 500 }); }, [point, follow, loaded]);
  return <View style={{ flex: 1 }}><Map style={{ flex: 1 }} mapStyle={mapStyle}
    onDidFinishLoadingMap={() => { setLoaded(true); setError(false); }} onDidFailLoadingMap={() => setError(true)}
    onRegionWillChange={event => { if (event.nativeEvent.userInteraction) onPan(); }}
    onRegionDidChange={event => setZoom(event.nativeEvent.zoom)}
    onPress={event => { const [longitude, latitude] = event.nativeEvent.lngLat; onPick?.({ longitude, latitude, accuracy: null, source: 'manual', timestamp: Date.now() }); }}>
    <Camera ref={camera} initialViewState={{ center: [-58.3816, -34.6037], zoom: 12 }} />
    {point && point.accuracy !== null && <GeoJSONSource id="accuracy" data={accuracyArea(point)}><Layer id="accuracy-fill" type="fill" paint={{ "fill-color": "#4285ef", "fill-opacity": 0.15 }} /><Layer id="accuracy-line" type="line" paint={{ "line-color": "#4285ef", "line-opacity": 0.35, "line-width": 1 }} /></GeoJSONSource>}
    {point && <Marker id="me" lngLat={[point.longitude, point.latitude]}><View style={styles.me} /></Marker>}
    {selected && <Marker id="draft" lngLat={[selected.longitude, selected.latitude]}><Text style={styles.pin}>📍</Text></Marker>}
    {encounters.map(encounter => {
      const catName = cats.find(cat => cat.id === encounter.catId)?.name ?? 'michi';
      return <Marker key={encounter.id} id={encounter.id} lngLat={[encounter.point.longitude, encounter.point.latitude]} onPress={() => onEncounter(encounter.catId)} accessibilityRole="button" accessibilityLabel={`Ver ficha de ${catName}`}><View style={styles.catPhotoMarker}><Image source={{ uri: encounter.photoUri }} resizeMode="cover" style={styles.catPhoto} accessible={false} /></View></Marker>;
    })}
  </Map><View pointerEvents="box-none" style={styles.zoomControls}>
    <Pressable accessibilityRole="button" accessibilityLabel="Acercar el mapa" onPress={() => camera.current?.zoomTo(Math.min(19, zoom + 1), { duration: 180 })} style={styles.zoomButton}><Text style={styles.zoomLabel}>＋</Text></Pressable>
    <Pressable accessibilityRole="button" accessibilityLabel="Alejar el mapa" onPress={() => camera.current?.zoomTo(Math.max(2, zoom - 1), { duration: 180 })} style={styles.zoomButton}><Text style={styles.zoomLabel}>−</Text></Pressable>
  </View>{error && <Text style={styles.error}>No pudimos cargar el mapa. Revisá la conexión; podés ingresar coordenadas manuales.</Text>}</View>;
}
const styles = StyleSheet.create({ me: { width: 18, height: 18, backgroundColor: '#4285ef', borderColor: 'white', borderWidth: 3, borderRadius: 10 }, catPhotoMarker: { width: 48, height: 48, padding: 2, borderRadius: 24, borderWidth: 2, borderColor: 'white', backgroundColor: 'white', overflow: 'hidden', elevation: 5, shadowColor: '#143226', shadowOpacity: 0.3, shadowRadius: 5, shadowOffset: { width: 0, height: 2 } }, catPhoto: { width: '100%', height: '100%', borderRadius: 20 }, pin: { fontSize: 26 }, zoomControls: { position: 'absolute', right: 14, bottom: 95, gap: 8 }, zoomButton: { width: 44, height: 44, borderRadius: 14, backgroundColor: '#ffffffed', alignItems: 'center', justifyContent: 'center', elevation: 3 }, zoomLabel: { color: '#245b49', fontSize: 24, fontWeight: '600', lineHeight: 28 }, error: { position: 'absolute', top: 10, left: 10, right: 10, backgroundColor: '#fff5d8', padding: 12, borderRadius: 10 } });
