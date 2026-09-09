import { resolveAssetUrl } from '../config';
import type { Category } from '../types';

const categoryImages: Record<string, string> = {
  Groceries: '/legacy-uploads/2022/10/Groceries-1-150x150.jpg',
  Vegetables: '/legacy-uploads/2022/10/Groceries-2-150x150.jpg',
  Fruits: '/legacy-uploads/2022/10/Groceries-3-150x150.jpg',
  Dairy: '/legacy-uploads/2022/10/Groceries-4-150x150.jpg',
  Desserts: '/legacy-uploads/2022/10/FAVOURITE-FOOD-150x150.jpg',
  Snacks: '/legacy-uploads/2022/10/fast-food-6974507_1920-150x150.jpg',
  'Food Items': '/legacy-uploads/2022/10/FAVOURITE-FOOD-1-150x150.jpg',
  'Baby care': '/legacy-uploads/2022/10/Groceries-5-150x150.jpg',
  'Bakery Corner': '/legacy-uploads/2022/10/Groceries-6-150x150.jpg',
  Cosmetics: '/legacy-uploads/2022/10/Groceries-8-150x150.jpg',
  Flower: '/legacy-uploads/2022/10/Groceries-9-150x150.jpg',
  Footwear: '/legacy-uploads/2022/10/Groceries-10-150x150.jpg',
  Garments: '/legacy-uploads/2022/10/Groceries-11-150x150.jpg',
};

interface HomePageProps {
  categories: Category[];
  onOpenShop: () => void;
  onCategorySelect: (categoryId: string) => void;
}

const HomePage = ({ categories, onOpenShop, onCategorySelect }: HomePageProps) => (
  <>
    <section className="mb-8 rounded-xl bg-gradient-to-br from-[#164e28] to-[#75a843] px-13 py-16 text-white">
      <p className="m-0 text-xs font-extrabold uppercase tracking-widest">Welcome to Fuddins</p>
      <h1 className="my-2 max-w-[720px] text-[clamp(32px,5vw,54px)] leading-[1.08]">
        Everything you need, delivered simply.
      </h1>
      <p className="mb-6 text-lg">Browse daily essentials, food and more from one convenient place.</p>
      <button
        type="button"
        onClick={onOpenShop}
        className="rounded-md bg-white px-5 py-3 font-bold text-[#164e28]"
      >
        Start shopping
      </button>
    </section>

    <section className="rounded-xl bg-white p-7" aria-label="Shop by category">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="m-0 text-xs font-extrabold uppercase tracking-widest text-lime-600">Explore</p>
          <h2 className="mt-1 text-[#164e28]">Shop by category</h2>
        </div>
        <button
          type="button"
          onClick={onOpenShop}
          className="rounded-md bg-lime-600 px-5 py-3 font-bold text-white"
        >
          View all products
        </button>
      </div>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(98px,1fr))] gap-4">
        {categories.slice(0, 8).map((category) => {
          const src = resolveAssetUrl(categoryImages[category.name] || '/legacy-uploads/2022/10/FUDDINS-1-150x150.png');
          return (
            <button
              key={category.id}
              type="button"
              onClick={() => onCategorySelect(String(category.id))}
              className="flex min-h-[128px] flex-col items-center gap-2.5 rounded-lg border border-neutral-100 bg-white p-3.5 text-neutral-900"
            >
              {src ? <img src={src} alt="" className="h-[70px] w-[70px] object-contain" /> : null}
              <span className="text-center text-xs font-bold">{category.name}</span>
            </button>
          );
        })}
      </div>
    </section>
  </>
);

export default HomePage;