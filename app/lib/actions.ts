'use server'

import { z } from 'zod';;;;
import { sql } from '@vercel/postgres';;;
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation';

const FormSchema = z.object({
  id: z.string(),
  customerId: z.string(),
  amount: z.coerce.number(),
  status: z.enum(['pending', 'paid']),
  date: z.string(),
});

const CreateInvoice = FormSchema.omit({ id: true, date: true });

export async function createInvoice(formData: FormData) {
  const { customerId, amount, status } = CreateInvoice.parse({
    customerId: formData.get('customerId'),
    status: formData.get('status'),
    amount: formData.get('amount'),
  })
  const cents = amount * 100
  const date = new Date().toISOString().split('T')[0]

  // console.log({data, data2: [...formData.entries()], data3: Object.fromEntries(formData.entries())})
  // console.log({
  //   1: new Date(),
  //   2: new Date().toISOString(),
  //   3: new Date().toISOString().split('T')
  // })

  await sql`
    INSERT INTO invoices (customer_id, amount, status, date)
    VALUES (${customerId}, ${cents}, ${status}, ${date})
  `

  // if we don't revalidate cache - cached page will remain unrenewed, to fix it
  //  we manually say that the page with all invoices should be revalidated
  //  and another request would be made to get updated data - it's a good practice
  //  yet you may notice that after some requests data is updated even without
  //  manual revalidation

  revalidatePath('/dashboard/invoices')
  redirect('/dashboard/invoices')
}

// Use Zod to update the expected types
const UpdateInvoice = FormSchema.omit({ id: true, date: true });
 
export async function updateInvoice(id: string, formData: FormData) {
  const { customerId, amount, status } = UpdateInvoice.parse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });
 
  const amountInCents = amount * 100;
 
  await sql`
    UPDATE invoices
    SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
    WHERE id = ${id}
  `;
 
  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}

export async function deleteInvoice(id: string) {
  await sql`DELETE FROM invoices WHERE id = ${id}`;
  revalidatePath('/dashboard/invoices');
}