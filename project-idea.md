İstediğiniz siteyi adım adım tasarım olarak ve kullanılacak programlama dilleriyle maddeler halinde şöyle yazabiliriz:

### 1. **Frontend (Kullanıcı Arayüzü)**
   - **Görsel Arayüz:**
     - Kullanıcılar seçtikleri coin'in mum grafiğini ve RSI değerini görebilmeli.
     - Coin seçimi için bir dropdown (seçim menüsü) ekleyin.
     - RSI değerlerine göre sinyalleri gösteren uyarılar yer almalı.
     - Mum grafiği ve RSI grafiği yan yana veya üst üste olabilir.
   - **Grafikler:**
     - Coin mum verilerini gösteren candlestick grafik: `Chart.js` veya `react-chartjs-2` gibi kütüphaneler kullanılabilir.
     - RSI hesaplamasını gösteren line chart.
   - **Teknoloji:**
     - **Dil**: JavaScript
     - **Kütüphaneler**: React.js, `react-chartjs-2` (grafikler için)
     - **Stil**: CSS veya SCSS
     - **API Çağrıları**: `axios` veya `fetch` ile Binance API'den veri alınması.

### 2. **Backend (Veri İşleme ve API Bağlantısı)**
   - **Binance API Entegrasyonu:**
     - Binance API üzerinden mum verilerini almak için gerekli HTTP istekleri yapılacak.
     - Bu veriler sunucu tarafından alınıp frontend’e gönderilecek.
     - Gerçek zamanlı veriler için WebSocket bağlantısı kurulmalı.
   - **RSI Hesaplaması:**
     - Coin kapanış fiyatlarını alarak RSI hesaplaması yapılmalı.
     - Her bir hesaplamada belirlenen eşiğe göre (örneğin RSI 70’in üzerindeyse satış sinyali) sinyaller üretilmeli.
   - **Teknoloji:**
     - **Dil**: JavaScript veya TypeScript
     - **Framework**: Node.js + Express.js
     - **API Bağlantısı**: Binance API kullanarak HTTP ve WebSocket çağrıları yapılmalı.

### 3. **Gerçek Zamanlı Veri Güncelleme**
   - **WebSocket Bağlantısı:**
     - Kullanıcıya coin fiyatlarını anlık olarak göstermek için Binance WebSocket API kullanılmalı.
     - WebSocket ile anlık fiyat güncellemeleri alındığında mum ve RSI hesaplamaları sürekli güncellenmeli.
   - **Teknoloji:**
     - **Dil**: JavaScript
     - **Kütüphane**: WebSocket (ya da `socket.io`)

### 4. **Alarm ve Bildirim Sistemi**
   - **RSI Sinyal Üretimi:**
     - Belirlenen RSI değeri (örneğin 70 üzerinde ya da 30 altında) aşıldığında kullanıcıya görsel veya sesli uyarı gösterilmeli.
     - Alarm eklemek için kullanıcıya bir "alarm ekle" butonu konulabilir.
   - **Teknoloji:**
     - **Dil**: JavaScript
     - **Bildirimler**: React.js içinde `toast` gibi kütüphaneler ile bildirimler yapılabilir.
     - **Veri İşleme**: Backend’deki RSI hesaplamaları frontend’e iletilecek.

### 5. **Veritabanı (Opsiyonel)**
   - Eğer kullanıcıların alarm ayarları kaydedilecekse bir veritabanı kullanılmalı.
   - Kullanıcıların geçmiş sinyal verileri ve alarm ayarları saklanabilir.
   - **Teknoloji:**
     - **Dil**: SQL veya NoSQL (MongoDB)
     - **Sunucu**: Node.js

### 6. **Genel Teknoloji ve Diller**
   - **Frontend**: React.js (JavaScript) ve Chart.js (`react-chartjs-2`), CSS
   - **Backend**: Node.js + Express.js (JavaScript/TypeScript)
   - **API**: Binance API (HTTP + WebSocket)
   - **Veritabanı** (Opsiyonel): MongoDB (NoSQL) veya PostgreSQL (SQL)

### 7. **Dağıtım ve Hosting**
   - **Sunucu**: Heroku, Vercel veya AWS gibi bulut platformlarında dağıtım yapılabilir.
   - **Gerçek Zamanlı Veri**: Sunucu üzerinden gerçek zamanlı veri sağlayacak WebSocket servisi çalışmalı.

Bu yapıyla, kullanıcıların Binance API üzerinden mum verilerini alıp, RSI hesaplamaları yaparak sinyal veren bir site oluşturabilirsiniz.