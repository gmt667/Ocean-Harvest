import { collection, doc, getDocs, setDoc } from "firebase/firestore";
import { db } from "./firebase";
import { hashPassword } from "./utils";
import {
  UserRole,
  UserStatus,
  Product,
  Category,
  Service,
  Testimonial,
  FaqItem,
  GalleryItem,
  Setting,
  User
} from "./types";

export async function runSeeder() {
  try {
    // 1. Seed DEFAULT SETTINGS
    const settingsCol = collection(db, "settings");
    const settingsSnap = await getDocs(settingsCol);
    if (settingsSnap.empty) {
      const defaultSettings: Setting = {
        id: "global",
        companyName: "Ocean General Dealers",
        brandName: "Ocean's Harvest",
        email: "Oceangeneraldealers23@gmail.com",
        phone1: "+265 993 86 16 49",
        phone2: "+265 882 638 704",
        phone3: "+265 992 145 083",
        address: "P.O Box X273 Lilongwe",
        vatRate: 16.5,
        logoUrl: "https://images.unsplash.com/photo-1530982009887-a6538b8291a4?w=150&auto=format&fit=crop&q=60", // dynamic or custom placeholder
        primaryColor: "#022c22", // deep emerald-950
        secondaryColor: "#fbbf24", // bright amber-400
        heroTitle: "Sustaining Malawi with Premium Agricultural & Food Commodities",
        heroSubtitle: "Providing fresh, reliable, and high-quality grains, beans, livestock, and general supplies across the nation."
      };
      await setDoc(doc(db, "settings", "global"), defaultSettings);
      console.log("Seeded settings.");
    }

    // 2. Seed SUPER ADMINISTRATOR
    const usersCol = collection(db, "users");
    const usersSnap = await getDocs(usersCol);
    if (usersSnap.empty) {
      // Create admin user: admin@oceanharvest.com / Ocean@2026Admin
      const adminPassHash = await hashPassword("Ocean@2026Admin");
      const defaultAdmin: User = {
        uid: "superadmin_uid",
        email: "admin@oceanharvest.com",
        passwordHash: adminPassHash,
        name: "Super Administrator",
        role: UserRole.SUPER_ADMIN,
        status: UserStatus.ACTIVE,
        mustChangePassword: true, // forced password change on first login as required
        createdAt: new Date().toISOString()
      };
      await setDoc(doc(db, "users", "superadmin_uid"), defaultAdmin);
      console.log("Seeded Super Administrator.");
    }

    // 3. Seed CATEGORIES
    const categoriesCol = collection(db, "categories");
    const categoriesSnap = await getDocs(categoriesCol);
    const seededCategories: Category[] = [
      { id: "cat_grains", name: "Grains & Cereals", description: "Freshly harvested maize, rice, and key crops." },
      { id: "cat_beans", name: "Legumes & Beans", description: "Nutritious selection of dry beans and pulses." },
      { id: "cat_livestock", name: "Livestock & Poultry", description: "Healthy quails, chickens, and fresh farm eggs." },
      { id: "cat_sauces", name: "Sauces & Condiments", description: "Premium homemade style chili and garlic sauces." },
      { id: "cat_general", name: "General Supplies", description: "Various general trading and farm supplies." }
    ];
    const existingCatIds = new Set(categoriesSnap.docs.map(d => d.id));
    for (const cat of seededCategories) {
      if (!existingCatIds.has(cat.id)) {
        await setDoc(doc(db, "categories", cat.id), cat);
      }
    }
    console.log("Categories seeding check complete.");

    // 4. Seed PRODUCTS
    const productsCol = collection(db, "products");
    const productsSnap = await getDocs(productsCol);
    const existingProdIds = new Set(productsSnap.docs.map(d => d.id));
    const defaultProducts: Product[] = [
      {
        id: "prod_rice",
        name: "Premium Stone-Free Rice",
        description: "Clean, premium-quality rice carefully processed for households, retailers, wholesalers, hotels, and institutions.",
        category: "Grains & Cereals",
        imageUrl: "https://images.unsplash.com/photo-1536304997881-a372c179924b?w=600&auto=format&fit=crop&q=80",
        priceMwk: 12000,
        stockLevel: 150,
        unit: "5kg Bag",
        isFeatured: true
      },
      {
        id: "prod_kamtauzeni",
        name: "Kamtauzeni Beans",
        description: "Nutritious and delicious beans suitable for everyday meals.",
        category: "Legumes & Beans",
        imageUrl: "https://images.unsplash.com/photo-1551462147-ff29053bfc14?w=600&auto=format&fit=crop&q=80",
        priceMwk: 8500,
        stockLevel: 220,
        unit: "5kg Bag",
        isFeatured: true
      },
      {
        id: "prod_nanyati",
        name: "Nanyati Beans",
        description: "High-quality beans sourced from trusted suppliers.",
        category: "Legumes & Beans",
        imageUrl: "https://images.unsplash.com/photo-1614747761005-728b788e001f?w=600&auto=format&fit=crop&q=80",
        priceMwk: 9000,
        stockLevel: 180,
        unit: "5kg Bag",
        isFeatured: false
      },
      {
        id: "prod_kayera",
        name: "Kayera Beans",
        description: "Fresh and carefully selected beans for superior quality.",
        category: "Legumes & Beans",
        imageUrl: "https://images.unsplash.com/photo-1563865436874-9aef32095ffd?w=600&auto=format&fit=crop&q=80",
        priceMwk: 8000,
        stockLevel: 110,
        unit: "5kg Bag",
        isFeatured: false
      },
      {
        id: "prod_mixed_beans",
        name: "Mixed Beans",
        description: "A nutritious blend of different bean varieties.",
        category: "Legumes & Beans",
        imageUrl: "https://images.unsplash.com/photo-1547058886-af77d0fbe8e1?w=600&auto=format&fit=crop&q=80",
        priceMwk: 7500,
        stockLevel: 95,
        unit: "5kg Bag",
        isFeatured: false
      },
      {
        id: "prod_kidney_beans",
        name: "Red Kidney Beans",
        description: "Rich in protein and ideal for healthy diets.",
        category: "Legumes & Beans",
        imageUrl: "https://images.unsplash.com/photo-1582281298055-e25b84a30b44?w=600&auto=format&fit=crop&q=80",
        priceMwk: 9500,
        stockLevel: 4, // Trigger low stock alert (limit < 10)
        unit: "5kg Bag",
        isFeatured: true
      },
      {
        id: "prod_maize",
        name: "Maize",
        description: "Quality maize supplied to homes, schools, institutions, and businesses.",
        category: "Grains & Cereals",
        imageUrl: "https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?w=600&auto=format&fit=crop&q=80",
        priceMwk: 15000,
        stockLevel: 500,
        unit: "50kg Bag",
        isFeatured: true
      },
      {
        id: "prod_groundnuts",
        name: "Groundnuts",
        description: "Fresh, clean, and carefully selected groundnuts.",
        category: "Legumes & Beans",
        imageUrl: "https://images.unsplash.com/photo-1568254183919-78a4f43a2877?w=600&auto=format&fit=crop&q=80",
        priceMwk: 5000,
        stockLevel: 300,
        unit: "2kg Bag",
        isFeatured: false
      },
      {
        id: "prod_quails",
        name: "Zinziri (Quails)",
        description: "Healthy and professionally raised quails.",
        category: "Livestock & Poultry",
        imageUrl: "https://images.unsplash.com/photo-1612170153139-6f881ff067e0?w=600&auto=format&fit=crop&q=80",
        priceMwk: 1500,
        stockLevel: 120,
        unit: "Per Bird",
        isFeatured: true
      },
      {
        id: "prod_eggs",
        name: "Chicken Eggs",
        description: "Fresh farm eggs supplied consistently.",
        category: "Livestock & Poultry",
        imageUrl: "https://images.unsplash.com/photo-1516448620398-c5f44bf9f441?w=600&auto=format&fit=crop&q=80",
        priceMwk: 4500,
        stockLevel: 80,
        unit: "Tray of 30",
        isFeatured: true
      },
      {
        id: "prod_chilli_sauce",
        name: "Garlic Chilli Sauce",
        description: "Premium garlic chilli sauce made from quality ingredients.",
        category: "Sauces & Condiments",
        imageUrl: "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=600&auto=format&fit=crop&q=80",
        priceMwk: 2500,
        stockLevel: 150,
        unit: "500ml Bottle",
        isFeatured: true
      }
    ];
    for (const prod of defaultProducts) {
      if (!existingProdIds.has(prod.id)) {
        await setDoc(doc(db, "products", prod.id), prod);
      } else {
        // Automatically sync and update to the ultra-relatable images for pre-seeded records
        await setDoc(doc(db, "products", prod.id), { imageUrl: prod.imageUrl }, { merge: true });
      }
    }
    console.log("Products seeding check complete.");

    // 5. Seed SERVICES
    const servicesCol = collection(db, "services");
    const servicesSnap = await getDocs(servicesCol);
    if (servicesSnap.empty) {
      const defaultServices: Service[] = [
        {
          id: "srv_bulk_supply",
          title: "Bulk Supply & Distribution",
          description: "Consistent bulk deliveries of grains and legumes to wholesale businesses, hotels, and public institutions across Malawi.",
          iconName: "Truck"
        },
        {
          id: "srv_quality",
          title: "Premium Processing & Sourcing",
          description: "Rigorous cleaning and sorting of produce to ensure stone-free grains and pure agricultural commodities.",
          iconName: "ShieldCheck"
        },
        {
          id: "srv_contract",
          title: "Contract Farming Support",
          description: "Working alongside local Malawian farmers to provide guaranteed off-take, fostering long-term community relationships.",
          iconName: "Handshake"
        },
        {
          id: "srv_retail",
          title: "Supermarket & Retail Supply",
          description: "Packaging and supplying retail-ready commodities like quail eggs, chili sauce, and beans directly to supermarkets.",
          iconName: "ShoppingBag"
        }
      ];
      for (const srv of defaultServices) {
        await setDoc(doc(db, "services", srv.id), srv);
      }
      console.log("Seeded services.");
    }

    // 6. Seed TESTIMONIALS
    const testimonialsCol = collection(db, "testimonials");
    const testimonialsSnap = await getDocs(testimonialsCol);
    if (testimonialsSnap.empty) {
      const defaultTestimonials: Testimonial[] = [
        {
          id: "t_1",
          name: "Grace Phiri",
          role: "Procurement Officer, Lilongwe Inn",
          content: "The Premium Stone-Free Rice from Ocean Harvest has transformed our restaurant reviews. Clean, tasty, and never has stones! Delivery is always right on schedule.",
          rating: 5
        },
        {
          id: "t_2",
          name: "Chimwemwe Banda",
          role: "Owner, Lilongwe Wholesalers",
          content: "We purchase Kayera beans and Maize in bulk. Ocean General Dealers offers the best wholesale rates in Lilongwe, allowing us to maintain competitive margins.",
          rating: 5
        },
        {
          id: "t_3",
          name: "Tiyamike Gondwe",
          role: "Catering Director, St. Andrews Academy",
          content: "Supplying healthy quails and fresh eggs consistently is not easy, but Ocean Harvest delivers with exceptional professionalism week in and week out.",
          rating: 4
        }
      ];
      for (const test of defaultTestimonials) {
        await setDoc(doc(db, "testimonials", test.id), test);
      }
      console.log("Seeded testimonials.");
    }

    // 7. Seed FAQS
    const faqsCol = collection(db, "faqs");
    const faqsSnap = await getDocs(faqsCol);
    if (faqsSnap.empty) {
      const defaultFaqs: FaqItem[] = [
        {
          id: "faq_1",
          question: "Where is Ocean General Dealers located?",
          answer: "Our main warehouses and administrative offices are located in Lilongwe, Malawi. We supply businesses and customers nationwide."
        },
        {
          id: "faq_2",
          question: "What does 'Stone-Free' Rice mean?",
          answer: "It means our rice undergoes an advanced destoning and sorting process that removes 100% of pebbles and impurities, giving you clean, ready-to-cook premium rice."
        },
        {
          id: "faq_3",
          question: "Can I request a custom bulk quotation?",
          answer: "Yes, absolutely! Registered customers can request custom quotes directly through their portal. Alternatively, you can use the 'Request Quote' buttons on our public website."
        },
        {
          id: "faq_4",
          question: "Do you offer delivery across Malawi?",
          answer: "Yes, we have a robust transport and logistics network that services retailers, wholesalers, hotels, and schools in Blantyre, Lilongwe, Zomba, Mzuzu, and other locations."
        }
      ];
      for (const faq of defaultFaqs) {
        await setDoc(doc(db, "faqs", faq.id), faq);
      }
      console.log("Seeded FAQs.");
    }

    // 8. Seed GALLERY ITEMS
    const galleryCol = collection(db, "gallery");
    const gallerySnap = await getDocs(galleryCol);
    if (gallerySnap.empty) {
      const defaultGallery: GalleryItem[] = [
        {
          id: "gal_1",
          title: "Warehouse Inventory",
          category: "Warehouses",
          imageUrl: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600&auto=format&fit=crop&q=80",
          description: "Our organized storage warehouse in Lilongwe keeping products fresh and secure."
        },
        {
          id: "gal_2",
          title: "Product Sourcing Field",
          category: "Agricultural Sourcing",
          imageUrl: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=600&auto=format&fit=crop&q=80",
          description: "Working directly with local farmers in Malawi for sustainable produce."
        },
        {
          id: "gal_3",
          title: "Fresh Harvest Beans",
          category: "Fresh Produce",
          imageUrl: "https://images.unsplash.com/photo-1551462147-ff29053bfc14?w=600&auto=format&fit=crop&q=80",
          description: "Sorting Kayera and Nanyati beans carefully before bagging."
        },
        {
          id: "gal_4",
          title: "Delivery Dispatch",
          category: "Product Deliveries",
          imageUrl: "https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b?w=600&auto=format&fit=crop&q=80",
          description: "Our logistics team loading orders for nationwide transport."
        },
        {
          id: "gal_5",
          title: "Premium Rice Packaging",
          category: "Packaging Process",
          imageUrl: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&auto=format&fit=crop&q=80",
          description: "Automated bag sealing process to preserve freshness."
        }
      ];
      for (const gal of defaultGallery) {
        await setDoc(doc(db, "gallery", gal.id), gal);
      }
      console.log("Seeded gallery.");
    }
  } catch (err) {
    console.error("Error seeding database:", err);
  }
}
