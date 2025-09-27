import { useState } from 'react';
import { ArrowLeft, Search, MapPin, Clock, Users } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';

interface CareerPageProps {
  onNavigate: (page: string) => void;
}

export default function CareerPage({ onNavigate }: CareerPageProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const handleJobClick = (job: any) => {
    // Store the selected job in sessionStorage for the application page
    sessionStorage.setItem('selectedJob', JSON.stringify(job));
    onNavigate('job-application');
  };

  const jobOpenings = [
    {
      id: 1,
      title: "Electrical Systems Engineer",
      department: "Engineering",
      type: "Full-time",
      location: "Hyderabad",
      experience: "2-5 years",
      posted: "2 days ago",
      description: "Oversee simulation and virtual validation of electrical architectures including DCDC converters, onboard charging, and power distribution in EV powertrains. Ensure system-level integration and compliance with safety standards.",
      responsibilities: [
        "Model DCDC converters, charger controls, and power distribution including connectors and contactors",
        "Lead system integration and virtual validation activities ensuring electrical subsystem synergy",
        "Develop and execute system-level virtual test scenarios, including HIL simulations",
        "Ensure compliance with ISO 26262, AUTOSAR standards, UN ECE R100",
        "Coordinate global supplier and engineering teams on virtual validation deliverables"
      ],
      requirements: [
        "Bachelor's or Master's in Electrical Engineering or related field",
        "2–5 years of experience in EV electrical system simulation, integration, and virtual testing",
        "Expertise in power electronics and electrical architecture modeling (Intermediate–Advanced)",
        "Familiar with system-level virtual validation and HIL test platforms",
        "Knowledge of automotive industry standards such as ISO 26262 and AUTOSAR (Intermediate), including safety standards for environmental, functional and crash safety",
        "Proficient in MATLAB, Simulink, Python scripting (Intermediate)",
        "Technical Understanding to drill down hardware specifications from validated designs"
      ],
      kra: [
        "Timely delivery of validated electrical architecture models and system integration results",
        "Effective risk mitigation via virtual validation",
        "High-quality documentation and team coordination"
      ],
      kpi: [
        "Accuracy of electrical models and system integration tests",
        "Adherence to project schedules and quality standards",
        "Cross-team collaboration effectiveness"
      ],
      behavioralCompetencies: [
        "Effective communicator, both verbal and written",
        "High organizational aptitude for managing complex technical tasks and cross-team coordination",
        "Proactive problem-solving and continuous learning mindset"
      ],
      softSkills: [
        "Clear technical documentation and report writing skills",
        "Strong collaboration orientation and stakeholder engagement"
      ],
      remoteWorkReadiness: [
        "Competency in virtual teamwork and digital engineering tools",
        "Self-directed task management in remote contexts"
      ],
      startupCultureFit: [
        "Initiative-taking, adaptability to ambiguity, and eagerness for rapid iteration",
        "Cross-functional collaboration and resilience under evolving priorities"
      ]
    },
    {
      id: 2,
      title: "Electrical Systems Engineer Intern / Fresher",
      department: "Engineering",
      type: "Internship",
      location: "Hyderabad",
      experience: "0-1 years",
      posted: "2 days ago",
      description: "Support the electrical systems engineering team in simulating and validating electrical architectures such as DCDC converters, charging systems, and power distribution elements.",
      responsibilities: [
        "Assist in modeling simple electrical architecture components in Simulink",
        "Support virtual testing and data collection activities",
        "Help prepare system integration documentation and testing procedures",
        "Understand and apply basic safety standards and protocols",
        "Collaborate closely with simulation and integration engineers to learn system-level workflows"
      ],
      requirements: [
        "Pursuing or completed Bachelor's degree in Electrical Engineering or related field",
        "Basic MATLAB/Simulink skills (Beginner)",
        "Awareness of power electronics, charging systems, and electrical distribution fundamentals",
        "Interest in system integration and virtual validation"
      ],
      behavioralAndSoftSkills: [
        "Strong curiosity and eagerness to learn",
        "Good communication and teamwork skills",
        "Ability to follow directions and accept feedback positively",
        "Time management and task organization basics",
        "Willingness to work in a dynamic startup environment"
      ],
      remoteWorkReadiness: [
        "Basic familiarity with digital collaboration tools",
        "Openness to remote learning and communication"
      ],
      startupCultureFit: [
        "Proactive and flexible with a growth mindset",
        "Ability to adapt and collaborate cross-functionally"
      ],
      kra: [
        "Successful completion of assigned modeling and validation support tasks",
        "Effective documentation and communication of learnings",
        "Growth in technical skills related to EV powertrain systems"
      ],
      kpi: [
        "Task completion quality and timeliness",
        "Responsiveness to coaching and feedback",
        "Engagement and learning progression"
      ]
    },
    {
      id: 3,
      title: "Embedded Systems, IoT, and Data Acquisition Engineer – EV Powertrain Startup",
      department: "Engineering",
      type: "Full-time",
      location: "Hyderabad / Remote",
      experience: "2-5 years",
      posted: "1 day ago",
      description: "Design, develop, and validate embedded systems and IoT architectures for EV powertrain applications. Work closely with cloud computing, AI, and software engineering teams to build robust, scalable, and secure connected vehicle ecosystems. Manage supplier engagements for hardware and communication modules, ensuring compliance with in-vehicle connectivity protocols and cybersecurity standards.",
      responsibilities: [
        "Develop firmware and embedded software for powertrain IoT devices and data acquisition systems",
        "Interface sensors, gateways, and controllers with vehicle and cloud platforms using Open In-vehicle API-based protocols and other communication standards (CAN, Ethernet, MQTT, etc.)",
        "Collaborate closely with cloud and AI teams to ensure seamless data flow, real-time analytics, and fleet optimization applications",
        "Engage hardware and communication suppliers for technical alignment, integration, and issue resolution",
        "Implement and enforce cybersecurity best practices across embedded and communication stacks",
        "Design and execute data acquisition pipelines, ensuring data integrity and latency compliance",
        "Support system validation including virtual test setups and hardware-in-the-loop (HIL) testing",
        "Document firmware designs, connectivity protocols, and cybersecurity controls"
      ],
      requirements: [
        "Bachelor's or Master's in Electrical Engineering, Computer Engineering, Embedded Systems, or related field",
        "2–5 years' experience in embedded systems development for automotive or EV applications",
        "Strong C/C++ programming, RTOS, and firmware architecture skills",
        "Experience with communication protocols: CAN, Ethernet, MQTT, Open In-Vehicle APIs, TCP/IP, etc.",
        "Familiarity with IoT edge devices, sensor interfacing, and data acquisition hardware/software",
        "Understanding of cloud platforms (AWS, Azure, Google Cloud) and IoT frameworks",
        "Knowledge of cybersecurity principles and automotive cybersecurity standards (e.g., SAE J3061)",
        "Exposure to version control, CI/CD pipelines, and collaboration with software engineering teams"
      ],
      behavioralCompetencies: [
        "Proactive communication and supplier engagement skills",
        "Strong problem-solving and cross-functional collaboration",
        "Ethical mindset around cybersecurity and data privacy"
      ],
      softSkills: [
        "Clear technical documentation and reporting",
        "Team collaboration across hardware, software, and cloud domains"
      ],
      remoteWorkReadiness: [
        "Comfortable with remote collaboration across diverse teams",
        "Self-driven and accountable for deliverables"
      ],
      startupCultureFit: [
        "Initiative-taking and adaptability to fast-evolving tech landscape",
        "Resilience and bias for action in a dynamic startup environment"
      ],
      kra: [
        "Delivery of secure and robust embedded firmware and IoT data acquisition systems",
        "Effective integration and collaboration with cloud and AI teams",
        "Timely engagement and coordination with suppliers for hardware and communication modules"
      ],
      kpi: [
        "Latency and reliability metrics of data acquisition and communication systems",
        "Compliance with cybersecurity and connectivity protocols",
        "Quality and timeliness of documentation and integration milestones"
      ]
    },
    {
      id: 4,
      title: "Intern / Fresher Embedded Systems, IoT & Data Acquisition Engineer",
      department: "Engineering",
      type: "Internship",
      location: "Hyderabad / Remote",
      experience: "0-1 years",
      posted: "1 day ago",
      description: "Support development and testing of embedded systems and IoT architectures within EV powertrains. Learn to engage with cloud, AI, and software teams while gaining foundational skills in connectivity, data acquisition, and cybersecurity aspects.",
      responsibilities: [
        "Assist in firmware development and testing for embedded IoT devices and data acquisition",
        "Support implementation and validation of communication protocols (CAN, Ethernet, MQTT, etc.)",
        "Help integrate sensor data with virtual and cloud-based platforms under supervision",
        "Collaborate with software and AI teams to understand data workflows and analytics",
        "Participate in hardware and communication module testing alongside supplier coordination",
        "Learn cybersecurity best practices and help with basic risk mitigation tasks",
        "Document development and testing procedures clearly"
      ],
      requirements: [
        "Pursuing or completed Bachelor's degree in Electrical, Computer, or related engineering fields",
        "Basic programming skills in C/C++ and familiarity with microcontroller concepts (Beginner)",
        "Introductory knowledge of communication protocols (CAN, Ethernet, MQTT) and IoT principles",
        "Curiosity to learn cloud platforms and embedded IoT systems",
        "Awareness of cybersecurity basics (Beginner)"
      ],
      behavioralCompetencies: [
        "Eagerness to learn and adapt quickly",
        "Good communication and teamwork spirit",
        "Positive attitude toward feedback and continuous improvement"
      ],
      softSkills: [
        "Clear, concise documentation skills",
        "Effective collaboration and openness to cross-domain learning"
      ],
      remoteWorkReadiness: [
        "Basic competency with digital collaboration tools",
        "Willingness to self-manage remote tasks under guidance"
      ],
      startupCultureFit: [
        "Highly motivated with initiative",
        "Adaptable and resilient in a fast-changing environment"
      ],
      kra: [
        "Support milestones for embedded and IoT system development",
        "Assist in testing and protocol validation activities",
        "Document learning progress, contributing to team knowledge"
      ],
      kpi: [
        "Quality of assigned firmware and test activities",
        "Responsiveness to coaching and learning speed",
        "Participation in cross-team and supplier interactions effectively"
      ]
    },
    {
      id: 5,
      title: "Motor and Control Systems Simulation Engineer",
      department: "Engineering",
      type: "Full-time",
      location: "Hyderabad / Remote",
      experience: "2-5 years",
      posted: "1 day ago",
      description: "Design and validate electric motor and control system models that enhance performance, efficiency, and integration within EV powertrain systems. Work collaboratively on system-level simulations and testing.",
      responsibilities: [
        "Develop motor performance and thermal models (PMSM, BLDC) using Simulink/Simscape.",
        "Implement and optimize motor control algorithms including FOC and vector control.",
        "Simulate motor behavior across duty cycles and transient loads for efficiency and reliability analysis.",
        "Integrate motor and power electronics models for system-level co-simulations.",
        "Support motor test data correlation and contribute to digital twin solutions."
      ],
      requirements: [
        "Bachelor's or master's degree in electrical engineering, Control Systems, Mechatronics, or related field.",
        "2–5 years' experience in electric motor and control system simulation for automotive or EV applications.",
        "Proficiency in MATLAB/Simulink/Simscape (Advanced).",
        "Motor control algorithms and drive strategies expertise (Intermediate–Advanced).",
        "Thermal modelling and testing knowledge (Intermediate).",
        "Familiarity with industry standards including ISO 26262 (Intermediate).",
        "Ability to translate simulation and performance outcomes to engineering specifications eg. material selection for magnets, winding and insulation Class"
      ],
      kra: [
        "Delivery of accurate motor and control simulation models.",
        "Successful system-level validations.",
        "Contribution to predictive maintenance digital twins."
      ],
      kpi: [
        "Correlation accuracy with test data.",
        "Quality and completeness of validation reports.",
        "Timeliness of deliverables supporting project timelines."
      ],
      behavioralCompetencies: [
        "Effective communicator, both verbal and written.",
        "High organizational aptitude for managing complex technical tasks and cross-team coordination.",
        "Proactive problem-solving and continuous learning mindset."
      ],
      softSkills: [
        "Clear technical documentation and report writing skills.",
        "Strong collaboration orientation and stakeholder engagement."
      ],
      remoteWorkReadiness: [
        "Competency in virtual teamwork and digital engineering tools.",
        "Self-directed task management in remote contexts."
      ],
      startupCultureFit: [
        "Initiative-taking, adaptability to ambiguity, and eagerness for rapid iteration.",
        "Cross-functional collaboration and resilience under evolving priorities."
      ]
    },
    {
      id: 6,
      title: "Motor and Control Systems Intern / Fresher",
      department: "Engineering",
      type: "Internship",
      location: "Hyderabad / Remote",
      experience: "0-1 years",
      posted: "1 day ago",
      description: "Support motor and control systems engineering teams by assisting in the development of motor models and control algorithms, focusing on learning simulation tools and testing methods.",
      responsibilities: [
        "Assist in building simple electric motor simulation models using Simulink/Simscape.",
        "Support implementation and testing of basic motor control strategies.",
        "Help collect test data and collaborate on motor simulation validation.",
        "Maintain documentation and assist in generating reports.",
        "Learn integration of motor models with power electronics and overall vehicle systems."
      ],
      requirements: [
        "Pursuing or completed Bachelor’s degree in Electrical Engineering or related discipline.",
        "Basic MATLAB/Simulink skills (Beginner).",
        "Preliminary understanding of electric motor types and working principles.",
        "Enthusiasm for controls and drive systems simulation."
      ],
      behavioralAndSoftSkills: [
        "Strong curiosity and eagerness to learn.",
        "Good communication and teamwork skills.",
        "Ability to follow directions and accept feedback positively.",
        "Time management and task organization basics.",
        "Willingness to work in a dynamic startup environment."
      ],
      remoteWorkReadiness: [
        "Basic familiarity with digital collaboration tools.",
        "Openness to remote learning and communication."
      ],
      startupCultureFit: [
        "Proactive and flexible with a growth mindset.",
        "Ability to adapt and collaborate cross-functionally."
      ],
      kra: [
        "Successful completion of assigned modelling and validation support tasks.",
        "Effective documentation and communication of learnings.",
        "Growth in technical skills related to EV powertrain systems."
      ],
      kpi: [
        "Task completion quality and timeliness.",
        "Responsiveness to coaching and feedback.",
        "Engagement and learning progression."
      ]
    },
    {
      id: 7,
      title: "Powertrain Controls Simulation Engineer (Electrical & Hydraulic for OHEV)",
      department: "Engineering",
      type: "Full-time",
      location: "Hyderabad / Remote",
      experience: "2-5 years",
      posted: "1 day ago",
      description: "Lead development and validation of electrical and hydraulic powertrain control models for Off-Highway Vehicle (OHEV) applications, supporting reliable and efficient system behaviour through virtual testing.",
      responsibilities: [
        "Develop models for electrical controls including drives and actuators.",
        "Create hydraulic subsystem simulation models for OHEV powertrain controls.",
        "Develop and execute virtual test cases automating system-level validations.",
        "Perform co-simulations incorporating vehicle and environment models (e.g., SUMO).",
        "Support integration with digital twins and AI-based system optimization."
      ],
      requirements: [
        "Bachelor’s or Master’s degree in Electrical, Mechanical, or Hydraulic Engineering.",
        "2–5 years' experience in electrical and hydraulic controls modelling in EV or off-highway sectors.",
        "Proficient with Simulink and co-simulation tools (Intermediate–Advanced).",
        "Experience with Python/MATLAB automation (Intermediate).",
        "Knowledge of DFMEA, DVP, and systems engineering processes (Intermediate)."
      ],
      kra: [
        "Delivery of validated electrical and hydraulic control models.",
        "Comprehensive virtual test scenario coverage.",
        "Contribution to connected powertrain digital twin readiness."
      ],
      kpi: [
        "Test scenario coverage metrics and defect rates.",
        "Timely delivery and reporting.",
        "Model robustness and reusability."
      ],
      behavioralCompetencies: [
        "Effective communicator, both verbal and written.",
        "High organizational aptitude for managing complex technical tasks and cross-team coordination.",
        "Proactive problem-solving and continuous learning mindset."
      ],
      softSkills: [
        "Clear technical documentation and report writing skills.",
        "Strong collaboration orientation and stakeholder engagement."
      ],
      remoteWorkReadiness: [
        "Competency in virtual teamwork and digital engineering tools.",
        "Self-directed task management in remote contexts."
      ],
      startupCultureFit: [
        "Initiative-taking, adaptability to ambiguity, and eagerness for rapid iteration.",
        "Cross-functional collaboration and resilience under evolving priorities."
      ]
    },
    {
      id: 8,
      title: "Powertrain Controls Intern / Fresher (Electrical & Hydraulic for OHEV)",
      department: "Engineering",
      type: "Internship",
      location: "Hyderabad / Remote",
      experience: "0-1 years",
      posted: "1 day ago",
      description: "Assist in the development and testing of powertrain control models for electrical and hydraulic systems under guidance. Gain experience in simulation automation and virtual validation environments.",
      responsibilities: [
        "Support development of basic electrical and hydraulic control models using Simulink.",
        "Assist in creation and running of test cases and virtual validation scenarios.",
        "Help with co-simulation setup and environmental model integration.",
        "Document test results and modelling progress.",
        "Collaborate with multiple teams for learning systems integration basics."
      ],
      requirements: [
        "Pursuing or completed Bachelor’s degree in Mechanical, Electrical or related field.",
        "Basic knowledge of Simulink and control systems (Beginner).",
        "Interest in hydraulic and electrical systems modelling.",
        "Willingness to learn DFMEA, DVP, and validation concepts."
      ],
      behavioralAndSoftSkills: [
        "Strong curiosity and eagerness to learn.",
        "Good communication and teamwork skills.",
        "Ability to follow directions and accept feedback positively.",
        "Time management and task organization basics.",
        "Willingness to work in a dynamic startup environment."
      ],
      remoteWorkReadiness: [
        "Basic familiarity with digital collaboration tools.",
        "Openness to remote learning and communication."
      ],
      startupCultureFit: [
        "Proactive and flexible with a growth mindset.",
        "Ability to adapt and collaborate cross-functionally."
      ],
      kra: [
        "Successful completion of assigned modelling and validation support tasks.",
        "Effective documentation and communication of learnings.",
        "Growth in technical skills related to EV powertrain systems."
      ],
      kpi: [
        "Task completion quality and timeliness.",
        "Responsiveness to coaching and feedback.",
        "Engagement and learning progression."
      ]
    },
    {
      id: 9,
      title: "Simulation Engineer – Battery System & BMS",
      department: "Engineering",
      type: "Full-time",
      location: "Hyderabad / Remote",
      experience: "2-5 years",
      posted: "1 day ago",
      description: "Drive ePT system-level design and optimization by collaborating with electrified powertrain teams. Develop and validate high-fidelity 1D/3D physics-based and electrochemical battery models for high-voltage and low-voltage Lithium-ion batteries, supporting virtual testing and system integration.",
      responsibilities: [
        "Develop and correlate 1D/3D physics-based battery models including equivalent circuit, electrochemical, and thermal dynamics.",
        "Create and validate aging and degradation models to forecast battery life across various operating conditions.",
        "Simulate drive cycles, charging, and resting profiles under diverse environmental factors.",
        "Conduct component and system performance optimization using MATLAB/Simulink and related CAE tools.",
        "Support control strategy development and system integration efforts for BMS.",
        "Document technical procedures and coordinate across global teams and suppliers.",
        "Contribute to digital twin development for connected fleet optimization and AI-based analytics."
      ],
      requirements: [
        "Bachelor’s or Master’s degree in Electrical/Electronics, Mechanical, Aerospace, or related discipline.",
        "2–5 years of experience in battery system modelling and simulation in EV or automotive powertrain fields.",
        "Expertise in MATLAB/Simulink, Modelica (Intermediate–Advanced).",
        "Strong knowledge of electrochemical battery modelling, aging, thermal management (Intermediate–Advanced).",
        "Python scripting for test automation and data analysis (Intermediate).",
        "Familiarity with safety standards such as ISO 26262 (Intermediate) and ISO16750-3 (Mechanical shock and vibration)",
        "Experience with system integration and virtual validation environments."
      ],
      kra: [
        "Delivery of validated battery and BMS models on schedule.",
        "Contribution to battery system control strategy optimization.",
        "Clear communication of simulation outcomes and risks."
      ],
      kpi: [
        "Accuracy and correlation of battery models vs. experimental/field data.",
        "Timely delivery of prototypes and simulation outputs aligned with project timelines.",
        "Quality and impact of documented reports and analysis.",
        "Smooth coordination with global teams and suppliers."
      ],
      behavioralCompetencies: [
        "Effective communicator, both verbal and written.",
        "High organizational aptitude for managing complex technical tasks and cross-team coordination.",
        "Proactive problem-solving and continuous learning mindset."
      ],
      softSkills: [
        "Clear technical documentation and report writing skills.",
        "Strong collaboration orientation and stakeholder engagement."
      ],
      remoteWorkReadiness: [
        "Competency in virtual teamwork and digital engineering tools.",
        "Self-directed task management in remote contexts."
      ],
      startupCultureFit: [
        "Initiative-taking, adaptability to ambiguity, and eagerness for rapid iteration.",
        "Cross-functional collaboration and resilience under evolving priorities."
      ]
    },
    {
      id: 10,
      title: "Battery System and BMS Intern / Fresher",
      department: "Engineering",
      type: "Internship",
      location: "Hyderabad / Remote",
      experience: "0-1 years",
      posted: "1 day ago",
      description: "Assist in developing and validating basic battery and BMS simulation models under supervision. Support data collection, model development, and testing activities aimed at battery performance and safety.",
      responsibilities: [
        "Support creation of simple battery and BMS simulation models using MATLAB/Simulink.",
        "Assist in data collection and analysis for battery performance and degradation studies.",
        "Help prepare test cases and basic virtual validations of battery models.",
        "Document findings and support project documentation.",
        "Collaborate with senior engineers to understand battery system requirements and standards."
      ],
      requirements: [
        "Pursuing or completed Bachelor’s degree in Electrical, Mechanical, or related engineering fields.",
        "Basic knowledge of MATLAB/Simulink (Beginner).",
        "Familiarity with battery fundamentals and BMS concepts (Beginner).",
        "Interest in electrochemistry and thermal management principles.",
        "Eagerness to learn simulation, modeling, and systems engineering basics."
      ],
      behavioralAndSoftSkills: [
        "Strong curiosity and eagerness to learn.",
        "Good communication and teamwork skills.",
        "Ability to follow directions and accept feedback positively.",
        "Time management and task organization basics.",
        "Willingness to work in a dynamic startup environment."
      ],
      remoteWorkReadiness: [
        "Basic familiarity with digital collaboration tools.",
        "Openness to remote learning and communication."
      ],
      startupCultureFit: [
        "Proactive and flexible with a growth mindset.",
        "Ability to adapt and collaborate cross-functionally."
      ],
      kra: [
        "Successful completion of assigned modeling and validation support tasks.",
        "Effective documentation and communication of learnings.",
        "Growth in technical skills related to EV powertrain systems."
      ],
      kpi: [
        "Task completion quality and timeliness.",
        "Responsiveness to coaching and feedback.",
        "Engagement and learning progression."
      ]
    }
  ];

  // Filter jobs based on search query
  const filteredJobs = jobOpenings.filter(job =>
    searchQuery === '' ||
    job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <section className="min-h-screen bg-gray-900 pt-24 pb-16 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <Button
          onClick={() => onNavigate('home')}
          variant="outline"
          className="mb-12 bg-[#F0F8FE]/20 border-[#F0F8FE]/30 text-[#F0F8FE] hover:bg-[#F0F8FE]/30"
        >
          <ArrowLeft size={16} className="mr-2" />
          Back to Home
        </Button>

        {/* Page Title */}
        <div className="text-center mb-16">
          <h1 className="text-4xl text-[#F0F8FE] mb-4">Career Opportunities</h1>
          <p className="text-[#F0F8FE]/80 text-lg max-w-2xl mx-auto">
            Join our innovative team and help shape the future of sustainable mobility.
            We're looking for passionate professionals who want to make a real impact.
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-12">
          <div className="max-w-2xl mx-auto relative">
            <Search size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#F0F8FE]/60" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for job openings..."
              className="pl-12 pr-4 py-4 bg-[#F0F8FE]/20 border-[#F0F8FE]/30 text-[#F0F8FE] placeholder:text-[#F0F8FE]/60 text-lg rounded-lg shadow-sm"
            />
          </div>
        </div>

        {/* Job Cards Grid */}
        {filteredJobs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredJobs.map((job) => (
              <div
                key={job.id}
                className="rounded-lg p-6 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] cursor-pointer border border-[#F0F8FE]/10 hover:border-[#247FFF]/30 flex flex-col"
                style={{ backgroundColor: '#304461' }}
                onClick={() => handleJobClick(job)}
              >
                <div className="flex-grow">
                  {/* Job Header */}
                  <div className="mb-4">
                    <h3 className="text-xl text-[#F0F8FE] mb-2 font-semibold h-14 line-clamp-2">{job.title}</h3>
                    <p className="text-[#247FFF] text-sm font-medium">{job.department}</p>
                  </div>

                  {/* Job Meta Info */}
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center text-[#F0F8FE]/70 text-sm">
                      <MapPin size={16} className="mr-2 flex-shrink-0" />
                      <span>{job.location}</span>
                    </div>
                    <div className="flex items-center text-[#F0F8FE]/70 text-sm">
                      <Clock size={16} className="mr-2 flex-shrink-0" />
                      <span>{job.type} • {job.experience}</span>
                    </div>
                    <div className="flex items-center text-[#F0F8FE]/70 text-sm">
                      <Users size={16} className="mr-2 flex-shrink-0" />
                      <span>Posted {job.posted}</span>
                    </div>
                  </div>

                  {/* Job Description Preview */}
                  <p className="text-[#F0F8FE]/80 text-sm leading-relaxed mb-4 line-clamp-3">
                    {job.description}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 mt-auto pt-4">
                  <Button
                    className="flex-1 bg-[#1a2332] text-[#F0F8FE] hover:bg-[#1a2332]/80 transition-colors py-2 px-4 text-sm font-medium border border-[#F0F8FE]/10"
                    onClick={(e: React.MouseEvent) => {
                      e.stopPropagation();
                      handleJobClick(job);
                    }}
                  >
                    View Description
                  </Button>
                  <Button
                    className="flex-1 bg-[#247FFF] text-[#F0F8FE] hover:bg-[#247FFF]/80 transition-colors py-2 px-4 text-sm font-medium"
                    onClick={(e: React.MouseEvent) => {
                      e.stopPropagation();
                      window.open('https://forms.office.com/Pages/ResponsePage.aspx?id=n50Y_y38lkesYw0081oC0YLuEpgeXVFPtnKTluv1gnhUOFdXSFQzMEk5R0I0UzZVNExQSURIT0dITi4u', '_blank', 'noopener,noreferrer');
                    }}
                  >
                    Apply Now
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          // No Results Message
          <div className="text-center">
            <div className="rounded-lg p-8 backdrop-blur-sm border border-[#F0F8FE]/20 shadow-lg max-w-4xl mx-auto" style={{ backgroundColor: '#304461' }}>
              <h2 className="text-2xl text-[#F0F8FE] mb-4">No Openings Found</h2>
              <p className="text-[#F0F8FE]/80 text-lg leading-relaxed mb-8">
                We currently do not have an opening for your search, but share your details with us and we will reach out once a suitable role is available.
              </p>
              
              {/* Share Your Details Section */}
              <div className="rounded-lg p-6 backdrop-blur-sm border border-[#F0F8FE]/10 shadow-lg" style={{ backgroundColor: '#1a2332' }}>
                <h3 className="text-xl text-[#F0F8FE] mb-6">Share Your Details</h3>
                <Button
                  onClick={() => window.open('https://forms.office.com/Pages/ResponsePage.aspx?id=n50Y_y38lkesYw0081oC0YLuEpgeXVFPtnKTluv1gnhUM0ExM0IxNDgyMDhWNTFIMVhORVFES1cyOS4u', '_blank', 'noopener,noreferrer')}
                  className="bg-[#247FFF] text-[#F0F8FE] hover:bg-[#247FFF]/80 px-8 py-3 text-lg font-medium"
                >
                  Submit Your Details
                </Button>
              </div>
            </div>
          </div>
        )}


      </div>
    </section>
  );
}