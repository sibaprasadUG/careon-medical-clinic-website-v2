import { getSupabaseClient, getSupabaseDoctors } from '../server/supabase';
import { MASTER_DEPARTMENTS, deterministicUuid } from '../src/data/masterDepartments';
import { MASTER_SERVICES } from '../src/data/masterServices';
import { MASTER_INSURANCE_PARTNERS } from '../src/data/masterInsurance';

async function seedMasterCatalog() {
  console.log('--- STARTING CAREON MASTER CATALOG SEEDING ---');
  const client = getSupabaseClient();
  if (!client) {
    throw new Error('Supabase client is not available. Please verify SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
  }

  // 1. SEED DEPARTMENTS
  console.log(`\n[1/4] Seeding ${MASTER_DEPARTMENTS.length} Medical Departments into Supabase PostgreSQL...`);
  
  // Fetch existing departments in Supabase
  const { data: existingDepts, error: fetchDeptErr } = await client.from('departments').select('id, slug, name');
  if (fetchDeptErr) {
    throw new Error(`Failed to query existing departments: ${fetchDeptErr.message}`);
  }
  
  const existingDeptSlugs = new Set((existingDepts || []).map((d) => d.slug));
  const existingDeptIds = new Set((existingDepts || []).map((d) => d.id));
  console.log(`Found ${existingDeptSlugs.size} existing departments in Supabase.`);

  const deptRowsToUpsert = MASTER_DEPARTMENTS.map((dept) => ({
    id: dept.id,
    name: dept.name,
    slug: dept.slug,
    description: dept.description,
    image_url: dept.imageUrl || null,
    is_active: dept.status === 'ACTIVE',
    display_order: dept.displayOrder,
    created_at: dept.createdAt || new Date().toISOString(),
    updated_at: new Date().toISOString()
  }));

  // Batch upsert departments (in chunks of 25)
  const chunkSize = 25;
  for (let i = 0; i < deptRowsToUpsert.length; i += chunkSize) {
    const chunk = deptRowsToUpsert.slice(i, i + chunkSize);
    const { error: upsertErr } = await client.from('departments').upsert(chunk, { onConflict: 'id' });
    if (upsertErr) {
      console.error(`Error upserting department chunk ${i / chunkSize + 1}:`, upsertErr.message);
      throw upsertErr;
    }
  }
  console.log(`✓ Successfully upserted all ${MASTER_DEPARTMENTS.length} departments.`);

  // 2. SEED SERVICES
  console.log(`\n[2/4] Seeding ${MASTER_SERVICES.length} Clinical & Diagnostic Services into Supabase PostgreSQL...`);
  const { data: existingSrvs, error: fetchSrvErr } = await client.from('services').select('id, slug, name');
  if (fetchSrvErr) {
    throw new Error(`Failed to query existing services: ${fetchSrvErr.message}`);
  }
  console.log(`Found ${(existingSrvs || []).length} existing services in Supabase.`);

  const srvRowsToUpsert = MASTER_SERVICES.map((srv) => ({
    id: srv.id,
    name: srv.name,
    slug: srv.slug,
    department_id: srv.departmentId,
    description: srv.description,
    price: srv.price || null,
    image_url: srv.imageUrl || null,
    is_active: srv.status === 'ACTIVE',
    display_order: srv.displayOrder,
    created_at: srv.createdAt || new Date().toISOString(),
    updated_at: new Date().toISOString()
  }));

  for (let i = 0; i < srvRowsToUpsert.length; i += chunkSize) {
    const chunk = srvRowsToUpsert.slice(i, i + chunkSize);
    const { error: srvUpsertErr } = await client.from('services').upsert(chunk, { onConflict: 'id' });
    if (srvUpsertErr) {
      console.error(`Error upserting service chunk ${i / chunkSize + 1}:`, srvUpsertErr.message);
      throw srvUpsertErr;
    }
  }
  console.log(`✓ Successfully upserted all ${MASTER_SERVICES.length} clinical/diagnostic services.`);

  // 3. SEED INSURANCE PARTNERS / TPAs / GOVT SCHEMES
  console.log(`\n[3/4] Seeding ${MASTER_INSURANCE_PARTNERS.length} Insurance Partners & Schemes into Supabase site_settings...`);
  const { error: insError } = await client.from('site_settings').upsert(
    {
      setting_key: 'insurance_partners',
      setting_value: JSON.stringify(MASTER_INSURANCE_PARTNERS),
      updated_at: new Date().toISOString()
    },
    { onConflict: 'setting_key' }
  );

  if (insError) {
    console.error('Error saving insurance partners to site_settings:', insError.message);
    throw insError;
  }
  console.log(`✓ Successfully saved ${MASTER_INSURANCE_PARTNERS.length} insurance partners to site_settings.`);

  // 4. LINK REAL DOCTORS TO THEIR RESPECTIVE DEPARTMENTS
  console.log('\n[4/4] Verifying and linking existing clinic physicians to departments...');
  const genMedDeptId = deterministicUuid('careon-dept-general-medicine');
  const pediatricsDeptId = deterministicUuid('careon-dept-paediatrics-child-care');

  const doctors = await getSupabaseDoctors();
  for (const doc of doctors) {
    let targetDeptId: string | null = null;
    const nameUpper = doc.name.toUpperCase();
    if (nameUpper.includes('DEBDUTTA') || nameUpper.includes('NAYAK')) {
      targetDeptId = genMedDeptId;
      console.log(`Linking ${doc.name} to General Medicine / Internal Medicine (${targetDeptId})`);
    } else if (nameUpper.includes('ARKA') || nameUpper.includes('DEY')) {
      targetDeptId = pediatricsDeptId;
      console.log(`Linking ${doc.name} to Paediatrics & Child Care (${targetDeptId})`);
    }

    if (targetDeptId) {
      const { error: docUpdateErr } = await client
        .from('doctors')
        .update({ department_id: targetDeptId, updated_at: new Date().toISOString() })
        .eq('id', doc.id);
      if (docUpdateErr) {
        console.warn(`Note updating doctor ${doc.name}:`, docUpdateErr.message);
      } else {
        console.log(`✓ Successfully linked ${doc.name} to department.`);
      }
    }
  }

  // 5. FINAL VERIFICATION SUMMARY
  console.log('\n--- VERIFYING SEEDED DATABASE COUNTS ---');
  const [deptsCountRes, srvsCountRes, settingsRes, docsRes] = await Promise.all([
    client.from('departments').select('id, is_active', { count: 'exact' }),
    client.from('services').select('id, is_active', { count: 'exact' }),
    client.from('site_settings').select('setting_key').eq('setting_key', 'insurance_partners'),
    client.from('doctors').select('id, name, department_id')
  ]);

  console.log(`Total departments in Supabase: ${deptsCountRes.data?.length}`);
  console.log(`Total active departments: ${deptsCountRes.data?.filter((d) => d.is_active).length}`);
  console.log(`Total services in Supabase: ${srvsCountRes.data?.length}`);
  console.log(`Total active services: ${srvsCountRes.data?.filter((s) => s.is_active).length}`);
  console.log(`Insurance partners key present: ${Boolean(settingsRes.data && settingsRes.data.length > 0)}`);
  console.log('Doctors state in Supabase:');
  docsRes.data?.forEach((d) => {
    console.log(` - ${d.name}: department_id = ${d.department_id}`);
  });

  console.log('\n=== MASTER MEDICAL CATALOG SEEDING COMPLETED SUCCESSFULLY ===');
}

seedMasterCatalog().catch((err) => {
  console.error('Seeding failed with error:', err);
  process.exit(1);
});
