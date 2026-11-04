<template>
  <q-page class="q-pa-lg">
    <div class="foodie-page">
      <!-- ===== Add Item Form ===== -->
      <q-card flat bordered class="q-mt-lg q-mb-lg">
        <q-card-section>
          <div class="text-h6 text-primary q-mb-md">Add New Dish</div>
          <q-form ref="addDishForm" class="add-dish-form" @submit.prevent="addItem">
            <div class="row q-col-gutter-md">
              <div class="col-12 col-sm-8">
                <q-input
                  v-model.trim="newItem.name"
                  outlined
                  dense
                  label="Dish name (e.g. Chicken Adobo)"
                  :rules="[(v: string) => !!v || 'Dish name is required']"
                />
              </div>
              <div class="col-12 col-sm-4">
                <q-select v-model="newItem.category" outlined dense :options="categories" label="Category" />
              </div>
            </div>
            <div
              class="image-dropzone"
              :class="{ 'has-image': isImage(newItem.emoji) }"
              role="button"
              tabindex="0"
              @click="imageInput?.click()"
              @keydown.enter.prevent="imageInput?.click()"
              @dragover.prevent
              @drop.prevent="handleImageDrop"
            >
              <img v-if="isImage(newItem.emoji)" :src="newItem.emoji" alt="Dish preview" />
              <template v-else>
                <div class="image-dropzone-plus">+</div>
                <div>Add image</div>
              </template>
              <input
                ref="imageInput"
                class="hidden-file-input"
                type="file"
                accept="image/*"
                @change="handleImageSelect"
              />
            </div>
            <div class="row q-col-gutter-md">
              <div class="col-12 col-sm-4">
                <q-input v-model.number="newItem.price" type="number" min="1" outlined dense label="Price (₱)" />
              </div>
              <div class="col-12 col-sm-5">
                <q-select
                  v-model="newItem.stock"
                  outlined
                  dense
                  emit-value
                  map-options
                  :options="stockOptions"
                  label="Stock"
                />
              </div>
              <div class="col-12 col-sm-3">
                <q-input v-model.trim="newItem.emoji" outlined dense maxlength="2" label="Emoji e.g. 🍜" />
              </div>
            </div>
            <q-btn type="submit" color="primary" no-caps label="➕ Add to Menu" />
          </q-form>
        </q-card-section>
      </q-card>

      <!-- ===== Stats ===== -->
      <div class="row q-col-gutter-md q-mb-lg">
        <div v-for="stat in stats" :key="stat.label" class="col-6 col-md-3">
          <q-card flat bordered class="text-center q-pa-md">
            <div class="text-h5 text-primary text-weight-bold">{{ stat.value }}</div>
            <div class="text-caption">{{ stat.label }}</div>
          </q-card>
        </div>
      </div>

      <!-- ===== Controls ===== -->
      <div class="row q-col-gutter-md items-center q-mb-lg">
        <div class="col-12 col-md-4">
          <q-input v-model="store.searchQuery" outlined dense clearable label="🔍 Search dish name..." />
        </div>
        <div class="col-6 col-md-3">
          <q-select v-model="store.selectedCategory" outlined dense :options="['All', ...categories]" label="Category" />
        </div>
        <div class="col-6 col-md-3">
          <q-select
            v-model="store.sortBy"
            outlined
            dense
            emit-value
            map-options
            :options="sortOptions"
            label="Sort"
          />
        </div>
        <div class="col-12 col-md-2">
          <q-checkbox v-model="store.showFavoritesOnly" label="Favorites only" />
        </div>
      </div>

      <!-- ===== Menu Grid ===== -->
      <transition-group name="list" tag="div" class="menu-grid-inner">
        <q-card
          v-for="item in store.filteredMenu"
          :key="item.id"
          flat
          bordered
          class="menu-card"
          :class="{ favorited: item.favorite }"
        >
          <q-card-section>
            <!-- edit mode -->
            <div v-if="editForm && editForm.id === item.id" class="q-gutter-sm">
              <q-input v-model.trim="editForm.name" outlined dense label="Dish name" />
              <q-select v-model="editForm.category" outlined dense :options="categories" label="Category" />
              <q-input v-model.number="editForm.price" type="number" min="1" outlined dense label="Price" />
              <q-select
                v-model="editForm.stock"
                outlined
                dense
                emit-value
                map-options
                :options="stockOptions"
                label="Stock"
              />
              <div class="row q-gutter-sm">
                <q-btn color="positive" no-caps dense class="col" label="💾 Save" @click="saveEdit" />
                <q-btn flat no-caps dense class="col" label="✖ Cancel" @click="editForm = null" />
              </div>
            </div>

            <!-- display mode -->
            <div v-else>
              <div class="row items-center justify-between">
                <img v-if="isImage(item.emoji)" class="dish-image" :src="item.emoji" alt="Dish image" />
                <span class="dish-emoji">{{ item.emoji || '🍲' }}</span>
                <div>
                  <q-btn flat round dense icon="edit" @click="startEdit(item)">
                    <q-tooltip>Edit this dish</q-tooltip>
                  </q-btn>
                  <q-btn
                    flat
                    round
                    dense
                    :icon="item.favorite ? 'star' : 'star_border'"
                    :color="item.favorite ? 'amber' : undefined"
                    @click="store.toggleFavorite(item.id)"
                  />
                </div>
              </div>

              <div class="text-subtitle1 text-weight-bold q-mt-sm">{{ item.name }}</div>
              <div class="text-caption text-primary text-weight-bold">{{ item.category }}</div>
              <div class="text-h6">₱{{ item.price.toFixed(2) }}</div>

              <div v-if="item.stock === 'available'" class="text-positive text-weight-medium q-mb-sm">✅ Available</div>
              <div v-else-if="item.stock === 'low'" class="text-warning text-weight-medium q-mb-sm">⚠️ Low Stock</div>
              <div v-else class="text-negative text-weight-medium q-mb-sm">❌ Out of Stock</div>

              <div class="row q-gutter-sm">
                <q-btn dense no-caps color="orange-2" text-color="deep-orange-9" class="col" label="🔄 Status" @click="store.cycleStock(item.id)" />
                <q-btn dense no-caps color="red-1" text-color="negative" class="col" label="🗑️ Remove" @click="removeItem(item)" />
              </div>
            </div>
          </q-card-section>
        </q-card>
      </transition-group>

      <div v-if="store.filteredMenu.length === 0" class="text-center q-pa-xl text-grey-7">
        😕 No dishes found. Try changing your search or filters.
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { computed, nextTick, ref } from 'vue';
import { Notify } from 'quasar';
import { useMenuStore, type Category, type MenuItem, type NewMenuItem } from '@/stores/menu-store';

const store = useMenuStore();

// ---------- Options ----------
const categories: Category[] = ['Appetizer', 'Main Course', 'Dessert', 'Beverage'];
const stockOptions = [
  { label: 'Available', value: 'available' },
  { label: 'Low Stock', value: 'low' },
  { label: 'Out of Stock', value: 'out' },
];
const sortOptions = [
  { label: 'Sort: Default', value: 'default' },
  { label: 'Sort: Name (A-Z)', value: 'name' },
  { label: 'Sort: Price (Low-High)', value: 'priceLow' },
  { label: 'Sort: Price (High-Low)', value: 'priceHigh' },
];

// ---------- Stats ----------
const stats = computed(() => [
  { label: 'Total Dishes', value: store.totalItems },
  { label: 'Favorites ⭐', value: store.favoriteCount },
  { label: 'Average Price', value: `₱${store.averagePrice.toFixed(2)}` },
  { label: 'Total Menu Value', value: `₱${store.totalMenuValue.toFixed(2)}` },
]);

// ---------- Add ----------
function emptyItem(): NewMenuItem {
  return { name: '', category: 'Appetizer', price: 0, stock: 'available', emoji: '' };
}
const newItem = ref<NewMenuItem>(emptyItem());
const addDishForm = ref<{ resetValidation: () => void } | null>(null);
const imageInput = ref<HTMLInputElement | null>(null);

function isImage(value: string) {
  return value.startsWith('data:image/');
}

function loadImage(file: File | undefined) {
  if (!file) return;
  if (!file.type.startsWith('image/')) {
    Notify.create({ type: 'negative', message: 'Please choose an image file.' });
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    if (typeof reader.result === 'string') newItem.value.emoji = reader.result;
  };
  reader.readAsDataURL(file);
}

function handleImageSelect(event: Event) {
  loadImage((event.target as HTMLInputElement).files?.[0]);
}

function handleImageDrop(event: DragEvent) {
  loadImage(event.dataTransfer?.files[0]);
}

async function addItem() {
  if (!newItem.value.name || !newItem.value.price) {
    Notify.create({ type: 'negative', message: 'Please fill in the dish name and price.' });
    return;
  }
  if (newItem.value.price <= 0) {
    Notify.create({ type: 'negative', message: 'Price must be greater than 0.' });
    return;
  }
  store.addItem({ ...newItem.value });
  Notify.create({ type: 'positive', message: `"${newItem.value.name}" added to the menu!` });
  newItem.value = emptyItem();
  if (imageInput.value) imageInput.value.value = '';
  await nextTick();
  addDishForm.value?.resetValidation();
}

// ---------- Remove ----------
function removeItem(item: MenuItem) {
  store.removeItem(item.id);
  Notify.create({ type: 'negative', message: `"${item.name}" removed from menu.` });
}

// ---------- Edit ----------
const editForm = ref<MenuItem | null>(null);

function startEdit(item: MenuItem) {
  editForm.value = { ...item };
}

function saveEdit() {
  const form = editForm.value;
  if (!form || !form.name || !form.price || form.price <= 0) {
    Notify.create({ type: 'negative', message: 'Please enter a valid name and price.' });
    return;
  }
  store.updateItem(form);
  Notify.create({ type: 'positive', message: `"${form.name}" updated.` });
  editForm.value = null;
}
</script>

<style lang="scss">
.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: scale(0.9);
}
</style>
