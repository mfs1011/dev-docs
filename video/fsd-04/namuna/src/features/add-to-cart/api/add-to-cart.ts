export async function addToCart(productId: number): Promise<void> {
  await fetch('/api/cart', { method: 'POST', body: JSON.stringify({ productId }) })
}
