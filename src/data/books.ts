import type { Quote } from "@/types/quote";

export interface Book {
  id: string;
  title: string;
  author: string;
  coverImage: string;
  spineImage?: string;
  backCoverImage?: string; // Задняя обложка
  description: string;
  quotes: Quote[];
  color: string; // Акцентный цвет для темы книги
}

export const books: Book[] = [
  {
    id: "hawking-theory-of-everything",
    title: "Теория Всего",
    author: "Стивен Хокинг",
    coverImage: "/book-covers/hawking-theory-of-everything.png",
    spineImage: "/book-spines/hawking-theory-of-everything.png",
    backCoverImage: "/book-covers/hawking-theory-of-everything-back.png",
    description: "Происхождение и судьба Вселенной",
    color: "#3b82f6", // синий
    quotes: [
      { text: "Интеллект — это способность адаптироваться к изменениям.", author: "Стивен Хокинг", era: "1942-2018" },
      { text: "Вселенная не была создана, она всегда существовала.", author: "Стивен Хокинг", era: "1942-2018" },
      { text: "Наука не только не разрушает веру в Бога, но и может укрепить её.", author: "Стивен Хокинг", era: "1942-2018" },
      { text: "Мы всего лишь продвинутый вид обезьян на планете Звезда 3-го класса.", author: "Стивен Хокинг", era: "1942-2018" },
      { text: "Самое непостижимое во Вселенной — это то, что она постижима.", author: "Стивен Хокинг", era: "1942-2018" },
      { text: "Трудности делают жизнь интересной, а их преодоление придаёт ей смысл.", author: "Стивен Хокинг", era: "1942-2018" },
      { text: "Вселенная управляется разумом.", author: "Стивен Хокинг", era: "1942-2018" },
      { text: "Каждая формула в моей книге сократила продажи вдвое.", author: "Стивен Хокинг", era: "1942-2018" },
    ],
  },
  {
    id: "sun-tzu-art-of-war",
    title: "Искусство побеждать",
    author: "Сунь-Цзы",
    coverImage: "/book-covers/sun-tzu-art-of-war.png",
    spineImage: "/book-spines/sun-tzu-art-of-war.png",
    backCoverImage: "/book-covers/sun-tzu-art-of-war-back.png",
    description: "Древняя мудрость стратегии",
    color: "#dc2626", // красный
    quotes: [
      { text: "Лучший способ победить — не сражаться.", author: "Сунь-Цзы", era: "544-496 до н.э." },
      { text: "Познай себя, познай врага — и победишь в ста битвах.", author: "Сунь-Цзы", era: "544-496 до н.э." },
      { text: "Война — это путь обмана.", author: "Сунь-Цзы", era: "544-496 до н.э." },
      { text: "Кто не знает преимуществ войны, тот не знает и её опасностей.", author: "Сунь-Цзы", era: "544-496 до н.э." },
      { text: "Победа — это не сила, это мудрость.", author: "Сунь-Цзы", era: "544-496 до н.э." },
      { text: "Будь предельно скрытен, будь бесплотен.", author: "Сунь-Цзы", era: "544-496 до н.э." },
      { text: "Тот, кто умеет ждать, всегда побеждает.", author: "Сунь-Цзы", era: "544-496 до н.э." },
      { text: "Воин побеждает там, где другие видят лишь хаос.", author: "Сунь-Цзы", era: "544-496 до н.э." },
    ],
  },
  {
    id: "marcus-aurelius-meditations",
    title: "Наедине с собой",
    author: "Марк Аврелий",
    coverImage: "/book-covers/marcus-aurelius-meditations.jpg",
    spineImage: "/book-spines/marcus-aurelius-meditations.svg",
    backCoverImage: "/book-covers/marcus-aurelius-meditations-back.jpg",
    description: "Размышления императора-стоика",
    color: "#d4af37", // золотой
    quotes: [
      { text: "Не тревожься о будущем. Ты встретишь его, если это будет нужно, с тем же разумом, который сейчас у тебя есть.", author: "Марк Аврелий", era: "121-180 н.э." },
      { text: "Сила человека не в том, чтобы властвовать над людьми, а в том, чтобы властвовать над собой.", author: "Марк Аврелий", era: "121-180 н.э." },
      { text: "Жизнь — это борьба и путешествие по чужбине.", author: "Марк Аврелий", era: "121-180 н.э." },
      { text: "Вся наша жизнь есть лишь мысль.", author: "Марк Аврелий", era: "121-180 н.э." },
      { text: "Лучший способ отомстить врагу — не уподобляться ему.", author: "Марк Аврелий", era: "121-180 н.э." },
      { text: "Счастье вашей жизни зависит от качества ваших мыслей.", author: "Марк Аврелий", era: "121-180 н.э." },
      { text: "Ты властен над своим разумом — не над внешними событиями. Осознай это, и ты обретешь силу.", author: "Марк Аврелий", era: "121-180 н.э." },
      { text: "Почти ничего не нужно для счастливой жизни; всё зависит от твоего образа мыслей.", author: "Марк Аврелий", era: "121-180 н.э." },
    ],
  },
  {
    id: "epictetus-our-good",
    title: "В чём наше благо?",
    author: "Эпиктет",
    coverImage: "/book-covers/epictetus-our-good.jpg",
    spineImage: "/book-spines/epictetus-our-good.svg",
    backCoverImage: "/book-covers/epictetus-our-good-back.jpg",
    description: "Учение стоического мудреца",
    color: "#059669", // изумрудный
    quotes: [
      { text: "Сделай себе простым и добрым, как хочет того природа.", author: "Эпиктет", era: "50-135 н.э." },
      { text: "Кто не довольствуется малым, тот ничем не будет доволен.", author: "Эпиктет", era: "50-135 н.э." },
      { text: "Мудрому свойственно не избегать трудностей, а преодолевать их.", author: "Эпиктет", era: "50-135 н.э." },
      { text: "Сначала скажи себе, кем ты хочешь быть, а потом делай то, что должен.", author: "Эпиктет", era: "50-135 н.э." },
      { text: "Человек должен бояться не смерти, а начала жизни.", author: "Эпиктет", era: "50-135 н.э." },
      { text: "Никакое зло не может случиться с хорошим человеком ни при жизни, ни после смерти.", author: "Эпиктет", era: "50-135 н.э." },
      { text: "Богатство не в обладании сокровищами, а в умении довольствоваться малым.", author: "Эпиктет", era: "50-135 н.э." },
      { text: "Только образованный человек свободен.", author: "Эпиктет", era: "50-135 н.э." },
    ],
  },
  {
    id: "christensen-innovators-solution",
    title: "Закон успешных инноваций",
    author: "Клейтон Кристенсен и др.",
    coverImage: "/book-covers/christensen-innovators-solution.jpg",
    spineImage: "/book-spines/christensen-innovators-solution.svg",
    backCoverImage: "/book-covers/christensen-innovators-solution-back.jpg",
    description: "Зачем клиент «нанимает» ваш продукт",
    color: "#7c3aed", // фиолетовый
    quotes: [
      { text: "Клиенты не покупают продукты, они «нанимают» их для выполнения работы.", author: "Клейтон Кристенсен", era: "1952-2020" },
      { text: "Инновации — это не только технология, это бизнес-модель.", author: "Клейтон Кристенсен", era: "1952-2020" },
      { text: "Успешные компании часто терпят неудачу, потому что делают всё правильно.", author: "Клейтон Кристенсен", era: "1952-2020" },
      { text: "Важно не то, что вы создаёте, а то, какую проблему решаете для клиента.", author: "Клейтон Кристенсен", era: "1952-2020" },
      { text: "Рынки, которые не существуют, невозможно проанализировать.", author: "Клейтон Кристенсен", era: "1952-2020" },
      { text: "Дизраптивные инновации начинаются с простых решений для непритязательных клиентов.", author: "Клейтон Кристенсен", era: "1952-2020" },
      { text: "Измеряйте успех не прибылью, а прогрессом клиента.", author: "Клейтон Кристенсен", era: "1952-2020" },
      { text: "Самая опасная конкурентная угроза — та, которую вы не видите.", author: "Клейтон Кристенсен", era: "1952-2020" },
    ],
  },
];

export function getBookById(id: string): Book | undefined {
  return books.find(book => book.id === id);
}

export function getDefaultBook(): Book {
  return books[0];
}
