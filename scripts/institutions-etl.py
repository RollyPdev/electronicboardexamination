#!/usr/bin/env python3

import asyncio
import asyncpg
import aiohttp
import json
import os
from datetime import datetime
from typing import List, Dict, Optional
from urllib.parse import quote

class InstitutionsETL:
    def __init__(self):
        self.db_url = os.getenv('DATABASE_URL')
        if not self.db_url:
            raise ValueError("DATABASE_URL environment variable is required")

    def normalize_name(self, name: str) -> str:
        """Normalize institution name for deduplication"""
        return ''.join(c for c in name.lower().strip() if c.isalnum() or c.isspace()).strip()

    def generate_logo_url(self, name: str) -> str:
        """Generate placeholder logo URL with institution initials"""
        words = name.split()
        initials = ''.join(word[0] for word in words if word)[:3].upper()
        return f"https://ui-avatars.com/api/?name={quote(initials)}&size=200&background=0D47A1&color=fff&format=png"

    async def fetch_ched_data(self) -> List[Dict]:
        """Fetch data from CHED sources"""
        # Mock data - replace with actual CHED API calls
        return [
            {
                'name': 'University of the Philippines',
                'alt_names': ['UP'],
                'type': 'University',
                'ownership': 'Public',
                'region': 'NCR',
                'province': 'Metro Manila',
                'city_municipality': 'Quezon City',
                'address': 'Diliman, Quezon City',
                'website': 'https://up.edu.ph',
                'email': 'info@up.edu.ph',
                'source': 'CHED',
                'source_url': 'https://ched.gov.ph/hei-list',
                'source_date': datetime.now()
            },
            {
                'name': 'De La Salle University',
                'alt_names': ['DLSU'],
                'type': 'University',
                'ownership': 'Private',
                'region': 'NCR',
                'province': 'Metro Manila',
                'city_municipality': 'Manila',
                'address': '2401 Taft Avenue, Manila',
                'website': 'https://dlsu.edu.ph',
                'source': 'CHED',
                'source_url': 'https://ched.gov.ph/hei-list',
                'source_date': datetime.now()
            }
        ]

    async def fetch_tesda_data(self) -> List[Dict]:
        """Fetch data from TESDA sources"""
        return [
            {
                'name': 'TESDA Technology Institute',
                'alt_names': ['TTI'],
                'type': 'Institute',
                'ownership': 'Public',
                'region': 'NCR',
                'province': 'Metro Manila',
                'city_municipality': 'Taguig City',
                'address': 'East Service Road, Taguig City',
                'website': 'https://tesda.gov.ph',
                'source': 'TESDA',
                'source_url': 'https://tesda.gov.ph/tvi-list',
                'source_date': datetime.now()
            }
        ]

    def deduplicate_institutions(self, institutions: List[Dict]) -> List[Dict]:
        """Remove duplicate institutions based on normalized name and location"""
        seen = set()
        deduplicated = []
        
        for inst in institutions:
            key = f"{self.normalize_name(inst['name'])}-{inst['region']}-{inst['province']}"
            if key not in seen:
                seen.add(key)
                deduplicated.append(inst)
        
        return deduplicated

    async def upsert_institution(self, conn, data: Dict) -> str:
        """Upsert institution into database"""
        # Generate logo if not provided
        if not data.get('logo_url'):
            data['logo_url'] = self.generate_logo_url(data['name'])

        # Check if institution exists
        existing = await conn.fetchrow("""
            SELECT id FROM institutions 
            WHERE name = $1 AND region = $2 AND province = $3
        """, data['name'], data['region'], data['province'])

        if existing:
            # Update existing
            await conn.execute("""
                UPDATE institutions SET
                    alt_names = $1, type = $2, ownership = $3,
                    city_municipality = $4, address = $5, website = $6,
                    email = $7, logo_url = $8, source = $9, source_url = $10,
                    source_date = $11, updated_at = NOW()
                WHERE id = $12
            """, 
            data['alt_names'], data['type'], data['ownership'],
            data['city_municipality'], data.get('address'), data.get('website'),
            data.get('email'), data['logo_url'], data['source'], 
            data.get('source_url'), data.get('source_date'), existing['id'])
            return 'updated'
        else:
            # Insert new
            await conn.execute("""
                INSERT INTO institutions (
                    name, alt_names, type, ownership, region, province,
                    city_municipality, address, website, email, logo_url,
                    source, source_url, source_date
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
            """,
            data['name'], data['alt_names'], data['type'], data['ownership'],
            data['region'], data['province'], data['city_municipality'],
            data.get('address'), data.get('website'), data.get('email'),
            data['logo_url'], data['source'], data.get('source_url'),
            data.get('source_date'))
            return 'created'

    async def sync_institutions(self):
        """Main sync function"""
        print("🏫 Starting Philippine Institutions Sync...")
        
        # Fetch data from all sources
        ched_data = await self.fetch_ched_data()
        tesda_data = await self.fetch_tesda_data()
        
        # Combine and deduplicate
        all_data = ched_data + tesda_data
        deduplicated = self.deduplicate_institutions(all_data)
        
        print(f"📊 Processing {len(deduplicated)} institutions...")
        
        # Connect to database
        conn = await asyncpg.connect(self.db_url)
        
        try:
            created = 0
            updated = 0
            
            for data in deduplicated:
                result = await self.upsert_institution(conn, data)
                if result == 'created':
                    created += 1
                else:
                    updated += 1
            
            print(f"✅ Sync completed: {created} created, {updated} updated")
            return {'created': created, 'updated': updated}
            
        finally:
            await conn.close()

async def main():
    try:
        etl = InstitutionsETL()
        await etl.sync_institutions()
    except Exception as e:
        print(f"❌ Sync failed: {e}")
        exit(1)

if __name__ == "__main__":
    asyncio.run(main())