import { useEffect, useRef, useState } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { Map, Camera, Marker, GeoJSONSource, Layer, type CameraRef } from '@maplibre/maplibre-react-native';
import { accuracyArea } from '../domain/accuracy';
import { mapStyle, type MapProps } from './EncounterMap.types';
export default function EncounterMap({ point, follow, encounters, selected, onPan, onPick, onEncounter }: MapProps) {
  const camera = useRef<CameraRef>(null);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  useEffect(() => { if (loaded && follow && point) camera.current?.easeTo({ center: [point.longitude, point.latitude], zoom: 16, duration: 500 }); }, [point, follow, loaded]);
  return <View style={{ flex: 1 }}><Map style={{ flex: 1 }} mapStyle={mapStyle}
    onDidFinishLoadingMap={() => { setLoaded(true); setError(false); }} onDidFailLoadingMap={() => setError(true)}
    onRegionWillChange={event => { if (event.nativeEvent.userInteraction) onPan(); }}
    onPress={event => { const [longitude, latitude] = event.nativeEvent.lngLat; onPick?.({ longitude, latitude, accuracy: null, source: 'manual', timestamp: Date.now() }); }}>
    <Camera ref={camera} initialViewState={{ center: [-58.3816, -34.6037], zoom: 12 }} />
    {point && point.accuracy !== null && <GeoJSONSource id="accuracy" data={accuracyArea(point)}><Layer id="accuracy-fill" type="fill" paint={{ "fill-color": "#4285ef", "fill-opacity": 0.15 }} /><Layer id="accuracy-line" type="line" paint={{ "line-color": "#4285ef", "line-opacity": 0.35, "line-width": 1 }} /></GeoJSONSource>}
    {point && <Marker id="me" lngLat={[point.longitude, point.latitude]}><View style={styles.me} /></Marker>}
    {selected && <Marker id="draft" lngLat={[selected.longitude, selected.latitude]}><Text style={styles.pin}>📍</Text></Marker>}
    {encounters.map(encounter => <Marker key={encounter.id} id={encounter.id} lngLat={[encounter.point.longitude, encounter.point.latitude]} onPress={() => onEncounter(encounter.catId)}><Text style={styles.pin}>🐈</Text></Marker>)}
  </Map>{error && <Text style={styles.error}>No pudimos cargar el mapa. Revisá la conexión; podés ingresar coordenadas manuales.</Text>}</View>;
}
const styles = StyleSheet.create({ me: { width: 18, height: 18, backgroundColor: '#4285ef', borderColor: 'white', borderWidth: 3, borderRadius: 10 }, pin: { fontSize: 26 }, error: { position: 'absolute', top: 10, left: 10, right: 10, backgroundColor: '#fff5d8', padding: 12, borderRadius: 10 } });
