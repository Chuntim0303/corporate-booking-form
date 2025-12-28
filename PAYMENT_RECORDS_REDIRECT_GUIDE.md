# Payment Records Page - Membership Details Redirect

## Feature Requirements

When viewing payment records, if `payments.payment_type = "membership_fee"`, the View button should redirect to the membership details page instead of the default payment details page.

## Implementation Guide

### 1. Database Check

Ensure your query includes the `payment_type` field:

```sql
SELECT
    id,
    contact_id,
    partner_application_id,
    amount,
    payment_type,  -- Required for conditional redirect
    description,
    status,
    created_at
FROM payments
WHERE ...
```

### 2. Frontend Component (React/Next.js Example)

```jsx
// PaymentRecordsTable.jsx

const PaymentRecordsTable = ({ payments }) => {
  const handleViewClick = (payment) => {
    if (payment.payment_type === 'membership_fee') {
      // Redirect to membership details page
      router.push(`/memberships/${payment.partner_application_id}`);
      // OR navigate to contact-based membership page
      // router.push(`/contacts/${payment.contact_id}/membership`);
    } else {
      // Default payment details page
      router.push(`/payments/${payment.id}`);
    }
  };

  return (
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Description</th>
          <th>Amount</th>
          <th>Type</th>
          <th>Status</th>
          <th>Details</th>
        </tr>
      </thead>
      <tbody>
        {payments.map((payment) => (
          <tr key={payment.id}>
            <td>{payment.id}</td>
            <td>{payment.description}</td>
            <td>RM {payment.amount.toFixed(2)}</td>
            <td>{payment.payment_type}</td>
            <td>{payment.status}</td>
            <td>
              <button onClick={() => handleViewClick(payment)}>
                View
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
```

### 3. Backend API Route (Node.js/Express Example)

If you're using a backend API:

```javascript
// routes/payments.js

router.get('/payments/:id/redirect-info', async (req, res) => {
  const payment = await db.query(
    'SELECT id, payment_type, partner_application_id, contact_id FROM payments WHERE id = ?',
    [req.params.id]
  );

  if (payment.payment_type === 'membership_fee') {
    return res.json({
      redirectTo: `/memberships/${payment.partner_application_id}`,
      type: 'membership'
    });
  }

  return res.json({
    redirectTo: `/payments/${payment.id}`,
    type: 'payment'
  });
});
```

### 4. Alternative: Link-based Approach

Instead of a button with onClick, use conditional links:

```jsx
const ViewButton = ({ payment }) => {
  const getViewUrl = () => {
    if (payment.payment_type === 'membership_fee') {
      return `/memberships/${payment.partner_application_id}`;
    }
    return `/payments/${payment.id}`;
  };

  return (
    <Link href={getViewUrl()}>
      <a className="btn btn-primary">View</a>
    </Link>
  );
};
```

### 5. Laravel/PHP Example

```php
// In your PaymentController or similar

public function getViewUrl($payment)
{
    if ($payment->payment_type === 'membership_fee') {
        return route('memberships.show', $payment->partner_application_id);
    }

    return route('payments.show', $payment->id);
}
```

```blade
<!-- In your Blade template -->
@foreach($payments as $payment)
    <tr>
        <td>{{ $payment->id }}</td>
        <td>{{ $payment->description }}</td>
        <td>RM {{ number_format($payment->amount, 2) }}</td>
        <td>{{ $payment->payment_type }}</td>
        <td>
            <a href="{{ $this->getViewUrl($payment) }}" class="btn btn-sm btn-primary">
                View
            </a>
        </td>
    </tr>
@endforeach
```

## Payment Type Values

Based on the corporate booking form implementation, payment types include:

- `membership_fee` - Corporate partnership membership fees (redirect to membership details)
- `partnership_fee` - General partnership fees
- `booking_fee` - Event booking fees
- Other custom types...

## Membership Details Page

The membership details page should display:

1. **Contact Information** (from `contacts` table via `contact_id`)
   - Name, Email, Phone, Address

2. **Partnership Application Details** (from `partner_applications` table via `partner_application_id`)
   - Company name
   - Industry
   - Partnership tier
   - Position
   - Application status
   - Submission date
   - Sales rep (UTM source)

3. **Payment Information** (from `payments` table)
   - Amount paid
   - Payment method
   - Payment status
   - Receipt/attachment
   - Transaction date

## Example Query for Membership Details Page

```sql
SELECT
    c.contact_id,
    c.first_name,
    c.last_name,
    c.email_address,
    c.phone_number,
    c.address_line_1,
    c.city,
    c.state,
    pa.partner_application_id,
    pa.company_name,
    pa.industry,
    pa.partnership_tier,
    pa.position,
    pa.status as application_status,
    pa.submitted_at,
    pa.sales_rep,
    p.payment_id,
    p.amount,
    p.payment_method,
    p.description,
    p.status as payment_status,
    p.official_receipt,
    p.attachment,
    p.transaction_datetime
FROM payments p
INNER JOIN contacts c ON p.contact_id = c.contact_id
INNER JOIN partner_applications pa ON p.partner_application_id = pa.partner_application_id
WHERE p.payment_id = ?
```

## Testing Checklist

- [ ] Verify payment records page displays payment_type column
- [ ] Test clicking View button on membership_fee payment redirects correctly
- [ ] Test clicking View button on other payment types uses default redirect
- [ ] Verify membership details page loads with correct data
- [ ] Test with different partnership tiers (gold, silver, platinum)
- [ ] Verify back navigation works correctly

## Notes

- The `payment_type` field is set to `'partnership_fee'` in the booking form, but the description is formatted as `"membership_fee - LastName FirstName"`
- You may want to update the payment insertion to use `'membership_fee'` as the payment_type instead of `'partnership_fee'` for consistency
- Consider adding an icon or badge to visually distinguish membership payments in the list
