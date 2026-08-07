/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { projectManagerService } from '@/lib/services';
import { Users } from 'lucide-react';

const CrewAssignmentForm = () => {
    const [projects, setProjects] = useState<any[]>([]);
    const [formData, setFormData] = useState({
        project_id: '',
        crew_name: '',
        default_trade: '',
        user_ids: '', // comma separated for now
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const res = await projectManagerService.getProjects();
                const fetchedProjects = Array.isArray(res.data) ? res.data : (res.data?.results || []);
                setProjects(fetchedProjects);
            } catch (err) {
                console.error(err);
            }
        };
        fetchProjects();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        try {
            const payload = {
                project_id: parseInt(formData.project_id),
                crew_name: formData.crew_name,
                default_trade: formData.default_trade,
                user_ids: formData.user_ids ? formData.user_ids.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id)) : [],
            };
            await projectManagerService.assignCrew(payload);
            setMessage('Crew assigned successfully!');
            setFormData({ project_id: '', crew_name: '', default_trade: '', user_ids: '' });
        } catch (err: any) {
            setMessage(err.response?.data?.message || 'Error assigning crew');
        }
        setLoading(false);
    };

    return (
        <div className="bg-white p-6 rounded-lg border border-gray-200 mt-4">
            <div className="flex items-center gap-2 text-sm font-bold uppercase text-gray-900 tracking-widest mb-4">
                <Users size={16} />
                <span>Assign Crew DNA</span>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <select required name="project_id" value={formData.project_id} onChange={handleChange} className="border p-2 rounded">
                        <option value="">Select Project</option>
                        {projects.map((p) => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                    </select>
                    <input required name="crew_name" value={formData.crew_name} onChange={handleChange} placeholder="Crew Name (e.g. Alpha Team)" className="border p-2 rounded" />
                    <input name="default_trade" value={formData.default_trade} onChange={handleChange} placeholder="Default Trade" className="border p-2 rounded" />
                    <input name="user_ids" value={formData.user_ids} onChange={handleChange} placeholder="User IDs (comma separated)" className="border p-2 rounded" />
                </div>
                <button disabled={loading} type="submit" className="bg-[#0166B0] text-white px-6 py-2 rounded text-sm font-bold uppercase transition-colors hover:bg-blue-700 w-full mt-4">
                    {loading ? 'Assigning...' : 'Assign Crew'}
                </button>
                {message && <div className="text-sm font-bold mt-2 text-green-600">{message}</div>}
            </form>
        </div>
    );
};

export default CrewAssignmentForm;
