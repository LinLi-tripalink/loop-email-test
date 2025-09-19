import Image from "next/image";
import FlowChart from "../components/FlowChart";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <FlowChart />
    </div>
  );
}
