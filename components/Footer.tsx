import Link from 'next/link'
import Image from 'next/image'
import OrigamiWave from './OrigamiWave'
import BirdEasterEgg from './BirdEasterEgg'

export default function Footer() {
  return (
    <footer className="border-t border-chilliblue-800 bg-chilliblue-900/80 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-bold text-white mb-2">Chilli Boys Manufacturing</h3>
            <p className="text-chilliblue-200 text-sm">You Dream it! We build it!</p>
            <p className="text-steel-400 text-sm mt-2">KM 65 Highway 1<br/>El Pescadero BCS 23300, Mexico</p>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-2">Contact</h4>
            <p className="text-steel-400 text-sm">+52 624-229-4158</p>
            <p className="text-steel-400 text-sm">WhatsApp: +52 624 105 2006</p>
            <p className="text-steel-400 text-sm mt-1">Mon–Fri 08:00 a.m. – 03:30 p.m.</p>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-2">Services</h4>
            <div className="flex flex-wrap gap-2">
              {['Handrails', 'Gates', 'Pergolas', 'Sconces', 'Signs', 'CNC Woodwork'].map((s) => (
                <span key={s} className="text-xs bg-steel-800 text-steel-300 px-2 py-1 rounded">
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>
        <div className="border-t border-chilliblue-800 mt-6 pt-6 flex flex-col items-center gap-4">
          <div className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="Chilli Boys"
              width={48}
              height={40}
              className="rounded opacity-80 hover:opacity-100 transition-opacity"
              style={{ objectFit: 'contain' }}
            />
            <OrigamiWave className="w-6 h-6 text-chilliblue-300 opacity-80 hover:opacity-100 transition-opacity" />
            <BirdEasterEgg variant="inline" />
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 w-full">
            <p className="text-steel-500 text-xs">
              © 2025 Chilli Boys Manufacturing — All Rights Reserved.
            </p>
            <div className="flex items-center gap-4 text-xs">
              <a href="https://chilliboys.mx" target="_blank" rel="noopener noreferrer" className="text-steel-400 hover:text-chilliblue-300 transition-colors">
                chilliboys.mx
              </a>
              <a href="https://www.facebook.com/GregC19" target="_blank" rel="noopener noreferrer" className="text-steel-400 hover:text-chilliblue-300 transition-colors">
                Facebook
              </a>
              <Link href="/privacy" className="text-steel-400 hover:text-chilliblue-300 transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-steel-400 hover:text-chilliblue-300 transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
