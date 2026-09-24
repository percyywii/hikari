"use server"
import Hianime from '@consumet/extensions/dist/providers/anime/hianime';
import { compareTwoStrings } from 'string-similarity';

const hianime = new Hianime();
const mappingCache = new Map();


export async function getMappings(title) {
  if (!title) return null;
  const searchTitles = [title.english, title.romaji, title.userPreferred]
    .filter(Boolean)
    .filter((value, index, values) => values.indexOf(value) === index);
  if (searchTitles.length === 0) return null;
  const cacheKey = searchTitles.join("|").toLowerCase();
  const cached = mappingCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) return cached.id;

  const searches = await Promise.allSettled(searchTitles.map((searchTitle) => hianime.search(searchTitle)));
  const searchResults = searches.flatMap((result) => result.status === "fulfilled" ? result.value?.results || [] : []);
  // Combine both results and remove duplicates
  const uniqueResults = Array.from(new Set(searchResults.map(item => JSON.stringify(item))))
    .map(item => JSON.parse(item));

  let highestComp = 0;
  let similarity_id = "";

  uniqueResults?.forEach((obj, i) => {
    const id = obj.id;
    const ob_title = obj.title;
    const ob_japaneseTitle = obj.japaneseTitle;

    const titleComparisons = searchTitles.flatMap((searchTitle) => [
      compareTwoStrings(searchTitle, ob_title || ""),
      compareTwoStrings(searchTitle, ob_japaneseTitle || ""),
    ]);

    const greatest_title = Math.max(...titleComparisons)

    if (highestComp < greatest_title) {
      highestComp = greatest_title
      similarity_id = id
    }
  });

  mappingCache.set(cacheKey, { id: similarity_id || null, expiresAt: Date.now() + 10 * 60 * 1000 });
  return similarity_id || null;
}
