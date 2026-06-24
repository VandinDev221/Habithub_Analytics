# Gerar APK Android — Habithub Analytics

O app Android é um **shell Capacitor** que abre o site em produção (`https://habithub-analytics.vercel.app`). Login, hábitos e IA funcionam igual ao navegador — é preciso **internet**.

## Pré-requisitos (Windows)

1. **Node.js 18+**
2. **Android Studio** — [developer.android.com/studio](https://developer.android.com/studio)
   - Na instalação, marque **Android SDK**, **SDK Platform** e **SDK Build-Tools**
3. Variável de ambiente (opcional, o Android Studio configura):
   - `ANDROID_HOME` = `C:\Users\SEU_USUARIO\AppData\Local\Android\Sdk`

## Gerar APK pelo GitHub (sem Android Studio)

1. Faça push do código para `main` (pasta `mobile/`).
2. No GitHub: **Actions** → workflow **Build Android APK** → **Run workflow**.
3. Quando terminar, abra o run → em **Artifacts** baixe `habithub-analytics-debug-apk`.
4. Transfira o `.apk` para o celular e instale.

---

## Passo a passo

### 1. Instalar dependências

```powershell
cd mobile
npm install
npx cap add android
npx cap sync android
```

> Se `android/` já existir no repo, pule `cap add android` e use só `npm install` + `npx cap sync android`.

### 2. Abrir no Android Studio (recomendado)

```powershell
npm run open
```

No Android Studio:

1. Aguarde o **Gradle Sync** terminar
2. **Build → Build Bundle(s) / APK(s) → Build APK(s)**
3. Quando concluir, clique em **locate** — o APK estará em:
   ```
   mobile/android/app/build/outputs/apk/debug/app-debug.apk
   ```

### 3. Ou gerar APK pelo terminal

```powershell
cd mobile
npm run build:debug
```

APK de debug: `mobile/android/app/build/outputs/apk/debug/app-debug.apk`

### 4. Instalar no celular

- Copie o `app-debug.apk` para o Android
- Ative **Fontes desconhecidas** / permita instalação do arquivo
- Toque no APK para instalar

Ou, com celular em **USB debugging**:

```powershell
cd mobile/android
.\gradlew.bat installDebug
```

---

## APK para publicar (Google Play)

1. Gere um **keystore** (uma vez):

```powershell
keytool -genkey -v -keystore habithub-release.keystore -alias habithub -keyalg RSA -keysize 2048 -validity 10000
```

2. Crie `mobile/android/keystore.properties` (não commitar):

```properties
storeFile=../habithub-release.keystore
storePassword=SUA_SENHA
keyAlias=habithub
keyPassword=SUA_SENHA
```

3. Configure signing em `android/app/build.gradle` (Android Studio: Build → Generate Signed Bundle/APK).

4. Build release:

```powershell
cd mobile/android
.\gradlew.bat assembleRelease
```

Saída: `app/build/outputs/apk/release/app-release.apk` (ou AAB para Play Store).

---

## Configuração

| Arquivo | O que alterar |
|---------|----------------|
| `mobile/capacitor.config.ts` | `server.url` se mudar o domínio na Vercel |
| `appId` | `com.habithub.analytics` — identificador na Play Store |

---

## Login Google/GitHub no APK

O app usa WebView. **Google** pode bloquear login OAuth dentro de WebView. Se falhar:

- Use **email/senha**, ou
- Abra o site no Chrome do celular para vincular conta

---

## Atualizar o app

Como o APK carrega o site na Vercel, **não precisa gerar novo APK** para mudanças de UI/lógica web — basta deploy na Vercel.

Novo APK só se mudar:

- `appId`, nome do app, ícone, splash
- URL em `capacitor.config.ts`
- plugins nativos Capacitor

---

## Estrutura

```
mobile/
├── capacitor.config.ts   # URL do app + plugins
├── www/index.html        # tela de loading (fallback offline)
├── package.json
└── android/              # projeto Android (após cap add android)
```
