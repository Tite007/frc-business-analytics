# CMS Database Models

## SQLAlchemy Models (Python/FastAPI)

```python
from sqlalchemy import Column, String, Text, Integer, Boolean, DateTime, ForeignKey, Table
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from datetime import datetime
import uuid

Base = declarative_base()

# Association table for content-tags many-to-many relationship
content_tags_association = Table(
    'content_tag_relations',
    Base.metadata,
    Column('content_id', String(255), ForeignKey('content.id', ondelete='CASCADE')),
    Column('tag_id', String(255), ForeignKey('content_tags.id', ondelete='CASCADE'))
)

# Association table for content-media many-to-many relationship
content_media_association = Table(
    'content_attachments',
    Base.metadata,
    Column('content_id', String(255), ForeignKey('content.id', ondelete='CASCADE')),
    Column('media_file_id', String(255), ForeignKey('media_files.id', ondelete='CASCADE')),
    Column('attachment_type', String(100), default='attachment'),  # 'cover_image' or 'attachment'
    Column('sort_order', Integer, default=0)
)

class Category(Base):
    __tablename__ = 'categories'

    id = Column(String(255), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(255), nullable=False)
    description = Column(Text)
    type = Column(String(100), nullable=False)
    color = Column(String(50), default='blue')
    icon = Column(String(100))
    is_active = Column(Boolean, default=True)
    sort_order = Column(Integer, default=0)
    content_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    created_by = Column(String(255), nullable=False)

    # Relationships
    subcategories = relationship("Subcategory", back_populates="category", cascade="all, delete-orphan")
    content = relationship("Content", back_populates="category")

class Subcategory(Base):
    __tablename__ = 'subcategories'

    id = Column(String(255), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(255), nullable=False)
    description = Column(Text)
    category_id = Column(String(255), ForeignKey('categories.id', ondelete='CASCADE'), nullable=False)
    color = Column(String(50), default='gray')
    icon = Column(String(100))
    is_active = Column(Boolean, default=True)
    sort_order = Column(Integer, default=0)
    content_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    created_by = Column(String(255), nullable=False)

    # Relationships
    category = relationship("Category", back_populates="subcategories")
    content = relationship("Content", back_populates="subcategory")

class Content(Base):
    __tablename__ = 'content'

    id = Column(String(255), primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String(500), nullable=False)
    description = Column(Text)
    content = Column(Text, nullable=False)
    excerpt = Column(Text)

    # Categorization
    category_id = Column(String(255), ForeignKey('categories.id'), nullable=False)
    subcategory_id = Column(String(255), ForeignKey('subcategories.id'))

    # Status & Publishing
    status = Column(String(50), default='draft')  # draft, published, archived, under_review
    published_at = Column(DateTime)
    scheduled_at = Column(DateTime)

    # Authoring
    author_id = Column(String(255), nullable=False)
    editor_id = Column(String(255))

    # Content metadata
    word_count = Column(Integer, default=0)
    read_time = Column(Integer, default=0)  # in minutes

    # SEO
    slug = Column(String(500), unique=True, nullable=False)
    meta_title = Column(String(500))
    meta_description = Column(Text)

    # Analytics
    view_count = Column(Integer, default=0)
    download_count = Column(Integer, default=0)

    # Timestamps
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    # Relationships
    category = relationship("Category", back_populates="content")
    subcategory = relationship("Subcategory", back_populates="content")
    tags = relationship("ContentTag", secondary=content_tags_association, back_populates="content")
    media_files = relationship("MediaFile", secondary=content_media_association, back_populates="content")

class MediaFile(Base):
    __tablename__ = 'media_files'

    id = Column(String(255), primary_key=True, default=lambda: str(uuid.uuid4()))
    filename = Column(String(500), nullable=False)
    file_path = Column(String(1000), nullable=False)
    file_url = Column(String(1000), nullable=False)
    file_size = Column(Integer, nullable=False)  # in bytes
    mime_type = Column(String(255), nullable=False)
    file_type = Column(String(100), nullable=False)  # image, document, video, etc.
    alt_text = Column(Text)
    caption = Column(Text)
    uploaded_by = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=func.now())

    # Relationships
    content = relationship("Content", secondary=content_media_association, back_populates="media_files")

class ContentTag(Base):
    __tablename__ = 'content_tags'

    id = Column(String(255), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(255), nullable=False, unique=True)
    slug = Column(String(255), nullable=False, unique=True)
    description = Column(Text)
    color = Column(String(50))
    usage_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=func.now())

    # Relationships
    content = relationship("Content", secondary=content_tags_association, back_populates="tags")

# Analytics tables (optional, for detailed tracking)
class ContentView(Base):
    __tablename__ = 'content_views'

    id = Column(String(255), primary_key=True, default=lambda: str(uuid.uuid4()))
    content_id = Column(String(255), ForeignKey('content.id', ondelete='CASCADE'), nullable=False)
    user_id = Column(String(255))  # Can be null for anonymous views
    ip_address = Column(String(45))
    user_agent = Column(Text)
    referrer = Column(String(1000))
    read_time = Column(Integer)  # Time spent reading in seconds
    viewed_at = Column(DateTime, default=func.now())

class ContentDownload(Base):
    __tablename__ = 'content_downloads'

    id = Column(String(255), primary_key=True, default=lambda: str(uuid.uuid4()))
    content_id = Column(String(255), ForeignKey('content.id', ondelete='CASCADE'), nullable=False)
    media_file_id = Column(String(255), ForeignKey('media_files.id', ondelete='CASCADE'), nullable=False)
    user_id = Column(String(255))
    ip_address = Column(String(45))
    downloaded_at = Column(DateTime, default=func.now())
```

## Pydantic Models (Request/Response Schemas)

```python
from pydantic import BaseModel, validator
from typing import Optional, List
from datetime import datetime
from enum import Enum

class ContentStatus(str, Enum):
    DRAFT = "draft"
    PUBLISHED = "published"
    ARCHIVED = "archived"
    UNDER_REVIEW = "under_review"

class FileType(str, Enum):
    IMAGE = "image"
    DOCUMENT = "document"
    VIDEO = "video"
    AUDIO = "audio"

# Base schemas
class CategoryBase(BaseModel):
    name: str
    description: Optional[str] = None
    type: str
    color: str = "blue"
    icon: Optional[str] = None
    sort_order: int = 0

class CategoryCreate(CategoryBase):
    pass

class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    color: Optional[str] = None
    icon: Optional[str] = None
    sort_order: Optional[int] = None

class SubcategoryBase(BaseModel):
    name: str
    description: Optional[str] = None
    color: str = "gray"
    icon: Optional[str] = None
    sort_order: int = 0

class SubcategoryCreate(SubcategoryBase):
    category_id: str

class SubcategoryResponse(SubcategoryBase):
    id: str
    category_id: str
    is_active: bool
    content_count: int
    created_at: datetime
    updated_at: datetime
    created_by: str

    class Config:
        from_attributes = True

class CategoryResponse(CategoryBase):
    id: str
    is_active: bool
    content_count: int
    created_at: datetime
    updated_at: datetime
    created_by: str
    subcategories: List[SubcategoryResponse] = []

    class Config:
        from_attributes = True

# Content schemas
class ContentBase(BaseModel):
    title: str
    description: str
    content: str
    category_id: str
    subcategory_id: Optional[str] = None
    tags: List[str] = []
    status: ContentStatus = ContentStatus.DRAFT
    meta_title: Optional[str] = None
    meta_description: Optional[str] = None
    scheduled_at: Optional[datetime] = None

class ContentCreate(ContentBase):
    @validator('title')
    def title_must_not_be_empty(cls, v):
        if not v.strip():
            raise ValueError('Title cannot be empty')
        return v.strip()

class ContentUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    content: Optional[str] = None
    category_id: Optional[str] = None
    subcategory_id: Optional[str] = None
    tags: Optional[List[str]] = None
    status: Optional[ContentStatus] = None
    meta_title: Optional[str] = None
    meta_description: Optional[str] = None
    scheduled_at: Optional[datetime] = None

class MediaFileResponse(BaseModel):
    id: str
    filename: str
    file_url: str
    file_size: int
    mime_type: str
    file_type: str
    alt_text: Optional[str] = None
    caption: Optional[str] = None
    uploaded_by: str
    created_at: datetime

    class Config:
        from_attributes = True

class UserSummary(BaseModel):
    id: str
    name: str
    email: Optional[str] = None
    avatar_url: Optional[str] = None
    role: Optional[str] = None

class ContentResponse(ContentBase):
    id: str
    excerpt: Optional[str] = None
    published_at: Optional[datetime] = None
    author_id: str
    editor_id: Optional[str] = None
    word_count: int
    read_time: int
    slug: str
    view_count: int
    download_count: int
    created_at: datetime
    updated_at: datetime

    # Populated relationships
    category: Optional[CategoryResponse] = None
    subcategory: Optional[SubcategoryResponse] = None
    cover_image: Optional[MediaFileResponse] = None
    attachments: List[MediaFileResponse] = []
    author: Optional[UserSummary] = None
    editor: Optional[UserSummary] = None

    class Config:
        from_attributes = True

# List responses with pagination
class PaginationMeta(BaseModel):
    current_page: int
    per_page: int
    total: int
    total_pages: int
    has_next: bool
    has_prev: bool
    sort_by: Optional[str] = None
    sort_order: Optional[str] = None

class FilterOption(BaseModel):
    id: str
    name: str
    count: int

class ContentFilters(BaseModel):
    categories: List[FilterOption] = []
    statuses: List[dict] = []  # [{"status": "published", "count": 89}]
    authors: List[FilterOption] = []
    tags: List[dict] = []  # [{"name": "tag", "count": 12}]

class ContentListResponse(BaseModel):
    success: bool = True
    data: List[ContentResponse]
    meta: PaginationMeta
    filters: ContentFilters

class CategoryListResponse(BaseModel):
    success: bool = True
    data: List[CategoryResponse]
    meta: dict  # {"total": 4, "active": 4, "inactive": 0}

# Tag schemas
class TagBase(BaseModel):
    name: str
    description: Optional[str] = None
    color: Optional[str] = None

class TagCreate(TagBase):
    pass

class TagResponse(TagBase):
    id: str
    slug: str
    usage_count: int
    created_at: datetime

    class Config:
        from_attributes = True

class TagListResponse(BaseModel):
    success: bool = True
    data: List[TagResponse]
    meta: dict

# Media schemas
class MediaUploadResponse(BaseModel):
    success: bool = True
    data: MediaFileResponse
    message: str

class MediaListResponse(BaseModel):
    success: bool = True
    data: List[MediaFileResponse]
    meta: PaginationMeta

# Standard API responses
class SuccessResponse(BaseModel):
    success: bool = True
    message: str

class ErrorResponse(BaseModel):
    success: bool = False
    error: str
    message: str
    details: Optional[dict] = None
    status: int

class ValidationErrorResponse(BaseModel):
    success: bool = False
    error: str = "validation_error"
    message: str = "Validation failed"
    details: dict  # Field-level errors
    status: int = 422
```

## Database Triggers (PostgreSQL)

```sql
-- Trigger to automatically update content_count in categories
CREATE OR REPLACE FUNCTION update_category_content_count()
RETURNS TRIGGER AS $$
BEGIN
    -- Update category count
    IF TG_OP = 'INSERT' THEN
        UPDATE categories
        SET content_count = content_count + 1,
            updated_at = NOW()
        WHERE id = NEW.category_id;

        -- Update subcategory count if applicable
        IF NEW.subcategory_id IS NOT NULL THEN
            UPDATE subcategories
            SET content_count = content_count + 1,
                updated_at = NOW()
            WHERE id = NEW.subcategory_id;
        END IF;

        RETURN NEW;
    END IF;

    IF TG_OP = 'DELETE' THEN
        UPDATE categories
        SET content_count = content_count - 1,
            updated_at = NOW()
        WHERE id = OLD.category_id;

        -- Update subcategory count if applicable
        IF OLD.subcategory_id IS NOT NULL THEN
            UPDATE subcategories
            SET content_count = content_count - 1,
                updated_at = NOW()
            WHERE id = OLD.subcategory_id;
        END IF;

        RETURN OLD;
    END IF;

    IF TG_OP = 'UPDATE' THEN
        -- If category changed, update both old and new
        IF OLD.category_id != NEW.category_id THEN
            UPDATE categories
            SET content_count = content_count - 1,
                updated_at = NOW()
            WHERE id = OLD.category_id;

            UPDATE categories
            SET content_count = content_count + 1,
                updated_at = NOW()
            WHERE id = NEW.category_id;
        END IF;

        -- If subcategory changed, update both old and new
        IF OLD.subcategory_id IS DISTINCT FROM NEW.subcategory_id THEN
            IF OLD.subcategory_id IS NOT NULL THEN
                UPDATE subcategories
                SET content_count = content_count - 1,
                    updated_at = NOW()
                WHERE id = OLD.subcategory_id;
            END IF;

            IF NEW.subcategory_id IS NOT NULL THEN
                UPDATE subcategories
                SET content_count = content_count + 1,
                    updated_at = NOW()
                WHERE id = NEW.subcategory_id;
            END IF;
        END IF;

        RETURN NEW;
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
CREATE TRIGGER content_category_count_trigger
    AFTER INSERT OR UPDATE OR DELETE ON content
    FOR EACH ROW EXECUTE FUNCTION update_category_content_count();

-- Trigger to update tag usage count
CREATE OR REPLACE FUNCTION update_tag_usage_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE content_tags
        SET usage_count = usage_count + 1
        WHERE id = NEW.tag_id;
        RETURN NEW;
    END IF;

    IF TG_OP = 'DELETE' THEN
        UPDATE content_tags
        SET usage_count = usage_count - 1
        WHERE id = OLD.tag_id;
        RETURN OLD;
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger for tag relations
CREATE TRIGGER tag_usage_count_trigger
    AFTER INSERT OR DELETE ON content_tag_relations
    FOR EACH ROW EXECUTE FUNCTION update_tag_usage_count();

-- Trigger to auto-generate slug from title
CREATE OR REPLACE FUNCTION generate_content_slug()
RETURNS TRIGGER AS $$
BEGIN
    -- Generate slug from title if not provided
    IF NEW.slug IS NULL OR NEW.slug = '' THEN
        NEW.slug := lower(regexp_replace(
            regexp_replace(NEW.title, '[^\w\s-]', '', 'g'),
            '\s+', '-', 'g'
        ));

        -- Ensure uniqueness by appending number if needed
        WHILE EXISTS (SELECT 1 FROM content WHERE slug = NEW.slug AND id != COALESCE(NEW.id, '')) LOOP
            NEW.slug := NEW.slug || '-' || extract(epoch from now())::int;
        END LOOP;
    END IF;

    -- Calculate word count and read time
    NEW.word_count := array_length(string_to_array(NEW.content, ' '), 1);
    NEW.read_time := GREATEST(1, NEW.word_count / 200);  -- Assuming 200 words per minute

    -- Generate excerpt if not provided
    IF NEW.excerpt IS NULL OR NEW.excerpt = '' THEN
        NEW.excerpt := left(regexp_replace(NEW.description, '<[^>]*>', '', 'g'), 200) || '...';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger for content
CREATE TRIGGER content_auto_fields_trigger
    BEFORE INSERT OR UPDATE ON content
    FOR EACH ROW EXECUTE FUNCTION generate_content_slug();
```

## Indexes for Performance

```sql
-- Content indexes
CREATE INDEX idx_content_category_id ON content(category_id);
CREATE INDEX idx_content_subcategory_id ON content(subcategory_id);
CREATE INDEX idx_content_status ON content(status);
CREATE INDEX idx_content_published_at ON content(published_at DESC);
CREATE INDEX idx_content_author_id ON content(author_id);
CREATE INDEX idx_content_created_at ON content(created_at DESC);
CREATE INDEX idx_content_updated_at ON content(updated_at DESC);
CREATE INDEX idx_content_slug ON content(slug);

-- Full text search index
CREATE INDEX idx_content_search ON content USING gin(to_tsvector('english', title || ' ' || description || ' ' || content));

-- Category and subcategory indexes
CREATE INDEX idx_subcategories_category_id ON subcategories(category_id);
CREATE INDEX idx_categories_type ON categories(type);
CREATE INDEX idx_categories_is_active ON categories(is_active);

-- Media files indexes
CREATE INDEX idx_media_files_uploaded_by ON media_files(uploaded_by);
CREATE INDEX idx_media_files_file_type ON media_files(file_type);
CREATE INDEX idx_media_files_created_at ON media_files(created_at DESC);

-- Tag indexes
CREATE INDEX idx_content_tags_name ON content_tags(name);
CREATE INDEX idx_content_tags_slug ON content_tags(slug);
CREATE INDEX idx_content_tags_usage_count ON content_tags(usage_count DESC);

-- Analytics indexes
CREATE INDEX idx_content_views_content_id ON content_views(content_id);
CREATE INDEX idx_content_views_viewed_at ON content_views(viewed_at DESC);
CREATE INDEX idx_content_downloads_content_id ON content_downloads(content_id);
CREATE INDEX idx_content_downloads_downloaded_at ON content_downloads(downloaded_at DESC);
```

This complete database model structure provides:

1. **Full data integrity** with foreign keys and constraints
2. **Automatic counting** with database triggers
3. **Performance optimization** with strategic indexes
4. **Search capabilities** with full-text search indexes
5. **Analytics tracking** with dedicated tables
6. **Flexible categorization** with categories and subcategories
7. **Media management** with file metadata
8. **Tag system** with usage tracking
9. **SEO optimization** with meta fields
10. **Publishing workflow** with status management

The models maintain consistency with your existing FRC JSON response format while providing a robust foundation for the content management system.
