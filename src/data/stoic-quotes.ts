/**
 * Статические данные стоических цитат для gamification
 */

export interface StoicQuoteData {
  quote: string;
  author: string;
}

export const STOIC_QUOTES: StoicQuoteData[] = [
  { quote: "Счастье вашей жизни зависит от качества ваших мыслей.", author: "Марк Аврелий" },
  { quote: "Лучший способ отомстить врагу — не уподобляться ему.", author: "Эпиктет" },
  { quote: "Кто не знает, куда направляется, очень удивится, попав не туда.", author: "Сенека" },
  { quote: "Мы страдаем чаще в воображении, чем в действительности.", author: "Сенека" },
  { quote: "Сначала убедись, что ты независим; иначе твоя свобода будет зависеть от других.", author: "Эпиктет" },
  { quote: "Наша жизнь — это то, что о ней думают наши боги.", author: "Марк Аврелий" },
  { quote: "Власть над собой — высшая власть.", author: "Сенека" },
  { quote: "Человек боящийся смерти, никогда не сделает ничего достойного живого.", author: "Сенека" },
  { quote: "У тебя есть власть над своим умом — не снаружи. Осознай это, и ты обретешь силу.", author: "Марк Аврелий" },
];

export function getRandomStoicQuote(): StoicQuoteData {
  const index = Math.floor(Math.random() * STOIC_QUOTES.length);
  return STOIC_QUOTES[index];
}
