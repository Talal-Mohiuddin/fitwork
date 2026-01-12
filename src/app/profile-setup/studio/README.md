# Studio Profile Setup Page

## Overview
This is a comprehensive studio profile setup page that allows studios to create and manage their profile information with draft/publish functionality.

## Features

### ✅ Implemented
1. **Multi-step Form Navigation** - 6 sections with visual progress tracking
2. **Identity & Brand** - Logo upload, studio name, about section
3. **Contact & Location** - Address, city, state, zip, website, Instagram
4. **Class Styles & Amenities** - Multiple class types and facility amenities
5. **Instructor Experience** - Music policy, equipment, onboarding requirements
6. **Compensation & Perks** - Pay transparency, pay range, pay model, benefits
7. **Studio Gallery** - Multiple photo uploads with preview
8. **Draft/Publish Functionality** - Save progress as draft or publish when complete
9. **Firebase Integration** - Automatic data persistence and loading
10. **Image Upload** - Base64 encoding with Firebase Storage integration
11. **Progress Tracking** - Real-time completion percentage
12. **Section Validation** - Check marks for completed sections

## File Structure

```
/src/app/profile-setup/studio/
├── page.tsx                                  # Main page component
└── _components/
    ├── IdentityBrandSection.tsx             # Logo, name, about
    ├── ContactLocationSection.tsx           # Address, contact info
    ├── ClassStylesSection.tsx               # Class types, amenities
    ├── InstructorExperienceSection.tsx      # Music policy, equipment
    ├── CompensationPerksSection.tsx         # Pay, benefits
    └── StudioGallerySection.tsx             # Photo gallery

/src/types/index.ts                           # Extended StudioProfileSetup type
/src/services/studioService.ts                # Firebase CRUD operations
/src/components/ui/                           # UI components (Progress, Badge, etc.)
/src/hooks/use-toast.ts                       # Toast notification hook
```

## Usage

Navigate to `/profile-setup/studio` to access the studio profile setup page.

### Save Draft
Click "Save Draft" to save progress without publishing. The profile status will be set to 'draft'.

### Publish Profile
Click "Publish Profile" to make the studio profile live. All sections must be completed before publishing.

### Auto-Save
Data is automatically loaded when the page loads if a profile exists for the authenticated user.

## Data Flow

1. User authentication via Firebase Auth
2. Profile data loaded from Firestore `/studios/{userId}` collection
3. Form updates stored in local state
4. Save Draft/Publish triggers Firebase write operations
5. Images converted to base64 and uploaded to Firebase Storage
6. Profile mapped to standard fields for compatibility

## Firebase Schema

```typescript
{
  // Identity
  logo: string,
  studio_name: string,
  about_studio: string,
  
  // Location
  street_address: string,
  city: string,
  state: string,
  zip_code: string,
  location: string, // full address
  website: string,
  instagram: string,
  
  // Classes & Amenities
  class_types: string[],
  member_amenities: string[],
  
  // Instructor Experience
  music_policy: 'instructor_choice' | 'studio_playlist' | 'mixed_model',
  tools_equipment: string[],
  onboarding_requirements: {
    audition_required: boolean,
    paid_training: boolean
  },
  
  // Compensation
  pay_transparency: boolean,
  base_pay_min: number,
  base_pay_max: number,
  pay_model: 'flat_rate' | 'tiered' | 'hourly',
  additional_perks: string[],
  
  // Gallery
  gallery_photos: string[],
  
  // Status
  status: 'draft' | 'published',
  profile_completed: boolean,
  created_at: timestamp,
  updated_at: timestamp
}
```

## Dependencies

- Firebase (Auth, Firestore, Storage)
- Radix UI (Progress, Badge, Checkbox, Radio Group, Label)
- Lucide React (Icons)
- Next.js (App Router)
- TailwindCSS (Styling)

## Future Enhancements

- [ ] Google Maps integration for location preview
- [ ] Real-time preview modal
- [ ] Auto-save draft every N seconds
- [ ] Image optimization and compression
- [ ] Drag-and-drop photo reordering
- [ ] Analytics integration
- [ ] SEO metadata management
