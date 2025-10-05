# API Wilayah Indonesia

API data wilayah Indonesia (Provinsi, Kabupaten/Kota, Kecamatan, dan Kelurahan/Desa) dalam format JSON.

## 📊 Data Statistics

- **Provinsi**: 38
- **Kabupaten/Kota**: 514+
- **Kecamatan**: 7000+
- **Kelurahan/Desa**: 80000+

## 🚀 Base URL

**Development**: `http://localhost:8080/`

**Production**: `https://pc-rumah.github.io/api-wilayah/api/`

## 📖 API Endpoints

### 1. Get All Provinces

```
GET /api/provinces.json
```

**Response:**

```json
[
  {
    "id": "11",
    "name": "ACEH"
  },
  {
    "id": "12",
    "name": "SUMATERA UTARA"
  }
]
```

### 2. Get Province Detail with Regencies

```
GET /api/provinces/{province_id}.json
```

**Example:** `/api/provinces/11.json`

**Response:**

```json
{
  "id": "11",
  "name": "ACEH",
  "regencies": [
    {
      "id": "1101",
      "province_id": "11",
      "name": "KABUPATEN SIMEULUE"
    }
  ]
}
```

### 3. Get All Regencies

```
GET /api/regencies.json
```

**Response:**

```json
[
  {
    "id": "1101",
    "province_id": "11",
    "name": "KABUPATEN SIMEULUE"
  }
]
```

### 4. Get Regency Detail with Districts

```
GET /api/regencies/{regency_id}.json
```

**Example:** `/api/regencies/1101.json`

**Response:**

```json
{
  "id": "1101",
  "province_id": "11",
  "name": "KABUPATEN SIMEULUE",
  "districts": [
    {
      "id": "110101",
      "regency_id": "1101",
      "name": "TEUPAH SELATAN"
    }
  ]
}
```

### 5. Get All Districts

```
GET /api/districts.json
```

### 6. Get District Detail with Villages

```
GET /api/districts/{district_id}.json
```

**Example:** `/api/districts/110101.json`

**Response:**

```json
{
  "id": "110101",
  "regency_id": "1101",
  "name": "TEUPAH SELATAN",
  "villages": [
    {
      "id": "1101011001",
      "district_id": "110101",
      "name": "LATIUNG"
    }
  ]
}
```

### 7. Get All Villages

```
GET /api/villages.json
```

## 💻 Usage Examples

### JavaScript (Fetch)

```javascript
// Get all provinces
fetch("https://pc-rumah.github.io/api-wilayah/api/provinces.json")
  .then((response) => response.json())
  .then((data) => console.log(data));

// Get specific province with regencies
fetch("https://pc-rumah.github.io/api-wilayah/api/provinces/11.json")
  .then((response) => response.json())
  .then((data) => console.log(data));
```

### PHP (cURL)

```php
<?php
$url = "https://pc-rumah.github.io/api-wilayah/api/provinces.json";
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
$response = curl_exec($ch);
curl_close($ch);
$data = json_decode($response, true);
print_r($data);
?>
```

### Python (Requests)

```python
import requests

response = requests.get('https://pc-rumah.github.io/api-wilayah/api/provinces.json')
data = response.json()
print(data)
```

### jQuery

```javascript
$.getJSON(
  "https://pc-rumah.github.io/api-wilayah/api/provinces.json",
  function (data) {
    console.log(data);
  }
);
```

## 🛠️ Development

### Prerequisites

- Node.js (v14+)
- npm

### Installation

```bash
# Clone repository
git clone https://github.com/yourusername/api-wilayah-indonesia.git
cd api-wilayah-indonesia

# Install dependencies
npm install

# Generate API from CSV
npm run generate

# Run local server
npm run serve
```

### Project Structure

```
api-wilayah-indonesia/
├── data/                  # CSV source files
│   ├── provinces.csv
│   ├── regencies.csv
│   ├── districts.csv
│   └── villages.csv
├── api/                   # Generated JSON files
│   ├── provinces.json
│   ├── provinces/
│   ├── regencies.json
│   ├── regencies/
│   ├── districts.json
│   ├── districts/
│   └── villages.json
├── generate-from-csv.js   # Generator script
├── package.json
└── README.md
```

## 📝 Data Source

Data wilayah Indonesia bersumber dari:

- Badan Pusat Statistik (BPS)
- Kementerian Dalam Negeri (Kemendagri)
