// Seeded dummy data for the app
import { v4 as uuidv4 } from 'uuid'
import {
  LOCAL_AVATARS,
  PRODUCT_IMAGE_BY_ID,
  WARDROBE_IMAGE_BY_NAME,
} from './localImages'
import {
  getDefaultPhysicalProfile,
  getDefaultStyleTaste,
} from './styleProfileData'

export const DEMO_USER = {
  id: 'user-demo-001',
  name: 'Alex Morgan',
  email: 'demo@aura.ai',
  password: 'demo1234',
  createdAt: '2024-01-15T10:00:00.000Z',
  preferences: { darkMode: false, defaultOccasion: 'Casual', temperatureUnit: 'C' },
  physicalProfile: {
    ...getDefaultPhysicalProfile(),
    heightCm: 172,
    weightKg: 70,
    fitPreference: 'regular',
  },
  styleTaste: {
    ...getDefaultStyleTaste(),
    likedTrendIds: ['smart-casual-core', 'quiet-luxury'],
    lastUpdated: '2026-04-20T09:00:00.000Z',
  },
  avatar: LOCAL_AVATARS.demo,
}

const today = new Date()
const daysAgo = (n) => new Date(today - n * 86400000).toISOString()

export const INITIAL_WARDROBE = [
  {
    id: uuidv4(), name: 'White Oxford Shirt', type: 'top', categoryLabel: 'Shirt',
    color: '#F5F5F5', imageUrl: WARDROBE_IMAGE_BY_NAME['White Oxford Shirt'],
    lastWorn: daysAgo(2), favorite: true, inLaundry: false, tags: ['work', 'formal'], createdAt: daysAgo(60), updatedAt: daysAgo(2),
  },
  {
    id: uuidv4(), name: 'Navy Blazer', type: 'outer', categoryLabel: 'Blazer',
    color: '#1E3A5F', imageUrl: WARDROBE_IMAGE_BY_NAME['Navy Blazer'],
    lastWorn: daysAgo(5), favorite: true, inLaundry: false, tags: ['work', 'formal', 'smart'], createdAt: daysAgo(90), updatedAt: daysAgo(5),
  },
  {
    id: uuidv4(), name: 'Grey Chinos', type: 'bottom', categoryLabel: 'Chinos',
    color: '#9E9E9E', imageUrl: WARDROBE_IMAGE_BY_NAME['Grey Chinos'],
    lastWorn: daysAgo(3), favorite: false, inLaundry: true, tags: ['work', 'casual'], createdAt: daysAgo(80), updatedAt: daysAgo(3),
  },
  {
    id: uuidv4(), name: 'Classic White Tee', type: 'top', categoryLabel: 'T-Shirt',
    color: '#FFFFFF', imageUrl: WARDROBE_IMAGE_BY_NAME['Classic White Tee'],
    lastWorn: daysAgo(1), favorite: false, inLaundry: true, tags: ['casual', 'basic'], createdAt: daysAgo(120), updatedAt: daysAgo(1),
  },
  {
    id: uuidv4(), name: 'Slim Fit Jeans', type: 'bottom', categoryLabel: 'Jeans',
    color: '#1565C0', imageUrl: WARDROBE_IMAGE_BY_NAME['Slim Fit Jeans'],
    lastWorn: daysAgo(4), favorite: true, inLaundry: false, tags: ['casual', 'denim'], createdAt: daysAgo(100), updatedAt: daysAgo(4),
  },
  {
    id: uuidv4(), name: 'White Sneakers', type: 'shoes', categoryLabel: 'Sneakers',
    color: '#FAFAFA', imageUrl: WARDROBE_IMAGE_BY_NAME['White Sneakers'],
    lastWorn: daysAgo(1), favorite: true, inLaundry: false, tags: ['casual', 'sport'], createdAt: daysAgo(150), updatedAt: daysAgo(1),
  },
  {
    id: uuidv4(), name: 'Brown Leather Boots', type: 'shoes', categoryLabel: 'Boots',
    color: '#795548', imageUrl: WARDROBE_IMAGE_BY_NAME['Brown Leather Boots'],
    lastWorn: daysAgo(7), favorite: false, inLaundry: false, tags: ['work', 'formal'], createdAt: daysAgo(200), updatedAt: daysAgo(7),
  },
  {
    id: uuidv4(), name: 'Black Watch', type: 'accessories', categoryLabel: 'Watch',
    color: '#212121', imageUrl: WARDROBE_IMAGE_BY_NAME['Black Watch'],
    lastWorn: daysAgo(0), favorite: true, inLaundry: false, tags: ['formal', 'accessory'], createdAt: daysAgo(180), updatedAt: daysAgo(0),
  },
  {
    id: uuidv4(), name: 'Striped Polo', type: 'top', categoryLabel: 'Polo',
    color: '#E3F2FD', imageUrl: WARDROBE_IMAGE_BY_NAME['Striped Polo'],
    lastWorn: daysAgo(6), favorite: false, inLaundry: false, tags: ['casual', 'smart-casual'], createdAt: daysAgo(70), updatedAt: daysAgo(6),
  },
  {
    id: uuidv4(), name: 'Black Joggers', type: 'bottom', categoryLabel: 'Joggers',
    color: '#212121', imageUrl: WARDROBE_IMAGE_BY_NAME['Black Joggers'],
    lastWorn: daysAgo(2), favorite: false, inLaundry: true, tags: ['sport', 'casual'], createdAt: daysAgo(50), updatedAt: daysAgo(2),
  },
  {
    id: uuidv4(), name: 'Olive Bomber Jacket', type: 'outer', categoryLabel: 'Jacket',
    color: '#556B2F', imageUrl: WARDROBE_IMAGE_BY_NAME['Olive Bomber Jacket'],
    lastWorn: daysAgo(10), favorite: true, inLaundry: false, tags: ['casual', 'streetwear'], createdAt: daysAgo(110), updatedAt: daysAgo(10),
  },
  {
    id: uuidv4(), name: 'Leather Belt', type: 'accessories', categoryLabel: 'Belt',
    color: '#4E342E', imageUrl: WARDROBE_IMAGE_BY_NAME['Leather Belt'],
    lastWorn: daysAgo(3), favorite: false, inLaundry: false, tags: ['formal', 'accessory'], createdAt: daysAgo(250), updatedAt: daysAgo(3),
  },
]

export const PRODUCT_RECOMMENDATIONS = [
  {
    id: 'prod-1', name: 'Essential Linen Shirt', price: '$49', brand: 'Basics Co.',
    imageUrl: PRODUCT_IMAGE_BY_ID['prod-1'],
    category: 'top',
  },
  {
    id: 'prod-2', name: 'Tailored Trousers', price: '$89', brand: 'FormFit',
    imageUrl: PRODUCT_IMAGE_BY_ID['prod-2'],
    category: 'bottom',
  },
  {
    id: 'prod-3', name: 'Minimalist Loafers', price: '$129', brand: 'Step & Co.',
    imageUrl: PRODUCT_IMAGE_BY_ID['prod-3'],
    category: 'shoes',
  },
  {
    id: 'prod-4', name: 'Canvas Tote Bag', price: '$35', brand: 'Carry All',
    imageUrl: PRODUCT_IMAGE_BY_ID['prod-4'],
    category: 'accessories',
  },
]

export const DEMO_WARDROBE_MEDIA = Object.fromEntries(
  INITIAL_WARDROBE.map((item) => [item.name, item.imageUrl]),
)
