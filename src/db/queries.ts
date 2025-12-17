import { db } from "./index"
import { places } from "./schema"
import { eq, desc } from "drizzle-orm"


export function readPlaces() {
  return db.select().from(places).orderBy(desc(places.id)).all()
}


export function addGifts(locationName: string, numGifts: number) {
  const existing = db
    .select()
    .from(places)
    .where(eq(places.name, locationName))
    .get()

  if (existing) {
    const res = db
      .update(places)
      .set({ toBeFulfilled: existing.toBeFulfilled + numGifts })
      .where(eq(places.name, locationName))
      .run()

    return { changes: res.changes }
  } else {
    const res = db
      .insert(places)
      .values({
        name: locationName,
        fulfilled: 0,
        toBeFulfilled: numGifts,
      })
      .run()

    return { id: Number(res.lastInsertRowid) }
  }
}


export function fulfillAll(locationName: string) {
  const existing = db
    .select()
    .from(places)
    .where(eq(places.name, locationName))
    .get()

  if (!existing) {
    throw new Error(`Location "${locationName}" not found`)
  }

  const res = db
    .update(places)
    .set({
      fulfilled: existing.fulfilled + existing.toBeFulfilled,
      toBeFulfilled: 0,
    })
    .where(eq(places.name, locationName))
    .run()

  return { changes: res.changes }
}

export function fulfillDelivery(locationName: string, numGifts: number) {
  const existing = db
    .select()
    .from(places)
    .where(eq(places.name, locationName))
    .get()

  if (!existing) {
    throw new Error(`Location "${locationName}" not found`)
  }
  if (existing.toBeFulfilled < numGifts) {
    throw new Error(`Not enough gifts to fulfill for location "${locationName}"`)
    }


  const res = db
    .update(places)
    .set({
      fulfilled: existing.fulfilled + numGifts,
      toBeFulfilled: existing.toBeFulfilled - numGifts,
    })
    .where(eq(places.name, locationName))
    .run()

  return { changes: res.changes }
}


export function deleteDelivery(locationName: string) {
  const res = db.delete(places).where(eq(places.name, locationName)).run()

  return { changes: res.changes }
}