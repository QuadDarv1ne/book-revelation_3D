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
  { text: "Счастье вашей жизни зависит от качества ваших мыслей.", author: "Марк Аврелий", era: "Античность", category: "мышление" },
  { text: "Наша жизнь — это то, что о ней думают наши боги.", author: "Марк Аврелий", era: "Античность", category: "жизнь" },
  { text: "У тебя есть власть над своим умом — не снаружи. Осознай это, и ты обретешь силу.", author: "Марк Аврелий", era: "Античность", category: "самоконтроль" },
  { text: "Не трать больше оставшейся жизни на размышления о том, кем быть.", author: "Марк Аврелий", era: "Античность", category: "действие" },
  { text: "Каждый день проживай как последний.", author: "Марк Аврелий", era: "Античность", category: "мудрость" },
  { text: "Ты имеешь власть над своим умом — не над внешними событиями. Осознай это, и ты обретёшь силу.", author: "Марк Аврелий", era: "Античность", category: "самоконтроль" },
  { text: "Всё, что мы слышим, — мнение, а не факт. Всё, что мы видим, — перспектива, а не истина.", author: "Марк Аврелий", era: "Античность", category: "мудрость" },
  { text: "Не позволяй будущему тревожить тебя. Ты встретишь его, если придётся, с тем же оружием разума, которое вооружает тебя против настоящего.", author: "Марк Аврелий", era: "Античность", category: "спокойствие" },
];

const epictetusQuotes: Quote[] = [
  { text: "Лучший способ отомстить врагу — не уподобляться ему.", author: "Эпиктет", era: "Античность", category: "мудрость" },
  { text: "Сначала убедись, что ты независим; иначе твоя свобода будет зависеть от других.", author: "Эпиктет", era: "Античность", category: "свобода" },
  { text: "Нас расстраивают не вещи, а наше мнение о вещах.", author: "Эпиктет", era: "Античность", category: "мышление" },
  { text: "Свобода — это право распоряжаться тем, что в нашей власти.", author: "Эпиктет", era: "Античность", category: "свобода" },
  { text: "Только образованный человек свободен.", author: "Эпиктет", era: "Античность", category: "знание" },
  { text: "Нет человека, который был бы свободен, если он не владеет собой.", author: "Эпиктет", era: "Античность", category: "самоконтроль" },
  { text: "Богатство не в том, чтобы иметь много, а в том, чтобы желать мало.", author: "Эпиктет", era: "Античность", category: "мудрость" },
  { text: "Стойкость — это не отсутствие чувств, а правильная реакция на них.", author: "Эпиктет", era: "Античность", category: "стойкость" },
];

const senecaQuotes: Quote[] = [
  { text: "Кто не знает, куда направляется, очень удивится, попав не туда.", author: "Сенека", era: "Античность", category: "цель" },
  { text: "Мы страдаем чаще в воображении, чем в действительности.", author: "Сенека", era: "Античность", category: "спокойствие" },
  { text: "Власть над собой — высшая власть.", author: "Сенека", era: "Античность", category: "самоконтроль" },
  { text: "Человек боящийся смерти, никогда не сделает ничего достойного живого.", author: "Сенека", era: "Античность", category: "жизнь" },
  { text: "Жизнь длинна, если ты умеешь ею пользоваться.", author: "Сенека", era: "Античность", category: "жизнь" },
  { text: "Трудности укрепляют дух, как труд укрепляет тело.", author: "Сенека", era: "Античность", category: "стойкость" },
  { text: "Время — самая ценная вещь, которую может потратить человек.", author: "Сенека", era: "Античность", category: "мудрость" },
  { text: "Истинная удача — это жизнь в согласии с природой.", author: "Сенека", era: "Античность", category: "мудрость" },
];

const sunTzuQuotes: Quote[] = [
  { text: "Побеждай без боя.", author: "Сунь-цзы", era: "Древний Китай", category: "стратегия" },
  { text: "Знай своего врага и знай себя; даже в ста сражениях ты не будешь в опасности.", author: "Сунь-цзы", era: "Древний Китай", category: "знание" },
  { text: "Вся война основана на обмане.", author: "Сунь-цзы", era: "Древний Китай", category: "стратегия" },
  { text: "Лучшее из лучшего — сломить сопротивление врага без боя.", author: "Сунь-цзы", era: "Древний Китай", category: "стратегия" },
  { text: "Если ты знаешь врага и знаешь себя, тебе не нужно бояться результата сотни сражений.", author: "Сунь-цзы", era: "Древний Китай", category: "знание" },
  { text: "Победа приходит к тем, кто готов ждать.", author: "Сунь-цзы", era: "Древний Китай", category: "терпение" },
  { text: "Кто не знает, когда можно сражаться, а когда нельзя, тот проиграет.", author: "Сунь-цзы", era: "Древний Китай", category: "мудрость" },
  { text: "Быстрота — сущность войны.", author: "Сунь-цзы", era: "Древний Китай", category: "действие" },
];

const hawkingQuotes: Quote[] = [
  { text: "Интеллект — это способность адаптироваться к изменениям.", author: "Стивен Хокинг", era: "Современность", category: "мудрость" },
  { text: "Вселенная не была создана человеком. Она не подчиняется нашим желаниям.", author: "Стивен Хокинг", era: "Современность", category: "знание" },
  { text: "Надеюсь, что люди, которые читают эту книгу, смогут понять, что мы можем сделать с нашей жизнью.", author: "Стивен Хокинг", era: "Современность", category: "жизнь" },
  { text: "Наука не только совместима с религией, она и есть религия.", author: "Стивен Хокинг", era: "Современность", category: "знание" },
  { text: "Помните смотреть на звезды, а не под ноги.", author: "Стивен Хокинг", era: "Современность", category: "вдохновение" },
  { text: "Каким бы трудным ни казался жизнь, всегда есть что-то, что вы можете сделать и в чём преуспеть.", author: "Стивен Хокинг", era: "Современность", category: "вдохновение" },
  { text: "Вселенная начинается с нас. Мы — способ Вселенной познать саму себя.", author: "Стивен Хокинг", era: "Современность", category: "знание" },
  { text: "Тихие люди имеют самый громкий ум.", author: "Стивен Хокинг", era: "Современность", category: "мудрость" },
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
