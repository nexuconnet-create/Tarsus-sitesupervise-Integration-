'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState, useEffect } from 'react';
import { Link2, Video, CalendarClock, Loader2, Calendar } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import { clientService } from '@/lib/services';

export default function MeetingSchedulePage() {
  const router = useRouter();
  const params = useParams();
  const orgSlug = params.org_slug as string;
  const projectSlug = params.project_slug as string;
  const base = `/${orgSlug}/projects/${projectSlug}/client-dashboard`;
  const [meetings, setMeetings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMeetings = async () => {
      setLoading(true);
      try {
        const res = await clientService.getMeetings();
        const data = res.data;
        setMeetings(Array.isArray(data) ? data : data.results || []);
      } catch (err) {
        console.error('Failed to fetch meetings:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMeetings();
  }, []);

  const handleCreateLink = () => {
    console.log('Creating shareable link...');
  };

  const handleStartMeeting = () => {
    router.push(`${base}/meeting`);
  };

  const handleScheduleCalendly = () => {
    console.log('Opening Calendly...');
  };

  return (
    <div className="min-h-screen bg-[#001220] flex flex-col items-center justify-center px-6 relative">
      {/* Main Content */}
      <div className="w-full max-w-6xl">
        <h1 className="text-4xl font-bold text-white mb-16">Meeting Schedule</h1>

        {/* Meeting Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Create Link to Share */}
          <div
            onClick={handleCreateLink}
            className="bg-white rounded-2xl p-12 flex flex-col items-center justify-center cursor-pointer hover:shadow-2xl transition-all hover:scale-105 min-h-[300px]"
          >
            <div className="mb-8">
              <Link2 className="w-20 h-20 text-[#001220] stroke-[2.5]" />
            </div>
            <h3 className="text-lg font-semibold text-[#001220] text-center">
              Create Link to Share
            </h3>
          </div>

          {/* Start an Instant Meeting */}
          <div
            onClick={handleStartMeeting}
            className="bg-white rounded-2xl p-12 flex flex-col items-center justify-center cursor-pointer hover:shadow-2xl transition-all hover:scale-105 min-h-[300px]"
          >
            <div className="mb-8">
              <Video className="w-20 h-20 text-[#001220] stroke-[2.5]" />
            </div>
            <h3 className="text-lg font-semibold text-[#001220] text-center">
              Start an Instant Meeting
            </h3>
          </div>

          {/* Schedule in Calendly */}
          <div
            onClick={handleScheduleCalendly}
            className="bg-[#006EC4] rounded-2xl p-12 flex flex-col items-center justify-center cursor-pointer hover:shadow-2xl transition-all hover:scale-105 min-h-[300px]"
          >
            <div className="mb-8">
              <CalendarClock className="w-20 h-20 text-white stroke-[2.5]" />
            </div>
            <h3 className="text-lg font-semibold text-white text-center">
              Schedule in Calendly
            </h3>
          </div>
        </div>

        {/* Upcoming Meetings */}
        <div className="mt-12">
          <h2 className="text-xl font-bold text-white mb-6">Upcoming Meetings</h2>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 size={24} className="animate-spin text-white/50" />
            </div>
          ) : meetings.length > 0 ? (
            <div className="space-y-3">
              {meetings.map((meeting: any, idx: number) => (
                <div
                  key={meeting.id ?? idx}
                  className="bg-white/10 backdrop-blur rounded-xl p-5 flex items-center justify-between hover:bg-white/15 transition-colors cursor-pointer"
                  onClick={() => router.push(`${base}/meeting`)}
                >
                  <div className="flex items-center gap-4">
                    <Calendar size={20} className="text-white/60" />
                    <div>
                      <p className="text-sm font-semibold text-white">{meeting.title || meeting.name || meeting.subject || `Meeting ${idx + 1}`}</p>
                      <p className="text-xs text-white/60 mt-0.5">
                        {meeting.date || meeting.scheduled_at || meeting.start_time || ''}
                        {meeting.time ? ` at ${meeting.time}` : ''}
                      </p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full ${(meeting.status || '').toLowerCase() === 'scheduled' ? 'bg-green-500/20 text-green-400'
                      : (meeting.status || '').toLowerCase() === 'cancelled' ? 'bg-red-500/20 text-red-400'
                        : 'bg-blue-500/20 text-blue-400'
                    }`}>
                    {meeting.status || 'Scheduled'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-white/40 text-center py-6">No upcoming meetings</p>
          )}
        </div>
      </div>

      {/* Logo at bottom right */}
      <div className="absolute bottom-8 right-8 flex items-center gap-2">
        <div className="w-10 h-10 bg-white rounded flex items-center justify-center">
          {/* Building icon placeholder */}
          <svg className="w-6 h-6 text-[#001220]" fill="currentColor" viewBox="0 0 24 24">
            <path d="M3 21h18v-2H3v2zM5 3v14h14V3H5zm12 12H7V5h10v10z" />
            <path d="M9 7h2v2H9V7zm0 4h2v2H9v-2zm4-4h2v2h-2V7zm0 4h2v2h-2v-2z" />
          </svg>
        </div>
        <span className="text-white font-bold text-lg">SITE SUPERVISE</span>
      </div>
    </div>
  );
}
