import React, { useState, useEffect } from 'react';
import { apiRequest } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { 
  CalendarDays, Printer, Download, Plus, Trash2, Edit2, 
  DoorOpen, User, AlertCircle, CheckCircle2 
} from 'lucide-react';
import type { TimetableEntry, UserProfile, Subject, Room } from '../types';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const PERIODS = [
  { num: 1, start: '09:00 AM', end: '09:50 AM' },
  { num: 2, start: '09:50 AM', end: '10:40 AM' },
  { num: 3, start: '10:40 AM', end: '11:30 AM' },
  { num: 4, start: '11:50 AM', end: '12:40 PM' },
  { num: 5, start: '12:40 PM', end: '01:30 PM' },
  { num: 6, start: '02:20 PM', end: '03:10 PM' },
  { num: 7, start: '03:10 PM', end: '04:00 PM' },
];

const PASTEL_THEMES = [
  {
    // Pastel Indigo / Lavender
    cardBg: 'bg-indigo-100/80 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-800/60',
    titleColor: 'text-indigo-900 dark:text-indigo-100',
    badge: 'bg-indigo-200/90 dark:bg-indigo-900/80 text-indigo-800 dark:text-indigo-200',
    subText: 'text-indigo-700 dark:text-indigo-300',
    cellBg: 'bg-indigo-50/50 dark:bg-indigo-950/20',
  },
  {
    // Pastel Emerald / Mint
    cardBg: 'bg-emerald-100/80 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800/60',
    titleColor: 'text-emerald-900 dark:text-emerald-100',
    badge: 'bg-emerald-200/90 dark:bg-emerald-900/80 text-emerald-800 dark:text-emerald-200',
    subText: 'text-emerald-700 dark:text-emerald-300',
    cellBg: 'bg-emerald-50/50 dark:bg-emerald-950/20',
  },
  {
    // Pastel Rose / Soft Pink
    cardBg: 'bg-rose-100/80 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800/60',
    titleColor: 'text-rose-900 dark:text-rose-100',
    badge: 'bg-rose-200/90 dark:bg-rose-900/80 text-rose-800 dark:text-rose-200',
    subText: 'text-rose-700 dark:text-rose-300',
    cellBg: 'bg-rose-50/50 dark:bg-rose-950/20',
  },
  {
    // Pastel Amber / Peach
    cardBg: 'bg-amber-100/80 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800/60',
    titleColor: 'text-amber-900 dark:text-amber-100',
    badge: 'bg-amber-200/90 dark:bg-amber-900/80 text-amber-800 dark:text-amber-200',
    subText: 'text-amber-700 dark:text-amber-300',
    cellBg: 'bg-amber-50/50 dark:bg-amber-950/20',
  },
  {
    // Pastel Purple / Violet
    cardBg: 'bg-purple-100/80 dark:bg-purple-950/60 border-purple-200 dark:border-purple-800/60',
    titleColor: 'text-purple-900 dark:text-purple-100',
    badge: 'bg-purple-200/90 dark:bg-purple-900/80 text-purple-800 dark:text-purple-200',
    subText: 'text-purple-700 dark:text-purple-300',
    cellBg: 'bg-purple-50/50 dark:bg-purple-950/20',
  },
  {
    // Pastel Sky / Soft Blue
    cardBg: 'bg-sky-100/80 dark:bg-sky-950/60 border-sky-200 dark:border-sky-800/60',
    titleColor: 'text-sky-900 dark:text-sky-100',
    badge: 'bg-sky-200/90 dark:bg-sky-900/80 text-sky-800 dark:text-sky-200',
    subText: 'text-sky-700 dark:text-sky-300',
    cellBg: 'bg-sky-50/50 dark:bg-sky-950/20',
  },
  {
    // Pastel Teal / Cyan
    cardBg: 'bg-teal-100/80 dark:bg-teal-950/60 border-teal-200 dark:border-teal-800/60',
    titleColor: 'text-teal-900 dark:text-teal-100',
    badge: 'bg-teal-200/90 dark:bg-teal-900/80 text-teal-800 dark:text-teal-200',
    subText: 'text-teal-700 dark:text-teal-300',
    cellBg: 'bg-teal-50/50 dark:bg-teal-950/20',
  },
  {
    // Pastel Fuchsia / Pink
    cardBg: 'bg-fuchsia-100/80 dark:bg-fuchsia-950/60 border-fuchsia-200 dark:border-fuchsia-800/60',
    titleColor: 'text-fuchsia-900 dark:text-fuchsia-100',
    badge: 'bg-fuchsia-200/90 dark:bg-fuchsia-900/80 text-fuchsia-800 dark:text-fuchsia-200',
    subText: 'text-fuchsia-700 dark:text-fuchsia-300',
    cellBg: 'bg-fuchsia-50/50 dark:bg-fuchsia-950/20',
  }
];

const DAY_PASTEL_HEADER: Record<string, string> = {
  Monday: 'bg-indigo-100/90 dark:bg-indigo-950/70 text-indigo-900 dark:text-indigo-200 border-indigo-200 dark:border-indigo-900/60',
  Tuesday: 'bg-purple-100/90 dark:bg-purple-950/70 text-purple-900 dark:text-purple-200 border-purple-200 dark:border-purple-900/60',
  Wednesday: 'bg-teal-100/90 dark:bg-teal-950/70 text-teal-900 dark:text-teal-200 border-teal-200 dark:border-teal-900/60',
  Thursday: 'bg-amber-100/90 dark:bg-amber-950/70 text-amber-900 dark:text-amber-200 border-amber-200 dark:border-amber-900/60',
  Friday: 'bg-rose-100/90 dark:bg-rose-950/70 text-rose-900 dark:text-rose-200 border-rose-200 dark:border-rose-900/60',
  Saturday: 'bg-emerald-100/90 dark:bg-emerald-950/70 text-emerald-900 dark:text-emerald-200 border-emerald-200 dark:border-emerald-900/60',
};

const getPastelTheme = (subjectName: string, slotId: number) => {
  let hash = slotId;
  const str = subjectName || 'Subject';
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % PASTEL_THEMES.length;
  return PASTEL_THEMES[index];
};

export const TimetableManagement: React.FC = () => {
  const { user } = useAuth();
  const isHOD = user?.role === 'HOD';
  const facultyProfileId = user?.profile?.id;

  const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
  const [facultyList, setFacultyList] = useState<UserProfile[]>([]);
  const [subjectList, setSubjectList] = useState<Subject[]>([]);
  const [roomList, setRoomList] = useState<Room[]>([]);

  // View Filter: 'all', 'faculty', 'room'
  const [viewType, setViewType] = useState<'all' | 'faculty' | 'room'>(!isHOD ? 'faculty' : 'all');
  const [selectedFacultyId, setSelectedFacultyId] = useState<number | 'all'>(!isHOD && facultyProfileId ? facultyProfileId : 'all');
  const [selectedRoomId, setSelectedRoomId] = useState<number | 'all'>('all');

  // Modal State for HOD Slot CRUD
  const [slotModal, setSlotModal] = useState(false);
  const [editingSlot, setEditingSlot] = useState<TimetableEntry | null>(null);

  // Dynamic Custom Typing Modes (allows typing any custom faculty, subject, or room name)
  const [customFacMode, setCustomFacMode] = useState(false);
  const [customSubMode, setCustomSubMode] = useState(false);
  const [customRoomMode, setCustomRoomMode] = useState(false);

  const [formData, setFormData] = useState({
    faculty_id: 0,
    faculty_name: '',
    subject_id: 0,
    subject_name: '',
    room_id: 0,
    room_number: '',
    day_of_week: 'Monday',
    period_number: 1,
    start_time: '09:00 AM',
    end_time: '09:50 AM',
    semester: 5,
    section: 'A',
    academic_year: '2025-2026'
  });

  const [modalError, setModalError] = useState<string | null>(null);
  const [modalSuccess, setModalSuccess] = useState<string | null>(null);
  const [modalLoading, setModalLoading] = useState(false);

  useEffect(() => {
    fetchMasterData();
    if (!isHOD && facultyProfileId) {
      setViewType('faculty');
      setSelectedFacultyId(facultyProfileId);
    }
  }, [facultyProfileId, isHOD]);

  const fetchMasterData = async () => {
    try {
      const [ttRes, facRes, subRes, rmRes] = await Promise.all([
        apiRequest('/timetable'),
        apiRequest('/faculty?per_page=100'),
        apiRequest('/subjects'),
        apiRequest('/rooms?per_page=100')
      ]);

      setTimetable(ttRes || []);
      setFacultyList(facRes.faculty || []);
      setSubjectList(subRes || []);
      setRoomList(rmRes.rooms || []);
    } catch (err) {
      console.error('Failed to load master timetable data:', err);
    }
  };

  const handlePeriodChange = (pNum: number) => {
    const periodObj = PERIODS.find(p => p.num === pNum);
    if (periodObj) {
      setFormData(prev => ({
        ...prev,
        period_number: pNum,
        start_time: periodObj.start,
        end_time: periodObj.end
      }));
    }
  };

  const openAddSlotModal = (day?: string, period?: number) => {
    setEditingSlot(null);
    setModalError(null);
    setModalSuccess(null);
    const initialFac = (viewType === 'faculty' && selectedFacultyId !== 'all') 
      ? facultyList.find(f => f.id === selectedFacultyId) || facultyList[0] 
      : facultyList[0];
    const initialRoom = (viewType === 'room' && selectedRoomId !== 'all') 
      ? roomList.find(r => r.id === selectedRoomId) || roomList[0] 
      : roomList[0];

    setFormData({
      faculty_id: initialFac?.id || 0,
      faculty_name: initialFac?.full_name || '',
      subject_id: subjectList[0]?.id || 0,
      subject_name: subjectList[0]?.subject_name || '',
      room_id: initialRoom?.id || 0,
      room_number: initialRoom?.room_number || '',
      day_of_week: day || 'Monday',
      period_number: period || 1,
      start_time: PERIODS.find(p => p.num === (period || 1))?.start || '09:00 AM',
      end_time: PERIODS.find(p => p.num === (period || 1))?.end || '09:50 AM',
      semester: 5,
      section: 'A',
      academic_year: '2025-2026'
    });
    setSlotModal(true);
  };

  const openEditSlotModal = (slot: TimetableEntry) => {
    setEditingSlot(slot);
    setModalError(null);
    setModalSuccess(null);
    setFormData({
      faculty_id: slot.faculty_id,
      faculty_name: slot.faculty_name,
      subject_id: slot.subject_id,
      subject_name: slot.subject_name,
      room_id: slot.room_id,
      room_number: slot.room_number,
      day_of_week: slot.day_of_week,
      period_number: slot.period_number,
      start_time: slot.start_time,
      end_time: slot.end_time,
      semester: slot.semester,
      section: slot.section,
      academic_year: slot.academic_year
    });
    setSlotModal(true);
  };

  const handleSaveSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);
    setModalSuccess(null);
    setModalLoading(true);

    try {
      if (editingSlot) {
        await apiRequest(`/timetable/${editingSlot.id}`, {
          method: 'PUT',
          body: JSON.stringify(formData)
        });
        setModalSuccess('Timetable slot updated successfully!');
      } else {
        await apiRequest('/timetable', {
          method: 'POST',
          body: JSON.stringify(formData)
        });
        setModalSuccess('Timetable slot assigned successfully!');
      }

      fetchMasterData();
      setTimeout(() => {
        setSlotModal(false);
        setModalSuccess(null);
      }, 1200);
    } catch (err: any) {
      setModalError(err.message || 'Slot allocation failed due to schedule conflict.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeleteSlot = async (slotId: number) => {
    if (!window.confirm('Are you sure you want to delete this timetable slot?')) return;
    try {
      await apiRequest(`/timetable/${slotId}`, { method: 'DELETE' });
      fetchMasterData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete slot.');
    }
  };

  // Filtered Entries based on user selection
  const filteredTimetable = timetable.filter(t => {
    if (!isHOD && facultyProfileId) {
      return t.faculty_id === facultyProfileId;
    }
    if (viewType === 'faculty' && selectedFacultyId !== 'all') {
      return t.faculty_id === selectedFacultyId;
    }
    if (viewType === 'room' && selectedRoomId !== 'all') {
      return t.room_id === selectedRoomId;
    }
    return true;
  });

  // Current Active Class Detector based on clock
  const isCurrentSlot = (day: string, periodNum: number) => {
    const now = new Date();
    const daysMap: Record<number, string> = { 1: "Monday", 2: "Tuesday", 3: "Wednesday", 4: "Thursday", 5: "Friday", 6: "Saturday" };
    const currentDayStr = daysMap[now.getDay()];
    if (currentDayStr !== day) return false;

    const pObj = PERIODS.find(p => p.num === periodNum);
    if (!pObj) return false;

    const parseTimeStr = (tStr: string) => {
      const [time, modifier] = tStr.split(' ');
      let [hours, minutes] = time.split(':').map(Number);
      if (modifier === 'PM' && hours < 12) hours += 12;
      if (modifier === 'AM' && hours === 12) hours = 0;
      return hours * 60 + minutes;
    };

    const nowMins = now.getHours() * 60 + now.getMinutes();
    const startMins = parseTimeStr(pObj.start);
    const endMins = parseTimeStr(pObj.end);

    return nowMins >= startMins && nowMins <= endMins;
  };

  // Print & PDF Functions
  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    const element = document.getElementById('printable-timetable-matrix');
    if (!element) return;
    try {
      const canvas = await html2canvas(element, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('landscape', 'mm', 'a4');
      const imgWidth = 280;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
      pdf.save('SSMIET_CyberSec_Timetable.pdf');
    } catch (err) {
      console.error('PDF export failed:', err);
      window.print();
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-orange-500" /> Master Timetable Management System
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            SSM Institute of Engineering and Technology — Cyber Security Department
          </p>
        </div>

        {/* Header Buttons */}
        <div className="flex flex-wrap items-center gap-2 no-print">
          <button
            onClick={handlePrint}
            className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors"
          >
            <Printer className="w-4 h-4 text-slate-500" /> Print Timetable
          </button>

          <button
            onClick={handleDownloadPDF}
            className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-4 h-4 text-orange-500" /> Download PDF
          </button>

          {isHOD && (
            <button
              onClick={() => openAddSlotModal()}
              className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold rounded-xl shadow-md shadow-orange-600/30 flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-4 h-4" /> Add Class Slot
            </button>
          )}
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="glass-card p-4 flex flex-col md:flex-row gap-4 items-center justify-between no-print">
        
        {/* Toggle View Mode */}
        {isHOD ? (
          <div className="flex items-center gap-2 w-full md:w-auto">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">View Mode:</span>
            <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-medium">
              <button
                onClick={() => { setViewType('all'); setSelectedFacultyId('all'); setSelectedRoomId('all'); }}
                className={`px-3 py-1.5 rounded-lg transition-all ${viewType === 'all' ? 'bg-orange-500 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400'}`}
              >
                Master Grid
              </button>
              <button
                onClick={() => { setViewType('faculty'); if (facultyList.length > 0) setSelectedFacultyId(facultyList[0].id); }}
                className={`px-3 py-1.5 rounded-lg transition-all ${viewType === 'faculty' ? 'bg-orange-500 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400'}`}
              >
                Faculty Schedule
              </button>
              <button
                onClick={() => { setViewType('room'); if (roomList.length > 0) setSelectedRoomId(roomList[0].id); }}
                className={`px-3 py-1.5 rounded-lg transition-all ${viewType === 'room' ? 'bg-orange-500 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400'}`}
              >
                Room Schedule
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-200">
            <span className="px-3.5 py-2 bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-900 rounded-xl flex items-center gap-2 shadow-xs">
              <User className="w-4 h-4 text-orange-500" /> Personal Faculty Schedule: {user?.profile?.full_name || user?.username} ({user?.profile?.employee_id})
            </span>
          </div>
        )}

        {/* Dynamic Secondary Filter (HOD Only) */}
        {isHOD && viewType === 'faculty' && (
          <div className="flex items-center gap-2 w-full md:w-72">
            <User className="w-4 h-4 text-orange-500 shrink-0" />
            <select
              value={selectedFacultyId}
              onChange={(e) => setSelectedFacultyId(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl outline-none font-semibold text-slate-900 dark:text-slate-100"
            >
              <option value="all">All Faculty Staff</option>
              {facultyList.map(f => (
                <option key={f.id} value={f.id}>{f.full_name} ({f.employee_id})</option>
              ))}
            </select>
          </div>
        )}

        {isHOD && viewType === 'room' && (
          <div className="flex items-center gap-2 w-full md:w-72">
            <DoorOpen className="w-4 h-4 text-orange-500 shrink-0" />
            <select
              value={selectedRoomId}
              onChange={(e) => setSelectedRoomId(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl outline-none font-semibold text-slate-900 dark:text-slate-100"
            >
              <option value="all">All Rooms & Labs</option>
              {roomList.map(r => (
                <option key={r.id} value={r.id}>{r.room_number} — {r.room_type}</option>
              ))}
            </select>
          </div>
        )}

      </div>

      {/* Printable Matrix Container */}
      <div id="printable-timetable-matrix" className="glass-card p-4 sm:p-6 overflow-hidden timetable-print-container">
        
        {/* Printable Header */}
        <div className="hidden print-only mb-6 border-b-2 border-orange-500 pb-4 text-center">
          <h1 className="text-xl font-bold">SSM Institute of Engineering and Technology (SSMIET)</h1>
          <h2 className="text-sm font-bold text-orange-600">Department of Cyber Security — Weekly Class Schedule</h2>
          <p className="text-xs text-slate-500 mt-1">Academic Year 2025-2026 • Semester V (Sec A & B)</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-slate-200 dark:border-slate-800 text-xs">
            <thead>
              <tr className="bg-gradient-to-r from-slate-100 via-indigo-50/80 to-slate-100 dark:from-slate-800 dark:via-slate-800/90 dark:to-slate-800 text-slate-700 dark:text-slate-300 uppercase tracking-wider font-bold">
                <th className="p-3 border border-slate-200 dark:border-slate-800 text-center w-24 bg-slate-200/80 dark:bg-slate-800/90 text-slate-800 dark:text-slate-200">Day</th>
                {PERIODS.map(p => (
                  <th key={p.num} className="p-2 border border-slate-200 dark:border-slate-800 text-center min-w-[130px]">
                    <div className="font-bold text-orange-600 dark:text-orange-400">Period {p.num}</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono font-normal">{p.start} - {p.end}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {DAYS.map(day => (
                <tr key={day} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                  
                  {/* Day Header Column */}
                  <td className={`p-3 border border-slate-200 dark:border-slate-800 font-extrabold text-xs text-center shadow-xs ${DAY_PASTEL_HEADER[day] || 'bg-slate-100 text-slate-800'}`}>
                    {day}
                  </td>

                  {/* 7 Periods Cells */}
                  {PERIODS.map(p => {
                    const matchingSlots = filteredTimetable.filter(
                      t => t.day_of_week === day && t.period_number === p.num
                    );
                    const isCurrent = isCurrentSlot(day, p.num);
                    const slotTheme = matchingSlots.length > 0 ? getPastelTheme(matchingSlots[0].subject_name, matchingSlots[0].id) : null;

                    return (
                      <td
                        key={p.num}
                        className={`p-2 border border-slate-200 dark:border-slate-800 align-top transition-all duration-200 relative ${
                          isCurrent
                            ? 'bg-amber-100/90 dark:bg-amber-950/60 ring-2 ring-amber-500 z-10 shadow-md'
                            : matchingSlots.length === 0
                            ? 'bg-slate-50/40 dark:bg-slate-900/20'
                            : slotTheme ? slotTheme.cellBg : 'bg-white dark:bg-slate-900/60'
                        }`}
                      >
                        {matchingSlots.length === 0 ? (
                          <div className="h-full min-h-[75px] flex flex-col justify-between p-1.5 rounded-xl border border-dashed border-emerald-300/60 dark:border-emerald-900/40 bg-emerald-50/50 dark:bg-emerald-950/20">
                            <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/70 px-2 py-0.5 rounded-full text-center self-center shadow-2xs">
                              FREE PERIOD
                            </span>
                            {isHOD && (
                              <button
                                onClick={() => openAddSlotModal(day, p.num)}
                                className="no-print mt-2 text-[10px] text-orange-600 hover:text-orange-700 dark:text-orange-400 hover:underline flex items-center justify-center gap-0.5 font-semibold"
                              >
                                <Plus className="w-3 h-3" /> Assign
                              </button>
                            )}
                          </div>
                        ) : (
                          matchingSlots.map(slot => {
                            const theme = getPastelTheme(slot.subject_name, slot.id);
                            return (
                              <div
                                key={slot.id}
                                className={`p-2.5 rounded-xl border space-y-1.5 shadow-xs transition-transform hover:-translate-y-0.5 group ${theme.cardBg}`}
                              >
                                <div className="flex justify-between items-start gap-1">
                                  <span className={`font-bold text-[11px] leading-tight ${theme.titleColor}`}>
                                    {slot.short_name}
                                  </span>
                                  <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded-md font-bold shrink-0 ${theme.badge}`}>
                                    {slot.room_number}
                                  </span>
                                </div>

                                <p className={`text-[10px] font-semibold line-clamp-1 ${theme.subText}`}>
                                  {slot.faculty_name}
                                </p>

                                <div className="flex items-center justify-between text-[9px] font-mono opacity-80 pt-0.5">
                                  <span className={theme.subText}>Sem {slot.semester} ({slot.section})</span>
                                </div>

                                {/* HOD Quick Actions */}
                                {isHOD && (
                                  <div className="no-print pt-1 flex justify-end space-x-1.5 border-t border-slate-300/40 dark:border-slate-700/50 opacity-80 group-hover:opacity-100">
                                    <button
                                      onClick={() => openEditSlotModal(slot)}
                                      className="p-1 text-slate-600 dark:text-slate-300 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
                                      title="Edit slot"
                                    >
                                      <Edit2 className="w-3 h-3" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteSlot(slot.id)}
                                      className="p-1 text-slate-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                                      title="Delete slot"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </div>
                                )}
                              </div>
                            );
                          })
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>

      {/* Add / Edit Timetable Slot Modal */}
      {slotModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4">
            
            <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-orange-500" />
                {editingSlot ? 'Edit Timetable Slot' : 'Assign New Class Slot'}
              </h3>
              <button onClick={() => setSlotModal(false)} className="text-slate-400 hover:text-slate-600 text-lg">×</button>
            </div>

            {modalError && (
              <div className="p-3 text-xs bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-300 rounded-xl border border-red-200 dark:border-red-900 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <div>{modalError}</div>
              </div>
            )}

            {modalSuccess && (
              <div className="p-3 text-xs bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-300 rounded-xl border border-green-200 dark:border-green-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                {modalSuccess}
              </div>
            )}

            <form onSubmit={handleSaveSlot} className="space-y-3 text-xs">
              
              {/* Faculty Member Selection / Dynamic Typing */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Assign Faculty Member <span className="text-red-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const nextMode = !customFacMode;
                      setCustomFacMode(nextMode);
                      if (nextMode) setFormData(prev => ({ ...prev, faculty_id: 0 }));
                    }}
                    className="text-[10px] text-orange-600 dark:text-orange-400 font-bold hover:underline"
                  >
                    {customFacMode ? '← Pick Existing Faculty' : '+ Type Custom Faculty Name'}
                  </button>
                </div>

                {customFacMode ? (
                  <input
                    type="text"
                    required
                    value={formData.faculty_name}
                    onChange={(e) => setFormData({ ...formData, faculty_id: 0, faculty_name: e.target.value })}
                    placeholder="Type custom faculty name e.g. Dr. Alexander"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl outline-none text-slate-900 dark:text-slate-100 font-medium"
                  />
                ) : (
                  <select
                    required
                    value={formData.faculty_id || ''}
                    onChange={(e) => {
                      const fid = Number(e.target.value);
                      const selectedFac = facultyList.find(f => f.id === fid);
                      setFormData(prev => ({
                        ...prev,
                        faculty_id: fid,
                        faculty_name: selectedFac ? selectedFac.full_name : prev.faculty_name
                      }));
                    }}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl outline-none text-slate-900 dark:text-slate-100 font-medium"
                  >
                    <option value="" disabled>-- Select Faculty --</option>
                    {facultyList.map(f => (
                      <option key={f.id} value={f.id}>{f.full_name} ({f.employee_id})</option>
                    ))}
                  </select>
                )}
              </div>

              {/* Subject Selection / Dynamic Typing */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Class / Subject Name <span className="text-red-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const nextMode = !customSubMode;
                      setCustomSubMode(nextMode);
                      if (nextMode) setFormData(prev => ({ ...prev, subject_id: 0 }));
                    }}
                    className="text-[10px] text-orange-600 dark:text-orange-400 font-bold hover:underline"
                  >
                    {customSubMode ? '← Pick Existing Subject' : '+ Type Custom Subject'}
                  </button>
                </div>

                {customSubMode ? (
                  <input
                    type="text"
                    required
                    value={formData.subject_name}
                    onChange={(e) => setFormData({ ...formData, subject_id: 0, subject_name: e.target.value })}
                    placeholder="Type subject name e.g. Quantum Cryptography"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl outline-none text-slate-900 dark:text-slate-100 font-medium"
                  />
                ) : (
                  <select
                    required
                    value={formData.subject_id || ''}
                    onChange={(e) => {
                      const sid = Number(e.target.value);
                      const selectedSub = subjectList.find(s => s.id === sid);
                      setFormData(prev => ({
                        ...prev,
                        subject_id: sid,
                        subject_name: selectedSub ? selectedSub.subject_name : prev.subject_name
                      }));
                    }}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl outline-none text-slate-900 dark:text-slate-100 font-medium"
                  >
                    <option value="" disabled>-- Select Subject --</option>
                    {subjectList.map(s => (
                      <option key={s.id} value={s.id}>{s.subject_code} — {s.subject_name} ({s.short_name})</option>
                    ))}
                  </select>
                )}
              </div>

              {/* Room Selection / Dynamic Typing */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Assigned Room / Hall Number <span className="text-red-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const nextMode = !customRoomMode;
                      setCustomRoomMode(nextMode);
                      if (nextMode) setFormData(prev => ({ ...prev, room_id: 0 }));
                    }}
                    className="text-[10px] text-orange-600 dark:text-orange-400 font-bold hover:underline"
                  >
                    {customRoomMode ? '← Pick Existing Room' : '+ Type Custom Room'}
                  </button>
                </div>

                {customRoomMode ? (
                  <input
                    type="text"
                    required
                    value={formData.room_number}
                    onChange={(e) => setFormData({ ...formData, room_id: 0, room_number: e.target.value })}
                    placeholder="Type hall/room number e.g. CY-LAB-03"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl outline-none text-slate-900 dark:text-slate-100 font-medium font-mono"
                  />
                ) : (
                  <select
                    required
                    value={formData.room_id || ''}
                    onChange={(e) => {
                      const rid = Number(e.target.value);
                      const selectedRm = roomList.find(r => r.id === rid);
                      setFormData(prev => ({
                        ...prev,
                        room_id: rid,
                        room_number: selectedRm ? selectedRm.room_number : prev.room_number
                      }));
                    }}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl outline-none text-slate-900 dark:text-slate-100 font-medium font-mono"
                  >
                    <option value="" disabled>-- Select Room / Hall --</option>
                    {roomList.map(r => (
                      <option key={r.id} value={r.id}>{r.room_number} ({r.room_type})</option>
                    ))}
                  </select>
                )}
              </div>

              {/* Day & Period Selection / Timings */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Day of Week</label>
                  <select
                    value={formData.day_of_week}
                    onChange={(e) => setFormData({ ...formData, day_of_week: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl outline-none text-slate-900 dark:text-slate-100"
                  >
                    {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Period Slot</label>
                  <select
                    value={formData.period_number}
                    onChange={(e) => handlePeriodChange(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl outline-none text-slate-900 dark:text-slate-100"
                  >
                    {PERIODS.map(p => (
                      <option key={p.num} value={p.num}>Period {p.num} ({p.start} - {p.end})</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Custom Timings Inputs */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Start Time</label>
                  <input
                    type="text"
                    value={formData.start_time}
                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                    placeholder="e.g. 09:00 AM"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl outline-none text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">End Time</label>
                  <input
                    type="text"
                    value={formData.end_time}
                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                    placeholder="e.g. 09:50 AM"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl outline-none text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              {/* Semester & Section */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Semester</label>
                  <select
                    value={formData.semester}
                    onChange={(e) => setFormData({ ...formData, semester: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl outline-none text-slate-900 dark:text-slate-100"
                  >
                    <option value={3}>Semester III</option>
                    <option value={5}>Semester V</option>
                    <option value={7}>Semester VII</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Section</label>
                  <input
                    type="text"
                    value={formData.section}
                    onChange={(e) => setFormData({ ...formData, section: e.target.value.toUpperCase() })}
                    placeholder="e.g. A, B, or C"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl outline-none text-slate-900 dark:text-slate-100 uppercase"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setSlotModal(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="px-4 py-2 bg-orange-600 text-white font-semibold rounded-xl shadow-md shadow-orange-600/30"
                >
                  {modalLoading ? 'Saving Slot...' : 'Save Timetable Slot'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
