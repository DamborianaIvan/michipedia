import Animated, { FadeInDown, LinearTransition } from 'react-native-reanimated';
import { PlayfulPressable, CuriousCat } from './PlayfulMotion';
import { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, View, ScrollView } from 'react-native';
import { login, register } from '../auth/api';
import type { AuthMode, Session } from '../auth/types';

const green = '#245b49';

export function AuthScreen({ onAuthenticated }: { onAuthenticated: (session: Session) => Promise<void> | void }) {
  const [mode, setMode] = useState<AuthMode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  const submit = async () => {
    if (busy) return;
    if (!email.trim() || !password || (mode === 'register' && name.trim().length < 2)) {
      setMessage('Completá tu correo, contraseña y, al crear una cuenta, tu nombre.');
      return;
    }
    setMessage('');
    setBusy(true);
    try {
      const session = mode === 'register'
        ? await register(name.trim(), email.trim(), password)
        : await login(email.trim(), password);
      await onAuthenticated(session);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'No se pudo iniciar sesión.');
    } finally { setBusy(false); }
  };

  return <KeyboardAvoidingView style={s.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
    <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }} keyboardShouldPersistTaps="handled"><Animated.View entering={FadeInDown.duration(550)} layout={LinearTransition.duration(220)} style={s.card}>
      <CuriousCat />
      <Text style={s.logo}>♧ michipedia</Text>
      <Text style={s.eyebrow}>CADA MICHI, UNA HISTORIA</Text>
      <Animated.Text key={mode} entering={FadeInDown.duration(320)} style={s.title}>{mode === 'login' ? 'Qué bueno verte.' : 'Sumate a la aventura.'}</Animated.Text>
      <Text style={s.subtitle}>{mode === 'login' ? 'Iniciá sesión para entrar a tu Gatopedia.' : 'Creá tu cuenta y empezá a descubrir michis.'}</Text>
      <View style={s.tabs}>
        <PlayfulPressable disabled={busy} onPress={() => { setMode('login'); setMessage(''); setPassword(''); }} style={[s.tab, mode === 'login' && s.activeTab]}><Text style={[s.tabText, mode === 'login' && s.activeTabText]}>Iniciar sesión</Text></PlayfulPressable>
        <PlayfulPressable disabled={busy} onPress={() => { setMode('register'); setMessage(''); setPassword(''); }} style={[s.tab, mode === 'register' && s.activeTab]}><Text style={[s.tabText, mode === 'register' && s.activeTabText]}>Crear cuenta</Text></PlayfulPressable>
      </View>
      {mode === 'register' && <><Text style={s.label}>Tu nombre</Text><TextInput accessibilityLabel="Tu nombre" style={s.input} autoComplete="name" autoCapitalize="words" maxLength={80} value={name} onChangeText={setName} placeholder="¿Cómo te llamás?" /></>}
      <Text style={s.label}>Correo electrónico</Text>
      <TextInput accessibilityLabel="Correo electrónico" style={s.input} autoComplete="email" autoCapitalize="none" keyboardType="email-address" textContentType="emailAddress" maxLength={254} editable={!busy} value={email} onChangeText={setEmail} placeholder="tu@email.com" />
      <Text style={s.label}>Contraseña</Text>
      <TextInput accessibilityLabel="Contraseña" style={s.input} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} textContentType={mode === 'login' ? 'password' : 'newPassword'} secureTextEntry editable={!busy} value={password} onChangeText={setPassword} placeholder={mode === 'register' ? 'Al menos 8 caracteres' : 'Tu contraseña'} onSubmitEditing={() => void submit()} />
      {!!message && <Text accessibilityRole="alert" style={s.error}>{message}</Text>}
      <PlayfulPressable accessibilityRole="button" disabled={busy} onPress={() => void submit()} style={({ pressed }) => [s.button, (busy || pressed) && { opacity: .65 }]}>{busy ? <ActivityIndicator color="white" /> : <Text style={s.buttonText}>{mode === 'login' ? 'Entrar a mi Gatopedia' : 'Crear mi cuenta'}</Text>}</PlayfulPressable>
      <Text style={s.foot}>Tu colección actual seguirá en este dispositivo por ahora.</Text>
    </Animated.View></ScrollView>
  </KeyboardAvoidingView>;
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f7f8f2', justifyContent: 'center', padding: 20 },
  card: { width: '100%', maxWidth: 440, alignSelf: 'center', backgroundColor: '#fffefa', borderRadius: 26, padding: 26, gap: 12, borderWidth: 1, borderColor: '#e0e7d8' },
  logo: { color: green, fontSize: 28, fontWeight: '800', letterSpacing: -1 },
  eyebrow: { color: '#6f865c', fontSize: 9, fontWeight: '700', letterSpacing: 1.6 },
  title: { color: green, fontWeight: '800', fontSize: 29, letterSpacing: -1, marginTop: 5 },
  subtitle: { color: '#71806a', fontSize: 14, lineHeight: 21, marginBottom: 5 },
  tabs: { flexDirection: 'row', backgroundColor: '#eef2e8', borderRadius: 14, padding: 4, marginVertical: 6 },
  tab: { flex: 1, borderRadius: 11, padding: 11, alignItems: 'center' },
  activeTab: { backgroundColor: 'white' },
  tabText: { color: '#71806a', fontSize: 12, fontWeight: '600' },
  activeTabText: { color: green },
  label: { color: green, fontSize: 12, fontWeight: '600', marginTop: 5 },
  input: { backgroundColor: 'white', padding: 14, borderWidth: 1, borderColor: '#d5dfce', borderRadius: 12, color: green, fontSize: 15 },
  error: { color: '#a34337', backgroundColor: '#fff0eb', borderRadius: 11, padding: 12, fontSize: 13, lineHeight: 18 },
  button: { borderRadius: 14, padding: 15, backgroundColor: green, alignItems: 'center', marginTop: 5, minHeight: 50, justifyContent: 'center' },
  buttonText: { color: 'white', fontWeight: '700', fontSize: 14 },
  foot: { color: '#84917b', fontSize: 11, textAlign: 'center', lineHeight: 17, marginTop: 5 },
});
