   const API_URL = process.env.NEXT_PUBLIC_API_URL;

   async function getServices() {
     try {
       const res = await fetch(`${API_URL}/api/services`, { cache: "no-store" });
       if (!res.ok) return null;
       return await res.json();
     } catch {
       return null;
     }
   }

   export default async function Home() {
     const services = await getServices();

     return (
       <main className="mx-auto max-w-4xl p-6">
         <h1 className="text-3xl font-bold">Book a service</h1>
         <p className="mt-1 text-gray-600">Pick a service and choose a time that suits you.</p>

         {services === null && (
           <p className="mt-8 rounded bg-red-50 p-4 text-red-700">
             Could not load services. Is the API running?
           </p>
         )}

         {services?.length === 0 && (
           <p className="mt-8 text-gray-500">No services yet.</p>
         )}

         <ul className="mt-8 grid gap-4 sm:grid-cols-2">
           {services?.map((service) => (
             <li key={service.id} className="rounded-lg border border-gray-200 p-4 shadow-sm">
               <h2 className="text-lg font-semibold">{service.name}</h2>
               <p className="mt-1 text-sm text-gray-600">{service.description}</p>
               <p className="mt-3 text-sm">
                 {service.durationMinutes} min · {Number(service.price).toFixed(2)}
               </p>
               <p className="text-xs text-gray-500">by {service.provider.name}</p>
             </li>
           ))}
         </ul>
       </main>
     );
   }