import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2 } from 'lucide-react';

export function BenefitsSection() {
  return (
    <div className="hidden md:block">
      <div className="sticky top-8 space-y-6">
        <Card className="bg-white border-gray-200 backdrop-blur-xl rounded-2xl shadow-2xl shadow-pfw-gold/10">
          <CardContent className="p-6">
            <h3 className="font-semibold text-black mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-pfw-gold" />
              Why join Campus Pulse?
            </h3>
            <ul className="space-y-3 text-sm text-gray-700">
              <li className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 border border-gray-200">
                <div className="w-5 h-5 rounded-full bg-gold-dark/10 border border-pfw-gold/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CheckCircle2 className="w-3 h-3 text-pfw-gold" />
                </div>
                <span>Discover campus events instantly</span>
              </li>
              <li className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 border border-gray-200">
                <div className="w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                </div>
                <span>Easy RSVP and notifications</span>
              </li>
              <li className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 border border-gray-200">
                <div className="w-5 h-5 rounded-full bg-purple-500/10 border border-purple-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CheckCircle2 className="w-3 h-3 text-purple-400" />
                </div>
                <span>Connect with your community</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <div className="p-4 rounded-2xl bg-gold-dark/5 border border-pfw-gold/30 backdrop-blur-sm">
          <p className="text-xs text-center text-gray-600">
            Join 50+ active students already using Campus Pulse
          </p>
        </div>
      </div>
    </div>
  );
}
