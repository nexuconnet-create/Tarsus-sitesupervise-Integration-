'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import {
  Camera, Film, Search, Calendar, MapPin, Filter,
  Upload, FolderPlus, Download, Share2, PlayCircle,
  ImageIcon, DownloadCloud, Clock, CheckCircle2, Eye, X, UploadCloud
} from 'lucide-react';
import { useMemberships } from '@/lib/hooks/useMemberships';

interface Photo {
  id: number;
  title: string;
  subtitle: string;
  date: string;
  url?: string;
  color: string;
}

export default function SiteMediaPage() {
  const params = useParams();
  const org_slug = params.org_slug as string;
  const project_slug = params.project_slug as string;

  const { getProject } = useMemberships();
  const project = getProject(org_slug, project_slug);
  const projectName = project?.name || 'Lagos 12-Storey Mixed-Use Development';
  const [selectedVideo, setSelectedVideo] = React.useState<{ url: string, title: string, duration: string, date: string, id: number } | null>(null);
  const [selectedPhoto, setSelectedPhoto] = React.useState<Photo | null>(null);
  const [isCreateAlbumOpen, setIsCreateAlbumOpen] = React.useState(false);
  const [isUploadMediaOpen, setIsUploadMediaOpen] = React.useState(false);

  const mockPhotos: Photo[] = [
    { id: 1, title: 'Project Background Design', subtitle: 'Concept Render', date: '2026-02-05', url: 'https://res.cloudinary.com/depeqzb6z/image/upload/v1784069702/Design_this_background_with_relevant_202605261402_1_gzlz62.png', color: 'from-slate-700 to-slate-900' },
    { id: 2, title: 'MEP Design Process', subtitle: 'Schematics', date: '2026-02-12', url: 'https://res.cloudinary.com/depeqzb6z/image/upload/v1784072821/Complete_MEP_Design_Process_for_Modern_Buildings_1_d9zlh7.png', color: 'from-blue-700 to-slate-900' },
    { id: 3, title: 'Structural Detail', subtitle: 'North Wing', date: '2026-02-18', url: 'https://res.cloudinary.com/depeqzb6z/image/upload/v1784072820/__7_1_kvakpz.png', color: 'from-indigo-700 to-slate-900' },
    { id: 4, title: 'Commercial Space', subtitle: 'Maintenance', date: '2026-02-19', url: 'https://res.cloudinary.com/depeqzb6z/image/upload/v1784072832/Transform_Your_Commercial_Space_with_Effective_Maintenance_1_cnu8vl.png', color: 'from-emerald-700 to-slate-900' },
    { id: 5, title: 'M3M Industrial Plots', subtitle: 'Manesar View', date: '2026-02-16', url: 'https://res.cloudinary.com/depeqzb6z/image/upload/v1784072833/M3M_Industrial_Plots_Manesar_1_hs45tf.png', color: 'from-amber-700 to-slate-900' },
  ];

  const mockVideos = [
    {
      id: 1,
      title: 'Site Progress Tour — Feb 2026',
      duration: '12:30',
      date: 'Feb 19',
      url: 'https://res.cloudinary.com/depeqzb6z/video/upload/v1784886668/08cea2b48763a3f46dcd86fca0b6e7f8_720w_flssin.mp4'
    },
    {
      id: 2,
      title: 'Foundation Pour Timelapse',
      duration: '05:20',
      date: 'Feb 05',
      url: 'https://res.cloudinary.com/depeqzb6z/video/upload/v1784886731/06704f949525059bdeadd6a74ca0849b_p6p461.mp4'
    },
    {
      id: 3,
      title: 'Safety Induction Session',
      duration: '08:45',
      date: 'Feb 14',
      url: 'https://res.cloudinary.com/depeqzb6z/video/upload/v1784886972/e4f5f6d31cbf39ae2155520e50c1b66a_bd1llh.mp4'
    },
    {
      id: 4,
      title: 'Drone Survey - North Wing',
      duration: '03:15',
      date: 'Feb 10',
      url: 'https://res.cloudinary.com/depeqzb6z/video/upload/v1784887081/1d3a575820054d1cd1c3efd0e1c46318_orctkq.mp4'
    },
  ];

  return (
    <div className="h-screen bg-[#E3E3E3] text-slate-900 font-sans flex flex-col overflow-hidden">

      {/* Header Area */}
      <div className="bg-white border-b border-gray-100 px-8 py-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-extrabold text-[#021422] flex items-center gap-3">
            SITE PHOTOS & VIDEOS
          </h1>
          <div className="text-sm text-slate-500 mt-2 flex flex-wrap items-center gap-3">
            <span className="font-bold text-slate-700">{projectName}</span>
            <span className="text-slate-300">|</span>
            <span className="flex items-center gap-1 font-semibold text-blue-600"><ImageIcon size={14} /> 245 Photos</span>
            <span className="flex items-center gap-1 font-semibold text-indigo-600"><Film size={14} /> 12 Videos</span>
            <span className="text-slate-300">|</span>
            <span className="flex items-center gap-1">Updated: Today</span>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <button onClick={() => setIsCreateAlbumOpen(true)} className="px-4 py-2 bg-white border border-gray-100 hover:bg-white text-slate-700 rounded-lg text-sm font-bold transition-colors shadow-sm flex items-center gap-2">
            <FolderPlus size={16} /> Create Album
          </button>
          <button onClick={() => setIsUploadMediaOpen(true)} className="px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-sm font-bold transition-colors flex items-center gap-2">
            <Upload size={16} /> Upload Media
          </button>
        </div>
      </div>

      {/* Main Scrollable Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="max-w-[1400px] mx-auto px-6 py-8 space-y-8">

          {/* Filter Bar */}
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-600">
                <Filter size={16} className="text-slate-400" /> Filters:
              </div>
              <div className="flex items-center gap-2 bg-white border border-gray-100 rounded-lg px-3 py-1.5 text-sm font-semibold text-slate-600">
                <Calendar size={14} className="text-slate-400" />
                <select className="bg-transparent outline-none cursor-pointer">
                  <option>Date: All</option>
                  <option>Past Week</option>
                  <option>Past Month</option>
                </select>
              </div>
              <div className="flex items-center gap-2 bg-white border border-gray-100 rounded-lg px-3 py-1.5 text-sm font-semibold text-slate-600">
                <MapPin size={14} className="text-slate-400" />
                <select className="bg-transparent outline-none cursor-pointer">
                  <option>Location: All</option>
                  <option>North Wing</option>
                  <option>South Wing</option>
                </select>
              </div>
              <div className="flex items-center gap-2 bg-white border border-gray-100 rounded-lg px-3 py-1.5 text-sm font-semibold text-slate-600">
                <Camera size={14} className="text-slate-400" />
                <select className="bg-transparent outline-none cursor-pointer">
                  <option>Type: All</option>
                  <option>Drone</option>
                  <option>CCTV</option>
                  <option>Mobile Upload</option>
                </select>
              </div>
            </div>

            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Search media..."
                className="w-full pl-9 pr-4 py-1.5 border border-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              />
            </div>
          </div>

          {/* GALLERY VIEW */}
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                <ImageIcon size={16} /> Gallery View
              </h2>
              <div className="flex gap-2">
                <button className="px-3 py-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded transition-colors" title="Download All">
                  <DownloadCloud size={18} />
                </button>
                <button className="px-3 py-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded transition-colors" title="Share Album">
                  <Share2 size={18} />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {mockPhotos.map((photo) => (
                  <div key={photo.id} onClick={() => photo.url && setSelectedPhoto(photo)} className="group cursor-pointer">
                    <div className={`aspect-video w-full rounded-xl bg-gradient-to-br ${photo.color} relative overflow-hidden shadow-inner mb-3 transition-transform duration-300 group-hover:scale-[1.02] group-hover:shadow-md`}>
                      {photo.url ? (
                        <img src={photo.url} alt={photo.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20"></div>
                      )}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/40 transition-opacity">
                        <button className="p-2 bg-white/20 hover:bg-white/40 rounded-full text-white backdrop-blur-sm transition-colors">
                          <Eye size={20} />
                        </button>
                      </div>
                      <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/60 backdrop-blur-sm rounded text-[10px] font-bold text-white flex items-center gap-1">
                        <Camera size={10} /> Photo
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors line-clamp-1">{photo.title}</h3>
                      <p className="text-xs text-slate-500 mt-1 flex items-center justify-between">
                        <span>{photo.subtitle}</span>
                        <span className="font-mono text-[10px]">{photo.date}</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* RECENT VIDEOS */}
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                <Film size={16} /> Recent Videos
              </h2>
            </div>

            <div className="divide-y divide-slate-100">
              {mockVideos.map((video) => (
                <div key={video.id} onClick={() => setSelectedVideo(video)} className="p-4 sm:p-6 hover:bg-white transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 group cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                      <PlayCircle size={24} />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{video.title}</h3>
                      <div className="flex items-center gap-4 mt-1 text-xs font-medium text-slate-500">
                        <span className="flex items-center gap-1"><Clock size={14} /> {video.duration}</span>
                        <span className="flex items-center gap-1"><Calendar size={14} /> {video.date}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-bold transition-colors flex items-center gap-2">
                      <PlayCircle size={14} /> Play
                    </button>
                    <button className="px-3 py-2 bg-white border border-gray-100 hover:bg-slate-100 text-slate-600 rounded-lg text-xs font-bold transition-colors shadow-sm" title="Download">
                      <Download size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

        </div>
      </div>

      {/* Photo Viewer Modal */}
      {selectedPhoto && (
        <div className="fixed inset-0 z-[70] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setSelectedPhoto(null)}>
          <div className="w-full max-w-5xl bg-slate-900 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
            <div className="p-4 flex items-center justify-between border-b border-white/10 shrink-0">
              <h3 className="text-white font-bold">{selectedPhoto.title}</h3>
              <button onClick={() => setSelectedPhoto(null)} className="text-white/50 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors">
                <X size={20} className="lucide-x" />
              </button>
            </div>
            <div className="flex-1 min-h-0 bg-black flex items-center justify-center overflow-hidden p-4">
              <img
                src={selectedPhoto.url}
                alt={selectedPhoto.title}
                className="max-w-full max-h-full object-contain"
              />
            </div>
            <div className="p-4 bg-slate-800 flex justify-between items-center text-slate-300 text-sm font-medium shrink-0">
              <div className="flex gap-4">
                <span className="flex items-center gap-1"><Camera size={16} /> {selectedPhoto.subtitle}</span>
                <span className="flex items-center gap-1"><Calendar size={16} /> {selectedPhoto.date}</span>
              </div>
              <button className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors">
                <Download size={16} /> Download
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Video Player Modal */}
      {selectedVideo && (
        <div className="fixed inset-0 z-[70] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setSelectedVideo(null)}>
          <div className="w-full max-w-5xl bg-slate-900 rounded-2xl overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="p-4 flex items-center justify-between border-b border-white/10">
              <h3 className="text-white font-bold">{selectedVideo.title}</h3>
              <button onClick={() => setSelectedVideo(null)} className="text-white/50 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors">
                <X size={20} className="lucide-x" />
              </button>
            </div>
            <div className="w-full aspect-video bg-black relative">
              <video
                src={selectedVideo.url}
                controls
                autoPlay
                className="w-full h-full object-contain"
              >
                Your browser does not support the video tag.
              </video>
            </div>
            <div className="p-4 bg-slate-800 flex justify-between items-center text-slate-300 text-sm font-medium">
              <div className="flex gap-4">
                <span className="flex items-center gap-1"><Clock size={16} /> {selectedVideo.duration}</span>
                <span className="flex items-center gap-1"><Calendar size={16} /> {selectedVideo.date}</span>
              </div>
              <button className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors">
                <Download size={16} /> Download
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Album Modal */}
      {isCreateAlbumOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm" onClick={() => setIsCreateAlbumOpen(false)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 flex items-center gap-2"><FolderPlus size={18} className="text-blue-600"/> Create Album</h3>
              <button onClick={() => setIsCreateAlbumOpen(false)} className="text-slate-400 hover:text-slate-600 p-1"><X size={20}/></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Album Title</label>
                <input type="text" className="w-full border border-gray-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. Foundation Works" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Description (Optional)</label>
                <textarea className="w-full border border-gray-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 h-20" placeholder="Add some context..."></textarea>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Privacy</label>
                <select className="w-full border border-gray-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                  <option>Project Team Only</option>
                  <option>Visible to Client</option>
                  <option>Public</option>
                </select>
              </div>
            </div>
            <div className="p-4 border-t border-slate-100 bg-white flex justify-end gap-2">
              <button onClick={() => setIsCreateAlbumOpen(false)} className="px-4 py-2 bg-white border border-gray-100 text-slate-700 font-medium rounded-lg hover:bg-white transition-colors text-sm">Cancel</button>
              <button onClick={() => setIsCreateAlbumOpen(false)} className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors text-sm">Create Album</button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Media Modal */}
      {isUploadMediaOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm" onClick={() => setIsUploadMediaOpen(false)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 flex items-center gap-2"><Upload size={18} className="text-blue-600"/> Upload Media</h3>
              <button onClick={() => setIsUploadMediaOpen(false)} className="text-slate-400 hover:text-slate-600 p-1"><X size={20}/></button>
            </div>
            <div className="p-6 space-y-6">
              <div className="border-2 border-dashed border-gray-100 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:bg-white transition-colors cursor-pointer bg-white/50">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-3">
                  <UploadCloud size={24} />
                </div>
                <p className="text-sm font-bold text-slate-800">Click to upload or drag and drop</p>
                <p className="text-xs text-slate-500 mt-1">SVG, PNG, JPG, MP4 or GIF (max. 100MB)</p>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Add to Album (Optional)</label>
                  <select className="w-full border border-gray-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                    <option>Select an album...</option>
                    <option>Foundation Pour</option>
                    <option>Safety Trainings</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-slate-100 bg-white flex justify-end gap-2">
              <button onClick={() => setIsUploadMediaOpen(false)} className="px-4 py-2 bg-white border border-gray-100 text-slate-700 font-medium rounded-lg hover:bg-white transition-colors text-sm">Cancel</button>
              <button onClick={() => setIsUploadMediaOpen(false)} className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors text-sm">Upload Files</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
