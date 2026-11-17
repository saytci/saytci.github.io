/* SELF Beauty Space — логика страницы (цены, лазер, запись, языки, демо).
   3D-сцена (scene.js) только слушает события и присылает выбор зон обратно. */
(function () {
  "use strict";

  const CONFIG = {
    waSalon: "994516241063",   // запись в салон (WhatsApp), только цифры
    waLaser: "994506041063",   // запись на лазер (WhatsApp)
    waShop: "994516291063",    // магазин Self Beauty Shop (WhatsApp)
    demo: true                 // true — ничего не отправляется, только окно «это демо»
  };
  const fmtPhone = d => "+" + d.slice(0, 3) + " " + d.slice(3, 5) + " " + d.slice(5, 8) + " " + d.slice(8, 10) + " " + d.slice(10);
  const $ = id => document.getElementById(id);

  // ?no3d=1 — страница без 3D (проверка запасного варианта)
  try { if (new URLSearchParams(location.search).get("no3d") === "1") { window.__no3d = true; document.documentElement.classList.add("no3d"); } } catch (e) {}

  // Прайс салона (хайлайт «PRICE» в @self.beautyspace). p: [цена] или [от, до]; extra — доп. услуги
  const CATS = [
    { id: "mk", key: "cat.mk" },
    { id: "hr", key: "cat.hr" },
    { id: "tl", key: "cat.tl", note: "note.tl" }
  ];
  const SALON = [
    { id: "mk1", cat: "mk", p: [40], n: { az: "Göz makiyajı", ru: "Макияж глаз", en: "Eye makeup" } },
    { id: "mk2", cat: "mk", p: [70], n: { az: "Makiyaj", ru: "Макияж", en: "Makeup" } },
    { id: "mk3", cat: "mk", p: [90], n: { az: "Qrafik makiyaj", ru: "Графичный макияж", en: "Graphic makeup" },
      d: { az: "3D, ərəb, cat crease", ru: "3D, арабский, cat crease", en: "3D, arabic, cat crease" } },
    { id: "mk4", cat: "mk", p: [10], extra: true, n: { az: "Dekolte zonasının makiyajı", ru: "Макияж зоны декольте", en: "Neckline makeup" } },

    { id: "hr1", cat: "hr", p: [15, 20], n: { az: "Düz fen", ru: "Укладка феном (прямая)", en: "Straight blow-dry" } },
    { id: "hr2", cat: "hr", p: [25, 30], n: { az: "Həcmli fen", ru: "Объёмная укладка феном", en: "Airy blow-dry" } },
    { id: "hr3", cat: "hr", p: [25, 30], n: { az: "Diffuzorla fen", ru: "Укладка с диффузором", en: "Diffuser blow-out" } },
    { id: "hr4", cat: "hr", p: [40, 50], n: { az: "Buruqlar", ru: "Локоны", en: "Curls" } },
    { id: "hr5", cat: "hr", p: [50, 60], n: { az: "Hollivud buruqları", ru: "Голливудские локоны", en: "Hollywood curls" } },
    { id: "hr6", cat: "hr", p: [50, 70], n: { az: "Saç düzümü", ru: "Причёска", en: "Hairstyle" } },
    { id: "hr7", cat: "hr", p: [20], n: { az: "Hörüklər", ru: "Косы", en: "Braids" } },
    { id: "hr8", cat: "hr", p: [5, 30], extra: true, n: { az: "Saç aksesuarı", ru: "Аксессуар для волос", en: "Hair accessory" } },
    { id: "hr9", cat: "hr", p: [10], extra: true, n: { az: "Uzadılmış saçla iş", ru: "Работа с нарощенными волосами", en: "Working with extended hair" } },
    { id: "hr10", cat: "hr", p: [10], extra: true, n: { az: "Təbii saç əlavəsi", ru: "Добавление натуральных прядей", en: "Adding natural hair" } },

    { id: "tl1", cat: "tl", p: [200], n: { az: "Nişan, xına, kəbin üçün obraz", ru: "Образ на помолвку, хну, кябин", en: "Engagement, henna or marriage look" } },
    { id: "tl2", cat: "tl", p: [400], n: { az: "Gəlin obrazı", ru: "Образ невесты", en: "Bridal look" } }
  ];

  // Лазер (хайлайт «PRICE» в @self.laser, Candela GentleLase Pro — александрит)
  const ZGROUPS = [
    { id: "f", key: "zg.f" },
    { id: "b", key: "zg.b" },
    { id: "l", key: "zg.l" }
  ];
  const ZONES = [
    ["f", 5, "Dodaqüstü", "Над губой", "Upper lip"],
    ["f", 5, "Bakenbardlar", "Бакенбарды", "Sideburns"],
    ["f", 5, "Çənə", "Подбородок", "Chin"],
    ["f", 10, "Üz (tam)", "Лицо полностью", "Full face"],
    ["f", 5, "Boğaz", "Горло", "Throat"],
    ["f", 5, "Boyun", "Шея", "Neck"],
    ["f", 10, "Boyun (forma ilə)", "Шея (с оформлением)", "Neck (with shaping)"],
    ["b", 8, "Qoltuqaltı", "Подмышки", "Underarms"],
    ["b", 5, "Barmaqlar", "Пальцы", "Fingers"],
    ["b", 15, "Qollar (yarısı)", "Руки (половина)", "Half arms"],
    ["b", 20, "Qollar (tam)", "Руки полностью", "Full arms"],
    ["b", 5, "Döş giləsi ətrafı", "Ареолы", "Areolas"],
    ["b", 10, "Sinə", "Грудь", "Chest"],
    ["b", 5, "Göbək xətti", "Линия пупка", "Navel line"],
    ["b", 10, "Qarın", "Живот", "Belly"],
    ["b", 15, "Kürək", "Спина", "Back"],
    ["b", 10, "Bel", "Поясница", "Lower back"],
    ["l", 15, "Bikini (üst)", "Бикини (верх)", "Bikini (top)"],
    ["l", 20, "Dərin bikini", "Глубокое бикини", "Deep bikini", { az: "bikini + arxa zona", ru: "бикини + межъягодичная зона", en: "incl. between the buttocks" }],
    ["l", 15, "Yanbızlar", "Ягодицы", "Buttocks"],
    ["l", 20, "Ayaqlar (yarısı)", "Ноги (половина)", "Half legs"],
    ["l", 30, "Ayaqlar (tam)", "Ноги полностью", "Full legs"]
  ].map(([g, p, az, ru, en, d], i) => ({ id: "z" + i, g, p, n: { az, ru, en }, d }));

  // Зоны, которые перекрываются: выбрать можно только одну из пары (иначе одно место оплатят дважды)
  const EXCLUSIVE = [["z9", "z10"], ["z20", "z21"], ["z5", "z6"], ["z17", "z18"], ["z3", "z0"], ["z3", "z1"], ["z3", "z2"]];
  const BACK_ZONES = ["z5", "z6", "z15", "z16", "z19"];

  // Остальные услуги салона (цены пока не присланы — только названия)
  const MORE = ["br", "th", "hn", "nl", "pc", "sl", "cs"];

  const LANGS = ["az", "ru", "en"];
  const OG_LOCALES = { az: "az_AZ", ru: "ru_RU", en: "en_US" };
  const I18N = {
    "meta.title": { az: "Self Beauty Space — gözəllik məkanı, Bakı", ru: "Self Beauty Space — салон красоты в Баку", en: "Self Beauty Space — beauty salon in Baku" },
    "meta.desc": {
      az: "Makiyaj, saç, lazer epilyasiyası və kosmetika mağazası — Nizami 108A. Qiymətlər, lazer kalkulyatoru və WhatsApp ilə yazılış.",
      ru: "Макияж, волосы, лазерная эпиляция и магазин косметики — Низами 108A. Цены, калькулятор лазера и запись через WhatsApp.",
      en: "Makeup, hair, laser hair removal and a beauty shop at 108A Nizami St. Prices, a laser calculator and WhatsApp booking."
    },
    "skip": { az: "Qiymətlərə keç", ru: "К ценам", en: "Skip to prices" },
    "ribbon.text": {
      az: "Bu, nümunə saytdır: yazılış qəbul olunmur. Self üçün pulsuz hazırlanıb.",
      ru: "Это демо-сайт: запись через него не принимается. Бесплатно подготовлен для Self.",
      en: "This is a demo website: it does not take bookings. Made for Self for free."
    },
    "demo.ribbonAria": { az: "DEMO: bu nə deməkdir?", ru: "DEMO: что это значит?", en: "DEMO: what does this mean?" },
    "demo.title": { az: "Bu, demo-saytdır", ru: "Это демо-сайт", en: "This is a demo" },
    "demo.about": {
      az: "Bu, Self üçün pulsuz hazırlanmış nümunə saytdır. Yazılış və mesajlar göndərilmir — düymələr yalnız real saytda necə işləyəcəyini göstərir.",
      ru: "Это демо-сайт, бесплатно подготовленный для Self. Записи и сообщения не отправляются — кнопки только показывают, как всё будет работать на настоящем сайте.",
      en: "This is a demo website made for Self for free. No bookings or messages are sent; the buttons only show how the real site would work."
    },
    "demo.text": {
      az: "Heç nə göndərilmədi. Real saytda bu düymə yazılışı WhatsApp-a ({num}) belə bir mesajla göndərəcək:",
      ru: "Ничего не отправлено. На настоящем сайте эта кнопка отправит запись в WhatsApp ({num}) вот таким сообщением:",
      en: "Nothing was sent. On the real site this button would send the booking to WhatsApp ({num}) as a message like this:"
    },
    "demo.close": { az: "Bağla", ru: "Закрыть", en: "Close" },
    "nav.aria": { az: "Menyu", ru: "Навигация", en: "Navigation" },
    "nav.prices": { az: "Qiymətlər", ru: "Цены", en: "Prices" },
    "nav.laser": { az: "Lazer", ru: "Лазер", en: "Laser" },
    "nav.shop": { az: "Mağaza", ru: "Магазин", en: "Shop" },
    "nav.contact": { az: "Əlaqə", ru: "Контакты", en: "Contact" },
    "nav.book": { az: "Yazıl", ru: "Записаться", en: "Book" },
    "lang.label": { az: "Dil", ru: "Язык", en: "Language" },

    "hero.title": { az: "Gözəllik üçün bir ünvan", ru: "Красота по одному адресу", en: "Beauty at one address" },
    "hero.addr": { az: "Nizami 108A · Sahil", ru: "Низами 108A · Сахиль", en: "108A Nizami St · Sahil" },
    "fact.ratingV": { az: "4,9", ru: "4,9", en: "4.9" },

    "more.title": { az: "Salonda həm də", ru: "А ещё в салоне", en: "Also at the salon" },
    "tile.br.t": { az: "Qaş və kirpiklər", ru: "Брови и ресницы", en: "Brows & lashes" },
    "tile.br.d": { az: "Qaşlara forma və kirpiklərə qulluq", ru: "Форма бровей и уход за ресницами", en: "Brow shaping and lash care" },
    "tile.th.t": { az: "Sapla təmizləmə", ru: "Тридинг", en: "Threading" },
    "tile.th.d": { az: "Üz tüklərinin sapla təmizlənməsi", ru: "Удаление волосков на лице нитью", en: "Facial hair removal with thread" },
    "tile.hn.t": { az: "Xına ilə rəsm", ru: "Рисунок хной", en: "Henna art" },
    "tile.hn.d": { az: "Xına naxışları", ru: "Узоры хной", en: "Henna patterns" },
    "tile.nl.t": { az: "Dırnaqlar", ru: "Ногти", en: "Nails" },
    "tile.nl.d": { az: "Manikür, fransız manikürü və dizayn", ru: "Маникюр, френч и дизайн", en: "Manicure, French tips and nail art" },
    "tile.pc.t": { az: "Pirsinq", ru: "Пирсинг", en: "Piercing" },
    "tile.pc.d": { az: "Qulaq və göbək pirsinqi", ru: "Пирсинг ушей и пупка", en: "Ear and belly piercing" },
    "tile.sl.t": { az: "Solaryum", ru: "Солярий", en: "Solarium" },
    "tile.sl.d": { az: "Solaryum seansları", ru: "Сеансы солярия", en: "Tanning sessions" },
    "tile.cs.t": { az: "Kosmetologiya", ru: "Косметология", en: "Cosmetology" },
    "tile.cs.d": { az: "Üz dərisinə qulluq prosedurları", ru: "Процедуры ухода за кожей лица", en: "Facial skin-care treatments" },

    "pr.title": { az: "Qiymətlər", ru: "Цены", en: "Prices" },
    "pr.tabsLabel": { az: "Bölmələr", ru: "Разделы", en: "Sections" },
    "pr.note": { az: "Qiymətlər manatla. Aralıq qiymətin (məs. 15–20 ₼) dəqiq məbləğini administrator təsdiqləyir.", ru: "Цены в манатах. Точную сумму для цены «от–до» (например, 15–20 ₼) подтвердит администратор.", en: "Prices in manat. For ranges (e.g. 15–20 ₼) the administrator confirms the exact amount." },
    "cat.mk": { az: "Makiyaj", ru: "Макияж", en: "Makeup" },
    "cat.hr": { az: "Saçlar", ru: "Укладки", en: "Hair" },
    "cat.tl": { az: "Total look", ru: "Total look", en: "Total look" },
    "grp.extra": { az: "Əlavə", ru: "Дополнительно", en: "Add-ons" },
    "note.tl": { az: "Qiymətə sınaq makiyajı daxildir.", ru: "В цену входит пробный макияж.", en: "Includes a trial makeup." },
    "sel.add": { az: "Yazılışa əlavə et", ru: "Добавить в запись", en: "Add to booking" },

    "lz.title": { az: "Lazer epilyasiyası", ru: "Лазерная эпиляция", en: "Laser hair removal" },
    "lz.lead": { az: "Zonaya toxunun: fiqurda və ya siyahıda. Endirim avtomatik hesablanır.", ru: "Нажмите на зону — на фигуре или в списке. Скидка посчитается сама.", en: "Tap a zone on the figure or in the list. The discount applies automatically." },
    "lz.hint": { az: "Fırlatmaq üçün sürüşdürün", ru: "Проведите, чтобы повернуть", en: "Drag to turn" },
    "lz.front": { az: "Ön", ru: "Спереди", en: "Front" },
    "lz.back": { az: "Arxa", ru: "Сзади", en: "Back" },
    "lz.mini": { az: "{n} zona", ru: "Зон: {n}", en: "Zones: {n}" },
    "lz.short": { az: "Lazer epilyasiyası", ru: "Лазерная эпиляция", en: "Laser hair removal" },
    "zg.f": { az: "Üz və boyun", ru: "Лицо и шея", en: "Face & neck" },
    "zg.b": { az: "Bədən və qollar", ru: "Тело и руки", en: "Body & arms" },
    "zg.l": { az: "Bikini və ayaqlar", ru: "Бикини и ноги", en: "Bikini & legs" },
    "calc.title": { az: "Sizin seansınız", ru: "Ваш сеанс", en: "Your session" },
    "calc.count": { az: "Seçilən zona: {n}", ru: "Выбрано зон: {n}", en: "Zones selected: {n}" },
    "calc.sum": { az: "Zonaların cəmi", ru: "Сумма зон", en: "Zones total" },
    "calc.disc": { az: "Endirim", ru: "Скидка", en: "Discount" },
    "calc.final": { az: "1 seansın qiyməti", ru: "Цена за сеанс", en: "Price per session" },
    "calc.t2": { az: "2 zona −10%", ru: "2 зоны −10%", en: "2 zones −10%" },
    "calc.t3": { az: "3 zona −15%", ru: "3 зоны −15%", en: "3 zones −15%" },
    "calc.t4": { az: "4+ zona −20%", ru: "4+ зоны −20%", en: "4+ zones −20%" },
    "calc.n0": { az: "Zonaları seçin — qiymət burada görünəcək.", ru: "Выберите зоны — цена появится здесь.", en: "Pick zones — the price shows up here." },
    "calc.n1": { az: "Daha 1 zona seçin — endirim 10% olacaq.", ru: "Добавьте ещё 1 зону — скидка 10%.", en: "Add 1 more zone for 10% off." },
    "calc.n2": { az: "3-cü zona ilə endirim 15% olacaq.", ru: "С третьей зоной скидка будет 15%.", en: "A third zone makes it 15% off." },
    "calc.n3": { az: "4-cü zona ilə endirim 20% olacaq.", ru: "С четвёртой зоной скидка будет 20%.", en: "A fourth zone makes it 20% off." },
    "calc.n4": { az: "Maksimal endirim — 20%.", ru: "Максимальная скидка — 20%.", en: "Maximum discount: 20%." },
    "calc.go": { az: "Yazılışa keç", ru: "Перейти к записи", en: "Go to booking" },
    "calc.reset": { az: "Sıfırla", ru: "Сбросить", en: "Clear" },
    "calc.device": { az: "Qiymətlər «Candela» GentleLase Pro Upgraded (aleksandrit) aparatı üçündür.", ru: "Цены указаны для аппарата «Candela» GentleLase Pro Upgraded (александрит).", en: "Prices are for the Candela GentleLase Pro Upgraded (alexandrite)." },
    "dev1.k": { az: "Aleksandrit lazer", ru: "Александритовый лазер", en: "Alexandrite laser" },
    "dev1.d": { az: "Adətən 8–10 seans: tüklərin təxminən 80%-i gedir. Prosedur zamanı dəri bir az isti hiss edilə bilər.", ru: "Обычно 8–10 сеансов: уходит около 80% волос. Во время процедуры может ощущаться тепло.", en: "Usually 8–10 sessions for about 80% hair reduction. You may feel some warmth during the procedure." },
    "dev2.k": { az: "Diod lazer", ru: "Диодный лазер", en: "Diode laser" },
    "dev2.d": { az: "Adətən 10–12 seans. Başlıq −12 °C-yə qədər soyuyur, ona görə prosedur ağrısızdır.", ru: "Обычно 10–12 сеансов. Насадка охлаждается до −12 °C, поэтому процедура безболезненна.", en: "Usually 10–12 sessions. The handpiece cools down to −12 °C, so it's painless." },
    "q1": { az: "Seansdan əvvəl qırxmaq lazımdır?", ru: "Нужно ли брить перед сеансом?", en: "Should I shave before a session?" },
    "a1": { az: "Diod lazer — hər seansdan əvvəl. Aleksandrit — yalnız ilk seansdan 3–5 gün əvvəl.", ru: "Диод — перед каждым сеансом. Александрит — только за 3–5 дней до первого сеанса.", en: "Diode: before every session. Alexandrite: only 3–5 days before the first session." },
    "q2": { az: "Ağrılıdırmı?", ru: "Это больно?", en: "Does it hurt?" },
    "a2": { az: "Diod aparatın başlığı −12 °C-yə qədər soyuyur. Dərini əlavə soyutmaq üçün salonda Zimmer Cryo 6 var.", ru: "Насадка диодного аппарата охлаждается до −12 °C. Для дополнительного охлаждения кожи в салоне есть Zimmer Cryo 6.", en: "The diode handpiece cools to −12 °C, and the salon also has a Zimmer Cryo 6 to cool the skin." },
    "q3": { az: "Neçə seans lazım olacaq?", ru: "Сколько понадобится сеансов?", en: "How many sessions will I need?" },
    "a3": { az: "Aleksandritdə adətən 8–10, diodda 10–12 seans. Dəqiq sayı dəri və tük tipindən asılıdır.", ru: "На александрите обычно 8–10, на диоде 10–12 сеансов. Точное число зависит от типа кожи и волос.", en: "Usually 8–10 on alexandrite and 10–12 on diode. The exact number depends on your skin and hair type." },
    "q4": { az: "Necə yazılmaq olar?", ru: "Как записаться?", en: "How do I book?" },
    "a4": { az: "Yazılış əvvəlcədən aparılır. Zonaları seçin və aşağıdakı formanı göndərin — administrator vaxtı WhatsApp-da təsdiqləyəcək.", ru: "Запись заранее. Выберите зоны и отправьте форму ниже — администратор подтвердит время в WhatsApp.", en: "Please book in advance. Pick the zones and send the form below — the administrator will confirm the time on WhatsApp." },

    "shop.text": { az: "Kosmetika mağazası: baxım və makiyaj vasitələri, salonla eyni ünvanda.", ru: "Магазин косметики: уход и макияж, по тому же адресу, что и салон.", en: "A beauty shop for skincare and makeup, at the same address as the salon." },
    "soc.salon": { az: "salon", ru: "салон", en: "salon" },
    "soc.laser": { az: "lazer", ru: "лазер", en: "laser" },
    "soc.shop": { az: "mağaza", ru: "магазин", en: "shop" },

    "rv.title": { az: "Müştərilər nə deyir", ru: "Что говорят клиенты", en: "What clients say" },
    "rv.google": { az: "Google-da 245 rəy", ru: "245 отзывов в Google", en: "245 reviews on Google" },
    "rv.src": { az: "Instagram rəyi · @self.laser", ru: "Отзыв из Instagram · @self.laser (перевод)", en: "Instagram review · @self.laser (translated)" },
    "rv1": {
      az: "Zümrüd xanım çox gözəl iş görür, əlinə, zəhmətinə sağlıq. Nəticədən həmişəki kimi razı qaldım.",
      ru: "Зумруд-ханым работает очень красиво — золотые руки. Результат, как всегда, радует.",
      en: "Zümrüd does beautiful work — bless her hands. Happy with the result, as always."
    },
    "rv2": {
      az: "1-10 aralığında 10 ilə qiymətləndirirəm: həm gigiyenik idi, həm də lazeroloq bilikli idi — prosedurdan əvvəl və sonra nə etmək lazımdırsa, izah etdi.",
      ru: "Ставлю 10 из 10: всё гигиенично, а лазеролог знающий — объяснил, что делать до и после процедуры.",
      en: "10 out of 10: everything was hygienic, and the specialist knew their stuff — explained what to do before and after."
    },
    "rv3": {
      az: "Hər zamankı kimi 10-dur. Həm sizin peşəkarlığınız, həm də Zümrüd xanımın səmimiyyəti məni hər zaman məmnun edir.",
      ru: "Как всегда — 10. И ваш профессионализм, и душевность Зумруд-ханым всегда радуют.",
      en: "A 10, as always. Your professionalism and Zümrüd's warmth never disappoint."
    },

    "bk.title": { az: "Bir dəqiqəyə yazılın", ru: "Запишитесь за минуту", en: "Book in a minute" },
    "bk.lead": { az: "Xidmətləri seçin və günü göstərin — hazır mesaj WhatsApp-da açılacaq.", ru: "Выберите услуги и день — готовое сообщение откроется в WhatsApp.", en: "Pick services and a day — a ready message opens in WhatsApp." },
    "st1.t": { az: "Seçin", ru: "Выберите", en: "Choose" },
    "st1.d": { az: "Qiymətlərdə «+» basın və ya lazer zonalarını seçin.", ru: "Нажмите «+» в ценах или выберите зоны лазера.", en: "Tap “+” in the price list or pick laser zones." },
    "st2.t": { az: "Gün və vaxt", ru: "День и время", en: "Day and time" },
    "st2.d": { az: "Sizə nə vaxt rahatdır.", ru: "Когда вам удобно.", en: "When suits you." },
    "st3.t": { az: "Göndərin", ru: "Отправьте", en: "Send" },
    "st3.d": { az: "Administrator vaxtı WhatsApp-da təsdiqləyəcək.", ru: "Администратор подтвердит время в WhatsApp.", en: "The administrator confirms the time on WhatsApp." },
    "bk.tip": {
      az: "<b>Gəlin obrazı?</b> Qiymətə sınaq makiyajı daxildir. Qeyddə toy tarixini yazın.",
      ru: "<b>Образ невесты?</b> Пробный макияж входит в цену. Напишите дату свадьбы в комментарии.",
      en: "<b>Bridal look?</b> A trial makeup is included. Add your wedding date in the notes."
    },
    "sum.title": { az: "Seçdikləriniz", ru: "Вы выбрали", en: "Your selection" },
    "sum.total": { az: "Təxmini cəmi", ru: "Примерно", en: "Approx. total" },
    "sum.remove": { az: "sil", ru: "убрать", en: "remove" },
    "sum.empty": { az: "Hələ heç nə seçilməyib — qiymətlərdə «+» basın və ya istəyinizi qeyddə yazın.", ru: "Пока ничего не выбрано — нажмите «+» в ценах или напишите пожелание в комментарии.", en: "Nothing selected yet — tap “+” in the price list or describe what you need in the notes." },
    "f.date": { az: "Hansı gün?", ru: "Какой день?", en: "Which day?" },
    "f.time": { az: "Vaxt", ru: "Время", en: "Time" },
    "t.any": { az: "Fərqi yoxdur", ru: "Не важно", en: "Any time" },
    "t.m": { az: "Səhər", ru: "Утро", en: "Morning" },
    "t.d": { az: "Gündüz", ru: "День", en: "Afternoon" },
    "t.e": { az: "Axşam", ru: "Вечер", en: "Evening" },
    "f.name": { az: "Adınız", ru: "Ваше имя", en: "Your name" },
    "f.note": { az: "Qeyd", ru: "Комментарий", en: "Notes" },
    "f.optional": { az: "(istəyə görə)", ru: "(необязательно)", en: "(optional)" },
    "f.notePh": { az: "Məs.: saçım uzundur; lazerə ilk dəfə gəlirəm", ru: "Например: длинные волосы; на лазер впервые", en: "E.g. long hair; first time for laser" },
    "f.submit": { az: "WhatsApp ilə göndər", ru: "Отправить в WhatsApp", en: "Send via WhatsApp" },
    "f.hint": { az: "Demo: yazılış göndərilmir — yalnız mesajın necə görünəcəyini göstəririk.", ru: "Демо: запись не отправляется — мы только показываем, как будет выглядеть сообщение.", en: "Demo: no booking is sent — we only show what the message would look like." },
    "e.name": { az: "Adınızı yazın", ru: "Напишите ваше имя", en: "Please enter your name" },
    "e.date": { az: "Bu gün və ya sonrakı günü seçin", ru: "Выберите сегодня или более поздний день", en: "Pick today or a later day" },
    "e.empty": { az: "Xidmət seçin və ya qeyddə nə istədiyinizi yazın", ru: "Выберите услугу или напишите, что нужно", en: "Pick a service or describe what you need" },
    "msg.head": { az: "Salam! Saytdan yazılmaq istəyirəm:", ru: "Здравствуйте! Хочу записаться (с сайта):", en: "Hi! I'd like to book an appointment (from the website):" },
    "msg.total": { az: "Təxmini cəmi", ru: "Примерно", en: "Approx. total" },
    "msg.date": { az: "Gün", ru: "День", en: "Day" },
    "msg.name": { az: "Ad", ru: "Имя", en: "Name" },
    "msg.note": { az: "Qeyd", ru: "Комментарий", en: "Notes" },
    "bar.text": { az: "Yazılışda: {n} · <b>{sum}</b>", ru: "В записи: {n} · <b>{sum}</b>", en: "In booking: {n} · <b>{sum}</b>" },
    "bar.go": { az: "Yazılışa keç", ru: "К записи", en: "Book" },

    "ct.title": { az: "Bizə gəlin", ru: "Приходите", en: "Visit us" },
    "ct.addr": { az: "Nizami küçəsi 108A", ru: "ул. Низами, 108A", en: "108A Nizami St" },
    "ct.near": { az: "Bakı, Sahil metrosunun yanında (Torqovaya)", ru: "Баку, рядом с метро «Сахиль» (Торговая)", en: "Baku, near Sahil metro (Torgovaya street)" },
    "ct.salon": { az: "Salon · WhatsApp", ru: "Салон · WhatsApp", en: "Salon · WhatsApp" },
    "ct.laser": { az: "Lazer · WhatsApp", ru: "Лазер · WhatsApp", en: "Laser · WhatsApp" },
    "ct.city": { az: "Şəhər nömrəsi", ru: "Городской", en: "Landline" },
    "ct.shop": { az: "Mağaza · WhatsApp", ru: "Магазин · WhatsApp", en: "Shop · WhatsApp" },
    "ct.route": { az: "Yol tarifi", ru: "Как добраться", en: "Directions" },
    "ct.book": { az: "Yazılış əvvəlcədən aparılır.", ru: "Запись заранее.", en: "Please book in advance." },
    "ct.map": { az: "Xəritə: Self Beauty Space, Nizami 108A", ru: "Карта: Self Beauty Space, Низами 108A", en: "Map: Self Beauty Space, 108A Nizami St" },
    "footer.demo": { az: "Nümunə sayt. Hazırladı:", ru: "Демо-сайт. Сделано:", en: "Demo website by" }
  };

  let lang = "az";
  let tab = "mk";
  const picked = new Set();   // услуги салона
  const zones = new Set();    // зоны лазера
  const rerender = [];

  function t(key, vars) {
    const e = I18N[key];
    let s = e ? (e[lang] ?? e.az) : key;
    if (vars) s = s.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? "");
    return s;
  }
  const nm = o => (o ? (o[lang] || o.az) : "");
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const r2 = n => Math.round(n * 100) / 100;
  const num = n => { n = r2(n); const s = Number.isInteger(n) ? String(n) : n.toFixed(2); return lang === "en" ? s : s.replace(".", ","); };
  const money = n => (lang === "en" ? "₼" + num(n) : num(n) + " ₼");
  function range(a, b) {
    if (Array.isArray(a)) { b = a[a.length - 1]; a = a[0]; }
    if (r2(a) === r2(b)) return money(a);
    return lang === "en" ? "₼" + num(a) + "–" + num(b) : num(a) + "–" + num(b) + " ₼";
  }
  function selBtn(kind, id, label, on) {
    return `<button type="button" class="sel" data-${kind}="${id}" aria-pressed="${on}" aria-label="${esc(t("sel.add"))}: ${esc(label)}"><svg class="i-off" aria-hidden="true"><use href="#i-plus"/></svg><svg class="i-on" aria-hidden="true"><use href="#i-check"/></svg></button>`;
  }

  // Демо-режим: запись и WhatsApp не работают, номера не кликаются
  function showDemo(message, num_) {
    $("demoText").textContent = message ? t("demo.text", { num: fmtPhone(num_) }) : t("demo.about");
    $("demoMsg").textContent = message || "";
    const dlg = $("demoDialog");
    if (typeof dlg.showModal === "function") { if (!dlg.open) dlg.showModal(); }
    else alert(t("demo.title") + "\n\n" + $("demoText").textContent);
  }
  if (CONFIG.demo) {
    document.querySelectorAll('a[href^="tel:"]').forEach(a => a.removeAttribute("href"));
    $("demoClose").addEventListener("click", () => $("demoDialog").close());
    $("demoRibbon").addEventListener("click", () => showDemo(""));
  }

  // Общее состояние для 3D-сцены
  const state = () => ({ lang, tab, zones: [...zones] });
  const emit = () => window.dispatchEvent(new CustomEvent("self:state", { detail: state() }));

  // Остальные услуги
  function renderMore() {
    $("moreList").innerHTML = MORE.map(k => `<li><b>${esc(t("tile." + k + ".t"))}</b><span>${esc(t("tile." + k + ".d"))}</span></li>`).join("");
  }
  rerender.push(renderMore);

  // Прайс
  function renderTabs() {
    $("ptabs").innerHTML = CATS.map(c =>
      `<button type="button" role="tab" id="tab-${c.id}" data-tab="${c.id}" aria-selected="${c.id === tab}" tabindex="${c.id === tab ? 0 : -1}" aria-controls="plist">${esc(t(c.key))}</button>`).join('<span class="ptabs__sep" aria-hidden="true">/</span>');
    $("plist").setAttribute("aria-labelledby", "tab-" + tab);
  }
  function renderPrices() {
    const cat = CATS.find(c => c.id === tab);
    const items = SALON.filter(s => s.cat === tab);
    const row = s => `<div class="prow">
        <div class="prow__name">${esc(nm(s.n))}${s.d ? `<small>${esc(nm(s.d))}</small>` : ""}</div>
        <span class="prow__price">${range(s.p)}</span>
        ${selBtn("svc", s.id, nm(s.n), picked.has(s.id))}
      </div>`;
    const main = items.filter(s => !s.extra), extra = items.filter(s => s.extra);
    let html = main.map(row).join("");
    if (extra.length) html += `<p class="pgroup">${esc(t("grp.extra"))}</p>` + extra.map(row).join("");
    if (cat.note) html += `<p class="pnote">${esc(t(cat.note))}</p>`;
    if (items.some(s => s.p.length > 1)) html += `<p class="pnote">${esc(t("pr.note"))}</p>`;
    $("plist").innerHTML = html;
  }
  rerender.push(renderTabs, renderPrices);
  function setTab(next, focus) {
    tab = next;
    renderTabs(); renderPrices(); emit();
    if (focus) $("tab-" + tab).focus({ preventScroll: true });
  }
  $("ptabs").addEventListener("click", e => {
    const b = e.target.closest("[data-tab]");
    if (b) setTab(b.dataset.tab, true);
  });
  $("ptabs").addEventListener("keydown", e => {
    const i = CATS.findIndex(c => c.id === tab);
    let j = -1;
    if (e.key === "ArrowRight") j = (i + 1) % CATS.length;
    else if (e.key === "ArrowLeft") j = (i - 1 + CATS.length) % CATS.length;
    else if (e.key === "Home") j = 0;
    else if (e.key === "End") j = CATS.length - 1;
    if (j >= 0) { e.preventDefault(); setTab(CATS[j].id, true); }
  });

  // Лазер: зоны и скидка (2 зоны −10%, 3 — −15%, 4 и больше — −20%)
  function renderZones() {
    $("zones").innerHTML = ZGROUPS.map(g => `<div class="zgroup">
        <h3>${esc(t(g.key))}</h3>
        <div class="zgrid">${ZONES.filter(z => z.g === g.id).map(z =>
          `<button type="button" class="zone" data-zone="${z.id}" aria-pressed="${zones.has(z.id)}"><span>${esc(nm(z.n))}${z.d ? `<small>${esc(nm(z.d))}</small>` : ""}</span><b>${money(z.p)}</b></button>`).join("")}</div>
      </div>`).join("");
  }
  function laser() {
    const list = ZONES.filter(z => zones.has(z.id));
    const n = list.length;
    const sum = list.reduce((a, z) => a + z.p, 0);
    const pct = n >= 4 ? 20 : n === 3 ? 15 : n === 2 ? 10 : 0;
    return { list, n, sum, pct, final: r2(sum * (100 - pct) / 100) };
  }
  function toggleZone(id) {
    if (!ZONES.some(z => z.id === id)) return;
    if (zones.has(id)) zones.delete(id);
    else {
      EXCLUSIVE.forEach(([a, b]) => { if (a === id) zones.delete(b); if (b === id) zones.delete(a); });
      zones.add(id);
    }
    update();
  }
  function renderTicket() {
    const L = laser();
    $("cCount").textContent = t("calc.count", { n: L.n });
    $("cSum").textContent = L.n ? money(L.sum) : "—";
    $("cDiscLabel").textContent = t("calc.disc") + (L.pct ? " −" + L.pct + "%" : "");
    $("cDisc").textContent = L.pct ? "−" + money(L.sum - L.final) : "—";
    $("cFinal").textContent = L.n ? money(L.final) : "—";
    document.querySelectorAll("#tiers [data-tier]").forEach(li => li.classList.toggle("is-on", Number(li.dataset.tier) === L.pct));
    $("cNudge").textContent = t("calc.n" + Math.min(L.n, 4));
    $("cReset").disabled = !L.n;
    const mini = $("lzMini");
    mini.hidden = !L.n;
    if (L.n) mini.innerHTML = `<span>${esc(t("lz.mini", { n: L.n }))}${L.pct ? " · −" + L.pct + "%" : ""}</span><b>${L.pct ? `<s>${money(L.sum)}</s> ` : ""}${money(L.final)}</b>`;
  }
  rerender.push(renderZones, renderTicket);
  $("cReset").addEventListener("click", () => { zones.clear(); update(); });

  // Поворот фигуры (кнопки «Спереди / Сзади»); сцена сообщает, если повернула сама
  function setFace(face) {
    document.querySelectorAll(".lz-turn [data-face]").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.face === face)));
  }
  document.querySelectorAll(".lz-turn [data-face]").forEach(b => b.addEventListener("click", () => {
    setFace(b.dataset.face);
    window.dispatchEvent(new CustomEvent("self:face", { detail: { face: b.dataset.face } }));
  }));
  window.addEventListener("self:face-changed", e => setFace(e.detail.face));
  window.addEventListener("self:pick-zone", e => toggleZone(e.detail.id));

  // Итог записи
  function totals() {
    const L = laser();
    let min = L.final, max = L.final;
    SALON.forEach(s => { if (picked.has(s.id)) { min += s.p[0]; max += s.p[s.p.length - 1]; } });
    return { L, min, max, n: picked.size + (L.n ? 1 : 0) };
  }
  function renderSummary() {
    const { L, min, max, n } = totals();
    $("bookbar").classList.toggle("is-on", n > 0);
    $("barText").innerHTML = t("bar.text", { n, sum: esc(range(min, max)) });
    const box = $("summary");
    if (!n) { box.innerHTML = `<p class="summary__empty">${esc(t("sum.empty"))}</p>`; return; }
    const rows = SALON.filter(s => picked.has(s.id)).map(s =>
      `<li><span>${esc(nm(s.n))}</span><span>${range(s.p)}<button type="button" data-del-svc="${s.id}">${esc(t("sum.remove"))}</button></span></li>`);
    if (L.n) rows.push(`<li><span>${esc(t("lz.short"))}${L.pct ? " (−" + L.pct + "%)" : ""}<small>${esc(L.list.map(z => nm(z.n)).join(", "))}</small></span><span>${money(L.final)}<button type="button" data-del-laser>${esc(t("sum.remove"))}</button></span></li>`);
    box.innerHTML = `<h3>${esc(t("sum.title"))}</h3><ul>${rows.join("")}</ul><div class="summary__total"><span>${esc(t("sum.total"))}</span><span>${range(min, max)}</span></div>`;
  }
  rerender.push(renderSummary);

  // Обновить состояние кнопок без перерисовки (фокус остаётся на месте)
  function update() {
    document.querySelectorAll("[data-svc]").forEach(b => b.setAttribute("aria-pressed", String(picked.has(b.dataset.svc))));
    document.querySelectorAll("[data-zone]").forEach(b => b.setAttribute("aria-pressed", String(zones.has(b.dataset.zone))));
    renderTicket(); renderSummary(); emit();
  }
  document.addEventListener("click", e => {
    const s = e.target.closest("[data-svc]");
    const z = e.target.closest("[data-zone]");
    const ds = e.target.closest("[data-del-svc]");
    const dl = e.target.closest("[data-del-laser]");
    if (s) { const id = s.dataset.svc; picked.has(id) ? picked.delete(id) : picked.add(id); update(); }
    else if (z) toggleZone(z.dataset.zone);
    else if (ds) { picked.delete(ds.dataset.delSvc); update(); }
    else if (dl) { zones.clear(); update(); }
  });

  // Язык
  function setLang(next, remember) {
    lang = LANGS.includes(next) ? next : "az";
    document.documentElement.lang = lang;
    document.querySelectorAll("[data-i18n]").forEach(el => { el.textContent = t(el.dataset.i18n); });
    document.querySelectorAll("[data-i18n-html]").forEach(el => { el.innerHTML = t(el.dataset.i18nHtml); });
    document.querySelectorAll("[data-i18n-attr]").forEach(el => {
      el.dataset.i18nAttr.split(",").forEach(pair => {
        const [attr, key] = pair.split(":").map(s => s.trim());
        el.setAttribute(attr, t(key));
      });
    });
    // Отзывы написаны по-азербайджански: в RU/EN показываем перевод
    document.querySelectorAll(".quote blockquote").forEach(q => q.setAttribute("lang", lang));
    document.title = (CONFIG.demo ? "DEMO · " : "") + t("meta.title");
    document.querySelector('meta[name="description"]').setAttribute("content", t("meta.desc"));
    document.querySelector('meta[property="og:title"]').setAttribute("content", (CONFIG.demo ? "DEMO · " : "") + t("meta.title"));
    document.querySelector('meta[property="og:locale"]').setAttribute("content", OG_LOCALES[lang]);
    document.querySelectorAll(".langs [data-lang]").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.lang === lang)));
    document.querySelectorAll(".js-map").forEach(m => {
      const src = m.getAttribute("src").replace(/([?&]hl=)[a-z]+/, "$1" + lang);
      if (src !== m.getAttribute("src")) m.setAttribute("src", src);
    });
    document.querySelectorAll(".err").forEach(e => { e.textContent = ""; });
    document.querySelectorAll('[aria-invalid="true"]').forEach(i => i.setAttribute("aria-invalid", "false"));
    rerender.forEach(fn => fn());
    emit();
    if (remember) {
      try { localStorage.setItem("self-lang", lang); } catch (e) {}
      try { const u = new URL(location.href); u.searchParams.set("lang", lang); history.replaceState(null, "", u); } catch (e) {}
    }
  }
  function detectLang() {
    try { const p = new URLSearchParams(location.search).get("lang"); if (LANGS.includes(p)) return p; } catch (e) {}
    try { const s = localStorage.getItem("self-lang"); if (LANGS.includes(s)) return s; } catch (e) {}
    for (const l of (navigator.languages || [navigator.language || ""])) {
      const c = String(l).slice(0, 2).toLowerCase();
      if (LANGS.includes(c)) return c;
    }
    return "az";
  }
  document.querySelectorAll(".langs [data-lang]").forEach(b => b.addEventListener("click", () => setLang(b.dataset.lang, true)));

  // Форма записи → WhatsApp (лазер без услуг салона — на номер лазера)
  (function () {
    const form = $("bookForm");
    const date = form.elements.date, name = form.elements.name, note = form.elements.note, time = form.elements.time;
    let today;
    try {
      today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Baku", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
    } catch (e) { today = new Date().toISOString().slice(0, 10); }
    date.min = today;

    const setErr = (input, msg) => {
      input.setAttribute("aria-invalid", msg ? "true" : "false");
      $(input.getAttribute("aria-describedby")).textContent = msg || "";
    };
    form.addEventListener("submit", e => {
      e.preventDefault();
      const { L, min, max, n } = totals();
      let ok = true;
      if (!n && !note.value.trim()) { setErr(note, t("e.empty")); ok = false; } else setErr(note, "");
      if (!date.value || date.value < today) { setErr(date, t("e.date")); ok = false; } else setErr(date, "");
      if (!name.value.trim()) { setErr(name, t("e.name")); ok = false; } else setErr(name, "");
      if (!ok) { form.querySelector('[aria-invalid="true"]').focus(); return; }

      const [y, m, d] = date.value.split("-");
      const lines = [t("msg.head")];
      SALON.forEach(s => { if (picked.has(s.id)) lines.push("• " + nm(s.n) + " — " + range(s.p)); });
      if (L.n) {
        const zs = L.list.map(z => nm(z.n)).join(", ");
        lines.push("• " + t("lz.short") + ": " + zs + " — " + (L.pct ? money(L.sum) + ", −" + L.pct + "% → " + money(L.final) : money(L.final)));
      }
      if (picked.size + L.n > 1) lines.push(t("msg.total") + ": " + range(min, max));
      lines.push("", t("msg.date") + ": " + d + "." + m + "." + y + (time.value !== "any" ? ", " + time.options[time.selectedIndex].textContent.trim().toLowerCase() : ""));
      lines.push(t("msg.name") + ": " + name.value.trim());
      if (note.value.trim()) lines.push(t("msg.note") + ": " + note.value.trim());
      const to = L.n && !picked.size ? CONFIG.waLaser : CONFIG.waSalon;
      if (CONFIG.demo) { showDemo(lines.join("\n"), to); return; }
      window.open("https://wa.me/" + to + "?text=" + encodeURIComponent(lines.join("\n")), "_blank", "noopener");
    });
    [name, date, note].forEach(i => i.addEventListener("input", () => setErr(i, "")));
  })();

  // Нижняя панель не нужна там, где итог и так на экране (лазер, запись)
  (function () {
    const secs = [$("laser"), $("booking")];
    const check = () => {
      const mid = window.innerHeight / 2;
      const away = secs.some(el => { const r = el.getBoundingClientRect(); return r.top < mid && r.bottom > mid; });
      $("bookbar").classList.toggle("is-away", away);
    };
    window.addEventListener("scroll", check, { passive: true });
    window.addEventListener("resize", check);
    check();
  })();

  // Шапка становится матовой после прокрутки
  (function () {
    const bar = $("bar");
    const on = () => bar.classList.toggle("is-stuck", window.scrollY > 40);
    window.addEventListener("scroll", on, { passive: true });
    on();
  })();

  window.SELF = {
    ZONES, BACK_ZONES, laser, toggleZone, state,
    zoneLabel: id => { const z = ZONES.find(x => x.id === id); return z ? nm(z.n) + " · " + money(z.p) : ""; }
  };

  setLang(detectLang(), false);
})();
