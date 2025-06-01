import { QueryClient } from "@tanstack/react-query";

export class CacheStrategy {
  private queryClient: QueryClient;

  constructor(client: QueryClient) {
    this.queryClient = client;
  }

  private getQueryOptions(key: unknown[]) {
    const persistent = ["lesson", "course", "manifest"];
    const shouldCache = persistent.includes(String(key[0]));

    return {
      staleTime: shouldCache ? 60 * 60 * 1000 : 0,
      cacheTime: shouldCache ? 60 * 60 * 1000 : 0,
    };
  }

  fetch<T>(key: unknown[], getData: () => Promise<T>) {
    return this.queryClient.fetchQuery({
      queryKey: key,
      queryFn: getData,
      ...this.getQueryOptions(key),
    });
  }
}
