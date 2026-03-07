import type { Quote } from "@/types/quote";

export interface Book {
  id: string;
  title: string;
  author: string;
  description: string;
  coverImage: string;
  spineImage: string;
  backCoverImage: string;
  quotes: Quote[];
  color: string;
}

const marcusAureliusQuotes: Quote[] = [
  { text: "Счастье вашей жизни зависит от качества ваших мыслей.", author: "Марк Аврелий", era: "Античность" },
  { text: "Наша жизнь — это то, что о ней думают наши боги.", author: "Марк Аврелий", era: "Античность" },
  { text: "У тебя есть власть над своим умом — не снаружи. Осознай это, и ты обретешь силу.", author: "Марк Аврелий", era: "Античность" },
  { text: "Не трать больше оставшейся жизни на размышления о том, кем быть.", author: "Марк Аврелий", era: "Античность" },
  { text: "Лучший способ отомстить врагу — не уподобляться ему.", author: "Марк Аврелий", era: "Античность" },
];

const epictetusQuotes: Quote[] = [
  { text: "Лучший способ отомстить врагу — не уподобляться ему.", author: "Эпиктет", era: "Античность" },
  { text: "Сначала убедись, что ты независим; иначе твоя свобода будет зависеть от других.", author: "Эпиктет", era: "Античность" },
  { text: "Нас расстраивают не вещи, а наше мнение о вещах.", author: "Эпиктет", era: "Античность" },
  { text: "Свобода — это право распоряжаться тем, что в нашей власти.", author: "Эпиктет", era: "Античность" },
  { text: "Только образованный человек свободен.", author: "Эпиктет", era: "Античность" },
];

const senecaQuotes: Quote[] = [
  { text: "Кто не знает, куда направляется, очень удивится, попав не туда.", author: "Сенека", era: "Античность" },
  { text: "Мы страдаем чаще в воображении, чем в действительности.", author: "Сенека", era: "Античность" },
  { text: "Тот, кто не знает, куда направляется, очень удивится, попав не туда.", author: "Сенека", era: "Античность" },
  { text: "Власть над собой — высшая власть.", author: "Сенека", era: "Античность" },
  { text: "Человек боящийся смерти, никогда не сделает ничего достойного живого.", author: "Сенека", era: "Античность" },
];

const sunTzuQuotes: Quote[] = [
  { text: "Побеждай без боя.", author: "Сунь-цзы", era: "Древний Китай" },
  { text: "Знай своего врага и знай себя; даже в ста сражениях ты не будешь в опасности.", author: "Сунь-цзы", era: "Древний Китай" },
  { text: "Вся война основана на обмане.", author: "Сунь-цзы", era: "Древний Китай" },
  { text: "Лучшее из лучшего — сломить сопротивление врага без боя.", author: "Сунь-цзы", era: "Древний Китай" },
  { text: "Если ты знаешь врага и знаешь себя, тебе не нужно бояться результата сотни сражений.", author: "Сунь-цзы", era: "Древний Китай" },
];

const hawkingQuotes: Quote[] = [
  { text: "Интеллект — это способность адаптироваться к изменениям.", author: "Стивен Хокинг", era: "Современность" },
  { text: "Вселенная не была создана человеком. Она не подчиняется нашим желаниям.", author: "Стивен Хокинг", era: "Современность" },
  { text: "Надеюсь, что люди, которые читают эту книгу, смогут понять, что мы можем сделать с нашей жизнью.", author: "Стивен Хокинг", era: "Современность" },
  { text: "Наука не только совместима с религией, она и есть религия.", author: "Стивен Хокинг", era: "Современность" },
  { text: "Помните смотреть на звезды, а не под ноги.", author: "Стивен Хокинг", era: "Современность" },
];

export const books: Book[] = [
  {
    id: "marcus-aurelius-meditations",
    title: "Размышления",
    author: "Марк Аврелий",
    description: "Личные записи римского императора о стоической философии",
    coverImage: "/book-covers/marcus-aurelius-meditations-back.jpg",
    spineImage: "/book-covers/marcus-aurelius-meditations-back.jpg",
    backCoverImage: "/book-covers/marcus-aurelius-meditations-back.jpg",
    quotes: marcusAureliusQuotes,
    color: "#d4af37",
  },
  {
    id: "epictetus-our-good",
    title: "Наше благо",
    author: "Эпиктет",
    description: "Учения о добродетели и внутренней свободе",
    coverImage: "/book-covers/epictetus-our-good-back.jpg",
    spineImage: "/book-covers/epictetus-our-good-back.jpg",
    backCoverImage: "/book-covers/epictetus-our-good-back.jpg",
    quotes: epictetusQuotes,
    color: "#c9a961",
  },
  {
    id: "seneca-letters",
    title: "Нравственные письма к Луцилию",
    author: "Сенека",
    description: "Философские письма о мудрости и добродетели",
    coverImage: "/book-covers/seneca-letters.webp",
    spineImage: "/book-covers/seneca-letters.webp",
    backCoverImage: "/book-covers/seneca-letters.webp",
    quotes: senecaQuotes,
    color: "#b89f5e",
  },
  {
    id: "sun-tzu-art-of-war",
    title: "Искусство войны",
    author: "Сунь-цзы",
    description: "Древнекитайский трактат о стратегии и тактике",
    coverImage: "/book-covers/sun-tzu-art-of-war.png",
    spineImage: "/book-spines/sun-tzu-art-of-war.png",
    backCoverImage: "/book-covers/sun-tzu-art-of-war-back.png",
    quotes: sunTzuQuotes,
    color: "#a67c52",
  },
  {
    id: "hawking-theory-of-everything",
    title: "Теория всего",
    author: "Стивен Хокинг",
    description: "О природе пространства, времени и Вселенной",
    coverImage: "/book-covers/hawking-theory-of-everything.png",
    spineImage: "/book-spines/hawking-theory-of-everything.png",
    backCoverImage: "/book-covers/hawking-theory-of-everything-back.png",
    quotes: hawkingQuotes,
    color: "#8b7355",
  },
];

export function getBookById(id: string): Book | undefined {
  return books.find(book => book.id === id);
}

export function getDefaultBook(): Book {
  return books[0];
}
