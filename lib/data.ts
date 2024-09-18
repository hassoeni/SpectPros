import {
  CustomerField,
  CustomersTableType,
  InvoiceForm,
  InvoicesTable,
  LatestInvoiceRaw,
  Revenue,
} from './definitions';
import { formatCurrency } from '../../../PureFrontend/nextjs-dashboard/app/lib/utils';
import { createClient } from "@/utils/supabase/server";


const supabase = createClient();

export async function fetchRevenue() {
  try {
    console.log('Fetching revenue data...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    const { data, error } = await supabase.from('revenue').select('*');
    if (error) throw new Error('Failed to fetch revenue data.');
    return data;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch revenue data.');
  }
}

export async function fetchLatestInvoices() {
  try {
    console.log('Fetching latest invoices...'); //to be deleted after testing
    await new Promise(resolve => setTimeout(resolve, 3000)); // to be deleted after testing
    const { data, error } = await supabase
      .from('invoices')
      .select('amount, customers(name, image_url, email)')
      .order('date', { ascending: false })
      .limit(5);

    if (error) throw new Error('Failed to fetch the latest invoices.');

    return data.map((invoice) => ({
      ...invoice,
      amount: formatCurrency(invoice.amount),
    }));
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch the latest invoices.');
  }
}

export async function fetchCardData() {
  try {
    console.log('Fetching card data...'); // to be deleted after testing
    await new Promise(resolve => setTimeout(resolve, 3000)); // to be deleted after testing
    const invoiceCountPromise = supabase
      .from('invoices') // from supabase table invoices select all and count the number of invoices
      .select('*', { count: 'exact', head: true });
    const customerCountPromise = supabase
      .from('customers')
      .select('*', { count: 'exact', head: true });
    const invoiceStatusPromise = supabase
      .from('invoices')
      .select('status, amount');

    const [
      { count: invoiceCount, error: invoiceError },
      { count: customerCount, error: customerError },
      { data: invoiceStatusData, error: statusError }
    ] = await Promise.all([
      invoiceCountPromise,
      customerCountPromise,
      invoiceStatusPromise,
    ]);

    if (invoiceError || customerError || statusError) {
      throw new Error('Failed to fetch card data');
    }

    const numberOfInvoices = invoiceCount || 0;
    const numberOfCustomers = customerCount || 0;
    const totalPaidInvoices = formatCurrency(
      invoiceStatusData
        .filter(invoice => invoice.status === 'paid')
        .reduce((sum, invoice) => sum + invoice.amount, 0)
    );
    const totalPendingInvoices = formatCurrency(
      invoiceStatusData
        .filter(invoice => invoice.status === 'pending')
        .reduce((sum, invoice) => sum + invoice.amount, 0)
    );

    return {
      numberOfCustomers,
      numberOfInvoices,
      totalPaidInvoices,
      totalPendingInvoices,
    };
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch card data.');
  }
}

const ITEMS_PER_PAGE = 6;
export async function fetchFilteredInvoices(
  query: string,
  currentPage: number,
) {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  try {
    console.log('Fetching filtered invoices...');
    console.log(`Query: ${query}, Current Page: ${currentPage}, Offset: ${offset}`);

    let invoiceQuery = supabase
      .from('invoices')
      .select(`
        id,
        amount,
        date,
        status,
        customers (
          name,
          email,
          image_url
        )
      `)
      .order('date', { ascending: false });

    if (query) {
      invoiceQuery = invoiceQuery
        .filter('customers.name', 'ilike', `%${query}%`)
        .not('customers', 'is', null);
    }

    // Apply pagination after filtering
    invoiceQuery = invoiceQuery.range(offset, offset + ITEMS_PER_PAGE - 1);

    const { data: invoices, error } = await invoiceQuery;

    if (error) {
      console.error('Supabase error:', error);
      throw new Error('Failed to fetch invoices.');
    }

    console.log(`Fetched ${invoices.length} invoices`);

    // Filter out any invoices with null customers (shouldn't be necessary, but just in case)
    const filteredInvoices = invoices.filter(invoice => invoice.customers !== null);

    return filteredInvoices;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch invoices.');
  }
}

export async function fetchInvoicesPages(query: string) {
  try {
    console.log('Fetching total number of invoices...');

    let countQuery = supabase
      .from('invoices')
      .select('id, customers!inner(name)', { count: 'exact', head: true })
      .order('date', { ascending: false });

    if (query) {
      countQuery = countQuery
        .ilike('customers.name', `%${query}%`);
    }

    const { count, error } = await countQuery;

    if (error) {
      console.error('Supabase error:', error);
      throw new Error('Failed to fetch total number of invoices.');
    }

    console.log(`Total invoices count: ${count}`);
    const totalPages = Math.ceil(count / ITEMS_PER_PAGE);
    return totalPages;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch total number of invoices.');
  }
}

export async function fetchInvoiceById(id: string) {
  try {
    console.log('Fetching invoice by id...'); // to be deleted after testing
    const { data, error } = await supabase
      .from('invoices')
      .select('id, customer_id, amount, status')
      .eq('id', id)
      .single();

    if (error) {
      throw new Error('Failed to fetch invoice.');
    }

    return {
      ...data,
      // Convert amount from cents to dollars
      amount: data.amount,
    };
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch invoice.');
  }
}

export async function fetchCustomers() {
  try {
    console.log('Fetching all customers...'); // to be deleted after testing
    const { data, error } = await supabase
      .from('customers')
      .select('id, name')
      .order('name');

    if (error) {
      throw new Error('Failed to fetch all customers.');
    }

    return data;
  } catch (err) {
    console.error('Database Error:', err);
    throw new Error('Failed to fetch all customers.');
  }
}

export async function fetchFilteredCustomers(query: string) {
  try {
    console.log('Fetching filtered customers...');
    const { data, error } = await supabase
      .from('customers')
      .select(`
        id,
        name,
        email,
        image_url,
        invoices(id, amount, status)
      `)
      .or(`name.ilike.%${query}%,email.ilike.%${query}%`)
      .order('name');

    if (error) {
      console.error('Supabase error:', error);
      throw new Error('Failed to fetch customer table.');
    }

    console.log('Raw data from Supabase:', data);

    const customers = data.map((customer) => {
      const invoices = Array.isArray(customer.invoices) ? customer.invoices : [];
      return {
        ...customer,
        total_invoices: invoices.length,
        total_pending: formatCurrency(
          invoices
            .filter(invoice => invoice.status === 'pending')
            .reduce((sum, invoice) => sum + invoice.amount, 0)
        ),
        total_paid: formatCurrency(
          invoices
            .filter(invoice => invoice.status === 'paid')
            .reduce((sum, invoice) => sum + invoice.amount, 0)
        ),
        total_delayed: formatCurrency(
          invoices
            .filter(invoice => invoice.status === 'delayed')
            .reduce((sum, invoice) => sum + invoice.amount, 0)
        ),
      };
    });

    console.log('Processed customers:', customers);

    return customers;
  } catch (err) {
    console.error('Database Error:', err);
    throw new Error('Failed to fetch customer table.');
  }
}
