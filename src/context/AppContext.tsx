import React, { createContext, useContext, useState, useEffect } from "react";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  where,
  limit
} from "firebase/firestore";
import { db, auth, OperationType, handleFirestoreError } from "../firebase";
import {
  signInWithPopup,
  GoogleAuthProvider,
  FacebookAuthProvider,
  OAuthProvider,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signInWithEmailAndPassword,
  User as FirebaseUser
} from "firebase/auth";
import { runSeeder } from "../seeder";
import { hashPassword, generateId } from "../utils";
import {
  User,
  Product,
  Category,
  Order,
  Quotation,
  InventoryTransaction,
  GalleryItem,
  Testimonial,
  Service,
  NewsItem,
  FaqItem,
  ContactMessage,
  NewsletterSubscriber,
  NotificationItem,
  AuditLogItem,
  Setting,
  UserRole,
  UserStatus,
  OrderStatus,
  InventoryTransactionType,
  QuotationStatus
} from "../types";

interface AppContextType {
  currentUser: User | null;
  settings: Setting | null;
  products: Product[];
  categories: Category[];
  orders: Order[];
  quotations: Quotation[];
  inventoryTransactions: InventoryTransaction[];
  galleryItems: GalleryItem[];
  testimonials: Testimonial[];
  services: Service[];
  newsItems: NewsItem[];
  faqs: FaqItem[];
  contactMessages: ContactMessage[];
  newsletterSubscribers: NewsletterSubscriber[];
  notifications: NotificationItem[];
  auditLogs: AuditLogItem[];
  users: User[];
  loading: boolean;
  
  // Auth Functions
  login: (email: string, passwordPlain: string) => Promise<{ success: boolean; error?: string; user?: User }>;
  loginWithGoogle: () => Promise<{ success: boolean; error?: string; user?: User }>;
  loginWithFacebook: () => Promise<{ success: boolean; error?: string; user?: User }>;
  loginWithApple: () => Promise<{ success: boolean; error?: string; user?: User }>;
  logout: () => Promise<void>;
  register: (name: string, email: string, passwordPlain: string, phone: string) => Promise<{ success: boolean; error?: string }>;
  changePassword: (newPasswordPlain: string) => Promise<void>;
  updateUserProfile: (uid: string, name: string, email: string, phone?: string) => Promise<void>;
  fbAuthUser: FirebaseUser | null;
  reloadAuthUser: () => Promise<boolean>;
  resendVerificationEmail: () => Promise<void>;
  
  // Administration User Management
  adminCreateUser: (user: Partial<User>, passwordPlain: string) => Promise<void>;
  adminUpdateUser: (uid: string, fields: Partial<User>) => Promise<void>;
  adminDeleteUser: (uid: string) => Promise<void>;
  adminResetPassword: (uid: string, newPasswordPlain: string) => Promise<void>;

  // Product CRUD
  createProduct: (product: Omit<Product, "id">) => Promise<void>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;

  // Category CRUD
  createCategory: (category: Omit<Category, "id">) => Promise<void>;
  updateCategory: (id: string, category: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;

  // Orders & Quotations
  createOrder: (items: { productId: string; productName: string; quantity: number; priceMwk: number }[]) => Promise<void>;
  updateOrderStatus: (id: string, status: OrderStatus, trackingNotes?: string) => Promise<void>;
  createQuotationRequest: (productId: string, quantity: number, notes: string) => Promise<void>;
  respondToQuotation: (id: string, price: number) => Promise<void>;

  // Inventory
  addInventoryTransaction: (productId: string, type: InventoryTransactionType, quantity: number, reason: string) => Promise<void>;

  // CMS Updates
  updateSettings: (fields: Partial<Setting>) => Promise<void>;
  createCMSItem: (collectionName: string, item: any) => Promise<void>;
  updateCMSItem: (collectionName: string, id: string, fields: any) => Promise<void>;
  deleteCMSItem: (collectionName: string, id: string) => Promise<void>;

  // Generic Submit Form (Contact, Newsletter)
  submitContactForm: (name: string, email: string, phone: string, subject: string, message: string) => Promise<void>;
  subscribeNewsletter: (email: string) => Promise<boolean>;
  
  // Helpers
  writeAuditLog: (action: string) => Promise<void>;
  markNotificationAsRead: (id: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [fbAuthUser, setFbAuthUser] = useState<FirebaseUser | null>(null);

  // Sync Firebase Auth State
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setFbAuthUser(user);
    });
    return unsubscribe;
  }, []);

  const [settings, setSettings] = useState<Setting | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [inventoryTransactions, setInventoryTransactions] = useState<InventoryTransaction[]>([]);
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [contactMessages, setContactMessages] = useState<ContactMessage[]>([]);
  const [newsletterSubscribers, setNewsletterSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Initialize and run Seeder, then attach real-time Firestore listeners
  useEffect(() => {
    const initApp = async () => {
      setLoading(true);
      await runSeeder(); // Seed default products, categories, FAQs, admin, global settings if empty

      // Global Settings Listener
      const settingsUnsub = onSnapshot(doc(db, "settings", "global"), (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data() as Setting;
          if (data.primaryColor === "#15803d" || data.secondaryColor === "#ca8a04") {
            const updated = {
              ...data,
              primaryColor: "#022c22",
              secondaryColor: "#fbbf24"
            };
            setSettings(updated);
            updateDoc(doc(db, "settings", "global"), {
              primaryColor: "#022c22",
              secondaryColor: "#fbbf24"
            }).catch(e => console.error("Could not update colors to High Density Theme in Firestore", e));
          } else {
            setSettings(data);
          }
        }
      }, (err) => handleFirestoreError(err, OperationType.GET, "settings/global"));

      // Public Catalog Listeners
      const prodUnsub = onSnapshot(collection(db, "products"), (snap) => {
        const prodList: Product[] = [];
        snap.forEach((d) => prodList.push({ id: d.id, ...d.data() } as Product));
        setProducts(prodList);
      }, (err) => handleFirestoreError(err, OperationType.GET, "products"));

      const catUnsub = onSnapshot(collection(db, "categories"), (snap) => {
        const catList: Category[] = [];
        snap.forEach((d) => catList.push({ id: d.id, ...d.data() } as Category));
        setCategories(catList);
      }, (err) => handleFirestoreError(err, OperationType.GET, "categories"));

      const srvUnsub = onSnapshot(collection(db, "services"), (snap) => {
        const srvList: Service[] = [];
        snap.forEach((d) => srvList.push({ id: d.id, ...d.data() } as Service));
        setServices(srvList);
      }, (err) => handleFirestoreError(err, OperationType.GET, "services"));

      const testUnsub = onSnapshot(collection(db, "testimonials"), (snap) => {
        const testList: Testimonial[] = [];
        snap.forEach((d) => testList.push({ id: d.id, ...d.data() } as Testimonial));
        setTestimonials(testList);
      }, (err) => handleFirestoreError(err, OperationType.GET, "testimonials"));

      const faqUnsub = onSnapshot(collection(db, "faqs"), (snap) => {
        const faqList: FaqItem[] = [];
        snap.forEach((d) => faqList.push({ id: d.id, ...d.data() } as FaqItem));
        setFaqs(faqList);
      }, (err) => handleFirestoreError(err, OperationType.GET, "faqs"));

      const galUnsub = onSnapshot(collection(db, "gallery"), (snap) => {
        const galList: GalleryItem[] = [];
        snap.forEach((d) => galList.push({ id: d.id, ...d.data() } as GalleryItem));
        setGalleryItems(galList);
      }, (err) => handleFirestoreError(err, OperationType.GET, "gallery"));

      const newsUnsub = onSnapshot(collection(db, "news"), (snap) => {
        const newsList: NewsItem[] = [];
        snap.forEach((d) => newsList.push({ id: d.id, ...d.data() } as NewsItem));
        setNewsItems(newsList.sort((a,b) => b.createdAt.localeCompare(a.createdAt)));
      }, (err) => handleFirestoreError(err, OperationType.GET, "news"));

      // Check for persisted local user session
      const savedUser = localStorage.getItem("ocean_harvest_user");
      if (savedUser) {
        try {
          const parsed = JSON.parse(savedUser) as User;
          // Verify with Firestore
          const uDoc = await getDoc(doc(db, "users", parsed.uid));
          if (uDoc.exists()) {
            const dbUser = uDoc.data() as User;
            if (dbUser.status === UserStatus.ACTIVE) {
              setCurrentUser(dbUser);
            } else {
              localStorage.removeItem("ocean_harvest_user");
            }
          }
        } catch {
          localStorage.removeItem("ocean_harvest_user");
        }
      }

      setLoading(false);

      return () => {
        settingsUnsub();
        prodUnsub();
        catUnsub();
        srvUnsub();
        testUnsub();
        faqUnsub();
        galUnsub();
        newsUnsub();
      };
    };

    initApp();
  }, []);

  // Listeners that depend on being Logged In (Real-time sync of private operational data)
  useEffect(() => {
    if (!currentUser) {
      // Clear private states
      setOrders([]);
      setQuotations([]);
      setInventoryTransactions([]);
      setContactMessages([]);
      setNewsletterSubscribers([]);
      setNotifications([]);
      setAuditLogs([]);
      setUsers([]);
      return;
    }

    const isStaffOrAdmin =
      currentUser.role === UserRole.SUPER_ADMIN ||
      currentUser.role === UserRole.ADMIN ||
      currentUser.role === UserRole.STAFF;

    const isAdminOnly =
      currentUser.role === UserRole.SUPER_ADMIN ||
      currentUser.role === UserRole.ADMIN;

    // ORDERS
    const ordersQuery = isStaffOrAdmin
      ? query(collection(db, "orders"), orderBy("createdAt", "desc"))
      : query(collection(db, "orders"), where("customerId", "==", currentUser.uid));
    const ordersUnsub = onSnapshot(ordersQuery, (snap) => {
      const orderList: Order[] = [];
      snap.forEach((d) => orderList.push({ id: d.id, ...d.data() } as Order));
      setOrders(orderList);
    });

    // QUOTATIONS
    const quotesQuery = isStaffOrAdmin
      ? query(collection(db, "quotations"), orderBy("createdAt", "desc"))
      : query(collection(db, "quotations"), where("customerId", "==", currentUser.uid));
    const quotesUnsub = onSnapshot(quotesQuery, (snap) => {
      const quoteList: Quotation[] = [];
      snap.forEach((d) => quoteList.push({ id: d.id, ...d.data() } as Quotation));
      setQuotations(quoteList);
    });

    // STAFF EXCLUSIVE LISTENERS
    let invUnsub = () => {};
    let contactUnsub = () => {};
    let subUnsub = () => {};
    let notifUnsub = () => {};
    let usersUnsub = () => {};

    if (isStaffOrAdmin) {
      const invQuery = query(collection(db, "inventory"), orderBy("createdAt", "desc"));
      invUnsub = onSnapshot(invQuery, (snap) => {
        const txnList: InventoryTransaction[] = [];
        snap.forEach((d) => txnList.push({ id: d.id, ...d.data() } as InventoryTransaction));
        setInventoryTransactions(txnList);
      });

      const contactQuery = query(collection(db, "contact_messages"), orderBy("createdAt", "desc"));
      contactUnsub = onSnapshot(contactQuery, (snap) => {
        const msgList: ContactMessage[] = [];
        snap.forEach((d) => msgList.push({ id: d.id, ...d.data() } as ContactMessage));
        setContactMessages(msgList);
      });

      const subQuery = query(collection(db, "newsletter_subscribers"), orderBy("createdAt", "desc"));
      subUnsub = onSnapshot(subQuery, (snap) => {
        const subList: NewsletterSubscriber[] = [];
        snap.forEach((d) => subList.push(d.data() as NewsletterSubscriber));
        setNewsletterSubscribers(subList);
      });

      const notifQuery = query(collection(db, "notifications"), orderBy("createdAt", "desc"));
      notifUnsub = onSnapshot(notifQuery, (snap) => {
        const list: NotificationItem[] = [];
        snap.forEach((d) => list.push({ id: d.id, ...d.data() } as NotificationItem));
        setNotifications(list);
      });

      const usersQuery = query(collection(db, "users"), orderBy("createdAt", "desc"));
      usersUnsub = onSnapshot(usersQuery, (snap) => {
        const uList: User[] = [];
        snap.forEach((d) => uList.push({ uid: d.id, ...d.data() } as User));
        setUsers(uList);
      });
    }

    // ADMIN EXCLUSIVE AUDIT LOG LISTENER
    let auditUnsub = () => {};
    if (isAdminOnly) {
      const auditQuery = query(collection(db, "audit_logs"), orderBy("createdAt", "desc"), limit(500));
      auditUnsub = onSnapshot(auditQuery, (snap) => {
        const logs: AuditLogItem[] = [];
        snap.forEach((d) => logs.push({ id: d.id, ...d.data() } as AuditLogItem));
        setAuditLogs(logs);
      });
    }

    return () => {
      ordersUnsub();
      quotesUnsub();
      invUnsub();
      contactUnsub();
      subUnsub();
      notifUnsub();
      usersUnsub();
      auditUnsub();
    };
  }, [currentUser]);

  // WRITING AUDIT LOGS
  const writeAuditLog = async (action: string) => {
    try {
      const logId = "log_" + generateId();
      const log: AuditLogItem = {
        id: logId,
        userName: currentUser ? currentUser.name : "Unauthenticated",
        userEmail: currentUser ? currentUser.email : "anonymous@oceanharvest.com",
        action,
        ipAddress: "127.0.0.1", // client-side simulation
        createdAt: new Date().toISOString()
      };
      await setDoc(doc(db, "audit_logs", logId), log);
    } catch (e) {
      console.error("Failed to write audit log", e);
    }
  };

  // AUTHENTICATION: LOGIN
  const login = async (email: string, passwordPlain: string) => {
    try {
      const emailLower = email.toLowerCase();

      // Try signing in with Firebase Auth first (for email-verified flow)
      try {
        await signInWithEmailAndPassword(auth, emailLower, passwordPlain);
      } catch (authErr: any) {
        console.warn("Firebase Auth sign-in failed, falling back to Firestore validation:", authErr.code || authErr.message);
      }

      const qUsers = query(collection(db, "users"), where("email", "==", emailLower));
      const snap = await getDocs(qUsers);
      
      if (snap.empty) {
        return { success: false, error: "Invalid email or password." };
      }

      let matchedUser: User | null = null;
      const passHash = await hashPassword(passwordPlain);

      snap.forEach((docSnap) => {
        const data = docSnap.data() as User;
        if (data.passwordHash === passHash) {
          matchedUser = data;
        }
      });

      if (!matchedUser) {
        return { success: false, error: "Invalid email or password." };
      }

      const user: User = matchedUser;
      if (user.status === UserStatus.DISABLED) {
        return { success: false, error: "Your account is disabled. Please contact support." };
      }

      setCurrentUser(user);
      localStorage.setItem("ocean_harvest_user", JSON.stringify(user));
      
      // Write audit log
      await setDoc(doc(db, "audit_logs", "log_" + generateId()), {
        id: "log_" + generateId(),
        userName: user.name,
        userEmail: user.email,
        action: `Logged in (${user.role})`,
        ipAddress: "127.0.0.1",
        createdAt: new Date().toISOString()
      });

      return { success: true, user };
    } catch (err) {
      return { success: false, error: "Authentication failed. Server error." };
    }
  };

  // AUTHENTICATION: LOGIN WITH GOOGLE
  const loginWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const fbUser = result.user;
      
      if (!fbUser || !fbUser.email) {
        return { success: false, error: "Google authentication succeeded, but no email was provided." };
      }

      const emailLower = fbUser.email.toLowerCase();
      
      // Check if they exist in our users collection
      const qUsers = query(collection(db, "users"), where("email", "==", emailLower));
      const snap = await getDocs(qUsers);
      
      let user: User;
      
      if (snap.empty) {
        // Not registered yet! Register them as a customer.
        const uid = fbUser.uid;
        user = {
          uid,
          email: emailLower,
          passwordHash: "",
          name: fbUser.displayName || "Google User",
          role: UserRole.CUSTOMER,
          status: UserStatus.ACTIVE,
          mustChangePassword: false,
          createdAt: new Date().toISOString()
        };
        
        await setDoc(doc(db, "users", uid), user);
        
        // Create a welcoming notification
        const notifId = "nt_" + generateId();
        await setDoc(doc(db, "notifications", notifId), {
          id: notifId,
          title: "New Google Registration",
          message: `${user.name} (${emailLower}) has registered via Google.`,
          type: "user",
          isRead: false,
          createdAt: new Date().toISOString()
        });
        
        // Write audit log
        await setDoc(doc(db, "audit_logs", "log_" + generateId()), {
          id: "log_" + generateId(),
          userName: user.name,
          userEmail: user.email,
          action: `Registered and Logged in via Google`,
          ipAddress: "127.0.0.1",
          createdAt: new Date().toISOString()
        });
      } else {
        // They already exist, retrieve their data
        let existingUser: User | null = null;
        snap.forEach((docSnap) => {
          existingUser = docSnap.data() as User;
        });
        
        if (!existingUser) {
          return { success: false, error: "Failed to retrieve existing profile." };
        }
        
        user = existingUser;
        if (user.status === UserStatus.DISABLED) {
          return { success: false, error: "Your account is disabled. Please contact support." };
        }
        
        // Write audit log
        await setDoc(doc(db, "audit_logs", "log_" + generateId()), {
          id: "log_" + generateId(),
          userName: user.name,
          userEmail: user.email,
          action: `Logged in via Google`,
          ipAddress: "127.0.0.1",
          createdAt: new Date().toISOString()
        });
      }
      
      setCurrentUser(user);
      localStorage.setItem("ocean_harvest_user", JSON.stringify(user));
      return { success: true, user };
    } catch (err: any) {
      console.error("Google Auth Error:", err);
      let errMsg = "Google Authentication failed.";
      if (err && err.code === "auth/popup-blocked") {
        errMsg = "Sign-in popup was blocked by your browser. Please allow popups for this site.";
      } else if (err && err.message) {
        errMsg = err.message;
      }
      return { success: false, error: errMsg };
    }
  };

  // AUTHENTICATION: LOGIN WITH FACEBOOK
  const loginWithFacebook = async () => {
    try {
      const provider = new FacebookAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const fbUser = result.user;
      
      if (!fbUser || !fbUser.email) {
        return { success: false, error: "Facebook authentication succeeded, but no email was provided." };
      }

      const emailLower = fbUser.email.toLowerCase();
      
      // Check if they exist in our users collection
      const qUsers = query(collection(db, "users"), where("email", "==", emailLower));
      const snap = await getDocs(qUsers);
      
      let user: User;
      
      if (snap.empty) {
        // Not registered yet! Register them as a customer.
        const uid = fbUser.uid;
        user = {
          uid,
          email: emailLower,
          passwordHash: "",
          name: fbUser.displayName || "Facebook User",
          role: UserRole.CUSTOMER,
          status: UserStatus.ACTIVE,
          mustChangePassword: false,
          createdAt: new Date().toISOString()
        };
        
        await setDoc(doc(db, "users", uid), user);
        
        // Create a welcoming notification
        const notifId = "nt_" + generateId();
        await setDoc(doc(db, "notifications", notifId), {
          id: notifId,
          title: "New Facebook Registration",
          message: `${user.name} (${emailLower}) has registered via Facebook.`,
          type: "user",
          isRead: false,
          createdAt: new Date().toISOString()
        });
        
        // Write audit log
        await setDoc(doc(db, "audit_logs", "log_" + generateId()), {
          id: "log_" + generateId(),
          userName: user.name,
          userEmail: user.email,
          action: `Registered and Logged in via Facebook`,
          ipAddress: "127.0.0.1",
          createdAt: new Date().toISOString()
        });
      } else {
        // They already exist, retrieve their data
        let existingUser: User | null = null;
        snap.forEach((docSnap) => {
          existingUser = docSnap.data() as User;
        });
        
        if (!existingUser) {
          return { success: false, error: "Failed to retrieve existing profile." };
        }
        
        user = existingUser;
        if (user.status === UserStatus.DISABLED) {
          return { success: false, error: "Your account is disabled. Please contact support." };
        }
        
        // Write audit log
        await setDoc(doc(db, "audit_logs", "log_" + generateId()), {
          id: "log_" + generateId(),
          userName: user.name,
          userEmail: user.email,
          action: `Logged in via Facebook`,
          ipAddress: "127.0.0.1",
          createdAt: new Date().toISOString()
        });
      }
      
      setCurrentUser(user);
      localStorage.setItem("ocean_harvest_user", JSON.stringify(user));
      return { success: true, user };
    } catch (err: any) {
      console.error("Facebook Auth Error:", err);
      let errMsg = "Facebook Authentication failed.";
      if (err && err.code === "auth/popup-blocked") {
        errMsg = "Sign-in popup was blocked by your browser. Please allow popups for this site.";
      } else if (err && err.message) {
        errMsg = err.message;
      }
      return { success: false, error: errMsg };
    }
  };

  // AUTHENTICATION: LOGIN WITH APPLE
  const loginWithApple = async () => {
    try {
      const provider = new OAuthProvider("apple.com");
      const result = await signInWithPopup(auth, provider);
      const fbUser = result.user;
      
      if (!fbUser || !fbUser.email) {
        return { success: false, error: "Apple authentication succeeded, but no email was provided." };
      }

      const emailLower = fbUser.email.toLowerCase();
      
      // Check if they exist in our users collection
      const qUsers = query(collection(db, "users"), where("email", "==", emailLower));
      const snap = await getDocs(qUsers);
      
      let user: User;
      
      if (snap.empty) {
        // Not registered yet! Register them as a customer.
        const uid = fbUser.uid;
        user = {
          uid,
          email: emailLower,
          passwordHash: "",
          name: fbUser.displayName || "Apple User",
          role: UserRole.CUSTOMER,
          status: UserStatus.ACTIVE,
          mustChangePassword: false,
          createdAt: new Date().toISOString()
        };
        
        await setDoc(doc(db, "users", uid), user);
        
        // Create a welcoming notification
        const notifId = "nt_" + generateId();
        await setDoc(doc(db, "notifications", notifId), {
          id: notifId,
          title: "New Apple Registration",
          message: `${user.name} (${emailLower}) has registered via Apple.`,
          type: "user",
          isRead: false,
          createdAt: new Date().toISOString()
        });
        
        // Write audit log
        await setDoc(doc(db, "audit_logs", "log_" + generateId()), {
          id: "log_" + generateId(),
          userName: user.name,
          userEmail: user.email,
          action: `Registered and Logged in via Apple`,
          ipAddress: "127.0.0.1",
          createdAt: new Date().toISOString()
        });
      } else {
        // They already exist, retrieve their data
        let existingUser: User | null = null;
        snap.forEach((docSnap) => {
          existingUser = docSnap.data() as User;
        });
        
        if (!existingUser) {
          return { success: false, error: "Failed to retrieve existing profile." };
        }
        
        user = existingUser;
        if (user.status === UserStatus.DISABLED) {
          return { success: false, error: "Your account is disabled. Please contact support." };
        }
        
        // Write audit log
        await setDoc(doc(db, "audit_logs", "log_" + generateId()), {
          id: "log_" + generateId(),
          userName: user.name,
          userEmail: user.email,
          action: `Logged in via Apple`,
          ipAddress: "127.0.0.1",
          createdAt: new Date().toISOString()
        });
      }
      
      setCurrentUser(user);
      localStorage.setItem("ocean_harvest_user", JSON.stringify(user));
      return { success: true, user };
    } catch (err: any) {
      console.error("Apple Auth Error:", err);
      let errMsg = "Apple Authentication failed.";
      if (err && err.code === "auth/popup-blocked") {
        errMsg = "Sign-in popup was blocked by your browser. Please allow popups for this site.";
      } else if (err && err.message) {
        errMsg = err.message;
      }
      return { success: false, error: errMsg };
    }
  };

  // AUTHENTICATION: LOGOUT
  const logout = async () => {
    if (currentUser) {
      await writeAuditLog(`Logged out`);
    }
    setCurrentUser(null);
    localStorage.removeItem("ocean_harvest_user");
  };

  // REGISTER CUSTOMER WITH FIREBASE AUTH & EMAIL VERIFICATION
  const register = async (name: string, email: string, passwordPlain: string, phone: string) => {
    try {
      const emailLower = email.toLowerCase();
      // Check duplicate in Firestore by email
      const qDup = query(collection(db, "users"), where("email", "==", emailLower));
      const dupSnap = await getDocs(qDup);
      if (!dupSnap.empty) {
        return { success: false, error: "Email address already registered." };
      }

      // Check duplicate in Firestore by phone
      if (phone) {
        const qDupPhone = query(collection(db, "users"), where("phone", "==", phone));
        const dupPhoneSnap = await getDocs(qDupPhone);
        if (!dupPhoneSnap.empty) {
          return { success: false, error: "Phone number already registered." };
        }
      }

      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, emailLower, passwordPlain);
      const fbUser = userCredential.user;

      // Send Firebase Email Verification
      await sendEmailVerification(fbUser);

      const uid = fbUser.uid;
      const passHash = await hashPassword(passwordPlain);
      const newUser: User = {
        uid,
        email: emailLower,
        passwordHash: passHash,
        name,
        phone,
        role: UserRole.CUSTOMER,
        status: UserStatus.ACTIVE,
        mustChangePassword: false,
        createdAt: new Date().toISOString()
      };

      await setDoc(doc(db, "users", uid), newUser);

      // Create a welcoming notification
      const notifId = "nt_" + generateId();
      await setDoc(doc(db, "notifications", notifId), {
        id: notifId,
        title: "New Customer Registration",
        message: `${name} (${emailLower}, ${phone}) has registered as a customer. Verification email sent.`,
        type: "user",
        isRead: false,
        createdAt: new Date().toISOString()
      });

      // Update state
      setCurrentUser(newUser);
      localStorage.setItem("ocean_harvest_user", JSON.stringify(newUser));

      return { success: true };
    } catch (err: any) {
      console.error("Registration error:", err);
      let errorMsg = "Registration failed. Try again later.";
      if (err.code === "auth/email-already-in-use") {
        errorMsg = "Email address already in use.";
      } else if (err.code === "auth/invalid-email") {
        errorMsg = "Invalid email address format.";
      } else if (err.code === "auth/weak-password") {
        errorMsg = "Password is too weak. Please choose a stronger password.";
      } else if (err.message) {
        errorMsg = err.message;
      }
      return { success: false, error: errorMsg };
    }
  };

  // Reload current Firebase user to fetch updated email verification status
  const reloadAuthUser = async () => {
    if (auth.currentUser) {
      await auth.currentUser.reload();
      setFbAuthUser(auth.currentUser);
      return auth.currentUser.emailVerified;
    }
    return false;
  };

  // Resend verification email
  const resendVerificationEmail = async () => {
    if (auth.currentUser) {
      await sendEmailVerification(auth.currentUser);
    }
  };

  // CHANGE PASSWORD (WITH FORCE CHANGE SUPPORT)
  const changePassword = async (newPasswordPlain: string) => {
    if (!currentUser) return;
    try {
      const passHash = await hashPassword(newPasswordPlain);
      const userRef = doc(db, "users", currentUser.uid);
      await updateDoc(userRef, {
        passwordHash: passHash,
        mustChangePassword: false
      });

      const updatedUser = { ...currentUser, mustChangePassword: false };
      setCurrentUser(updatedUser);
      localStorage.setItem("ocean_harvest_user", JSON.stringify(updatedUser));
      await writeAuditLog("Changed account password");
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `users/${currentUser.uid}`);
    }
  };

  // UPDATE USER PROFILE
  const updateUserProfile = async (uid: string, name: string, email: string, phone?: string) => {
    try {
      const userRef = doc(db, "users", uid);
      const emailLower = email.toLowerCase();
      const updates: any = { name, email: emailLower };
      if (phone !== undefined) {
        updates.phone = phone;
      }
      await updateDoc(userRef, updates);
      if (currentUser && currentUser.uid === uid) {
        const updated = { ...currentUser, name, email: emailLower };
        if (phone !== undefined) {
          updated.phone = phone;
        }
        setCurrentUser(updated);
        localStorage.setItem("ocean_harvest_user", JSON.stringify(updated));
      }
      await writeAuditLog(`Updated profile fields`);
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `users/${uid}`);
    }
  };

  // USER MANAGEMENT BY ADMINS
  const adminCreateUser = async (userFields: Partial<User>, passwordPlain: string) => {
    try {
      const uid = "u_" + generateId();
      const passHash = await hashPassword(passwordPlain);
      const newUser: User = {
        uid,
        email: userFields.email!.toLowerCase(),
        passwordHash: passHash,
        name: userFields.name!,
        role: userFields.role!,
        status: userFields.status || UserStatus.ACTIVE,
        mustChangePassword: userFields.mustChangePassword ?? true,
        createdAt: new Date().toISOString()
      };
      await setDoc(doc(db, "users", uid), newUser);
      await writeAuditLog(`Created system user ${userFields.email}`);
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, "users");
    }
  };

  const adminUpdateUser = async (uid: string, fields: Partial<User>) => {
    try {
      const userRef = doc(db, "users", uid);
      if (fields.email) fields.email = fields.email.toLowerCase();
      await updateDoc(userRef, fields);
      await writeAuditLog(`Updated system user properties for ${uid}`);
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `users/${uid}`);
    }
  };

  const adminDeleteUser = async (uid: string) => {
    try {
      await deleteDoc(doc(db, "users", uid));
      await writeAuditLog(`Deleted system user ${uid}`);
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `users/${uid}`);
    }
  };

  const adminResetPassword = async (uid: string, newPasswordPlain: string) => {
    try {
      const passHash = await hashPassword(newPasswordPlain);
      await updateDoc(doc(db, "users", uid), {
        passwordHash: passHash,
        mustChangePassword: true
      });
      await writeAuditLog(`Reset password for user ${uid}`);
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `users/${uid}`);
    }
  };

  // PRODUCT CRUD
  const createProduct = async (product: Omit<Product, "id">) => {
    try {
      const id = "prod_" + generateId();
      const newProd: Product = { id, ...product };
      await setDoc(doc(db, "products", id), newProd);
      await writeAuditLog(`Added product "${product.name}" to catalog`);
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, "products");
    }
  };

  const updateProduct = async (id: string, fields: Partial<Product>) => {
    try {
      await updateDoc(doc(db, "products", id), fields);
      await writeAuditLog(`Updated product details for ID: ${id}`);
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `products/${id}`);
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      await deleteDoc(doc(db, "products", id));
      await writeAuditLog(`Deleted product ID: ${id} from catalog`);
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `products/${id}`);
    }
  };

  // CATEGORY CRUD
  const createCategory = async (category: Omit<Category, "id">) => {
    try {
      const id = "cat_" + generateId();
      await setDoc(doc(db, "categories", id), { id, ...category });
      await writeAuditLog(`Created product category "${category.name}"`);
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, "categories");
    }
  };

  const updateCategory = async (id: string, fields: Partial<Category>) => {
    try {
      await updateDoc(doc(db, "categories", id), fields);
      await writeAuditLog(`Updated category details for ID: ${id}`);
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `categories/${id}`);
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      await deleteDoc(doc(db, "categories", id));
      await writeAuditLog(`Deleted category ID: ${id}`);
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `categories/${id}`);
    }
  };

  // PLACE ORDER
  const createOrder = async (items: { productId: string; productName: string; quantity: number; priceMwk: number }[]) => {
    if (!currentUser) return;
    try {
      const id = "order_" + generateId().substring(0, 8).toUpperCase();
      let totalAmount = 0;
      items.forEach(item => totalAmount += item.priceMwk * item.quantity);

      const newOrder: Order = {
        id,
        customerId: currentUser.uid,
        customerName: currentUser.name,
        customerEmail: currentUser.email,
        status: OrderStatus.PENDING,
        items,
        totalAmount,
        createdAt: new Date().toISOString(),
        trackingNotes: "Order received. Pending confirmation."
      };

      await setDoc(doc(db, "orders", id), newOrder);

      // Create low stock alerts and inventory transaction records
      for (const item of items) {
        // Log inventory Transaction as stock-out
        const txnId = "txn_" + generateId();
        const txn: InventoryTransaction = {
          id: txnId,
          productId: item.productId,
          productName: item.productName,
          type: InventoryTransactionType.STOCK_OUT,
          quantity: item.quantity,
          reason: `Customer Purchase (Order #${id})`,
          operatorName: currentUser.name,
          createdAt: new Date().toISOString()
        };
        await setDoc(doc(db, "inventory", txnId), txn);

        // Deduct from Product stock
        const pDoc = await getDoc(doc(db, "products", item.productId));
        if (pDoc.exists()) {
          const currentStock = pDoc.data().stockLevel || 0;
          const nextStock = Math.max(0, currentStock - item.quantity);
          await updateDoc(doc(db, "products", item.productId), { stockLevel: nextStock });

          // Low stock notification if stock falls under 10
          if (nextStock < 10) {
            const alertId = "nt_stock_" + generateId();
            await setDoc(doc(db, "notifications", alertId), {
              id: alertId,
              title: "Low Stock Alert",
              message: `Product "${item.productName}" is running low on stock. Current level: ${nextStock} units.`,
              type: "stock",
              isRead: false,
              createdAt: new Date().toISOString()
            });
          }
        }
      }

      // Order notification
      const notifId = "nt_order_" + generateId();
      await setDoc(doc(db, "notifications", notifId), {
        id: notifId,
        title: "New Purchase Order",
        message: `New Order #${id} placed by ${currentUser.name} (MWK ${totalAmount.toLocaleString()})`,
        type: "order",
        isRead: false,
        createdAt: new Date().toISOString()
      });

      await writeAuditLog(`Placed order #${id}`);
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, "orders");
    }
  };

  // UPDATE ORDER STATUS
  const updateOrderStatus = async (id: string, status: OrderStatus, trackingNotes?: string) => {
    try {
      const orderRef = doc(db, "orders", id);
      const updates: any = { status };
      if (trackingNotes) {
        updates.trackingNotes = trackingNotes;
      }
      await updateDoc(orderRef, updates);
      await writeAuditLog(`Updated status of order #${id} to "${status}"`);
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `orders/${id}`);
    }
  };

  // REQUEST QUOTATION
  const createQuotationRequest = async (productId: string, quantity: number, notes: string) => {
    if (!currentUser) return;
    try {
      const pDoc = await getDoc(doc(db, "products", productId));
      const pName = pDoc.exists() ? pDoc.data().name : "Unknown Product";

      const id = "quote_" + generateId().substring(0, 8).toUpperCase();
      const newQuote: Quotation = {
        id,
        customerId: currentUser.uid,
        customerName: currentUser.name,
        customerEmail: currentUser.email,
        productId,
        productName: pName,
        quantity,
        notes,
        status: QuotationStatus.PENDING,
        createdAt: new Date().toISOString()
      };

      await setDoc(doc(db, "quotations", id), newQuote);

      // Notification
      const notifId = "nt_quote_" + generateId();
      await setDoc(doc(db, "notifications", notifId), {
        id: notifId,
        title: "New Quotation Request",
        message: `${currentUser.name} requested a quote for ${quantity} x ${pName}.`,
        type: "order",
        isRead: false,
        createdAt: new Date().toISOString()
      });

      await writeAuditLog(`Requested quote for ${quantity} x "${pName}"`);
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, "quotations");
    }
  };

  // RESPOND TO QUOTATION
  const respondToQuotation = async (id: string, price: number) => {
    try {
      await updateDoc(doc(db, "quotations", id), {
        status: QuotationStatus.RESPONDED,
        responsePriceMwk: price
      });
      await writeAuditLog(`Responded to quotation request #${id} with price: MWK ${price}`);
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `quotations/${id}`);
    }
  };

  // ADD INVENTORY TRANSACTION
  const addInventoryTransaction = async (productId: string, type: InventoryTransactionType, quantity: number, reason: string) => {
    try {
      const id = "txn_" + generateId();
      const pDoc = await getDoc(doc(db, "products", productId));
      if (!pDoc.exists()) return;

      const pData = pDoc.data() as Product;
      const txn: InventoryTransaction = {
        id,
        productId,
        productName: pData.name,
        type,
        quantity,
        reason,
        operatorName: currentUser ? currentUser.name : "System Operator",
        createdAt: new Date().toISOString()
      };
      await setDoc(doc(db, "inventory", id), txn);

      // Adjust stock Level
      const currentStock = pData.stockLevel || 0;
      const nextStock = type === InventoryTransactionType.STOCK_IN
        ? currentStock + quantity
        : Math.max(0, currentStock - quantity);

      await updateDoc(doc(db, "products", productId), { stockLevel: nextStock });

      // If low stock, log alert
      if (nextStock < 10) {
        const alertId = "nt_stock_" + generateId();
        await setDoc(doc(db, "notifications", alertId), {
          id: alertId,
          title: "Low Stock Alert",
          message: `Product "${pData.name}" has critical stock level: ${nextStock} units.`,
          type: "stock",
          isRead: false,
          createdAt: new Date().toISOString()
        });
      }

      await writeAuditLog(`Inventory transaction logged: ${type} ${quantity} units of "${pData.name}"`);
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, "inventory");
    }
  };

  // CMS: UPDATE GLOBAL SETTINGS
  const updateSettings = async (fields: Partial<Setting>) => {
    try {
      await updateDoc(doc(db, "settings", "global"), fields);
      if (settings) {
        setSettings({ ...settings, ...fields });
      }
      await writeAuditLog(`Updated company and brand settings`);
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, "settings/global");
    }
  };

  // CMS MANAGEMENT (SERVICES, NEWS, TESTIMONIALS, GALLERY, FAQS)
  const createCMSItem = async (collectionName: string, item: any) => {
    try {
      const id = item.id || (collectionName + "_" + generateId());
      await setDoc(doc(db, collectionName, id), { id, ...item });
      await writeAuditLog(`Created CMS item in ${collectionName}`);
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, collectionName);
    }
  };

  const updateCMSItem = async (collectionName: string, id: string, fields: any) => {
    try {
      await updateDoc(doc(db, collectionName, id), fields);
      await writeAuditLog(`Updated CMS item in ${collectionName} with ID: ${id}`);
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `${collectionName}/${id}`);
    }
  };

  const deleteCMSItem = async (collectionName: string, id: string) => {
    try {
      await deleteDoc(doc(db, collectionName, id));
      await writeAuditLog(`Deleted CMS item from ${collectionName} with ID: ${id}`);
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `${collectionName}/${id}`);
    }
  };

  // SUBMIT CONTACT FORM
  const submitContactForm = async (name: string, email: string, phone: string, subject: string, message: string) => {
    try {
      const id = "msg_" + generateId();
      const newMessage: ContactMessage = {
        id,
        name,
        email: email.toLowerCase(),
        phone,
        subject,
        message,
        createdAt: new Date().toISOString()
      };
      await setDoc(doc(db, "contact_messages", id), newMessage);

      // Notification
      const notifId = "nt_contact_" + generateId();
      await setDoc(doc(db, "notifications", notifId), {
        id: notifId,
        title: "New Contact Inquiry",
        message: `Inquiry from ${name}: "${subject}"`,
        type: "contact",
        isRead: false,
        createdAt: new Date().toISOString()
      });

      await writeAuditLog(`Submitted contact form from ${email}`);
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, "contact_messages");
    }
  };

  // SUBSCRIBE NEWSLETTER
  const subscribeNewsletter = async (email: string): Promise<boolean> => {
    try {
      const emailLower = email.toLowerCase().trim();
      const id = "sub_" + btoa(emailLower).replace(/=/g, "");
      
      const subRef = doc(db, "newsletter_subscribers", id);
      const subSnap = await getDoc(subRef);
      if (subSnap.exists()) return false; // already subscribed

      await setDoc(subRef, {
        email: emailLower,
        createdAt: new Date().toISOString()
      });

      // Notification
      const notifId = "nt_sub_" + generateId();
      await setDoc(doc(db, "notifications", notifId), {
        id: notifId,
        title: "New Newsletter Subscriber",
        message: `${emailLower} has joined the newsletter list.`,
        type: "contact",
        isRead: false,
        createdAt: new Date().toISOString()
      });

      return true;
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, "newsletter_subscribers");
    }
  };

  // READ NOTIFICATION
  const markNotificationAsRead = async (id: string) => {
    try {
      await updateDoc(doc(db, "notifications", id), { isRead: true });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `notifications/${id}`);
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        settings,
        products,
        categories,
        orders,
        quotations,
        inventoryTransactions,
        galleryItems,
        testimonials,
        services,
        newsItems,
        faqs,
        contactMessages,
        newsletterSubscribers,
        notifications,
        auditLogs,
        users,
        loading,
        login,
        loginWithGoogle,
        loginWithFacebook,
        loginWithApple,
        logout,
        register,
        changePassword,
        updateUserProfile,
        fbAuthUser,
        reloadAuthUser,
        resendVerificationEmail,
        adminCreateUser,
        adminUpdateUser,
        adminDeleteUser,
        adminResetPassword,
        createProduct,
        updateProduct,
        deleteProduct,
        createCategory,
        updateCategory,
        deleteCategory,
        createOrder,
        updateOrderStatus,
        createQuotationRequest,
        respondToQuotation,
        addInventoryTransaction,
        updateSettings,
        createCMSItem,
        updateCMSItem,
        deleteCMSItem,
        submitContactForm,
        subscribeNewsletter,
        writeAuditLog,
        markNotificationAsRead
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};
