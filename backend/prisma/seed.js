// ==========================================================================
// MedLink — prisma/seed.js
// One-time (safe to re-run) script that loads a realistic starter medicine
// catalog into the database, so search isn't empty before any real
// distributor has listed anything. Run with: npx prisma db seed
// ==========================================================================

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

// A few realistic wholesaler-style accounts to own the seeded catalog,
// so it isn't all piled under one distributor.
const DISTRIBUTORS = [
  { name: 'Rohan Mehta', email: 'seed.wellcare@medlink.com', businessName: 'WellCare Distributors', licenseNumber: 'SEEDDIST001' },
  { name: 'Anita Sharma', email: 'seed.medisource@medlink.com', businessName: 'MediSource Wholesale', licenseNumber: 'SEEDDIST002' },
  { name: 'Vikram Rao', email: 'seed.pharmalink@medlink.com', businessName: 'PharmaLink Supplies', licenseNumber: 'SEEDDIST003' },
];

// [name, manufacturer, price in rupees, stock]
const MEDICINES = [
  // Pain relief / fever
  ['Paracetamol 500mg', 'Cipla', 22, 800],
  ['Paracetamol 650mg', 'Sun Pharma', 28, 650],
  ['Ibuprofen 400mg', 'Abbott India', 35, 500],
  ['Diclofenac 50mg', 'Novartis India', 40, 400],
  ['Aspirin 75mg', 'Bayer', 18, 700],
  ['Combiflam Tablet', 'Sanofi India', 32, 550],
  ['Crocin Advance', 'GlaxoSmithKline', 30, 600],

  // Antibiotics
  ['Amoxicillin 500mg', "Dr. Reddy's Laboratories", 55, 350],
  ['Azithromycin 500mg', 'Cipla', 85, 300],
  ['Ciprofloxacin 500mg', 'Alkem Laboratories', 60, 280],
  ['Doxycycline 100mg', 'Mankind Pharma', 48, 320],
  ['Cefixime 200mg', 'Lupin', 95, 250],
  ['Metronidazole 400mg', 'Torrent Pharmaceuticals', 25, 400],
  ['Amoxicillin + Clavulanic Acid 625mg', 'GlaxoSmithKline', 145, 220],

  // Gastro / antacids
  ['Pantoprazole 40mg', "Dr. Reddy's Laboratories", 65, 400],
  ['Omeprazole 20mg', 'Cipla', 45, 450],
  ['Ranitidine 150mg', 'Zydus Cadila', 30, 380],
  ['Domperidone 10mg', 'Mankind Pharma', 28, 420],
  ['ORS Sachets', 'FDC Limited', 12, 900],
  ['Digene Gel', 'Abbott India', 95, 300],
  ['Electral Powder', 'FDC Limited', 15, 850],

  // Allergy / cold / respiratory
  ['Cetirizine 10mg', 'Cipla', 20, 700],
  ['Levocetirizine 5mg', 'Glenmark', 35, 500],
  ['Montelukast 10mg', 'Cipla', 110, 300],
  ['Chlorpheniramine 4mg', 'Zydus Cadila', 15, 500],
  ['Salbutamol Inhaler', 'Cipla', 165, 180],
  ['Ambroxol Syrup 100ml', 'Torrent Pharmaceuticals', 75, 260],
  ['Montair LC Tablet', 'Cipla', 145, 240],

  // Diabetes
  ['Metformin 500mg', 'USV Pvt Ltd', 30, 600],
  ['Glimepiride 2mg', 'Sanofi India', 55, 350],
  ['Insulin Glargine Injection', 'Sanofi India', 425, 120],
  ['Metformin 1000mg', 'USV Pvt Ltd', 42, 480],

  // Cardiac / blood pressure / cholesterol
  ['Amlodipine 5mg', 'Cipla', 32, 500],
  ['Atenolol 50mg', 'Zydus Cadila', 28, 420],
  ['Losartan 50mg', 'Torrent Pharmaceuticals', 45, 400],
  ['Telmisartan 40mg', 'Glenmark', 60, 380],
  ['Atorvastatin 10mg', "Dr. Reddy's Laboratories", 55, 450],
  ['Clopidogrel 75mg', 'Sun Pharma', 68, 300],

  // Vitamins / supplements
  ['Vitamin D3 60000IU', 'Mankind Pharma', 30, 700],
  ['Vitamin B Complex', 'Alkem Laboratories', 40, 600],
  ['Calcium + D3 Tablet', 'Cipla', 85, 450],
  ['Multivitamin Tablet', 'Abbott India', 120, 400],
  ['Zinc Sulphate Tablet', 'Mankind Pharma', 25, 500],
  ['Iron + Folic Acid Tablet', 'Zydus Cadila', 35, 550],
  ['Omega-3 Fish Oil Capsule', 'Mankind Pharma', 250, 250],

  // Skin / topical
  ['Betadine Ointment', 'Win-Medicare', 65, 300],
  ['Clotrimazole Cream', 'Glenmark', 45, 350],
  ['Calamine Lotion', 'Piramal Healthcare', 55, 300],
  ['Mupirocin Ointment', 'Glaxosmithkline', 85, 220],

  // Pain relief (topical)
  ['Volini Gel', 'Sun Pharma', 110, 300],
  ['Moov Cream', 'Reckitt Benckiser', 95, 280],

  // Women's health / misc
  ['Folic Acid 5mg', 'Mankind Pharma', 18, 500],
  ['Mefenamic Acid 500mg', 'Cipla', 32, 350],

  // Eye / ENT
  ['Ciprofloxacin Eye Drops', 'Ajanta Pharma', 45, 260],
  ['Sodium Chloride Nasal Drops', 'Alkem Laboratories', 25, 400],

  // Additional common generics
  ['Rabeprazole 20mg', 'Torrent Pharmaceuticals', 58, 380],
  ['Losartan + Hydrochlorothiazide', 'Torrent Pharmaceuticals', 72, 260],
  ['Levothyroxine 50mcg', 'Abbott India', 40, 420],
  ['Prednisolone 10mg', 'Zydus Cadila', 28, 300],
  ['Amitriptyline 25mg', 'Sun Pharma', 35, 250],
  ['Sertraline 50mg', "Dr. Reddy's Laboratories", 90, 200],
  ['Pantoprazole + Domperidone', 'Mankind Pharma', 78, 320],
  ['Cough Syrup (Dextromethorphan)', 'Cipla', 65, 350],
];

function futureDate(monthsAhead) {
  const d = new Date();
  d.setMonth(d.getMonth() + monthsAhead);
  return d;
}

async function main() {
  console.log('Seeding distributor accounts...');
  const hashedPassword = await bcrypt.hash('seed1234', 10);
  const distributorRecords = [];

  for (const d of DISTRIBUTORS) {
    const existing = await prisma.user.findUnique({ where: { email: d.email } });
    if (existing) {
      distributorRecords.push(existing);
      continue;
    }
    const user = await prisma.user.create({
      data: {
        name: d.name,
        email: d.email,
        password: hashedPassword,
        role: 'DISTRIBUTOR',
        businessName: d.businessName,
        licenseNumber: d.licenseNumber,
      },
    });
    distributorRecords.push(user);
  }

  console.log('Seeding medicine catalog...');
  let created = 0;

  for (let i = 0; i < MEDICINES.length; i++) {
    const [name, manufacturer, price, stock] = MEDICINES[i];
    const distributor = distributorRecords[i % distributorRecords.length];

    const existing = await prisma.medicine.findFirst({ where: { name, distributorId: distributor.id } });
    if (existing) continue;

    await prisma.medicine.create({
      data: {
        name,
        manufacturer,
        price,
        stock,
        expiryDate: futureDate(6 + (i % 18)),
        distributorId: distributor.id,
      },
    });
    created++;
  }

  console.log(`Done. Seeded ${created} new medicines across ${distributorRecords.length} distributor accounts.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
