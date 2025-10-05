const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');

// Konfigurasi file CSV
const CSV_FILES = {
  provinces: './data/provinces.csv',
  regencies: './data/regencies.csv',
  districts: './data/districts.csv',
  villages: './data/villages.csv'
};

// Storage untuk data
const data = {
  provinces: [],
  regencies: [],
  districts: [],
  villages: []
};

// Fungsi untuk membaca CSV (dengan atau tanpa header)
function readCSV(filePath, customHeaders = null) {
  return new Promise((resolve, reject) => {
    const results = [];
    let rowCount = 0;
    
    if (!fs.existsSync(filePath)) {
      console.error(`❌ File not found: ${filePath}`);
      reject(new Error(`File not found: ${filePath}`));
      return;
    }

    const options = customHeaders ? { headers: customHeaders } : {};

    fs.createReadStream(filePath)
      .pipe(csv(options))
      .on('headers', (headerList) => {
        console.log(`   Headers: [${headerList.join(', ')}]`);
      })
      .on('data', (row) => {
        rowCount++;
        // Log first row untuk debug
        if (rowCount === 1) {
          console.log(`   First row:`, row);
        }
        results.push(row);
      })
      .on('end', () => {
        console.log(`✓ Loaded ${results.length} rows from ${path.basename(filePath)}`);
        
        if (results.length === 0) {
          console.warn(`⚠️  Warning: No data found in ${path.basename(filePath)}`);
        }
        
        resolve(results);
      })
      .on('error', (error) => {
        console.error(`❌ Error reading ${filePath}:`, error.message);
        reject(error);
      });
  });
}

// Fungsi untuk membuat direktori
function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// Fungsi untuk menulis JSON
function writeJSON(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

// Fungsi untuk normalize field names (handle various column names)
function normalizeData(rawData, type) {
  return rawData.map(item => {
    const normalized = {};
    
    // Normalize id field
    normalized.id = item.id || item.kode || item.code || item.ID || item.KODE;
    
    // Normalize name field
    normalized.name = item.name || item.nama || item.NAME || item.NAMA;
    
    // Type-specific fields
    if (type === 'regencies') {
      normalized.province_id = item.province_id || item.provinsi_id || item.kode_provinsi || item.province_code;
    } else if (type === 'districts') {
      normalized.regency_id = item.regency_id || item.kabupaten_id || item.kode_kabupaten || item.regency_code;
    } else if (type === 'villages') {
      normalized.district_id = item.district_id || item.kecamatan_id || item.kode_kecamatan || item.district_code;
    }
    
    return normalized;
  });
}

// Generate API dari data CSV
async function generateAPI() {
  try {
    console.log('🚀 Starting CSV import...\n');

    // 1. Baca semua file CSV (dengan custom header karena tidak ada header di CSV)
    console.log('📖 Reading CSV files...\n');
    
    console.log('Reading provinces.csv:');
    const rawProvinces = await readCSV(CSV_FILES.provinces, ['id', 'name']);
    
    console.log('\nReading regencies.csv:');
    const rawRegencies = await readCSV(CSV_FILES.regencies, ['id', 'province_id', 'name']);
    
    console.log('\nReading districts.csv:');
    const rawDistricts = await readCSV(CSV_FILES.districts, ['id', 'regency_id', 'name']);
    
    console.log('\nReading villages.csv:');
    const rawVillages = await readCSV(CSV_FILES.villages, ['id', 'district_id', 'name']);

    // 2. Normalize data
    console.log('\n🔄 Normalizing data...');
    data.provinces = normalizeData(rawProvinces, 'provinces');
    data.regencies = normalizeData(rawRegencies, 'regencies');
    data.districts = normalizeData(rawDistricts, 'districts');
    data.villages = normalizeData(rawVillages, 'villages');

    console.log('\n📊 Data Summary:');
    console.log(`   Provinces: ${data.provinces.length}`);
    console.log(`   Regencies: ${data.regencies.length}`);
    console.log(`   Districts: ${data.districts.length}`);
    console.log(`   Villages: ${data.villages.length}`);

    // Check if data is valid
    if (data.provinces.length === 0) {
      throw new Error('No provinces data found! Please check your CSV file.');
    }

    // 3. Buat struktur folder
    console.log('\n📁 Creating directory structure...');
    const apiDir = './api';
    ensureDir(`${apiDir}/provinces`);
    ensureDir(`${apiDir}/regencies`);
    ensureDir(`${apiDir}/districts`);
    ensureDir(`${apiDir}/villages`);

    // 4. Generate provinces.json
    console.log('\n🔨 Generating API files...');
    const provincesList = data.provinces.map(p => ({
      id: p.id,
      name: p.name
    }));
    writeJSON(`${apiDir}/provinces.json`, provincesList);
    console.log('✓ provinces.json');

    // 5. Generate individual province files
    let fileCount = 1;
    for (const province of data.provinces) {
      const regencies = data.regencies
        .filter(r => r.province_id === province.id)
        .map(r => ({
          id: r.id,
          province_id: r.province_id,
          name: r.name
        }));
      
      writeJSON(`${apiDir}/provinces/${province.id}.json`, {
        id: province.id,
        name: province.name,
        regencies: regencies
      });
      fileCount++;
    }
    console.log(`✓ ${data.provinces.length} province detail files`);

    // 6. Generate regencies.json
    const regenciesList = data.regencies.map(r => ({
      id: r.id,
      province_id: r.province_id,
      name: r.name
    }));
    writeJSON(`${apiDir}/regencies.json`, regenciesList);
    console.log('✓ regencies.json');
    fileCount++;

    // 7. Generate individual regency files
    for (const regency of data.regencies) {
      const districts = data.districts
        .filter(d => d.regency_id === regency.id)
        .map(d => ({
          id: d.id,
          regency_id: d.regency_id,
          name: d.name
        }));
      
      writeJSON(`${apiDir}/regencies/${regency.id}.json`, {
        id: regency.id,
        province_id: regency.province_id,
        name: regency.name,
        districts: districts
      });
      fileCount++;
    }
    console.log(`✓ ${data.regencies.length} regency detail files`);

    // 8. Generate districts.json
    const districtsList = data.districts.map(d => ({
      id: d.id,
      regency_id: d.regency_id,
      name: d.name
    }));
    writeJSON(`${apiDir}/districts.json`, districtsList);
    console.log('✓ districts.json');
    fileCount++;

    // 9. Generate individual district files
    for (const district of data.districts) {
      const villages = data.villages
        .filter(v => v.district_id === district.id)
        .map(v => ({
          id: v.id,
          district_id: v.district_id,
          name: v.name
        }));
      
      writeJSON(`${apiDir}/districts/${district.id}.json`, {
        id: district.id,
        regency_id: district.regency_id,
        name: district.name,
        villages: villages
      });
      fileCount++;
    }
    console.log(`✓ ${data.districts.length} district detail files`);

    // 10. Generate villages.json
    const villagesList = data.villages.map(v => ({
      id: v.id,
      district_id: v.district_id,
      name: v.name
    }));
    writeJSON(`${apiDir}/villages.json`, villagesList);
    console.log('✓ villages.json');
    fileCount++;

    console.log('\n✨ API generation completed!');
    console.log(`📦 Total files generated: ${fileCount}`);
    console.log(`📂 Output directory: ${path.resolve(apiDir)}`);
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

// Jalankan generator
generateAPI();