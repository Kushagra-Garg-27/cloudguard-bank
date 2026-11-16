'use client';

import React, { useState } from 'react';
import {
  GraduationCap,
  BookOpen,
  Code2,
  Copy,
  Check,
  Search,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  FileCode,
  Award
} from 'lucide-react';
import { COURSE_UNITS, LAB_ASSIGNMENTS } from '../lib/syllabus-mapping';
import { CourseUnit, LabAssignment } from '../types/cloud';

export const SyllabusVivaView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'UNITS' | 'LABS'>('UNITS');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedUnit, setSelectedUnit] = useState<CourseUnit>(COURSE_UNITS[0]);
  const [selectedLab, setSelectedLab] = useState<LabAssignment>(LAB_ASSIGNMENTS[0]);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const handleCopy = (text: string, label: string) => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedText(label);
      setTimeout(() => setCopiedText(null), 2000);
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
    <div className="space-y-6">
      
      {/* Header & Academic Governance Strip */}
      <section className="bg-white border border-[#D9D6CF] rounded-2xl p-6 sm:p-8 shadow-bento font-sans">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#D9D6CF]">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-[#F45B2A] font-bold mb-1">
              CURRICULUM MAPPING & VIVA PRESENTATION EVIDENCE
            </div>
            <h2 className="font-display font-extrabold text-2xl text-[#171717] tracking-tight">
              DS3203A: Cloud Computing — Syllabus Proof & Viva Defense
            </h2>
            <p className="text-xs text-[#73716B] mt-1">
              100% curriculum alignment across 6 theoretical units and 14 laboratory assignments backed by working production code.
            </p>
          </div>

          <div className="flex items-center gap-1.5 font-mono text-xs">
            <button
              onClick={() => setActiveTab('UNITS')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                activeTab === 'UNITS'
                  ? 'bg-[#171717] text-white border-[#171717]'
                  : 'bg-[#F5F3EF] text-[#73716B] border-[#D9D6CF] hover:bg-[#EEECE6] hover:text-[#171717]'
              }`}
            >
              6 Course Units
            </button>
            <button
              onClick={() => setActiveTab('LABS')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                activeTab === 'LABS'
                  ? 'bg-[#171717] text-white border-[#171717]'
                  : 'bg-[#F5F3EF] text-[#73716B] border-[#D9D6CF] hover:bg-[#EEECE6] hover:text-[#171717]'
              }`}
            >
              14 Lab Assignments
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="pt-4 flex items-center justify-between gap-3 text-xs">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-[#85837E] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search units, lab assignments, or viva topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[#F5F3EF] border border-[#D9D6CF] rounded-xl text-[#171717] font-mono text-xs focus:outline-none focus:border-[#171717]"
            />
          </div>

          <div className="text-xs font-mono text-[#85837E] hidden sm:block">
            Course ID: <strong className="text-[#171717]">DS3203A (Cloud Computing)</strong>
          </div>
        </div>
      </section>

      {/* Main Tabbed Content: Course Units or Labs */}
      {activeTab === 'UNITS' ? (
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-5 font-sans">
          
          {/* Units Master List (col-span-5) */}
          <div className="lg:col-span-5 space-y-2">
            {filteredUnits.map((unit) => {
              const isSelected = selectedUnit.id === unit.id;
              return (
                <div
                  key={unit.id}
                  onClick={() => setSelectedUnit(unit)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-white border-[#171717] shadow-bento ring-1 ring-[#171717]'
                      : 'bg-white/80 hover:bg-white border-[#D9D6CF]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-mono text-[10px] font-bold text-[#F45B2A] bg-[#FFF3EE] px-2 py-0.5 rounded border border-[#FDC4B0]">
                      {unit.unitCode}
                    </span>
                    <span className="text-[10px] font-mono text-[#85837E]">Unit {unit.id} of 6</span>
                  </div>
                  <h4 className="font-display font-bold text-sm text-[#171717] tracking-tight">
                    {unit.title}
                  </h4>
                  <p className="text-xs text-[#73716B] mt-1 line-clamp-2">
                    {unit.curriculumFocus}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Unit Detailed Evidence & Talking Points (col-span-7) */}
          <div className="lg:col-span-7 bg-white border border-[#D9D6CF] rounded-2xl p-6 sm:p-7 shadow-bento space-y-4">
            <div className="flex items-center justify-between pb-3.5 border-b border-[#D9D6CF]">
              <div>
                <span className="text-[10px] font-mono font-bold text-[#F45B2A] bg-[#FFF3EE] px-2 py-0.5 rounded border border-[#FDC4B0]">
                  {selectedUnit.unitCode}
                </span>
                <h3 className="font-display font-extrabold text-lg text-[#171717] tracking-tight mt-1">
                  {selectedUnit.title}
                </h3>
              </div>

              <button
                onClick={() => handleCopy(selectedUnit.vivaTalkingPoints.join('\n'), `unit-${selectedUnit.id}`)}
                className="px-3 py-1.5 rounded-xl border border-[#D9D6CF] bg-[#F5F3EF] hover:bg-white text-xs font-mono font-semibold text-[#171717] transition-all flex items-center gap-1.5 shadow-subtle"
              >
                {copiedText === `unit-${selectedUnit.id}` ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[#236B43]" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Viva Proof</span>
                  </>
                )}
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-[#F5F3EF] rounded-xl border border-[#D9D6CF]">
                <span className="text-[10px] font-mono text-[#85837E] block mb-0.5">CURRICULUM FOCUS:</span>
                <p className="text-[#171717] font-medium leading-relaxed">{selectedUnit.curriculumFocus}</p>
              </div>

              <div className="p-3 bg-[#F5F3EF] rounded-xl border border-[#D9D6CF] font-mono text-[11px]">
                <span className="text-[10px] text-[#85837E] block mb-0.5">IMPLEMENTED REPOSITORY MODULE:</span>
                <div className="font-bold text-[#171717]">{selectedUnit.implementedModule}</div>
                <div className="text-[#85837E] mt-0.5">{selectedUnit.fileReference}</div>
              </div>

              <div>
                <div className="text-[10px] font-mono uppercase tracking-wider text-[#85837E] font-bold mb-2">
                  Key Viva Defense Talking Points (Ready for Evaluator):
                </div>
                <div className="space-y-2">
                  {selectedUnit.vivaTalkingPoints.map((point, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-[#F5F3EF] rounded-xl border border-[#D9D6CF] flex items-start gap-2.5 text-xs text-[#171717]"
                    >
                      <CheckCircle2 className="w-4 h-4 text-[#236B43] mt-0.5 shrink-0" />
                      <span className="leading-relaxed">{point}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

        </section>
      ) : (
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-5 font-sans">
          
          {/* Labs Master List (col-span-5) */}
          <div className="lg:col-span-5 space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {filteredLabs.map((lab) => {
              const isSelected = selectedLab.id === lab.id;
              return (
                <div
                  key={lab.id}
                  onClick={() => setSelectedLab(lab)}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-white border-[#171717] shadow-bento ring-1 ring-[#171717]'
                      : 'bg-white/80 hover:bg-white border-[#D9D6CF]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-[10px] font-bold text-[#F45B2A] bg-[#FFF3EE] px-2 py-0.5 rounded border border-[#FDC4B0]">
                      {lab.assignmentCode}
                    </span>
                    <span className="text-[10px] font-mono text-[#85837E]">Lab {lab.id}</span>
                  </div>
                  <h4 className="font-display font-bold text-xs text-[#171717] tracking-tight">
                    {lab.title}
                  </h4>
                  <p className="text-[11px] text-[#73716B] mt-0.5 line-clamp-1">
                    {lab.objective}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Lab Code & Objective Deep Dive (col-span-7) */}
          <div className="lg:col-span-7 bg-white border border-[#D9D6CF] rounded-2xl p-6 sm:p-7 shadow-bento space-y-4">
            <div className="flex items-center justify-between pb-3.5 border-b border-[#D9D6CF]">
              <div>
                <span className="text-[10px] font-mono font-bold text-[#F45B2A] bg-[#FFF3EE] px-2 py-0.5 rounded border border-[#FDC4B0]">
                  {selectedLab.assignmentCode}
                </span>
                <h3 className="font-display font-extrabold text-lg text-[#171717] tracking-tight mt-1">
                  {selectedLab.title}
                </h3>
              </div>

              <button
                onClick={() => handleCopy(selectedLab.codeSnippet, `lab-${selectedLab.id}`)}
                className="px-3 py-1.5 rounded-xl border border-[#D9D6CF] bg-[#F5F3EF] hover:bg-white text-xs font-mono font-semibold text-[#171717] transition-all flex items-center gap-1.5 shadow-subtle"
              >
                {copiedText === `lab-${selectedLab.id}` ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[#236B43]" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Code</span>
                  </>
                )}
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-[#F5F3EF] rounded-xl border border-[#D9D6CF]">
                <span className="text-[10px] font-mono text-[#85837E] block mb-0.5">LAB OBJECTIVE:</span>
                <p className="text-[#171717] font-medium leading-relaxed">{selectedLab.objective}</p>
              </div>

              <div className="p-3 bg-[#F5F3EF] rounded-xl border border-[#D9D6CF]">
                <span className="text-[10px] font-mono text-[#85837E] block mb-0.5">SOLUTION SUMMARY:</span>
                <p className="text-[#403E39] leading-relaxed">{selectedLab.solutionSummary}</p>
              </div>

              <div className="font-mono text-[11px] text-[#85837E]">
                File Reference: <strong className="text-[#171717]">{selectedLab.fileReference}</strong>
              </div>

              <div>
                <div className="text-[10px] font-mono uppercase tracking-wider text-[#85837E] font-bold mb-1.5">
                  Production AWS CloudFormation / Python Code Snippet:
                </div>
                <div className="bg-[#171717] text-[#EEECE6] p-4 rounded-xl font-mono text-[10px] overflow-x-auto leading-relaxed border border-[#D9D6CF] shadow-inner max-h-[220px]">
                  <pre>{selectedLab.codeSnippet}</pre>
                </div>
              </div>
            </div>
          </div>

        </section>
      )}

    </div>
  );
};
