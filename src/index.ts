import { Hono } from 'hono'
import { readPlaces, addGifts, fulfillDelivery, fulfillAll, deleteDelivery } from './db/queries'

const app = new Hono()

app.get('/', (c) => {
  return c.text(`Hello Hono!
                GET /api/places to see the places data
                POST /api/places/gifts with { locationName, numGifts } to add gifts
                POST /api/places/fulfillall with { locationName } to fulfill all gifts
                POST /api/places/fulfill with { locationName, numGifts } to fulfill specific number of gifts
                DELETE /api/places with { locationName } to delete a delivery
                `)
})


app.get('/api/testinfo', (c) => {
  addGifts('Test Location', 5)
  addGifts('Another Location', 3)
  return c.json({ message: 'Test data added' }, 201)
})

app.get('/api/places', (c) => {
  try {
    const places = readPlaces()
    return c.json(places)
  } catch (error) {
    return c.json({ error: 'Failed to fetch places' }, 500)
  }
})


app.post('/api/places/gifts', async (c) => {
  try {
    const { locationName, numGifts } = await c.req.json()

    if (!locationName || typeof numGifts !== 'number') {
      return c.json({ error: 'Invalid request body' }, 400)
    }

    addGifts(locationName, numGifts)
    return c.json({ success: true, locationName, numGifts }, 201)
  } catch (error) {
    return c.json({ error: 'Failed to add gifts' }, 500)
  }
})


app.post('/api/places/fulfillall', async (c) => {
  try {
    const { locationName } = await c.req.json()

    if (!locationName) {
      return c.json({ error: 'Location name is required' }, 400)
    }

    fulfillAll(locationName)
    return c.json({ success: true, locationName })
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : 'Failed to fulfill delivery' }, 404)
  }
})

app.post('/api/places/fulfill', async (c) => {
  try {
    const { locationName, numGifts } = await c.req.json()

    if (!locationName || typeof numGifts !== 'number') {
      return c.json({ error: 'Invalid request body' }, 400)
    }

    
    fulfillDelivery(locationName, numGifts)

    return c.json({ success: true, locationName, numGifts })
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : 'Failed to fulfill gifts' }, 404)
  }
})

app.delete('/api/places', async (c) => {
  try {
    const { locationName } = await c.req.json()

    if (!locationName) {
      return c.json({ error: 'Location name is required' }, 400)
    }

    deleteDelivery(locationName)
    return c.json({ success: true, locationName })
  } catch (error) {
    return c.json({ error: 'Failed to delete delivery' }, 500)
  }
})

const port = Number(process.env.PORT) || 3000

export default {
  port,
  fetch: app.fetch,
}
