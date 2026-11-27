import type { ComponentType } from "react"
import type { FlowId, ModuleId } from "@/lib/types"
import { AddressModule } from "./address"
import { AuStatsModule, SupportNeedsModule, UsiModule } from "./au"
import { GovernmentModule } from "./government"
import { IdentityModule } from "./identity"
import { DegreeModule, EntryStatementModule, WorkHistoryModule } from "./masters"
import { MastersFundingModule } from "./masters-funding"
import { MoneyModule } from "./money"
import { PayModule } from "./pay"
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
import { SubmitApplicationModule } from "./submit-application"
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
  usi: UsiModule,
  "support-needs": SupportNeedsModule,
  "au-stats": AuStatsModule,
  degree: DegreeModule,
  "work-history": WorkHistoryModule,
  "entry-statement": EntryStatementModule,
  pay: PayModule,
}

/** Steps that share an id with Spine 1 but need their own screen in a given flow. */
const flowComponents: Partial<Record<FlowId, Partial<Record<ModuleId, ComponentType<ModuleProps>>>>> = {
  "online-apply-assess": {
    money: MastersFundingModule,
    sign: SubmitApplicationModule,
  },
}

export function moduleComponentFor(flow: FlowId, id: ModuleId): ComponentType<ModuleProps> {
  return flowComponents[flow]?.[id] ?? moduleComponents[id]
}
