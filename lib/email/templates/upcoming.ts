type Item = { name: string; amount: string | number; currency: string; nextChargeDate: string; billingCycle: string }

export function upcomingSubject(days: number) {
    return `Upcoming charges in next ${days} days`
}

export function upcomingHtml(ownerId: string, items: Item[], days: number) {
    const rows = items.map(
        (s) => `
      <tr>
        <td style="padding:6px 8px;">${s.name}</td>
        <td style="padding:6px 8px;">${new Date(s.nextChargeDate).toLocaleDateString()}</td>
        <td style="padding:6px 8px; text-align:right;">
          ${new Intl.NumberFormat(undefined, { style: 'currency', currency: s.currency }).format(Number(s.amount))}
        </td>
        <td style="padding:6px 8px; text-transform:capitalize;">${s.billingCycle}</td>
      </tr>`
    ).join('')

    return `
  <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif">
    <h2 style="margin:0 0 8px">BillTide reminders</h2>
    <p>Owner: <code>${ownerId}</code></p>
    <p>The following subscriptions are due within the next ${days} day(s):</p>
    <table cellpadding="0" cellspacing="0" style="border-collapse:collapse; width:100%">
      <thead>
        <tr>
          <th align="left" style="padding:6px 8px;">Name</th>
          <th align="left" style="padding:6px 8px;">Date</th>
          <th align="right" style="padding:6px 8px;">Amount</th>
          <th align="left" style="padding:6px 8px;">Cycle</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  </div>`
}
