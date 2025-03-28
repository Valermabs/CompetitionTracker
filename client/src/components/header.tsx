import { Button } from "@/components/ui/button";

interface HeaderProps {
  isAdmin: boolean;
  setIsAdmin: (isAdmin: boolean) => void;
}

export default function Header({ isAdmin, setIsAdmin }: HeaderProps) {
  const toggleAdminMode = () => {
    setIsAdmin(true);
  };

  const toggleViewMode = () => {
    setIsAdmin(false);
  };

  return (
    <header className="bg-[#2563eb] text-white shadow-md">
      <div className="container mx-auto px-4 py-4 flex flex-col md:flex-row justify-between items-center">
        <div className="flex items-center mb-4 md:mb-0">
          <h1 className="text-2xl font-bold">Live Competition Scoring</h1>
        </div>
        <div className="flex space-x-4">
          <Button
            variant={isAdmin ? "secondary" : "outline"}
            className={`
              ${isAdmin 
                ? "bg-[#2563eb] text-white border border-white hover:bg-blue-700" 
                : "bg-white text-[#2563eb] hover:bg-gray-100"}
            `}
            onClick={toggleAdminMode}
          >
            Admin Mode
          </Button>
          <Button
            variant={!isAdmin ? "secondary" : "outline"}
            className={`
              ${!isAdmin 
                ? "bg-[#2563eb] text-white border border-white hover:bg-blue-700" 
                : "bg-white text-[#2563eb] hover:bg-gray-100"}
            `}
            onClick={toggleViewMode}
          >
            View Mode
          </Button>
        </div>
      </div>
    </header>
  );
}
