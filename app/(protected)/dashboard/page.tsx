import { poppins } from "@/components/typography/fonts";
import LatestInvoices from "@/components/ui/dashboard/latest-invoices";
import RevenueChart from "@/components/ui/dashboard/revenue-chart";
import { Suspense } from "react";
import { RevenueChartSkeleton, LatestInvoicesSkeleton, CardSkeleton } from "@/components/ui/skeletons";
import CardWrapper from "@/components/ui/dashboard/cards";

export default async function Page() {

    return (
        <main>
            <h1 className={`${poppins.className} mb-4 text-xl md:text-2xl`}>
                Dashboard
            </h1>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <Suspense fallback={<CardSkeleton />}>
                    <CardWrapper />
                </Suspense>
            </div>
            <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-4 lg:grid-cols-8">
                <Suspense fallback={<RevenueChartSkeleton />}>
                    <RevenueChart />
                </Suspense>
                <Suspense fallback={<LatestInvoicesSkeleton />}>
                    <LatestInvoices />
                </Suspense>
            </div>
        </main>
    );
}