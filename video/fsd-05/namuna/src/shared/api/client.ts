export async function post(path: string, body: unknown): Promise<Response> {
  return fetch(`/api${path}`, { method: 'POST', body: JSON.stringify(body) })
}
