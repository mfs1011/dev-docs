export const get = (url: string) => fetch(`/api${url}`).then((r) => r.json())
