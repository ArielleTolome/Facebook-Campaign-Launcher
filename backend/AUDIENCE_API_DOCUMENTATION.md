# Audience Management System API Documentation

## Overview

The Audience Management System provides comprehensive tools for creating, managing, and targeting Facebook audiences. It supports saved audiences, custom audiences (with CSV upload), and lookalike audiences.

## Features

- ✅ Create/save/retrieve audience configurations
- ✅ Upload CSV and create Facebook custom audiences
- ✅ Estimate audience reach before campaign launch
- ✅ Audience templates for reusable configurations
- ✅ Targeting validation and suggestions
- ✅ Support for saved, custom, and lookalike audiences

## Models

### Audience Model

Located at: `src/models/Audience.js`

**Fields:**
- `id` (UUID) - Primary key
- `name` (String) - Audience name
- `description` (Text) - Audience description
- `type` (ENUM) - SAVED, CUSTOM, or LOOKALIKE
- `fbAudienceId` (String) - Facebook Audience ID
- `targeting` (JSONB) - Facebook targeting specification
- `customAudienceSpec` (JSONB) - Custom audience configuration
- `lookalikSpec` (JSONB) - Lookalike audience configuration
- `estimatedSize` (Integer) - Estimated reach
- `estimatedSizeRange` (JSONB) - Min/max estimated reach
- `status` (ENUM) - ACTIVE, ARCHIVED, DELETED
- `templateId` (UUID) - Reference to audience template
- `tags` (Array) - Tags for categorization
- `metadata` (JSONB) - Additional metadata

### AudienceTemplate Model

Located at: `src/models/AudienceTemplate.js`

**Fields:**
- `id` (UUID) - Primary key
- `name` (String) - Template name
- `description` (Text) - Template description
- `category` (String) - Template category
- `type` (ENUM) - SAVED, CUSTOM, or LOOKALIKE
- `targeting` (JSONB) - Default targeting configuration
- `configurableFields` (Array) - Customizable field names
- `defaultValues` (JSONB) - Default values for fields
- `isPublic` (Boolean) - Public availability
- `usageCount` (Integer) - Usage counter
- `tags` (Array) - Tags for categorization

## API Endpoints

### Audience Endpoints

#### Create Audience
```http
POST /api/audiences?adAccountId={adAccountId}
Content-Type: application/json

{
  "name": "Tech Enthusiasts 18-34",
  "description": "Young adults interested in technology",
  "type": "SAVED",
  "targeting": {
    "age_min": 18,
    "age_max": 34,
    "genders": [1, 2],
    "geo_locations": {
      "countries": ["US"]
    },
    "interests": [
      { "id": "6003139266461", "name": "Technology" }
    ]
  },
  "tags": ["technology", "young-adults"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Tech Enthusiasts 18-34",
    "type": "SAVED",
    "targeting": {...},
    "status": "ACTIVE",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

#### Get All Audiences
```http
GET /api/audiences?type=SAVED&status=ACTIVE&tags=technology
```

**Query Parameters:**
- `type` - Filter by audience type (SAVED, CUSTOM, LOOKALIKE)
- `status` - Filter by status (ACTIVE, ARCHIVED, DELETED)
- `tags` - Comma-separated list of tags

#### Get Audience by ID
```http
GET /api/audiences/{id}
```

#### Update Audience
```http
PUT /api/audiences/{id}
Content-Type: application/json

{
  "name": "Updated Audience Name",
  "description": "Updated description",
  "tags": ["new", "tags"]
}
```

#### Delete Audience (Soft Delete)
```http
DELETE /api/audiences/{id}
```

#### Upload CSV to Custom Audience
```http
POST /api/audiences/{id}/upload-csv
Content-Type: multipart/form-data

file: [CSV file]
schema: EMAIL
```

**CSV Format:**
```csv
email
user1@example.com
user2@example.com
user3@example.com
```

**Supported Schemas:**
- EMAIL
- PHONE
- MOBILE_ADVERTISER_ID
- EXTERN_ID

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Users uploaded successfully",
    "totalUsers": 1000,
    "batches": 1,
    "details": [...]
  }
}
```

#### Get Reach Estimate
```http
POST /api/audiences/estimate?adAccountId={adAccountId}
Content-Type: application/json

{
  "targeting": {
    "age_min": 18,
    "age_max": 65,
    "genders": [1, 2],
    "geo_locations": {
      "countries": ["US"]
    },
    "interests": [
      { "id": "6003139266461", "name": "Technology" }
    ]
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "estimatedReach": 50000000,
    "estimatedDailyReach": 1000000,
    "estimatedMonthlyReach": 30000000,
    "estimatedReachRange": {
      "min": 45000000,
      "max": 55000000
    },
    "currency": "USD",
    "bidEstimates": [...]
  }
}
```

#### Get Targeting Suggestions
```http
GET /api/audiences/targeting/suggestions?adAccountId={adAccountId}&type=interests&query=technology
```

**Query Parameters:**
- `adAccountId` (required) - Facebook Ad Account ID
- `type` (required) - interests, behaviors, demographics, etc.
- `query` (required) - Search query

#### Validate Targeting
```http
POST /api/audiences/targeting/validate?adAccountId={adAccountId}
Content-Type: application/json

{
  "targeting": {
    "age_min": 18,
    "age_max": 65,
    "geo_locations": {
      "countries": ["US"]
    }
  }
}
```

### Template Endpoints

#### Create Audience Template
```http
POST /api/audiences/templates
Content-Type: application/json

{
  "name": "Tech Enthusiasts Template",
  "description": "Template for targeting tech enthusiasts",
  "category": "Technology",
  "type": "SAVED",
  "targeting": {
    "age_min": 18,
    "age_max": 65,
    "interests": [
      { "id": "6003139266461", "name": "Technology" }
    ]
  },
  "configurableFields": ["age_min", "age_max", "geo_locations"],
  "isPublic": true,
  "tags": ["technology", "template"]
}
```

#### Get All Templates
```http
GET /api/audiences/templates?type=SAVED&category=Technology&isPublic=true
```

#### Get Template by ID
```http
GET /api/audiences/templates/{id}
```

#### Update Template
```http
PUT /api/audiences/templates/{id}
```

#### Delete Template
```http
DELETE /api/audiences/templates/{id}
```

#### Create Audience from Template
```http
POST /api/audiences/templates/{templateId}/create?adAccountId={adAccountId}
Content-Type: application/json

{
  "name": "My Custom Tech Audience",
  "targeting": {
    "age_min": 25,
    "age_max": 45,
    "geo_locations": {
      "countries": ["US", "CA"]
    }
  }
}
```

## Services

### FacebookAudienceService

Located at: `src/services/FacebookAudienceService.js`

**Methods:**
- `createCustomAudience(adAccountId, audienceData)` - Create custom audience on Facebook
- `addUsersToCustomAudience(customAudienceId, users, schema)` - Add users to custom audience
- `removeUsersFromCustomAudience(customAudienceId, users, schema)` - Remove users from custom audience
- `createLookalikeAudience(adAccountId, lookalikData)` - Create lookalike audience
- `getReachEstimate(adAccountId, targeting)` - Get audience reach estimate
- `getAudienceDetails(customAudienceId)` - Get audience details from Facebook
- `updateCustomAudience(customAudienceId, updateData)` - Update custom audience
- `deleteCustomAudience(customAudienceId)` - Delete custom audience
- `getTargetingSearch(adAccountId, type, query)` - Search for targeting options
- `validateTargeting(adAccountId, targeting)` - Validate targeting spec
- `hashData(data)` - Hash user data (SHA-256)
- `parseCSVData(csvData, schema)` - Parse CSV data for upload

### AudienceService

Located at: `src/services/audienceService.js`

**Methods:**
- `createAudience(audienceData, adAccountId)` - Create audience (DB + Facebook)
- `getAllAudiences(filters)` - Get all audiences with filters
- `getAudienceById(id)` - Get audience by ID
- `updateAudience(id, updateData)` - Update audience
- `deleteAudience(id)` - Soft delete audience
- `uploadUsersToAudience(id, csvData, schema)` - Upload CSV users to custom audience
- `getAudienceEstimate(targeting, adAccountId)` - Get reach estimate
- `createFromTemplate(templateId, customData, adAccountId)` - Create from template
- `getTargetingSuggestions(adAccountId, type, query)` - Get targeting suggestions
- `validateTargeting(adAccountId, targeting)` - Validate targeting

## Targeting Specification Format

The targeting specification follows Facebook's Marketing API format:

```json
{
  "age_min": 18,
  "age_max": 65,
  "genders": [1, 2],
  "geo_locations": {
    "countries": ["US", "CA"],
    "regions": [{"key": "3847"}],
    "cities": [{"key": "2418779"}]
  },
  "interests": [
    {"id": "6003139266461", "name": "Technology"}
  ],
  "behaviors": [
    {"id": "6015559470583", "name": "Early adopters"}
  ],
  "demographics": [...],
  "connections": [...],
  "excluded_connections": [...],
  "custom_audiences": [...],
  "excluded_custom_audiences": [...]
}
```

## Usage Examples

### Example 1: Create a Saved Audience

```javascript
const response = await fetch('/api/audiences?adAccountId=123456789', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Tech Savvy Millennials',
    description: 'Millennials interested in technology',
    type: 'SAVED',
    targeting: {
      age_min: 25,
      age_max: 40,
      genders: [1, 2],
      geo_locations: { countries: ['US'] },
      interests: [
        { id: '6003139266461', name: 'Technology' }
      ]
    },
    tags: ['millennials', 'technology']
  })
});
```

### Example 2: Upload CSV to Custom Audience

```javascript
const formData = new FormData();
formData.append('file', csvFile);
formData.append('schema', 'EMAIL');

const response = await fetch(`/api/audiences/${audienceId}/upload-csv`, {
  method: 'POST',
  body: formData
});
```

### Example 3: Get Reach Estimate

```javascript
const response = await fetch('/api/audiences/estimate?adAccountId=123456789', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    targeting: {
      age_min: 18,
      age_max: 65,
      geo_locations: { countries: ['US'] },
      interests: [{ id: '6003139266461', name: 'Technology' }]
    }
  })
});
```

### Example 4: Create Audience from Template

```javascript
const response = await fetch(`/api/audiences/templates/${templateId}/create?adAccountId=123456789`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'My Tech Audience',
    targeting: {
      geo_locations: { countries: ['US', 'CA'] }
    }
  })
});
```

## Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Error message describing what went wrong"
}
```

Common HTTP status codes:
- `200` - Success (GET, PUT, DELETE)
- `201` - Created (POST)
- `400` - Bad Request (invalid data)
- `404` - Not Found (resource doesn't exist)
- `500` - Internal Server Error

## Database Schema

The system automatically creates the following tables:

### audiences
- Primary key: id (UUID)
- Indexes on: type, status, template_id, tags (GIN)
- Foreign key: template_id → audience_templates(id)

### audience_templates
- Primary key: id (UUID)
- Indexes on: type, category, is_public, tags (GIN)

## Security Considerations

1. **Data Hashing**: User data (emails, phone numbers) is automatically hashed using SHA-256 before sending to Facebook
2. **File Upload Limits**: CSV uploads are limited to 10MB
3. **Batch Processing**: Large user lists are automatically split into 10,000-user batches
4. **Soft Deletes**: Audiences are soft-deleted to preserve data integrity

## Testing

Run the seed script to create sample data:

```bash
npm run seed
```

This will create:
- 3 Audience Templates
- 2 Sample Audiences

## Integration with Campaigns

Audiences can be used in Ad Sets through the `targeting` field. When creating an Ad Set, reference the audience targeting configuration:

```javascript
const adSetData = {
  name: 'My Ad Set',
  campaignId: 'campaign-uuid',
  targeting: audience.targeting,
  // ... other ad set fields
};
```

## Future Enhancements

Potential improvements:
- Audience combination (AND/OR logic)
- Audience exclusion lists
- Automated audience refresh
- Audience performance tracking
- Integration with CRM systems
- Webhook notifications for audience updates
