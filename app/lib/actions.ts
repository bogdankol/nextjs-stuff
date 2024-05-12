'use server'

import { z } from 'zod';;;;
import { sql } from '@vercel/postgres';;;
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation';
import { signIn } from '@/auth';
import { AuthError } from 'next-auth';

const FormSchema = z.object({
  id: z.string(),
  customerId: z.string({
    invalid_type_error: 'select a customer asshole'
  }),
  amount: z.coerce.number().gt(0, {message: ' enter an amount asshole'}),
  status: z.enum(['pending', 'paid'], {
    invalid_type_error: 'select invoice`s status asshole'
  }),
  date: z.string(),
});

const CreateInvoice = FormSchema.omit({ id: true, date: true });

export type State = {
  errors?: {
    customerId?: string[];
    amount?: string[];
    status?: string[];
  };
  message?: string | null;
};

export async function createInvoice2(prevState: State, formData: FormData) {
  'use server'
  const validatedFields  = CreateInvoice.safeParse({
    customerId: formData.get('customerId'),
    status: formData.get('status'),
    amount: formData.get('amount'),
  })

   // If form validation fails, return errors early. Otherwise, continue.
   if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Create Invoice.',
    };
  }
  
  const { customerId, amount, status } = validatedFields.data
  const cents = amount * 100
  const date = new Date().toISOString().split('T')[0]

  // console.log({data, data2: [...formData.entries()], data3: Object.fromEntries(formData.entries())})
  // console.log({
  //   1: new Date(),
  //   2: new Date().toISOString(),
  //   3: new Date().toISOString().split('T')
  // })

  try {
    await sql`
      INSERT INTO invoices (customer_id, amount, status, date)
      VALUES (${customerId}, ${cents}, ${status}, ${date})
    `;
    revalidatePath('/dashboard/invoices')
  } catch (error) {
    return {
      message: 'Database Error: Failed to Create Invoice.',
    };
  }

  // if we don't revalidate cache - cached page will remain unrenewed, to fix it
  //  we manually say that the page with all invoices should be revalidated
  //  and another request would be made to get updated data - it's a good practice
  //  yet you may notice that after some requests data is updated even without
  //  manual revalidation

  redirect('/dashboard/invoices')
}

export async function createInvoice1(formData: FormData) {
  'use server'
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

  try {
    await sql`
      INSERT INTO invoices (customer_id, amount, status, date)
      VALUES (${customerId}, ${cents}, ${status}, ${date})
    `;
    revalidatePath('/dashboard/invoices')
  } catch (error) {
    return {
      message: 'Database Error: Failed to Create Invoice.',
    };
  }

  // if we don't revalidate cache - cached page will remain unrenewed, to fix it
  //  we manually say that the page with all invoices should be revalidated
  //  and another request would be made to get updated data - it's a good practice
  //  yet you may notice that after some requests data is updated even without
  //  manual revalidation

  redirect('/dashboard/invoices')
}

// Use Zod to update the expected types
const UpdateInvoice = FormSchema.omit({ id: true, date: true });
 
export async function updateInvoice2(id: string, prevState: State, formData: FormData) {
  const validateData = UpdateInvoice.safeParse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });

  if(!validateData.success) {
    return {
      errors: validateData.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Update Invoice.',
    };
  }
 
  const { customerId, amount, status } = validateData.data
  const amountInCents = amount * 100;
 
  try {
    await sql`
      UPDATE invoices
      SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
      WHERE id = ${id}
    `;
    revalidatePath('/dashboard/invoices');

  } catch (error) {
    return { message: 'Database Error: Failed to Update Invoice.' };
  }
 
  redirect('/dashboard/invoices');
}

export async function updateInvoice1(id: string, formData: FormData) {
  const { customerId, amount, status } = UpdateInvoice.parse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });
 
  const amountInCents = amount * 100;
 
  try {
    await sql`
      UPDATE invoices
      SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
      WHERE id = ${id}
    `;
    revalidatePath('/dashboard/invoices');

  } catch (error) {
    return { message: 'Database Error: Failed to Update Invoice.' };
  }
 
  redirect('/dashboard/invoices');
}

export async function deleteInvoice(id: string) {
  // throw new Error('11Failed to Delete Invoice')
  try {
    await sql`DELETE FROM invoices WHERE id = ${id}`;
    revalidatePath('/dashboard/invoices');
    return { message: 'Deleted Invoice.' };
  } catch (error) {
    return { message: 'Database Error: Failed to Delete Invoice.' };
  }
}

export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    await signIn('credentials', formData);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return 'Invalid credentials.';
        default:
          return 'Something went wrong.';
      }
    }
    throw error;
  }
}