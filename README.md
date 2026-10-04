# RG Beauty — Prototipo Inventario

Este prototipo corresponde solo a Gestión de Inventario y Stock.

Tecnologías 4.4:
- React + Vite: frontend actual.
- Firebase Authentication: autenticación y seguridad de acceso.
- Firebase Firestore: base de datos NoSQL/no estructurada.
- Django: backend previsto para una etapa posterior.
- MySQL: por el momento no aplica.
- API REST: considerada para futuras integraciones, especialmente entre Ventas e Inventario.
- GitHub: repositorio/publicación.

4.5 Diseño y prototipado:
- Dashboard de inventario.
- Productos, entradas, salidas, ajustes e historial.
- Búsqueda y filtros.
- Diseño responsive.
- Autenticación Firebase.
- Persistencia Firestore.

IMPORTANTE: no se usa localStorage para guardar productos o movimientos.

## Configuración
1. Crea proyecto Firebase.
2. Registra aplicación Web.
3. Activa Authentication > Email/Password.
4. Crea Firestore.
5. Copia `.env.example` a `.env.local`.
6. Completa las variables Firebase.
7. Publica `firestore.rules`.

## Ejecutar
npm install
npm run dev

La arquitectura actual es:
React -> Firebase Authentication + Firestore

Evolución prevista:
React -> API REST Django -> servicios/base de datos definidos por el equipo.

MySQL queda fuera del prototipo actual.