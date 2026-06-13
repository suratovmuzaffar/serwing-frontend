// src/shared/hooks/useFetch.ts
export const useFetch = () => {
  const get = async (url: string) => fetch(url).then((r) => r.json());
  return { get };
};
