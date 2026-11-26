import React from "react";
import { Award, Briefcase, GraduationCap, Users } from "lucide-react";
import shimpiYadavPhoto from "../../assets/simpiyadav.jpeg";
import raghavKumarJhaPhoto from "../../assets/raghav kumar jha.jpeg";
import khushbooPhoto from "../../assets/khushboo.jpeg";
import ranjeetKumarMahtoPhoto from "../../assets/ranjeet kumar mahto.jpeg";

const teamMembers = [
  {
    name: "Shimpi Yadav",
    designation: "Founder",
    education: "Bachelor of Arts (B.A.)",
    experience: "5 Years",
    image: shimpiYadavPhoto,
    bio: "Shimpi Yadav brings 5 years of experience in the financial services industry, with expertise across Home Loans, Personal Loans, and Business Loans. During her professional journey with ICICI Bank, she gained valuable exposure to banking operations, customer relationship management, and loan products. As the Founder of RealCred, she focuses on building a customer-centric organisation, strengthening business relationships, and creating accessible credit solutions through a professional and transparent approach.",
  },
  {
    name: "Raghav Kumar Jha",
    designation: "Co-founder",
    education: "Master of Business Administration (MBA)",
    experience: "10 Years",
    image: raghavKumarJhaPhoto,
    bio: "Raghav Kumar Jha brings 10 years of professional experience, with a strong background in Risk Management, RCU (Risk Control Unit), and Fraud Control operations. During his professional journey, including his association with Hindustan Times, he has developed valuable experience in verification processes, risk assessment, fraud prevention, and operational controls. At RealCred, he contributes towards strengthening operational processes, maintaining business integrity, and building a reliable and compliant business ecosystem.",
  },
  {
    name: "Khushboo",
    designation: "HR Manager",
    education: "Human Resource Management",
    department: "Human Resources",
    image: khushbooPhoto,
    bio: "Khushboo is responsible for supporting and managing key HR functions at RealCred Technology Private Limited. She plays an important role in talent acquisition, employee engagement, team coordination, and HR operations. She focuses on building a positive workplace culture, streamlining HR processes, and ensuring a smooth employee experience. Her contribution supports RealCred's commitment to building a professional, collaborative, and growth-oriented organisation.",
  },
  {
    name: "Ranjeet Kumar Mahto",
    designation: "Co-Founder",
    education:
      "Post Graduate Diploma in Management Administration (PGDM), Finance and Marketing.",
    experience: "15 Years",
    image: ranjeetKumarMahtoPhoto,
    bio: "Ranjeet Kumar Mahto brings 15 years of extensive experience in the financial services and lending industry. His expertise spans Home Loans, Loan Against Property (LAP), Personal Loans, and Business Loans. Throughout his career, he has been associated with reputed organisations, including PNB Housing Finance, DMI Housing Finance, and UBI Services (100% subsidy company of Union Bank of India). His strong understanding of lending products, financial institutions, business development, and channel partnerships plays a key role in shaping RealCred's business strategy and growth.",
  },
];

export default function OurTeam() {
  return (
    <div className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12 sm:space-y-16 min-w-0 max-w-full">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-brand-border text-xs text-brand-textSecondary mb-6 shadow-sm">
          <Users className="w-4 h-4 text-brand-red" />
          <span>RealCred Leadership</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-brand-textPrimary tracking-tight leading-tight">
          Our Leadership <span className="text-brand-red">Team</span>
        </h1>
        <p className="mt-3 text-sm sm:text-base text-brand-textSecondary max-w-xl mx-auto">
          Combining seasoned banking operations, risk verification, corporate
          finance, and channel management expertise.
        </p>
      </div>

      {/* Team Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {teamMembers.map((member, i) => (
          <div
            key={i}
            className="bg-white p-6 sm:p-7 rounded-3xl border border-brand-border flex flex-col sm:flex-row gap-6 hover:border-brand-red/50 hover:shadow-lg transition-all duration-300 group shadow-sm min-w-0 max-w-full"
          >
            {/* Portrait Frame & Designation Badge */}
            <div className="shrink-0 flex flex-col items-center sm:items-start w-full sm:w-44 md:w-48">
              <div className="relative w-44 sm:w-full aspect-[3/4] rounded-2xl overflow-hidden bg-brand-bg border border-brand-border group-hover:border-brand-red/40 transition-all duration-300 shadow-sm flex items-center justify-center p-1.5">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-full h-full object-contain aspect-[3/4] rounded-xl transition-transform duration-500 group-hover:scale-[1.02]"
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.style.display = "none";
                  }}
                />
              </div>
              <span className="mt-3 w-44 sm:w-full text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full bg-brand-redLight border border-brand-red/25 text-brand-red text-center">
                {member.designation}
              </span>
            </div>

            {/* Profile Content */}
            <div className="space-y-3.5 flex-1 min-w-0">
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-brand-textPrimary group-hover:text-brand-red transition-colors">
                  {member.name}
                </h3>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  {member.education && (
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-brand-bg border border-brand-border text-xs text-brand-textSecondary">
                      <GraduationCap className="w-3.5 h-3.5 text-brand-red shrink-0" />
                      <span>{member.education}</span>
                    </div>
                  )}
                  {member.experience && (
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-brand-bg border border-brand-border text-xs text-brand-textSecondary">
                      <Briefcase className="w-3.5 h-3.5 text-brand-red shrink-0" />
                      <span>{member.experience} Exp.</span>
                    </div>
                  )}
                  {member.department && (
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-brand-bg border border-brand-border text-xs text-brand-textSecondary">
                      <Award className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{member.department}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-brand-border">
                <p className="text-xs sm:text-sm text-brand-textSecondary leading-relaxed break-words [overflow-wrap:anywhere]">
                  {member.bio}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
