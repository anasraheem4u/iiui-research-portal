import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight, CloudUpload, BarChart3, ShieldCheck,
  Database, Eye, FileText, MapPin, Phone, Mail, ChevronRight, BookOpen, Users, Award, GraduationCap
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50">

      {/* ===== NAVIGATION ===== */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-emerald-900/10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-3">
              <Image src="/images/IIUI_Logo.png" alt="IIUI Logo" width={40} height={40} className="w-10 h-10 object-contain" />
              <div>
                <span className="text-xl font-bold tracking-tight text-emerald-800">RDMS</span>
                <p className="text-[10px] uppercase tracking-widest font-semibold text-slate-500">IIUI</p>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a className="text-sm font-medium hover:text-emerald-700 transition-colors" href="#">Home</a>
              <a className="text-sm font-medium hover:text-emerald-700 transition-colors" href="#how-it-works">How It Works</a>
              <a className="text-sm font-medium hover:text-emerald-700 transition-colors" href="#features">Features</a>
              <a className="text-sm font-medium hover:text-emerald-700 transition-colors" href="#about">About</a>
              <Link href="/login">
                <Button className="bg-emerald-700 hover:bg-emerald-800 text-white px-6 py-2.5 rounded-lg text-sm font-semibold shadow-md shadow-emerald-700/20">
                  Login
                </Button>
              </Link>
            </div>
            <div className="md:hidden">
              <button className="p-2 text-emerald-700">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* ===== HERO SECTION ===== */}
      <header className="relative min-h-[85vh] flex items-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src="/images/IIUI.jpeg"
            alt="IIUI Campus"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/90 via-emerald-800/80 to-slate-900/85" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center lg:text-left">
          <div className="lg:max-w-3xl">
            {/* Badge */}
            <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-white text-sm font-medium mb-6 animate-fade-in-up">
              <span className="relative flex h-2 w-2 mr-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              Official Research Management Portal
            </div>

            <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight mb-6 animate-fade-in-up stagger-1" style={{ opacity: 0 }}>
              Streamlining Research Excellence at{" "}
              <span className="text-emerald-400">
                International Islamic University
              </span>
            </h1>

            <p className="text-xl text-white/80 mb-10 leading-relaxed max-w-2xl animate-fade-in-up stagger-2" style={{ opacity: 0 }}>
              A centralized platform designed specifically for MS and PhD students at IIUI to manage, track, and submit research documentation with seamless coordination and oversight.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-fade-in-up stagger-3" style={{ opacity: 0 }}>
              <Link href="/login">
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 h-auto rounded-xl font-bold text-lg transition-all transform hover:-translate-y-1 shadow-xl shadow-emerald-600/30 flex items-center gap-2">
                  <GraduationCap className="w-5 h-5" />
                  Student Portal
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" className="bg-white/10 backdrop-blur-md border-2 border-white/30 text-white px-8 py-4 h-auto rounded-xl font-bold text-lg hover:bg-white/20 transition-all flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5" />
                  Coordinator Access
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Gradient Fade */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-slate-50 to-transparent z-10" />
      </header>

      {/* ===== HOW IT WORKS ===== */}
      <section className="py-24 bg-slate-50" id="how-it-works">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-emerald-800 mb-4">How It Works</h2>
            <div className="w-20 h-1.5 bg-emerald-600 mx-auto rounded-full mb-6" />
            <p className="text-slate-600 max-w-2xl mx-auto">
              A simple three-step process to navigate your research journey from initial submission to final degree approval.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            {/* Connecting Line */}
            <div className="hidden md:block absolute top-1/2 left-1/4 right-1/4 h-0.5 bg-emerald-200 -translate-y-12" />

            <StepCard
              icon={<CloudUpload className="w-7 h-7" />}
              title="Submit Documents"
              description="Upload your research proposals, thesis drafts, and supporting documents directly to your secure student dashboard."
            />
            <StepCard
              icon={<BarChart3 className="w-7 h-7" />}
              title="Track Progress"
              description="Monitor your submission status in real-time. Receive feedback from supervisors and track every milestone."
            />
            <StepCard
              icon={<ShieldCheck className="w-7 h-7" />}
              title="Get Approval"
              description="Receive formal digital approvals and generate completion reports once your work meets university standards."
            />
          </div>
        </div>
      </section>

      {/* ===== KEY FEATURES ===== */}
      <section className="py-24 bg-white" id="features">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="text-emerald-700 font-bold uppercase tracking-wider text-sm mb-4 block">Platform Highlights</span>
              <h2 className="text-4xl font-bold mb-8 leading-tight text-slate-900">Advanced Tools for the Modern Researcher</h2>

              <div className="space-y-8">
                <FeatureItem
                  icon={<Database className="w-5 h-5 text-emerald-700" />}
                  title="Centralized Storage"
                  description="Securely store all your research versions, literature reviews, and datasets in one organized, cloud-accessible environment."
                />
                <FeatureItem
                  icon={<Eye className="w-5 h-5 text-emerald-700" />}
                  title="Real-time Monitoring"
                  description="Faculty and students share a transparent view of progress, reducing administrative delays and communication gaps."
                />
                <FeatureItem
                  icon={<FileText className="w-5 h-5 text-emerald-700" />}
                  title="Structured Reporting"
                  description="Generate formal semester progress reports and university-standard thesis forms with automated data population."
                />
              </div>
            </div>

            <div className="relative">
              <div className="aspect-square bg-emerald-50 rounded-[2rem] absolute -rotate-6 inset-0 transform scale-105" />
              <div className="relative rounded-[2rem] overflow-hidden shadow-2xl border border-emerald-100">
                <img
                  src="/images/Portal.png"
                  alt="RDMS Dashboard Preview"
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Overlay Card */}
              <div className="absolute -bottom-10 -left-10 bg-white p-6 rounded-2xl shadow-xl border border-emerald-100 hidden md:block max-w-[240px]">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5 text-green-600" />
                  </div>
                  <span className="font-bold text-sm">Proposal Approved</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 w-[85%] rounded-full" />
                </div>
                <div className="mt-2 text-[10px] text-slate-400 font-medium">Research Completion: 85%</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== STATS SECTION ===== */}
      <section className="py-20 bg-emerald-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <StatItem value="1,500+" label="Active Researchers" />
            <StatItem value="450+" label="Approved Theses" />
            <StatItem value="120+" label="Faculty Coordinators" />
            <StatItem value="98%" label="Satisfaction Rate" />
          </div>
        </div>
      </section>

      {/* ===== MID-PAGE CTA ===== */}
      <section className="py-24 relative overflow-hidden bg-slate-50" id="about">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-slate-900">Ready to start your submission?</h2>
          <p className="text-lg text-slate-500 mb-10 leading-relaxed">
            Log in to your respective portal to manage your documentation or oversee student progress. For technical support, please contact the IT department.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/login">
              <Button className="bg-emerald-700 hover:bg-emerald-800 text-white px-8 py-3 h-auto rounded-lg font-bold transition-all flex items-center gap-2">
                Access Portal <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/register">
              <Button variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 px-8 py-3 h-auto rounded-lg font-bold hover:bg-emerald-100 transition-all flex items-center gap-2">
                Register as Student
              </Button>
            </Link>
          </div>
        </div>
        <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-emerald-200 to-transparent" />
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="bg-white border-t border-emerald-100 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            {/* Brand */}
            <div className="col-span-1">
              <div className="flex items-center gap-3 mb-6">
                <Image src="/images/IIUI_Logo.png" alt="IIUI Logo" width={32} height={32} className="w-8 h-8 object-contain" />
                <span className="text-xl font-bold tracking-tight text-emerald-800">RDMS</span>
              </div>
              <p className="text-slate-500 text-sm leading-relaxed">
                Dedicated to enhancing the research ecosystem at International Islamic University Islamabad through digital innovation and efficient management tools.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h5 className="text-sm font-bold uppercase tracking-widest text-slate-900 mb-6">Quick Links</h5>
              <ul className="space-y-4 text-sm text-slate-500">
                <li><a className="hover:text-emerald-700 transition-colors flex items-center gap-1" href="https://www.iiu.edu.pk" target="_blank" rel="noreferrer"><ChevronRight className="w-3 h-3" />University Website</a></li>
                <li><a className="hover:text-emerald-700 transition-colors flex items-center gap-1" href="#"><ChevronRight className="w-3 h-3" />Student Handbook</a></li>
                <li><a className="hover:text-emerald-700 transition-colors flex items-center gap-1" href="#"><ChevronRight className="w-3 h-3" />Research Guidelines</a></li>
                <li><a className="hover:text-emerald-700 transition-colors flex items-center gap-1" href="#"><ChevronRight className="w-3 h-3" />Faculty Portal</a></li>
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h5 className="text-sm font-bold uppercase tracking-widest text-slate-900 mb-6">Contact Info</h5>
              <ul className="space-y-4 text-sm text-slate-500">
                <li className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-emerald-700 mt-0.5 shrink-0" />
                  H-10, Islamabad, 44000, Pakistan
                </li>
                <li className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-emerald-700 shrink-0" />
                  +92-51-9019100
                </li>
                <li className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-emerald-700 shrink-0" />
                  info@iiu.edu.pk
                </li>
              </ul>
            </div>

            {/* Location Map */}
            <div>
              <h5 className="text-sm font-bold uppercase tracking-widest text-slate-900 mb-6">Location</h5>
              <div className="rounded-lg overflow-hidden h-40 w-full border border-emerald-100">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3321.123456789!2d73.0169!3d33.7167!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x38dfbf85b8a5b5a5%3A0x88372be6b4c7af15!2sInternational%20Islamic%20University%2C%20Islamabad!5e0!3m2!1sen!2spk!4v1700000000000!5m2!1sen!2spk"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="IIUI Location"
                />
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-emerald-50 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-slate-400">
              © {new Date().getFullYear()} International Islamic University Islamabad. Research Document Management System. All Rights Reserved.
            </p>
            <div className="flex gap-6 text-xs font-medium text-slate-400">
              <a className="hover:text-emerald-700 transition-colors" href="#">Privacy Policy</a>
              <a className="hover:text-emerald-700 transition-colors" href="#">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ===== SUB-COMPONENTS ===== */

function StepCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="relative flex flex-col items-center text-center p-8 bg-white rounded-2xl border border-emerald-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
      <div className="w-16 h-16 bg-emerald-700 text-white rounded-full flex items-center justify-center mb-6 shadow-lg shadow-emerald-700/30 group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3 text-slate-900">{title}</h3>
      <p className="text-slate-500">{description}</p>
    </div>
  );
}

function FeatureItem({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="flex gap-6 group">
      <div className="flex-shrink-0 w-12 h-12 bg-emerald-50 rounded-lg flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
        {icon}
      </div>
      <div>
        <h4 className="text-lg font-bold mb-1 text-slate-900">{title}</h4>
        <p className="text-slate-500">{description}</p>
      </div>
    </div>
  );
}

function StatItem({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="text-4xl font-bold mb-2">{value}</div>
      <div className="text-emerald-100 text-sm font-medium uppercase tracking-wide">{label}</div>
    </div>
  );
}
