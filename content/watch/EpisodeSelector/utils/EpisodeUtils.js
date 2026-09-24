export const filterEpisodes = (episodes, isSubSelected, loading) => {
  if (loading) return [];
  return episodes.filter(
    (data) =>
      data?.playable !== false && (isSubSelected ? data?.isSubbed !== false : data?.isDubbed !== false)
  );
};

export const chunkEpisodes = (data, chunkSize) => {
  return data?.reduce((chunks, _, i) => {
    if (i % chunkSize === 0) chunks.push(data.slice(i, i + chunkSize));
    return chunks;
  }, []);
};
