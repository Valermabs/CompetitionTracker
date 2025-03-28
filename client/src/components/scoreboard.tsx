import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getTeamDotColor } from "@/lib/utils";

// Define team standing type
interface TeamStanding {
  teamId: number;
  teamName: string;
  teamColor: string;
  totalPoints: number;
  goldCount: number;
  silverCount: number;
  bronzeCount: number;
}

export default function Scoreboard() {
  const { data: standings, isLoading } = useQuery<TeamStanding[]>({
    queryKey: ["/api/standings"],
  });

  if (isLoading) {
    return (
      <section className="mb-10">
        <Card>
          <CardHeader className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <CardTitle className="text-xl font-bold text-gray-800">Current Standings</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Team</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Points</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gold</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Silver</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bronze</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {[...Array(5)].map((_, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        <Skeleton className="h-5 w-5" />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Skeleton className="h-8 w-8 rounded-full" />
                          <div className="ml-4">
                            <Skeleton className="h-5 w-32" />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <Skeleton className="h-5 w-8" />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <Skeleton className="h-5 w-5" />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <Skeleton className="h-5 w-5" />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <Skeleton className="h-5 w-5" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </section>
    );
  }

  // Helper function to render the team dot
  const getTeamLogo = (color: string) => {
    return (
      <div className="flex-shrink-0 h-8 w-8 rounded-full bg-white border border-gray-200 overflow-hidden flex items-center justify-center">
        <div className={`h-6 w-6 rounded-full ${getTeamDotColor(color)}`}></div>
      </div>
    );
  };

  return (
    <section className="mb-10">
      <Card>
        <CardHeader className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <CardTitle className="text-xl font-bold text-gray-800">Current Standings</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Team</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Points</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gold</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Silver</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bronze</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {standings?.map((team, index) => (
                  <tr key={team.teamId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{index + 1}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getTeamLogo(team.teamColor)}
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{team.teamName}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-bold">{team.totalPoints}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{team.goldCount}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{team.silverCount}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{team.bronzeCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
