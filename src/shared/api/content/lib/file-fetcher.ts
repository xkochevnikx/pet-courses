export class FileFetcher {
  private authToken;

  constructor(token?: string) {
    this.authToken = token;
  }

  async fetchText(url: string) {
    return fetch(url, {
      headers: {
        ...(this.authToken
          ? {
              Authorization: `Bearer ${this.authToken}`,
            }
          : {}),
      },
    }).then((res) => res.text());
  }
}
