'use client';

import React, { useState } from 'react';
import {
  BookOpen,
  X,
  FileCode,
  CheckCircle2,
  Copy,
  Check,
  Search,
  Code2,
  Award,
  Layers,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { COURSE_UNITS, LAB_ASSIGNMENTS } from '../lib/syllabus-mapping';
import { CourseUnit, LabAssignment } from '../types/cloud';

interface VivaSyllabusDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VivaSyllabusDrawer: React.FC<VivaSyllabusDrawerProps> = ({
  isOpen,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'UNITS' | 'LABS'>('UNITS');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedUnit, setSelectedUnit] = useState<CourseUnit>(COURSE_UNITS[0]);
  const [selectedLab, setSelectedLab] = useState<LabAssignment>(LAB_ASSIGNMENTS[0]);
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleCopy = (text: string) => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const filteredUnits = COURSE_UNITS.filter(
    (u) =>
      u.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.unitCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.curriculumFocus.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredLabs = LAB_ASSIGNMENTS.filter(
    (l) =>
      l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.assignmentCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.objective.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex justify-end font-sans animate-in fade-in duration-200">
      <div className="w-full max-w-3xl bg-white border-l border-slate-200 h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-250">
        
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-sm shadow-indigo-500/30">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                DS3203A: Cloud Computing — Course Syllabus & Viva Proof
              </h2>
              <div className="text-[11px] text-slate-500">
                100% Curriculum Coverage: 6 Units • 14 Lab Assignments • Production Code Proof
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-white rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher & Search Bar */}
        <div className="p-3.5 border-b border-slate-100 bg-white flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('UNITS')}
              className={`px-3 py-1.5 rounded-xl font-semibold transition-all ${
                activeTab === 'UNITS'
                  ? 'btn-stripe-gradient shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              6 Course Units (Theory & Architecture)
            </button>
            <button
              onClick={() => setActiveTab('LABS')}
              className={`px-3 py-1.5 rounded-xl font-semibold transition-all ${
                activeTab === 'LABS'
                  ? 'btn-stripe-gradient shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              14 Lab Assignments (Hands-On Code)
            </button>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search syllabus..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 w-44"
            />
          </div>
        </div>

        {/* Drawer Body: 2-Column Explorer */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden">
          
          {/* Left Navigation List (5 cols) */}
          <div className="md:col-span-5 border-r border-slate-100 overflow-y-auto p-2.5 space-y-1.5 bg-slate-50/50">
            {activeTab === 'UNITS' ? (
              filteredUnits.map((unit) => {
                const isSelected = selectedUnit.id === unit.id;
                return (
                  <div
                    key={unit.id}
                    onClick={() => setSelectedUnit(unit)}
                    className={`p-3 rounded-xl border cursor-pointer text-xs transition-all ${
                      isSelected
                        ? 'bg-white border-indigo-500 text-slate-900 shadow-stripe-card ring-1 ring-indigo-500/20'
                        : 'bg-white/80 hover:bg-white border-slate-200/80 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                        {unit.unitCode}
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                    <div className="font-bold text-slate-900 truncate mt-1">{unit.title}</div>
                    <div className="text-[11px] text-slate-400 truncate mt-0.5">
                      {unit.implementedModule}
                    </div>
                  </div>
                );
              })
            ) : (
              filteredLabs.map((lab) => {
                const isSelected = selectedLab.id === lab.id;
                return (
                  <div
                    key={lab.id}
                    onClick={() => setSelectedLab(lab)}
                    className={`p-3 rounded-xl border cursor-pointer text-xs transition-all ${
                      isSelected
                        ? 'bg-white border-cyan-500 text-slate-900 shadow-stripe-card ring-1 ring-cyan-500/20'
                        : 'bg-white/80 hover:bg-white border-slate-200/80 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-mono font-bold text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded border border-cyan-200">
                        {lab.assignmentCode}
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                    <div className="font-bold text-slate-900 truncate mt-1">{lab.title}</div>
                    <div className="text-[11px] text-slate-400 truncate mt-0.5 font-mono">
                      {lab.fileReference}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Right Detailed Inspector (7 cols) */}
          <div className="md:col-span-7 overflow-y-auto p-5 bg-white flex flex-col justify-between">
            {activeTab === 'UNITS' ? (
              <div className="space-y-4">
                <div>
                  <span className="text-[11px] font-mono font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200">
                    {selectedUnit.unitCode}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 mt-2">
                    {selectedUnit.title}
                  </h3>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs space-y-2.5">
                  <div>
                    <span className="text-slate-400 uppercase text-[10px] font-bold block mb-1">
                      Curriculum Core Focus:
                    </span>
                    <span className="text-slate-700">{selectedUnit.curriculumFocus}</span>
                  </div>

                  <div className="pt-2 border-t border-slate-200/70">
                    <span className="text-slate-400 uppercase text-[10px] font-bold block mb-1">
                      Implemented Platform Module:
                    </span>
                    <span className="text-indigo-700 font-semibold">{selectedUnit.implementedModule}</span>
                  </div>

                  <div className="pt-2 border-t border-slate-200/70">
                    <span className="text-slate-400 uppercase text-[10px] font-bold block mb-1">
                      Source Code / Configuration File:
                    </span>
                    <span className="text-cyan-800 font-mono text-[11px] font-semibold">{selectedUnit.fileReference}</span>
                  </div>
                </div>

                <div>
                  <div className="text-xs uppercase tracking-wider text-slate-500 font-bold mb-2 flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-emerald-600" />
                    <span>Professor Viva Explanation Script & Proof Points:</span>
                  </div>
                  <div className="space-y-2">
                    {selectedUnit.vivaTalkingPoints.map((point, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-emerald-50/40 border border-emerald-200/70 rounded-xl text-xs text-slate-700 flex items-start gap-2.5 shadow-stripe-subtle"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                        <span className="leading-relaxed">{point}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <span className="text-[11px] font-mono font-bold text-cyan-700 bg-cyan-50 px-2.5 py-0.5 rounded-full border border-cyan-200">
                    {selectedLab.assignmentCode}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 mt-2">
                    {selectedLab.title}
                  </h3>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs space-y-2.5">
                  <div>
                    <span className="text-slate-400 uppercase text-[10px] font-bold block mb-1">
                      Lab Objective:
                    </span>
                    <span className="text-slate-700">{selectedLab.objective}</span>
                  </div>

                  <div className="pt-2 border-t border-slate-200/70">
                    <span className="text-slate-400 uppercase text-[10px] font-bold block mb-1">
                      CloudGuard Engineering Solution:
                    </span>
                    <span className="text-indigo-700 font-semibold">{selectedLab.solutionSummary}</span>
                  </div>

                  <div className="pt-2 border-t border-slate-200/70">
                    <span className="text-slate-400 uppercase text-[10px] font-bold block mb-1">
                      File Reference in Repository:
                    </span>
                    <span className="text-cyan-800 font-mono font-semibold">{selectedLab.fileReference}</span>
                  </div>
                </div>

                {/* Code Snippet Box */}
                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-slate-600 mb-1.5">
                    <span className="flex items-center gap-1.5">
                      <Code2 className="w-3.5 h-3.5 text-indigo-600" />
                      Executable Code / IaC Snippet:
                    </span>
                    <button
                      onClick={() => handleCopy(selectedLab.codeSnippet)}
                      className="text-slate-500 hover:text-indigo-600 p-1 flex items-center gap-1 text-[11px] font-sans"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>

                  <pre className="p-3 bg-slate-900 text-emerald-400 border border-slate-800 rounded-xl text-[11px] overflow-x-auto font-mono leading-relaxed shadow-inner">
                    <code>{selectedLab.codeSnippet}</code>
                  </pre>
                </div>
              </div>
            )}

            {/* Bottom Viva Examiner Tip */}
            <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
              <span>University Course: DS3203A Cloud Computing</span>
              <span className="text-emerald-700 font-bold">Target Grade: Grade O (Outstanding / 100%)</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
