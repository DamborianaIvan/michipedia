import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Image, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as ImagePicker from 'expo-image-picker';
import * as Crypto from 'expo-crypto';
import EncounterMap from './src/components/EncounterMap';
import { useLocation } from './src/hooks/useLocation';
import { addEncounter, emptyCollection, removeEncounter, validPoint, type Collection, type Point } from './src/domain/model';
import { deletePhoto, loadCollection, persistPhoto, saveCollection } from './src/services/storage';

type Tab = 'explore' | 'collection' | 'profile';
type Draft = { uri: string; at: string; point: Point | null };
const green = '#245b49';
function Button({ label, onPress, primary = false, disabled = false }: { label: string; onPress: () => void; primary?: boolean; disabled?: boolean }) {
  return <Pressable accessibilityRole="button" accessibilityState={{ disabled }} disabled={disabled} onPress={onPress} style={({ pressed }) => [s.button, primary && s.primary, (pressed || disabled) && { opacity: .6 }]}><Text style={[s.buttonText, primary && { color: 'white' }]}>{label}</Text></Pressable>;
}
export default function App() { return <SafeAreaProvider><Michipedia /></SafeAreaProvider>; }
function Michipedia() {
  const [tab, setTab] = useState<Tab>('explore');
  const [collection, setCollection] = useState<Collection>(emptyCollection);
  const [ready, setReady] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [notice, setNotice] = useState('');
  const [capture, setCapture] = useState(false);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [name, setName] = useState('');
  const [existing, setExisting] = useState<string | null>(null);
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [manual, setManual] = useState(false);
  const [busy, setBusy] = useState(false);
  const [saving, setSaving] = useState(false);
  const [picking, setPicking] = useState(false);
  const [follow, setFollow] = useState(true);
  const [selectedCat, setSelectedCat] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);
  const { point, status, start } = useLocation();
  const pointRef = useRef(point); pointRef.current = point;
  const locked = useRef(false);
  const selectedPoint = draft?.point ?? null;
  const cat = collection.cats.find(c => c.id === selectedCat);
  useEffect(() => { void loadCollection().then(data => { setCollection(data); setReady(true); }).catch(() => { setLoadError(true); setNotice('No pudimos abrir la colección. Reiniciá la app; no sobrescribiremos tus datos.'); }); }, []);
  useEffect(() => { if (!notice) return; const timer = setTimeout(() => setNotice(''), 6000); return () => clearTimeout(timer); }, [notice]);
  const beginCapture = () => { setDraft(null); setName(''); setExisting(null); setLatitude(''); setLongitude(''); setManual(false); setPicking(false); setCapture(true); };
  const choosePhoto = async (camera: boolean) => {
    if (busy) return;
    setBusy(true);
    try {
      if (camera && Platform.OS !== 'web') {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) { setNotice('Cámara sin permiso. Podés elegir una foto de la galería.'); return; }
      }
      // Congelar punto antes de abrir la cámara: no utilizar el GPS de minutos después.
      const location = pointRef.current && Date.now() - pointRef.current.timestamp < 30000 ? { ...pointRef.current } : null;
      const at = new Date().toISOString();
      const options: ImagePicker.ImagePickerOptions = { mediaTypes: ['images'], quality: .8, allowsEditing: false, base64: false };
      const result = camera ? await ImagePicker.launchCameraAsync(options) : await ImagePicker.launchImageLibraryAsync(options);
      if (result.canceled) return;
      const chosenPoint = manual ? selectedPoint : location;
      setDraft({ uri: result.assets[0].uri, at, point: chosenPoint });
      setLatitude(chosenPoint ? String(chosenPoint.latitude) : ''); setLongitude(chosenPoint ? String(chosenPoint.longitude) : '');
      if (!chosenPoint) setNotice('Foto lista. Elegí dónde fue el encuentro antes de guardar.');
    } catch { setNotice('No pudimos abrir la cámara o leer la foto. Probá con la galería.'); } finally { setBusy(false); }
  };
  const save = async () => {
    if (locked.current || !draft || !ready) return;
    if (!validPoint(latitude, longitude)) { setNotice('Ingresá una latitud y longitud válidas o elegí el punto en el mapa.'); return; }
    locked.current = true; setSaving(true);
    let savedUri: string | null = null;
    try {
      const id = Crypto.randomUUID();
      savedUri = await persistPhoto(draft.uri, id);
      const encounter = { id, catId: existing || Crypto.randomUUID(), photoUri: savedUri, capturedAt: draft.at,
        point: { latitude: Number(latitude), longitude: Number(longitude), accuracy: manual ? null : draft.point?.accuracy ?? null, source: manual ? 'manual' as const : draft.point?.source ?? 'manual' as const, timestamp: draft.point?.timestamp ?? Date.now() } };
      const next = addEncounter(collection, encounter, name, existing);
      await saveCollection(next); setCollection(next); setCapture(false); setDraft(null); setTab('collection'); setNotice('¡Encuentro guardado! Un nuevo recuerdo en tu Gatopedia.');
    } catch {
      if (savedUri) await deletePhoto(savedUri).catch(() => {});
      setNotice('No se pudo guardar. Conservamos tu foto para que puedas reintentar.');
    } finally { locked.current = false; setSaving(false); }
  };
  const remove = async () => {
    if (!pendingDelete || locked.current) return;
    locked.current = true; setSaving(true);
    try {
      const encounter = collection.encounters.find(e => e.id === pendingDelete);
      const next = removeEncounter(collection, pendingDelete);
      await saveCollection(next); setCollection(next); setPendingDelete(null);
      if (!next.cats.some(c => c.id === selectedCat)) setSelectedCat(null);
      if (encounter) await deletePhoto(encounter.photoUri).catch(() => setNotice('Encuentro eliminado; quedó un archivo local pendiente de limpiar.'));
    } catch { setNotice('No se pudo eliminar. Tus datos siguen guardados.'); } finally { locked.current = false; setSaving(false); }
  };
  return <SafeAreaView style={s.root} edges={['top', 'bottom']}><StatusBar style="dark" />
    <View style={s.header}><View><Text style={s.brand}>♧ michipedia</Text><Text style={s.tagline}>CADA MICHI, UNA HISTORIA</Text></View><Text style={s.badge}>ALFA · LOCAL</Text></View>
    {tab === 'explore' && <View style={s.explore}>
      <View style={s.intro}><Text style={s.eyebrow}>TU PRÓXIMA HISTORIA ESTÁ CERCA</Text><Text style={s.title}>Salí a conocer el barrio.{ '\n' }<Text style={s.accent}>Y sus michis.</Text></Text><Text style={s.subtitle}>Una foto, un encuentro, un nuevo amigo.</Text><Text style={s.counter}>{collection.cats.length} michis descubiertos  ·  {collection.encounters.length} encuentros</Text></View>
      <View style={s.mapShell}><EncounterMap point={point} follow={follow} encounters={collection.encounters} selected={selectedPoint} onPan={() => setFollow(false)} onEncounter={setSelectedCat} onPick={picking ? chosen => { setDraft(old => old ? { ...old, point: chosen } : old); setLatitude(String(chosen.latitude)); setLongitude(String(chosen.longitude)); setManual(true); setPicking(false); setCapture(true); } : undefined} />
        <View style={s.mapTop}><Text style={s.gps}>{status}</Text><Button label="◎ Seguir mi ubicación" onPress={() => { setFollow(true); void start(); }} /></View>
        <View style={s.mapBottom}>{picking ? <View style={s.pickHint}><Text style={s.body}>Tocá el mapa en el punto del encuentro.</Text><Button label="Volver a la foto" onPress={() => { setPicking(false); setCapture(true); }} /></View> : <Button label="＋ Capturar michi" primary disabled={!ready} onPress={beginCapture} />}</View>
      </View><Text style={s.note}>Capturar es fotografiar. Dejá que el michi siga su camino.</Text>
    </View>}
    {tab === 'collection' && <ScrollView contentContainerStyle={s.page}><Text style={s.eyebrow}>PEQUEÑOS ENCUENTROS, GRANDES HISTORIAS</Text><Text style={s.title}>Tu Gatopedia.</Text><Text style={s.subtitle}>{collection.cats.length} michis · {collection.encounters.length} encuentros</Text>
      {!ready ? <Text style={s.body}>{loadError ? 'Colección no disponible. Reiniciá para reintentar.' : 'Abriendo tu colección…'}</Text> : !collection.cats.length ? <View style={s.empty}><Text style={s.bigCat}>🐈</Text><Text style={s.sectionTitle}>Tu primer michi te espera</Text><Text style={s.body}>Guardá una foto para empezar tu álbum.</Text><Button label="Capturar mi primer michi" primary onPress={beginCapture} /></View> : <View style={s.grid}>{collection.cats.map(item => { const meets = collection.encounters.filter(e => e.catId === item.id); return <Pressable accessibilityRole="button" accessibilityLabel={`Ver ${item.name}`} key={item.id} style={s.card} onPress={() => setSelectedCat(item.id)}><Image source={{ uri: meets[meets.length - 1].photoUri }} style={s.cardPhoto} /><View style={s.cardBody}><Text style={s.eyebrow}>MICHI #{String(item.number).padStart(3, '0')}</Text><Text style={s.sectionTitle}>{item.name}</Text><Text style={s.body}>{meets.length} encuentro{meets.length === 1 ? '' : 's'}</Text></View></Pressable>; })}</View>}
    </ScrollView>}
    {tab === 'profile' && <ScrollView contentContainerStyle={s.page}><Text style={s.eyebrow}>TU AVENTURA</Text><Text style={s.title}>De a un michi.</Text><View style={s.info}><Text style={s.sectionTitle}>Primera expedición</Text><Text style={s.body}>Esta alfa guarda tu colección en este dispositivo. Todavía no hay cuenta ni sincronización. Desinstalar la app o borrar los datos del navegador puede eliminar tus encuentros.</Text><Text style={s.sectionTitle}>Caminar, mirar, descubrir</Text><Text style={s.body}>Activá la ubicación con la app abierta. Al mover el mapa se pausa el centrado; podés volver con “Seguir mi ubicación”. No almacenamos tu caminata.</Text><Text style={s.sectionTitle}>Mapa de prueba</Text><Text style={s.body}>Usamos cartografía de demostración. El proveedor con detalle de calles se configurará antes de la beta.</Text></View></ScrollView>}
    <View style={s.navigation}>{([['explore', '◎', 'Explorar'], ['collection', '▧', 'Gatopedia'], ['profile', '♧', 'Mi aventura']] as const).map(([id, icon, label]) => <Pressable accessibilityRole="tab" accessibilityState={{ selected: tab === id }} key={id} onPress={() => { if (picking) { setPicking(false); setCapture(true); } setTab(id); }} style={[s.navButton, tab === id && s.navSelected]}><Text style={s.navIcon}>{icon}</Text><Text style={s.navLabel}>{label}</Text></Pressable>)}</View>
    <Modal visible={capture} animationType="slide" onRequestClose={() => { if (!busy && !saving) setCapture(false); }}><SafeAreaView style={s.root}><KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}><ScrollView contentContainerStyle={s.form} keyboardShouldPersistTaps="handled"><View style={s.dialogHeader}><View><Text style={s.eyebrow}>UN NUEVO ENCUENTRO</Text><Text style={s.title}>¡Hola, michi!</Text></View><Button label="✕ Cerrar" disabled={busy || saving} onPress={() => setCapture(false)} /></View>
      <View style={s.photoBox}>{draft ? <Image source={{ uri: draft.uri }} resizeMode="contain" style={{ width: '100%', height: '100%' }} /> : <><Text style={s.bigCat}>📸</Text><Text style={s.body}>Acercate sin asustarlo</Text></>}</View>
      <View style={s.row}><Button label="Tomar foto" disabled={busy || saving} onPress={() => void choosePhoto(true)} /><Button label="Elegir foto" disabled={busy || saving} onPress={() => void choosePhoto(false)} /></View>{busy && <ActivityIndicator color={green} />}
      <Text style={s.label}>¿Ya lo conocés?</Text><ScrollView horizontal contentContainerStyle={s.row}><Button label="Michi nuevo" primary={!existing} onPress={() => setExisting(null)} />{collection.cats.map(c => <Button key={c.id} label={c.name} primary={existing === c.id} onPress={() => setExisting(c.id)} />)}</ScrollView>
      {!existing && <><Text style={s.label}>Nombre (opcional)</Text><TextInput accessibilityLabel="Nombre del michi" style={s.input} maxLength={60} placeholder="Por ejemplo, Don Bigotes" value={name} onChangeText={setName} /></>}
      <Text style={s.label}>¿Dónde lo encontraste?</Text><Text style={s.body}>{draft?.point?.source === 'gps' && !manual ? `Punto al abrir la cámara · precisión ±${Math.round(draft.point.accuracy ?? 0)} m. Revisalo si te moviste.` : 'Elegí un punto en el mapa o ingresá las coordenadas.'}</Text>
      <Text style={s.label}>Latitud</Text><TextInput accessibilityLabel="Latitud" style={s.input} value={latitude} placeholder="-34.6037" autoCapitalize="none" onChangeText={v => { setLatitude(v); setManual(true); }} />
      <Text style={s.label}>Longitud</Text><TextInput accessibilityLabel="Longitud" style={s.input} value={longitude} placeholder="-58.3816" autoCapitalize="none" onChangeText={v => { setLongitude(v); setManual(true); }} />
      <Button label="📍 Elegir punto en el mapa" disabled={!draft || busy || saving} onPress={() => { setCapture(false); setTab('explore'); setFollow(false); setPicking(true); }} />
      <Button label={saving ? 'Guardando…' : 'Guardar encuentro ♡'} primary disabled={!draft || busy || saving || !ready} onPress={() => void save()} /><Text style={s.note}>Se guarda en este dispositivo durante la alfa.</Text>
    </ScrollView></KeyboardAvoidingView>{!!notice && <View pointerEvents="none" style={s.modalToast}><Text style={s.toastText}>{notice}</Text></View>}</SafeAreaView></Modal>
    <Modal visible={!!cat} animationType="slide" onRequestClose={() => { if (!saving) { setSelectedCat(null); setPendingDelete(null); } }}><SafeAreaView style={s.root}><ScrollView contentContainerStyle={s.form}><Button label="← Volver" disabled={saving} onPress={() => { setSelectedCat(null); setPendingDelete(null); }} /><Text style={s.title}>{cat?.name}</Text>{collection.encounters.filter(e => e.catId === cat?.id).slice().reverse().map(e => <View key={e.id} style={s.encounter}><Image source={{ uri: e.photoUri }} resizeMode="contain" style={s.detailPhoto} /><Text style={s.body}>{new Date(e.capturedAt).toLocaleString('es-AR')}</Text><Text style={s.body}>{e.point.latitude.toFixed(5)}, {e.point.longitude.toFixed(5)} · {e.point.source === 'gps' ? 'GPS' : 'Punto manual'}</Text>{pendingDelete === e.id ? <View><Text style={s.body}>¿Eliminar este encuentro? Si es el último, también se eliminará el michi.</Text><View style={s.row}><Button label="Eliminar" disabled={saving} onPress={() => void remove()} /><Button label="Conservar" disabled={saving} onPress={() => setPendingDelete(null)} /></View></View> : <Button label="Eliminar encuentro" disabled={saving} onPress={() => setPendingDelete(e.id)} />}</View>)}</ScrollView>{!!notice && <View pointerEvents="none" style={s.modalToast}><Text style={s.toastText}>{notice}</Text></View>}</SafeAreaView></Modal>
    {!!notice && <View style={[s.toast, (capture || !!cat) && { zIndex: 100 }]} accessibilityLiveRegion="polite"><Text style={s.toastText}>{notice}</Text></View>}

  </SafeAreaView>;
}
const s = StyleSheet.create({ root: { flex: 1, backgroundColor: '#f7f8f2' }, header: { paddingHorizontal: 24, paddingVertical: 15, borderBottomWidth: 1, borderColor: '#e0e7d8', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, brand: { color: green, fontSize: 25, fontWeight: '800', letterSpacing: -1 }, tagline: { color: '#6f865c', fontSize: 8, letterSpacing: 2, marginTop: 3 }, badge: { color: '#6f865c', fontSize: 9, borderWidth: 1, borderColor: '#d5dfca', padding: 8, borderRadius: 20 }, explore: { flex: 1, padding: 18, gap: 12, maxWidth: 1100, width: '100%', alignSelf: 'center' }, intro: { gap: 8 }, eyebrow: { color: '#66845e', fontSize: 9, fontWeight: '700', letterSpacing: 1.5 }, title: { color: green, fontWeight: '800', fontSize: 31, letterSpacing: -1, lineHeight: 38 }, accent: { color: '#6c9256' }, subtitle: { color: '#71806a', fontSize: 13 }, counter: { color: green, fontSize: 12, marginTop: 3 }, mapShell: { flex: 1, minHeight: 280, borderRadius: 22, overflow: 'hidden', borderWidth: 1, borderColor: '#d7e1d3', backgroundColor: '#e3eadc' }, mapTop: { position: 'absolute', top: 12, left: 12, gap: 7 }, gps: { fontSize: 10, padding: 9, backgroundColor: '#ffffffed', borderRadius: 10, color: green, maxWidth: 260 }, mapBottom: { position: 'absolute', bottom: 35, left: 14, right: 14 }, pickHint: { backgroundColor: '#fff', borderRadius: 14, padding: 14, gap: 10 }, note: { color: '#7e8b76', fontSize: 10, textAlign: 'center', lineHeight: 16 }, button: { borderRadius: 13, paddingVertical: 13, paddingHorizontal: 15, backgroundColor: 'white', borderWidth: 1, borderColor: '#d5dfce', alignItems: 'center' }, primary: { backgroundColor: green, borderColor: green }, buttonText: { color: green, fontSize: 13, fontWeight: '600' }, navigation: { flexDirection: 'row', marginHorizontal: 18, marginBottom: 8, padding: 7, borderWidth: 1, borderColor: '#e0e7d8', borderRadius: 22, backgroundColor: '#fffefa', gap: 7 }, navButton: { flex: 1, alignItems: 'center', padding: 8, borderRadius: 15, gap: 3 }, navSelected: { backgroundColor: '#dceba5' }, navIcon: { fontSize: 21, color: green }, navLabel: { fontSize: 11, color: green }, page: { padding: 24, gap: 14, maxWidth: 1000, width: '100%', alignSelf: 'center' }, info: { backgroundColor: 'white', padding: 24, borderRadius: 22, gap: 16 }, body: { color: '#6c7c70', fontSize: 13, lineHeight: 21 }, sectionTitle: { color: green, fontSize: 19, fontWeight: '700' }, empty: { padding: 35, borderWidth: 1, borderColor: '#cad7bd', borderStyle: 'dashed', borderRadius: 22, gap: 18, alignItems: 'center', marginTop: 20 }, bigCat: { fontSize: 40 }, grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 14 }, card: { width: '47%', maxWidth: 300, borderRadius: 20, overflow: 'hidden', backgroundColor: 'white' }, cardPhoto: { width: '100%', height: 190 }, cardBody: { padding: 14, gap: 8 }, form: { padding: 24, gap: 15, maxWidth: 650, width: '100%', alignSelf: 'center' }, dialogHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10 }, photoBox: { height: 240, borderRadius: 20, backgroundColor: '#eef2e4', borderWidth: 1, borderColor: '#cbd8bc', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }, row: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' }, label: { color: green, fontSize: 12, fontWeight: '600', marginTop: 6 }, input: { backgroundColor: 'white', padding: 13, borderWidth: 1, borderColor: '#d5dfce', borderRadius: 12, color: green, fontSize: 15 }, encounter: { borderTopWidth: 1, borderColor: '#d5dfce', paddingTop: 20, gap: 12 }, detailPhoto: { width: '100%', height: 300, borderRadius: 16 }, toast: { position: 'absolute', bottom: 95, left: 20, right: 20, borderRadius: 15, backgroundColor: green, padding: 15 }, toastText: { color: 'white', fontSize: 13, lineHeight: 19 }, modalToast: { position: 'absolute', bottom: 35, left: 20, right: 20, backgroundColor: green, padding: 15, borderRadius: 15 } });
