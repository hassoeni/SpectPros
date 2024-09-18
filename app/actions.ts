"use server";

import { encodedRedirect } from "@/utils/utils";
import { createClient } from "@/utils/supabase/server";
import { headers } from "next/headers";
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';

const supabase = createClient();

export const signUpAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();
  const supabase = createClient();
  const origin = headers().get("origin");

  if (!email || !password) {
    return { error: "Email and password are required" };
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    console.error(error.code + " " + error.message);
    return encodedRedirect("error", "/sign-up", error.message);
  } else {
    return encodedRedirect(
      "success",
      "/sign-up",
      "Thanks for signing up! Please check your email for a verification link.",
    );
  }
};

export const signInAction = async (formData: FormData) => {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const supabase = createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return encodedRedirect("error", "/sign-in", error.message);
  }

  return redirect("/dashboard"); // TODO: Redirect to the dashboard page previously was /protected
};

export const forgotPasswordAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const supabase = createClient();
  const origin = headers().get("origin");
  const callbackUrl = formData.get("callbackUrl")?.toString();

  if (!email) {
    return encodedRedirect("error", "/forgot-password", "Email is required");
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?redirect_to=/protected/reset-password`,
  });

  if (error) {
    console.error(error.message);
    return encodedRedirect(
      "error",
      "/forgot-password",
      "Could not reset password",
    );
  }

  if (callbackUrl) {
    return redirect(callbackUrl);
  }

  return encodedRedirect(
    "success",
    "/forgot-password",
    "Check your email for a link to reset your password.",
  );
};

export const resetPasswordAction = async (formData: FormData) => {
  const supabase = createClient();

  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!password || !confirmPassword) {
    encodedRedirect(
      "error",
      "/protected/reset-password",
      "Password and confirm password are required",
    );
  }

  if (password !== confirmPassword) {
    encodedRedirect(
      "error",
      "/protected/reset-password",
      "Passwords do not match",
    );
  }

  const { error } = await supabase.auth.updateUser({
    password: password,
  });

  if (error) {
    encodedRedirect(
      "error",
      "/protected/reset-password",
      "Password update failed",
    );
  }

  encodedRedirect("success", "/protected/reset-password", "Password updated");
};

export const signOutAction = async () => {
  const supabase = createClient();
  await supabase.auth.signOut();
  return redirect("/sign-in");
};

const FormSchema = z.object({
  id: z.string(),
  customerId: z.string(),
  amount: z.coerce.number(),
  status: z.enum(['pending', 'paid']),
  date: z.string(),
});
const CreateInvoice = FormSchema.omit({ id: true, date: true });

export async function deleteInvoice(id: string) {
  try {
    await supabase
      .from('invoices')
      .delete()
      .eq('id', id);
  } catch (error) {
    console.error('Error deleting invoice:', error);
    throw error;
  }
  console.log('Invoice deleted:', id);
  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}

// Use Zod to update the expected types
export async function updateInvoice(id: string, formData: FormData) {
  console.log("updateInvoice called for ID:", id);
  
  const customerId = formData.get('customerId');
  const amount = formData.get('amount');
  const status = formData.get('status');

  if (!customerId || !amount || !status) {
    console.error("Missing fields in form data");
    return encodedRedirect("error", "/dashboard/invoices", "All fields are required.");
  }

  const amountInCents = Math.round(Number(amount) * 100);
  try {
    await supabase
      .from('invoices')
      .update({ customer_id: customerId, amount: amountInCents, status })
      .eq('id', id);
    console.log("Invoice updated successfully");
  } catch (error) {
    console.error('Error updating invoice:', error);
    throw error;
  }

  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}
// export async function updateInvoice(id, formData, prevState) {
//   const customerId = formData.get('customerId');
//   const amount = formData.get('amount');
//   const status = formData.get('status');

//   // Basic validation
//   if (!customerId || isNaN(amount) || !['pending', 'paid'].includes(status)) {
//     throw new Error('Invalid form data');
//   }

//   const amountInCents = Math.round(amount * 100);
//   try {

//     await supabase
//       .from('invoices')
//       .update({ customer_id: customerId, amount: amountInCents, status })
//       .eq('id', id);
//   } catch (error) {
//     console.error('Error updating invoice:', error);
//     throw error;
//   }

//   revalidatePath('/dashboard/invoices');
//   redirect('/dashboard/invoices');
// }


export async function createInvoice(formData: FormData) {
  const { customerId, amount, status } = CreateInvoice.parse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });

  const amountInCents = amount * 100;
  const date = new Date().toISOString().split('T')[0];

  try {
    await supabase
      .from('invoices')
      .insert([
        { customer_id: customerId, amount: amountInCents, status, date }
      ]);
      console.log('Invoice created for customer:', customerId);
  } catch (error) {
    console.error('Error creating invoice:', error);
    throw error;
  }

  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}


