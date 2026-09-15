import { Truck, MapPin } from 'lucide-react';
import './Crew.css';

export const Crew: React.FC = () => {
  const crews = [
    { id: 'Crew 03', type: 'Heavy Duty', status: 'AVAILABLE', location: 'Base Alpha', target: 'N/A', eta: '--' },
    { id: 'Crew 12', type: 'Diagnostics', status: 'IN TRANSIT', location: 'Highway 9', target: 'Sector 2 (SUB-005)', eta: '14 mins' },
    { id: 'Crew 07', type: 'High Voltage', status: 'DEPLOYED', location: 'Sector 5', target: 'Sector 5 (TR-099)', eta: 'Working' },
    { id: 'Crew 04', type: 'Vegetation Mgt', status: 'AVAILABLE', location: 'Base Bravo', target: 'N/A', eta: '--' }
  ];

  return (
    <div className="crew-view-container">
      <div className="hud-panel title-panel mb-4">
        <h2 className="flex-center text-cyan"><Truck className="mr-2" size={28} /> CREW LOGISTICS & DISPATCH</h2>
        <p className="text-secondary text-sm">Live tracking of all maintenance fleets and AI pre-positioning recommendations.</p>
      </div>

      <div className="crew-content">
        <div className="hud-panel flex-1 overflow-hidden flex flex-col">
          <h3 className="hud-panel-title">ACTIVE FLEET</h3>
          <div className="table-responsive">
            <table className="hud-table priority-table">
              <thead>
                <tr>
                  <th>Unit ID</th>
                  <th>Specialty</th>
                  <th>Status</th>
                  <th>Current Location</th>
                  <th>Target Assignment</th>
                  <th>ETA</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {crews.map(crew => (
                  <tr key={crew.id} className="table-row-hover">
                    <td className="font-bold">{crew.id}</td>
                    <td className="text-secondary">{crew.type}</td>
                    <td>
                      <span className={`status-flag ${crew.status === 'AVAILABLE' ? 'bg-green-dim text-green' : crew.status === 'IN TRANSIT' ? 'bg-orange-dim text-orange' : 'bg-red-dim text-red'}`}>
                        {crew.status}
                      </span>
                    </td>
                    <td><MapPin size={14} className="inline-icon mr-1"/> {crew.location}</td>
                    <td className={crew.target !== 'N/A' ? 'text-cyan' : 'text-secondary'}>{crew.target}</td>
                    <td className="font-mono">{crew.eta}</td>
                    <td>
                      <button className="btn-secondary hud-btn">
                        {crew.status === 'AVAILABLE' ? 'DISPATCH' : 'RE-ROUTE'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="hud-panel crew-ai-panel">
          <h3 className="hud-panel-title text-orange">AI PRE-POSITIONING</h3>
          <div className="p-4 border-l-2 border-orange bg-orange-dim mt-2">
            <p className="text-sm font-bold text-orange mb-2">RECOMMENDED ACTION:</p>
            <p className="text-sm mb-4">Weather data indicates high probability of cascade failure in Sector 4. Recommend preemptively moving Crew 03 (Heavy Duty) from Base Alpha to Sector 4 staging ground.</p>
            <button className="btn-secondary hud-btn w-full">APPROVE PRE-POSITIONING</button>
          </div>
        </div>
      </div>
    </div>
  );
};
