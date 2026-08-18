export function calculateRow(row: any) {
  const e = Number(row.emi_amt) || 0;
  const pos = Number(row.principal_outstanding) || 0;
  
  // Base confirmed DAC
  let dac = Number(row.dac ?? row.DAC) || 0;
  
  // Include Provisional DAC if it exists and is NOT a conflict
  if (row.provisional_dac && !row.is_conflict) {
    dac += Number(row.provisional_dac) || 0;
  }
  
  const ecs = Number(row.ecs ?? row.ECS) || 0;
  const special = Number(row.special ?? row.Special) || 0;
  const approxFC = Number(row.approx_forclosure ?? row['Approx Forclosure']) || 0;
  const bkt = Number(row.bom_bkt) || 1;
  const settlement = row.settlement_approved_amt != null
    ? Number(row.settlement_approved_amt)
    : (row['Settlement Approved Amount'] != null ? Number(row['Settlement Approved Amount']) : null);
  const lastMonthPaid = Boolean(row.last_month_paid_flag ?? row['Last Month Paid Flag']);

  const emi1 = e, emi2 = e * 2, emi3 = e * 3, emi4 = e * 4;
  const total = dac + ecs + special;
  const newTotal = Number(row.new_total ?? row['New Total']) || 0;
  const remaining = total - newTotal;
  const totalPerEmi = e > 0 ? total / e : 0;
  const posCleared = pos - total;
  const fcCleared = approxFC - total;
  const rbCondition = emi2 - total;

  const shortIn1 = (!approxFC || !total) ? null : (total < emi1 ? emi1 - total : 0);
  const shortIn2 = (!approxFC || !total) ? null
    : (total > emi1 && total < emi2 ? emi2 - total : null);

  const ecsCount = dac >= emi1 ? null : ((ecs + special) >= emi1 ? 1 : null);
  const ecsPOS = dac >= emi1 ? null : ((ecs + special) >= emi1 ? pos : null);

  let emiCount = 0;
  if (lastMonthPaid) {
    emiCount = 1;
  } else {
    let pmt = dac;
    let settlementValid = false;
    if (settlement !== null) {
      if (dac >= settlement) { settlementValid = true; pmt = settlement; }
      else pmt = 0;
    }
    let raw = 0;
    if (pmt >= emi4) raw = 4;
    else if (pmt >= emi3) raw = 3;
    else if (pmt >= emi2) raw = 2;
    else if (pmt >= emi1) raw = 1;

    if (raw === 0) {
      if (fcCleared <= 0) raw = 1;
      else if (settlement !== null && settlement < emi1 && settlementValid) raw = 1;
    } else {
      if (pos < raw * e) raw = 1;
    }
    emiCount = Math.min(raw, bkt + 1);
  }

  const teamPaid = (total >= emi1 || fcCleared <= 0 || lastMonthPaid) ? 1 : null;
  const teamUnpaid = teamPaid ? null : 1;
  const teamPaidPOS = teamPaid ? pos : null;
  const teamRBPOS = rbCondition <= 0 ? pos : null;

  const mainPaid = (total >= emi1 || posCleared <= 0 || fcCleared <= 0 || lastMonthPaid) ? 1 : null;
  const unpaid = mainPaid ? 0 : 1;
  const mainUnpaidPOS = unpaid ? pos : null;
  const mainPaidPOS = mainPaid ? pos : null;
  const rollbackPOS = (rbCondition <= 0 || posCleared <= 0) ? pos : null;

  return {
    emi1, emi2, emi3, emi4,
    total, remaining, totalPerEmi,
    shortIn1, shortIn2,
    ecsCount, ecsPOS,
    rbCondition, posCleared, fcCleared,
    emiCount,
    teamPaid, teamUnpaid, teamPaidPOS, teamRBPOS,
    mainPaid, unpaid, mainUnpaidPOS, mainPaidPOS, rollbackPOS,
  };
}
