/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { projectManagerService } from '@/lib/services';
import { Play, Users } from 'lucide-react';

const ProjectSetupForm = () => {
    const [formData, setFormData] = useState({
        name: '',
        company: '',
        client: '',
        start_date: '',
        end_date: '',
        contract_value: '',
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        try {
            await projectManagerService.setupProject(formData);
            setMessage('Project created successfully!');
            setFormData({ name: '', company: '', client: '', start_date: '', end_date: '', contract_value: '' });
        } catch (err: any) {
            setMessage(err.response?.data?.message || 'Error creating project');
        }
        setLoading(false);
    };

    return (
        <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center gap-2 text-sm font-bold uppercase text-gray-900 tracking-widest mb-4">
                <Play size={16} />
                <span>Initialize New Project</span>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input required name="name" value={formData.name} onChange={handleChange} placeholder="Project Name" className="border p-2 rounded" />
                    <input required name="company" value={formData.company} onChange={handleChange} placeholder="Company Name" className="border p-2 rounded" />
                    <input name="client" value={formData.client} onChange={handleChange} placeholder="Client Name" className="border p-2 rounded" />
                    <input type="number" name="contract_value" value={formData.contract_value} onChange={handleChange} placeholder="Contract Value ($)" className="border p-2 rounded" />
                    <div className="flex flex-col">
                        <label className="text-xs text-gray-500 font-bold uppercase mb-1">Start Date</label>
                        <input required type="date" name="start_date" value={formData.start_date} onChange={handleChange} className="border p-2 rounded" />
                    </div>
                    <div className="flex flex-col">
                        <label className="text-xs text-gray-500 font-bold uppercase mb-1">End Date</label>
                        <input required type="date" name="end_date" value={formData.end_date} onChange={handleChange} className="border p-2 rounded" />
                    </div>
                </div>
                <button disabled={loading} type="submit" className="bg-[#021422] text-white px-6 py-2 rounded text-sm font-bold uppercase transition-colors hover:bg-gray-800 w-full mt-4">
                    {loading ? 'Creating...' : 'Initialize DNA'}
                </button>
                {message && <div className="text-sm font-bold mt-2 text-green-600">{message}</div>}
            </form>
        </div>
    );
};

export default ProjectSetupForm;
