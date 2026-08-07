/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState } from 'react';
import {
  Radio, Camera, Video, Download, MapPin, Bell, Activity, Clock, AlertCircle, CheckCircle, Info, X
} from 'lucide-react';
import Image from 'next/image';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

interface SharedLiveSiteViewProps {
  user?: any;
  orgSlug: string;
  projectSlug: string;
}

export default function SharedLiveSiteView({ user, orgSlug, projectSlug }: SharedLiveSiteViewProps) {

  const photoFeeds = [
    { id: 1, title: 'Site Overview', time: 'Today 14:30', img: 'https://res.cloudinary.com/depeqzb6z/image/upload/v1784703934/Chapman_Taylor___Why_BIM_matters_gnfw89.jpg' },
    { id: 2, title: 'Foundation', time: 'Today 13:00', img: 'https://res.cloudinary.com/depeqzb6z/image/upload/v1784072832/Transform_Your_Commercial_Space_with_Effective_Maintenance_1_cnu8vl.png' },
    { id: 3, title: 'Rebar Placement', time: 'Today 11:30', img: 'https://res.cloudinary.com/depeqzb6z/image/upload/v1784072832/Home_Renovations_1_j8q7xy.png' },
    { id: 4, title: 'Concrete Pour', time: 'Today 10:00', img: 'https://res.cloudinary.com/depeqzb6z/image/upload/v1784072821/Complete_MEP_Design_Process_for_Modern_Buildings_1_d9zlh7.png' },
  ];

  const activityFeed = [
    { id: 101, time: '14:30', type: 'success', title: 'Piling & Foundation', desc: '45% complete (50/110 piles installed)' },
    { id: 102, time: '13:00', type: 'warning', title: 'Rebar Delivery', desc: '200 pieces arrived — Quality Check Pending' },
    { id: 103, time: '11:30', type: 'success', title: 'Concrete Pour', desc: 'Ground Floor Slab — Completed' },
    { id: 104, time: '10:00', type: 'error', title: 'Rebar Spacing Warning', desc: '12 rebars need repositioning on Zone B3' },
  ];

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const querySuffix = searchParams?.get("clientType") ? `?clientType=${encodeURIComponent(searchParams.get("clientType")!)}` : "";

  const handleDownload = async (url: string, title: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const objectUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = objectUrl;
      a.download = `${title.replace(/\s+/g, '_')}.jpg`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(objectUrl);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Download failed', err);
    }
  };

  const handleViewAllPhotos = () => {
    let rolePath = 'client';
    if (pathname?.includes('/private-individual')) rolePath = 'private-individual';
    else if (pathname?.includes('/government-agencies')) rolePath = 'government-agencies';
    else if (pathname?.includes('/executive-developers')) rolePath = 'executive-developers';
    
    router.push(`/${orgSlug}/projects/${projectSlug}/${rolePath}/project/media${querySuffix}`);
  };

  return (
    <div className="min-h-screen bg-[#F0F4F8] text-slate-900 pb-12 font-sans selection:bg-blue-500 selection:text-white">

      {/* Header Area */}
      <div className="bg-white border-b border-gray-100 px-8 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-0 z-20 shadow-sm">
        <div>
          <h1 className="text-2xl font-extrabold text-[#021422] flex items-center gap-3 uppercase tracking-tight">
            Live Site View
          </h1>
          <div className="text-sm text-slate-500 mt-2 flex flex-wrap items-center gap-3">
            <span className="font-bold text-slate-700">Project: Lagos 12-Storey</span>
            <span className="text-slate-300">|</span>
            <span className="flex items-center gap-1 font-semibold text-slate-600"><Clock size={14} /> Last Update: 2 min ago</span>
            <span className="text-slate-300">|</span>
            <span className="flex items-center gap-1 font-black text-rose-600 uppercase tracking-wider text-xs"><Radio size={14} /> Live: Yes</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-8 space-y-6">

        {/* Photo Feed */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white/50">
            <h3 className="font-bold text-slate-800 uppercase tracking-wider text-sm flex items-center gap-2">
              Live Site Photo Feed
            </h3>
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-lg transition-colors flex items-center gap-2">
                <Video size={14} /> Watch Live Stream
              </button>
              <button className="px-4 py-2 bg-white border border-gray-100 hover:bg-white text-slate-700 text-xs font-bold rounded-lg transition-colors flex items-center gap-2">
                <Download size={14} /> Download Feed
              </button>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {photoFeeds.map((feed) => (
                <div key={feed.id} className="group rounded-xl overflow-hidden border border-gray-100 bg-white shadow-sm hover:shadow-md transition-all relative">
                  <div className="relative h-40 w-full overflow-hidden bg-slate-100">
                    {/* Placeholder div in case image fails, using standard image tag to avoid strict Next Image domains */}
                    <img src={feed.img} alt={feed.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute top-2 left-2 px-2 py-1 bg-black/60 backdrop-blur-md rounded text-white text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                      <Camera size={12} /> {feed.time}
                    </div>
                  </div>
                  <div className="p-4">
                    <h4 className="font-bold text-slate-800 text-sm mb-3">{feed.title}</h4>
                    <div className="flex gap-2">
                      <button onClick={() => setSelectedImage(feed.img)} className="flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-md transition-colors text-center">View</button>
                      <button onClick={() => handleDownload(feed.img, feed.title)} className="flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-md transition-colors text-center">Download</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-center">
              <button onClick={handleViewAllPhotos} className="text-sm font-bold text-blue-600 hover:text-blue-700 hover:underline">View All Photos</button>
            </div>
          </div>
        </div>

        {/* Site Activity Feed */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white/50">
            <h3 className="font-bold text-slate-800 uppercase tracking-wider text-sm flex items-center gap-2">
              <Activity size={18} className="text-emerald-600" /> Site Activity Feed
            </h3>
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-white border border-gray-100 hover:bg-white text-slate-700 text-xs font-bold rounded-lg transition-colors flex items-center gap-2">
                <Bell size={14} /> Set Alert
              </button>
              <button className="px-4 py-2 bg-[#021422] hover:bg-[#021422]/90 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-2 shadow-sm">
                Activity Report
              </button>
            </div>
          </div>

          <div className="p-6">
            <div className="relative border-l-2 border-slate-100 ml-3 space-y-6">

              {activityFeed.map((activity) => (
                <div key={activity.id} className="relative pl-6">
                  {/* Timeline Dot */}
                  <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 border-white shadow-sm ${activity.type === 'success' ? 'bg-emerald-500' :
                    activity.type === 'warning' ? 'bg-amber-500' :
                      activity.type === 'error' ? 'bg-rose-500' : 'bg-blue-500'
                    }`}></div>

                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 p-4 rounded-xl border border-slate-100 bg-white hover:bg-white hover:border-gray-100 hover:shadow-sm transition-all group">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-slate-400 w-10">{activity.time}</span>
                        <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                          {activity.title}
                          {activity.type === 'warning' && <AlertCircle size={14} className="text-amber-500" />}
                          {activity.type === 'error' && <AlertCircle size={14} className="text-rose-500" />}
                          {activity.type === 'success' && <CheckCircle size={14} className="text-emerald-500" />}
                        </h4>
                      </div>
                      <p className={`text-sm pl-12 ${activity.type === 'error' ? 'text-rose-700 font-semibold' : 'text-slate-600'
                        }`}>{activity.desc}</p>
                    </div>

                    <div className="flex items-center gap-2 pl-12 sm:pl-0 shrink-0 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                      <button className="p-2 bg-white border border-gray-100 text-slate-400 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 rounded-lg transition-colors" title="View Associated Photo">
                        <Camera size={16} />
                      </button>
                      <button className="p-2 bg-white border border-gray-100 text-slate-400 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 rounded-lg transition-colors" title="View Location on Plan">
                        <MapPin size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

            </div>

            <div className="mt-8 flex justify-center">
              <button className="text-sm font-bold text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1">
                View All Updates
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* Image Lightbox Modal */}
      {selectedImage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4" onClick={() => setSelectedImage(null)}>
          <button className="absolute top-4 right-4 p-2 text-white/70 hover:text-white" onClick={() => setSelectedImage(null)}>
            <X size={32} />
          </button>
          <img src={selectedImage} alt="Fullscreen View" className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl" onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </div>
  );
}
