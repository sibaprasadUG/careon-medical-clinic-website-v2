import React, { useState, useEffect } from 'react';
import { Doctor, DoctorCustomSchedule } from '../../types';
import { DoctorScheduleForm } from './DoctorScheduleForm';
import { X, Calendar, Stethoscope } from 'lucide-react';

interface DoctorScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  doctor?: Doctor | null;
  doctorsList?: Doctor[];
  onSaveDoctor: (updatedDoctor: Doctor) => void;
}

export const DoctorScheduleModal: React.FC<DoctorScheduleModalProps> = ({
  isOpen,
  onClose,
  doctor,
  doctorsList,
  onSaveDoctor
}) => {
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('');

  useEffect(() => {
    if (doctor?.id) {
      setSelectedDoctorId(doctor.id);
    } else if (doctorsList && doctorsList.length > 0 && !selectedDoctorId) {
      setSelectedDoctorId(doctorsList[0].id);
    }
  }, [doctor, doctorsList, selectedDoctorId]);

  if (!isOpen) return null;

  const activeDoctor =
    doctorsList?.find((d) => d.id === selectedDoctorId) || doctor || null;

  const currentSchedules: DoctorCustomSchedule[] = activeDoctor?.customSchedules || [];

  const handleSaveSchedule = (newOrUpdatedSchedule: DoctorCustomSchedule) => {
    if (!activeDoctor) return;

    const existing = activeDoctor.customSchedules || [];
    const index = existing.findIndex((s) => s.id === newOrUpdatedSchedule.id);
    let updatedSchedules: DoctorCustomSchedule[];

    if (index >= 0) {
      updatedSchedules = [...existing];
      updatedSchedules[index] = newOrUpdatedSchedule;
    } else {
      updatedSchedules = [newOrUpdatedSchedule, ...existing];
    }

    const updatedDoc: Doctor = {
      ...activeDoctor,
      customSchedules: updatedSchedules,
      roomNumber: newOrUpdatedSchedule.roomNumber || activeDoctor.roomNumber,
      chamberCustom: newOrUpdatedSchedule.roomNumber || activeDoctor.chamberCustom
    };

    onSaveDoctor(updatedDoc);
  };

  const handleDeleteSchedule = (scheduleId: string) => {
    if (!activeDoctor) return;

    const existing = activeDoctor.customSchedules || [];
    const updatedSchedules = existing.filter((s) => s.id !== scheduleId);

    const updatedDoc: Doctor = {
      ...activeDoctor,
      customSchedules: updatedSchedules
    };

    onSaveDoctor(updatedDoc);
  };

  const handleToggleScheduleStatus = (scheduleId: string) => {
    if (!activeDoctor) return;

    const existing = activeDoctor.customSchedules || [];
    const updatedSchedules = existing.map((s) => {
      if (s.id === scheduleId) {
        const nextStatus: 'ACTIVE' | 'INACTIVE' =
          s.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
        return { ...s, status: nextStatus };
      }
      return s;
    });

    const updatedDoc: Doctor = {
      ...activeDoctor,
      customSchedules: updatedSchedules
    };

    onSaveDoctor(updatedDoc);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Modal Top Bar */}
        <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#007E70] flex items-center justify-center text-white">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold tracking-tight">
                Chamber Schedule & Recurrence Manager
              </h3>
              <p className="text-[11px] text-slate-300">
                {activeDoctor ? `Dr. ${activeDoctor.name} • ${activeDoctor.designation || 'Consultant'}` : 'CareOn Medical Clinic'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
          <DoctorScheduleForm
            doctor={activeDoctor || undefined}
            doctorsList={doctorsList}
            selectedDoctorId={selectedDoctorId}
            onDoctorChange={setSelectedDoctorId}
            schedules={currentSchedules}
            onSaveSchedule={handleSaveSchedule}
            onDeleteSchedule={handleDeleteSchedule}
            onToggleScheduleStatus={handleToggleScheduleStatus}
          />
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-500">
            Appointments booked under previous schedules remain safely stored.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
