# Content Management System - Backend Documentation

## Overview

This document outlines the complete backend architecture, data models, and API endpoints required for the CMS content management system. The backend follows the same JSON response format used throughout the FRC Business Analytics platform.

## Table of Contents

1. [Data Models](#data-models)
2. [Database Schema](#database-schema)
3. [API Endpoints](#api-endpoints)
4. [Response Format](#response-format)
5. [Authentication & Authorization](#authentication--authorization)
6. [File Management](#file-management)
7. [Implementation Guidelines](#implementation-guidelines)

---

## Data Models

### 1. Category Model

```python
class Category(BaseModel):
    id: str  # UUID or slug (e.g., "research-reports")
    name: str  # Display name (e.g., "Research Reports")
    description: Optional[str]  # Category description
    type: str  # Category type identifier
    color: str  # UI color theme (e.g., "blue", "green")
    icon: Optional[str]  # Icon identifier for UI
    is_active: bool = True  # Whether category is active
    sort_order: int = 0  # Display order
    content_count: int = 0  # Number of content items
    created_at: datetime
    updated_at: datetime
    created_by: str  # User ID who created
    subcategories: List["Subcategory"] = []  # Related subcategories
```

### 2. Subcategory Model

```python
class Subcategory(BaseModel):
    id: str  # UUID or slug (e.g., "gold")
    name: str  # Display name (e.g., "Gold")
    description: Optional[str]  # Subcategory description
    category_id: str  # Parent category ID
    color: str  # UI color theme
    icon: Optional[str]  # Icon identifier
    is_active: bool = True
    sort_order: int = 0
    content_count: int = 0
    created_at: datetime
    updated_at: datetime
    created_by: str
```

### 3. Content Model

```python
class Content(BaseModel):
    id: str  # UUID
    title: str  # Content title
    description: str  # Brief description
    content: str  # Main content body (HTML/Markdown)
    excerpt: Optional[str]  # Auto-generated or manual excerpt

    # Categorization
    category_id: str  # Main category
    subcategory_id: Optional[str]  # Subcategory (if applicable)
    tags: List[str] = []  # Content tags

    # Status & Publishing
    status: str  # "draft", "published", "archived", "under_review"
    published_at: Optional[datetime]  # Publishing date
    scheduled_at: Optional[datetime]  # Scheduled publishing

    # Media & Files
    cover_image: Optional["MediaFile"]  # Cover image
    attachments: List["MediaFile"] = []  # Supporting files

    # Metadata
    author_id: str  # Content author
    editor_id: Optional[str]  # Last editor
    word_count: int = 0  # Automatic word count
    read_time: int = 0  # Estimated reading time (minutes)

    # SEO & Discovery
    slug: str  # URL slug
    meta_title: Optional[str]  # SEO title
    meta_description: Optional[str]  # SEO description

    # Analytics
    view_count: int = 0  # View count
    download_count: int = 0  # Download count

    # Timestamps
    created_at: datetime
    updated_at: datetime

    # Relationships
    category: Optional[Category]  # Populated category
    subcategory: Optional[Subcategory]  # Populated subcategory
    author: Optional["User"]  # Content author details
```

### 4. MediaFile Model

```python
class MediaFile(BaseModel):
    id: str  # UUID
    filename: str  # Original filename
    file_path: str  # Storage path
    file_url: str  # Access URL
    file_size: int  # Size in bytes
    mime_type: str  # MIME type
    file_type: str  # "image", "document", "video", etc.
    alt_text: Optional[str]  # Image alt text
    caption: Optional[str]  # File caption
    uploaded_by: str  # User ID
    created_at: datetime
```

### 5. ContentTag Model

```python
class ContentTag(BaseModel):
    id: str
    name: str  # Tag name
    slug: str  # URL-friendly slug
    description: Optional[str]
    color: Optional[str]  # UI color
    usage_count: int = 0  # How many times used
    created_at: datetime
```

---

## Database Schema

### PostgreSQL Tables

```sql
-- Categories table
CREATE TABLE categories (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(100) NOT NULL,
    color VARCHAR(50) DEFAULT 'blue',
    icon VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    content_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by VARCHAR(255) NOT NULL
);

-- Subcategories table
CREATE TABLE subcategories (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category_id VARCHAR(255) NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    color VARCHAR(50) DEFAULT 'gray',
    icon VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    content_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by VARCHAR(255) NOT NULL
);

-- Content table
CREATE TABLE content (
    id VARCHAR(255) PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    content TEXT NOT NULL,
    excerpt TEXT,
    category_id VARCHAR(255) NOT NULL REFERENCES categories(id),
    subcategory_id VARCHAR(255) REFERENCES subcategories(id),
    status VARCHAR(50) DEFAULT 'draft',
    published_at TIMESTAMP WITH TIME ZONE,
    scheduled_at TIMESTAMP WITH TIME ZONE,
    author_id VARCHAR(255) NOT NULL,
    editor_id VARCHAR(255),
    word_count INTEGER DEFAULT 0,
    read_time INTEGER DEFAULT 0,
    slug VARCHAR(500) UNIQUE NOT NULL,
    meta_title VARCHAR(500),
    meta_description TEXT,
    view_count INTEGER DEFAULT 0,
    download_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Media files table
CREATE TABLE media_files (
    id VARCHAR(255) PRIMARY KEY,
    filename VARCHAR(500) NOT NULL,
    file_path VARCHAR(1000) NOT NULL,
    file_url VARCHAR(1000) NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type VARCHAR(255) NOT NULL,
    file_type VARCHAR(100) NOT NULL,
    alt_text TEXT,
    caption TEXT,
    uploaded_by VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Content tags table
CREATE TABLE content_tags (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    color VARCHAR(50),
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Content-tags relationship table
CREATE TABLE content_tag_relations (
    content_id VARCHAR(255) REFERENCES content(id) ON DELETE CASCADE,
    tag_id VARCHAR(255) REFERENCES content_tags(id) ON DELETE CASCADE,
    PRIMARY KEY (content_id, tag_id)
);

-- Content attachments relationship table
CREATE TABLE content_attachments (
    content_id VARCHAR(255) REFERENCES content(id) ON DELETE CASCADE,
    media_file_id VARCHAR(255) REFERENCES media_files(id) ON DELETE CASCADE,
    attachment_type VARCHAR(100) DEFAULT 'attachment', -- 'cover_image', 'attachment'
    sort_order INTEGER DEFAULT 0,
    PRIMARY KEY (content_id, media_file_id)
);

-- Indexes for performance
CREATE INDEX idx_content_category ON content(category_id);
CREATE INDEX idx_content_subcategory ON content(subcategory_id);
CREATE INDEX idx_content_status ON content(status);
CREATE INDEX idx_content_published_at ON content(published_at);
CREATE INDEX idx_content_author ON content(author_id);
CREATE INDEX idx_subcategories_category ON subcategories(category_id);
```

---

## API Endpoints

### Base URL Structure

```
{BACKEND_URL}/api/cms/
```

### 1. Categories Management

#### GET /api/cms/categories

Get all categories with subcategories

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
      "subcategories": []
    }
  ],
  "meta": {
    "total": 4,
    "active": 4,
    "inactive": 0
  }
}
```

#### POST /api/cms/categories

Create new category

```json
// Request Body
{
  "name": "New Category",
  "description": "Category description",
  "type": "custom_type",
  "color": "purple",
  "icon": "FolderIcon"
}

// Response
{
  "success": true,
  "data": {
    "id": "new-category",
    "name": "New Category",
    // ... full category object
  },
  "message": "Category created successfully"
}
```

#### PUT /api/cms/categories/{id}

Update category

```json
// Request Body
{
  "name": "Updated Category Name",
  "description": "Updated description",
  "color": "green"
}

// Response
{
  "success": true,
  "data": {
    // ... updated category object
  },
  "message": "Category updated successfully"
}
```

#### DELETE /api/cms/categories/{id}

Delete category (only if no content exists)

```json
{
  "success": true,
  "message": "Category deleted successfully"
}
```

### 2. Subcategories Management

#### GET /api/cms/categories/{categoryId}/subcategories

Get subcategories for a category

#### POST /api/cms/categories/{categoryId}/subcategories

Create new subcategory

#### PUT /api/cms/subcategories/{id}

Update subcategory

#### DELETE /api/cms/subcategories/{id}

Delete subcategory

### 3. Content Management

#### GET /api/cms/content

Get all content with filtering and pagination

```json
// Query Parameters:
// ?page=1&limit=20&category=research-reports&subcategory=gold&status=published&search=keyword&sort_by=created_at&sort_order=desc

{
  "success": true,
  "data": [
    {
      "id": "content_123",
      "title": "Gold Market Analysis Q1 2024",
      "description": "Comprehensive analysis of gold market trends",
      "excerpt": "Gold prices have shown remarkable resilience...",
      "category_id": "mining",
      "subcategory_id": "gold",
      "tags": ["gold", "market-analysis", "Q1-2024"],
      "status": "published",
      "published_at": "2024-03-15T10:00:00Z",
      "cover_image": {
        "id": "img_123",
        "file_url": "https://storage.example.com/images/cover.jpg",
        "alt_text": "Gold market chart"
      },
      "author_id": "user_456",
      "word_count": 2500,
      "read_time": 10,
      "view_count": 150,
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
        "avatar_url": "https://storage.example.com/avatars/john.jpg"
      }
    }
  ],
  "meta": {
    "current_page": 1,
    "per_page": 20,
    "total": 125,
    "total_pages": 7,
    "has_next": true,
    "has_prev": false
  },
  "filters": {
    "categories": [
      {
        "id": "research-reports",
        "name": "Research Reports",
        "count": 45
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
    "tags": [
      {
        "name": "market-analysis",
        "count": 23
      }
    ]
  }
}
```

#### POST /api/cms/content

Create new content

```json
// Request Body (multipart/form-data for file uploads)
{
  "title": "New Research Report",
  "description": "Report description",
  "content": "Full content body...",
  "category_id": "research-reports",
  "subcategory_id": null,
  "tags": ["analysis", "market"],
  "status": "draft",
  "cover_image": "file_upload",
  "attachments": ["file_upload_1", "file_upload_2"]
}

// Response
{
  "success": true,
  "data": {
    // ... full content object
  },
  "message": "Content created successfully"
}
```

#### GET /api/cms/content/{id}

Get single content item with full details

#### PUT /api/cms/content/{id}

Update content

#### DELETE /api/cms/content/{id}

Delete content

#### POST /api/cms/content/{id}/publish

Publish content

#### POST /api/cms/content/{id}/archive

Archive content

### 4. File Management

#### POST /api/cms/media/upload

Upload media files

```json
// Response
{
  "success": true,
  "data": {
    "id": "file_123",
    "filename": "report.pdf",
    "file_url": "https://storage.example.com/files/report.pdf",
    "file_size": 1024000,
    "mime_type": "application/pdf",
    "file_type": "document"
  },
  "message": "File uploaded successfully"
}
```

#### GET /api/cms/media

Get uploaded media files with pagination

#### DELETE /api/cms/media/{id}

Delete media file

### 5. Tags Management

#### GET /api/cms/tags

Get all tags with usage count

#### POST /api/cms/tags

Create new tag

#### GET /api/cms/tags/suggestions?q=keyword

Get tag suggestions for autocomplete

---

## Response Format

All API responses follow the standard FRC format:

### Success Response

```json
{
  "success": true,
  "data": {}, // or []
  "message": "Operation completed successfully",
  "meta": {} // Optional metadata (pagination, counts, etc.)
}
```

### Error Response

```json
{
  "success": false,
  "error": "Error type",
  "message": "Human-readable error message",
  "details": {}, // Optional error details
  "status": 400 // HTTP status code
}
```

### Validation Error Response

```json
{
  "success": false,
  "error": "validation_error",
  "message": "Validation failed",
  "details": {
    "title": ["Title is required"],
    "category_id": ["Invalid category selected"]
  },
  "status": 422
}
```

---

## Authentication & Authorization

### Authentication

- All endpoints require valid JWT token in `Authorization: Bearer <token>` header
- Use existing FRC authentication system

### Authorization Levels

1. **Reader**: Can view published content
2. **Author**: Can create and edit own content
3. **Editor**: Can edit all content, manage categories
4. **Admin**: Full access to all CMS features

### Permission Matrix

```json
{
  "content": {
    "create": ["author", "editor", "admin"],
    "read": ["reader", "author", "editor", "admin"],
    "update": ["author_own", "editor", "admin"],
    "delete": ["author_own", "admin"],
    "publish": ["editor", "admin"]
  },
  "categories": {
    "create": ["editor", "admin"],
    "read": ["reader", "author", "editor", "admin"],
    "update": ["editor", "admin"],
    "delete": ["admin"]
  },
  "media": {
    "upload": ["author", "editor", "admin"],
    "delete": ["uploader", "admin"]
  }
}
```

---

## File Management

### Storage Configuration

- Use cloud storage (AWS S3, Google Cloud Storage, etc.)
- Organize files by type and date: `/cms/images/2024/03/filename.jpg`
- Generate unique filenames to prevent conflicts
- Support multiple file formats: images, PDFs, documents

### File Processing

- **Images**: Auto-generate thumbnails and multiple sizes
- **Documents**: Extract text for search indexing
- **Security**: Scan uploads for malware
- **Optimization**: Compress images automatically

### CDN Integration

- Serve files through CDN for performance
- Generate signed URLs for private content
- Cache static files with appropriate headers

---

## Implementation Guidelines

### 1. Database Considerations

- Use database triggers to automatically update `content_count` in categories
- Implement soft deletes for content (add `deleted_at` column)
- Use database transactions for multi-table operations
- Add full-text search indexes for content search

### 2. Performance Optimizations

- Implement Redis caching for frequently accessed data
- Use database connection pooling
- Add pagination to all list endpoints
- Implement lazy loading for relationships

### 3. Search Implementation

- Use Elasticsearch for advanced content search
- Index title, description, content, and tags
- Support fuzzy search and filters
- Implement search analytics

### 4. Background Jobs

- Use task queue (Celery/RQ) for:
  - File processing and thumbnail generation
  - Search index updates
  - Email notifications
  - Analytics data aggregation

### 5. API Rate Limiting

- Implement rate limiting per user/IP
- Different limits for different operations
- Graceful degradation under load

### 6. Monitoring & Logging

- Log all CRUD operations
- Monitor API performance
- Track user activities
- Set up alerts for errors

### 7. Backup & Recovery

- Regular database backups
- File storage backups
- Point-in-time recovery capability
- Disaster recovery plan

---

## Example Implementation (FastAPI)

```python
from fastapi import FastAPI, Depends, HTTPException, UploadFile
from sqlalchemy.orm import Session
from typing import List, Optional
import uuid

app = FastAPI()

@app.get("/api/cms/content", response_model=ContentListResponse)
async def get_content(
    page: int = 1,
    limit: int = 20,
    category: Optional[str] = None,
    subcategory: Optional[str] = None,
    status: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get content with filtering and pagination"""
    query = db.query(Content)

    # Apply filters
    if category:
        query = query.filter(Content.category_id == category)
    if subcategory:
        query = query.filter(Content.subcategory_id == subcategory)
    if status:
        query = query.filter(Content.status == status)
    if search:
        query = query.filter(
            Content.title.ilike(f"%{search}%") |
            Content.description.ilike(f"%{search}%")
        )

    # Apply pagination
    total = query.count()
    content = query.offset((page - 1) * limit).limit(limit).all()

    return {
        "success": True,
        "data": content,
        "meta": {
            "current_page": page,
            "per_page": limit,
            "total": total,
            "total_pages": math.ceil(total / limit)
        }
    }

@app.post("/api/cms/content", response_model=ContentResponse)
async def create_content(
    content_data: ContentCreate,
    cover_image: Optional[UploadFile] = None,
    attachments: List[UploadFile] = [],
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Create new content"""
    # Validate permissions
    if not has_permission(current_user, "content", "create"):
        raise HTTPException(403, "Insufficient permissions")

    # Process file uploads
    cover_image_obj = None
    if cover_image:
        cover_image_obj = await upload_file(cover_image, "cover_image")

    attachment_objs = []
    for attachment in attachments:
        attachment_obj = await upload_file(attachment, "attachment")
        attachment_objs.append(attachment_obj)

    # Create content
    content = Content(
        id=str(uuid.uuid4()),
        **content_data.dict(),
        author_id=current_user.id,
        slug=generate_slug(content_data.title),
        word_count=count_words(content_data.content),
        read_time=calculate_read_time(content_data.content)
    )

    db.add(content)
    db.commit()

    # Link files
    if cover_image_obj:
        link_media_to_content(content.id, cover_image_obj.id, "cover_image")

    for attachment_obj in attachment_objs:
        link_media_to_content(content.id, attachment_obj.id, "attachment")

    return {
        "success": True,
        "data": content,
        "message": "Content created successfully"
    }
```

This documentation provides a complete foundation for implementing the CMS backend that integrates seamlessly with your existing FRC Business Analytics platform while maintaining consistency with your current API patterns and response formats.
