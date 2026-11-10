import { connectToDatabase, disconnectFromDatabase } from '../config/database';
import { loadEnvironment } from '../config/env';
import {
  createWholesaleEnquiry,
  getWholesaleEnquiry,
  listWholesaleEnquiries,
  updateWholesaleEnquiry,
  deleteWholesaleEnquiry,
  getWholesaleStats,
  createDistributorApplication,
  getDistributorApplication,
  listDistributorApplications,
  updateDistributorApplication,
  deleteDistributorApplication,
  listApprovedDistributors,
  getDistributorStats,
  getBusinessOverviewStats,
} from '../services/business.service';

async function main() {
  console.log('🧪 Starting Yum Nest Wholesale & Distribution Integration Test...\n');
  const env = loadEnvironment();
  await connectToDatabase(env.MONGODB_URI);
  console.log('✅ Connected to MongoDB successfully.\n');

  // ─── 1. Test Wholesale Enquiry Creation ──────────────────────────────────
  console.log('1️⃣ Testing Wholesale Enquiry Creation...');
  const wholesaleInput = {
    fullName: 'Test Merchant Faheem',
    businessName: 'Calicut Royal Supermarket',
    mobile: '9846011223',
    whatsapp: '9846011223',
    email: 'faheem.test@calicutroyal.com',
    state: 'Kerala',
    district: 'Kozhikode',
    businessType: 'Supermarket',
    interestedProducts: [
      'Yumnest Broast Masala Powder',
      'Tellicherry Black Pepper',
      'Pure Cold Pressed Coconut Oil',
    ],
    requiredQuantity: '50 kg monthly',
    message: 'Testing wholesale inquiry integration script.',
  };

  const enquiry = await createWholesaleEnquiry(wholesaleInput);
  console.log(`✅ Wholesale Enquiry Created: ID=${enquiry.enquiryId}, Status=${enquiry.status}`);
  if (!enquiry.enquiryId.startsWith('WNQ-')) {
    throw new Error(`Expected enquiryId to start with WNQ-, got ${enquiry.enquiryId}`);
  }

  // ─── 2. Test Wholesale Query & Retrieval ─────────────────────────────────
  console.log('\n2️⃣ Testing Wholesale Enquiry Retrieval...');
  const fetchedEnquiry = await getWholesaleEnquiry(enquiry.enquiryId);
  if (!fetchedEnquiry || fetchedEnquiry.businessName !== wholesaleInput.businessName) {
    throw new Error('Failed to retrieve created wholesale enquiry');
  }
  console.log(`✅ Successfully retrieved wholesale enquiry: ${fetchedEnquiry.businessName}`);

  // ─── 3. Test Wholesale Status Update & Admin Notes ────────────────────────
  console.log('\n3️⃣ Testing Wholesale Status Update & Admin Notes...');
  const updatedEnquiry = await updateWholesaleEnquiry(enquiry.enquiryId, {
    status: 'quotation_sent',
    adminNotes: 'Sample price sheet sent via WhatsApp test.',
  });
  if (!updatedEnquiry || updatedEnquiry.status !== 'quotation_sent') {
    throw new Error('Failed to update wholesale enquiry status');
  }
  console.log(`✅ Wholesale Enquiry Updated to status: ${updatedEnquiry.status}`);

  // ─── 4. Test Wholesale Stats ──────────────────────────────────────────────
  console.log('\n4️⃣ Testing Wholesale Stats...');
  const wholesaleStats = await getWholesaleStats();
  console.log('✅ Wholesale Stats:', wholesaleStats);

  // ─── 5. Test Distributor Application Creation ─────────────────────────────
  console.log('\n5️⃣ Testing Distributor Application Creation...');
  const distributorInput = {
    fullName: 'Test Distributor Ashraf',
    businessName: 'Malabar Spices Trading Co.',
    mobile: '9847055667',
    whatsapp: '9847055667',
    email: 'ashraf.dist@malabarspices.com',
    state: 'Kerala',
    district: 'Ernakulam',
    city: 'Aluva',
    address: 'Near Spice Market, Main Road, Aluva, 683101',
    businessType: 'Food Products Distribution',
    distributionExperience: 'yes' as const,
    experienceDetails: '7 years distributing grocery to 200+ supermarkets in Ernakulam.',
    interestedCategories: ['Pure Spices', 'Signature Masala Blends'],
    additionalInformation: 'Have 3 delivery vans and 1500 sqft warehouse.',
  };

  const application = await createDistributorApplication(distributorInput);
  console.log(`✅ Distributor Application Created: ID=${application.applicationId}, Status=${application.status}`);
  if (!application.applicationId.startsWith('DST-')) {
    throw new Error(`Expected applicationId to start with DST-, got ${application.applicationId}`);
  }

  // ─── 6. Test Distributor Retrieval & Under Review ────────────────────────
  console.log('\n6️⃣ Testing Distributor Application Retrieval...');
  const fetchedApp = await getDistributorApplication(application.applicationId);
  if (!fetchedApp || fetchedApp.businessName !== distributorInput.businessName) {
    throw new Error('Failed to retrieve created distributor application');
  }
  console.log(`✅ Successfully retrieved application: ${fetchedApp.businessName}`);

  // ─── 7. Test Distributor Approval Flow ───────────────────────────────────
  console.log('\n7️⃣ Testing Distributor Approval Flow...');
  const approvedApp = await updateDistributorApplication(application.applicationId, {
    status: 'approved',
    adminNotes: 'Verified warehouse premises and signed distribution agreement.',
  });
  if (!approvedApp || approvedApp.status !== 'approved' || !approvedApp.approvedAt) {
    throw new Error('Distributor application approval failed or approvedAt missing');
  }
  console.log(`✅ Distributor Approved: ID=${approvedApp.applicationId}, ApprovedAt=${approvedApp.approvedAt}`);

  // ─── 8. Test Approved Distributors Query ─────────────────────────────────
  console.log('\n8️⃣ Testing Approved Distributors List...');
  const approvedList = await listApprovedDistributors({ status: 'approved' });
  const foundInApproved = approvedList.distributors.some(
    (d) => d.applicationId === approvedApp.applicationId
  );
  if (!foundInApproved) {
    throw new Error('Approved distributor not found in approved list query');
  }
  console.log(`✅ Approved distributor found in network list (total approved: ${approvedList.total})`);

  // ─── 9. Test Deactivate & Reactivate Distributor ──────────────────────────
  console.log('\n9️⃣ Testing Deactivation (Preserving History)...');
  const deactivatedApp = await updateDistributorApplication(application.applicationId, {
    status: 'deactivated',
  });
  if (!deactivatedApp || deactivatedApp.status !== 'deactivated') {
    throw new Error('Failed to deactivate distributor');
  }
  console.log(`✅ Distributor deactivated: Status=${deactivatedApp.status}`);

  console.log('Reactivating distributor...');
  const reactivatedApp = await updateDistributorApplication(application.applicationId, {
    status: 'approved',
  });
  if (!reactivatedApp || reactivatedApp.status !== 'approved') {
    throw new Error('Failed to reactivate distributor');
  }
  console.log(`✅ Distributor reactivated: Status=${reactivatedApp.status}`);

  // ─── 10. Test Business Overview Notification Stats ────────────────────────
  console.log('\n🔟 Testing Business Overview Notification Stats...');
  const overviewStats = await getBusinessOverviewStats();
  console.log('✅ Business Overview Stats:', overviewStats);

  // ─── 11. Clean Up Test Records ────────────────────────────────────────────
  console.log('\n🧹 Cleaning up test records...');
  await deleteWholesaleEnquiry(enquiry.enquiryId);
  await deleteDistributorApplication(application.applicationId);
  console.log('✅ Cleaned up test records from MongoDB successfully.\n');

  console.log('🎉 ALL 11 DATABASE & BACKEND INTEGRATION TESTS PASSED CLEANLY! 🎉');
  await disconnectFromDatabase();
}

main().catch((err) => {
  console.error('❌ Test failed with error:', err);
  process.exit(1);
});
