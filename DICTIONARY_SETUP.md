# Medical Dictionary Setup Guide

## Overview

The medical dictionary feature allows users to search for medical terms and their definitions stored in your Supabase database. This provides quick access to medical terminology before using AI simplification.

## Database Setup

### 1. Run the SQL Setup

The `supabase_setup.sql` file already includes the dictionary table setup. Run it in your Supabase SQL Editor if you haven't already.

### 2. Dictionary Table Structure

The `dictionary` table has the following structure:

```sql
CREATE TABLE dictionary (
  id UUID PRIMARY KEY,
  medical_term TEXT NOT NULL UNIQUE,
  definition TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
);
```

## Populating the Dictionary

### Option 1: Import via CSV

1. **Prepare your CSV file** with columns: `medical_term`, `definition`

   ```csv
   medical_term,definition
   Hypertension,High blood pressure
   Diabetes,A condition where blood sugar levels are too high
   ```

2. **Import in Supabase:**
   - Go to **Table Editor** → **dictionary**
   - Click **Insert** → **Import data from CSV**
   - Upload your CSV file
   - Map columns correctly

### Option 2: Insert via SQL

```sql
INSERT INTO dictionary (medical_term, definition) VALUES
('Hypertension', 'High blood pressure'),
('Diabetes', 'A condition where blood sugar levels are too high'),
('Insulin', 'A hormone that helps control blood sugar levels'),
('Glucose', 'A type of sugar that is the main source of energy for the body');
```

### Option 3: Bulk Import Script

Create a script to import from a JSON file:

```sql
-- Example: Insert multiple terms at once
INSERT INTO dictionary (medical_term, definition)
SELECT * FROM json_populate_recordset(
  null::record,
  '[
    {"medical_term": "Hypertension", "definition": "High blood pressure"},
    {"medical_term": "Diabetes", "definition": "A condition where blood sugar levels are too high"}
  ]'::json
) AS x(medical_term text, definition text);
```

## Search Features

### Search Modes

1. **Dictionary Search**: Quick lookup of medical terms

   - Searches both term names and definitions
   - Case-insensitive
   - Partial matching supported
   - Returns up to 50 results

2. **AI Simplification**: Uses OpenAI to simplify complex instructions
   - Better for full sentences or complex queries
   - Provides detailed explanations

### Search Functions

The SQL setup includes two search functions:

1. **`search_dictionary(term)`** - Simple pattern matching

   - Faster for simple searches
   - Good for prefix matching

2. **`search_dictionary_fts(term)`** - Full-text search
   - Better for complex queries
   - Returns relevance ranking
   - Uses PostgreSQL full-text search

## Usage in the App

### For Users

1. **Search Bar**: Use the search bar in the navbar
2. **Toggle Mode**: Switch between "Dictionary" and "AI" modes
3. **Dictionary Results**: View term definitions
4. **AI Simplification**: Click "Simplify with AI" on any dictionary result

### For Developers

The dictionary service is available in `src/services/dictionaryService.js`:

```javascript
import {
  searchDictionary,
  getDictionaryTerm,
} from "../services/dictionaryService";

// Search dictionary
const { data, error } = await searchDictionary("diabetes", false);

// Get specific term
const { data, error } = await getDictionaryTerm("Hypertension");
```

## Adding Terms Programmatically

### Via Supabase Dashboard

1. Go to **Table Editor** → **dictionary**
2. Click **Insert row**
3. Fill in `medical_term` and `definition`
4. Save

### Via API (for authenticated users with proper permissions)

You can create an admin function or use Supabase's admin API to bulk insert terms.

## Best Practices

1. **Unique Terms**: The `medical_term` column is UNIQUE - avoid duplicates
2. **Clear Definitions**: Write clear, concise definitions
3. **Regular Updates**: Keep the dictionary updated with new terms
4. **Indexing**: The table already has indexes for fast searching
5. **RLS Policies**: Only authenticated users can read the dictionary

## Example Medical Terms

Here are some example terms you might want to add:

```sql
INSERT INTO dictionary (medical_term, definition) VALUES
('Hypertension', 'High blood pressure, a condition where the force of blood against artery walls is too high'),
('Diabetes', 'A chronic condition where the body cannot properly use insulin, leading to high blood sugar'),
('Insulin', 'A hormone produced by the pancreas that helps glucose enter cells to be used for energy'),
('Glucose', 'A simple sugar that is the main source of energy for the body'),
('Cholesterol', 'A waxy substance found in blood, needed for building cells but too much can cause health problems'),
('Blood Pressure', 'The force of blood pushing against the walls of arteries as the heart pumps'),
('Pulse', 'The number of times the heart beats per minute'),
('Temperature', 'A measure of body heat, normally around 98.6°F (37°C)'),
('Medication', 'A substance used to treat, cure, or prevent disease'),
('Dosage', 'The amount of medication to take at one time');
```

## Troubleshooting

### No results found

- Check that terms are inserted in the dictionary table
- Verify RLS policies allow SELECT for authenticated users
- Check search term spelling

### Search is slow

- Ensure indexes are created (check `supabase_setup.sql`)
- Consider using full-text search for complex queries
- Limit results with pagination

### Permission errors

- Verify RLS policies are set correctly
- Check that users are authenticated
- Ensure search functions have proper permissions

## Next Steps

1. Populate your dictionary with medical terms
2. Test search functionality
3. Customize search results display if needed
4. Add more terms as needed
5. Consider adding categories or tags for better organization


