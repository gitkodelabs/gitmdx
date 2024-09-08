import type { MetaFunction } from "@remix-run/node";
import Sidebar from "@/components/sidebar";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export default function Index() {
  return (
    <main className="font-sans p-4">
      <Sidebar />
      <div className="flex-grow p-6 bg-red-100">
      <h1 className="text-2xl font-semibold mb-4">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded shadow">Card 1</div>
        <div className="p-4 bg-white rounded shadow">Card 2</div>
        <div className="p-4 bg-white rounded shadow">Card 3</div>
      </div>
    </div>
    </main>
  );
}
