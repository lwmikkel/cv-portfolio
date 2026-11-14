import tech from '../../assets/invoices/faktura_001.webp'
import data from '../../assets/invoices/faktura_002.webp'
import nexus from '../../assets/invoices/faktura_005.webp'

export const invoices = [
  {
    id: '001',
    file: 'faktura_001.pdf',
    image: tech,
    text: "Tech Solutions ApS\nCVR: 12345678\nFAKTURA\nFakturanummer: 2026-001\nFakturadato: 01-04-2026\nBetalingsfrist: 30 dage netto\nBeskrivelse Antal Enhedspris Beloeb\nKonsulentydelser - systemintegration 10 1,200.00 DKK 12,000.00 DKK\nProjektledelse 5 950.00 DKK 4,750.00 DKK\nRejseomkostninger 1 450.00 DKK 450.00 DKK\nSubtotal: 17,200.00 DKK\nMoms (25%): 4,300.00 DKK\nTOTAL: 21,500.00 DKK\nBankoplysninger: Reg. 1234 Konto 56789012\nTak for samhandlen!",
    fields: { supplier: 'Tech Solutions ApS', number: '2026-001', date: '01-04-2026', subtotal: '17200', vat: '4300', total: '21500' },
  },
  {
    id: '002',
    file: 'faktura_002.pdf',
    image: data,
    text: "DataBridge Danmark A/S\nCVR: 87654321\nFAKTURA\nFakturanummer: 2026-047\nFakturadato: 05-04-2026\nBetalingsfrist: 30 dage netto\nBeskrivelse Antal Enhedspris Beloeb\nSoftwarelicens - aarlig abonnement 1 8,500.00 DKK 8,500.00 DKK\nSupportaftale Q2 2026 1 2,200.00 DKK 2,200.00 DKK\nOpsaetning og konfiguration 3 800.00 DKK 2,400.00 DKK\nSubtotal: 13,100.00 DKK\nMoms (25%): 3,275.00 DKK\nTOTAL: 16,375.00 DKK\nBankoplysninger: Reg. 1234 Konto 56789012\nTak for samhandlen!",
    fields: { supplier: 'DataBridge Danmark A/S', number: '2026-047', date: '05-04-2026', subtotal: '13100', vat: '3275', total: '16375' },
  },
  {
    id: '005',
    file: 'faktura_005.pdf',
    image: nexus,
    text: "n\nNEXUS DIGITAL BUREAU\nCreative & Technology Solutions | CVR 44556677\nDEBITNOTANUMMER NX-2026-447-B\nUdstedelsesdato 22. april 2026\nForfaldsdato 22. maj 2026\nKunde Apex Ventures Holding ApS\nKunderef. PO-88821 / Sarah Lindqvist\nSPECIFICERING AF YDELSER\nBeskrivelse Enhed Antal Stk.pris Linje total\nUI/UX Design - komplet redesign Projekt 1 DKK 28.500 DKK 28.500\naf mobilapplikation (iOS + Android)\nFrontend udvikling Sprint 3 DKK 14.200 DKK 42.600\n(React Native, 3 sprints)\nQA testing og bugfixing Timer 18 DKK 850 DKK 15.300\nProjektledelse og koordinering Timer 12 DKK 1.100 DKK 13.200\nHosting opsaetning (AWS, 12 mdr) Stk. 1 DKK 4.800 DKK 4.800\nNettobetaling (ekskl. afgift): DKK 104.400,00\nLovpligtig afgift 25 pct.: DKK 22.750,00\nBETALINGSBELOEB: DKK 127.150,00\nBankforbindelse: Danske Bank | Reg.nr: 3333 | Kontonr: 12345678\nIBAN: DK44 3333 0012 3456 78\nSwift/BIC: DABADKKK\nBetalingsreference: NX-2026-447-B / Apex Ventures",
    fields: { supplier: 'NEXUS DIGITAL BUREAU', number: 'NX-2026-447-B', date: '22. april 2026', subtotal: '104400', vat: '22750', total: '127150' },
    note: 'Different labels ("Debitnotanummer", "Lovpligtig afgift"), same fields.',
  },
]
