# CMS API Specification

## Base Configuration

```
Base URL: {BACKEND_URL}/api/cms
Content-Type: application/json
Authorization: Bearer <jwt_token>
```

## 1. Categories API

### GET /api/cms/categories

**Description**: Retrieve all categories with their subcategories
**Authentication**: Required
**Permissions**: read_categories

**Query Parameters**: None

**Response**:

```json
{
  "success": true,
  "data": [
    {
      "id": "research-reports",
      "name": "Research Reports",
      "description": "Comprehensive equity research reports and market analysis",
      "type": "research_report",
      "color": "blue",
      "icon": "DocumentTextIcon",
      "is_active": true,
      "sort_order": 0,
      "content_count": 45,
      "created_at": "2024-01-15T10:00:00Z",
      "updated_at": "2024-03-20T15:30:00Z",
      "created_by": "user_123",
      "subcategories": [
        {
          "id": "weekly-reports",
          "name": "Weekly Reports",
          "description": "Weekly market updates",
          "category_id": "research-reports",
          "color": "blue",
          "icon": "CalendarIcon",
          "is_active": true,
          "sort_order": 0,
          "content_count": 12,
          "created_at": "2024-01-20T10:00:00Z",
          "updated_at": "2024-03-20T15:30:00Z",
          "created_by": "user_123"
        }
      ]
    }
  ],
  "meta": {
    "total": 4,
    "active": 4,
    "inactive": 0
  }
}
```

### POST /api/cms/categories

**Description**: Create a new category
**Authentication**: Required
**Permissions**: create_categories

**Request Body**:

```json
{
  "name": "New Category",
  "description": "Detailed description of the category",
  "type": "custom_type",
  "color": "purple",
  "icon": "FolderIcon",
  "sort_order": 10
}
```

**Response**:

```json
{
  "success": true,
  "data": {
    "id": "new-category",
    "name": "New Category",
    "description": "Detailed description of the category",
    "type": "custom_type",
    "color": "purple",
    "icon": "FolderIcon",
    "is_active": true,
    "sort_order": 10,
    "content_count": 0,
    "created_at": "2024-08-30T10:00:00Z",
    "updated_at": "2024-08-30T10:00:00Z",
    "created_by": "user_456",
    "subcategories": []
  },
  "message": "Category created successfully"
}
```

### PUT /api/cms/categories/{id}

**Description**: Update an existing category
**Authentication**: Required
**Permissions**: update_categories

**Request Body**:

```json
{
  "name": "Updated Category Name",
  "description": "Updated description",
  "color": "green",
  "icon": "UpdatedIcon",
  "sort_order": 5
}
```

**Response**:

```json
{
  "success": true,
  "data": {
    "id": "category-id",
    "name": "Updated Category Name",
    "description": "Updated description",
    "type": "research_report",
    "color": "green",
    "icon": "UpdatedIcon",
    "is_active": true,
    "sort_order": 5,
    "content_count": 45,
    "created_at": "2024-01-15T10:00:00Z",
    "updated_at": "2024-08-30T10:00:00Z",
    "created_by": "user_123",
    "subcategories": []
  },
  "message": "Category updated successfully"
}
```

### DELETE /api/cms/categories/{id}

**Description**: Delete a category (only if no content exists)
**Authentication**: Required
**Permissions**: delete_categories

**Response**:

```json
{
  "success": true,
  "message": "Category deleted successfully"
}
```

**Error Response** (if category has content):

```json
{
  "success": false,
  "error": "category_has_content",
  "message": "Cannot delete category with existing content. Move or delete content first.",
  "details": {
    "content_count": 15
  },
  "status": 409
}
```

## 2. Subcategories API

### POST /api/cms/categories/{categoryId}/subcategories

**Description**: Create a new subcategory
**Authentication**: Required
**Permissions**: create_categories

**Request Body**:

```json
{
  "name": "Crypto Currencies",
  "description": "Cryptocurrency market analysis",
  "color": "emerald",
  "icon": "CurrencyDollarIcon",
  "sort_order": 0
}
```

**Response**:

```json
{
  "success": true,
  "data": {
    "id": "crypto-currencies",
    "name": "Crypto Currencies",
    "description": "Cryptocurrency market analysis",
    "category_id": "tech",
    "color": "emerald",
    "icon": "CurrencyDollarIcon",
    "is_active": true,
    "sort_order": 0,
    "content_count": 0,
    "created_at": "2024-08-30T10:00:00Z",
    "updated_at": "2024-08-30T10:00:00Z",
    "created_by": "user_456"
  },
  "message": "Subcategory created successfully"
}
```

### PUT /api/cms/subcategories/{id}

**Description**: Update a subcategory
**Authentication**: Required
**Permissions**: update_categories

### DELETE /api/cms/subcategories/{id}

**Description**: Delete a subcategory
**Authentication**: Required
**Permissions**: delete_categories

## 3. Content API

### GET /api/cms/content

**Description**: Retrieve content with filtering and pagination
**Authentication**: Required
**Permissions**: read_content

**Query Parameters**:

- `page` (int, default: 1): Page number
- `limit` (int, default: 20, max: 100): Items per page
- `category` (string): Filter by category ID
- `subcategory` (string): Filter by subcategory ID
- `status` (string): Filter by status (draft, published, archived)
- `author` (string): Filter by author ID
- `search` (string): Search in title, description, content
- `tags` (string): Comma-separated tag names
- `sort_by` (string, default: created_at): Sort field
- `sort_order` (string, default: desc): asc or desc
- `date_from` (string): Filter from date (ISO format)
- `date_to` (string): Filter to date (ISO format)

**Response**:

```json
{
  "success": true,
  "data": [
    {
      "id": "content_123",
      "title": "Gold Market Analysis Q1 2024",
      "description": "Comprehensive analysis of gold market trends and projections",
      "excerpt": "Gold prices have shown remarkable resilience amid global economic uncertainty...",
      "category_id": "mining",
      "subcategory_id": "gold",
      "tags": ["gold", "market-analysis", "Q1-2024", "commodities"],
      "status": "published",
      "published_at": "2024-03-15T10:00:00Z",
      "scheduled_at": null,
      "cover_image": {
        "id": "img_123",
        "filename": "gold-chart.jpg",
        "file_url": "https://storage.frc.com/cms/images/2024/03/gold-chart.jpg",
        "file_size": 245760,
        "mime_type": "image/jpeg",
        "alt_text": "Gold price chart showing Q1 2024 trends"
      },
      "author_id": "user_456",
      "editor_id": "user_789",
      "word_count": 2500,
      "read_time": 10,
      "slug": "gold-market-analysis-q1-2024",
      "view_count": 150,
      "download_count": 23,
      "created_at": "2024-03-10T09:00:00Z",
      "updated_at": "2024-03-15T10:00:00Z",
      "category": {
        "id": "mining",
        "name": "Mining",
        "color": "amber"
      },
      "subcategory": {
        "id": "gold",
        "name": "Gold",
        "color": "yellow"
      },
      "author": {
        "id": "user_456",
        "name": "John Analyst",
        "email": "john@frc.com",
        "avatar_url": "https://storage.frc.com/avatars/john.jpg"
      }
    }
  ],
  "meta": {
    "current_page": 1,
    "per_page": 20,
    "total": 125,
    "total_pages": 7,
    "has_next": true,
    "has_prev": false,
    "sort_by": "created_at",
    "sort_order": "desc"
  },
  "filters": {
    "categories": [
      {
        "id": "research-reports",
        "name": "Research Reports",
        "count": 45
      },
      {
        "id": "mining",
        "name": "Mining",
        "count": 38
      }
    ],
    "statuses": [
      {
        "status": "published",
        "count": 89
      },
      {
        "status": "draft",
        "count": 36
      }
    ],
    "authors": [
      {
        "id": "user_456",
        "name": "John Analyst",
        "count": 23
      }
    ],
    "tags": [
      {
        "name": "market-analysis",
        "count": 45
      },
      {
        "name": "gold",
        "count": 23
      }
    ]
  }
}
```

### POST /api/cms/content

**Description**: Create new content
**Authentication**: Required
**Permissions**: create_content
**Content-Type**: multipart/form-data (for file uploads)

**Request Body** (multipart/form-data):

```json
{
  "title": "New Research Report: Lithium Market Outlook",
  "description": "Comprehensive analysis of the lithium market for 2024",
  "content": "<h1>Executive Summary</h1><p>The lithium market continues to show...</p>",
  "category_id": "mining",
  "subcategory_id": "lithium",
  "tags": ["lithium", "market-outlook", "2024", "commodities"],
  "status": "draft",
  "meta_title": "Lithium Market Outlook 2024 - FRC Research",
  "meta_description": "Expert analysis on lithium market trends, supply chain, and investment opportunities for 2024",
  "scheduled_at": "2024-09-01T10:00:00Z",
  "cover_image": "file_upload",
  "attachments": ["file_upload_1", "file_upload_2"]
}
```

**Response**:

```json
{
  "success": true,
  "data": {
    "id": "content_456",
    "title": "New Research Report: Lithium Market Outlook",
    "description": "Comprehensive analysis of the lithium market for 2024",
    "content": "<h1>Executive Summary</h1><p>The lithium market continues to show...</p>",
    "excerpt": "Comprehensive analysis of the lithium market for 2024. The lithium market continues to show remarkable growth...",
    "category_id": "mining",
    "subcategory_id": "lithium",
    "tags": ["lithium", "market-outlook", "2024", "commodities"],
    "status": "draft",
    "published_at": null,
    "scheduled_at": "2024-09-01T10:00:00Z",
    "cover_image": {
      "id": "img_456",
      "filename": "lithium-cover.jpg",
      "file_url": "https://storage.frc.com/cms/images/2024/08/lithium-cover.jpg",
      "file_size": 187392,
      "mime_type": "image/jpeg",
      "alt_text": "Lithium mining operation"
    },
    "attachments": [
      {
        "id": "doc_123",
        "filename": "lithium-data-supplement.pdf",
        "file_url": "https://storage.frc.com/cms/documents/2024/08/lithium-data-supplement.pdf",
        "file_size": 2048576,
        "mime_type": "application/pdf"
      }
    ],
    "author_id": "user_789",
    "word_count": 3200,
    "read_time": 13,
    "slug": "new-research-report-lithium-market-outlook",
    "view_count": 0,
    "download_count": 0,
    "created_at": "2024-08-30T10:00:00Z",
    "updated_at": "2024-08-30T10:00:00Z"
  },
  "message": "Content created successfully"
}
```

### GET /api/cms/content/{id}

**Description**: Get single content item with full details
**Authentication**: Required
**Permissions**: read_content

**Response**:

```json
{
  "success": true,
  "data": {
    "id": "content_123",
    "title": "Gold Market Analysis Q1 2024",
    "description": "Comprehensive analysis of gold market trends and projections",
    "content": "<h1>Executive Summary</h1><p>Gold prices have shown remarkable resilience...</p>",
    "excerpt": "Gold prices have shown remarkable resilience amid global economic uncertainty...",
    "category_id": "mining",
    "subcategory_id": "gold",
    "tags": ["gold", "market-analysis", "Q1-2024", "commodities"],
    "status": "published",
    "published_at": "2024-03-15T10:00:00Z",
    "scheduled_at": null,
    "cover_image": {
      "id": "img_123",
      "filename": "gold-chart.jpg",
      "file_url": "https://storage.frc.com/cms/images/2024/03/gold-chart.jpg",
      "file_size": 245760,
      "mime_type": "image/jpeg",
      "alt_text": "Gold price chart showing Q1 2024 trends",
      "caption": "Gold price trends throughout Q1 2024"
    },
    "attachments": [
      {
        "id": "doc_456",
        "filename": "gold-market-data.xlsx",
        "file_url": "https://storage.frc.com/cms/documents/2024/03/gold-market-data.xlsx",
        "file_size": 512000,
        "mime_type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "caption": "Supporting market data and calculations"
      }
    ],
    "author_id": "user_456",
    "editor_id": "user_789",
    "word_count": 2500,
    "read_time": 10,
    "slug": "gold-market-analysis-q1-2024",
    "meta_title": "Gold Market Analysis Q1 2024 - Expert Insights",
    "meta_description": "Comprehensive analysis of gold market trends, price movements, and investment opportunities in Q1 2024",
    "view_count": 150,
    "download_count": 23,
    "created_at": "2024-03-10T09:00:00Z",
    "updated_at": "2024-03-15T10:00:00Z",
    "category": {
      "id": "mining",
      "name": "Mining",
      "color": "amber"
    },
    "subcategory": {
      "id": "gold",
      "name": "Gold",
      "color": "yellow"
    },
    "author": {
      "id": "user_456",
      "name": "John Analyst",
      "email": "john@frc.com",
      "avatar_url": "https://storage.frc.com/avatars/john.jpg",
      "role": "Senior Analyst"
    },
    "editor": {
      "id": "user_789",
      "name": "Sarah Editor",
      "email": "sarah@frc.com",
      "avatar_url": "https://storage.frc.com/avatars/sarah.jpg",
      "role": "Content Editor"
    }
  }
}
```

### PUT /api/cms/content/{id}

**Description**: Update existing content
**Authentication**: Required
**Permissions**: update_content (own) or update_all_content

**Request Body**: Same as POST but all fields optional

### DELETE /api/cms/content/{id}

**Description**: Delete content
**Authentication**: Required
**Permissions**: delete_content (own) or delete_all_content

**Response**:

```json
{
  "success": true,
  "message": "Content deleted successfully"
}
```

### POST /api/cms/content/{id}/publish

**Description**: Publish content
**Authentication**: Required
**Permissions**: publish_content

**Request Body**:

```json
{
  "publish_at": "2024-09-01T10:00:00Z" // Optional, defaults to now
}
```

**Response**:

```json
{
  "success": true,
  "data": {
    "id": "content_123",
    "status": "published",
    "published_at": "2024-09-01T10:00:00Z",
    "updated_at": "2024-08-30T10:00:00Z"
  },
  "message": "Content published successfully"
}
```

### POST /api/cms/content/{id}/archive

**Description**: Archive content
**Authentication**: Required
**Permissions**: archive_content

**Response**:

```json
{
  "success": true,
  "data": {
    "id": "content_123",
    "status": "archived",
    "updated_at": "2024-08-30T10:00:00Z"
  },
  "message": "Content archived successfully"
}
```

## 4. Media Management API

### POST /api/cms/media/upload

**Description**: Upload media files
**Authentication**: Required
**Permissions**: upload_media
**Content-Type**: multipart/form-data

**Request Body**:

```
file: [File]
alt_text: "Alternative text for accessibility"
caption: "File caption or description"
```

**Response**:

```json
{
  "success": true,
  "data": {
    "id": "file_789",
    "filename": "market-report.pdf",
    "file_path": "/cms/documents/2024/08/market-report.pdf",
    "file_url": "https://storage.frc.com/cms/documents/2024/08/market-report.pdf",
    "file_size": 1024000,
    "mime_type": "application/pdf",
    "file_type": "document",
    "alt_text": "Market analysis report",
    "caption": "Comprehensive market analysis for Q3 2024",
    "uploaded_by": "user_456",
    "created_at": "2024-08-30T10:00:00Z"
  },
  "message": "File uploaded successfully"
}
```

### GET /api/cms/media

**Description**: Get uploaded media files with pagination
**Authentication**: Required
**Permissions**: read_media

**Query Parameters**:

- `page` (int, default: 1): Page number
- `limit` (int, default: 20): Items per page
- `file_type` (string): Filter by file type (image, document, video)
- `search` (string): Search in filename, alt_text, caption
- `uploaded_by` (string): Filter by uploader ID
- `date_from` (string): Filter from date
- `date_to` (string): Filter to date

**Response**:

```json
{
  "success": true,
  "data": [
    {
      "id": "file_789",
      "filename": "market-report.pdf",
      "file_url": "https://storage.frc.com/cms/documents/2024/08/market-report.pdf",
      "file_size": 1024000,
      "mime_type": "application/pdf",
      "file_type": "document",
      "alt_text": "Market analysis report",
      "caption": "Comprehensive market analysis for Q3 2024",
      "uploaded_by": "user_456",
      "created_at": "2024-08-30T10:00:00Z",
      "uploader": {
        "id": "user_456",
        "name": "John Analyst"
      }
    }
  ],
  "meta": {
    "current_page": 1,
    "per_page": 20,
    "total": 45,
    "total_pages": 3
  }
}
```

### DELETE /api/cms/media/{id}

**Description**: Delete media file
**Authentication**: Required
**Permissions**: delete_media (own) or delete_all_media

**Response**:

```json
{
  "success": true,
  "message": "Media file deleted successfully"
}
```

## 5. Tags API

### GET /api/cms/tags

**Description**: Get all tags with usage count
**Authentication**: Required
**Permissions**: read_tags

**Query Parameters**:

- `search` (string): Search tag names
- `limit` (int): Limit results
- `min_usage` (int): Minimum usage count

**Response**:

```json
{
  "success": true,
  "data": [
    {
      "id": "tag_123",
      "name": "market-analysis",
      "slug": "market-analysis",
      "description": "Content related to market analysis and trends",
      "color": "blue",
      "usage_count": 45,
      "created_at": "2024-01-15T10:00:00Z"
    }
  ],
  "meta": {
    "total": 156,
    "most_used": 45,
    "least_used": 1
  }
}
```

### POST /api/cms/tags

**Description**: Create new tag
**Authentication**: Required
**Permissions**: create_tags

**Request Body**:

```json
{
  "name": "cryptocurrency",
  "description": "Content related to cryptocurrency markets",
  "color": "purple"
}
```

### GET /api/cms/tags/suggestions

**Description**: Get tag suggestions for autocomplete
**Authentication**: Required
**Permissions**: read_tags

**Query Parameters**:

- `q` (string): Search query
- `limit` (int, default: 10): Maximum suggestions

**Response**:

```json
{
  "success": true,
  "data": [
    {
      "name": "cryptocurrency",
      "usage_count": 12
    },
    {
      "name": "crypto-analysis",
      "usage_count": 8
    }
  ]
}
```

## 6. Analytics API

### GET /api/cms/analytics/content/{id}

**Description**: Get content analytics
**Authentication**: Required
**Permissions**: read_analytics

**Response**:

```json
{
  "success": true,
  "data": {
    "content_id": "content_123",
    "views": {
      "total": 150,
      "today": 5,
      "this_week": 23,
      "this_month": 67
    },
    "downloads": {
      "total": 23,
      "today": 1,
      "this_week": 4,
      "this_month": 12
    },
    "engagement": {
      "avg_read_time": 7.5,
      "bounce_rate": 0.23,
      "completion_rate": 0.78
    },
    "traffic_sources": [
      {
        "source": "direct",
        "views": 89
      },
      {
        "source": "search",
        "views": 45
      }
    ]
  }
}
```

## Error Responses

### 400 Bad Request

```json
{
  "success": false,
  "error": "bad_request",
  "message": "Invalid request data",
  "details": {
    "field": "category_id",
    "issue": "Category does not exist"
  },
  "status": 400
}
```

### 401 Unauthorized

```json
{
  "success": false,
  "error": "unauthorized",
  "message": "Authentication required",
  "status": 401
}
```

### 403 Forbidden

```json
{
  "success": false,
  "error": "forbidden",
  "message": "Insufficient permissions to perform this action",
  "details": {
    "required_permission": "create_content",
    "user_permissions": ["read_content"]
  },
  "status": 403
}
```

### 404 Not Found

```json
{
  "success": false,
  "error": "not_found",
  "message": "Content not found",
  "status": 404
}
```

### 422 Validation Error

```json
{
  "success": false,
  "error": "validation_error",
  "message": "Validation failed",
  "details": {
    "title": ["Title is required", "Title must be at least 5 characters"],
    "category_id": ["Invalid category selected"]
  },
  "status": 422
}
```

### 500 Internal Server Error

```json
{
  "success": false,
  "error": "internal_server_error",
  "message": "An unexpected error occurred",
  "status": 500
}
```
