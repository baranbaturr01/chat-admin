# Chat App - Admin Panel

## Proje Açıklaması
Chat uygulamasının yönetim paneli. Kullanıcılar, mesajlar, raporlar ve sistem ayarlarını yönetmek için kullanılır.

## Teknoloji Stack
- React 18+ (Vite)
- TypeScript
- Ant Design veya Shadcn/UI (UI Framework)
- React Router 6.x
- Zustand (state management)
- TanStack Query (server state)
- TanStack Table (data tables)
- Axios (HTTP client)
- Recharts (grafikler ve istatistikler)
- React Hook Form + Zod (form validation)

## Mimari Kurallar
- **Feature-based folder structure**:
  ```
  src/
  ├── features/
  │   ├── dashboard/
  │   ├── users/
  │   ├── messages/
  │   ├── reports/
  │   └── settings/
  ├── shared/
  │   ├── components/
  │   ├── hooks/
  │   ├── services/
  │   ├── utils/
  │   └── types/
  ├── layouts/
  └── routes/
  ```
- Role-based access control (RBAC) frontend tarafında
- Tüm API çağrıları merkezi service layer'da
- Reusable table components
- TypeScript strict mode

## Özellikler
- Dashboard: Aktif kullanıcılar, mesaj istatistikleri, grafikler
- Kullanıcı yönetimi: Liste, detay, ban/unban, rol atama
- Mesaj yönetimi: Raporlanan mesajlar, içerik moderasyonu
- Sistem ayarları: Uygulama yapılandırması
- Audit log: Admin işlem geçmişi

## UI Kuralları
- Sidebar navigation layout
- Responsive (desktop-first)
- Breadcrumb navigation
- Toast notifications
- Confirmation dialogs for destructive actions
