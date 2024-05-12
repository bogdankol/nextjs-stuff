'use server'
import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function submitHandler(id: string, sum: number, status: 'paid', date: string) {

  await sql`
    INSERT INTO invoices (customer_id, amount, status, date)
    VALUES (${id}, ${sum}, ${status}, ${date})
  `

  console.log(' executed', {
    id, sum, status, date
  })
  revalidatePath('/dashboard/invoices')
  redirect('/dashboard/invoices')
}