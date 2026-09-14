const API_URL = 'http://localhost:3001'

export async function getAll(collection) {
  const res = await fetch(`${API_URL}/${collection}`)
  return res.json()
}

export async function create(collection, data) {
  const res = await fetch(`${API_URL}/${collection}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  return res.json()
}
