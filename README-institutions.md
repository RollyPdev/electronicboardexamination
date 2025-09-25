# Philippine Institutions API

A comprehensive API for all tertiary institutions in the Philippines, including state universities and colleges (SUCs), local universities and colleges (LUCs), private HEIs, CHED-recognized institutions, and TESDA-registered TVIs.

## Features

- **Complete Coverage**: All Philippine tertiary institutions
- **Auto-deduplication**: Normalized names and merged duplicates
- **Logo Support**: Official logos or generated placeholders
- **Data Provenance**: Source tracking with URLs and dates
- **Real-time Sync**: Automated daily updates via GitHub Actions

## API Endpoints

### GET /api/institutions

Paginated list of institutions with search and filtering.

**Query Parameters:**
- `page` (default: 1) - Page number
- `limit` (default: 20) - Items per page
- `search` - Search by name or alternative names
- `region` - Filter by region
- `ownership` - Filter by ownership (Public/Private)
- `type` - Filter by institution type

**Example:**
```bash
curl "http://localhost:3000/api/institutions?search=university&region=NCR&page=1&limit=10"
```

**Response:**
```json
{
  "results": [
    {
      "id": "uuid",
      "name": "University of the Philippines",
      "type": "University",
      "ownership": "Public",
      "region": "NCR",
      "province": "Metro Manila",
      "cityMunicipality": "Quezon City",
      "logoUrl": "https://up.edu.ph/logo.png",
      "website": "https://up.edu.ph"
    }
  ],
  "total": 2000,
  "page": 1,
  "limit": 10,
  "totalPages": 200
}
```

### GET /api/institutions/[id]

Get single institution details by ID.

**Response:**
```json
{
  "id": "uuid",
  "name": "University of the Philippines",
  "altNames": ["UP"],
  "type": "University",
  "ownership": "Public",
  "region": "NCR",
  "province": "Metro Manila",
  "cityMunicipality": "Quezon City",
  "address": "Diliman, Quezon City",
  "website": "https://up.edu.ph",
  "email": "info@up.edu.ph",
  "logoUrl": "https://up.edu.ph/logo.png",
  "source": "CHED",
  "sourceUrl": "https://ched.gov.ph/hei-list",
  "sourceDate": "2024-01-15T10:00:00Z",
  "createdAt": "2024-01-15T10:00:00Z",
  "updatedAt": "2024-01-15T10:00:00Z"
}
```

### POST /api/institutions/sync

Manually trigger institutions sync (requires authentication).

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Institutions sync completed",
  "created": 50,
  "updated": 150
}
```

## Database Schema

```sql
CREATE TABLE institutions (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  alt_names TEXT[],
  type TEXT NOT NULL,
  ownership TEXT NOT NULL,
  region TEXT NOT NULL,
  province TEXT NOT NULL,
  city_municipality TEXT NOT NULL,
  address TEXT,
  website TEXT,
  email TEXT,
  logo_url TEXT,
  source TEXT NOT NULL,
  source_url TEXT,
  source_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(name, region, province)
);
```

## ETL Process

### Automated Sync

The system automatically syncs data daily at 2 AM UTC (10 AM PHT) via GitHub Actions.

### Manual Sync

**Node.js/TypeScript:**
```bash
npm run institutions:sync
```

**Python:**
```bash
pip install -r requirements.txt
python scripts/institutions-etl.py
```

### Data Sources

1. **CHED Master List**: Official list of Higher Education Institutions
2. **CHED Autonomous/Deregulated**: Special status institutions
3. **TESDA Registry**: Technical-Vocational Institutions (optional)

### Deduplication Logic

- Normalize institution names (remove special chars, lowercase)
- Create unique key: `normalized_name-region-province`
- Merge duplicates, keeping most recent data

### Logo Handling

1. Try to fetch from official website
2. Check CHED-provided logo URLs
3. Generate placeholder with institution initials
4. Fallback to generic education icon

## Environment Variables

```env
DATABASE_URL=postgresql://user:pass@localhost:5432/db
```

## Error Handling

- **404**: Institution not found
- **500**: Server error with detailed logging
- **401**: Unauthorized (sync endpoint)

## Production Deployment

1. Set up PostgreSQL database
2. Run Prisma migrations: `npx prisma db push`
3. Set environment variables
4. Configure GitHub Actions secrets
5. Deploy to Vercel/AWS/etc.

## Monitoring

- GitHub Actions workflow status
- Database query performance
- API response times
- Logo availability rates

## Contributing

1. Fork the repository
2. Create feature branch
3. Add tests for new functionality
4. Submit pull request

## License

MIT License - see LICENSE file for details.