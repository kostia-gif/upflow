import type { ComponentType } from "react"
import type { ModuleId } from "@/lib/types"
import { AddressModule } from "./address"
import { GovernmentModule } from "./government"
import { IdentityModule } from "./identity"
import { MoneyModule } from "./money"
import { SchoolRecordModule } from "./school-record"
import { SignModule } from "./sign"
import {
  CreditModule,
  KitModule,
  PlacementCheckModule,
  PortfolioModule,
  StatementModule,
  SupportPersonModule,
} from "./simple"
import type { ModuleProps } from "./types"

export const moduleComponents: Record<ModuleId, ComponentType<ModuleProps>> = {
  identity: IdentityModule,
  address: AddressModule,
  "school-record": SchoolRecordModule,
  government: GovernmentModule,
  money: MoneyModule,
  "support-person": SupportPersonModule,
  credit: CreditModule,
  statement: StatementModule,
  portfolio: PortfolioModule,
  "placement-check": PlacementCheckModule,
  kit: KitModule,
  sign: SignModule,
}
