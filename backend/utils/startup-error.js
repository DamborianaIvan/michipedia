export function describeStartupError(error) {
  if (error?.name === 'Error' && /^(Falta configurar|JWT_SECRET|CORS_ORIGINS|TRUST_PROXY_HOPS)/.test(error.message || '')) {
    return `Configuración incompleta: ${error.message}`;
  }
  const nestedServerErrors = error?.reason?.servers instanceof Map
    ? [...error.reason.servers.values()].map(server => server.error).filter(Boolean)
    : [];
  const errors = [error, ...nestedServerErrors];
  if (errors.some(item => item?.code === 18 || item?.code === 8000 || item?.codeName === 'AuthenticationFailed' || item?.codeName === 'AtlasError')) {
    return 'MongoDB rechazó la autenticación. Revisá el usuario y la contraseña de base de datos en backend/.env; no son las credenciales del login de la app.';
  }
  if (error?.name === 'MongoParseError') {
    return 'La URI de MongoDB no tiene un formato válido. Revisá MONGODB_URI y escapá caracteres especiales de la contraseña.';
  }
  if (error?.name === 'MongooseServerSelectionError' || error?.name === 'MongoNetworkError' || ['ENOTFOUND', 'ETIMEDOUT', 'ECONNREFUSED'].includes(error?.code)) {
    return 'No se pudo alcanzar MongoDB Atlas. Revisá MONGODB_URI, que el clúster esté activo y que tu IP esté habilitada en Network Access.';
  }
  return `No se pudo iniciar la API por un error de MongoDB (${error?.name || 'desconocido'}). Revisá backend/.env y la configuración de Atlas.`;
}
