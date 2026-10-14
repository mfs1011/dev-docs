export async function apiGet<T>(path: string): Promise<T> {
  const response = await fetch(`https://api.realworld.io/api${path}`)
  return response.json() as Promise<T>
}
