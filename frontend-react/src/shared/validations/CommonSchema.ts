import { z } from 'zod'

export const MetaPagination = z
  .object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number()
  })
  .strip()

export type MetaPagination = z.infer<typeof MetaPagination>

export const BaseEntityDTO = z.object({
  id: z.string(),
  createdAt: z.date(),
  updatedAt: z.date()
})
