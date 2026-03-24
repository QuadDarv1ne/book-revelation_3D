import type { Book } from "@/data/books";

/**
 * Generates book-specific metadata for SEO
 */
export function generateBookMetadata(book: Book) {
  const title = `${book.title} — ${book.author}`;
  const description = `Интерактивная 3D книга: ${book.title} автора ${book.author}. ${book.quotes.length} цитат по темам: ${getCategoriesPreview(book.quotes)}.`;
  const keywords = [
    book.title,
    book.author,
    book.id,
    "стоицизм",
    "философия",
    "3D книга",
    "цитаты",
    ...getQuoteCategories(book.quotes),
  ].join(", ");

  return {
    title,
    description,
    keywords,
    openGraph: {
      title,
      description,
      type: "book" as const,
      book: {
        author: book.author,
        tag: getQuoteCategories(book.quotes),
      },
    },
    twitter: {
      title,
      description,
      card: "summary_large_image" as const,
    },
  };
}

/**
 * Generates JSON-LD structured data for a book
 */
export function generateBookJsonLd(book: Book): string {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Book",
    "name": book.title,
    "author": {
      "@type": "Person",
      "name": book.author,
    },
    "description": `Коллекция из ${book.quotes.length} цитат из книги "${book.title}"`,
    "inLanguage": ["ru", "en", "zh", "he", "es", "fr", "de"],
    "genre": ["Philosophy", "Stoicism"],
    "keywords": getQuoteCategories(book.quotes).join(", "),
    "numberOfPages": book.quotes.length,
    "potentialAction": {
      "@type": "ReadAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `https://book-revelation-3d.vercel.app?book=${book.id}`,
      },
    },
  });
}

/**
 * Generates FAQ JSON-LD for quotes
 */
export function generateQuotesFAQJsonLd(book: Book): string {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": book.quotes.slice(0, 5).map((quote) => ({
      "@type": "Question",
      "name": `Цитата: ${quote.author}`,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": quote.text,
      },
    })),
  });
}

function getQuoteCategories(quotes: Book["quotes"]): string[] {
  const categories = new Set<string>();
  quotes.forEach((quote) => {
    if (quote.category) {
      categories.add(quote.category);
    }
  });
  return Array.from(categories);
}

function getCategoriesPreview(quotes: Book["quotes"]): string {
  const categories = getQuoteCategories(quotes);
  return categories.slice(0, 3).join(", ") + (categories.length > 3 ? ` и ещё ${categories.length - 3}` : "");
}
