const U = (id, w = 500, q = 82) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=${q}`;


export const IMAGES = {
  hero:    '/images/banner/banner.png',
  login:   '/images/login/Pagina-login.jpg',
  contact: U('1490750967868-88df5691cc2f', 600, 85),
  rose6:   U('1548198471-a99ba4f98f70', 400, 80),
  rose12:  U('1508610048-dc41f08ca5c8', 400, 80),
  rose14:  U('1517088553-6bcd9d4eb09c', 400, 80),
  product1:U('1518895949257-7621c3c786d7', 700, 85),
};

export const HOW_TO = [
  {
    person: 'Ana Beatriz', date: '22/01/2025',
    text: 'Fiquei encantada com a qualidade das flores! Chegaram frescas, bem embaladas e exatamente como na foto.',
  },
  {
    person: 'Pedro Cruz', date: '05/03/2025',
    text: 'Flores tão lindas e o perfume tomou conta da casa. Um presente que a pessoa amou muito.',
  },
  {
    person: 'Mario Julie', date: '18/12/2025',
    text: 'Ótima experiência de compra: fácil e rápido. Flores com pétalas impecáveis.',
  },
  {
    person: 'Lauro M.', date: '03/01/2026',
    text: 'Simplesmente maravilhoso! O arranjo é ainda mais lindo pessoalmente. Entrega pontual.',
  },
];

export const REVIEWS = [
  { name: 'Ubirajara Morais', date: '15/6/2024', text: 'Ótimo. Por favor não envia mais e-mail' },
  { name: 'Jose Lucena Gomes', date: '15/6/2024', text: 'Vocês são 10' },
  { name: 'Ivanor Lourete', date: '14/6/2024',
    text: 'Muito obrigado, foi maravilhoso, meu amor amou as rosas, dois buquês muito lindos.' },
];

const DAY_NAMES = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export const DELIVERY_DATES = (() => {
  const today = new Date();
  return Array.from({ length: 5 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i + 1);
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    return { short: DAY_NAMES[d.getDay()], date: `${dd}/${mm}`, available: true };
  });
})();

export const RELATED = [
  {
    id: 101,
    name: 'Buquê Rosas Premium',
    price: 189.90,
    img: IMAGES.rose12,
  },
  {
    id: 102,
    name: 'Arranjo Encanto do Campo',
    price: 129.90,
    img: IMAGES.hero,
  },
  {
    id: 103,
    name: 'Caixa com Rosas Vermelhas',
    price: 219.90,
    img: IMAGES.rose14,
  },
  {
    id: 104,
    name: 'Orquídea Presente Especial',
    price: 159.90,
    img: IMAGES.product1,
  },
];
export const GIFT_CATEGORIES = [
  { label: 'Datas Especiais', emoji: '🗓️', categoria: 'ANIVERSARIO' },
  { label: 'Ocasiões',        emoji: '🎉', categoria: 'PRESENTES'   },
  { label: 'Buquês',          emoji: '💐', categoria: 'BUQUES'      },
  { label: 'Flores',          emoji: '🌸', categoria: 'CAMPO'       },
  { label: 'Rosas',           emoji: '🌹', categoria: 'ROSAS'       },
  { label: 'Orquídeas',       emoji: '🌺', categoria: 'ORQUIDEAS'   },
  { label: 'Cestas',          emoji: '🧺', categoria: 'CESTAS'      },
  { label: 'Plantas',         emoji: '🪴', categoria: 'PLANTAS'     },
  { label: 'Bebidas',         emoji: '🍾', categoria: 'PRESENTES'   },
  { label: 'Chocolates',      emoji: '🍫', categoria: 'PRESENTES'   },
];