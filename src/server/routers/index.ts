import { router } from "../trpc"
import { vehicleRouter } from "./vehicle"
import { customerRouter } from "./customer"
import { contractRouter } from "./contract"
import { invoiceRouter } from "./invoice"
import { leadRouter } from "./lead"
import { blogRouter } from "./blog"

export const appRouter = router({
  vehicle: vehicleRouter,
  customer: customerRouter,
  contract: contractRouter,
  invoice: invoiceRouter,
  lead: leadRouter,
  blog: blogRouter,
})

export type AppRouter = typeof appRouter
