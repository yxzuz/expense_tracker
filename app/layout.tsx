// import './globals.css'
// import type { Metadata } from 'next'
// import { Inter } from 'next/font/google'
// import ThemeProvider from '../components/ThemeProvider'

// const inter = Inter({ subsets: ['latin'] })

// export const metadata: Metadata = {
//   title: 'Mindful Expense Tracker',
//   description: 'A calm, minimalist expense tracker for mindful spending',
//   keywords: ['expense tracker', 'budgeting', 'mindful spending', 'personal finance'],
//   authors: [{ name: 'Mindful Finance Team' }],
//   creator: 'Mindful Finance Team',
//   publisher: 'Mindful Finance Team',
//   formatDetection: {
//     email: false,
//     address: false,
//     telephone: false,
//   },
//   manifest: '/manifest.webmanifest',
//   themeColor: [
//     { media: '(prefers-color-scheme: light)', color: '#0ea5e9' },
//     { media: '(prefers-color-scheme: dark)', color: '#38bdf8' }
//   ],
//   viewport: {
//     width: 'device-width',
//     initialScale: 1,
//     maximumScale: 5,
//   },
//   robots: {
//     index: false,
//     follow: false,
//   },
// }

// export default function RootLayout({
//   children,
// }: {
//   children: React.ReactNode
// }) {
//   return (
//     <html lang="en" className="light">
//       <head>
//         <link rel="icon" href="/favicon.ico" />
//       </head>
//       <body className={inter.className}>
//         <ThemeProvider>
//           <div className="min-h-screen bg-background text-foreground">
//             <nav className="border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
//               <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
//                 <div className="flex justify-between h-16">
//                   <div className="flex items-center space-x-8">
//                     <h1 className="text-xl font-semibold text-foreground">
//                       💰 Expense Tracker
//                     </h1>
//                     <nav className="hidden md:flex space-x-6">
//                       <a href="/" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
//                         Dashboard
//                       </a>
//                       <a href="/add-expense/" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
//                         Add Expense
//                       </a>
//                       <a href="/history/" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
//                         History
//                       </a>
//                       <a href="/reports/" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
//                         Reports
//                       </a>
//                       <a href="/settings/" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
//                         Settings
//                       </a>
//                     </nav>
//                   </div>
//                 </div>
//               </div>
//             </nav>
            
//             <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//               {children}
//             </main>
//           </div>
//         </ThemeProvider>
//       </body>
//     </html>
//   )
// }
import './globals.css'
import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import ThemeProvider from '../components/ThemeProvider'

const inter = Inter({ subsets: ['latin'] })

// ✅ Moved `themeColor` and `viewport` into their own exports
export const metadata: Metadata = {
  title: 'Mindful Expense Tracker',
  description: 'A calm, minimalist expense tracker for mindful spending',
  keywords: ['expense tracker', 'budgeting', 'mindful spending', 'personal finance'],
  authors: [{ name: 'Mindful Finance Team' }],
  creator: 'Mindful Finance Team',
  publisher: 'Mindful Finance Team',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  manifest: '/manifest.webmanifest',
  robots: {
    index: false,
    follow: false,
  },
}

// ✅ New: separate viewport export
export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#0ea5e9' },
    { media: '(prefers-color-scheme: dark)', color: '#38bdf8' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="light">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={inter.className}>
        <ThemeProvider>
          <div className="min-h-screen bg-background text-foreground">
            <nav className="border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
              <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                  <div className="flex items-center space-x-8">
                    <h1 className="text-xl font-semibold text-foreground">
                      💰 Expense Tracker
                    </h1>
                    <nav className="hidden md:flex space-x-6">
                      <a href="/" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                        Dashboard
                      </a>
                      <a href="/add/" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                        Add Expense
                      </a>
                      <a href="/history/" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                        History
                      </a>
                      <a href="/reports/" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                        Reports
                      </a>
                      <a href="/settings/" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                        Settings
                      </a>
                    </nav>
                  </div>
                </div>
              </div>
            </nav>
            
            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {children}
            </main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
