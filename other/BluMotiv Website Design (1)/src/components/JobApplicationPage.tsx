import { ArrowLeft, MapPin, Clock, Users } from 'lucide-react';
import { Button } from './ui/button';
import React from 'react';

interface JobApplicationPageProps {
  job: any;
  onBack: () => void;
}

function JobApplicationPage({ job, onBack }: JobApplicationPageProps) {
  if (!job) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl text-[#F0F8FE] mb-4">Job not found</h2>
          <Button onClick={onBack} className="bg-[#247FFF] text-[#F0F8FE] hover:bg-[#247FFF]/80">
            Back to Careers
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#1a2332' }}>
      {/* Navigation */}
      <div className="pt-24 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Button
            onClick={onBack}
            variant="ghost"
            className="text-[#F0F8FE] hover:text-[#247FFF] mb-6 p-0"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Careers
          </Button>
        </div>
      </div>

      {/* Job Details */}
      <div className="pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Job Information - Left Side (2 columns) */}
            <div className="lg:col-span-2 space-y-8">
              {/* Job Header */}
              <div className="p-6 rounded-lg backdrop-blur-sm border border-[#F0F8FE]/10" style={{ backgroundColor: '#304461' }}>
                <h1 className="text-3xl text-[#F0F8FE] mb-4 font-bold">{job.title}</h1>
                <div className="flex flex-wrap gap-6 text-[#F0F8FE]/80">
                  <div className="flex items-center">
                    <MapPin size={18} className="mr-2 text-[#247FFF]" />
                    <span>{job.location}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock size={18} className="mr-2 text-[#247FFF]" />
                    <span>{job.type} • {job.experience}</span>
                  </div>
                  <div className="flex items-center">
                    <Users size={18} className="mr-2 text-[#247FFF]" />
                    <span>Posted {job.posted}</span>
                  </div>
                </div>
              </div>

              {/* Job Description */}
              <div className="p-6 rounded-lg backdrop-blur-sm border border-[#F0F8FE]/10" style={{ backgroundColor: '#304461' }}>
                <h3 className="text-xl text-[#F0F8FE] mb-4 font-semibold">About the Role</h3>
                <p className="text-[#F0F8FE]/80 text-lg leading-relaxed">{job.description}</p>
              </div>

              {/* Responsibilities */}
              <div className="p-6 rounded-lg backdrop-blur-sm border border-[#F0F8FE]/10" style={{ backgroundColor: '#304461' }}>
                <h3 className="text-xl text-[#F0F8FE] mb-4 font-semibold">Key Responsibilities</h3>
                <ul className="space-y-3">
                  {job.responsibilities?.map((responsibility: string, index: number) => (
                    <li key={index} className="text-[#F0F8FE]/80 flex items-start">
                      <span className="text-green-400 mr-3 mt-1 flex-shrink-0">•</span>
                      <span>{responsibility}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Requirements */}
              <div className="p-6 rounded-lg backdrop-blur-sm border border-[#F0F8FE]/10" style={{ backgroundColor: '#304461' }}>
                <h3 className="text-xl text-[#F0F8FE] mb-4 font-semibold">Requirements</h3>
                <ul className="space-y-3">
                  {job.requirements?.map((requirement: string, index: number) => (
                    <li key={index} className="text-[#F0F8FE]/80 flex items-start">
                      <span className="text-blue-400 mr-3 mt-1 flex-shrink-0">•</span>
                      <span>{requirement}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* KRA (Key Result Areas) */}
              {job.kra && (
                <div className="p-6 rounded-lg backdrop-blur-sm border border-[#F0F8FE]/10" style={{ backgroundColor: '#304461' }}>
                  <h3 className="text-xl text-[#F0F8FE] mb-4 font-semibold">Key Result Areas (KRA)</h3>
                  <ul className="space-y-3">
                    {job.kra.map((item: string, index: number) => (
                      <li key={index} className="text-[#F0F8FE]/80 flex items-start">
                        <span className="text-blue-400 mr-3 mt-1 flex-shrink-0">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* KPI (Key Performance Indicators) */}
              {job.kpi && (
                <div className="p-6 rounded-lg backdrop-blur-sm border border-[#F0F8FE]/10" style={{ backgroundColor: '#304461' }}>
                  <h3 className="text-xl text-[#F0F8FE] mb-4 font-semibold">Key Performance Indicators (KPI)</h3>
                  <ul className="space-y-3">
                    {job.kpi.map((item: string, index: number) => (
                      <li key={index} className="text-[#F0F8FE]/80 flex items-start">
                        <span className="text-green-400 mr-3 mt-1 flex-shrink-0">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Behavioral Competencies */}
              {job.behavioralCompetencies && (
                <div className="p-6 rounded-lg backdrop-blur-sm border border-[#F0F8FE]/10" style={{ backgroundColor: '#304461' }}>
                  <h3 className="text-xl text-[#F0F8FE] mb-4 font-semibold">Behavioral Competencies</h3>
                  <ul className="space-y-3">
                    {job.behavioralCompetencies.map((item: string, index: number) => (
                      <li key={index} className="text-[#F0F8FE]/80 flex items-start">
                        <span className="text-purple-400 mr-3 mt-1 flex-shrink-0">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Behavioral and Soft Skills (for Interns) */}
              {job.behavioralAndSoftSkills && (
                <div className="p-6 rounded-lg backdrop-blur-sm border border-[#F0F8FE]/10" style={{ backgroundColor: '#304461' }}>
                  <h3 className="text-xl text-[#F0F8FE] mb-4 font-semibold">Behavioral and Soft Skills</h3>
                  <ul className="space-y-3">
                    {job.behavioralAndSoftSkills.map((item: string, index: number) => (
                      <li key={index} className="text-[#F0F8FE]/80 flex items-start">
                        <span className="text-purple-400 mr-3 mt-1 flex-shrink-0">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Soft Skills */}
              {job.softSkills && (
                <div className="p-6 rounded-lg backdrop-blur-sm border border-[#F0F8FE]/10" style={{ backgroundColor: '#304461' }}>
                  <h3 className="text-xl text-[#F0F8FE] mb-4 font-semibold">Soft Skills</h3>
                  <ul className="space-y-3">
                    {job.softSkills.map((item: string, index: number) => (
                      <li key={index} className="text-[#F0F8FE]/80 flex items-start">
                        <span className="text-yellow-400 mr-3 mt-1 flex-shrink-0">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Remote Work Readiness */}
              {job.remoteWorkReadiness && (
                <div className="p-6 rounded-lg backdrop-blur-sm border border-[#F0F8FE]/10" style={{ backgroundColor: '#304461' }}>
                  <h3 className="text-xl text-[#F0F8FE] mb-4 font-semibold">Remote Work Readiness</h3>
                  <ul className="space-y-3">
                    {job.remoteWorkReadiness.map((item: string, index: number) => (
                      <li key={index} className="text-[#F0F8FE]/80 flex items-start">
                        <span className="text-orange-400 mr-3 mt-1 flex-shrink-0">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Startup Culture Fit */}
              {job.startupCultureFit && (
                <div className="p-6 rounded-lg backdrop-blur-sm border border-[#F0F8FE]/10" style={{ backgroundColor: '#304461' }}>
                  <h3 className="text-xl text-[#F0F8FE] mb-4 font-semibold">Startup Culture Fit</h3>
                  <ul className="space-y-3">
                    {job.startupCultureFit.map((item: string, index: number) => (
                      <li key={index} className="text-[#F0F8FE]/80 flex items-start">
                        <span className="text-pink-400 mr-3 mt-1 flex-shrink-0">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Application Section - Right Side (1 column) */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 p-6 rounded-lg backdrop-blur-sm border border-[#F0F8FE]/10" style={{ backgroundColor: '#304461' }}>
                <h3 className="text-xl text-[#F0F8FE] mb-6 font-semibold">Apply for this Position</h3>
                <div className="space-y-4">
                  <p className="text-[#F0F8FE]/80 text-sm leading-relaxed">
                    Ready to join our team? Click the button below to start your application process through our online form.
                  </p>
                  
                  <Button
                    onClick={() => {
                      window.open('https://forms.office.com/Pages/ResponsePage.aspx?id=n50Y_y38lkesYw0081oC0YLuEpgeXVFPtnKTluv1gnhUOFdXSFQzMEk5R0I0UzZVNExQSURIT0dITi4u', '_blank', 'noopener,noreferrer');
                    }}
                    className="w-full bg-[#247FFF] text-[#F0F8FE] hover:bg-[#247FFF]/80 transition-colors py-3"
                  >
                    Apply Now
                  </Button>
                  
                  <p className="text-[#F0F8FE]/60 text-xs text-center">
                    Application will open in a new tab
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default JobApplicationPage;
