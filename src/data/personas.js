// Entirely fictional personas. Any resemblance to a real person is accidental.
//
// Each persona: a public profile, posts (`leak` tags the posts that give away
// part of the password or a security answer), the password split into
// `parts` (tested against the lower-cased guess), hints and security questions.

const g = (a, b) => `linear-gradient(135deg,${a},${b})`;

export const personas = [
  {
    id: 'lea',
    name: 'Léa Morand', handle: '@lea.mrd', initial: 'L',
    bio: '18 ans · Valais 🏔️ · future ingénieure ? · team chats 🐾',
    followers: 412,
    posts: [
      { id: 'cat', emoji: '🐱', bg: g('#ffd8a8', '#ffa94d'), text: 'Pistache a 3 ans aujourd’hui !! Le meilleur chat du monde 🧡 #catlover', likes: 87, leak: 'pet' },
      { id: 'hockey', emoji: '🏒', bg: g('#ffe066', '#e03131'), text: 'Match de folie ce soir à la patinoire 🔥🔥', likes: 42 },
      { id: 'bday', emoji: '🎂', bg: g('#fcc2d7', '#e64980'), text: 'Majeure !!! 18 ans aujourd’hui, 14 mars 🥳 Promo 2008 forever 😎', likes: 156, leak: 'year' },
      { id: 'raclette', emoji: '🧀', bg: g('#fff3bf', '#fab005'), text: 'Raclette chez grand-maman Bonvin (la maman de ma maman ❤️) — personne ne la bat', likes: 64, leak: 'maiden' },
      { id: 'school', emoji: '🏫', bg: g('#d0ebff', '#4dabf7'), text: 'Passée devant mon école primaire de Chippis… que de souvenirs 🥲', likes: 31, leak: 'school' },
      { id: 'tip', emoji: '💬', bg: g('#e5dbff', '#9775fa'), text: 'Astuce sécurité : je finis TOUJOURS mes mots de passe par un « ! », comme ça c’est sûr 😏', likes: 12, leak: 'symbol' },
      { id: 'mountain', emoji: '⛰️', bg: g('#c3fae8', '#20c997'), text: 'Rando au lever du soleil, ça valait le réveil à 4h 🌄', likes: 98 },
      { id: 'pizza', emoji: '🍕', bg: g('#ffe3e3', '#fa5252'), text: 'Soirée pizza avec la team ❤️ Qui vient la semaine prochaine ?', likes: 53 },
    ],
    password: 'Pistache2008!',
    display: [['Pistache', 'pet'], ['2008', 'year'], ['!', 'symbol']],
    parts: [
      { key: 'pet', label: 'le nom de son chat', test: s => s.includes('pistache') },
      { key: 'year', label: 'son année de naissance', test: s => s.includes('2008') },
      { key: 'symbol', label: 'son « ! » final', test: s => s.endsWith('!') },
    ],
    hints: [
      'Indice : regarde qui elle aime le plus sur ses photos… à quatre pattes 🐾',
      'Indice : un prénom + une année + un petit signe à la fin.',
    ],
    securityQuestions: [
      { q: 'Nom de votre premier animal ?', a: 'Pistache' },
      { q: 'Nom de jeune fille de votre mère ?', a: 'Bonvin' },
      { q: 'Nom de votre école primaire ?', a: 'Chippis' },
      { q: 'Date de naissance ?', a: '14 mars 2008' },
    ],
    leakLabels: { pet: 'Nom du chat', year: 'Année de naissance', maiden: 'Nom de jeune fille de sa mère', school: 'École primaire', symbol: 'Ses habitudes de mot de passe' },
  },

  {
    id: 'noah',
    name: 'Noah Rey', handle: '@noah_rey_23', initial: 'N',
    bio: '17 ans · ⚽ milieu de terrain · 🎮 le soir · 🐶 Rocky ma vie',
    followers: 688,
    posts: [
      { id: 'dog', emoji: '🐶', bg: g('#e9d8a6', '#ca8a04'), text: 'Rocky a encore mangé ma chaussure 😭 mais je l’aime trop ce chien', likes: 134, leak: 'pet' },
      { id: 'jersey', emoji: '⚽', bg: g('#b2f2bb', '#2f9e44'), text: 'Nouveau maillot, toujours le même numéro : le 23 depuis mes 8 ans 💪 #23', likes: 97, leak: 'number' },
      { id: 'gaming', emoji: '🎮', bg: g('#d0bfff', '#7048e8'), text: 'Retrouvez-moi en ligne : noah_rey_23 partout. Les underscores, c’est ma signature 😎', likes: 45, leak: 'symbol' },
      { id: 'city', emoji: '🏰', bg: g('#ffd8a8', '#e8590c'), text: 'Né à Martigny, fier de l’être 🧡 #octodure', likes: 61, leak: 'city' },
      { id: 'coach', emoji: '🏆', bg: g('#fff3bf', '#f59f00'), text: 'Merci coach Dubuis pour ces 5 saisons, tu m’as tout appris 🙏', likes: 39, leak: 'coach' },
      { id: 'burger', emoji: '🍔', bg: g('#ffe3e3', '#f03e3e'), text: 'Burger après l’entraînement, la base 🍟', likes: 72 },
      { id: 'beach', emoji: '🏖️', bg: g('#c5f6fa', '#15aabf'), text: 'Vacances au bord du lac, enfin un peu de repos ☀️', likes: 88 },
      { id: 'exam', emoji: '📚', bg: g('#e7f5ff', '#339af0'), text: 'Exam de maths demain… priez pour moi 🙃', likes: 27 },
    ],
    password: 'Rocky_23',
    display: [['Rocky', 'pet'], ['_', 'symbol'], ['23', 'number']],
    parts: [
      { key: 'pet', label: 'le nom de son chien', test: s => s.includes('rocky') },
      { key: 'symbol', label: 'son « _ »', test: s => s.includes('_') },
      { key: 'number', label: 'son numéro de maillot', test: s => s.includes('23') },
    ],
    hints: [
      'Indice : qui l’attend à la maison en remuant la queue ? 🐕',
      'Indice : un nom + sa « signature » + son numéro fétiche.',
    ],
    securityQuestions: [
      { q: 'Nom de votre premier animal ?', a: 'Rocky' },
      { q: 'Ville de naissance ?', a: 'Martigny' },
      { q: 'Nom de votre entraîneur préféré ?', a: 'Dubuis' },
      { q: 'Votre numéro fétiche ?', a: '23' },
    ],
    leakLabels: { pet: 'Nom du chien', number: 'Numéro fétiche', symbol: 'Ses habitudes de pseudo', city: 'Ville de naissance', coach: 'Entraîneur' },
  },

  {
    id: 'ines',
    name: 'Inès Carron', handle: '@ines.crrn', initial: 'I',
    bio: '16 ans · 🐴 équitation · grande sœur officielle · 🎨 dessin',
    followers: 301,
    posts: [
      { id: 'brother', emoji: '🎂', bg: g('#fcc2d7', '#d6336c'), text: 'Joyeux anniversaire à mon petit frère Lucas 🎈 le 4 décembre, comme chaque année pendant les exams 😂', likes: 112, leak: 'name' },
      { id: 'horse', emoji: '🐴', bg: g('#e9d8a6', '#a9741b'), text: 'Premier concours avec Tempête 🏅 trop fière de nous !', likes: 143, leak: 'pet' },
      { id: 'brother2', emoji: '👦', bg: g('#d0ebff', '#1c7ed6'), text: 'Mon frère est mon mot de passe pour tout, littéralement 🤫 (je l’aime trop)', likes: 33, leak: 'habit' },
      { id: 'draw', emoji: '🎨', bg: g('#f3d9fa', '#be4bdb'), text: 'Nouveau dessin terminé après 12 heures ✏️', likes: 76 },
      { id: 'street', emoji: '🏡', bg: g('#d3f9d8', '#37b24d'), text: 'Petite pensée pour la rue des Vergers où j’ai grandi 🌳', likes: 24, leak: 'street' },
      { id: 'snow', emoji: '❄️', bg: g('#e7f5ff', '#74c0fc'), text: 'Première neige !!! Bataille de boules prévue demain ☃️', likes: 91 },
      { id: 'cake', emoji: '🧁', bg: g('#fff0f6', '#f783ac'), text: 'Cupcakes maison, qui en veut ? 🧁', likes: 58 },
      { id: 'music', emoji: '🎧', bg: g('#e5dbff', '#845ef7'), text: 'Playlist de révisions activée 🎶', likes: 19 },
    ],
    password: 'Lucas0412',
    display: [['Lucas', 'name'], ['0412', 'date']],
    parts: [
      { key: 'name', label: 'le prénom de son frère', test: s => s.includes('lucas') },
      { key: 'date', label: 'sa date d’anniversaire', test: s => s.includes('0412') || s.includes('412') },
    ],
    hints: [
      'Indice : elle a avoué que son mot de passe, c’est une personne… 👦',
      'Indice : un prénom + un jour et un mois (JJMM).',
    ],
    securityQuestions: [
      { q: 'Nom de votre premier animal ?', a: 'Tempête' },
      { q: 'Rue où vous avez grandi ?', a: 'Rue des Vergers' },
      { q: 'Prénom de votre frère ou sœur ?', a: 'Lucas' },
    ],
    leakLabels: { name: 'Prénom + anniversaire du frère', pet: 'Nom du cheval', habit: 'Ses habitudes de mot de passe', street: 'Rue de son enfance', date: 'Date' },
  },

  {
    id: 'marc',
    name: 'Marc Vouilloz', handle: '@marc.vouilloz', initial: 'M',
    bio: 'Papa de 2 ados · 🚴 vélo · 🍇 vigneron du dimanche',
    followers: 157,
    posts: [
      { id: 'wedding', emoji: '💍', bg: g('#fff0f6', '#e64980'), text: '28 ans de mariage avec ma Sandra ❤️ Depuis le 20 juin 1998, le plus beau jour de ma vie', likes: 203, leak: 'wife' },
      { id: 'bike', emoji: '🚴', bg: g('#d3f9d8', '#2b8a3e'), text: '120 km et 2000 m de dénivelé ce matin 💪', likes: 44 },
      { id: 'vines', emoji: '🍇', bg: g('#e5dbff', '#5f3dc4'), text: 'Les vendanges à Saint-Luc, là où on s’est mariés il y a 28 ans 🍷', likes: 67, leak: 'place' },
      { id: 'car', emoji: '🚗', bg: g('#e9ecef', '#495057'), text: 'Retrouvé une photo de ma première voiture : la Golf rouge 😍', likes: 52, leak: 'car' },
      { id: 'dog', emoji: '🐕', bg: g('#ffe8cc', '#d9480f'), text: 'RIP Filou, notre tout premier chien 🐾 15 belles années', likes: 118, leak: 'pet' },
      { id: 'pw', emoji: '💬', bg: g('#e7f5ff', '#1971c2'), text: 'Mon fils me dit de changer mes mots de passe… mais le mien c’est le plus beau souvenir de ma vie, je le garde 😄', likes: 21, leak: 'habit' },
      { id: 'bbq', emoji: '🍖', bg: g('#fff3bf', '#e67700'), text: 'Grillades en famille ce soir ☀️', likes: 38 },
      { id: 'kids', emoji: '🎓', bg: g('#c5f6fa', '#0c8599'), text: 'Fier de mes deux ados, bonne rentrée à vous ! 🎒', likes: 95 },
    ],
    password: 'Sandra1998',
    display: [['Sandra', 'wife'], ['1998', 'year']],
    parts: [
      { key: 'wife', label: 'le prénom de sa femme', test: s => s.includes('sandra') },
      { key: 'year', label: 'l’année du mariage', test: s => s.includes('1998') },
    ],
    hints: [
      'Indice : « le plus beau souvenir de sa vie »… 💍',
      'Indice : un prénom + une année.',
    ],
    securityQuestions: [
      { q: 'Nom de votre premier animal ?', a: 'Filou' },
      { q: 'Modèle de votre première voiture ?', a: 'Golf' },
      { q: 'Où vous êtes-vous marié ?', a: 'Saint-Luc' },
      { q: 'Date de votre mariage ?', a: '20 juin 1998' },
    ],
    leakLabels: { wife: 'Prénom de sa femme + année', place: 'Lieu du mariage', car: 'Première voiture', pet: 'Premier animal', habit: 'Ses habitudes de mot de passe' },
  },

  {
    id: 'chloe',
    name: 'Chloé Fumeaux', handle: '@chloe.fmx', initial: 'C',
    bio: '19 ans · étudiante · nouvelle vie en ville 🏙️ · #️⃣ addict',
    followers: 524,
    posts: [
      { id: 'flat', emoji: '🏠', bg: g('#d0ebff', '#1c7ed6'), text: 'Mon premier appart !!! 🔑 #Sion #1950 #NouvelleVie', likes: 176, leak: 'city' },
      { id: 'hash', emoji: '#️⃣', bg: g('#e5dbff', '#7048e8'), text: 'Team hashtags : j’en mets partout… même dans mes mots de passe 😂', likes: 29, leak: 'symbol' },
      { id: 'move', emoji: '📦', bg: g('#ffe8cc', '#e8590c'), text: 'Déménagement = changer TOUS mes mots de passe pour ma nouvelle adresse 🙄', likes: 41, leak: 'habit' },
      { id: 'coffee', emoji: '☕', bg: g('#f1e3d3', '#8d5524'), text: 'Café + cours à 8h, combo mortel ☕📖', likes: 63 },
      { id: 'mum', emoji: '💐', bg: g('#fff0f6', '#d6336c'), text: 'Bonne fête maman 💐 Christine, née Pitteloud, la meilleure', likes: 88, leak: 'maiden' },
      { id: 'job', emoji: '🧑‍🍳', bg: g('#fff9db', '#f08c00'), text: 'Premier jour de job d’étudiante au Café de la Gare ☕', likes: 47, leak: 'job' },
      { id: 'concert', emoji: '🎤', bg: g('#f3d9fa', '#ae3ec9'), text: 'Concert de ouf hier soir 🎶🔥', likes: 112 },
      { id: 'plant', emoji: '🪴', bg: g('#d3f9d8', '#2f9e44'), text: 'Ma plante a survécu une semaine, record battu 🌱', likes: 35 },
    ],
    password: 'Sion#1950',
    display: [['Sion', 'city'], ['#', 'symbol'], ['1950', 'zip']],
    parts: [
      { key: 'city', label: 'sa nouvelle ville', test: s => s.includes('sion') },
      { key: 'symbol', label: 'son « # »', test: s => s.includes('#') },
      { key: 'zip', label: 'son code postal', test: s => s.includes('1950') },
    ],
    hints: [
      'Indice : ses mots de passe dépendent de son adresse 📦',
      'Indice : une ville + son symbole préféré + un code postal.',
    ],
    securityQuestions: [
      { q: 'Nom de jeune fille de votre mère ?', a: 'Pitteloud' },
      { q: 'Votre premier emploi ?', a: 'Café de la Gare' },
      { q: 'Ville de résidence ?', a: 'Sion' },
    ],
    leakLabels: { city: 'Ville + code postal', symbol: 'Ses habitudes de mot de passe', habit: 'Mot de passe = adresse', maiden: 'Nom de jeune fille de sa mère', job: 'Premier emploi', zip: 'Code postal' },
  },
];
