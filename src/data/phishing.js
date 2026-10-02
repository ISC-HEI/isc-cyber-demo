// All brands, domains, numbers and people are fictional. Links are never
// rendered as real <a href> — the "real destination" is only shown as text.
//
// Each message is made of fields; a field may carry a `clue` key that is
// highlighted (and numbered) once the visitor has answered.
export const messages = [
  {
    id: 'colis', kind: 'sms', verdict: 'phish',
    from: { text: '+44 7700 900 123', clue: 'num' },
    body: [
      { text: 'ValPost : votre colis n°CH-48213 est bloqué. ' },
      { text: 'Frais de douane de 1,95 CHF à régler ', clue: 'small' },
      { text: 'avant ce soir : ', clue: 'urgent' },
      { text: 'valpost-suivi.co/xT9', clue: 'url', link: true },
    ],
    clues: {
      num: 'Un numéro étranger pour une entreprise suisse ? Bizarre.',
      small: 'Un tout petit montant pour que tu ne te méfies pas… le but est de récupérer ta carte bancaire.',
      urgent: 'L’urgence empêche de réfléchir : c’est le levier n°1 des arnaqueurs.',
      url: 'Ce n’est pas l’adresse officielle du transporteur. En cas de doute, va toi-même sur le site officiel.',
    },
  },
  {
    id: 'banque', kind: 'email', verdict: 'phish',
    from: { text: 'Banque des Cimes <securite@banquedescimes-alerte.com>', clue: 'domain' },
    subject: { text: 'URGENT : votre compte sera bloqué dans 24h', clue: 'urgent' },
    body: [
      { text: 'Cher client,', clue: 'generic' },
      { text: '\n\nNous avons détecté une activité inhabituelle sur votre compte. Pour éviter sa suspension, veuillez confirmer vos informations ' },
      { text: 'ainsi que votre code PIN', clue: 'pin' },
      { text: ' en cliquant ci-dessous.' },
    ],
    button: { text: 'Vérifier mon compte', clue: 'link', realUrl: 'http://bdc-verif.login-secure.ru/auth' },
    clues: {
      domain: 'L’adresse ressemble à celle de la banque, mais le domaine est faux (« -alerte.com »).',
      urgent: 'Menace + délai court = pression pour que tu agisses sans réfléchir.',
      generic: '« Cher client » : ta banque connaît ton nom.',
      pin: 'Aucune banque ne te demandera JAMAIS ton code PIN ou ton mot de passe par email.',
      link: 'Le bouton mène en réalité vers « bdc-verif.login-secure.ru » : rien à voir avec la banque.',
    },
  },
  {
    id: 'helpdesk', kind: 'email', verdict: 'legit',
    from: { text: 'Service informatique <helpdesk@ecole-exemple.ch>', clue: 'domain' },
    subject: { text: 'Maintenance planifiée samedi 8h–12h' },
    body: [
      { text: 'Bonjour à toutes et à tous,' },
      { text: '\n\nLa messagerie sera indisponible samedi de 8h à 12h pour une mise à jour. ' },
      { text: 'Aucune action n’est requise de votre part.', clue: 'noaction' },
      { text: '\n\nPour toute question : guichet du service informatique, bâtiment B.', clue: 'contact' },
    ],
    clues: {
      domain: 'L’adresse correspond bien au domaine officiel de l’école.',
      noaction: 'Pas de lien, pas de mot de passe demandé, pas d’urgence : c’est une simple information.',
      contact: 'On te propose un contact physique et vérifiable.',
    },
  },
  {
    id: 'cinema', kind: 'web', verdict: 'phish',
    url: { text: 'https://bobinette-plus.login-verify.net/renouveler', clue: 'domain' },
    brand: 'Bobinette+',
    headline: { text: 'Ton abonnement a expiré 😢', clue: 'fear' },
    body: [{ text: 'Mets à jour ton moyen de paiement pour continuer à regarder tes séries.' }],
    fields: [
      { label: 'Numéro de carte', clue: 'card' },
      { label: 'Date d’expiration' },
      { label: 'Code CVC (au dos)', clue: 'card' },
    ],
    button: { text: 'Réactiver maintenant' },
    clues: {
      domain: 'Le vrai domaine est « login-verify.net », pas celui du service. Et le cadenas HTTPS ne prouve PAS que le site est honnête : il prouve juste que la connexion est chiffrée… vers l’arnaqueur.',
      fear: 'Jouer sur la peur de perdre quelque chose.',
      card: 'On te demande ta carte complète, code CVC compris : jackpot pour l’escroc.',
    },
  },
  {
    id: 'maman', kind: 'sms', verdict: 'phish',
    from: { text: 'Numéro inconnu · +41 76 ••• •• 27', clue: 'num' },
    body: [
      { text: 'Coucou c’est maman ❤️ ', clue: 'identity' },
      { text: 'j’ai cassé mon téléphone, c’est mon nouveau numéro. ' },
      { text: 'Tu vas recevoir un code par SMS, tu peux me l’envoyer vite stp ?', clue: 'code' },
    ],
    clues: {
      num: 'Nouveau numéro inconnu : appelle l’ancien numéro ou pose une question que seule ta mère connaît.',
      identity: 'L’arnaqueur joue sur l’affectif (« c’est maman »). C’est de l’ingénierie sociale.',
      code: 'Ce code sert à prendre le contrôle de TON compte (WhatsApp, banque…). On ne transmet jamais un code reçu par SMS.',
    },
  },
  {
    id: 'code', kind: 'sms', verdict: 'legit',
    from: { text: 'Bobinette+', clue: 'sender' },
    body: [
      { text: 'Ton code de connexion Bobinette+ est 482913. ' },
      { text: 'Si tu n’as pas demandé ce code, ignore ce message. ', clue: 'noaction' },
      { text: 'Ne le communique à personne.', clue: 'advice' },
    ],
    clues: {
      sender: 'Un message attendu, juste après TA demande de connexion.',
      noaction: 'Aucun lien, aucune demande : seulement une information.',
      advice: 'Les vrais services te disent de ne jamais partager ce code… exactement ce que réclament les arnaqueurs !',
    },
  },
];

// A run shows only a few messages (time budget per visitor), always mixing
// at least one legitimate message with the traps.
export const PER_RUN = 4;
export function drawMessages(n = PER_RUN) {
  const rnd = () => { const b = new Uint32Array(1); crypto.getRandomValues(b); return b[0] / 2 ** 32; };
  const shuffle = a => a.map(x => [rnd(), x]).sort((p, q) => p[0] - q[0]).map(p => p[1]);
  const legit = shuffle(messages.filter(m => m.verdict === 'legit'));
  const phish = shuffle(messages.filter(m => m.verdict === 'phish'));
  return shuffle([legit[0], ...phish.slice(0, n - 1)]);
}
